import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///./shahr_ara_test.db"

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "shahr_ara_test.db")


def clean_db():
    try:
        os.remove(DB_PATH)
    except FileNotFoundError:
        pass


clean_db()

from app.db.session import Base, engine

Base.metadata.create_all(bind=engine)

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
    print("[PASS] Health check")


def test_all():
    r = client.post("/api/auth/login", json={
        "phone": "09123456789", "nationalId": "1234567890",
        "firstName": "علی", "lastName": "رضایی"
    })
    assert r.status_code == 200
    assert r.json()["user"]["firstName"] == "علی"
    print("[PASS] User registration")

    r = client.post("/api/auth/login", json={
        "phone": "09120000000", "nationalId": "1234567890",
        "firstName": "مدیر", "lastName": "سامانه"
    })
    assert r.status_code == 200
    assert r.json()["user"]["isAdmin"] is True
    print("[PASS] Admin login")

    r = client.post("/api/requests", json={
        "title": "خرابی آسفالت", "description": "آسفالت خیابان خراب است",
        "type": "problem", "category": "آسفالت و معابر",
        "coordinates": {"lat": 35.72, "lng": 51.40},
        "region": "منطقه ۳",
        "userPhone": "09123456789", "userName": "علی رضایی"
    })
    assert r.status_code == 200
    req_id = r.json()["request"]["id"]
    print(f"[PASS] Create request: {req_id}")

    r = client.get("/api/requests")
    assert len(r.json()) == 1
    print("[PASS] List requests")

    r = client.post(f"/api/requests/{req_id}/like", json={"userPhone": "09123456789"})
    assert r.json()["request"]["likes"] == 1
    print("[PASS] Like request")

    r = client.put(f"/api/requests/{req_id}/status", json={
        "status": "resolved", "adminResponse": "با موفقیت انجام شد"
    })
    assert r.json()["request"]["status"] == "resolved"
    print("[PASS] Update status")

    r = client.get("/api/stats")
    assert r.json()["totalCount"] == 1
    print("[PASS] Stats endpoint")


if __name__ == "__main__":
    test_health()
    test_all()
    clean_db()
    print("\n=== ALL BACKEND TESTS PASSED ===")
