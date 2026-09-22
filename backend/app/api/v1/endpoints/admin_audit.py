from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.api.dependencies import get_current_admin

router = APIRouter()

class AuditLogOut:
    """Schema pour les logs d'audit"""
    from pydantic import BaseModel
    
    class Config(BaseModel):
        id: str
        user_id: Optional[str]
        action: Optional[str]
        entity: Optional[str]
        entity_id: Optional[str]
        meta_data: Optional[dict]
        created_at: datetime
        
        class Config:
            from_attributes = True

@router.get("/", response_model=List[dict])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    entity: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Liste les logs d'audit avec filtres optionnels"""
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity:
        query = query.filter(AuditLog.entity == entity)
    
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convertir en dict pour éviter les problèmes de sérialisation
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "meta_data": log.meta_data,
            "created_at": log.created_at
        }
        for log in logs
    ]
