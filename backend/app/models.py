"""Database models."""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.database import Base


class TrackType(str, enum.Enum):
    """Request track types."""
    SUPPLEMENTS = "supplements"
    WORKOUTS = "workouts"


class RequestStatus(str, enum.Enum):
    """Request processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REJECTED = "rejected"


class PaymentStatus(str, enum.Enum):
    """Payment status."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class LeadStatus(str, enum.Enum):
    """Trainer lead status."""
    PENDING = "pending"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    REJECTED = "rejected"


class User(Base):
    """Telegram user."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    language_code = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    requests = relationship("Request", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    demo_usage = relationship("DemoUsage", back_populates="user")
    leads = relationship("Lead", back_populates="user")


class Request(Base):
    """User request for recommendations."""
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    track = Column(SQLEnum(TrackType), nullable=False, index=True)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING, index=True)
    
    # Form data (stored as JSON for flexibility)
    form_data = Column(JSON, nullable=False)
    
    # Anti-fraud results
    anti_fraud_passed = Column(Boolean, default=False)
    anti_fraud_reason = Column(Text, nullable=True)
    
    # AI responses
    demo_answer = Column(Text, nullable=True)
    full_answer = Column(Text, nullable=True)
    structured_context = Column(JSON, nullable=True)
    
    # Activity type (for workouts, used for trainer matching)
    suggested_activity_type = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="requests")
    payment = relationship("Payment", back_populates="request", uselist=False)
    full_answer_doc = relationship("FullAnswer", back_populates="request", uselist=False)


class Payment(Base):
    """Payment records."""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("requests.id"), unique=True, nullable=False)
    
    telegram_payment_charge_id = Column(String(255), unique=True, nullable=True)
    provider_payment_charge_id = Column(String(255), nullable=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    request = relationship("Request", back_populates="payment")


class DemoUsage(Base):
    """Track demo usage per user per track."""
    __tablename__ = "demo_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    track = Column(SQLEnum(TrackType), nullable=False, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="demo_usage")
    
    # Unique constraint: one demo per user per track
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )


class FullAnswer(Base):
    """Full answer documents with PDF."""
    __tablename__ = "full_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), unique=True, nullable=False)
    
    markdown_content = Column(Text, nullable=False)
    pdf_path = Column(String(512), nullable=True)
    pdf_size_bytes = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    request = relationship("Request", back_populates="full_answer_doc")


class Trainer(Base):
    """Partner trainers."""
    __tablename__ = "trainers"
    
    id = Column(Integer, primary_key=True, index=True)
    telegram_username = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    specialization = Column(Text, nullable=True)  # Free text
    activity_types = Column(JSON, nullable=True)  # List of activity types
    tags = Column(JSON, nullable=True)  # List of tags
    location = Column(String(255), nullable=True)
    is_online = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    leads = relationship("Lead", back_populates="trainer")


class Lead(Base):
    """Trainer referral leads."""
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False)
    
    attribution_code = Column(String(64), unique=True, index=True, nullable=False)
    deep_link = Column(String(512), nullable=False)
    
    status = Column(SQLEnum(LeadStatus), default=LeadStatus.PENDING, index=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="leads")
    trainer = relationship("Trainer", back_populates="leads")


class Exercise(Base):
    """Exercise database (for reference)."""
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    muscle_groups = Column(JSON, nullable=True)
    equipment = Column(String(255), nullable=True)
    difficulty = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Supplement(Base):
    """Supplement database (for reference)."""
    __tablename__ = "supplements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(255), nullable=True)
    benefits = Column(JSON, nullable=True)
    dosage_range = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
