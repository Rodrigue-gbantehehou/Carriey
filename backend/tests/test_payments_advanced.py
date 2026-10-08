import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.models.user import User, UserRole
from app.models.template import Template
from app.models.payment import Payment, PaymentStatus, PaymentProvider
from app.core.security import get_password_hash
from app.core.config import settings

@pytest.fixture
def auth_user(db_session, client):
    user = User(
        email="test_pay@example.com",
        full_name="Test Pay",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    response = client.post(f"{settings.API_STR}/auth/login", data={"username": "test_pay@example.com", "password": "password123"})
    token = response.json()["access_token"]
    
    return {"user": user, "token": token, "headers": {"Authorization": f"Bearer {token}"}}

@pytest.fixture
def sample_template(db_session):
    template = Template(
        name="Pro Template",
        slug="pro-template",
        price=1500.0,
        folder_name="pro-template",
        definition={}
    )
    db_session.add(template)
    db_session.commit()
    db_session.refresh(template)
    return template

def test_fedapay_create_checkout(client, auth_user, sample_template):
    with patch("app.services.fedapay.fedapay_service.create_transaction", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = {"transaction_id": 12345, "token": "tok_xyz", "url": "http://sandbox.fedapay/checkout"}
        
        response = client.post(
            f"{settings.API_STR}/payments/create",
            headers=auth_user["headers"],
            json={
                "template_id": sample_template.id,
                "amount": 1500.0,
                "currency": "XOF",
                "provider": "fedapay"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["transaction_id"] == 12345
        assert data["status"] == "pending"

def test_fedapay_webhook_success(client, db_session, auth_user, sample_template):
    # Setup pending payment
    payment = Payment(
        user_id=auth_user["user"].id,
        template_id=sample_template.id,
        amount=1500.0,
        currency="XOF",
        provider=PaymentProvider.FEDAPAY,
        provider_payment_id="12345",
        status=PaymentStatus.PENDING
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(payment)

    # Webhook payload for fedapay success
    payload = {
        "entity": {
            "id": 12345,
            "status": "approved",
            "amount": 1500.0
        }
    }
    
    response = client.post(
        f"{settings.API_STR}/payments/webhook/fedapay",
        headers={"Feda_WebHook_Key": settings.FEDA_WEBHOOK_KEY or "wh_live_kvkCpzb5Zuh2mXydrkB84Zf8"},
        json=payload
    )
    assert response.status_code == 200
    db_session.refresh(payment)
    assert payment.status == PaymentStatus.SUCCESS
    assert payment.meta_data["paid_amount"] == 1500.0

def test_fedapay_webhook_amount_mismatch(client, db_session, auth_user, sample_template):
    # Setup pending payment
    payment = Payment(
        user_id=auth_user["user"].id,
        template_id=sample_template.id,
        amount=1500.0,
        currency="XOF",
        provider=PaymentProvider.FEDAPAY,
        provider_payment_id="99999",
        status=PaymentStatus.PENDING
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(payment)

    # Webhook payload for fedapay where user paid less
    payload = {
        "entity": {
            "id": 99999,
            "status": "approved",
            "amount": 500.0
        }
    }
    
    response = client.post(
        f"{settings.API_STR}/payments/webhook/fedapay",
        headers={"Feda_WebHook_Key": settings.FEDA_WEBHOOK_KEY or "A12LUpr3MdbBin15GyGhmtgGbdj"},
        json=payload
    )
    assert response.status_code == 400
    db_session.refresh(payment)
    assert payment.status == PaymentStatus.FAILED

def test_fedapay_webhook_cancelled(client, db_session, auth_user, sample_template):
    # Setup pending payment
    payment = Payment(
        user_id=auth_user["user"].id,
        template_id=sample_template.id,
        amount=1500.0,
        currency="XOF",
        provider=PaymentProvider.FEDAPAY,
        provider_payment_id="8888",
        status=PaymentStatus.PENDING
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(payment)

    payload = {
        "entity": {
            "id": 8888,
            "status": "canceled",
            "amount": 1500.0
        }
    }
    
    response = client.post(
        f"{settings.API_STR}/payments/webhook/fedapay",
        headers={"Feda_WebHook_Key": settings.FEDA_WEBHOOK_KEY or "A12LUpr3MdbBin15GyGhmtgGbdj"},
        json=payload
    )
    # The webhook returns 400 because the status is not success
    assert response.status_code == 400
    assert "non validé par le provider" in response.json()["detail"]
    db_session.refresh(payment)
    # The webhook logic for failed transaction does not necessarily mark it as failed in DB
    # Currently it just raises an exception. In a real system it could update it to FAILED.
    # We just ensure it rejects it.

def test_payment_consumed_status(client, db_session, auth_user, sample_template):
    # Test that a payment in SUCCESS status allows export and gets consumed
    payment = Payment(
        user_id=auth_user["user"].id,
        template_id=sample_template.id,
        amount=1500.0,
        currency="XOF",
        provider=PaymentProvider.FEDAPAY,
        provider_payment_id="7777",
        status=PaymentStatus.SUCCESS
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(payment)

    # Call export endpoint which should consume the payment
    import os
    original_getenv = os.getenv
    def mock_getenv(key, default=None):
        if key == "PDF_SERVICE_URL": return "http://fake-pdf-service"
        return original_getenv(key, default)
        
    with patch("os.getenv", side_effect=mock_getenv):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_pdf:
            class MockResponse:
                status_code = 200
                content = b"PDF_CONTENT"
                def raise_for_status(self): pass
            mock_pdf.return_value = MockResponse()
            
            response = client.post(
                f"{settings.API_STR}/exports/export/pdf",
                headers=auth_user["headers"],
                json={
                    "html_content": "<h1>Test</h1>",
                    "template_name": sample_template.slug,
                    "data": {},
                    "payment_id": payment.id
                }
            )
            assert response.status_code == 200
            db_session.refresh(payment)
            assert payment.status == PaymentStatus.CONSUMED

            # Revoke access to force the endpoint to evaluate the payment again
            from app.services.template_access_service import TemplateAccessService
            TemplateAccessService.revoke_access(db_session, payment.user_id, payment.template_id)

            # Second attempt should fail with 400 because it's consumed
            response2 = client.post(
                f"{settings.API_STR}/exports/export/pdf",
                headers=auth_user["headers"],
                json={
                    "html_content": "<h1>Test</h1>",
                    "template_name": sample_template.slug,
                    "data": {},
                    "payment_id": payment.id
                }
            )
            assert response2.status_code == 400
            assert "déjà été utilisé" in response2.json()["detail"]


