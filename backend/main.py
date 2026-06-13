from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.db.session import Base, engine


def register_openapi_schema(app: FastAPI) -> None:
    schema = app.openapi()
    if schema is None:
        return
    schema.setdefault("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token from the /api/auth/login response.",
        }
    }
    app.openapi_schema = schema


app = FastAPI(
    title="ShahrAra API",
    description=(
        "Municipal engagement platform for reporting urban problems, submitting city improvement ideas, "
        "tracking request status in real-time, and voting on community submissions.\n\n"
        "This API powers the ShahrAra civic platform, connecting citizens directly with "
        "municipal administrators via an interactive map interface."
    ),
    version="1.0.0",
    contact={
        "name": "ShahrAra Team",
        "url": "https://github.com/anomalyco/SharAra",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0",
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Local development"},
    ],
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "persistAuthorization": True,
        "displayRequestDuration": True,
        "filter": True,
        "tryItOutEnabled": True,
    },
)

register_openapi_schema(app)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShahrAra API",
    description=(
        "Municipal engagement platform for reporting urban problems, submitting city improvement ideas, "
        "tracking request status in real-time, and voting on community submissions.\n\n"
        "This API powers the ShahrAra civic platform, connecting citizens directly with "
        "municipal administrators via an interactive map interface."
    ),
    version="1.0.0",
    contact={
        "name": "ShahrAra Team",
        "url": "https://github.com/anomalyco/SharAra",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0",
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Local development"},
    ],
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "persistAuthorization": True,
        "displayRequestDuration": True,
        "filter": True,
        "tryItOutEnabled": True,
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/api/health", tags=["health"], summary="Health check")
def health_check():
    return {"status": "ok"}
