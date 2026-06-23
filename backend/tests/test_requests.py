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

    def test_create_request_without_region_defaults(
        self, client, registered_user, sample_request_data
    ):
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
    def test_create_request_invalid_data(
        self, client, registered_user, sample_request_data, field, value
    ):
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


class TestPagination:
    def test_pagination_default_returns_all(self, client, registered_user, sample_request_data):
        for i in range(3):
            client.post("/api/v1/requests", json={**sample_request_data, "title": f"Req {i}"})
        r = client.get("/api/v1/requests")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) == 3

    def test_pagination_with_limit_returns_wrapped(
        self, client, registered_user, sample_request_data
    ):
        for i in range(5):
            client.post("/api/v1/requests", json={**sample_request_data, "title": f"Req {i}"})
        r = client.get("/api/v1/requests?limit=2")
        data = r.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] == 5
        assert len(data["items"]) == 2

    def test_pagination_offset(self, client, registered_user, sample_request_data):
        for i in range(3):
            client.post("/api/v1/requests", json={**sample_request_data, "title": f"Req {i}"})
        r = client.get("/api/v1/requests?limit=2&offset=2")
        data = r.json()
        assert len(data["items"]) == 1

    def test_sort_by_likes(self, client, registered_user, sample_request_data):
        r1 = client.post("/api/v1/requests", json={**sample_request_data, "title": "A"})
        client.post("/api/v1/requests", json={**sample_request_data, "title": "B"})
        id1 = r1.json()["request"]["id"]
        phone = sample_request_data["userPhone"]
        client.post(f"/api/v1/requests/{id1}/like", json={"userPhone": phone})
        client.post(f"/api/v1/requests/{id1}/like", json={"userPhone": "09999999999"})
        r = client.get("/api/v1/requests?sort_by=likes&sort_order=desc&limit=10")
        data = r.json()
        assert data["items"][0]["id"] == id1

    def test_sort_by_created_at_asc(self, client, registered_user, sample_request_data):
        client.post("/api/v1/requests", json={**sample_request_data, "title": "First"})
        client.post("/api/v1/requests", json={**sample_request_data, "title": "Second"})
        r = client.get("/api/v1/requests?sort_by=created_at&sort_order=asc&limit=10")
        data = r.json()
        assert data["items"][0]["title"] == "First"

    def test_liked_by_user_filter(self, client, registered_user, sample_request_data, user_data):
        r = client.post("/api/v1/requests", json={**sample_request_data, "title": "Mine"})
        client.post(
            "/api/v1/requests",
            json={**sample_request_data, "title": "Other", "userPhone": "09999999999"},
        )
        id_mine = r.json()["request"]["id"]
        client.post(f"/api/v1/requests/{id_mine}/like", json={"userPhone": user_data["phone"]})
        r = client.get(f"/api/v1/requests?likedByUser={user_data['phone']}&limit=10")
        data = r.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "Mine"


class TestDateFilters:
    def test_start_date_filter(self, client, registered_user, sample_request_data):
        client.post("/api/v1/requests", json=sample_request_data)
        from datetime import datetime, timedelta, timezone

        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        r = client.get(f"/api/v1/requests?startDate={yesterday}&limit=10")
        data = r.json()
        assert len(data["items"]) >= 1

    def test_end_date_filter_excludes_future(self, client, registered_user, sample_request_data):
        client.post("/api/v1/requests", json=sample_request_data)
        from datetime import datetime, timedelta, timezone

        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        r = client.get(f"/api/v1/requests?endDate={yesterday}&limit=10")
        data = r.json()
        assert len(data["items"]) == 0


class TestUpdateRequest:
    def test_update_own_request(self, client, sample_request_id, user_token, user_data):
        r = client.put(
            f"/api/v1/requests/{sample_request_id}",
            json={"title": "Updated title", "description": "Updated description"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 200
        assert r.json()["title"] == "Updated title"
        assert r.json()["description"] == "Updated description"

    def test_update_without_token_returns_403(self, client, sample_request_id):
        r = client.put(
            f"/api/v1/requests/{sample_request_id}",
            json={"title": "Hacked"},
        )
        assert r.status_code == 403

    def test_update_other_users_request_fails(self, client, sample_request_id, admin_token):
        r = client.put(
            f"/api/v1/requests/{sample_request_id}",
            json={"title": "Hacked"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 403

    def test_update_nonexistent_request_returns_404(self, client, user_token):
        r = client.put(
            "/api/v1/requests/nonexistent",
            json={"title": "Test"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 404


class TestDeleteRequest:
    def test_delete_own_submitted_request(self, client, sample_request_id, user_token):
        r = client.delete(
            f"/api/v1/requests/{sample_request_id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 200
        assert r.json()["success"] is True
        r = client.get("/api/v1/requests")
        assert r.json() == []

    def test_delete_without_token_returns_403(self, client, sample_request_id):
        r = client.delete(f"/api/v1/requests/{sample_request_id}")
        assert r.status_code == 403

    def test_delete_other_users_request_fails(self, client, sample_request_id, admin_token):
        r = client.delete(
            f"/api/v1/requests/{sample_request_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 403

    def test_delete_nonexistent_request_returns_404(self, client, user_token):
        r = client.delete(
            "/api/v1/requests/nonexistent",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 404


class TestNotifications:
    def test_get_notifications_empty(self, client, user_data):
        r = client.get(f"/api/v1/notifications?userPhone={user_data['phone']}")
        assert r.status_code == 200
        assert r.json() == []

    def test_notification_created_on_status_update(
        self, client, sample_request_id, admin_token, user_data
    ):
        client.put(
            f"/api/v1/requests/{sample_request_id}/status",
            json={"status": "in_progress", "adminResponse": "Working on it"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        r = client.get(f"/api/v1/notifications?userPhone={user_data['phone']}")
        assert len(r.json()) == 1
        notification = r.json()[0]
        assert notification["isRead"] is False
        assert "وضعیت" in notification["message"]

    def test_mark_notification_read(self, client, sample_request_id, admin_token, user_data):
        client.put(
            f"/api/v1/requests/{sample_request_id}/status",
            json={"status": "resolved"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        r = client.get(f"/api/v1/notifications?userPhone={user_data['phone']}")
        n_id = r.json()[0]["id"]
        r = client.put(f"/api/v1/notifications/{n_id}/read")
        assert r.status_code == 200
        r = client.get(f"/api/v1/notifications?userPhone={user_data['phone']}")
        assert r.json() == []


class TestUserStats:
    def test_user_stats_empty(self, client, registered_user, user_data):
        r = client.get(f"/api/v1/requests/user/{user_data['phone']}/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["totalRequests"] == 0
        assert data["totalLikesReceived"] == 0

    def test_user_stats_with_request(self, client, registered_user, sample_request, user_data):
        r = client.get(f"/api/v1/requests/user/{user_data['phone']}/stats")
        data = r.json()
        assert data["totalRequests"] == 1
        assert data["totalLikesReceived"] == 0
