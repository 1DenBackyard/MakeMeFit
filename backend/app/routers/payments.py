"""Payments router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.models import User, Payment, Request, PaymentStatus
from app.schemas import PaymentCreate, PaymentResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentResponse, status_code=201)
async def create_payment(
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create payment for a request."""
    # Verify request exists and belongs to user
    result = await db.execute(
        select(Request).where(
            and_(
                Request.id == payment_data.request_id,
                Request.user_id == current_user.id
            )
        )
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if payment already exists
    existing = await db.execute(
        select(Payment).where(Payment.request_id == payment_data.request_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Payment already exists")
    
    # Create payment (amount set in config, for MVP use fixed price)
    from app.config import settings
    amount = 9.99  # MVP price
    
    payment = Payment(
        user_id=current_user.id,
        request_id=payment_data.request_id,
        amount=amount,
        currency="USD",
        status=PaymentStatus.PENDING,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse.model_validate(payment)


@router.post("/{payment_id}/complete", response_model=PaymentResponse)
async def complete_payment(
    payment_id: int,
    telegram_payment_charge_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete payment after Telegram payment success."""
    result = await db.execute(
        select(Payment).where(
            and_(
                Payment.id == payment_id,
                Payment.user_id == current_user.id
            )
        )
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status == PaymentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Payment already completed")
    
    # Update payment
    payment.telegram_payment_charge_id = telegram_payment_charge_id
    payment.status = PaymentStatus.COMPLETED
    from datetime import datetime
    payment.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse.model_validate(payment)


@router.get("/", response_model=list[PaymentResponse])
async def get_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's payment history."""
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    
    return [PaymentResponse.model_validate(p) for p in payments]
