from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime

class SubscriptionPlanBase(BaseModel):
    name: str
    code: str
    price: float
    currency: Optional[str] = 'XOF'
    duration_days: Optional[int] = 0
    features: Optional[Any] = None
    is_active: Optional[bool] = True

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    duration_days: Optional[int] = None
    features: Optional[Any] = None
    is_active: Optional[bool] = None

class SubscriptionPlanOut(SubscriptionPlanBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
