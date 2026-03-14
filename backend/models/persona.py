import uuid
from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.sql import func
from database import Base

class Persona(Base):
    __tablename__ = "personas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sector = Column(String(100), nullable=False, index=True) # Tech, Santé, Finance, etc.
    experience_level = Column(String(50), nullable=False, index=True) # junior, mid, senior, expert
    content_json = Column(JSON, nullable=False) # The full CV data structure
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
