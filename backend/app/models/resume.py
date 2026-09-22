import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class ResumeStatus(str, enum.Enum):
    DRAFT = "draft"
    COMPLETED = "completed"

class DocType(str, enum.Enum):
    CV = "cv"
    COVER_LETTER = "cover_letter"

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=True)
    title = Column(String(255), default='Mon CV')
    # content now stores selections (e.g. {"experience_ids": [1, 2], "skill_ids": [5]})
    # or visual overrides rather than raw master data.
    content = Column(JSON, nullable=False)
    status = Column(Enum(ResumeStatus), default=ResumeStatus.DRAFT)
    doc_type = Column(Enum(DocType), default=DocType.CV, nullable=False)
    linked_doc_id = Column(String(36), nullable=True)  # Lien CV <-> Lettre de motivation
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    # template = relationship("Template") 

