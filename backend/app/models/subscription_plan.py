import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False, unique=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default='XOF')
    duration_days = Column(Integer, default=0)
    features = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
