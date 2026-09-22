import os
import sys
import uuid
import asyncio
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any, Union
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.template import Template
from app.models.payment import Payment, PaymentStatus
from app.api.dependencies import get_optional_user
from app.schemas.auth import UserOut
from app.core.security import create_access_token, get_password_hash, SECRET_KEY, ALGORITHM
from app.services.template_access_service import TemplateAccessService
from app.services.rendering_service import render_html_by_name
from export_docx import export_docx
from app.core.config import settings

router = APIRouter(tags=["exports"])

BASE_DIR = Path(__file__).parent.parent.resolve()
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

# --- MODELS ---
class PreviewRequest(BaseModel):
    template_name: str
    data: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None

class ExportRequest(BaseModel):
    template_name: str
    data: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None
    out: Optional[str] = None
    # Infos Guest & Paiement
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    plan: Optional[str] = "trial"  # "trial" ou "single"
    payment_id: Optional[Union[str, int]] = None
    template_id: Optional[str] = None

class SetPasswordRequest(BaseModel):
    token: str
    password: str

# --- CACHE D'IMPRESSION REACT WYSIWYG ---
_PRINT_CACHE: Dict[str, Any] = {}

async def _cleanup_print_cache(cache_id: str, delay: int = 300):
    await asyncio.sleep(delay)
    _PRINT_CACHE.pop(cache_id, None)

