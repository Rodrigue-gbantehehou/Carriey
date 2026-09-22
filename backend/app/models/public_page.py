import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class PublicPage(Base):
    __tablename__ = "public_pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)  # Internal label e.g. "CV Dev Senior"

    # Content control – which sections to show (JSON object: {bio, experiences, education, skills, ...})
    sections = Column(JSON, nullable=False, default=lambda: {
        "bio": True,
        "experiences": True,
        "education": True,
        "skills": True,
        "projects": True,
        "certifications": True,
        "languages": True,
        "links": True,
    })

    # Optional pin: specific IDs to show (null = show all enabled items)
    pinned_items = Column(JSON, nullable=True)

    # Expiry
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    # Design
    theme = Column(String(50), default="modern")         # minimal | modern | bold | elegant
    accent_color = Column(String(20), default="#6366f1")
    show_photo = Column(Boolean, default=True)
    show_contact = Column(Boolean, default=True)

    # Stats
    views = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    user = relationship("User", backref="public_pages")
