"""reset_template_prices

Remet tous les prix des templates a 0 (periode gratuite).

Revision ID: c1f9a3d72e80
Revises: 4014a2e731a3
Create Date: 2026-10-06 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'c1f9a3d72e80'
down_revision: Union[str, None] = '4014a2e731a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE templates SET price = 0")


def downgrade() -> None:
    pass

