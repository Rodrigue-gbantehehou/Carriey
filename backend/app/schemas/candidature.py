from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import date, datetime

class CandidatureBase(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    status: str = "envoyee"
    applied_date: Optional[date] = None
    url: Optional[str] = None
    logo_url: Optional[str] = None
    match_score: Optional[int] = Field(None, ge=0, le=100)
    job_description: Optional[str] = None

class CandidatureCreate(CandidatureBase):
    pass

class CandidatureUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    url: Optional[str] = None
    logo_url: Optional[str] = None
    match_score: Optional[int] = Field(None, ge=0, le=100)
    job_description: Optional[str] = None

class CandidatureOut(CandidatureBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
