"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models import TrackType, RequestStatus, PaymentStatus, LeadStatus


# Auth
class TelegramInitData(BaseModel):
    """Telegram initData for authentication."""
    init_data: str


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    
    class Config:
        from_attributes = True


# Requests
class RequestCreate(BaseModel):
    """Create request schema."""
    track: TrackType
    form_data: Dict[str, Any] = Field(..., description="Form data specific to track")


class RequestResponse(BaseModel):
    """Request response schema."""
    id: int
    user_id: int
    track: TrackType
    status: RequestStatus
    form_data: Dict[str, Any]
    anti_fraud_passed: bool
    demo_answer: Optional[str]
    full_answer: Optional[str]
    suggested_activity_type: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class DemoResponse(BaseModel):
    """Demo response schema."""
    request_id: int
    demo_answer: str
    requires_payment: bool
    message: str = "This is a demo. Unlock full plan + PDF + history to continue."


class FullAnswerResponse(BaseModel):
    """Full answer response schema."""
    request_id: int
    full_answer: str
    pdf_url: Optional[str]
    pdf_size_bytes: Optional[int]


# Payments
class PaymentCreate(BaseModel):
    """Create payment schema."""
    request_id: int


class PaymentResponse(BaseModel):
    """Payment response schema."""
    id: int
    request_id: int
    amount: float
    currency: str
    status: PaymentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


# Trainers
class TrainerResponse(BaseModel):
    """Trainer response schema."""
    id: int
    telegram_username: str
    name: str
    specialization: Optional[str]
    activity_types: Optional[List[str]]
    tags: Optional[List[str]]
    location: Optional[str]
    is_online: bool
    
    class Config:
        from_attributes = True


class LeadCreate(BaseModel):
    """Create lead schema."""
    trainer_id: int
    request_id: int


class LeadResponse(BaseModel):
    """Lead response schema."""
    id: int
    trainer_id: int
    request_id: int
    attribution_code: str
    deep_link: str
    status: LeadStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


# History
class HistoryResponse(BaseModel):
    """History response schema."""
    requests: List[RequestResponse]
    total: int
