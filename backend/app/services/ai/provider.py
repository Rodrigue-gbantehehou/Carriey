from abc import ABC, abstractmethod
from typing import Dict, Any


class LLMProvider(ABC):
    """
    Interface abstraite pour les fournisseurs de LLM (Gemini, Groq, OpenAI, etc.)
    
    Un provider est uniquement responsable d'envoyer un prompt brut et de
    retourner la réponse parsée en JSON. Toute logique métier (prompts,
    validation) est gérée par AIService.
    """

    @abstractmethod
    async def generate_json(self, prompt: str) -> Dict[str, Any]:
        """
        Envoie un prompt au LLM et retourne la réponse parsée en JSON.
        
        Raises:
            RuntimeError("QUOTA_EXCEEDED") si le quota est dépassé.
            Exception pour toute autre erreur.
        """
        pass
