from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.crud.crud_profile import profile as crud_profile
from app.services.ai_factory import get_ai_service
from pydantic import BaseModel
from app.core.limiter import limiter
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CoverLetterRequest(BaseModel):
    job_description: str

class CoverLetterResponse(BaseModel):
    subject: str
    salutation: str
    body: str
    closing: str

class PublicBioRequest(BaseModel):
    target_audience: str = "Recruteurs et professionnels"

class PublicBioResponse(BaseModel):
    custom_bio: str
    seo_description: str

@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
@limiter.limit("5/minute")
async def generate_cover_letter_endpoint(
    request: Request,
    req: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Génère une lettre de motivation à partir du profil de l'utilisateur et d'une description d'offre.
    """
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="La description de l'offre est requise.")

    # 1. Récupérer le profil de l'utilisateur
    profile = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Vous devez d'abord créer un profil pour générer une lettre.")
    
    # Sérialiser le profil de façon simple (ajuster selon le modèle Profile)
    profile_data = {
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "email": profile.contact_email,
        "phone": profile.contact_phone,
        "location": profile.location,
        "title": profile.title,
        "bio": profile.bio,
        "experience": [{"title": e.title, "company": e.company, "description": e.description} for e in profile.experiences],
        "education": [{"degree": e.degree, "school": e.school} for e in profile.educations],
        "skills": [{"name": s.name, "level": s.level} for s in profile.skills],
        "languages": [{"name": l.name, "level": l.level} for l in profile.languages]
    }

    # 2. Appeler le service d'IA
    try:
        ai_service = get_ai_service()
        letter_dict = await ai_service.generate_cover_letter(profile_data, req.job_description)
        
        return CoverLetterResponse(
            subject=letter_dict.get("subject", ""),
            salutation=letter_dict.get("salutation", ""),
            body=letter_dict.get("body", ""),
            closing=letter_dict.get("closing", "")
        )
    except Exception as e:
        logger.error(f"Erreur de génération IA : {str(e)}")
        raise HTTPException(status_code=500, detail="La génération de la lettre a échoué.")

@router.post("/generate-public-bio", response_model=PublicBioResponse)
@limiter.limit("5/minute")
async def generate_public_bio_endpoint(
    request: Request,
    req: PublicBioRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profil introuvable.")
    
    profile_data = {
        "title": profile.title,
        "bio": profile.bio,
        "experience": [{"title": e.title, "company": e.company, "description": e.description} for e in profile.experiences],
        "skills": [{"name": s.name, "level": s.level} for s in profile.skills],
    }

    try:
        ai_service = get_ai_service()
        res = await ai_service.generate_public_bio(profile_data, req.target_audience)
        return PublicBioResponse(
            custom_bio=res.get("custom_bio", ""),
            seo_description=res.get("seo_description", "")
        )
    except Exception as e:
        logger.error(f"Erreur de génération IA : {str(e)}")
        raise HTTPException(status_code=500, detail="La génération de la bio a échoué.")

class SlugSuggestionsResponse(BaseModel):
    suggestions: list[str]
    titles: list[str] = []

@router.post("/generate-slug-suggestions", response_model=SlugSuggestionsResponse)
@limiter.limit("10/minute")
async def generate_slug_suggestions_endpoint(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profil introuvable.")

    profile_data = {
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "title": profile.title,
    }

    try:
        ai_service = get_ai_service()
        res = await ai_service.generate_slug_suggestions(profile_data)
        suggestions = res.get("suggestions", [])
        titles = res.get("titles", [])
        return SlugSuggestionsResponse(suggestions=suggestions, titles=titles)
    except RuntimeError as e:
        if "QUOTA_EXCEEDED" in str(e):
            raise HTTPException(status_code=503, detail="Le quota IA est épuisé pour aujourd'hui. Réessayez demain ou passez à un plan payant.")
        raise HTTPException(status_code=500, detail="La génération des slugs a échoué.")
    except Exception as e:
        logger.error(f"Erreur de génération IA : {str(e)}")
        raise HTTPException(status_code=500, detail="La génération des slugs a échoué.")

class TailorCvRequest(BaseModel):
    job_description: str

from datetime import datetime, timezone

@router.post("/tailor-cv")
@limiter.limit("5/minute")
async def tailor_cv_endpoint(
    request: Request,
    req: TailorCvRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérification Premium
    if not current_user.premium_until or current_user.premium_until.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail="L'adaptation de CV par l'IA est une fonctionnalité PRO.")
        
    profile = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profil introuvable.")

    # Convert full profile to dict for the prompt
    profile_data = {
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "title": profile.title,
        "bio": profile.bio,
        "experiences": [
            {
                "id": exp.id,
                "title": exp.title,
                "company": exp.company,
                "description": exp.description
            } for exp in profile.experiences
        ]
    }

    try:
        ai_service = get_ai_service()
        res = await ai_service.tailor_cv(profile_data, req.job_description)
        return res
    except RuntimeError as e:
        if "QUOTA_EXCEEDED" in str(e):
            raise HTTPException(status_code=503, detail="Le quota IA est épuisé pour aujourd'hui.")
        raise HTTPException(status_code=500, detail="L'adaptation du CV a échoué.")
    except Exception as e:
        logger.error(f"Erreur de génération IA : {str(e)}")
        raise HTTPException(status_code=500, detail="L'adaptation du CV a échoué.")

class ExtractJobRequest(BaseModel):
    job_text: str

class ExtractJobResponse(BaseModel):
    companyName: str
    jobTitle: str
    location: str

@router.post("/extract-job", response_model=ExtractJobResponse)
@limiter.limit("10/minute")
async def extract_job_endpoint(
    request: Request,
    req: ExtractJobRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        ai_service = get_ai_service()
        res = await ai_service.extract_job_details(req.job_text)
        return ExtractJobResponse(
            companyName=res.get("companyName", ""),
            jobTitle=res.get("jobTitle", ""),
            location=res.get("location", "")
        )
    except RuntimeError as e:
        if "QUOTA_EXCEEDED" in str(e):
            raise HTTPException(status_code=503, detail="Le quota IA est épuisé pour aujourd'hui.")
        raise HTTPException(status_code=500, detail="L'extraction des détails a échoué.")
    except Exception as e:
        logger.error(f"Erreur de génération IA : {str(e)}")
        raise HTTPException(status_code=500, detail="L'extraction des détails a échoué.")

