import os
from dotenv import load_dotenv

# Charger le .env EN PREMIER, avant tout autre import qui lit des variables d'env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

from config import settings
import json
import sys
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

# --- WINDOWS ASYNCIO FIX ---
# Playwright needs subprocess support, which requires ProactorEventLoop on Windows.
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader, select_autoescape
from services.rendering_service import render_html_by_name

from export_docx import export_docx
from generate_pdf_from_html import html_to_pdf

# Imports d'authentification
from auth.router import router as auth_router
from auth.schemas import Token, UserOut
from auth.deps import get_current_user, get_current_active_user, get_current_active_superuser, get_optional_user

# Imports routers
from routers.admin_templates import router as admin_templates_router
from routers.admin.stats import router as admin_stats_router
from routers.admin_audit import router as admin_audit_router
from routers.admin_templates_upload import router as admin_templates_upload_router
from routers.templates import router as templates_router
from routers.payments import router as payments_router
from routers.resumes import router as resumes_router
from routers.admin_users import router as admin_users_router
from routers.exports import router as exports_router
from routers.personas import router as personas_router
from routers.admin_payments import router as admin_payments_router
from database import engine, Base, get_db
import models.persona # Ensure model is registered for create_all

# Création des tables (simple auto-migration au démarrage)
Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).parent.resolve()
TEMPLATES_DIR = Path(settings.TEMPLATES_DIR)
DATA_DIR = BASE_DIR / "data"
STATIC_DIR = BASE_DIR / "static"

# S'assurer que le dossier static existe
STATIC_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="CV Generator API",
    version="1.0.0",
    description="API pour la génération de CV avec authentification",
    docs_url="/docs",
    redoc_url="/redoc"
)

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(templates_router, prefix="/api", tags=["templates"])
app.include_router(payments_router, prefix="/api", tags=["payments"])
app.include_router(resumes_router, prefix="/api", tags=["resumes"])
app.include_router(exports_router, prefix="/api", tags=["exports"])
app.include_router(admin_templates_router, prefix="/api", tags=["admin"])
app.include_router(admin_stats_router, prefix="/api/admin/stats", tags=["admin-stats"])
app.include_router(admin_templates_upload_router, prefix="/api", tags=["admin"])
app.include_router(admin_audit_router, prefix="/api", tags=["admin"])
app.include_router(admin_users_router, prefix="/api", tags=["admin"])
app.include_router(admin_payments_router, prefix="/api", tags=["admin"])
app.include_router(personas_router, prefix="/api", tags=["personas"])






# === Static ===
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/api/templates", StaticFiles(directory=str(TEMPLATES_DIR)), name="templates_files")

# --- MODELS ---
class PreviewRequest(BaseModel):
    template_name: str
    data: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None

from typing import Optional, Dict, Any, List, Union

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

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    role: Optional[str] = None

# --- UTILS (Déportés dans services/rendering_service.py) ---
from services.rendering_service import render_html_by_name

# === ROUTES ===

# === Routes protégées ===

# Legacy routes removed - replaced by routers/templates.py

