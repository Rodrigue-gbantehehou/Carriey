from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.profile import MasterProfile, Experience, Education, Skill, Project, Certification, Language, Achievement, Link, Document
from app.schemas.profile import MasterProfileCreate, MasterProfileUpdate, ExperienceCreate, EducationCreate, SkillCreate, ProjectCreate, CertificationCreate, LanguageCreate, AchievementCreate, LinkCreate, DocumentCreate

class CRUDProfile(CRUDBase[MasterProfile, MasterProfileCreate, MasterProfileUpdate]):
    def get_by_user(self, db: Session, *, user_id: str) -> Optional[MasterProfile]:
        return db.query(self.model).filter(MasterProfile.user_id == user_id).first()

profile = CRUDProfile(MasterProfile)
experience = CRUDBase[Experience, ExperienceCreate, ExperienceCreate](Experience)
education = CRUDBase[Education, EducationCreate, EducationCreate](Education)
skill = CRUDBase[Skill, SkillCreate, SkillCreate](Skill)
project = CRUDBase[Project, ProjectCreate, ProjectCreate](Project)
certification = CRUDBase[Certification, CertificationCreate, CertificationCreate](Certification)
language = CRUDBase[Language, LanguageCreate, LanguageCreate](Language)
achievement = CRUDBase[Achievement, AchievementCreate, AchievementCreate](Achievement)
link = CRUDBase[Link, LinkCreate, LinkCreate](Link)
document = CRUDBase[Document, DocumentCreate, DocumentCreate](Document)