@router.get("/print-data/{print_id}")
async def get_print_data(print_id: str):
    """Fournit les données de CV temporaires à la vue d'impression React Playwright"""
    payload = _PRINT_CACHE.get(print_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Données d'impression expirées ou introuvables")
    return payload

@router.post("/preview")
async def preview_html(req: PreviewRequest):
    """Génère un aperçu HTML du CV (accès public)"""
    try:
        cfg = req.config or {}
        cfg["is_preview"] = True
        html_content = render_html_by_name(req.template_name, req.data, config_override=cfg)
        return {"html": html_content}
    except Exception as e:
        import traceback
        print(f"Preview error: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

async def _get_or_create_export_user(req: ExportRequest, current_user: Optional[UserOut], db: Session):
    """Gère la création/récupération d'utilisateur pour l'export avec vérification du paiement"""
    import secrets

    # 1. Vérifier si le template est gratuit
    template = db.query(Template).filter(Template.slug == req.template_name).first()
    if not template and req.template_id:
        template = db.query(Template).filter(Template.id == req.template_id).first()
    
    is_free = template and template.price == 0
    
    # 2. Identifier l'utilisateur cible
    target_user_id = None
    is_new_user = False
    setup_token = None

    if current_user:
        target_user_id = current_user.id
    elif req.guest_email:
        user = db.query(User).filter(User.email == req.guest_email).first()
        if not user:
            random_pass = secrets.token_urlsafe(16)
            user = User(
                email=req.guest_email,
                full_name=req.guest_name or "Client CVTor",
                hashed_password=get_password_hash(random_pass),
                role=UserRole.USER,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            is_new_user = True
            setup_token = create_access_token(
                data={"sub": user.email, "purpose": "setup_password"},
                expires_delta=timedelta(days=7)
            )
        target_user_id = user.id

    # 3. Vérification de l'accès / Paiement (Sauf pour les ADMINS)
    is_admin = current_user and current_user.role in ["ADMIN", "SUPER_ADMIN"]
    
    if not is_free and not is_admin:
        has_access = target_user_id and template and TemplateAccessService.check_user_access(db, target_user_id, template.id)
        
        if not has_access:
            if req.payment_id:
                payment = db.query(Payment).filter(
                    (Payment.id == req.payment_id) | (Payment.provider_payment_id == req.payment_id)
                ).first()
                
                is_sandbox = os.getenv("KKIAPAY_SANDBOX") == "true" or os.getenv("PAYMENT_SANDBOX") == "true"
                payment_valid = False
                
                if payment and payment.status == PaymentStatus.SUCCESS:
                    payment_valid = True
                else:
                    try:
                        from app.services.fedapay import fedapay_service
                        from app.models.payment import PaymentProvider
                        
                        status_info = await fedapay_service.verify_transaction(str(req.payment_id))
                        if status_info and status_info.get("status") in ["approved", "success"]:
                            payment_valid = True
                            
                            if not payment:
                                payment = Payment(
                                    provider_payment_id=str(req.payment_id),
                                    user_id=target_user_id,
                                    template_id=template.id if template else None,
                                    amount=300 if req.plan == "trial" else (template.price if template else 1000),
                                    currency="XOF",
                                    status=PaymentStatus.SUCCESS,
                                    provider=PaymentProvider.FEDAPAY
                                )
                                db.add(payment)
                                db.commit()
                                db.refresh(payment)
                            elif payment.status != PaymentStatus.SUCCESS:
                                payment.status = PaymentStatus.SUCCESS
                                db.commit()
                    except Exception as e:
                        print(f"Erreur vérification dynamique FedaPay: {e}")
                
                if not payment_valid and is_sandbox:
                    payment_valid = True
                    if not payment and template:
                        from app.models.payment import PaymentProvider
                        payment = Payment(
                            id=str(req.payment_id) if "-" in str(req.payment_id) else None,
                            provider_payment_id=str(req.payment_id),
                            user_id=target_user_id,
                            template_id=template.id,
                            amount=300 if req.plan == "trial" else template.price,
                            currency="XOF",
                            status=PaymentStatus.SUCCESS,
                            provider=PaymentProvider.KKIAPAY
                        )
                        db.add(payment)
                        db.commit()
                        db.refresh(payment)

                if payment_valid and template and target_user_id:
                    expires_at = datetime.now() + timedelta(days=14) if req.plan == "trial" else None
                    TemplateAccessService.grant_access(db=db, user_id=target_user_id, template_id=template.id, expires_at=expires_at, payment_id=payment.id if payment else None)
                else:
                    raise HTTPException(status_code=402, detail="Paiement requis ou non validé")
            else:
                raise HTTPException(status_code=402, detail="Paiement requis pour ce modèle")
    elif is_free and target_user_id and template:
        TemplateAccessService.grant_access(db=db, user_id=target_user_id, template_id=template.id)

    return target_user_id, is_new_user, setup_token

@router.post("/export/pdf")
async def export_pdf(
    req: ExportRequest,
    current_user: Optional[UserOut] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Exporte le CV en PDF (moteur React unifié avec repli Jinja2)"""
    from app.services.mailer_service import mailer_service
    tmp_html = None
    
    try:
        target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user, db)
        request_id = str(uuid.uuid4())
        
        # Mettre en cache pour la route d'impression React WYSIWYG
        _PRINT_CACHE[request_id] = {
            "template_name": req.template_name,
            "data": req.data,
            "config": req.config or {}
        }
        asyncio.create_task(_cleanup_print_cache(request_id))

        safe_filename = f"CV_{request_id}.pdf"
        out_pdf = STATIC_DIR / safe_filename
        tmp_html = BASE_DIR / f"_tmp_render_{request_id}.html"

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5000")
        print_url = f"{frontend_url}/print?id={request_id}"

        def run_pdf_cmd():
            # 1. Rendu React unifié (100% WYSIWYG)
            try:
                print(f"[PDF Export] Tentative de rendu React WYSIWYG via {print_url}")
                cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--url", print_url, "--out", str(out_pdf)]
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                if res.returncode == 0 and out_pdf.exists() and out_pdf.stat().st_size > 1000:
                    print("[PDF Export] ✅ Rendu React réussi avec fidélité absolue !")
                    return res
                print(f"[PDF Export] Rendu React code {res.returncode}, repli sur Jinja2.")
            except Exception as react_err:
                print(f"[PDF Export] Exception rendu React: {react_err}. Repli sur Jinja2...")

            # 2. Repli de secours : Rendu Jinja2
            html = render_html_by_name(req.template_name, req.data, config_override=req.config)
            tmp_html.write_text(html, encoding="utf-8")
            cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--html", str(tmp_html), "--out", str(out_pdf)]
            return subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
        result = await asyncio.to_thread(run_pdf_cmd)
        if result and result.returncode != 0 and (not out_pdf.exists() or out_pdf.stat().st_size == 0):
            print(f"PDF Generator Error: {result.stderr}")
            raise RuntimeError(f"Erreur lors de la génération du PDF: {result.stderr}")

        url = f"/static/{out_pdf.name}" if out_pdf.exists() else None

        # 3. Envoyer l'email de confirmation
        if url and (is_new_user or req.guest_email):
            email = req.guest_email or (current_user.email if current_user else None)
            name: str = req.guest_name or (current_user.full_name if (current_user and current_user.full_name) else None) or "Client"
            
            if email:
                setup_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:5000')}/set-password?token={setup_token}" if setup_token else None
                mailer_service.send_welcome_and_cv(
                    recipient_email=email,
                    full_name=name,
                    pdf_path=str(out_pdf) if out_pdf.exists() else None,
                    setup_link=setup_link
                )
        
        return {"file": str(out_pdf), "url": url}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"PDF export error: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if tmp_html is not None:
            try:
                tmp_html.unlink(missing_ok=True)
            except Exception:
                pass

@router.post("/export/docx")
async def export_docx_endpoint(
    req: ExportRequest,
    current_user: Optional[UserOut] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Exporte le CV en DOCX"""
    from app.services.mailer_service import mailer_service
    try:
        target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user, db)
        
        request_id = str(uuid.uuid4())
        safe_filename = f"CV_{request_id}.docx"
        out_docx = STATIC_DIR / safe_filename
        
        result_path = export_docx(req.data, out_docx)
        url = f"/static/{out_docx.name}" if out_docx.exists() else None
        
        if url and (is_new_user or req.guest_email):
            email = req.guest_email or (current_user.email if current_user else None)
            name: str = req.guest_name or (current_user.full_name if (current_user and current_user.full_name) else None) or "Client"
            
            if email:
                setup_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:5000')}/set-password?token={setup_token}" if setup_token else None
                mailer_service.send_welcome_and_cv(
                    recipient_email=email, 
                    full_name=name, 
                    setup_link=setup_link
                )

        return {"file": str(out_docx), "url": url}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"DOCX export error: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/set-password")
async def set_password(req: SetPasswordRequest, db: Session = Depends(get_db)):
    """Définit le mot de passe après un achat invité"""
    from jose import jwt
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        purpose = payload.get("purpose")
        
        if not email or purpose != "setup_password":
            raise HTTPException(status_code=400, detail="Token invalide ou expiré")
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
            
        user.hashed_password = get_password_hash(req.password)
        db.commit()
        
        return {"message": "Mot de passe défini avec succès"}
    except Exception:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")

