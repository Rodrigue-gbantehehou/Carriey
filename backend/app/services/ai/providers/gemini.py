import json
import logging
import asyncio
from typing import Dict, Any
from google import genai
from app.services.ai.provider import LLMProvider

logger = logging.getLogger(__name__)


class GeminiProvider(LLMProvider):
    """
    Provider Gemini — appel API Google Gemini uniquement.
    Aucune logique métier, aucun prompt ici.
    """

    def __init__(self):
        # Le SDK lit GEMINI_API_KEY depuis l'environnement automatiquement
        self.client = genai.Client()
        self.model = "gemini-2.0-flash"

    async def generate_json(self, prompt: str) -> Dict[str, Any]:
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
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                raise RuntimeError("QUOTA_EXCEEDED")
            logger.error(f"[GeminiProvider] Erreur: {err_str}")
            raise
