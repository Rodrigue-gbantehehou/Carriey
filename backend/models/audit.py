import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=True)
    entity = Column(String(100), nullable=True)
    entity_id = Column(String(36), nullable=True)
    meta_data = Column(JSON, nullable=True, name="meta")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # user = relationship("User")
