from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.session import get_db
from app.models.user import User
from app.models.system_config import SystemConfig
from app.api.dependencies import get_current_admin

router = APIRouter()

class SystemConfigOut(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SystemConfigUpdate(BaseModel):
    value: str

@router.get("/", response_model=List[SystemConfigOut])
def get_all_configs(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Récupérer toutes les configurations système"""
    configs = db.query(SystemConfig).all()
    return configs

@router.put("/{key}", response_model=SystemConfigOut)
def update_config(
    key: str,
    config_in: SystemConfigUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Mettre à jour une configuration spécifique"""
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not config:
        # Create it if it doesn't exist
        config = SystemConfig(key=key, value=config_in.value)
        db.add(config)
    else:
        config.value = config_in.value
    
    db.commit()
    db.refresh(config)
    return config
