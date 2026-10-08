import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

from app.models.payment import PaymentStatus
from tests.conftest import API, headers_for

pytestmark = pytest.mark.payment

WEBHOOK_URL = f"{API}/payments/webhook/fedapay"
CREATE_URL = f"{API}/payments/create"
HISTORY_URL = f"{API}/payments/history"


def _p(tid, amount):
    return {"entity": {"id": tid, "status": "approved", "amount": amount}}


def _h():
    return {"Feda_WebHook_Key": "test-feda-webhook-key"}


def test_create_rejects_tampered_amount(client, make_user, make_template):
    """P1 - Le backend rejette toute creation si le montant ne correspond pas au prix du template."""
    user = make_user()
    t = make_template(price=1500.0)
    res = client.post(
        CREATE_URL,
        headers=headers_for(user),
        json={"template_id": t.id, "amount": 1.0, "currency": "XOF", "provider": "fedapay"},
    )
    assert res.status_code == 400
    assert "ne correspond pas" in res.json()["detail"].lower()


def test_webhook_rejects_invalid_signature(client, make_user, make_template, make_payment):
    """P2 - Webhook FedaPay avec cle incorrecte refuse (403)."""
    u = make_user()
    t = make_template(price=1000.0)
    make_payment(u, t, status=PaymentStatus.PENDING, provider_payment_id="txn_bad")
    res = client.post(WEBHOOK_URL, headers={"Feda_WebHook_Key": "BAD"}, json=_p("txn_bad", 1000.0))
    assert res.status_code == 403


def test_webhook_valid_sets_success(client, db_session, make_user, make_template, make_payment):
    """P3 - Webhook authentifie met le paiement en SUCCESS."""
    u = make_user()
    t = make_template(price=2000.0)
    pay = make_payment(u, t, status=PaymentStatus.PENDING, provider_payment_id="txn_ok")
    with patch(
        "app.services.payments.providers.fedapay_provider.FedaPayProvider.handle_webhook",
        new_callable=AsyncMock,
        return_value={"status": "success", "transaction_id": "txn_ok", "metadata": {"amount": 2000.0}},
    ):
        res = client.post(WEBHOOK_URL, headers=_h(), json=_p("txn_ok", 2000.0))
    assert res.status_code == 200
    db_session.refresh(pay)
    assert pay.status == PaymentStatus.SUCCESS


def test_webhook_rejects_amount_mismatch(client, db_session, make_user, make_template, make_payment):
    """P4 - Webhook valide en signature mais montant different -> FAILED."""
    u = make_user()
    t = make_template(price=3000.0)
    pay = make_payment(u, t, status=PaymentStatus.PENDING, provider_payment_id="txn_fraud")
    with patch(
        "app.services.payments.providers.fedapay_provider.FedaPayProvider.handle_webhook",
        new_callable=AsyncMock,
        return_value={"status": "success", "transaction_id": "txn_fraud", "metadata": {"amount": 1.0}},
    ):
        res = client.post(WEBHOOK_URL, headers=_h(), json=_p("txn_fraud", 1.0))
    assert res.status_code == 400
    db_session.refresh(pay)
    assert pay.status == PaymentStatus.FAILED


def test_webhook_idempotent(client, make_user, make_template, make_payment):
    """P5 - Webhook recu deux fois n accorde pas l acces deux fois."""
    u = make_user()
    t = make_template(price=1500.0)
    make_payment(u, t, status=PaymentStatus.SUCCESS, provider_payment_id="txn_idem")
    with patch(
        "app.services.payments.providers.fedapay_provider.FedaPayProvider.handle_webhook",
        new_callable=AsyncMock,
        return_value={"status": "success", "transaction_id": "txn_idem", "metadata": {"amount": 1500.0}},
    ):
        with patch("app.services.template_access_service.TemplateAccessService.grant_access") as mg:
            res = client.post(WEBHOOK_URL, headers=_h(), json=_p("txn_idem", 1500.0))
    assert res.status_code == 200
    mg.assert_not_called()


def test_webhook_grants_access(client, make_user, make_template, make_payment):
    """P6 - Apres un webhook valide sur achat template, TemplateAccess est cree."""
    u = make_user()
    t = make_template(price=2500.0)
    make_payment(u, t, status=PaymentStatus.PENDING, provider_payment_id="txn_acc")
    with patch(
        "app.services.payments.providers.fedapay_provider.FedaPayProvider.handle_webhook",
        new_callable=AsyncMock,
        return_value={"status": "success", "transaction_id": "txn_acc", "metadata": {"amount": 2500.0}},
    ):
        with patch("app.services.template_access_service.TemplateAccessService.grant_access") as mg:
            res = client.post(WEBHOOK_URL, headers=_h(), json=_p("txn_acc", 2500.0))
    assert res.status_code == 200
    mg.assert_called_once()
    assert mg.call_args[1]["user_id"] == u.id
    assert mg.call_args[1]["template_id"] == t.id


def test_webhook_activates_pro_sub(client, db_session, make_user, make_payment):
    """P7 - Webhook sur plan_code active premium_until sur l utilisateur."""
    from app.models.subscription_plan import SubscriptionPlan
    plan = SubscriptionPlan(code="pro-30", name="PRO 30j", price=5000.0, duration_days=30, is_active=True)
    db_session.add(plan)
    db_session.commit()
    u = make_user()
    assert u.premium_until is None
    make_payment(u, None, plan_code="pro-30", amount=5000.0, status=PaymentStatus.PENDING, provider_payment_id="txn_sub")
    with patch(
        "app.services.payments.providers.fedapay_provider.FedaPayProvider.handle_webhook",
        new_callable=AsyncMock,
        return_value={"status": "success", "transaction_id": "txn_sub", "metadata": {"amount": 5000.0}},
    ):
        res = client.post(WEBHOOK_URL, headers=_h(), json=_p("txn_sub", 5000.0))
    assert res.status_code == 200
    db_session.refresh(u)
    assert u.premium_until is not None
    assert u.premium_until > datetime.now() + timedelta(days=29)


def test_idor_payment_status(client, make_user, make_template, make_payment):
    """P9 - IDOR : un utilisateur ne peut pas voir le paiement d un autre."""
    owner = make_user()
    attacker = make_user()
    t = make_template(price=1000.0)
    pay = make_payment(owner, t, status=PaymentStatus.SUCCESS)
    res = client.get(f"{API}/payments/{pay.id}/status", headers=headers_for(attacker))
    assert res.status_code == 404


def test_history_is_scoped(client, make_user, make_template, make_payment):
    """P10 - Historique retourne uniquement les paiements de l utilisateur connecte."""
    a = make_user()
    b = make_user()
    t = make_template(price=1000.0)
    make_payment(a, t, status=PaymentStatus.SUCCESS)
    make_payment(a, t, status=PaymentStatus.PENDING)
    make_payment(b, t, status=PaymentStatus.SUCCESS)
    res = client.get(HISTORY_URL, headers=headers_for(a))
    assert res.status_code == 200
    assert len(res.json()["payments"]) == 2
