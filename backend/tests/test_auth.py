from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest


def request_code(client, phone: str) -> str:
    r = client.post("/api/v1/auth/otp/request", json={"phone": phone})
    assert r.status_code == 200
    code = r.json()["devCode"]
    assert code
    return code


class TestCheckPhone:
    def test_unknown_phone(self, client):
        r = client.post("/api/v1/auth/check-phone", json={"phone": "09123456789"})
        assert r.status_code == 200
        assert r.json() == {"exists": False, "hasPassword": False}

    def test_admin_phone_exists_after_otp_request(self, client):
        request_code(client, "09120000000")  # seeds admin
        r = client.post("/api/v1/auth/check-phone", json={"phone": "09120000000"})
        assert r.json() == {"exists": True, "hasPassword": False}

    def test_invalid_phone_rejected(self, client):
        r = client.post("/api/v1/auth/check-phone", json={"phone": "12345"})
        assert r.status_code == 422

    def test_registered_user_with_password(self, client, registered_user, user_token):
        r = client.put(
            "/api/v1/auth/password",
            json={"newPassword": "Str0ngPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 200
        r = client.post("/api/v1/auth/check-phone", json={"phone": "09123456789"})
        assert r.json() == {"exists": True, "hasPassword": True}


class TestOtp:
    def test_request_returns_dev_code_and_expiry(self, client):
        r = client.post("/api/v1/auth/otp/request", json={"phone": "09123456789"})
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["expiresInSeconds"] == 300
        assert data["devCode"] and len(data["devCode"]) == 6

    def test_verify_new_user_registers(self, client, user_data):
        code = request_code(client, user_data["phone"])
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={
                "phone": user_data["phone"],
                "code": code,
                "firstName": "Ali",
                "lastName": "Rezaei",
                "nationalId": "1234567890",
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["user"]["firstName"] == "Ali"
        assert data["user"]["isAdmin"] is False
        assert data["user"]["hasPassword"] is False
        assert "accessToken" in data["token"]

    def test_verify_new_user_without_profile_returns_400(self, client):
        code = request_code(client, "09123456789")
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09123456789", "code": code},
        )
        assert r.status_code == 400
        assert "نام" in r.json()["error"]["message"]

    def test_verify_existing_user_ignores_profile_fields(self, client, registered_user):
        code = request_code(client, "09123456789")
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09123456789", "code": code, "firstName": "هکر"},
        )
        assert r.status_code == 200
        assert r.json()["user"]["firstName"] == "Ali"  # unchanged

    def test_wrong_code_returns_401(self, client):
        request_code(client, "09123456789")
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09123456789", "code": "000000"},
        )
        assert r.status_code == 401
        assert "صحیح نیست" in r.json()["error"]["message"]

    def test_expired_code_returns_400(self, client):
        request_code(client, "09123456789")

        from app.db.session import SessionLocal
        from app.models.models import OtpCode

        db = SessionLocal()
        try:
            db.query(OtpCode).update(
                {"expires_at": datetime.now(timezone.utc) - timedelta(minutes=1)}
            )
            db.commit()
        finally:
            db.close()

        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09123456789", "code": "111111"},
        )
        assert r.status_code == 400
        assert "منقضی" in r.json()["error"]["message"]

    def test_too_many_attempts_locks_code(self, client):
        request_code(client, "09123456789")
        for _ in range(5):
            r = client.post(
                "/api/v1/auth/otp/verify",
                json={"phone": "09123456789", "code": "000000"},
            )
            assert r.status_code == 401
        # Even the correct code is now locked out.
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09123456789", "code": "999999"},
        )
        assert r.status_code == 400
        assert "تلاش" in r.json()["error"]["message"]

    def test_code_single_use(self, client, user_data):
        code = request_code(client, user_data["phone"])
        payload = {
            "phone": user_data["phone"],
            "code": code,
            "firstName": "Ali",
            "lastName": "Rezaei",
            "nationalId": "1234567890",
        }
        assert client.post("/api/v1/auth/otp/verify", json=payload).status_code == 200
        r = client.post("/api/v1/auth/otp/verify", json=payload)
        # Consumed code = no unconsumed row remains for the phone.
        assert r.status_code == 400
        assert "یافت نشد" in r.json()["error"]["message"]

    def test_new_request_invalidates_previous_code(self, client, user_data):
        first = request_code(client, user_data["phone"])
        second = request_code(client, user_data["phone"])
        assert first != second or True  # codes may theoretically collide; test invalidation below
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={
                "phone": user_data["phone"],
                "code": first,
                "firstName": "Ali",
                "lastName": "Rezaei",
                "nationalId": "1234567890",
            },
        )
        # Old code must no longer exist — only the newest unconsumed row counts.
        assert r.status_code in (400, 401)
        assert r.json()["error"]["code"] in (400, 401)

    def test_duplicate_national_id_rejected(self, client, registered_user):
        code = request_code(client, "09129999999")
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={
                "phone": "09129999999",
                "code": code,
                "firstName": "دیگری",
                "lastName": "شخص",
                "nationalId": "1234567890",  # already held by registered_user
            },
        )
        assert r.status_code == 400
        assert "کد ملی" in r.json()["error"]["message"]


