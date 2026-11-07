"""Create or promote the administrator account explicitly.

Usage:
    python -m scripts.create_admin --phone 09123456789 --national-id 1234567890
"""

from __future__ import annotations

import argparse

from app.core.config import (
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_NATIONAL_ID,
    ADMIN_PHONE,
)
from app.db.session import SessionLocal
from app.models.models import User


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or promote an administrator")
    parser.add_argument("--phone", default=ADMIN_PHONE)
    parser.add_argument("--national-id", default=ADMIN_NATIONAL_ID)
    parser.add_argument("--first-name", default=ADMIN_FIRST_NAME)
    parser.add_argument("--last-name", default=ADMIN_LAST_NAME)
    args = parser.parse_args()

    if not args.phone or not args.national_id:
        raise SystemExit(
            "--phone and --national-id are required (or set ADMIN_PHONE / "
            "ADMIN_NATIONAL_ID in the environment)."
        )

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.phone == args.phone).first()
        if user is None:
            user = User(
                phone=args.phone,
                national_id=args.national_id,
                first_name=args.first_name,
                last_name=args.last_name,
                is_admin=True,
            )
            db.add(user)
            action = "created"
        else:
            user.is_admin = True
            user.national_id = args.national_id or user.national_id
            user.first_name = args.first_name or user.first_name
            user.last_name = args.last_name or user.last_name
            action = "promoted"
        db.commit()
        print(f"Administrator {action}: {args.phone}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
