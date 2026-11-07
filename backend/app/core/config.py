import os
import warnings

from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
IS_PRODUCTION = APP_ENV == "production"

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/shahr_ara"
)
# SQLAlchemy needs the driver segment; Neon-style URLs come as plain postgresql://.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Migrations (alembic) must use the direct, non-pooled URL — Neon's PgBouncer
# pooler breaks DDL and session state. Falls back to DATABASE_URL in dev.
DATABASE_URL_UNPOOLED = os.getenv("DATABASE_URL_UNPOOLED") or DATABASE_URL

# Admin bootstrap values. They are intentionally empty by default: creating an
# administrator must be an explicit ops action (seed or scripts/create_admin.py),
# never a side effect of a public auth request.
ADMIN_PHONE = os.getenv("ADMIN_PHONE", "")
ADMIN_NATIONAL_ID = os.getenv("ADMIN_NATIONAL_ID", "")
ADMIN_FIRST_NAME = os.getenv("ADMIN_FIRST_NAME", "مدیر")
ADMIN_LAST_NAME = os.getenv("ADMIN_LAST_NAME", "سامانه")
# Development convenience only. Keep false in production.
AUTO_CREATE_ADMIN = os.getenv("AUTO_CREATE_ADMIN", "false").lower() == "true"

_JWT_SECRET_DEFAULT = "shahr-ara-dev-secret-change-in-production"
JWT_SECRET = os.getenv("JWT_SECRET", _JWT_SECRET_DEFAULT)
if JWT_SECRET == _JWT_SECRET_DEFAULT:
    if IS_PRODUCTION:
        raise RuntimeError(
            "JWT_SECRET is still the development default. "
            "Set a strong, unique JWT_SECRET before running in production."
        )
    warnings.warn(
        "JWT_SECRET is not set — using an insecure development default. "
        "Set JWT_SECRET in your environment before deploying to production.",
        stacklevel=1,
    )
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

# ── OTP ────────────────────────────────────────────────────
# DEV MODE returns the code in the API response instead of sending SMS.
# Production must never turn this on: doing so is a startup error.
OTP_EXPIRATION_MINUTES = int(os.getenv("OTP_EXPIRATION_MINUTES", "2"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
_OTP_DEV_DEFAULT = "false" if IS_PRODUCTION else "true"
OTP_DEV_MODE = os.getenv("OTP_DEV_MODE", _OTP_DEV_DEFAULT).strip().lower() == "true"
if IS_PRODUCTION and OTP_DEV_MODE:
    raise RuntimeError(
        "OTP_DEV_MODE must be false in production. "
        "Configure a real SMS provider before accepting live traffic."
    )
if IS_PRODUCTION and AUTO_CREATE_ADMIN:
    raise RuntimeError(
        "AUTO_CREATE_ADMIN must be false in production. "
        "Create the administrator explicitly with scripts/create_admin.py."
    )

# Comma-separated list of allowed CORS origins.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost,http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.20:3000,http://192.168.1.21:3000",
    ).split(",")
    if origin.strip()
]
