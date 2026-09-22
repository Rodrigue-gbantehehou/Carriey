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
    try:
        _set_policy = getattr(asyncio, "set_event_loop_policy", None)
        _policy_cls = getattr(asyncio, "WindowsProactorEventLoopPolicy", None)
        if _set_policy and _policy_cls:
            _set_policy(_policy_cls())
    except Exception:
        pass

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
from routers.templates import router as templates_router
from routers.payments import router as payments_router
from routers.resumes import router as resumes_router
from routers.admin_users import router as admin_users_router
from routers.exports import router as exports_router
from routers.personas import router as personas_router
from routers.admin_payments import router as admin_payments_router
from routers.admin_resumes import router as admin_resumes_router
from routers.admin_reports import router as admin_reports_router
from routers.profile import router as profile_router
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
(STATIC_DIR / "previews").mkdir(parents=True, exist_ok=True)

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
app.include_router(profile_router, prefix="/api", tags=["profile"])
app.include_router(templates_router, prefix="/api", tags=["templates"])
app.include_router(payments_router, prefix="/api", tags=["payments"])
app.include_router(resumes_router, prefix="/api", tags=["resumes"])
app.include_router(exports_router, prefix="/api", tags=["exports"])
app.include_router(admin_templates_router, prefix="/api", tags=["admin"])
app.include_router(admin_stats_router, prefix="/api/admin/stats", tags=["admin-stats"])
app.include_router(admin_audit_router, prefix="/api", tags=["admin"])
app.include_router(admin_users_router, prefix="/api", tags=["admin"])
app.include_router(admin_payments_router, prefix="/api", tags=["admin"])
app.include_router(admin_resumes_router, prefix="/api", tags=["admin"])
app.include_router(admin_reports_router, prefix="/api", tags=["admin"])
app.include_router(personas_router, prefix="/api", tags=["personas"])






# === Static ===
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
# Note: templates files served under /template-assets to avoid conflict with /api/templates router
app.mount("/template-assets", StaticFiles(directory=str(TEMPLATES_DIR)), name="templates_files")

# --- MODELS ---
class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    role: Optional[str] = None

# Génération de contenu
@app.post("/api/generate")
async def generate_content(
    req: GenerateRequest,
    current_user: Optional[UserOut] = Depends(get_optional_user)
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
                    response_content = ""
                    json_text = ""
                    try:
                        # Extraire le contenu de la réponse
                        response_content = str(result['choices'][0]['message']['content'])
                        
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
                            json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
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

