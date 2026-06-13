from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.v1.router import api_router as v1_router
from app.core.errors import (
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.db.session import Base, engine

Base.metadata.create_all(bind=engine)

NAME = "ShahrAra API"
VERSION = "1.1.0"

app = FastAPI(
    title=NAME,
    description=(
        "Municipal engagement platform for reporting urban problems, submitting city improvement ideas, "
        "tracking request status in real-time, and voting on community submissions.\n\n"
        "This API powers the ShahrAra civic platform, connecting citizens directly with "
        "municipal administrators via an interactive map interface."
    ),
    version=VERSION,
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0",
    },
    servers=[
        {"url": "http://192.168.1.20:8000", "description": "On Network development"},
        {"url": "http://localhost:8000", "description": "Local development"},
    ],
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
    },
)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://192.168.1.21",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/", tags=["info"], summary="Root redirect", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/api", tags=["info"], summary="API root")
def api_root():
    return {
        "name": NAME,
        "version": VERSION,
        "description": "Municipal engagement platform API",
        "documentation": "/docs",
        "versions": {
            "v1": "/api/v1",
        },
        "endpoints": {
            "health": "/api/health",
            "v1": {
                "auth": "/api/v1/auth/login",
                "requests": "/api/v1/requests",
                "stats": "/api/v1/stats",
            },
        },
    }


@app.get("/api/health", tags=["health"], summary="API health check")
def api_health():
    return {"status": "ok"}
