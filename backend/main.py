from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.api.v1.router import api_router as v1_router
from app.core.config import CORS_ORIGINS
from app.core.errors import (
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)

NAME = "ShahrAra API"
VERSION: str = "1.1.0"

TAGS_METADATA = [
    {
        "name": "Authentication",
        "description": "Sign in with a one-time code or password. "
        "Use the returned `accessToken` with the **Authorize** button as a Bearer token.",
    },
    {
        "name": "Requests",
        "description": "Create, browse, update, and delete urban problem reports and improvement ideas.",
    },
    {
        "name": "Notifications",
        "description": "Status-change notifications for the signed-in user.",
    },
    {
        "name": "Statistics",
        "description": "Aggregate counters for dashboards and public metrics.",
    },
    {
        "name": "System",
        "description": "Service metadata and health checks.",
    },
]

app = FastAPI(
    title=NAME,
    summary="Municipal engagement platform API",
    description=(
        "ShahrAra connects citizens with their municipality: report urban problems, "
        "submit city improvement ideas, track request status in real time, and vote on "
        "community submissions.\n\n"
        "**Authentication** — request an OTP, verify it, then send the returned "
        "`accessToken` as `Authorization: Bearer <token>`."
    ),
    version=VERSION,
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0",
    },
    openapi_tags=TAGS_METADATA,
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "displayRequestDuration": True,
        "persistAuthorization": True,
        "filter": True,
    },
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


def _service_descriptor() -> dict[str, Any]:
    return {
        "name": NAME,
        "version": VERSION,
        "status": "ok",
        "description": "Municipal engagement platform API",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
        },
        "endpoints": {
            "health": "/api/health",
            "v1": "/api/v1",
        },
    }


def _landing_page() -> str:
    return f"""<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{NAME}</title>
  <style>
    :root {{
      color-scheme: light dark;
      --bg: #f4f7f6;
      --card: #ffffff;
      --fg: #14201d;
      --muted: #5c6f6a;
      --brand: #2f6b5e;
      --line: #e2eae7;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --bg: #0e1614;
        --card: #152220;
        --fg: #eef5f3;
        --muted: #9db2ac;
        --brand: #6fc2ad;
        --line: #253733;
      }}
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: var(--bg);
      color: var(--fg);
      font-family: system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif;
      line-height: 1.7;
    }}
    main {{
      width: min(560px, 100%);
      padding: 40px;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 20px;
      box-shadow: 0 18px 50px rgb(0 0 0 / 6%);
    }}
    .brand {{ display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }}
    .mark {{
      width: 44px; height: 44px; border-radius: 13px;
      display: grid; place-items: center;
      background: var(--brand); color: var(--card);
      font-weight: 800; font-size: 18px;
    }}
    h1 {{ margin: 0; font-size: 20px; font-weight: 700; }}
    .subtitle {{ margin: 2px 0 0; color: var(--muted); font-size: 13px; }}
    .status {{
      display: inline-flex; align-items: center; gap: 7px;
      margin-bottom: 18px; padding: 4px 10px;
      border: 1px solid var(--line); border-radius: 999px;
      color: var(--muted); font-size: 12px;
    }}
    .dot {{ width: 7px; height: 7px; border-radius: 50%; background: #22a06b; }}
    p {{ margin: 0 0 24px; color: var(--muted); font-size: 14px; }}
    .actions {{ display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 26px; }}
    a.button {{
      padding: 10px 18px; border-radius: 10px; text-decoration: none;
      font-size: 14px; font-weight: 600;
      border: 1px solid var(--line); color: var(--fg);
    }}
    a.primary {{ background: var(--brand); border-color: var(--brand); color: #fff; }}
    @media (prefers-color-scheme: dark) {{ a.primary {{ color: #0e1614; }} }}
    dl {{
      display: grid; grid-template-columns: auto 1fr; gap: 8px 16px;
      margin: 0; padding-top: 20px; border-top: 1px solid var(--line);
      font-size: 13px;
    }}
    dt {{ color: var(--muted); }}
    dd {{ margin: 0; direction: ltr; text-align: left; font-family: ui-monospace, monospace; }}
    footer {{ margin-top: 22px; color: var(--muted); font-size: 12px; }}
  </style>
</head>
<body>
  <main>
    <div class="brand">
      <div class="mark">ش</div>
      <div>
        <h1>{NAME}</h1>
        <p class="subtitle">سامانه مشارکت شهروندی شهرآرا</p>
      </div>
    </div>
    <span class="status"><span class="dot"></span> فعال · نسخه {VERSION}</span>
    <p>
      وب‌سرویس ثبت مشکلات شهری، ارائه ایده‌های بهبود شهر، پیگیری وضعیت درخواست‌ها
      و رأی‌دهی به مشارکت‌های شهروندان.
    </p>
    <div class="actions">
      <a class="button primary" href="/docs">مستندات API</a>
      <a class="button" href="/redoc">ReDoc</a>
      <a class="button" href="/openapi.json">OpenAPI JSON</a>
    </div>
    <dl>
      <dt>سلامت سرویس</dt><dd>/api/health</dd>
      <dt>نسخه API</dt><dd>/api/v1</dd>
      <dt>مشخصات سرویس</dt><dd>/api</dd>
    </dl>
    <footer>برای پاسخ ماشین‌خوان، همین مسیر را با <code>Accept: application/json</code> فراخوانی کنید.</footer>
  </main>
</body>
</html>"""


def _wants_html(request: Request) -> bool:
    return "text/html" in request.headers.get("accept", "")


@app.get("/", include_in_schema=False)
def root(request: Request):
    """Human-friendly landing page for browsers, service descriptor for clients."""
    if _wants_html(request):
        return HTMLResponse(_landing_page())
    return _service_descriptor()


@app.get("/api", tags=["System"], summary="API root")
def api_root() -> dict[str, Any]:
    """Service descriptor, same payload as `/` but documented in the schema."""
    return _service_descriptor()


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    """Root-level alias for hosting-platform health probes."""
    return {"status": "ok"}


@app.get("/api/health", tags=["System"], summary="Health check")
def api_health() -> dict[str, str]:
    return {"status": "ok"}
