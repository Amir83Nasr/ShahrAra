"""users: profile avatar

Revision ID: c1d2e3f4a5b6
Revises: 9b1f2c3d4e5f
Create Date: 2026-11-09 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c1d2e3f4a5b6"
down_revision: str | Sequence[str] | None = "9b1f2c3d4e5f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Store an optional profile picture on the user row."""
    op.add_column("users", sa.Column("avatar", sa.LargeBinary(), nullable=True))
    op.add_column("users", sa.Column("avatar_mime", sa.String(), nullable=True))
    op.add_column(
        "users", sa.Column("avatar_updated_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    """Remove the stored profile picture."""
    op.drop_column("users", "avatar_updated_at")
    op.drop_column("users", "avatar_mime")
    op.drop_column("users", "avatar")
