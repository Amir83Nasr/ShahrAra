import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shahr_ara.db")
ADMIN_PHONE = os.getenv("ADMIN_PHONE", "09120000000")
ADMIN_NATIONAL_ID = os.getenv("ADMIN_NATIONAL_ID", "1234567890")
