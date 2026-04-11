from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CVtor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    TEMPLATES_DIR: str = os.getenv("TEMPLATES_DIR", os.path.join(os.path.dirname(BASE_DIR), "frontend", "components", "cv-templates"))
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cvtor.db")
    
    # JWT
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # HuggingFace
    HF_TOKEN: Optional[str] = None
    
    # Security
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    def _get_cors_origins(self) -> List[str]:
        env_origins = os.getenv("BACKEND_CORS_ORIGINS")
        if env_origins:
            return [o.strip() for o in env_origins.split(",") if o.strip()]
        return self.BACKEND_CORS_ORIGINS

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
