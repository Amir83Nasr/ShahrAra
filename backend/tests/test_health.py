from __future__ import annotations


class TestHealth:
    def test_health_endpoint(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


class TestApiRoot:
    def test_api_root_returns_metadata(self, client):
        r = client.get("/api")
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "ShahrAra API"
        assert "v1" in data["versions"]
        assert "health" in data["endpoints"]

    def test_root_redirects_to_docs(self, client):
        r = client.get("/", follow_redirects=False)
        assert r.status_code == 307
        assert "/docs" in r.headers.get("location", "")
