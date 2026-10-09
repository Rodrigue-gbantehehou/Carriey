from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
from app.db.session import get_db
from app.models.system_config import SystemConfig
from app.models.user import User
from app.api.dependencies import get_current_super_admin
from app.services.mailer_service import mailer_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class LegalVersionResponse(BaseModel):
    version: str

class LegalUpdateRequest(BaseModel):
    version: str
    summary: str

@router.get("/version", response_model=LegalVersionResponse)
def get_current_legal_version(db: Session = Depends(get_db)) -> Any:
    """Récupère la version actuelle des CGU/Confidentialité."""
    config = db.query(SystemConfig).filter(SystemConfig.key == "LEGAL_TERMS_VERSION").first()
    if not config:
        return {"version": "1.0"}
    return {"version": config.value}

def _send_legal_emails_task(db_session: Session, new_version: str, summary: str):
    users = db_session.query(User).filter(User.is_active == True).all()
    logger.info(f"Starting email blast for legal update {new_version} to {len(users)} users.")
    for u in users:
        try:
            mailer_service.send_legal_update_notification(
                recipient_email=u.email,
                full_name=u.full_name,
                new_version=new_version,
                summary=summary
            )
        except Exception as e:
            logger.error(f"Failed to send legal update to {u.email}: {e}")

@router.post("/update", status_code=200)
def publish_legal_update(
    req: LegalUpdateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_super_admin)
) -> Any:
    """
    Mise à jour des CGU/Confidentialité et notification aux utilisateurs.
    (Super Admin uniquement)
    """
    config = db.query(SystemConfig).filter(SystemConfig.key == "LEGAL_TERMS_VERSION").first()
    if not config:
        config = SystemConfig(key="LEGAL_TERMS_VERSION", value=req.version, description="Version courante des documents légaux")
        db.add(config)
    else:
        config.value = req.version
    
    db.commit()

    # Lancer l'envoi d'emails en arrière-plan
    background_tasks.add_task(_send_legal_emails_task, db, req.version, req.summary)

    return {"message": "Version mise à jour avec succès. Notifications en cours d'envoi."}
