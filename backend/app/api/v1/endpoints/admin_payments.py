from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.utils.audit import log_audit
from app.models.payment import Payment, PaymentStatus
from app.models.template import Template
from app.api.dependencies import get_current_admin

router = APIRouter(prefix="/admin/payments", tags=["admin-payments"])

@router.get("/")
async def list_payments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[PaymentStatus] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Liste tous les paiements de la plateforme"""
    query = db.query(Payment)
    
    if status:
        query = query.filter(Payment.status == status)
        
    payments = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for p in payments:
        # On récupère les infos liées (user, template)
        user = db.query(User).filter(User.id == p.user_id).first()
        template = db.query(Template).filter(Template.id == p.template_id).first()
        
        results.append({
            "id": p.id,
            "user_email": user.email if user else "Inconnu",
            "template_name": template.name if template else "Inconnu",
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "provider": p.provider,
            "provider_payment_id": p.provider_payment_id,
            "created_at": p.created_at,
            "meta_data": p.meta_data
        })
        
    return results

@router.patch("/{payment_id}/confirm")
async def manually_confirm_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Valide manuellement un paiement (utile en cas d'échec de webhook)"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
        
    if payment.status == PaymentStatus.SUCCESS:
        return {"message": "Paiement déjà validé"}
        
    payment.status = PaymentStatus.SUCCESS
    payment.meta_data = {**(payment.meta_data or {}), "manual_confirmation_by": admin.email, "confirmed_at": datetime.now().isoformat()}
    
    db.commit()

    # Log audit
    log_audit(db, admin.id, "manual_confirm_payment", "payment", payment.id, {"amount": payment.amount, "user_id": payment.user_id})

    return {"message": "Paiement validé avec succès", "status": payment.status}
