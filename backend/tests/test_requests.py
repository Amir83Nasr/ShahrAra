from __future__ import annotations

import pytest


class TestCreateRequest:
    def test_create_request(self, client, registered_user, sample_request_data):
        r = client.post("/api/v1/requests", json=sample_request_data)
        assert r.status_code == 201
        data = r.json()
        assert data["success"] is True
        req = data["request"]
        assert req["title"] == sample_request_data["title"]
        assert req["type"] == "problem"
        assert req["status"] == "submitted"
        assert req["likes"] == 0
        assert req["id"].startswith("req_")

    def test_create_request_without_region_defaults(self, client, registered_user, sample_request_data):
        data = {**sample_request_data, "region": ""}
        r = client.post("/api/v1/requests", json=data)
        assert r.status_code == 201
        assert r.json()["request"]["region"] == "Central District"

    def test_create_idea(self, client, registered_user, sample_request_data):
        data = {**sample_request_data, "type": "idea"}
        r = client.post("/api/v1/requests", json=data)
        assert r.status_code == 201
        assert r.json()["request"]["type"] == "idea"

    @pytest.mark.parametrize(
        "field, value",
        [
            ("title", ""),
            ("coordinates", {}),
            ("type", "invalid"),
        ],
    )
    def test_create_request_invalid_data(self, client, registered_user, sample_request_data, field, value):
        data = {**sample_request_data, field: value}
        r = client.post("/api/v1/requests", json=data)
        assert r.status_code == 422


class TestListRequests:
    def test_list_requests_empty(self, client):
        r = client.get("/api/v1/requests")
        assert r.status_code == 200
        assert r.json() == []

    def test_list_requests(self, client, sample_request):
        r = client.get("/api/v1/requests")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["id"] == sample_request["request"]["id"]

    def test_list_filter_by_type(self, client, sample_request):
        r = client.get("/api/v1/requests?type=problem")
        assert len(r.json()) == 1

        r = client.get("/api/v1/requests?type=idea")
        assert r.json() == []

    def test_list_filter_by_status(self, client, sample_request):
        r = client.get("/api/v1/requests?status=submitted")
        assert len(r.json()) == 1

        r = client.get("/api/v1/requests?status=resolved")
        assert r.json() == []

    def test_list_search_by_title(self, client, sample_request):
        r = client.get("/api/v1/requests?search=Pothole")
        assert len(r.json()) == 1

        r = client.get("/api/v1/requests?search=nonexistent")
        assert r.json() == []

    def test_list_filter_by_user_phone(self, client, sample_request, user_data):
        r = client.get(f"/api/v1/requests?userPhone={user_data['phone']}")
        assert len(r.json()) == 1

        r = client.get("/api/v1/requests?userPhone=0000000000")
        assert r.json() == []


class TestLikeRequest:
    def test_like_request(self, client, sample_request_id, user_data):
        phone = user_data["phone"]
        r = client.post(f"/api/v1/requests/{sample_request_id}/like", json={"userPhone": phone})
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["request"]["likes"] == 1
        assert data["request"]["likedByCurrentUser"] is True

    def test_unlike_request(self, client, sample_request_id, user_data):
        phone = user_data["phone"]
        client.post(f"/api/v1/requests/{sample_request_id}/like", json={"userPhone": phone})
        r = client.post(f"/api/v1/requests/{sample_request_id}/like", json={"userPhone": phone})
        assert r.status_code == 200
        assert r.json()["request"]["likes"] == 0
        assert r.json()["request"]["likedByCurrentUser"] is False

    def test_like_toggle_multiple_times(self, client, sample_request_id, user_data):
        phone = user_data["phone"]
        for expected_likes, expected_current in [(1, True), (0, False), (1, True)]:
            r = client.post(f"/api/v1/requests/{sample_request_id}/like", json={"userPhone": phone})
            assert r.json()["request"]["likes"] == expected_likes
            assert r.json()["request"]["likedByCurrentUser"] is expected_current

    def test_like_nonexistent_request_returns_persian_error(self, client):
        r = client.post("/api/v1/requests/nonexistent/like", json={"userPhone": "09123456789"})
        assert r.status_code == 404
        data = r.json()
        assert data["success"] is False
        assert data["error"]["code"] == 404
        assert "یافت نشد" in data["error"]["message"]


