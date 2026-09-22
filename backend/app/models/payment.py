import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, JSON, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class PaymentProvider(str, enum.Enum):
    KKIAPAY = "kkiapay"
    FEDAPAY = "fedapay"
    STRIPE = "stripe"
    PAYPAL = "paypal"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=True)
    
    provider = Column(Enum(PaymentProvider), nullable=False)
    provider_payment_id = Column(String(255), nullable=True)
    transaction_id = Column(String(255), nullable=True)  # kkiapay transaction ID
    payment_method = Column(String(50), nullable=True)  # mobile_money, card, etc.
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    meta_data = Column(JSON, nullable=True, name="meta")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # user = relationship("User")
    # template = relationship("Template")
    # resume = relationship("Resume")
