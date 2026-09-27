from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

class PaymentCreate(BaseModel):
    template_id: Optional[str] = None
    plan_code: Optional[str] = None
    amount: Decimal
    currency: str = "XOF"
    provider: Optional[str] = "kkiapay" # kkiapay, fedapay ou stripe


class PaymentOut(BaseModel):
    id: str
    user_id: str
    template_id: Optional[str]
    provider: str
    provider_payment_id: Optional[str]
    amount: Decimal
    currency: str
    status: str
    meta_data: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentWebhook(BaseModel):
    """Schema pour webhook KkiaPay"""
    transactionId: str
    amount: int
    status: str
    type: Optional[str] = None
    
class PaymentVerification(BaseModel):
    """Réponse de vérification de paiement"""
    has_access: bool
    payment_id: Optional[str] = None
    payment_status: Optional[str] = None
