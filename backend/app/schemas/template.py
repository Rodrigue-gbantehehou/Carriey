from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

class TemplateBase(BaseModel):
    slug: str
    name: str
    description: Optional[str] = None
    price: Decimal = Decimal("0")
    currency: str = "XOF"
    preview_image: Optional[str] = None
    folder_name: Optional[str] = None
    definition: Dict[str, Any]
    json_schema: Optional[Dict[str, Any]] = None
    template_type: str = "cv"
    is_active: bool = True

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    preview_image: Optional[str] = None
    is_active: Optional[bool] = None
    definition: Optional[Dict[str, Any]] = None

class TemplateOut(TemplateBase):
    id: str
    version: int
    is_system: bool
    created_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class TemplateListOut(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    preview_image: Optional[str] = None
    price: Decimal
    currency: str
    is_active: bool
    is_system: bool
    template_type: str = "cv"
    definition: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class TemplateFiles(BaseModel):
    template_json: str
    style_css: str
    template_jinja2: str