# Aperçu HTML (public — lecture seule, pas de coût serveur)
@app.post("/api/preview")
async def preview_html(req: PreviewRequest):
    """Génère un aperçu HTML du CV (accès public)"""
    try:
        config = req.config or {}
        config["is_preview"] = True
        
        # Debugging custom sections and projects
        print(f"--- DEBUG PREVIEW ---", flush=True)
        print(f"Template: {req.template_name}", flush=True)
        print(f"Projects length: {len(req.data.get('projects', []))}", flush=True)
        print(f"Custom sections length: {len(req.data.get('custom_sections', []))}", flush=True)
        print(f"Sections in config: {[s.get('type') for s in config.get('sections', []) if s.get('enabled')]}", flush=True)
        
        html_content = render_html_by_name(req.template_name, req.data, config_override=config)
        return {"html": html_content}
    except Exception as e:
        import traceback
        print(f"Preview error: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

# --- HELPERS POUR L'EXPORT ---
async def _get_or_create_export_user(req: ExportRequest, current_user: Optional[UserOut], db: Session):
    """Gère la logique de création/récupération d'utilisateur pour l'export avec vérification stricte du paiement"""
    from datetime import datetime, timedelta
    from models.user import User, UserRole
    from models.template import Template
    from models.payment import Payment, PaymentStatus
    from services.template_access_service import TemplateAccessService
    from auth.utils import create_access_token, get_password_hash
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
        # Si c'est payant, on vérifie si l'utilisateur a déjà accès
        has_access = target_user_id and TemplateAccessService.check_user_access(db, target_user_id, template.id)
        
        if not has_access:
            # Si pas d'accès, on vérifie si un payment_id valide est fourni
            if req.payment_id:
                # On accepte soit l'ID interne, soit l'ID du provider (KkiaPay/FedaPay)
                payment = db.query(Payment).filter(
                    (Payment.id == req.payment_id) | (Payment.provider_payment_id == req.payment_id)
                ).first()
                
                # En mode Sandbox local, on est plus souple car les webhooks ne reviennent pas vers localhost
                is_sandbox = os.getenv("KKIAPAY_SANDBOX") == "true" or os.getenv("PAYMENT_SANDBOX") == "true"
                
                payment_valid = False
                
                if payment and payment.status == PaymentStatus.SUCCESS:
                    payment_valid = True
                else:
                    # Tenter de vérifier avec l'API FedaPay
                    try:
                        from services.fedapay import fedapay_service
                        from models.payment import PaymentProvider
                        
                        status_info = await fedapay_service.verify_transaction(str(req.payment_id))
                        if status_info and status_info.get("status") in ["approved", "success"]:
                            payment_valid = True
                            
                            if not payment:
                                payment = Payment(
                                    provider_payment_id=str(req.payment_id),
                                    user_id=target_user_id,
                                    template_id=template.id,
                                    amount=300 if req.plan == "trial" else template.price,
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
                    if not payment:
                        from models.payment import PaymentProvider
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

                if payment_valid:
                    # On accorde l'accès
                    expires_at = datetime.now() + timedelta(days=14) if req.plan == "trial" else None
                    TemplateAccessService.grant_access(db=db, user_id=target_user_id, template_id=template.id, expires_at=expires_at, payment_id=payment.id if payment else None)
                else:
                    raise HTTPException(status_code=402, detail="Paiement requis ou non validé")
            else:
                raise HTTPException(status_code=402, detail="Paiement requis pour ce modèle")
    elif is_free and target_user_id and template:
        # Accès gratuit auto-accordé pour suivi
        TemplateAccessService.grant_access(db=db, user_id=target_user_id, template_id=template.id)

    return target_user_id, is_new_user, setup_token


# Export PDF
@app.post("/api/export/pdf")
async def export_pdf(
    req: ExportRequest,
    current_user: Optional[UserOut] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Exporte le CV en PDF et gère l'accès/inscription si nécessaire"""
    import uuid
    import re
    from services.mailer_service import mailer_service
    
    try:
        # 1. Gérer l'utilisateur
        target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user, db)
        # Générer un ID unique pour cette requête
        request_id = str(uuid.uuid4())
        
        # Rendre le HTML avec le service de rendu unifié
        html = render_html_by_name(req.template_name, req.data, config_override=req.config)
        
        # Fichier HTML temp unique
        tmp_html = BASE_DIR / f"_tmp_render_{request_id}.html"
        tmp_html.write_text(html, encoding="utf-8")

        # Toujours générer un nom de fichier unique (ignorer req.out pour la sécurité)
        # Cela empêche les collisions et les fuites de données entre utilisateurs
        safe_filename = f"CV_{request_id}.pdf"
        
        # Construire le chemin de sortie sécurisé (dans STATIC_DIR)
        out_pdf = STATIC_DIR / safe_filename
        
        # Générer le PDF via un sous-processus pour éviter les conflits d'Event Loop sur Windows
        import subprocess
        
        def run_pdf_cmd():
            cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--html", str(tmp_html), "--out", str(out_pdf)]
            return subprocess.run(cmd, capture_output=True, text=True)
            
        result = await asyncio.to_thread(run_pdf_cmd)
        
        if result.returncode != 0:
            print(f"PDF Generator Error: {result.stderr}")
            raise RuntimeError(f"Erreur lors de la génération du PDF: {result.stderr}")
        
        # Nettoyer le fichier temp
        tmp_html.unlink(missing_ok=True)

        url = f"/static/{out_pdf.name}" if out_pdf.exists() else None

        # 3. Envoyer l'email si c'est un nouvel utilisateur ou si demandé
        if url and (is_new_user or req.guest_email):
            email = req.guest_email or (current_user.email if current_user else None)
            name = req.guest_name or (current_user.full_name if current_user else "Client")
            
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
        # Nettoyer en cas d'erreur si tmp_html existe
        if 'tmp_html' in locals():
            tmp_html.unlink(missing_ok=True)
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"PDF export error: {error_detail}")
        # Nettoyer en cas d'erreur
        if 'tmp_html' in locals():
            tmp_html.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))