class TestStatusUpdate:
    def test_admin_can_update_status(self, client, sample_request_id, admin_token):
        r = client.put(
            f"/api/v1/requests/{sample_request_id}/status",
            json={"status": "in_progress", "adminResponse": "Under review"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        data = r.json()
        assert data["request"]["status"] == "in_progress"
        assert data["request"]["adminResponse"] == "Under review"

    def test_non_admin_cannot_update_status(self, client, sample_request_id, user_token):
        r = client.put(
            f"/api/v1/requests/{sample_request_id}/status",
            json={"status": "resolved"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 403

    def test_update_status_without_token_returns_persian_error(self, client, sample_request_id):
        r = client.put(
            f"/api/v1/requests/{sample_request_id}/status",
            json={"status": "resolved"},
        )
        assert r.status_code == 403
        data = r.json()
        assert data["success"] is False
        assert data["error"]["code"] == 403
        assert "مدیر" in data["error"]["message"]

    def test_update_nonexistent_request_returns_persian_error(self, client, admin_token):
        r = client.put(
            "/api/v1/requests/nonexistent/status",
            json={"status": "resolved"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 404
        data = r.json()
        assert data["success"] is False
        assert data["error"]["code"] == 404
        assert "یافت نشد" in data["error"]["message"]

    def test_update_status_through_all_statuses(self, client, sample_request_id, admin_token):
        statuses = ["under_review", "in_progress", "resolved", "archived"]
        headers = {"Authorization": f"Bearer {admin_token}"}
        for status in statuses:
            r = client.put(
                f"/api/v1/requests/{sample_request_id}/status",
                json={"status": status},
                headers=headers,
            )
            assert r.status_code == 200
            assert r.json()["request"]["status"] == status


class TestStats:
    def test_stats_empty(self, client):
        r = client.get("/api/v1/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["totalCount"] == 0
        assert data["problemsCount"] == 0
        assert data["ideasCount"] == 0

    def test_stats_with_data(self, client, sample_request):
        r = client.get("/api/v1/stats")
        data = r.json()
        assert data["totalCount"] == 1
        assert data["problemsCount"] == 1
        assert data["ideasCount"] == 0

    def test_stats_counts_across_types(self, client, registered_user, sample_request_data):
        client.post("/api/v1/requests", json={**sample_request_data, "type": "problem"})
        client.post("/api/v1/requests", json={**sample_request_data, "type": "idea"})
        client.post("/api/v1/requests", json={**sample_request_data, "type": "problem"})
        r = client.get("/api/v1/stats")
        assert r.json()["totalCount"] == 3
        assert r.json()["problemsCount"] == 2
        assert r.json()["ideasCount"] == 1


class TestLikeAwareListing:
    def test_liked_by_current_user_true(self, client, sample_request_id, user_data):
        phone = user_data["phone"]
        client.post(f"/api/v1/requests/{sample_request_id}/like", json={"userPhone": phone})
        r = client.get(f"/api/v1/requests?currentUserPhone={phone}")
        assert r.json()[0]["likedByCurrentUser"] is True

    def test_liked_by_current_user_false_when_not_liked(self, client, sample_request_id, user_data):
        r = client.get(f"/api/v1/requests?currentUserPhone={user_data['phone']}")
        assert r.json()[0]["likedByCurrentUser"] is False

    def test_liked_by_current_user_none_without_param(self, client, sample_request_id):
        r = client.get("/api/v1/requests")
        assert r.json()[0].get("likedByCurrentUser") is None
