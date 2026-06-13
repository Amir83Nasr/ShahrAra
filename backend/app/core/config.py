import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shahr_ara.db")

ADMIN_PHONE = os.getenv("ADMIN_PHONE", "09000000000")
ADMIN_NATIONAL_ID = os.getenv("ADMIN_NATIONAL_ID", "037000000")
ADMIN_FIRST_NAME = os.getenv("ADMIN_FIRST_NAME", "Admin")
ADMIN_LAST_NAME = os.getenv("ADMIN_LAST_NAME", "Admin")

JWT_SECRET = os.getenv("JWT_SECRET", "shahr-ara-dev-secret-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))
