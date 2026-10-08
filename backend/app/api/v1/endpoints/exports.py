import os
import sys
import uuid
import json
import asyncio
import subprocess
import logging
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
from app.core.limiter import limiter
from fastapi import Request

logger = logging.getLogger(__name__)

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[4]
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)
PRIVATE_EXPORTS_DIR = BASE_DIR / "private_exports"
PRIVATE_EXPORTS_DIR.mkdir(exist_ok=True)

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
CACHE_DIR = STATIC_DIR / "cache"
try:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
except Exception as _mkdir_err:
    logger.warning(f"Impossible de créer CACHE_DIR {CACHE_DIR}: {_mkdir_err}")

async def _cleanup_print_cache(cache_id: str, delay: int = 300):
    await asyncio.sleep(delay)
    cache_file = CACHE_DIR / f"{cache_id}.json"
    if cache_file.exists():
        cache_file.unlink(missing_ok=True)

@router.get("/print-data/{print_id}")
async def get_print_data(print_id: str):
    """Fournit les données de CV temporaires à la vue d'impression React Playwright"""
    cache_file = CACHE_DIR / f"{print_id}.json"
    if not cache_file.exists():
        raise HTTPException(status_code=404, detail="Données d'impression expirées ou introuvables")
    
    try:
        data = json.loads(cache_file.read_text(encoding="utf-8"))
        return data
    except Exception as e:
        logger.error(f"Erreur de lecture du cache {print_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne de cache")

