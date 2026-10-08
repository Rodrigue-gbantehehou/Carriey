from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import List, Optional
from datetime import date
from app.models.profile import Visibility

# Base classes for shared attributes

class ExperienceBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: bool = False
    description: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class Experience(ExperienceBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    degree: str
    school: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class Education(EducationBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    level: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class CertificationBase(BaseModel):
    name: str
    issuer: str
    date: Optional[str] = None
    url: Optional[str] = None

    @field_validator('url', 'date', mode='before')
    @classmethod
    def empty_to_none(cls, v):
        if v is None or v == '':
            return None
        return str(v)[:10] if v else None  # keep only YYYY-MM-DD part

class CertificationCreate(CertificationBase):
    pass

class Certification(CertificationBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class LanguageBase(BaseModel):
    name: str
    level: Optional[str] = None

class LanguageCreate(LanguageBase):
    pass

class Language(LanguageBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class AchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[date] = None

class AchievementCreate(AchievementBase):
    pass

class Achievement(AchievementBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class LinkBase(BaseModel):
    label: str
    url: str

class LinkCreate(LinkBase):
    pass

class Link(LinkBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    title: str
    type: Optional[str] = None
    file_url: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

# ── Custom Sections ──────────────────────────────────────────────

class CustomSectionItemBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    order: Optional[str] = '0'

    @field_validator('subtitle', 'date', 'description', mode='before')
    @classmethod
    def empty_to_none(cls, v):
        return None if v == '' else v

class CustomSectionItemCreate(CustomSectionItemBase):
    pass

class CustomSectionItemOut(CustomSectionItemBase):
    id: str
    section_id: str

    class Config:
        from_attributes = True

class CustomSectionBase(BaseModel):
    title: str
    icon: Optional[str] = None
    type: Optional[str] = 'detailed_list'  # text | simple_list | detailed_list

    @field_validator('icon', mode='before')
    @classmethod
    def empty_icon_to_none(cls, v):
        return None if v == '' else v

class CustomSectionCreate(CustomSectionBase):
    pass

class CustomSectionOut(CustomSectionBase):
    id: str
    profile_id: str
    items: list[CustomSectionItemOut] = []

    class Config:
        from_attributes = True

class MasterProfileBase(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    username: Optional[str] = Field(None, max_length=191)
    title: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=10000)
    location: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[str] = Field(None, max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=50)
    marital_status: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = Field(None, max_length=255)
    photo_url: Optional[str] = Field(None, max_length=1024) # Empêche les gros Base64
    visibility: Visibility = Visibility.PRIVATE
    show_email: bool = False
    show_phone: bool = False

class MasterProfileCreate(MasterProfileBase):
    pass

class MasterProfileUpdate(MasterProfileBase):
    pass

class MasterProfile(MasterProfileBase):
    id: str
    user_id: str
    experiences: List[Experience] = []
    educations: List[Education] = []
    skills: List[Skill] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    languages: List[Language] = []
    achievements: List[Achievement] = []
    links: List[Link] = []
    documents: List[Document] = []
    custom_sections: List[CustomSectionOut] = []

    class Config:
        from_attributes = True
