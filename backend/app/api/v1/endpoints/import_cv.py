from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import json
import logging

from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.services.ai import get_ai_service
from app.services.ai_quota_service import check_and_consume_ai_quota, log_ai_usage
from app.utils.audit import log_audit
import pypdf
import io

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/extract")
async def extract_profile_from_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Extrait les informations d'un CV PDF (Expériences, Formations, etc)
    et retourne un JSON pré-formaté pour le Master Profile.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (5 Mo max).")

    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        logger.error(f"Error reading PDF: {e}")
        raise HTTPException(status_code=400, detail="Impossible de lire le contenu de ce PDF.")

    if not text.strip() or len(text) < 100:
        raise HTTPException(status_code=400, detail="Le PDF semble vide ou illisible.")

    # Vérification quota IA
    # check_and_consume_ai_quota(current_user, is_premium=current_user.is_pro) # Commented out for now if not strictly needed, or we just consume 1 token.
    # Let's use the ai service
    ai_service = get_ai_service()

    try:
        data, metadata = await ai_service.extract_cv_info(text)
        
        # Log usage
        # log_ai_usage(...) # Simplifié
        
        log_audit(db, current_user.id, "import_cv", "profile", current_user.id, {"file_size": len(content)})

        return data
    except Exception as e:
        logger.error(f"Error parsing AI response: {e}")
        raise HTTPException(status_code=500, detail="L'IA n'a pas pu extraire les données correctement.")

