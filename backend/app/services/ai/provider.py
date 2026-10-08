from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple


class LLMProvider(ABC):
    """
    Interface abstraite pour les fournisseurs de LLM (Gemini, Groq, OpenAI, etc.)
    
    Un provider est uniquement responsable d'envoyer un prompt brut et de
    retourner la réponse parsée en JSON. Toute logique métier (prompts,
    validation) est gérée par AIService.
    """

    @abstractmethod
    async def generate_json(self, prompt: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Envoie un prompt au LLM et retourne un tuple : (réponse parsée en JSON, métadonnées de consommation).
        
        Raises:
            RuntimeError("QUOTA_EXCEEDED") si le quota est dépassé.
            Exception pour toute autre erreur.
        """
        pass
