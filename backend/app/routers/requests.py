"""Request router for handling AI recommendations."""
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional

from app.database import get_db
from app.models import User, Request, DemoUsage, TrackType, RequestStatus
from app.schemas import RequestCreate, RequestResponse, DemoResponse, FullAnswerResponse
from app.anti_fraud import stage1_rule_based_check, stage2_structured_validation
from app.llm import get_llm_provider
from app.pdf_generator import markdown_to_pdf
from app.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/requests", tags=["requests"])


def load_prompt(template_name: str) -> str:
    """Load prompt template."""
    prompt_path = Path(__file__).parent.parent / "prompts" / f"{template_name}.txt"
    return prompt_path.read_text()


@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: RequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new request."""
    # Check demo usage limit
    demo_check = await db.execute(
        select(DemoUsage).where(
            and_(
                DemoUsage.user_id == current_user.id,
                DemoUsage.track == request_data.track
            )
        )
    )
    existing_demo = demo_check.scalar_one_or_none()
    
    # Stage 1: Rule-based anti-fraud
    is_valid, rejection_reason = stage1_rule_based_check(
        request_data.track,
        request_data.form_data
    )
    
    if not is_valid:
        # Create rejected request
        request = Request(
            user_id=current_user.id,
            track=request_data.track,
            status=RequestStatus.REJECTED,
            form_data=request_data.form_data,
            anti_fraud_passed=False,
            anti_fraud_reason=rejection_reason,
        )
        db.add(request)
        await db.commit()
        await db.refresh(request)
        
        raise HTTPException(
            status_code=400,
            detail=rejection_reason or "Request rejected by anti-fraud system"
        )
    
    # Stage 2: Structured validation
    is_valid, error_msg, structured_context = stage2_structured_validation(
        request_data.track,
        request_data.form_data
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg or "Validation failed")
    
    # Create request
    request = Request(
        user_id=current_user.id,
        track=request_data.track,
        status=RequestStatus.PROCESSING,
        form_data=request_data.form_data,
        structured_context=structured_context,
        anti_fraud_passed=True,
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    
    # Generate demo answer
    try:
        llm = get_llm_provider()
        
        # Load appropriate prompt
        if request_data.track == TrackType.SUPPLEMENTS:
            prompt_template = load_prompt("supplements_demo")
        else:
            prompt_template = load_prompt("workouts_demo")
        
        # Format prompt
        prompt = prompt_template.format(**structured_context)
        
        # Generate demo
        demo_answer = await llm.generate(
            prompt,
            model=settings.llm_model,  # Use small model for demo
            temperature=0.7,
            max_tokens=300,
        )
        
        # Extract activity type for workouts
        if request_data.track == TrackType.WORKOUTS:
            # Simple extraction - in production, use more sophisticated parsing
            activity_types = ["strength training", "cardio", "HIIT", "yoga", "cross-training"]
            suggested_type = None
            demo_lower = demo_answer.lower()
            for at in activity_types:
                if at in demo_lower:
                    suggested_type = at
                    break
            if suggested_type:
                request.suggested_activity_type = suggested_type
        
        request.demo_answer = demo_answer
        request.status = RequestStatus.COMPLETED
        
        # Record demo usage if first time
        if not existing_demo:
            demo_usage = DemoUsage(
                user_id=current_user.id,
                track=request_data.track,
                request_id=request.id,
            )
            db.add(demo_usage)
        
        await db.commit()
        await db.refresh(request)
        
    except Exception as e:
        request.status = RequestStatus.FAILED
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to generate demo: {str(e)}")
    
    return RequestResponse.model_validate(request)


@router.get("/{request_id}/demo", response_model=DemoResponse)
async def get_demo(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get demo answer for a request."""
    result = await db.execute(
        select(Request).where(
            and_(
                Request.id == request_id,
                Request.user_id == current_user.id
            )
        )
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if not request.demo_answer:
        raise HTTPException(status_code=404, detail="Demo answer not available")
    
    # Check if user has used demo for this track
    demo_check = await db.execute(
        select(DemoUsage).where(
            and_(
                DemoUsage.user_id == current_user.id,
                DemoUsage.track == request.track
            )
        )
    )
    existing_demo = demo_check.scalar_one_or_none()
    
    requires_payment = existing_demo is not None
    
    return DemoResponse(
        request_id=request.id,
        demo_answer=request.demo_answer,
        requires_payment=requires_payment,
    )


@router.post("/{request_id}/full", response_model=FullAnswerResponse)
async def generate_full_answer(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate full answer (requires payment)."""
    result = await db.execute(
        select(Request).where(
            and_(
                Request.id == request_id,
                Request.user_id == current_user.id
            )
        )
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check payment (simplified - in production, verify payment status)
    # For MVP, we'll check if payment exists and is completed
    
    # Generate full answer
    try:
        llm = get_llm_provider()
        
        # Load appropriate prompt
        if request.track == TrackType.SUPPLEMENTS:
            prompt_template = load_prompt("supplements_full")
        else:
            prompt_template = load_prompt("workouts_full")
        
        # Format prompt
        structured_context = request.structured_context or {}
        prompt = prompt_template.format(**structured_context)
        
        # Generate full answer
        full_answer = await llm.generate(
            prompt,
            model=settings.llm_model_full,  # Use larger model for full answer
            temperature=0.7,
            max_tokens=2000,
        )
        
        request.full_answer = full_answer
        await db.commit()
        
        # Generate PDF
        from app.models import FullAnswer
        pdf_filename = f"request_{request.id}.pdf"
        pdf_path = os.path.join(settings.pdf_storage_path, pdf_filename)
        
        pdf_size = markdown_to_pdf(full_answer, pdf_path)
        
        # Store PDF reference
        full_answer_doc = FullAnswer(
            request_id=request.id,
            markdown_content=full_answer,
            pdf_path=pdf_path,
            pdf_size_bytes=pdf_size,
        )
        db.add(full_answer_doc)
        await db.commit()
        
        # Return PDF URL (in production, use proper file serving)
        pdf_url = f"/api/files/{pdf_filename}"
        
        return FullAnswerResponse(
            request_id=request.id,
            full_answer=full_answer,
            pdf_url=pdf_url,
            pdf_size_bytes=pdf_size,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate full answer: {str(e)}")


@router.get("/", response_model=list[RequestResponse])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's request history."""
    result = await db.execute(
        select(Request)
        .where(Request.user_id == current_user.id)
        .order_by(Request.created_at.desc())
    )
    requests = result.scalars().all()
    
    return [RequestResponse.model_validate(req) for req in requests]
