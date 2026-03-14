import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class ResumeStatus(str, enum.Enum):
    DRAFT = "draft"
    COMPLETED = "completed"

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=True)
    title = Column(String(255), default='Mon CV')
    content = Column(JSON, nullable=False)
    status = Column(Enum(ResumeStatus), default=ResumeStatus.DRAFT)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    # user = relationship("User", back_populates="resumes") # Add this to User model
    # template = relationship("Template") 
