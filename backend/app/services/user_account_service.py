"""
Service de gestion des données personnelles et conformité RGPD (GDPR) pour Carriey.
Articles 15 (Droit d'accès), 17 (Droit à l'effacement / Droit à l'oubli), 20 (Droit à la portabilité).
"""
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.models.user import User
from app.models.profile import MasterProfile
from app.models.resume import Resume
from app.models.export import Export
from app.models.candidature import Candidature
from app.models.public_page import PublicPage
from app.models.user_template_access import UserTemplateAccess
from app.models.ai_log import AILog
from app.models.audit import AuditLog
from app.models.payment import Payment
from app.models.template import Template
from app.crud.crud_profile import profile as crud_profile

logger = logging.getLogger("carriey.gdpr")

BASE_DIR = Path(__file__).resolve().parents[2]


def export_user_gdpr_data(db: Session, user: User) -> Dict[str, Any]:
    """
    Génère un export complet, structuré et interopérable de toutes les données personnelles
    détenues par Carriey sur l'utilisateur, conformément aux articles 15 et 20 du RGPD.
    """
    user_profile = crud_profile.get_by_user(db=db, user_id=user.id)
    resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
    candidatures = db.query(Candidature).filter(Candidature.user_id == user.id).all()
    payments = db.query(Payment).filter(Payment.user_id == user.id).order_by(Payment.created_at.desc()).all()
    public_pages = db.query(PublicPage).filter(PublicPage.user_id == user.id).all()
    template_accesses = db.query(UserTemplateAccess).filter(UserTemplateAccess.user_id == user.id).all()

    now_iso = datetime.now(timezone.utc).isoformat()

    return {
        "metadata": {
            "platform": "Carriey",
            "compliance": "Règlement Général sur la Protection des Données (RGPD / GDPR - UE 2016/679)",
            "articles": ["Art. 15 (Droit d'accès)", "Art. 20 (Droit à la portabilité des données)"],
            "export_date": now_iso,
            "version": "2.0",
            "contact_dpo": "privacy@carriey.com"
        },
        "user_account": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "is_active": user.is_active,
            "subscription_status": user.subscription_status,
            "premium_until": user.premium_until.isoformat() if user.premium_until else None,
            "accepted_terms_version": getattr(user, "accepted_terms_version", "1.0"),
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        },
        "master_profile": jsonable_encoder(user_profile) if user_profile else None,
        "resumes_and_documents": jsonable_encoder(resumes),
        "candidatures": jsonable_encoder(candidatures),
        "payment_history": jsonable_encoder(payments),
        "public_pages": jsonable_encoder(public_pages),
        "template_accesses": jsonable_encoder(template_accesses)
    }


