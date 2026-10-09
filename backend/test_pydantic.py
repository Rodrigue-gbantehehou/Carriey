import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app.schemas.auth import UserOut
from app.models.user import User, UserRole
from datetime import datetime
import uuid

def test_serialization():
    u = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed",
        role=UserRole.USER,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    try:
        out = UserOut.model_validate(u)
        print("Serialization success:", out.model_dump_json(indent=2))
    except Exception as e:
        print("Serialization failed:", e)

if __name__ == "__main__":
    test_serialization()
