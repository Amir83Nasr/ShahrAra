"""request foreign keys: cascade likes, null notifications

Revision ID: 9b1f2c3d4e5f
Revises: 3bdb40744962
Create Date: 2026-11-07 12:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9b1f2c3d4e5f"
down_revision: str | Sequence[str] | None = "3bdb40744962"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Give request child rows a safe delete behaviour."""
    op.execute("ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_request_id_fkey")
    op.create_foreign_key(
        "fk_likes_request_id",
        "likes",
        "requests",
        ["request_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_request_id_fkey")
    op.create_foreign_key(
        "fk_notifications_request_id",
        "notifications",
        "requests",
        ["request_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Restore the original foreign keys without delete behaviour."""
    op.drop_constraint("fk_likes_request_id", "likes", type_="foreignkey")
    op.create_foreign_key(
        "likes_request_id_fkey",
        "likes",
        "requests",
        ["request_id"],
        ["id"],
    )

    op.drop_constraint("fk_notifications_request_id", "notifications", type_="foreignkey")
    op.create_foreign_key(
        "notifications_request_id_fkey",
        "notifications",
        "requests",
        ["request_id"],
        ["id"],
    )
