from __future__ import annotations


class TestHealth:
    def test_health_endpoint(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

    def test_root_level_health_alias(self, client):
        r = client.get("/health")
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


class TestDocumentation:
    def test_swagger_ui_is_branded(self, client):
        r = client.get("/docs")
        assert r.status_code == 200
        assert "/docs/theme.css" in r.text
        assert "/docs/favicon.svg" in r.text

    def test_theme_and_favicon_are_served(self, client):
        css = client.get("/docs/theme.css")
        assert css.status_code == 200
        assert css.headers["content-type"].startswith("text/css")

        icon = client.get("/docs/favicon.svg")
        assert icon.status_code == 200
        assert icon.headers["content-type"].startswith("image/svg+xml")

    def test_operation_ids_are_unique_and_stable(self, client):
        schema = client.get("/openapi.json").json()
        operation_ids = [
            operation["operationId"]
            for methods in schema["paths"].values()
            for operation in methods.values()
        ]
        assert len(operation_ids) == len(set(operation_ids))
        assert {"auth_verify_otp", "requests_list", "statistics_get"} <= set(operation_ids)

    def test_openapi_documents_errors_and_filters(self, client):
        schema = client.get("/openapi.json").json()
        assert "ErrorResponse" in schema["components"]["schemas"]

        parameters = {
            parameter["name"]: parameter["schema"]
            for parameter in schema["paths"]["/api/v1/requests"]["get"]["parameters"]
        }
        assert parameters["sort_by"]["enum"] == ["created_at", "likes"]
        assert parameters["type"]["anyOf"][0]["$ref"].endswith("/RequestType")