def delete_user_account_and_data(db: Session, user: User) -> Dict[str, Any]:
    """
    Supprime de manière irréversible et complète toutes les données personnelles et fichiers
    associés à un compte utilisateur (Droit à l'effacement / Droit à l'oubli - Art. 17 RGPD).
    """
    user_id = user.id
    user_email = user.email
    deleted_files: List[str] = []

    logger.info(f"[RGPD] Début de la suppression du compte {user_id} ({user_email})")

    # ──────────────────────────────────────────────────────────────────────────
    # 1. SUPPRESSION DES FICHIERS PHYSIQUES SUR DISQUE
    # ──────────────────────────────────────────────────────────────────────────
    # Photos de profil dans private_uploads/photos
    photos_dir = BASE_DIR / "private_uploads" / "photos"
    if photos_dir.exists():
        for file_path in photos_dir.glob(f"{user_id}*"):
            try:
                if file_path.is_file():
                    file_path.unlink(missing_ok=True)
                    deleted_files.append(file_path.name)
                    logger.info(f"[RGPD] Fichier photo supprimé: {file_path.name}")
            except Exception as e:
                logger.error(f"[RGPD] Erreur lors de la suppression de la photo {file_path}: {e}")

    # Fallback anciennes photos dans static/photos
    static_photos_dir = BASE_DIR / "static" / "photos"
    if static_photos_dir.exists():
        for file_path in static_photos_dir.glob(f"{user_id}*"):
            try:
                if file_path.is_file():
                    file_path.unlink(missing_ok=True)
                    deleted_files.append(file_path.name)
                    logger.info(f"[RGPD] Fichier static photo supprimé: {file_path.name}")
            except Exception as e:
                logger.error(f"[RGPD] Erreur suppression static photo {file_path}: {e}")

    # Fichiers d'export dans private_exports
    private_exports_dir = BASE_DIR / "private_exports"
    if private_exports_dir.exists():
        # Fichiers d'export JSON nommés avec le préfixe user_id
        for file_path in private_exports_dir.glob(f"*{user_id[:8]}*"):
            try:
                if file_path.is_file():
                    file_path.unlink(missing_ok=True)
                    deleted_files.append(file_path.name)
                    logger.info(f"[RGPD] Fichier export supprimé: {file_path.name}")
            except Exception as e:
                logger.error(f"[RGPD] Erreur suppression export {file_path}: {e}")

    # Fichiers de cache dans cache/
    cache_dir = BASE_DIR / "cache"
    if cache_dir.exists():
        for file_path in cache_dir.glob(f"*{user_id[:8]}*"):
            try:
                if file_path.is_file():
                    file_path.unlink(missing_ok=True)
                    deleted_files.append(file_path.name)
            except Exception:
                pass

    # ──────────────────────────────────────────────────────────────────────────
    # 2. SUPPRESSION DES ENREGISTREMENTS EN BASE DE DONNÉES (ORDRE RESPECTANT LES FK)
    # ──────────────────────────────────────────────────────────────────────────
    db_stats = {}

    try:
        # A. Accès templates payants
        db_stats["user_template_access"] = db.query(UserTemplateAccess).filter(
            UserTemplateAccess.user_id == user_id
        ).delete(synchronize_session=False)

        # B. Exports liés aux CVs de l'utilisateur
        resume_ids = [r[0] for r in db.query(Resume.id).filter(Resume.user_id == user_id).all()]
        if resume_ids:
            db_stats["exports"] = db.query(Export).filter(
                Export.resume_id.in_(resume_ids)
            ).delete(synchronize_session=False)
        else:
            db_stats["exports"] = 0

        # C. Candidatures (suivi de postulation)
        db_stats["candidatures"] = db.query(Candidature).filter(
            Candidature.user_id == user_id
        ).delete(synchronize_session=False)

        # D. Pages publiques
        db_stats["public_pages"] = db.query(PublicPage).filter(
            PublicPage.user_id == user_id
        ).delete(synchronize_session=False)

        # E. Paiements associés
        db_stats["payments"] = db.query(Payment).filter(
            Payment.user_id == user_id
        ).delete(synchronize_session=False)

        # F. CVs et Lettres de motivation
        db_stats["resumes"] = db.query(Resume).filter(
            Resume.user_id == user_id
        ).delete(synchronize_session=False)

        # G. Templates créés par l'utilisateur (détachement)
        db.query(Template).filter(
            Template.created_by == user_id
        ).update({Template.created_by: None}, synchronize_session=False)

        # H. Logs IA
        db_stats["ai_logs"] = db.query(AILog).filter(
            AILog.user_id == user_id
        ).delete(synchronize_session=False)

        # I. Logs d'audit (suppression pour droit à l'oubli strict)
        db_stats["audit_logs"] = db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).delete(synchronize_session=False)

        # J. Master Profile (avec cascade SQLAlchemy sur Expériences, Formations, Compétences...)
        profile = db.query(MasterProfile).filter(MasterProfile.user_id == user_id).first()
        if profile:
            db.delete(profile)
            db_stats["master_profile"] = 1
        else:
            db_stats["master_profile"] = 0

        # K. Entité Utilisateur principale
        db.delete(user)
        db.commit()

        logger.info(f"[RGPD] Compte {user_id} ({user_email}) supprimé avec succès. Stats: {db_stats}, Fichiers: {len(deleted_files)}")

        return {
            "status": "success",
            "message": "Le compte et toutes les données associées ont été supprimés définitivement.",
            "user_id": user_id,
            "deleted_files_count": len(deleted_files),
            "deleted_files": deleted_files,
            "db_records_deleted": db_stats
        }

    except Exception as e:
        db.rollback()
        logger.error(f"[RGPD] Erreur critique lors de la suppression du compte {user_id}: {e}")
        raise e
