from fastapi.testclient import TestClient
from app.core.config import settings

def test_root_endpoint(client: TestClient):
    """Teste le endpoint racine de l'API."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert settings.PROJECT_NAME in data["message"]
