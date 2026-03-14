#!/usr/bin/env python3
import os
import json
from pathlib import Path
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader, select_autoescape
from services.rendering_service import render_html_by_name as _render_html_service

from export_docx import export_docx
from generate_pdf_from_html import html_to_pdf

# Imports d'authentification
from auth.router import router as auth_router
from auth.schemas import Token, UserOut
from auth.deps import get_current_user, get_current_active_user, get_current_active_superuser

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
from database import engine, Base
import models.persona # Ensure model is registered for create_all

# Création des tables (simple auto-migration au démarrage)
Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).parent.resolve()
TEMPLATES_DIR = BASE_DIR / "templates"
DATA_DIR = BASE_DIR / "data"

app = FastAPI(
    title="CV Generator API",
    version="1.0.0",
    description="API pour la génération de CV avec authentification",
    docs_url="/docs",
    redoc_url="/redoc"
)

# === CORS ===
from config import settings
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
app.include_router(personas_router, prefix="/api", tags=["personas"])






# === Static ===
app.mount("/static", StaticFiles(directory=str(BASE_DIR)), name="static")

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

# Export PDF
@app.post("/api/export/pdf")
async def export_pdf(
    req: ExportRequest,
    current_user: UserOut = Depends(get_current_active_user)
):
    """Exporte le CV en PDF (accès authentifié requis)"""
    import uuid
    import re
    
    try:
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
        
        # Construire le chemin de sortie sécurisé (toujours dans BASE_DIR)
        out_pdf = BASE_DIR / safe_filename
        
        # Générer le PDF
        html_to_pdf(tmp_html, out_pdf)
        
        # Nettoyer le fichier temp
        tmp_html.unlink(missing_ok=True)

        url = f"/static/{out_pdf.name}" if out_pdf.exists() else None
        return {"file": str(out_pdf), "url": url}
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
    current_user: UserOut = Depends(get_current_active_user)
):
    """Exporte le CV en DOCX (accès authentifié requis)"""
    try:
        import uuid
        request_id = str(uuid.uuid4())
        safe_filename = f"CV_{request_id}.docx"
        out_docx = BASE_DIR / safe_filename
        
        # Passer les données directement (export_docx le supporte maintenant)
        # Note: DOCX ignore actuellement le config_override car il est basé sur du texte pur
        result_path = export_docx(req.data, out_docx)
        
        url = f"/static/{out_docx.name}" if out_docx.exists() else None
        return {"file": str(out_docx), "url": url}
    except Exception as e:
        import traceback
        print(f"DOCX export error: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

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

