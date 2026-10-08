import os
import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.services.ai.service import AIService
from app.models.system_config import SystemConfig

logger = logging.getLogger(__name__)


def get_ai_service(db: Optional[Session] = None) -> AIService:
    """
    Factory qui instancie AIService avec le bon provider LLM.
    Lit la configuration depuis SystemConfig (si db est fourni) ou fallback sur .env.
    """
    provider_name = os.getenv("AI_PROVIDER", "gemini").lower()
    model_name = None
    api_key_db = None

    if db:
        # Check active provider in DB
        db_provider = db.query(SystemConfig).filter(SystemConfig.key == "ai_provider").first()
        if db_provider and db_provider.value:
            provider_name = db_provider.value.lower()
            
        # Check specific model for this provider in DB
        db_model = db.query(SystemConfig).filter(SystemConfig.key == f"ai_model_{provider_name}").first()
        if db_model and db_model.value:
            model_name = db_model.value
            
        # Check specific api key for this provider in DB
        db_key = db.query(SystemConfig).filter(SystemConfig.key == f"ai_key_{provider_name}").first()
        if db_key and db_key.value:
            api_key_db = db_key.value

    if provider_name == "gemini":
        from app.services.ai.providers.gemini import GeminiProvider
        # Si api_key_db est None, GeminiProvider va utiliser l'environnement
        provider = GeminiProvider(api_key=api_key_db, model_name=model_name)

    elif provider_name == "groq":
        api_key = api_key_db or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY n'est pas configurée dans l'admin ni l'environnement.")
        from app.services.ai.providers.groq import GroqProvider
        provider = GroqProvider(api_key=api_key, model_name=model_name)

    else:
        raise NotImplementedError(f"Le provider IA '{provider_name}' n'est pas supporté. Valeurs : gemini, groq")

    return AIService(provider=provider)
