"""Added is_pinned for achievement

Revision ID: d2b3c4e5f6a7
Revises: c1a2b3d4e5f6
Create Date: 2026-11-02 22:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2b3c4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'c1a2b3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('achievements', sa.Column('is_pinned', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('achievements', 'is_pinned')

