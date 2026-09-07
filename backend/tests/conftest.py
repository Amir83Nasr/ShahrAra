from __future__ import annotations

import os
from typing import Any

import pytest
from fastapi.testclient import TestClient

# Tests run against a dedicated test database on the dev Postgres (docker compose `db`).
# Requires `make db-up` (or a running Postgres at localhost:5432).
TEST_DB_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/shahr_ara_test"
os.environ.setdefault("DATABASE_URL", TEST_DB_URL)
os.environ["ADMIN_PHONE"] = "09120000000"
os.environ["ADMIN_NATIONAL_ID"] = "1234567890"
os.environ.setdefault("OTP_DEV_MODE", "true")


def _ensure_test_db() -> None:
    """Create the test database if missing (dev data stays untouched)."""
    from sqlalchemy import create_engine, text
    from sqlalchemy.engine.url import make_url

    url = make_url(TEST_DB_URL)
    admin = url.set(database="postgres")
    admin_engine = create_engine(admin, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :d"), {"d": url.database}
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{url.database}"'))
    finally:
        admin_engine.dispose()


_ensure_test_db()


@pytest.fixture(scope="session", autouse=True)
def _setup_db():
    import app.models.models  # noqa: F401 — must run before create_all
    from app.db.session import Base, engine

    # Tests create/drop schema directly — no migrations, deterministic setup.
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clean_db(_setup_db):
    yield
    from app.db.session import Base, SessionLocal

    db = SessionLocal()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    finally:
        db.close()


@pytest.fixture
def client():
    from main import app

    with TestClient(app) as c:
        yield c


@pytest.fixture
def user_data() -> dict[str, Any]:
    return {
        "phone": "09123456789",
        "nationalId": "1234567890",
        "firstName": "Ali",
        "lastName": "Rezaei",
    }


def otp_login(client: TestClient, phone: str, **profile: str) -> dict[str, Any]:
    """Full OTP flow: request a code (dev mode → devCode) and verify it."""
    r = client.post("/api/v1/auth/otp/request", json={"phone": phone})
    assert r.status_code == 200, r.text
    code = r.json()["devCode"]
    assert code, "OTP_DEV_MODE must be on in tests"
    payload: dict[str, Any] = {"phone": phone, "code": code, **profile}
    r = client.post("/api/v1/auth/otp/verify", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture
def registered_user(client, user_data):
    return otp_login(client, user_data["phone"], **{
        k: user_data[k] for k in ("nationalId", "firstName", "lastName")
    })


@pytest.fixture
def user_token(registered_user):
    return registered_user["token"]["accessToken"]


@pytest.fixture
def admin_token(client):
    return otp_login(client, "09120000000")["token"]["accessToken"]


@pytest.fixture
def sample_request_data() -> dict[str, Any]:
    # userPhone/userName are no longer part of the payload — the server derives
    # the request owner from the authenticated user's JWT.
    return {
        "title": "Pothole repair",
        "description": "The asphalt on the street is damaged",
        "type": "problem",
        "category": "Asphalt & Roads",
        "coordinates": {"lat": 35.72, "lng": 51.40},
        "region": "District 3",
    }


@pytest.fixture
def sample_request(client, registered_user, sample_request_data, user_token):
    r = client.post(
        "/api/v1/requests",
        json=sample_request_data,
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def token_for(client):
    """Factory fixture: register/login an arbitrary phone and return its access token."""

    def _make(phone: str, first_name: str = "Test", last_name: str = "User") -> str:
        return otp_login(
            client, phone, nationalId="1111111111", firstName=first_name, lastName=last_name
        )["token"]["accessToken"]

    return _make


@pytest.fixture
def sample_request_id(sample_request):
    return sample_request["request"]["id"]
