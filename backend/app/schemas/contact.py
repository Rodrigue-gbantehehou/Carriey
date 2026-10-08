from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=2, max_length=255)
    message: str = Field(..., min_length=10, max_length=5000)
    honeypot: Optional[str] = None  # Anti-spam hidden field

class ContactMessageOut(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
