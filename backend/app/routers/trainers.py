"""Trainers and leads router."""
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.database import get_db
from app.models import User, Trainer, Lead, Request, LeadStatus
from app.schemas import TrainerResponse, LeadCreate, LeadResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/trainers", tags=["trainers"])


@router.get("/match", response_model=TrainerResponse)
async def match_trainer(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Match a trainer for a request."""
    # Get request
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
    
    if not request.full_answer:
        raise HTTPException(status_code=400, detail="Full answer required for trainer matching")
    
    # Get active trainers
    trainers_result = await db.execute(
        select(Trainer).where(Trainer.is_active == True)
    )
    trainers = trainers_result.scalars().all()
    
    if not trainers:
        raise HTTPException(status_code=404, detail="No trainers available")
    
    # Simple matching: if workout request, match by activity type
    # For MVP, use rule-based matching
    matched_trainer = None
    
    if request.track.value == "workouts" and request.suggested_activity_type:
        # Try to match by activity type
        for trainer in trainers:
            activity_types = trainer.activity_types or []
            if request.suggested_activity_type.lower() in [at.lower() for at in activity_types]:
                matched_trainer = trainer
                break
    
    # Fallback: use LLM for matching (optional, can be disabled for MVP)
    if not matched_trainer and len(trainers) > 0:
        # Simple: pick first available trainer
        # In production, use LLM to match based on request context
        matched_trainer = trainers[0]
    
    if not matched_trainer:
        raise HTTPException(status_code=404, detail="No suitable trainer found")
    
    return TrainerResponse.model_validate(matched_trainer)


@router.post("/leads", response_model=LeadResponse, status_code=201)
async def create_lead(
    lead_data: LeadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a trainer referral lead."""
    # Verify request
    result = await db.execute(
        select(Request).where(
            and_(
                Request.id == lead_data.request_id,
                Request.user_id == current_user.id
            )
        )
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify trainer
    trainer_result = await db.execute(
        select(Trainer).where(Trainer.id == lead_data.trainer_id)
    )
    trainer = trainer_result.scalar_one_or_none()
    
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Generate attribution code
    attribution_code = secrets.token_urlsafe(16)
    
    # Create deep link
    deep_link = f"https://t.me/{trainer.telegram_username}?start=lead_{lead_data.request_id}_{attribution_code}"
    
    # Create lead
    lead = Lead(
        user_id=current_user.id,
        trainer_id=lead_data.trainer_id,
        request_id=lead_data.request_id,
        attribution_code=attribution_code,
        deep_link=deep_link,
        status=LeadStatus.PENDING,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    
    return LeadResponse.model_validate(lead)


@router.get("/leads", response_model=list[LeadResponse])
async def get_leads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's leads."""
    result = await db.execute(
        select(Lead)
        .where(Lead.user_id == current_user.id)
        .order_by(Lead.created_at.desc())
    )
    leads = result.scalars().all()
    
    return [LeadResponse.model_validate(lead) for lead in leads]
