import os
from typing import Dict, Any, Optional
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
from app.services.payments.payment_manager import payment_manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def get_expected_price(db: Session, template_id: Optional[str] = None, plan_code: Optional[str] = None) -> Optional[float]:
    """
    Détermine le prix attendu depuis la base de données (backend) 
    plutôt que de faire confiance au montant envoyé par le navigateur.
    """
    if template_id:
        from app.models.template import Template
        template = db.query(Template).filter(
            (Template.id == template_id) | (Template.slug == template_id)
        ).first()
        if template:
            return float(template.price)
    elif plan_code:
        from app.models.subscription_plan import SubscriptionPlan
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == plan_code).first()
        if plan:
            return float(plan.price)
    return None

@router.post("/create", response_model=Dict[str, Any])
async def create_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crée une intention de paiement pour un template ou un abonnement via le PaymentManager.
    """
    # 0. Vérification du montant attendu côté backend (Sécurité P0)
    expected_price = get_expected_price(db, template_id=payment_in.template_id, plan_code=payment_in.plan_code)
    
    if expected_price is None:
        raise HTTPException(status_code=404, detail="Template ou Plan introuvable")

    if float(payment_in.amount) != expected_price:
        logger.error(f"Tentative de fraude détectée pour user {current_user.id}: attendu {expected_price}, reçu {payment_in.amount}")
        raise HTTPException(
            status_code=400, 
            detail=f"Le montant envoyé ({payment_in.amount}) ne correspond pas au prix attendu ({expected_price})"
        )

    # 1. Vérifications initiales
    if payment_in.template_id:
        template = db.query(Template).filter(
            (Template.id == payment_in.template_id) | (Template.slug == payment_in.template_id)
        ).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template non trouvé")
        if template.price == 0:
            raise HTTPException(status_code=400, detail="Ce template est gratuit")
            
        # Normaliser pour utiliser l'ID réel (UUID) plutôt que le slug pour la suite
        payment_in.template_id = template.id
            
        existing_payment = db.query(Payment).filter(
            Payment.user_id == current_user.id,
            Payment.template_id.in_([template.id, template.slug]),
            Payment.status == PaymentStatus.SUCCESS
        ).first()
        
        if existing_payment:
            return {
                "message": "Vous avez déjà accès à ce template",
                "payment_id": existing_payment.id,
                "status": "already_paid"
            }
            
    elif payment_in.plan_code:
        # Pas de vérification d'achat précédent strict car les abonnements peuvent être renouvelés
        # Cependant, on pourrait vérifier s'il a déjà un abonnement actif en cours
        pass
    else:
        raise HTTPException(status_code=400, detail="Veuillez spécifier template_id ou plan_code")

    # 2. Création de l'enregistrement du paiement en statut PENDING
    new_payment = Payment(
        user_id=current_user.id,
        template_id=payment_in.template_id,
        plan_code=payment_in.plan_code,
        provider=payment_in.provider,
        amount=expected_price,
        currency=payment_in.currency,
        status=PaymentStatus.PENDING
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    # 3. Récupérer le bon provider depuis le Manager (Abstract Factory Pattern)
    try:
        provider_name = payment_in.provider or "kkiapay"
        provider = payment_manager.get_provider(provider_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 4. Construire les metadatas
    metadata = {
        "payment_id": new_payment.id,
        "user_id": current_user.id,
        "plan_code": payment_in.plan_code,
        "template_id": payment_in.template_id
    }
    
    # L'URL Frontend pour la redirection après paiement (widget Kkiapay, etc.)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    success_url = f"{frontend_url}/checkout/success"
    cancel_url = f"{frontend_url}/checkout"

    # 5. Créer le checkout via le provider
    try:
        checkout_data = await provider.create_checkout(
            amount=float(expected_price),
            currency=payment_in.currency,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        new_payment.provider_payment_id = checkout_data.get("transaction_id")
        new_payment.meta_data = checkout_data.get("provider_config", {})
        db.commit()
        
        return {
            "payment_id": new_payment.id,
            "transaction_id": checkout_data.get("transaction_id"),
            "payment_url": checkout_data.get("checkout_url"),
            "provider_config": checkout_data.get("provider_config"),
            "status": "pending"
        }
        
    except Exception as e:
        new_payment.status = PaymentStatus.FAILED
        new_payment.meta_data = {"error": str(e)}
        db.commit()
        
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la création du paiement: {str(e)}"
        )

from datetime import datetime, timedelta

@router.post("/webhook/{provider_name}")
async def handle_webhook(
    provider_name: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook générique pour tous les fournisseurs via le PaymentManager
    """
    # Lire le corps de la requête
    body = await request.body()
    body_str = body.decode('utf-8')
    
    try:
        data = json.loads(body_str)
    except json.JSONDecodeError:
        # Certains webhooks (comme stripe) ne sont pas du JSON direct ou utilisent forms, mais on suppose JSON ici
        data = body_str

    try:
        provider = payment_manager.get_provider(provider_name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Provider introuvable")

    # Extraire une potentielle signature depuis les headers
    signature = request.headers.get("x-kkiapay-signature") or request.headers.get("stripe-signature") or request.headers.get("x-fedapay-signature") or ""
    
    # Pour FedaPay, si un custom header Feda_WebHook_Key est utilisé
    if provider_name == "fedapay":
        from app.core.config import settings
        feda_custom_key = request.headers.get("feda_webhook_key") or request.headers.get("Feda_WebHook_Key") or request.headers.get("feda-webhook-key")
        if settings.FEDA_WEBHOOK_KEY:
            # On vérifie directement ici pour la sécurité P0
            if feda_custom_key != settings.FEDA_WEBHOOK_KEY:
                raise HTTPException(status_code=403, detail="Signature FedaPay invalide")
            signature = feda_custom_key

    # NOTE SÉCURITÉ: La vérification de la signature ou de la transaction est déléguée au provider.
    # Kkiapay revérifie la transaction via son API, Stripe nécessite une signature, etc.
    result = await provider.handle_webhook(payload=data, signature=signature)
    
    if result.get("status") != "success":
        raise HTTPException(status_code=400, detail="Webhook non validé par le provider")
        
    transaction_id = result.get("transaction_id")
    if not transaction_id:
        return {"status": "ignored", "reason": "No transaction ID in webhook result"}

    # 1. Retrouver le paiement dans notre BDD
    payment = db.query(Payment).filter(
        Payment.provider_payment_id == transaction_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement introuvable dans la base")

    # Vérification stricte du montant payé par rapport au montant attendu
    paid_amount = result.get("metadata", {}).get("amount") or result.get("raw_data", {}).get("amount")
    if paid_amount is not None:
        if float(paid_amount) != float(payment.amount):
            payment.status = PaymentStatus.FAILED
            payment.meta_data = {**(payment.meta_data or {}), "error": f"Montant payé invalide: {paid_amount} vs {payment.amount}"}
            db.commit()
            raise HTTPException(status_code=400, detail="Le montant réellement payé ne correspond pas au prix attendu")
        
        # Enregistrer explicitement le montant réellement payé et attendu pour audit
        payment.meta_data = {
            **(payment.meta_data or {}), 
            "expected_amount": float(payment.amount), 
            "paid_amount": float(paid_amount)
        }
        db.commit()

    prev_status = payment.status
    
    # Mettre à jour le statut
    payment.status = PaymentStatus.SUCCESS
    payment.meta_data = {**(payment.meta_data or {}), "webhook_verified": True}
    db.commit()

    # 2. Si le statut vient de passer à SUCCESS, délivrer la marchandise
    if prev_status != PaymentStatus.SUCCESS:
        user = db.query(User).filter(User.id == payment.user_id).first()
        if not user:
            return {"status": "ok", "message": "Paiement validé mais utilisateur introuvable"}
            
        # A) Achat d'un abonnement / Pass PRO
        if payment.plan_code:
            from app.models.subscription_plan import SubscriptionPlan
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == payment.plan_code).first()
            if plan and plan.duration_days > 0:
                # Ajouter les jours à la date actuelle ou à l'ancienne date premium
                current_time = datetime.now()
                base_time = user.premium_until if user.premium_until and user.premium_until > current_time else current_time
                user.premium_until = base_time + timedelta(days=plan.duration_days)
                user.subscription_status = "pass_active"
                db.commit()
                logger.info(f"[Webhook] ✅ Pass PRO ({plan.duration_days}j) activé pour {user.email}")
                
        # B) Achat d'un modèle unique (Template)
        if payment.template_id:
            from app.services.template_access_service import TemplateAccessService
            try:
                TemplateAccessService.grant_access(
                    db=db,
                    user_id=user.id,
                    template_id=payment.template_id,
                    expires_at=None,
                    payment_id=payment.id
                )
                logger.info(f"[Webhook] ✅ Accès au modèle {payment.template_id} accordé à {user.email}")
            except Exception as e:
                logger.error(f"[Webhook] Erreur grant_access: {e}")

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

@router.get("/history", response_model=Dict[str, Any])
async def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère l'historique des paiements de l'utilisateur
    """
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    
    return {
        "payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "currency": p.currency,
                "status": p.status.value,
                "date": p.created_at,
                "plan_code": p.plan_code,
                "template_id": p.template_id,
                "provider": p.provider.value if p.provider else None,
                "transaction_id": p.provider_payment_id
            }
            for p in payments
        ]
    }
