from abc import ABC, abstractmethod
from typing import Dict, Any

class AIService(ABC):
    """
    Interface abstraite pour les services d'IA générative.
    Ceci permet de changer facilement de fournisseur (Gemini, OpenAI, Mistral, etc.)
    """

    @abstractmethod
    async def generate_cover_letter(self, profile_data: Dict[str, Any], job_description: str) -> Dict[str, str]:
        """
        Génère une lettre de motivation.
        
        Doit retourner un dictionnaire contenant au minimum:
        - subject: L'objet de la lettre
        - salutation: La formule d'appel
        - body: Le corps du texte
        - closing: La formule de politesse
        """
        pass

    @abstractmethod
    async def generate_public_bio(self, profile_data: Dict[str, Any], target_audience: str) -> Dict[str, str]:
        """
        Génère une bio spécifique pour une page publique et une description SEO.
        Doit retourner:
        - custom_bio: Un pitch vendeur
        - seo_description: Une description courte (<160 chars) pour le SEO
        """
        pass

    @abstractmethod
    async def generate_slug_suggestions(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Génère des suggestions de slugs URL pour une page publique.
        Doit retourner:
        - suggestions: Liste de 3 slugs valides (lettres minuscules, chiffres, tirets)
        """
        pass

    @abstractmethod
    async def tailor_cv(self, profile_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        """
        Adapte un CV en fonction d'une offre d'emploi.
        Retourne un objet contenant 'summary' et 'experiences' (avec les ids modifiés).
        """
        pass
