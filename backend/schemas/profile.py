from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import date
from models.profile import Visibility

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
    date: Optional[date] = None
    url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class Certification(CertificationBase):
    id: str
    profile_id: str

    class Config:
        from_attributes = True

class MasterProfileBase(BaseModel):
    username: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    visibility: Visibility = Visibility.PRIVATE

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

    class Config:
        from_attributes = True
