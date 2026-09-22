from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List, Any
from datetime import datetime
import re


def validate_slug(slug: str) -> str:
    slug = slug.lower().strip()
    if not re.match(r'^[a-z0-9][a-z0-9\-]{2,98}$', slug):
        raise ValueError("Le slug doit contenir uniquement des lettres, chiffres et tirets (3-100 caractères)")
    if '--' in slug:
        raise ValueError("Le slug ne peut pas contenir deux tirets consécutifs")
    return slug


class SectionsConfig(BaseModel):
    bio: bool = True
    experiences: bool = True
    education: bool = True
    skills: bool = True
    projects: bool = True
    certifications: bool = True
    languages: bool = True
    links: bool = True


class PublicPageCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=3, max_length=100)
    sections: Optional[Dict[str, bool]] = None
    pinned_items: Optional[Dict[str, List[str]]] = None  # e.g. {"experiences": ["id1","id2"]}
    expires_at: Optional[datetime] = None
    is_active: bool = True
    theme: str = "modern"
    accent_color: str = "#6366f1"
    show_photo: bool = True
    show_contact: bool = True

    @validator("slug")
    def slug_must_be_valid(cls, v):
        return validate_slug(v)

    @validator("theme")
    def theme_must_be_valid(cls, v):
        if v not in ("minimal", "modern", "bold", "elegant"):
            raise ValueError("Thème invalide")
        return v


class PublicPageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=3, max_length=100)
    sections: Optional[Dict[str, bool]] = None
    pinned_items: Optional[Dict[str, List[str]]] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    show_photo: Optional[bool] = None
    show_contact: Optional[bool] = None

    @validator("slug", pre=True, always=False)
    def slug_must_be_valid(cls, v):
        if v is None:
            return v
        return validate_slug(v)

    @validator("theme", pre=True, always=False)
    def theme_must_be_valid(cls, v):
        if v is None:
            return v
        if v not in ("minimal", "modern", "bold", "elegant"):
            raise ValueError("Thème invalide")
        return v


class PublicPageOut(BaseModel):
    id: str
    user_id: str
    slug: str
    title: str
    sections: Dict[str, Any]
    pinned_items: Optional[Dict[str, List[str]]] = None
    expires_at: Optional[datetime] = None
    is_active: bool
    theme: str
    accent_color: str
    show_photo: bool
    show_contact: bool
    views: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SlugCheckOut(BaseModel):
    slug: str
    available: bool
    suggestion: Optional[str] = None
