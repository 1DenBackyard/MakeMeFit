"""Streaming endpoints for real-time AI responses."""
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.models import Request
from app.dependencies import get_current_user
from app.llm import get_llm_provider
from app.config import settings

router = APIRouter(prefix="/stream", tags=["streaming"])


@router.get("/requests/{request_id}/demo")
async def stream_demo(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Stream demo answer generation."""
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
        return {"error": "Request not found"}, 404
    
    if not request.structured_context:
        return {"error": "Request not ready"}, 400
    
    # Load prompt
    from pathlib import Path
    if request.track.value == "supplements":
        prompt_template = (Path(__file__).parent.parent / "prompts" / "supplements_demo.txt").read_text()
    else:
        prompt_template = (Path(__file__).parent.parent / "prompts" / "workouts_demo.txt").read_text()
    
    prompt = prompt_template.format(**request.structured_context)
    
    # Generate stream
    llm = get_llm_provider()
    
    async def generate():
        full_text = ""
        async for chunk in llm.generate_stream(
            prompt,
            model=settings.llm_model,
            temperature=0.7,
            max_tokens=300,
        ):
            full_text += chunk
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        # Update request with full answer
        request.demo_answer = full_text
        await db.commit()
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/requests/{request_id}/full")
async def stream_full(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Stream full answer generation."""
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
        return {"error": "Request not found"}, 404
    
    if not request.structured_context:
        return {"error": "Request not ready"}, 400
    
    # Load prompt
    from pathlib import Path
    import json
    if request.track.value == "supplements":
        prompt_template = (Path(__file__).parent.parent / "prompts" / "supplements_full.txt").read_text()
    else:
        prompt_template = (Path(__file__).parent.parent / "prompts" / "workouts_full.txt").read_text()
    
    prompt = prompt_template.format(**request.structured_context)
    
    # Generate stream
    llm = get_llm_provider()
    
    async def generate():
        full_text = ""
        async for chunk in llm.generate_stream(
            prompt,
            model=settings.llm_model_full,
            temperature=0.7,
            max_tokens=2000,
        ):
            full_text += chunk
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        # Update request and generate PDF
        request.full_answer = full_text
        await db.commit()
        
        # Generate PDF in background (simplified)
        yield f"data: {json.dumps({'done': True, 'pdf_generating': True})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
