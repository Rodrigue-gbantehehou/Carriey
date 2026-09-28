import json
import logging
import asyncio
from typing import Dict, Any
from groq import Groq
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

class GroqAIService(AIService):
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.model = "openai/gpt-oss-120b"

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        """Méthode interne réutilisable pour appeler Groq et extraire du JSON."""
        try:
            def make_call():
                return self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    model=self.model,
                    response_format={"type": "json_object"}
                )
                
            response = await asyncio.to_thread(make_call)
            text = response.choices[0].message.content or ""
            text = text.strip()
            
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text.strip())
            
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "rate limit" in err_str.lower():
                raise RuntimeError("QUOTA_EXCEEDED")
            logger.error(f"Erreur lors de la génération avec Groq: {err_str}")
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

RÉPONSE ATTENDUE :
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

    async def tailor_cv(self, profile_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        prompt = f"""
Tu es un expert en recrutement et en optimisation de CV.
Ton but est d'analyser le profil du candidat et de l'adapter spécifiquement pour l'offre d'emploi fournie.

PROFIL DU CANDIDAT :
{json.dumps(profile_data, ensure_ascii=False, indent=2)}

OFFRE D'EMPLOI :
{job_description}

INSTRUCTIONS :
1. Rédige une phrase d'accroche (summary) très ciblée pour ce poste (2-3 phrases max).
2. Reprends les expériences du candidat. Pour chaque expérience pertinente, adapte la "description" pour mettre en valeur les compétences et mots-clés pertinents pour l'offre.
3. Conserve les "id" exacts des expériences.
4. Identifie les sections complètes (ex: "projects", "certifications", "languages", "interests") qui sont HORS SUJET ou NON PERTINENTES pour cette offre et ajoute-les à "disabledSections". Note: ne désactive jamais "experience" ni "education".
5. Identifie les items spécifiques (expériences passées n'ayant aucun rapport, etc.) qui sont HORS SUJET et ajoute leurs IDs dans "disabledItems" sous leur catégorie (ex: "experiences", "educations", "skills").
6. Ne mens pas, n'invente pas de fausses compétences.

RÉPONSE ATTENDUE (JSON strictement valide) :
{{
  "summary": "...",
  "experiences": {{
    "id_experience_1": {{
      "description": "..."
    }}
  }},
  "disabledSections": ["projects"],
  "disabledItems": {{
    "experiences": ["id_exp_hors_sujet_1", "id_exp_hors_sujet_2"],
    "skills": ["id_skill_inutile"]
  }}
}}
"""
        return await self._generate_json(prompt)

    async def extract_job_details(self, job_text: str) -> Dict[str, str]:
        prompt = f"""
Tu es un assistant IA spécialisé dans l'analyse d'offres d'emploi.
Ta mission est d'extraire les informations clés à partir du texte brut ou de l'annonce collée par l'utilisateur.

TEXTE DE L'OFFRE :
{job_text}

INSTRUCTIONS :
1. Identifie le "companyName" (nom de l'entreprise). Si introuvable, mets "".
2. Identifie le "jobTitle" (intitulé du poste). Si introuvable, mets "".
3. Identifie la "location" (ville, pays, ou "Télétravail"). Si introuvable, mets "".
4. Fournis UNIQUEMENT une réponse au format JSON strict et valide.

RÉPONSE ATTENDUE :
{{
  "companyName": "...",
  "jobTitle": "...",
  "location": "..."
}}
"""
        return await self._generate_json(prompt)
