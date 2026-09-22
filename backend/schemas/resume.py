from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal
from datetime import datetime

DocTypeEnum = Literal["cv", "cover_letter"]


class ResumeBase(BaseModel):
    title: str
    template_id: Optional[str] = None
    content: Dict[str, Any]
    doc_type: DocTypeEnum = "cv"
    linked_doc_id: Optional[str] = None


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    doc_type: Optional[DocTypeEnum] = None
    linked_doc_id: Optional[str] = None


class ResumeOut(ResumeBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeListOut(BaseModel):
    id: str
    title: str
    template_id: Optional[str] = None
    status: str
    doc_type: str = "cv"
    linked_doc_id: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
