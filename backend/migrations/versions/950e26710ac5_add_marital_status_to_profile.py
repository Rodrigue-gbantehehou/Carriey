"""Add marital_status to profile

Revision ID: 950e26710ac5
Revises: 56fb8f7e1806
Create Date: 2026-10-01 13:05:49.254879

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '950e26710ac5'
down_revision: Union[str, None] = '56fb8f7e1806'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ajoute la colonne marital_status à master_profiles (si absente)."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # Ajouter marital_status si absent
    existing_cols = [c['name'] for c in inspector.get_columns('master_profiles')]
    if 'marital_status' not in existing_cols:
        op.add_column('master_profiles', sa.Column('marital_status', sa.String(length=100), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_cols = [c['name'] for c in inspector.get_columns('master_profiles')]
    if 'marital_status' in existing_cols:
        op.drop_column('master_profiles', 'marital_status')
