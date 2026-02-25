"""Admin panel router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Lead, Trainer, User, Request, Payment
from app.schemas import LeadResponse, TrainerResponse
from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_admin(admin_secret: str):
    """Verify admin secret."""
    if not settings.admin_secret or admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    return True


@router.get("/leads")
async def get_all_leads(
    admin_secret: str,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    """Get all leads for admin dashboard."""
    result = await db.execute(
        select(Lead).order_by(Lead.created_at.desc())
    )
    leads = result.scalars().all()
    
    return [LeadResponse.model_validate(lead) for lead in leads]


@router.get("/stats")
async def get_stats(
    admin_secret: str,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    """Get platform statistics."""
    # Count users
    users_count = await db.scalar(select(func.count(User.id)))
    
    # Count requests
    requests_count = await db.scalar(select(func.count(Request.id)))
    
    # Count payments
    payments_count = await db.scalar(select(func.count(Payment.id)))
    
    # Count leads
    leads_count = await db.scalar(select(func.count(Lead.id)))
    
    # Count trainers
    trainers_count = await db.scalar(select(func.count(Trainer.id)))
    
    return {
        "users": users_count,
        "requests": requests_count,
        "payments": payments_count,
        "leads": leads_count,
        "trainers": trainers_count,
    }
