"""otp auth: users password_hash + otp_codes

Revision ID: 3bdb40744962
Revises: 7ff0a049f979
Create Date: 2026-09-06 21:40:35.616510

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3bdb40744962"
down_revision: str | Sequence[str] | None = "7ff0a049f979"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add password sign-in and one-time codes to the initial schema."""
    op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))

    op.create_table(
        "otp_codes",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("code_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=True),
        sa.Column("consumed", sa.Boolean(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_otp_codes_phone"), "otp_codes", ["phone"], unique=False)


def downgrade() -> None:
    """Remove one-time codes and the password hash column."""
    op.drop_index(op.f("ix_otp_codes_phone"), table_name="otp_codes")
    op.drop_table("otp_codes")
    op.drop_column("users", "password_hash")
