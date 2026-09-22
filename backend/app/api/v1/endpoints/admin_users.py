from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.resume import Resume, DocType
from app.models.payment import Payment, PaymentStatus
from app.models.template import Template
from app.utils.audit import log_audit
from app.api.dependencies import get_current_super_admin, get_current_admin
from app.schemas.auth import UserOut

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────────────────────────
class SendEmailRequest(BaseModel):
    subject: str
    message: str


class AdminResetPasswordRequest(BaseModel):
    new_password: str


# ─── Endpoints existants ──────────────────────────────────────────────────────
@router.get("/", response_model=List[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Liste tous les utilisateurs"""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_super_admin)
):
    """Change le rôle d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    user.role = new_role
    db.commit()
    log_audit(db, admin.id, "update_role", "user", user.id, {"new_role": new_role, "user_email": user.email})
    return {"message": f"Rôle de {user.email} mis à jour vers {new_role}"}


@router.patch("/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Active ou désactive un compte utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    user.is_active = not user.is_active
    db.commit()
    action = "activate" if user.is_active else "deactivate"
    log_audit(db, admin.id, action, "user", user.id, {"user_email": user.email})
    return {"is_active": user.is_active}


# ─── Nouveaux endpoints ───────────────────────────────────────────────────────
@router.get("/{user_id}/details")
async def get_user_details(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Profil complet d'un utilisateur : docs, paiements, accès templates"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    docs = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).all()
    docs_out = []
    for d in docs:
        template = db.query(Template).filter(Template.id == d.template_id).first() if d.template_id else None
        docs_out.append({
            "id": d.id,
            "title": d.title,
            "doc_type": d.doc_type if d.doc_type else "cv",
            "status": d.status,
            "template_name": template.name if template else None,
            "created_at": d.created_at,
        })

    payments = db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.created_at.desc()).all()
    payments_out = []
    total_paid = 0
    for p in payments:
        template = db.query(Template).filter(Template.id == p.template_id).first() if p.template_id else None
        payments_out.append({
            "id": p.id,
            "template_name": template.name if template else "Inconnu",
            "amount": int(p.amount) if p.amount else 0,
            "currency": p.currency or "XOF",
            "status": p.status,
            "provider": p.provider,
            "created_at": p.created_at,
        })
        if p.status == PaymentStatus.SUCCESS and p.amount:
            total_paid += int(p.amount)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
        },
        "stats": {
            "total_cv": sum(1 for d in docs_out if d["doc_type"] == "cv"),
            "total_letters": sum(1 for d in docs_out if d["doc_type"] == "cover_letter"),
            "total_payments": len(payments_out),
            "total_paid": total_paid,
        },
        "documents": docs_out,
        "payments": payments_out,
    }


@router.post("/{user_id}/send-email")
async def send_email_to_user(
    user_id: str,
    req: SendEmailRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Envoie un email direct à un utilisateur depuis l'interface admin"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    try:
        from app.services.mailer_service import mailer_service
        html = f"""<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>body{{font-family:Arial,sans-serif;color:#1c1c1c;margin:0}}
.w{{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}}
.h{{background:#1c1c1c;padding:32px;text-align:center;color:#fff}}
.h h1{{margin:0;font-size:20px}}.b{{padding:32px}}
.f{{padding:16px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px}}</style></head>
<body><div class="w">
<div class="h"><h1>{req.subject}</h1></div>
<div class="b"><p style="white-space:pre-wrap;line-height:1.6">{req.message}</p></div>
<div class="f"><p>CVtor - Message de l'equipe support</p></div>
</div></body></html>"""

        msg = mailer_service._build_msg(
            to=user.email,
            subject=req.subject,
            html_body=html,
            text_body=req.message
        )
        sent = mailer_service._send(msg, user.email)
        if not sent:
            raise HTTPException(status_code=500, detail="Echec de l'envoi (verifiez la config SMTP)")

        log_audit(db, admin.id, "send_email", "user", user.id, {"subject": req.subject, "to": user.email})
        return {"message": f"Email envoye a {user.email}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.post("/{user_id}/reset-password")
async def admin_reset_password(
    user_id: str,
    req: AdminResetPasswordRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_super_admin)
):
    """Reinitialise le mot de passe d'un utilisateur (super admin seulement)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caracteres")
    from app.core.security import get_password_hash
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    log_audit(db, admin.id, "admin_reset_password", "user", user.id, {"user_email": user.email})
    return {"message": f"Mot de passe de {user.email} reinitialise"}
