import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Date, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Visibility(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    LINK_ONLY = "link_only"

class MasterProfile(Base):
    __tablename__ = "master_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    username = Column(String(191), unique=True, nullable=True, index=True) # For public URL e.g. /u/username
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    title = Column(String(255), nullable=True) # e.g. "Full Stack Developer"
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    marital_status = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    photo_url = Column(Text, nullable=True)  # Stored as base64 data URL or external URL
    
    visibility = Column(Enum(Visibility), default=Visibility.PRIVATE)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
    experiences = relationship("Experience", back_populates="profile", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="profile", cascade="all, delete-orphan")
    languages = relationship("Language", back_populates="profile", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="profile", cascade="all, delete-orphan")
    links = relationship("Link", back_populates="profile", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="profile", cascade="all, delete-orphan")
    custom_sections = relationship("CustomSection", back_populates="profile", cascade="all, delete-orphan", order_by="CustomSection.title")

class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    
    profile = relationship("MasterProfile", back_populates="experiences")

class Education(Base):
    __tablename__ = "educations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    degree = Column(String(255), nullable=False)
    school = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    
    profile = relationship("MasterProfile", back_populates="educations")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True) # e.g. "Languages", "Tools", "Soft Skills"
    level = Column(String(50), nullable=True) # e.g. "Expert", "Beginner"
    
    profile = relationship("MasterProfile", back_populates="skills")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    profile = relationship("MasterProfile", back_populates="projects")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    date = Column(String(20), nullable=True)
    url = Column(String(255), nullable=True)
    
    profile = relationship("MasterProfile", back_populates="certifications")

class Language(Base):
    __tablename__ = "languages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    level = Column(String(50), nullable=True) # e.g. "Bilingue", "Courant", "Intermédiaire"
    
    profile = relationship("MasterProfile", back_populates="languages")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    
    profile = relationship("MasterProfile", back_populates="achievements")

class Link(Base):
    __tablename__ = "links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    label = Column(String(100), nullable=False) # e.g. "LinkedIn", "Portfolio", "GitHub"
    url = Column(String(255), nullable=False)
    
    profile = relationship("MasterProfile", back_populates="links")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=True) # e.g. "CV", "Lettre de motivation", "Portfolio"
    file_url = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profile = relationship("MasterProfile", back_populates="documents")


class CustomSection(Base):
    """A custom section created by the user (e.g. Publications, Bénévolat, Récompenses)."""
    __tablename__ = "custom_sections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("master_profiles.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)          # Displayed section title
    icon = Column(String(100), nullable=True)            # FontAwesome class e.g. "fas fa-trophy"
    type = Column(String(50), default='detailed_list')   # text | simple_list | detailed_list

    profile = relationship("MasterProfile", back_populates="custom_sections")
    items = relationship("CustomSectionItem", back_populates="section", cascade="all, delete-orphan", order_by="CustomSectionItem.order")


class CustomSectionItem(Base):
    """An individual item inside a custom section."""
    __tablename__ = "custom_section_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id = Column(String(36), ForeignKey("custom_sections.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)
    date = Column(String(20), nullable=True)    # stored as string "YYYY-MM-DD" or "YYYY"
    description = Column(Text, nullable=True)
    order = Column(String(10), nullable=True, default='0')  # for sorting

    section = relationship("CustomSection", back_populates="items")