# Export DOCX
@app.post("/api/export/docx")
async def export_docx_endpoint(
    req: ExportRequest,
    current_user: Optional[UserOut] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Exporte le CV en DOCX et gère l'accès si nécessaire"""
    from services.mailer_service import mailer_service
    try:
        # 1. Gérer l'utilisateur
        target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user, db)
        
        import uuid
        request_id = str(uuid.uuid4())
        safe_filename = f"CV_{request_id}.docx"
        out_docx = STATIC_DIR / safe_filename
        
        # Passer les données directement (export_docx le supporte maintenant)
        result_path = export_docx(req.data, out_docx)
        
        url = f"/static/{out_docx.name}" if out_docx.exists() else None
        
        # 2. Envoyer l'email
        if url and (is_new_user or req.guest_email):
            email = req.guest_email or (current_user.email if current_user else None)
            name = req.guest_name or (current_user.full_name if current_user else "Client")
            
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

# Setup Password
class SetPasswordRequest(BaseModel):
    token: str
    password: str

@app.post("/api/auth/set-password")
async def set_password(req: SetPasswordRequest, db: Session = Depends(get_db)):
    from jose import jwt
    from auth.utils import SECRET_KEY, ALGORITHM, get_password_hash
    from models.user import User
    
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

# Génération de contenu
@app.post("/api/generate")
async def generate_content(
    req: GenerateRequest,
    current_user: UserOut = Depends(get_current_active_user)
):
    """
    Génère du contenu de CV en utilisant l'API gratuite de Hugging Face.
    Modèle utilisé: mistralai/Mistral-7B-Instruct-v0.2
    API gratuite avec limite de quelques centaines de requêtes par heure
    """
    
    base = req.data or {}
    fallback = {
        "profile": base.get("profile") or {"name": "Prénom Nom", "title": req.role or "Candidat"},
        "summary": base.get("summary") or "Professionnel(le) motivé(e) avec des résultats mesurables.",
        "experience": base.get("experience") or [],
        "education": base.get("education") or [],
        "skills": base.get("skills") or {"groups": []},
    }

    try:
        import httpx
        
        # Utiliser l'API gratuite de Hugging Face avec le token
        from config import settings
        hf_token = settings.HF_TOKEN or "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"
        print(f"[debug] Using HF token: {hf_token[:5]}...{hf_token[-5:]}")
        
        # Utiliser l'API de chat completion compatible OpenAI
        print("[debug] Using Hugging Face Chat Completion API")
        
        # Préparer les messages pour le chat
        user_description = req.prompt or f"Poste: {req.role or 'Candidat professionnel'}"
        
        system_prompt = """Tu es un assistant qui génère des CV professionnels en français au format JSON.
        Le JSON doit avoir la structure suivante exactement :
        {
          "profile": {
            "name": "Prénom Nom",
            "title": "Titre du poste",
            "email": "email@exemple.com"
          },
          "summary": "Résumé professionnel en 3-4 phrases.",
          "experience": [
            {
              "title": "Titre du poste",
              "company": "Nom de l'entreprise",
              "period": "Mois Année - Présent",
              "description": "Description des responsabilités."
            }
          ],
          "education": [
            {
              "degree": "Diplôme obtenu",
              "institution": "Nom de l'établissement",
              "period": "Année de début - Année de fin"
            }
          ],
          "skills": {
            "groups": [
              {
                "label": "Compétences",
                "items": ["Compétence 1", "Compétence 2", "Compétence 3"]
              }
            ]
          }
        }
        
        Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Génère un CV pour un candidat avec la description suivante : {user_description}"}
        ]
        
        # Configuration de l'API
        api_url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "Qwen/Qwen2.5-7B-Instruct-1M",  # Modèle recommandé pour les instructions longues
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 0.9
        }
        
        try:
            # Essayer avec l'API d'inférence
            async with httpx.AsyncClient() as client:
                response = await client.post(api_url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                result = response.json()
                
                # Vérifier et traiter la réponse de l'API
                if isinstance(result, dict) and 'choices' in result and len(result['choices']) > 0:
                    try:
                        # Extraire le contenu de la réponse
                        response_content = result['choices'][0]['message']['content']
                        
                        # Nettoyer et extraire le JSON
                        json_start = response_content.find('{')
                        json_end = response_content.rfind('}') + 1
                        
                        if json_start >= 0 and json_end > json_start:
                            json_text = response_content[json_start:json_end]
                            # Nettoyer le texte JSON
                            json_text = json_text.replace('\n', ' ').replace('\r', '').strip()
                            # Charger le JSON
                            generated_data = json.loads(json_text)
                            print("[generate] Successfully parsed JSON from API response")
                        else:
                            raise ValueError("No JSON object found in response")
                            
                    except json.JSONDecodeError as je:
                        print(f"[generate] JSON Decode Error: {str(je)}")
                        # Essayer d'extraire un JSON valide
                        try:
                            import re
                            json_match = re.search(r'\{.*\}', json_text, re.DOTALL)
                            if json_match:
                                generated_data = json.loads(json_match.group(0))
                                print("[generate] Successfully extracted valid JSON from response")
                            else:
                                raise ValueError("No valid JSON object found")
                        except Exception as e:
                            print(f"[generate] Failed to extract valid JSON: {str(e)}")
                            generated_data = fallback
                else:
                    print("[generate] No valid response from API")
                    generated_data = fallback
                    
        except httpx.HTTPStatusError as e:
            print(f"[generate] HTTP Error {e.response.status_code}: {str(e)}")
            print(f"[generate] Response content: {e.response.text}")
            generated_data = fallback
                
        except Exception as e:
            print(f"[generate] Unexpected error: {str(e)}")
            generated_data = fallback
        
        # Fusionner avec les données existantes
        result = {
            "profile": generated_data.get("profile", fallback["profile"]),
            "summary": generated_data.get("summary", fallback["summary"]),
            "experience": generated_data.get("experience", fallback["experience"]),
            "education": generated_data.get("education", fallback["education"]),
            "skills": generated_data.get("skills", fallback["skills"]),
        }
        
        return {"data": result, "source": "huggingface", "message": "✅ Contenu généré avec succès par l'IA Hugging Face (gratuit)"}
    except Exception as e:
        error_msg = str(e)
        print(f"[generate] Hugging Face error: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Retourner un message d'erreur explicite avec fallback
        return {
            "data": fallback, 
            "source": "stub", 
            "error": error_msg,
            "message": f"⚠️ Génération IA indisponible: {error_msg[:100]}... Données d'exemple utilisées."
        }

# Routes publiques
@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API de génération de CV",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Route protégée d'exemple

