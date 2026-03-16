"""Added experience schema

Revision ID: a5a76c21820c
Revises: ce8be6bb5638
Create Date: 2026-03-16 14:51:40.514566

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a5a76c21820c'
down_revision: Union[str, Sequence[str], None] = 'ce8be6bb5638'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
