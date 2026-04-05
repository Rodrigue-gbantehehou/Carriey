from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ResumeBase(BaseModel):
    title: str
    template_id: str
    content: Dict[str, Any]

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ResumeOut(ResumeBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ResumeListOut(BaseModel):
    id: str
    title: str
    template_id: str
    status: str
    content: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
