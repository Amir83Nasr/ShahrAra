from __future__ import annotations

import pytest


class TestRegister:
    def test_register_new_user(self, client):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09123456789",
                "nationalId": "1234567890",
                "firstName": "Ali",
                "lastName": "Rezaei",
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["user"]["firstName"] == "Ali"
        assert data["user"]["isAdmin"] is False
        assert "accessToken" in data["token"]
        assert data["token"]["tokenType"] == "bearer"

    def test_register_without_name_returns_persian_error(self, client):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09121111111",
                "nationalId": "1111111111",
                "firstName": None,
                "lastName": None,
            },
        )
        assert r.status_code == 400
        data = r.json()
        assert data["success"] is False
        assert data["error"]["code"] == 400
        assert "نام" in data["error"]["message"]

    def test_register_without_name_as_none_returns_persian_error(self, client):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09121111111",
                "nationalId": "1111111111",
                "firstName": None,
                "lastName": None,
            },
        )
        assert r.status_code == 400
        data = r.json()
        assert data["success"] is False
        assert data["error"]["code"] == 400
        assert "نام" in data["error"]["message"] or "نام خانوادگی" in data["error"]["message"]


class TestLogin:
    def test_login_existing_user(self, client, registered_user):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09123456789",
                "nationalId": "1234567890",
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["user"]["firstName"] == "Ali"

    def test_login_wrong_national_id_returns_persian_error(self, client, registered_user):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09123456789",
                "nationalId": "9999999999",
                "firstName": None,
                "lastName": None,
            },
        )
        assert r.status_code == 401
        data = r.json()
        assert data["success"] is False
        assert data["error"]["code"] == 401
        assert "کد ملی" in data["error"]["message"]

    def test_login_nonexistent_user_without_name_returns_400(self, client):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09999999999",
                "nationalId": "9999999999",
                "firstName": None,
                "lastName": None,
            },
        )
        assert r.status_code == 400
        data = r.json()
        assert data["error"]["code"] == 400
        assert "نام" in data["error"]["message"]


class TestAdminAuth:
    def test_admin_login_success(self, client):
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
        data = r.json()
        assert data["user"]["isAdmin"] is True
        assert "accessToken" in data["token"]

    def test_admin_login_without_name_succeeds(self, client):
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09120000000",
                "nationalId": "1234567890",
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["isAdmin"] is True

    def test_admin_login_wrong_national_id_fails(self, client):
        client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09120000000",
                "nationalId": "1234567890",
            },
        )
        r = client.post(
            "/api/v1/auth/login",
            json={
                "phone": "09120000000",
                "nationalId": "0000000000",
            },
        )
        assert r.status_code == 401
        assert r.json()["error"]["code"] == 401


@pytest.mark.parametrize(
    "payload, expected_status",
    [
        ({"phone": "09123456789", "nationalId": "x", "firstName": "A", "lastName": "B"}, 200),
        ({"phone": "09123456789", "nationalId": "x", "firstName": None, "lastName": None}, 400),
    ],
)
def test_register_with_various_names(client, payload, expected_status):
    r = client.post("/api/v1/auth/login", json=payload)
    assert r.status_code == expected_status
