from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime

class PersonaBase(BaseModel):
    sector: str
    experience_level: str
    content_json: Dict[str, Any]

class PersonaCreate(PersonaBase):
    pass

class PersonaOut(PersonaBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SectorOut(BaseModel):
    sector: str
