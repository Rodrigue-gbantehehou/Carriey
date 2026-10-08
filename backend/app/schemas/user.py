from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# Schéma de base pour l'utilisateur
class UserBase(BaseModel):
    email: EmailStr

# Schéma pour la création d'un utilisateur (inscription)
class UserCreate(UserBase):
    password: str

# Schéma pour la connexion d'un utilisateur
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schéma pour la réponse de l'utilisateur (sans mot de passe)
class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    premium_until: Optional[datetime] = None
    subscription_status: str
    accepted_terms_version: str

    class Config:
        from_attributes = True

# Schéma pour le token JWT
class Token(BaseModel):
    access_token: str
    token_type: str

# Schéma pour les données du token
class TokenData(BaseModel):
    email: Optional[str] = None
