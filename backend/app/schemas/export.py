from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ExportCreate(BaseModel):
    resume_id: str
    format: str  # pdf or docx

class ExportOut(BaseModel):
    id: str
    resume_id: str
    format: str
    status: str
    file_url: Optional[str]
    meta_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ExportListOut(BaseModel):
    id: str
    resume_id: str
    format: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
