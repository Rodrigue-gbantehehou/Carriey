"""
Tests des accès premium / PRO-001.

On vérifie que la propriété `is_pro` fonctionne correctement et que 
les accès sont refusés si l'abonnement est expiré.
"""
import pytest
from datetime import datetime, timedelta, timezone
from app.api.dependencies import get_db

pytestmark = pytest.mark.rights


def test_user_is_pro_property(make_user):
    """Test unitaire de la propriété is_pro sur le modèle User."""
    # 1. Gratuit
    free_user = make_user()
    assert free_user.premium_until is None
    assert free_user.is_pro is False
    
    # 2. PRO Actif
    pro_user = make_user(premium_days=30)
    assert pro_user.is_pro is True
    
    # 3. PRO Expiré
    expired_user = make_user(premium_days=-10)  # Expiré depuis 10 jours
    assert expired_user.is_pro is False


def test_ai_tailor_cv_requires_pro(client, db_session, make_user):
    """L'endpoint /ai/tailor-cv requiert un compte PRO actif."""
    from tests.conftest import API, headers_for
    
    free_user = make_user()
    pro_user = make_user(premium_days=30)
    expired_user = make_user(premium_days=-10)
    
    payload = {"job_description": "test", "target_role": "dev"}
    
    # 1. Gratuit -> Rejeté
    res_free = client.post(f"{API}/ai/tailor-cv", headers=headers_for(free_user), json=payload)
    assert res_free.status_code == 403
    
    # 2. PRO Expiré -> Rejeté
    res_expired = client.post(f"{API}/ai/tailor-cv", headers=headers_for(expired_user), json=payload)
    assert res_expired.status_code == 403
    
    # (Note: Le pro_user passera la vérification PRO mais échouera sur le profil manquant, code 400)
    res_pro = client.post(f"{API}/ai/tailor-cv", headers=headers_for(pro_user), json=payload)
    assert res_pro.status_code == 400 # Le gating est passé


def test_template_access_requires_pro(client, db_session, make_user, make_template):
    """L'accès à un template premium est accordé si l'utilisateur est PRO actif."""
    from tests.conftest import API, headers_for
    from app.services.template_access_service import TemplateAccessService
    
    free_user = make_user()
    pro_user = make_user(premium_days=30)
    expired_user = make_user(premium_days=-10)
    
    template = make_template(price=1000.0) # Modèle premium
    
    assert TemplateAccessService.check_user_access(db_session, free_user.id, template.id) is False
    assert TemplateAccessService.check_user_access(db_session, expired_user.id, template.id) is False
    
    # L'utilisateur PRO n'a pas forcément besoin de l'accès enregistré via payment
    # S'il a is_pro, check_user_access renvoie True.
    assert TemplateAccessService.check_user_access(db_session, pro_user.id, template.id) is True
