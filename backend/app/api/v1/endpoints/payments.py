import os
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from decimal import Decimal
import json

from app.db.session import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus, PaymentProvider
from app.models.template import Template
from app.schemas.payment import PaymentCreate, PaymentOut, PaymentWebhook, PaymentVerification
from app.api.dependencies import get_current_active_user
from app.services.kkiapay import kkiapay_service
from app.services.fedapay import fedapay_service

router = APIRouter()

@router.post("/create", response_model=Dict[str, Any])
async def create_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crée une intention de paiement pour un template
    
    Returns:
        payment_id, transaction_id, payment_url
    """
    # Vérifier que le template existe
    template = db.query(Template).filter(Template.id == payment_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    # Vérifier que le template est payant
    if template.price == 0:
        raise HTTPException(status_code=400, detail="Ce template est gratuit")
    
    # Vérifier que l'utilisateur n'a pas déjà payé pour ce template
    existing_payment = db.query(Payment).filter(
        Payment.user_id == current_user.id,
        Payment.template_id == payment_in.template_id,
        Payment.status == PaymentStatus.SUCCESS
    ).first()
    
    if existing_payment:
        return {
            "message": "Vous avez déjà accès à ce template",
            "payment_id": existing_payment.id,
            "status": "already_paid"
        }
    
    # Créer le paiement en DB (status=pending)
    new_payment = Payment(
        user_id=current_user.id,
        template_id=payment_in.template_id,
        provider=payment_in.provider,
        amount=payment_in.amount,
        currency=payment_in.currency,
        status=PaymentStatus.PENDING
    )
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    try:
        if payment_in.provider == PaymentProvider.FEDAPAY:
            # Créer la transaction FedaPay
            fedapay_response = await fedapay_service.create_transaction(
                amount=payment_in.amount,
                description=f"Achat template {template.name}",
                customer_email=current_user.email,
                customer_firstname=current_user.full_name or "Client"
            )
            
            new_payment.provider_payment_id = str(fedapay_response["transaction_id"])
            new_payment.meta_data = fedapay_response["data"]
            db.commit()
            
            return {
                "payment_id": new_payment.id,
                "transaction_id": fedapay_response["transaction_id"],
                "status": "pending"
            }
        else:
            # Créer la transaction KkiaPay
            callback_url = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/payments/kkiapay/callback"
            
            kkiapay_response = await kkiapay_service.create_payment(
                amount=payment_in.amount,
                reason=f"Achat template {template.name}",
                callback_url=callback_url
            )
            
            # Mettre à jour le payment avec l'ID KkiaPay
            new_payment.provider_payment_id = kkiapay_response["transaction_id"]
            new_payment.meta_data = kkiapay_response
            db.commit()
            
            return {
                "payment_id": new_payment.id,
                "transaction_id": kkiapay_response["transaction_id"],
                "payment_url": kkiapay_response["payment_url"],
                "status": "pending"
            }
        
    except Exception as e:
        # En cas d'erreur, marquer le paiement comme failed
        new_payment.status = PaymentStatus.FAILED
        new_payment.meta_data = {"error": str(e)}
        db.commit()
        
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la création du paiement: {str(e)}"
        )

@router.post("/kkiapay/webhook")
async def kkiapay_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_kkiapay_signature: str = Header(None)
):
    """
    Webhook KkiaPay pour confirmer les paiements
    """
    # Lire le corps de la requête
    body = await request.body()
    body_str = body.decode('utf-8')
    
    # Vérifier la signature (si configurée)
    if x_kkiapay_signature and not kkiapay_service.verify_webhook_signature(body_str, x_kkiapay_signature):
        raise HTTPException(status_code=401, detail="Signature invalide")
    
    # Parser les données
    try:
        data = json.loads(body_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON invalide")
    
    transaction_id = data.get("transactionId")
    webhook_status = data.get("status")
    
    if not transaction_id:
        raise HTTPException(status_code=400, detail="transactionId manquant")
    
    # Trouver le paiement correspondant
    payment = db.query(Payment).filter(
        Payment.provider_payment_id == transaction_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    
    # Mettre à jour le statut
    prev_status = payment.status
    if webhook_status in ("SUCCESS", "SUCCESSFUL"):
        payment.status = PaymentStatus.SUCCESS
    elif webhook_status == "FAILED":
        payment.status = PaymentStatus.FAILED
    elif webhook_status == "CANCELLED":
        payment.status = PaymentStatus.CANCELLED

    payment.meta_data = {**(payment.meta_data or {}), "webhook": data}
    db.commit()

    # Accorder l'accès au template si paiement réussi (et pas déjà accordé)
    if payment.status == PaymentStatus.SUCCESS and prev_status != PaymentStatus.SUCCESS:
        from app.services.template_access_service import TemplateAccessService
        from app.models.template import Template
        from app.models.user import User

        template = db.query(Template).filter(Template.id == payment.template_id).first()
        user = db.query(User).filter(User.id == payment.user_id).first()

        if template and user:
            try:
                TemplateAccessService.grant_access(
                    db=db,
                    user_id=user.id,
                    template_id=template.id,
                    expires_at=None,  # accès permanent après achat complet
                    payment_id=payment.id
                )
                print(f"[Webhook KkiaPay] ✅ Accès au template '{template.name}' accordé à {user.email}")
            except Exception as e:
                print(f"[Webhook KkiaPay] Erreur grant_access: {e}")

            # Envoyer email de confirmation
            try:
                from app.services.mailer_service import mailer_service
                mailer_service.send_payment_confirmation(
                    recipient_email=user.email,
                    full_name=user.full_name or user.email,
                    template_name=template.name,
                    amount=float(payment.amount),
                    currency=payment.currency or "XOF"
                )
            except Exception as e:
                print(f"[Webhook KkiaPay] Erreur email confirmation: {e}")

    return {"status": "ok", "payment_id": payment.id}

@router.get("/{payment_id}/status", response_model=PaymentOut)
async def get_payment_status(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupère le statut d'un paiement"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    
    return payment

@router.get("/verify-access/{template_id}", response_model=PaymentVerification)
async def verify_template_access(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Vérifie si l'utilisateur a accès à un template
    (gratuit ou payé)
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    # Si le template est gratuit, accès direct
    if template.price == 0:
        return PaymentVerification(has_access=True)
    
    # Sinon, vérifier le paiement
    payment = db.query(Payment).filter(
        Payment.user_id == current_user.id,
        Payment.template_id == template_id,
        Payment.status == PaymentStatus.SUCCESS
    ).first()
    
    if payment:
        return PaymentVerification(
            has_access=True,
            payment_id=payment.id,
            payment_status=payment.status.value
        )
    
    return PaymentVerification(has_access=False)
