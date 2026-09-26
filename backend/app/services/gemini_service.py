import json
import logging
import asyncio
from typing import Dict, Any
from google import genai
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

class GeminiAIService(AIService):
    def __init__(self, api_key: str):
        # Le SDK lit normalement GEMINI_API_KEY depuis l'environnement
        self.client = genai.Client()
        self.model = "gemini-3.8-flash"

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        """Méthode interne réutilisable pour appeler Gemini et extraire du JSON."""
        try:
            def make_call():
                return self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
                
            response = await asyncio.to_thread(make_call)
            text = (response.text or "").strip()
            
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text.strip())
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération avec Gemini: {str(e)}")
            raise e

    async def generate_cover_letter(self, profile_data: Dict[str, Any], job_description: str) -> Dict[str, str]:
        prompt = f"""
Tu es un expert en recrutement très qualifié.
Ta mission est de rédiger une lettre de motivation percutante, professionnelle et humaine pour cette offre d'emploi, en utilisant le profil fourni.

PROFIL DU CANDIDAT :
{json.dumps(profile_data, ensure_ascii=False, indent=2)}

OFFRE D'EMPLOI :
{job_description}

INSTRUCTIONS IMPORTANTES :
1. La lettre doit répondre directement aux besoins de l'offre en mettant en valeur les compétences et expériences du candidat de façon fluide.
2. Ne mens pas et n'invente pas de fausses expériences.
3. Fournis UNIQUEMENT une réponse au format JSON strict et valide.
4. Les clés du JSON doivent être :
  - "subject": L'objet de la candidature
  - "salutation": La formule d'appel (ex: "Madame, Monsieur,")
  - "body": Le corps de la lettre. TRÈS IMPORTANT : il doit être concis et aller droit au but, réparti en 2 ou 3 paragraphes MAXIMUM. Évite le bavardage inutile pour que la lettre tienne parfaitement sur une seule page A4.
  - "closing": La formule de politesse finale (ex: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.")

RÉPONSE ATTENDUE (JSON Vierge) :
{{
  "subject": "...",
  "salutation": "...",
  "body": "...",
  "closing": "..."
}}
"""
        return await self._generate_json(prompt)

    async def generate_public_bio(self, profile_data: Dict[str, Any], target_audience: str) -> Dict[str, str]:
        prompt = f"""
Tu es un copywriter expert en personal branding et en SEO.
Ta mission est de rédiger un "Elevator Pitch" (une bio d'accroche) pour la page web publique du candidat, ainsi qu'une description SEO.

CIBLE / AUDIENCE : {target_audience}

PROFIL DU CANDIDAT :
{json.dumps(profile_data, ensure_ascii=False, indent=2)}

INSTRUCTIONS IMPORTANTES :
1. Rédige une 'custom_bio' percutante, vendeuse et professionnelle qui donne envie d'en savoir plus. Ce texte sera affiché tout en haut de la page web du candidat. Longueur: 3 à 5 phrases courtes.
2. Rédige une 'seo_description' optimisée pour Google (maximum 155 caractères) résumant parfaitement le profil.
3. Fournis UNIQUEMENT une réponse au format JSON strict et valide.

RÉPONSE ATTENDUE :
{{
  "custom_bio": "...",
  "seo_description": "..."
}}
"""
        return await self._generate_json(prompt)

    async def generate_slug_suggestions(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        name = f"{profile_data.get('first_name', '')} {profile_data.get('last_name', '')}".strip()
        title = profile_data.get('title', '')
        prompt = f"""
Tu es un expert en personal branding web.
Génère exactement 3 suggestions pour chacun de ces 2 champs, pour la page publique de ce candidat.

NOM : {name}
TITRE / POSTE : {title}

CHAMP 1 - "slug" (URL publique) :
- Uniquement des lettres minuscules sans accents (a-z), des chiffres (0-9) et des tirets (-)
- Longueur entre 5 et 50 caractères
- Pas de tirets consécutifs (--)
- Ne pas commencer ou finir par un tiret
- Exemples : "jean-dupont-dev", "marie-martin-design"

CHAMP 2 - "title" (Nom interne de la page, visible uniquement par l'utilisateur) :
- Doit être court, lisible et professionnel (ex: "CV Dev Senior", "Portfolio Freelance", "Profil Ingénieur Data")
- Longueur entre 5 et 50 caractères

Fournis UNIQUEMENT une réponse au format JSON strict et valide.

RÉPONSE ATTENDUE :
{{
  "suggestions": ["slug-1", "slug-2", "slug-3"],
  "titles": ["Titre 1", "Titre 2", "Titre 3"]
}}
"""
        return await self._generate_json(prompt)
