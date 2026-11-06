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
        assert data["status"] == "ok"
        assert "v1" in data["endpoints"]

    def test_root_returns_service_descriptor(self, client):
        r = client.get("/")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/json")
        data = r.json()
        assert data["name"] == "ShahrAra API"
        assert data["documentation"]["swagger"] == "/docs"

    def test_root_serves_landing_page_for_browsers(self, client):
        r = client.get("/", headers={"Accept": "text/html"})
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("text/html")
        assert "شهرآرا" in r.text
        assert "/docs" in r.text

    def test_openapi_schema_is_available(self, client):
        r = client.get("/openapi.json")
        assert r.status_code == 200
        schema = r.json()
        assert schema["info"]["title"] == "ShahrAra API"
        assert {"JWT"} <= set(schema["components"]["securitySchemes"])
