import os
import warnings

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/shahr_ara"
)
# SQLAlchemy needs the driver segment; Neon-style URLs come as plain postgresql://.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Migrations (alembic) must use the direct, non-pooled URL — Neon's PgBouncer
# pooler breaks DDL and session state. Falls back to DATABASE_URL in dev.
DATABASE_URL_UNPOOLED = os.getenv("DATABASE_URL_UNPOOLED") or DATABASE_URL

ADMIN_PHONE = os.getenv("ADMIN_PHONE", "09306853363")
ADMIN_NATIONAL_ID = os.getenv("ADMIN_NATIONAL_ID", "0372660673")
ADMIN_FIRST_NAME = os.getenv("ADMIN_FIRST_NAME", "امیرحسین")
ADMIN_LAST_NAME = os.getenv("ADMIN_LAST_NAME", "نصراللهی")

_JWT_SECRET_DEFAULT = "shahr-ara-dev-secret-change-in-production"
JWT_SECRET = os.getenv("JWT_SECRET", _JWT_SECRET_DEFAULT)
if JWT_SECRET == _JWT_SECRET_DEFAULT:
    warnings.warn(
        "JWT_SECRET is not set — using an insecure development default. "
        "Set JWT_SECRET in your environment before deploying to production.",
        stacklevel=1,
    )
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

# ── OTP ────────────────────────────────────────────────────
# DEV MODE returns the code in the API response instead of sending SMS.
# NEVER set OTP_DEV_MODE=true in production.
OTP_EXPIRATION_MINUTES = int(os.getenv("OTP_EXPIRATION_MINUTES", "5"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_DEV_MODE = os.getenv("OTP_DEV_MODE", "true").lower() == "true"

# Comma-separated list of allowed CORS origins.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost,http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.20:3000,http://192.168.1.21:3000",
    ).split(",")
    if origin.strip()
]
