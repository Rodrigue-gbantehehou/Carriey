import os
import logging
from app.services.ai_service import AIService
from app.services.gemini_service import GeminiAIService

logger = logging.getLogger(__name__)

def get_ai_service() -> AIService:
    """
    Factory pour obtenir le service d'IA configuré.
    Si le fournisseur change demain, on modifie juste cette factory.
    """
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY n'est pas configurée dans les variables d'environnement.")
        return GeminiAIService(api_key=api_key)
        
    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY n'est pas configurée dans les variables d'environnement.")
        from app.services.groq_service import GroqAIService
        return GroqAIService(api_key=api_key)
        
    else:
        raise NotImplementedError(f"Le fournisseur d'IA '{provider}' n'est pas supporté.")
