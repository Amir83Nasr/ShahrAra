from __future__ import annotations

import os
import tempfile
from typing import Any

import pytest
from fastapi.testclient import TestClient

_test_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db.name}"
os.environ["ADMIN_PHONE"] = "09120000000"
os.environ["ADMIN_NATIONAL_ID"] = "1234567890"


@pytest.fixture(scope="session", autouse=True)
def _setup_db():
    from app.db.session import Base, engine

    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _cleanup_db_file():
    yield
    try:
        os.unlink(_test_db.name)
    except OSError:
        pass


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
def sample_request_data(user_data) -> dict[str, Any]:
    return {
        "title": "Pothole repair",
        "description": "The asphalt on the street is damaged",
        "type": "problem",
        "category": "Asphalt & Roads",
        "coordinates": {"lat": 35.72, "lng": 51.40},
        "region": "District 3",
        "userPhone": user_data["phone"],
        "userName": f"{user_data['firstName']} {user_data['lastName']}",
    }


@pytest.fixture
def sample_request(client, registered_user, sample_request_data):
    r = client.post("/api/v1/requests", json=sample_request_data)
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def sample_request_id(sample_request):
    return sample_request["request"]["id"]
