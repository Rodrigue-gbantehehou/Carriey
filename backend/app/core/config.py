from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional, List, Union, Any
import json
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(env_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("APP_NAME", "Carriey")
    VERSION: str = "1.0.0"
    API_STR: str = "/api"
    
    # Payment Keys
    KKIAPAY_PUBLIC_KEY: Optional[str] = None
    KKIAPAY_PRIVATE_KEY: Optional[str] = None
    KKIAPAY_SECRET: Optional[str] = None
    KKIAPAY_API_URL: str = "https://api.kkiapay.me/api/v1"
    KKIAPAY_SANDBOX: bool = True
    
    FEDAPAY_PUBLIC_KEY: Optional[str] = None
    FEDAPAY_SECRET_KEY: Optional[str] = None
    FEDAPAY_SANDBOX: bool = True
    FEDA_WEBHOOK_KEY: Optional[str] = None
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    TEMPLATES_DIR: str = os.getenv("TEMPLATES_DIR", os.path.join(os.path.dirname(BASE_DIR), "frontend", "components", "app", "cv", "templates"))
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cvtor.db")
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "your-secret-key-here-change-in-production"

    @field_validator("SECRET_KEY", mode="after")
    @classmethod
    def enforce_secret_key(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production" and v == "your-secret-key-here-change-in-production":
            raise ValueError("SECRET_KEY or JWT_SECRET_KEY must be set in production environment")
        return v
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # HuggingFace
    HF_TOKEN: Optional[str] = None
    
    # Security
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://carriey.nomiks.net",
        "https://carapi.nomiks.net",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [str(v)]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
