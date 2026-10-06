import os
import logging
from app.services.ai.service import AIService

logger = logging.getLogger(__name__)


def get_ai_service() -> AIService:
    """
    Factory qui instancie AIService avec le bon provider LLM.
    
    Pour changer de provider : modifier AI_PROVIDER dans le .env.
    Valeurs supportées : "gemini" (défaut), "groq"
    """
    provider_name = os.getenv("AI_PROVIDER", "gemini").lower()

    if provider_name == "gemini":
        from app.services.ai.providers.gemini import GeminiProvider
        provider = GeminiProvider()

    elif provider_name == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY n'est pas configurée dans les variables d'environnement.")
        from app.services.ai.providers.groq import GroqProvider
        provider = GroqProvider(api_key=api_key)

    else:
        raise NotImplementedError(f"Le provider IA '{provider_name}' n'est pas supporté. Valeurs : gemini, groq")

    return AIService(provider=provider)