@router.post("/preview")
@limiter.limit("15/minute")
async def preview_html(request: Request, req: PreviewRequest):
    """Génère un aperçu HTML du CV (accès public)"""
    try:
        cfg = req.config or {}
        cfg["is_preview"] = True
        html_content = render_html_by_name(req.template_name, req.data, config_override=cfg)
        return {"html": html_content}
    except Exception as e:
        import traceback
        logger.error(f"Preview error: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

async def _get_or_create_export_user(req: ExportRequest, current_user: Optional[UserOut], db: Session):
    """Gère la création/récupération d'utilisateur pour l'export avec vérification du paiement"""
    import secrets

    # 1. Vérifier si le template est gratuit
    template = db.query(Template).filter(Template.slug == req.template_name).first()
    if not template and req.template_id:
        template = db.query(Template).filter(Template.id == req.template_id).first()
    
    # Si le template n'existe pas en base, c'est un ancien template hardcodé (legacy)
    is_free = (template and template.price == 0) or (template is None)
    
    target_user_id = None
    is_new_user = False
    setup_token = None

    logger.debug(f"DEBUG EXPORT: template_name={req.template_name}, template_id={req.template_id}")
    logger.debug(f"DEBUG EXPORT: found template? {template is not None} (is_free={is_free})")

    if current_user:
        target_user_id = current_user.id
    elif req.guest_email:
        user = db.query(User).filter(User.email == req.guest_email).first()
        if not user:
            random_pass = secrets.token_urlsafe(16)
            user = User(
                email=req.guest_email,
                full_name=req.guest_name or "Client Carriey",
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
    is_admin = current_user and current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    if not is_free and not is_admin:
        has_access = target_user_id and template and TemplateAccessService.check_user_access(db, target_user_id, template.id)
        
        if not has_access:
            if req.payment_id:
                payment = db.query(Payment).filter(
                    (Payment.id == req.payment_id) | (Payment.provider_payment_id == req.payment_id)
                ).first()
                
                is_sandbox = os.getenv("KKIAPAY_SANDBOX") == "true" or os.getenv("PAYMENT_SANDBOX") == "true"
                is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
                payment_valid = False
                
                # ----- SECURITY VERIFICATIONS -----
                if payment:
                    if payment.status == PaymentStatus.CONSUMED:
                        raise HTTPException(status_code=400, detail="Ce paiement a déjà été utilisé.")
                    if payment.user_id != target_user_id:
                        raise HTTPException(status_code=403, detail="Ce paiement n'appartient pas à cet utilisateur.")
                    if payment.template_id and template and payment.template_id != template.id:
                        raise HTTPException(status_code=400, detail="Ce paiement ne correspond pas à ce modèle.")
                    
                    expected_amount = 300 if req.plan == "trial" else (template.price if template else 1000)
                    if float(payment.amount) < float(expected_amount):
                        raise HTTPException(status_code=400, detail="Le montant du paiement est insuffisant.")
                # -----------------------------------
                
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
                        logger.error(f"Erreur vérification dynamique FedaPay: {e}")
                
                # Le bypass sandbox ne doit jamais fonctionner en production
                if not payment_valid and is_sandbox and not is_prod:
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
                    
                    if payment:
                        payment.status = PaymentStatus.CONSUMED
                        db.commit()
                else:
                    logger.warning(f"DEBUG: 402 Error. payment_valid={payment_valid}, template={template is not None}, target_user_id={target_user_id}")
                    raise HTTPException(status_code=402, detail="Paiement requis ou non validé")
            else:
                logger.warning("DEBUG: 402 Error. No payment_id.")
                raise HTTPException(status_code=402, detail="Paiement requis pour ce modèle")
    elif is_free and target_user_id and template:
        TemplateAccessService.grant_access(db=db, user_id=target_user_id, template_id=template.id)

    return target_user_id, is_new_user, setup_token

@router.post("/export/pdf")
@limiter.limit("5/minute")
async def export_pdf(
    request: Request,
    req: ExportRequest,
    current_user: Optional[UserOut] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Exporte le CV en PDF (moteur React unifié avec repli Jinja2)"""
    # ── DEBUG: log d'entrée dans la fonction ───────────────────────────────────
    _debug_log = STATIC_DIR / "debug_export.txt"
    try:
        _debug_log.write_text(
            f"export_pdf CALLED: user={getattr(current_user, 'email', None)} "
            f"template={req.template_name}\n",
            encoding="utf-8"
        )
    except:
        pass
    # ──────────────────────────────────────────────────────────────────────────
    from app.services.mailer_service import mailer_service
    tmp_html = None
    
    try:
        target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user, db)
        request_id = str(uuid.uuid4())
        
        # Récupérer le template depuis la BDD pour obtenir le folder_name
        from app.models.template import Template
        template = db.query(Template).filter(Template.slug == req.template_name).first()
        
        # Mettre en cache pour la route d'impression React WYSIWYG
        payload = {
            "template_name": req.template_name,
            "folder_name": template.folder_name if template else None,
            "data": req.data,
            "config": req.config or {}
        }
        cache_file = CACHE_DIR / f"{request_id}.json"
        try:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            logger.info(f"Cache écrit: {cache_file}")
        except Exception as _cache_err:
            logger.error(f"ERREUR écriture cache {cache_file}: {_cache_err}")
            raise HTTPException(status_code=500, detail=f"Impossible d'écrire le cache PDF: {_cache_err}")
        try:
            asyncio.create_task(_cleanup_print_cache(request_id))
        except RuntimeError:
            pass  # Pas de boucle asyncio active (Passenger/WSGI) - nettoyage ignoré

        safe_filename = f"CV_{request_id}.pdf"
        out_pdf = PRIVATE_EXPORTS_DIR / safe_filename
        tmp_html = BASE_DIR / f"_tmp_render_{request_id}.html"

        frontend_url = os.getenv("FRONTEND_URL")
        if not frontend_url and os.getenv("ENVIRONMENT", "development").lower() == "production":
            raise HTTPException(status_code=500, detail="Configuration serveur invalide (FRONTEND_URL manquant en production)")
        frontend_url = frontend_url or "http://localhost:5000"
        
        doc_type = req.data.get("doc_type", "cv")
        if doc_type == "cover_letter":
            print_url = f"{frontend_url}/print/lettre?id={request_id}"
        else:
            print_url = f"{frontend_url}/print?id={request_id}"

        # ─── Tentative via Render PDF Service (production) ─────────────────────
        pdf_service_url = os.getenv("PDF_SERVICE_URL")  # ex: https://carriey-pdf-service.onrender.com
        pdf_service_secret = os.getenv("PDF_SERVICE_SECRET")

        if pdf_service_url:
            logger.info(f"[PDF Export] 🚀 Calling Render PDF service: {pdf_service_url}")
            import httpx
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(180.0, connect=30.0)) as client:
                    headers = {}
                    if pdf_service_secret:
                        headers["x-api-secret"] = pdf_service_secret
                    render_res = await client.post(
                        f"{pdf_service_url.rstrip('/')}/generate-pdf",
                        json={
                            "url": print_url,
                            "wait_for": "__CV_PRINT_READY__",
                            "filename": f"carriey-cv-{request_id}.pdf"
                        },
                        headers=headers
                    )

                if render_res.status_code == 200:
                    out_pdf.write_bytes(render_res.content)
                    logger.info(f"[PDF Export] ✅ PDF généré via Render ({len(render_res.content)} bytes)")
                else:
                    err_detail = render_res.text[:300]
                    logger.error(f"[PDF Export] ❌ Render PDF service error {render_res.status_code}: {err_detail}")
                    raise HTTPException(
                        status_code=502,
                        detail=f"Erreur du service PDF distant ({render_res.status_code}): {err_detail}"
                    )
            except httpx.TimeoutException as te:
                logger.error(f"[PDF Export] ❌ Timeout lors de l'appel au service Render PDF: {te}")
                raise HTTPException(
                    status_code=504,
                    detail="Le service de génération PDF a mis trop de temps à répondre (timeout). Le serveur Render était peut-être en cours de réveil. Veuillez réessayer."
                )
            except httpx.RequestError as re:
                logger.error(f"[PDF Export] ❌ Erreur réseau lors de l'appel au service Render PDF: {re}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Impossible de joindre le service PDF distant: {re}"
                )

        else:
            # ─── Fallback local : Playwright (dev uniquement) ──────────────────
            logger.warning("[PDF Export] PDF_SERVICE_URL non défini, repli sur Playwright local (développement).")

            def run_pdf_cmd():
                res = None
                # 1. Rendu React unifié (100% WYSIWYG)
                try:
                    logger.info(f"[PDF Export] Tentative de rendu React WYSIWYG via {print_url}")
                    cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--url", print_url, "--out", str(out_pdf)]
                    res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                    if res.returncode == 0 and out_pdf.exists() and out_pdf.stat().st_size > 1000:
                        logger.info("[PDF Export] ✅ Rendu React réussi avec fidélité absolue !")
                        return res
                    logger.warning(f"[PDF Export] Rendu React code {res.returncode}, repli sur Jinja2.")
                except Exception as react_err:
                    logger.warning(f"[PDF Export] Exception rendu React: {react_err}. Repli sur Jinja2...")

                # 2. Repli de secours : Rendu Jinja2
                try:
                    html = render_html_by_name(req.template_name, req.data, config_override=req.config)
                    tmp_html.write_text(html, encoding="utf-8")
                    cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--html", str(tmp_html), "--out", str(out_pdf)]
                    return subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                except Exception as e:
                    logger.error(f"Jinja2 Render Error: {e}")
                    if res is not None: return res
                    raise e
                
            result = await asyncio.to_thread(run_pdf_cmd)
            if result and result.returncode != 0 and (not out_pdf.exists() or out_pdf.stat().st_size == 0):
                logger.error(f"PDF Generator Error: {result.stderr}")
                raise RuntimeError(f"Erreur lors de la génération du PDF: {result.stderr}")

        if out_pdf.exists():
            download_token = create_access_token(
                data={"sub": out_pdf.name, "type": "export"},
                expires_delta=timedelta(hours=24)
            )
            url = f"{settings.API_STR}/exports/download/{download_token}"
        else:
            url = None

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
    except HTTPException as http_exc:
        logger.error(f"[PDF Export] HTTPException capturée: status={http_exc.status_code} detail={http_exc.detail!r}")
        raise
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"PDF export error: {tb}")
        raise HTTPException(status_code=400, detail=repr(e))
    finally:
        if tmp_html is not None:
            try:
                tmp_html.unlink(missing_ok=True)
            except Exception:
                pass


@router.post("/export/docx")
@limiter.limit("5/minute")
async def export_docx_endpoint(
    request: Request,
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
        out_docx = PRIVATE_EXPORTS_DIR / safe_filename
        
        result_path = export_docx(req.data, out_docx)
        if out_docx.exists():
            download_token = create_access_token(
                data={"sub": out_docx.name, "type": "export"},
                expires_delta=timedelta(hours=24)
            )
            url = f"{settings.API_STR}/exports/download/{download_token}"
        else:
            url = None
        
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
        logger.error(f"DOCX export error: {traceback.format_exc()}")
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

@router.get("/data")
async def export_user_data(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Exporte toutes les données de l'utilisateur au format JSON"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Non autorisé")
        
    from fastapi.encoders import jsonable_encoder
    from app.crud.crud_profile import profile as crud_profile
    from app.models.resume import Resume
    from app.models.candidature import Candidature
    
    user_profile = crud_profile.get_by_user(db=db, user_id=current_user.id)
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    candidatures = db.query(Candidature).filter(Candidature.user_id == current_user.id).all()
    
    export_data = {
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "subscription_status": current_user.subscription_status
        },
        "profile": jsonable_encoder(user_profile) if user_profile else None,
        "resumes": jsonable_encoder(resumes),
        "candidatures": jsonable_encoder(candidatures),
        "exported_at": datetime.now().isoformat()
    }
    
    # Return as a downloadable JSON file
    return JSONResponse(
        content=export_data,
        headers={
            "Content-Disposition": f"attachment; filename=cvtor_export_{current_user.id[:8]}.json"
        }
    )

from fastapi.responses import FileResponse

@router.get("/download/{token}")
async def download_export(token: str):
    """Télécharge un fichier exporté (PDF ou DOCX) via un lien temporaire/signé"""
    from jose import jwt, JWTError
    from app.core.security import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        filename = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "export" or not filename:
            raise HTTPException(status_code=400, detail="Token invalide")
            
        file_path = PRIVATE_EXPORTS_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Fichier non trouvé ou expiré")
            
        media_type = "application/pdf" if filename.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        return FileResponse(
            path=file_path, 
            filename=filename, 
            media_type=media_type,
            content_disposition_type="attachment"
        )
    except JWTError:
        raise HTTPException(status_code=403, detail="Lien expiré ou invalide")
