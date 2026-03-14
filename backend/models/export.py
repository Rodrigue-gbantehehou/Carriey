import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class ExportFormat(str, enum.Enum):
    PDF = "pdf"
    DOCX = "docx"

class ExportStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"

class Export(Base):
    __tablename__ = "exports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False)
    format = Column(Enum(ExportFormat), nullable=False)
    status = Column(Enum(ExportStatus), default=ExportStatus.QUEUED)
    file_url = Column(Text, nullable=True)
    meta_data = Column(JSON, nullable=True, name="meta") # 'meta' is reserved in some SQL, mapped to meta
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resume = relationship("Resume")
