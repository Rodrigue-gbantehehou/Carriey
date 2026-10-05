"""initial_schema

Revision ID: 56fb8f7e1806
Revises: 
Create Date: 2026-10-01 12:41:14.851648

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '56fb8f7e1806'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Crée toutes les tables à partir des modèles SQLAlchemy (checkfirst=True)."""
    from app.db.session import Base
    # Import all models so they are registered in Base.metadata
    import app.models.user
    import app.models.profile
    import app.models.persona
    import app.models.payment
    import app.models.resume
    import app.models.template
    import app.models.audit
    import app.models.public_page
    import app.models.candidature
    import app.models.subscription_plan

    bind = op.get_bind()
    Base.metadata.create_all(bind=bind, checkfirst=True)


def downgrade() -> None:
    """Supprime toutes les tables."""
    from app.db.session import Base
    import app.models.user
    import app.models.profile
    import app.models.persona
    import app.models.payment
    import app.models.resume
    import app.models.template
    import app.models.audit
    import app.models.public_page
    import app.models.candidature
    import app.models.subscription_plan

    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
