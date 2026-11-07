from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.api import docs
from app.api.v1.router import api_router as v1_router
from app.core.config import CORS_ORIGINS
from app.core.errors import (
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)

NAME = docs.NAME
VERSION = docs.VERSION

app = FastAPI(
    title=NAME,
    summary="Municipal engagement platform API",
    description=docs.DESCRIPTION,
    version=VERSION,
    contact=docs.CONTACT,
    license_info=docs.LICENSE_INFO,
    external_docs={
        "url": f"{docs.REPOSITORY_URL}/blob/main/docs/backend.md",
        "description": "Backend guide",
    },
    openapi_tags=docs.TAGS_METADATA,
    servers=[{"url": "/", "description": "Current host"}],
    docs_url=None,
    swagger_ui_parameters=docs.SWAGGER_UI_PARAMETERS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/docs", include_in_schema=False)
def swagger_docs() -> HTMLResponse:
    """Branded Swagger UI."""
    return docs.swagger_ui(app.openapi_url or "/openapi.json")


@app.get("/docs/theme.css", include_in_schema=False)
def swagger_theme():
    """Theme stylesheet for Swagger UI."""
    return docs.swagger_theme()


@app.get("/docs/favicon.svg", include_in_schema=False)
def swagger_favicon():
    """Favicon for the documentation pages."""
    return docs.favicon()


def _wants_html(request: Request) -> bool:
    return "text/html" in request.headers.get("accept", "")


@app.get("/", include_in_schema=False)
def root(request: Request):
    """Human-friendly landing page for browsers, service descriptor for clients."""
    if _wants_html(request):
        return HTMLResponse(docs.landing_page())
    return docs.service_descriptor()


@app.get("/api", tags=["System"], summary="API root", operation_id="system_api_root")
def api_root() -> dict[str, Any]:
    """Service descriptor, same payload as `/` but documented in the schema."""
    return docs.service_descriptor()


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    """Root-level alias for hosting-platform health probes."""
    return {"status": "ok"}


@app.get(
    "/api/health",
    tags=["System"],
    summary="Health check",
    operation_id="system_health",
    response_description="The service is up.",
)
def api_health() -> dict[str, str]:
    """Lightweight liveness probe used by hosting platforms."""
    return {"status": "ok"}
