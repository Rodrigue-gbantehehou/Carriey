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

    if db:
        # Check active provider in DB
        db_provider = db.query(SystemConfig).filter(SystemConfig.key == "ai_provider").first()
        if db_provider and db_provider.value:
            provider_name = db_provider.value.lower()
            
        # Check specific model for this provider in DB
        db_model = db.query(SystemConfig).filter(SystemConfig.key == f"ai_model_{provider_name}").first()
        if db_model and db_model.value:
            model_name = db_model.value

    if provider_name == "gemini":
        from app.services.ai.providers.gemini import GeminiProvider
        provider = GeminiProvider(model_name=model_name)

    elif provider_name == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY n'est pas configurée dans les variables d'environnement.")
        from app.services.ai.providers.groq import GroqProvider
        provider = GroqProvider(api_key=api_key, model_name=model_name)

    else:
        raise NotImplementedError(f"Le provider IA '{provider_name}' n'est pas supporté. Valeurs : gemini, groq")

    return AIService(provider=provider)
