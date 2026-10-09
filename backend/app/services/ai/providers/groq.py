import json
import logging
import asyncio
from typing import Dict, Any, Tuple, Optional
from groq import Groq
from app.services.ai.provider import LLMProvider

logger = logging.getLogger(__name__)


class GroqProvider(LLMProvider):
    """
    Provider Groq — appel API Groq uniquement.
    Aucune logique métier, aucun prompt ici.
    """

    def __init__(self, api_key: str, model_name: Optional[str] = None):
        self.client = Groq(api_key=api_key)
        self.model = model_name if model_name else "openai/gpt-oss-120b"

    async def generate_json(self, prompt: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        try:
            def make_call():
                return self.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=self.model,
                    response_format={"type": "json_object"}
                )

            response = await asyncio.to_thread(make_call)
            text = (response.choices[0].message.content or "").strip()

            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]

            result_json = json.loads(text.strip())
            
            prompt_tokens = 0
            completion_tokens = 0
            if hasattr(response, "usage") and response.usage:
                prompt_tokens = getattr(response.usage, "prompt_tokens", 0)
                completion_tokens = getattr(response.usage, "completion_tokens", 0)
                
            metadata = {
                "model": self.model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens
            }
            return result_json, metadata

        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "rate limit" in err_str.lower():
                raise RuntimeError("QUOTA_EXCEEDED")
            logger.error(f"[GroqProvider] Erreur: {err_str}")
            raise
