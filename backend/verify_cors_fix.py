from typing import List, Union, Any
import json

# Simulated field_validator logic from backend/config.py
def assemble_cors_origins(v: Union[str, List[str]]) -> Union[List[str], str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, (list, str)):
        if isinstance(v, str):
            return json.loads(v)
        return v
    raise ValueError(v)

# Test cases
test_cases = [
    # Case 1: JSON list (current local .env behavior)
    '["http://localhost:3000", "http://localhost:5000"]',
    # Case 2: Comma-separated string (common Render/Env behavior)
    'https://cvtor.vercel.app, http://localhost:3000',
    # Case 3: Single URL string
    'https://cvtor.vercel.app',
    # Case 4: Already a list (default value behavior)
    ["http://localhost:5000", "http://localhost:3000"]
]

for i, case in enumerate(test_cases, 1):
    try:
        result = assemble_cors_origins(case)
        print(f"Test {i}: Input={case}")
        print(f"       Result={result}")
        assert isinstance(result, list)
        print(f"       ✅ Passed")
    except Exception as e:
        print(f"Test {i}: ❌ Failed with error: {e}")
