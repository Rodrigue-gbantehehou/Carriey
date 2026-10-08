import pytest
import os
from unittest.mock import patch, AsyncMock
from datetime import datetime, timedelta
from app.models.user import User, UserRole
from app.models.template import Template
from app.models.payment import Payment, PaymentStatus, PaymentProvider
from app.core.security import get_password_hash
from app.core.config import settings

@pytest.fixture
def auth_user(db_session, client):
    user = User(
        email="e2e_test@example.com",
        full_name="E2E Test User",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    response = client.post(f"{settings.API_STR}/auth/login", data={"username": "e2e_test@example.com", "password": "password123"})
    token = response.json()["access_token"]
    
    return {"user": user, "token": token, "headers": {"Authorization": f"Bearer {token}"}}

@pytest.fixture
def sample_template(db_session):
    template = Template(
        name="Pro E2E",
        slug="pro-e2e",
        price=1500.0,
        folder_name="pro-e2e",
        definition={}
    )
    db_session.add(template)
    db_session.commit()
    db_session.refresh(template)
    return template

def test_e2e_full_payment_flow(client, db_session, auth_user, sample_template):
    """
    Test automatisé complet : Utilisateur → achat → paiement → webhook → droit → export premium
    """
    original_getenv = os.getenv
    def mock_getenv(key, default=None):
        if key == "PDF_SERVICE_URL": return "http://fake-pdf-service"
        return original_getenv(key, default)

    with patch("app.services.fedapay.fedapay_service.create_transaction", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = {"transaction_id": 99999, "token": "tok_xyz", "url": "http://sandbox.fedapay/checkout"}
        
        # 1. Utilisateur -> achat (création du checkout)
        res_create = client.post(
            f"{settings.API_STR}/payments/create",
            headers=auth_user["headers"],
            json={
                "template_id": sample_template.id,
                "amount": 1500.0,
                "currency": "XOF",
                "provider": "fedapay"
            }
        )
        assert res_create.status_code == 200
        payment_id = res_create.json()["payment_id"]
        
        # Le paiement est en statut PENDING
        payment = db_session.query(Payment).filter(Payment.id == payment_id).first()
        assert payment.status == PaymentStatus.PENDING

        # 2. Paiement -> Webhook FedaPay
        payload = {
            "entity": {
                "id": 99999,
                "status": "approved",
                "amount": 1500.0
            }
        }
        res_webhook = client.post(
            f"{settings.API_STR}/payments/webhook/fedapay",
            headers={"Feda_WebHook_Key": settings.FEDA_WEBHOOK_KEY or "A12LUpr3MdbBin15GyGhmtgGbdj"},
            json=payload
        )
        assert res_webhook.status_code == 200
        
        db_session.refresh(payment)
        assert payment.status == PaymentStatus.SUCCESS

        # 3. Droit -> Export Premium
        with patch("os.getenv", side_effect=mock_getenv):
            with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_pdf:
                class MockResponse:
                    status_code = 200
                    content = b"PDF_CONTENT"
                    def raise_for_status(self): pass
                mock_pdf.return_value = MockResponse()
                
                res_export = client.post(
                    f"{settings.API_STR}/exports/export/pdf",
                    headers=auth_user["headers"],
                    json={
                        "html_content": "<h1>Test</h1>",
                        "template_name": sample_template.slug,
                        "data": {},
                        "payment_id": payment.id
                    }
                )
                assert res_export.status_code == 200
                db_session.refresh(payment)
                # Le paiement reste en SUCCESS car le webhook a déjà donné l'accès 
                # (la logique CONSUMED s'applique quand l'export valide le paiement dynamiquement)
                assert payment.status == PaymentStatus.SUCCESS

def test_export_utilisateur_gratuit(client, db_session, auth_user):
    """
    Test utilisateur gratuit : Template avec price=0 ne nécessite pas de paiement.
    """
    free_template = Template(
        name="Free Template",
        slug="free-template",
        price=0,
        folder_name="free-template",
        definition={}
    )
    db_session.add(free_template)
    db_session.commit()
    db_session.refresh(free_template)
    
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
            
            res_export = client.post(
                f"{settings.API_STR}/exports/export/pdf",
                headers=auth_user["headers"],
                json={
                    "html_content": "<h1>Test</h1>",
                    "template_name": free_template.slug,
                    "data": {}
                }
            )
            assert res_export.status_code == 200

def test_export_utilisateur_pro(client, db_session, auth_user, sample_template):
    """
    Test utilisateur PRO : L'utilisateur a un abonnement premium actif, donc il a accès au template payant sans payer.
    """
    # Rendre l'utilisateur PRO
    user = auth_user["user"]
    user.premium_until = datetime.now() + timedelta(days=30)
    db_session.commit()
    
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
            
            # Export sans fournir de payment_id car il est PRO
            res_export = client.post(
                f"{settings.API_STR}/exports/export/pdf",
                headers=auth_user["headers"],
                json={
                    "html_content": "<h1>Test</h1>",
                    "template_name": sample_template.slug,
                    "data": {}
                }
            )
            assert res_export.status_code == 200