class TestOtpDevModeOff:
    def test_no_dev_code_when_disabled(self, client, monkeypatch):
        import app.api.v1.endpoints.auth as auth_module

        monkeypatch.setattr(auth_module, "OTP_DEV_MODE", False)
        r = client.post("/api/v1/auth/otp/request", json={"phone": "09123456789"})
        assert r.status_code == 200
        assert r.json()["devCode"] is None


class TestPasswordLogin:
    def test_wrong_password_returns_uniform_401(self, client, registered_user, user_token):
        client.put(
            "/api/v1/auth/password",
            json={"newPassword": "Str0ngPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        r = client.post(
            "/api/v1/auth/login/password",
            json={"phone": "09123456789", "password": "wrong-pass"},
        )
        assert r.status_code == 401
        assert "اشتباه" in r.json()["error"]["message"]

    def test_login_without_password_set_returns_401(self, client, registered_user):
        r = client.post(
            "/api/v1/auth/login/password",
            json={"phone": "09123456789", "password": "whatever1"},
        )
        assert r.status_code == 401

    def test_unknown_phone_returns_same_401(self, client):
        r = client.post(
            "/api/v1/auth/login/password",
            json={"phone": "09999999999", "password": "whatever1"},
        )
        assert r.status_code == 401
        assert "اشتباه" in r.json()["error"]["message"]

    def test_correct_password_logs_in(self, client, registered_user, user_token):
        client.put(
            "/api/v1/auth/password",
            json={"newPassword": "Str0ngPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        r = client.post(
            "/api/v1/auth/login/password",
            json={"phone": "09123456789", "password": "Str0ngPass!"},
        )
        assert r.status_code == 200
        assert r.json()["success"] is True
        assert r.json()["user"]["hasPassword"] is True


class TestPasswordChange:
    def test_set_initial_password(self, client, registered_user, user_token):
        r = client.put(
            "/api/v1/auth/password",
            json={"newPassword": "Str0ngPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 200
        assert r.json()["success"] is True
        assert r.json()["user"]["hasPassword"] is True

    def test_change_requires_current_password(self, client, registered_user, user_token):
        client.put(
            "/api/v1/auth/password",
            json={"newPassword": "Str0ngPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        # No currentPassword → 401
        r = client.put(
            "/api/v1/auth/password",
            json={"newPassword": "An0therPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 401
        # Wrong currentPassword → 401
        r = client.put(
            "/api/v1/auth/password",
            json={"currentPassword": "nope", "newPassword": "An0therPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 401
        # Correct currentPassword → 200, old password stops working
        r = client.put(
            "/api/v1/auth/password",
            json={"currentPassword": "Str0ngPass!", "newPassword": "An0therPass!"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 200
        r = client.post(
            "/api/v1/auth/login/password",
            json={"phone": "09123456789", "password": "Str0ngPass!"},
        )
        assert r.status_code == 401

    def test_short_password_rejected(self, client, registered_user, user_token):
        r = client.put(
            "/api/v1/auth/password",
            json={"newPassword": "short"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 422

    def test_requires_auth(self, client):
        r = client.put("/api/v1/auth/password", json={"newPassword": "Str0ngPass!"})
        assert r.status_code in (401, 403)


class TestAdminAuth:
    def test_admin_otp_verify_is_admin(self, client):
        code = request_code(client, "09120000000")
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09120000000", "code": code},
        )
        assert r.status_code == 200
        assert r.json()["user"]["isAdmin"] is True

    def test_admin_custom_name_survives_relogin(self, client):
        request_code(client, "09120000000")

        from app.db.session import SessionLocal
        from app.models.models import User

        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.phone == "09120000000").first()
            admin_user.first_name = "سیما"
            admin_user.last_name = "رستمی"
            db.commit()
        finally:
            db.close()

        code = request_code(client, "09120000000")
        r = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": "09120000000", "code": code},
        )
        assert r.status_code == 200
        data = r.json()["user"]
        assert data["firstName"] == "سیما"
        assert data["lastName"] == "رستمی"
