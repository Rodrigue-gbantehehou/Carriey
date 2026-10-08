import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(191), unique=True, nullable=False, index=True)  # 191 pour utf8mb4
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean(), default=True)
    
    # Token revocation mechanism
    token_version = Column(Integer, default=1, nullable=False, server_default="1")
    
    # AI Quotas
    ai_quota_used_today = Column(Integer, default=0, nullable=False, server_default="0")
    last_ai_usage_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Subscription & Premium
    premium_until = Column(DateTime(timezone=True), nullable=True)
    subscription_status = Column(String(50), default="free") # free, pass_active, expired

    # Relationships
    profile = relationship("MasterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"

