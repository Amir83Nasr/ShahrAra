from __future__ import annotations

import os
from typing import Any

import pytest
from fastapi.testclient import TestClient

# Tests run against the same Postgres instance used in dev (docker compose `db`).
# Requires `make db-up` (or a running Postgres at localhost:5432).
os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/shahr_ara"
)
os.environ["ADMIN_PHONE"] = "09120000000"
os.environ["ADMIN_NATIONAL_ID"] = "1234567890"


@pytest.fixture(scope="session", autouse=True)
def _setup_db():
    from app.db.session import Base, engine

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


@pytest.fixture
def registered_user(client, user_data):
    r = client.post("/api/v1/auth/login", json=user_data)
    assert r.status_code == 200
    return r.json()


@pytest.fixture
def user_token(registered_user):
    return registered_user["token"]["accessToken"]


@pytest.fixture
def admin_token(client):
    r = client.post(
        "/api/v1/auth/login",
        json={
            "phone": "09120000000",
            "nationalId": "1234567890",
            "firstName": "Manager",
            "lastName": "System",
        },
    )
    assert r.status_code == 200
    return r.json()["token"]["accessToken"]


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
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": phone,
                "nationalId": "1111111111",
                "firstName": first_name,
                "lastName": last_name,
            },
        )
        assert r.status_code == 200
        return r.json()["token"]["accessToken"]

    return _make


@pytest.fixture
def sample_request_id(sample_request):
    return sample_request["request"]["id"]
