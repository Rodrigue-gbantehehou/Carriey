import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class UserTemplateAccess(Base):
    """
    Table pour gérer les accès des utilisateurs aux templates payants.
    Un enregistrement est créé lorsqu'un utilisateur achète un template.
    """
    __tablename__ = "user_template_access"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=False)
    payment_id = Column(String(36), ForeignKey("payments.id"), nullable=True)
    
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Pour accès temporaire si nécessaire
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (optionnel, à décommenter si nécessaire)
    # user = relationship("User")
    # template = relationship("Template")
    # payment = relationship("Payment")

    def __repr__(self):
        return f"<UserTemplateAccess user={self.user_id} template={self.template_id}>"
