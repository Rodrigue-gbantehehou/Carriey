import uuid
from sqlalchemy import Column, String, Text, Numeric, Boolean, ForeignKey, DateTime, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(100), unique=True, nullable=False, index=True) # professional, modern
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), default=0)
    currency = Column(String(10), default='XOF')
    preview_image = Column(Text, nullable=True)
    folder_name = Column(String(191), nullable=False) # backend folder name
    definition = Column(JSON, nullable=False) # template.json content
    json_schema = Column(JSON, nullable=True)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)
    
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assets = relationship("TemplateAsset", back_populates="template")

class TemplateAsset(Base):
    __tablename__ = "template_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=False)
    type = Column(String(50), nullable=False) # css, jinja, preview, other
    file_path = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    template = relationship("Template", back_populates="assets")
