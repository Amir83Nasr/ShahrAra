import os
import warnings

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shahr_ara.db")

ADMIN_PHONE = os.getenv("ADMIN_PHONE", "09000000000")
ADMIN_NATIONAL_ID = os.getenv("ADMIN_NATIONAL_ID", "037000000")
ADMIN_FIRST_NAME = os.getenv("ADMIN_FIRST_NAME", "Admin")
ADMIN_LAST_NAME = os.getenv("ADMIN_LAST_NAME", "Admin")

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

# Comma-separated list of allowed CORS origins.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost,http://localhost:3000,http://192.168.1.21",
    ).split(",")
    if origin.strip()
]
