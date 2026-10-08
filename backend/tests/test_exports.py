"""
Tests des routes d'export PDF et DOCX (TECH-002).

On vérifie :
- L'appel aux services de génération externes (via mock HTTPX défini dans conftest).
- La génération locale en fallback (désactivée/mockée ici pour vitesse et fiabilité).
- La création de comptes invités avec envoi du mot de passe.
- Les accès payants (gating).
"""
import pytest
from app.models.payment import PaymentStatus
from tests.conftest import API, headers_for

pytestmark = pytest.mark.export


def test_export_pdf_free_template_success(client, make_user, make_template, export_dirs, pdf_service):
    """L'export d'un modèle gratuit fonctionne pour un utilisateur authentifié et écrit un cache."""
    user = make_user()
    template = make_template(price=0.0)

    res = client.post(
        f"{API}/exports/export/pdf",
        headers=headers_for(user),
        json={"template_name": template.slug, "data": {"name": "Alice"}},
    )
    
    assert res.status_code == 200
    data = res.json()
    assert "file" in data and "url" in data
    assert data["url"].startswith(f"{API}/exports/download/")
    
    # Vérification que le cache est bien créé dans le répertoire temporaire (via la fixture)
    cache_files = list(export_dirs["cache"].glob("*.json"))
    assert len(cache_files) == 1
    
    # Vérification de l'appel HTTPX vers le service Render
    pdf_service.assert_called_once()
    assert pdf_service.call_args[1]["json"]["url"].startswith("http://frontend.test/print?id=")


def test_export_pdf_premium_template_without_payment_fails(client, make_user, make_template):
    """Un utilisateur ne peut pas exporter un modèle payant sans fournir de payment_id valide."""
    user = make_user()
    template = make_template(price=1000.0)

    res = client.post(
        f"{API}/exports/export/pdf",
        headers=headers_for(user),
        json={"template_name": template.slug, "data": {}},
    )
    
    assert res.status_code == 402
    assert "Paiement requis" in res.json()["detail"]


def test_export_pdf_premium_template_with_consumed_payment_fails(
    client, make_user, make_template, make_payment
):
    """Un paiement qui a déjà servi (CONSUMED) ne peut pas être réutilisé pour exporter."""
    user = make_user()
    template = make_template(price=1000.0)
    payment = make_payment(user, template, status=PaymentStatus.CONSUMED)

    res = client.post(
        f"{API}/exports/export/pdf",
        headers=headers_for(user),
        json={"template_name": template.slug, "data": {}, "payment_id": payment.id},
    )
    
    assert res.status_code == 400
    assert "déjà été utilisé" in res.json()["detail"]


def test_export_pdf_premium_template_with_valid_payment_consumes_it(
    client, db_session, make_user, make_template, make_payment, pdf_service
):
    """Un paiement SUCCESS est consommé lors de l'export d'un modèle premium."""
    user = make_user()
    template = make_template(price=1000.0)
    payment = make_payment(user, template, status=PaymentStatus.SUCCESS)

    res = client.post(
        f"{API}/exports/export/pdf",
        headers=headers_for(user),
        json={"template_name": template.slug, "data": {}, "payment_id": payment.id},
    )
    
    assert res.status_code == 200
    db_session.refresh(payment)
    assert payment.status == PaymentStatus.CONSUMED


def test_export_guest_user_creates_account_and_sends_email(
    client, db_session, make_template, pdf_service, mailer
):
    """Un invité sans compte se voit créer un compte et un email lui est envoyé avec le mot de passe."""
    template = make_template(price=0.0)
    
    res = client.post(
        f"{API}/exports/export/pdf",
        json={"template_name": template.slug, "data": {}, "guest_email": "guest@test.carriey", "guest_name": "John Doe"},
    )
    
    assert res.status_code == 200
    assert "url" in res.json()

    # Vérification que le compte a bien été créé en base
    from app.models.user import User
    new_user = db_session.query(User).filter(User.email == "guest@test.carriey").first()
    assert new_user is not None

    # L'email de bienvenue doit avoir été envoyé avec un lien de setup (token)
    assert mailer["send_welcome_and_cv"].called
    kwargs = mailer["send_welcome_and_cv"].call_args[1]
    assert kwargs["recipient_email"] == "guest@test.carriey"
    assert "set-password?token=" in kwargs["setup_link"]
