import pytest
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta

from app.models.user import User
from app.services.ai_quota_service import check_and_consume_ai_quota, FREE_QUOTA_PER_DAY, PRO_QUOTA_PER_DAY

def test_ai_quota_free_user(db_session):
    user = User(email="free_quota@example.com", hashed_password="fake")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Simulate free quota usage up to limit
    for _ in range(FREE_QUOTA_PER_DAY):
        check_and_consume_ai_quota(db_session, user)
    
    assert user.ai_quota_used_today == FREE_QUOTA_PER_DAY

    # Next attempt should fail
    with pytest.raises(HTTPException) as exc:
        check_and_consume_ai_quota(db_session, user)
    
    assert exc.value.status_code == 429
    assert "limite d'utilisation de l'IA" in exc.value.detail


def test_ai_quota_pro_user(db_session):
    pro_user = User(
        email="pro_quota@example.com", 
        hashed_password="fake",
        premium_until=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db_session.add(pro_user)
    db_session.commit()
    db_session.refresh(pro_user)

    # Exceed free limit but should still succeed for PRO
    for _ in range(FREE_QUOTA_PER_DAY + 5):
        check_and_consume_ai_quota(db_session, pro_user)
        
    assert pro_user.ai_quota_used_today == FREE_QUOTA_PER_DAY + 5


def test_ai_quota_daily_reset(db_session):
    user = User(
        email="reset_quota@example.com",
        hashed_password="fake",
        ai_quota_used_today=FREE_QUOTA_PER_DAY,
        last_ai_usage_date=datetime.now(timezone.utc) - timedelta(days=1)
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Since last usage was yesterday, quota should reset to 0 then consume 1
    check_and_consume_ai_quota(db_session, user)
    assert user.ai_quota_used_today == 1
