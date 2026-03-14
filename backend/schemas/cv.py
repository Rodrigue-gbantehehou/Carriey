from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, HttpUrl

# --- SHARED PROPERTIES ---

class ExperienceBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = 0

class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = 0

class SkillGroupBase(BaseModel):
    name: str # e.g. "Languages"
    items: List[str] = [] # ["English", "French"]
    order: Optional[int] = 0

class CVBase(BaseModel):
    title: str
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    summary: Optional[str] = None

# --- CREATION ---

class ExperienceCreate(ExperienceBase):
    pass

class EducationCreate(EducationBase):
    pass

class SkillGroupCreate(SkillGroupBase):
    pass

class CVCreate(CVBase):
    experiences: List[ExperienceCreate] = []
    educations: List[EducationCreate] = []
    skills: List[SkillGroupCreate] = []

# --- UPDATE ---

class CVUpdate(BaseModel):
    title: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    summary: Optional[str] = None
    
    # Optional: Full replace of lists or tailored update logic
    # For simplicity, we might replace the whole lists on update
    experiences: Optional[List[ExperienceCreate]] = None
    educations: Optional[List[EducationCreate]] = None
    skills: Optional[List[SkillGroupCreate]] = None

# --- OUTPUT (DB READ) ---

class ExperienceOut(ExperienceBase):
    id: int
    cv_id: int

    class Config:
        from_attributes = True

class EducationOut(EducationBase):
    id: int
    cv_id: int

    class Config:
        from_attributes = True

class SkillGroupOut(SkillGroupBase):
    id: int
    cv_id: int

    class Config:
        from_attributes = True

class CVOut(CVBase):
    id: int
    user_id: int
    created_at: Any
    updated_at: Any
    
    experiences: List[ExperienceOut] = []
    educations: List[EducationOut] = []
    skills: List[SkillGroupOut] = []

    class Config:
        from_attributes = True
