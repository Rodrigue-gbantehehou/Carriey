import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, Date, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class CandidatureStatus(str, enum.Enum):
    ENVOYEE = "envoyee"
    ENTRETIEN = "entretien"
    ACCEPTEE = "acceptee"
    REFUSEE = "refusee"

class Candidature(Base):
    __tablename__ = "candidatures"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    status = Column(Enum(CandidatureStatus), default=CandidatureStatus.ENVOYEE)
    applied_date = Column(Date, nullable=True)
    
    url = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    
    match_score = Column(Integer, nullable=True)
    job_description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="candidatures")
