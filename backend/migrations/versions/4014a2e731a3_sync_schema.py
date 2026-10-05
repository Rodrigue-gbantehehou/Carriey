"""sync_schema

Revision ID: 4014a2e731a3
Revises: 950e26710ac5
Create Date: 2026-10-01 14:27:41.177136

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4014a2e731a3'
down_revision: Union[str, None] = '950e26710ac5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """No-op : toutes les tables et FK sont déjà créées par la migration initiale (create_all)."""
    pass


def downgrade() -> None:
    pass
