from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union, Any
import os
import json

class Settings(BaseSettings):
    # Testing if Union[str, List[str]] bypasses automatic JSON decoding
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        print(f"Validator received: {v} (type: {type(v)})")
        if isinstance(v, str):
            if v.startswith("["):
                return json.loads(v)
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(case_sensitive=True)

print("--- Test 1: Comma-separated string in ENV ---")
os.environ["BACKEND_CORS_ORIGINS"] = "http://a.com,http://b.com"
try:
    s = Settings()
    print(f"Result: {s.BACKEND_CORS_ORIGINS}")
except Exception as e:
    print(f"Caught expected error: {e}")

print("\n--- Test 2: JSON list in ENV ---")
os.environ["BACKEND_CORS_ORIGINS"] = '["http://a.com","http://b.com"]'
try:
    s = Settings()
    print(f"Result: {s.BACKEND_CORS_ORIGINS}")
except Exception as e:
    print(f"Error: {e}")
