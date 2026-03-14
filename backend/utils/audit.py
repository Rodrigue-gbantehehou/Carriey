from sqlalchemy.orm import Session
from models.audit import AuditLog
from typing import Optional, Dict, Any

def log_audit(
    db: Session,
    user_id: Optional[str],
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None
):
    """
    Crée un log d'audit
    
    Args:
        db: Session de base de données
        user_id: ID de l'utilisateur (peut être None pour actions système)
        action: Action effectuée (ex: "create", "update", "delete", "login")
        entity: Type d'entité (ex: "template", "payment", "resume")
        entity_id: ID de l'entité concernée
        meta: Métadonnées supplémentaires
    """
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        meta_data=meta
    )
    
    db.add(audit_log)
    db.commit()
