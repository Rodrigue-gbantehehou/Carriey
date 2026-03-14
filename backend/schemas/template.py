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
    folder_name: Optional[str] = None
    definition: Dict[str, Any]
    json_schema: Optional[Dict[str, Any]] = None
    is_active: bool = True

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
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
    price: Decimal
    currency: str
    is_active: bool
    is_system: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TemplateFiles(BaseModel):
    template_json: str
    style_css: str
    template_jinja2: str
