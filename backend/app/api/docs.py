"""Presentation layer for the generated API documentation.

Everything here is developer-facing: OpenAPI metadata, the browser landing page,
and a small theme on top of Swagger UI. Keeping it in one module keeps
``main.py`` focused on wiring the application together.
"""

from __future__ import annotations

from typing import Any

from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse, Response

NAME = "ShahrAra API"
VERSION = "1.1.0"

REPOSITORY_URL = "https://github.com/Amir83Nasr/ShahrAra"

TAGS_METADATA = [
    {
        "name": "Authentication",
        "description": "One-time-code (OTP) and password sign-in. "
        "Use the returned `accessToken` with the **Authorize** button.",
    },
    {
        "name": "Requests",
        "description": "Report urban problems, propose improvement ideas, "
        "track status, and vote on community submissions.",
    },
    {
        "name": "Notifications",
        "description": "Status-change notifications for the signed-in citizen.",
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

DESCRIPTION = (
    "ShahrAra connects citizens with their municipality: report urban problems, "
    "propose improvement ideas on a map, follow request status, and vote on "
    "community submissions.\n\n"
    "### Authentication\n"
    "1. `POST /api/v1/auth/otp/request` — receive a one-time code.\n"
    "2. `POST /api/v1/auth/otp/verify` — exchange it for an `accessToken`.\n"
    "3. Send `Authorization: Bearer <token>` on protected operations.\n\n"
    "In development the code is returned as `devCode` and written to the server "
    "log. Production delivery needs an SMS provider (see the backend guide).\n\n"
    "### Conventions\n"
    "- JSON fields use **camelCase**.\n"
    "- Every error shares one envelope: "
    '`{ "success": false, "error": { "code", "message", "fields?" } }`.\n'
    "- Request statuses: `submitted`, `under_review`, `in_progress`, `resolved`, "
    "`archived`.\n"
    "- Tokens are valid for 24 hours; **Authorize** persists across reloads."
)

LICENSE_INFO = {
    "name": "Apache 2.0",
    "url": "https://www.apache.org/licenses/LICENSE-2.0",
}

CONTACT = {
    "name": "ShahrAra",
    "url": REPOSITORY_URL,
}

SWAGGER_UI_PARAMETERS = {
    "defaultModelsExpandDepth": -1,
    "docExpansion": "list",
    "displayRequestDuration": True,
    "persistAuthorization": True,
    "filter": True,
}


def service_descriptor() -> dict[str, Any]:
    """Machine-readable service metadata served at ``/`` and ``/api``."""
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


def landing_page() -> str:
    """Human-friendly entry point served to browsers at ``/``."""
    return f"""<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{NAME}</title>
  <link rel="icon" href="/docs/favicon.svg" type="image/svg+xml">
  <style>
    :root {{
      color-scheme: light dark;
      --bg: #f8fafc;
      --card: #ffffff;
      --fg: #0f172a;
      --muted: #64748b;
      --brand: #0b8457;
      --brand-dark: #086b46;
      --line: #e2e8f0;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --bg: #0b1512;
        --card: #101d19;
        --fg: #eef5f3;
        --muted: #9db2ac;
        --brand: #34d399;
        --brand-dark: #6ee7b7;
        --line: #243530;
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
      box-shadow: 0 20px 50px rgb(15 23 42 / 6%);
    }}
    .brand {{ display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }}
    .mark {{
      width: 44px; height: 44px; border-radius: 13px;
      display: grid; place-items: center;
      background: var(--brand); color: #fff;
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
      transition: border-color .15s ease, background-color .15s ease;
    }}
    a.button:hover {{ border-color: var(--brand); }}
    a.primary {{ background: var(--brand); border-color: var(--brand); color: #fff; }}
    a.primary:hover {{ background: var(--brand-dark); border-color: var(--brand-dark); }}
    @media (prefers-color-scheme: dark) {{ a.primary {{ color: #06231a; }} }}
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


def swagger_ui(openapi_url: str) -> HTMLResponse:
    """Swagger UI with the ShahrAra theme layered on top of the stock styles."""
    response = get_swagger_ui_html(
        openapi_url=openapi_url,
        title=f"{NAME} — API Reference",
        swagger_favicon_url="/docs/favicon.svg",
        swagger_ui_parameters=SWAGGER_UI_PARAMETERS,
    )
    # FastAPI only exposes a single CSS slot, so keep the stock stylesheet and
    # append the brand theme just before the closing <head>.
    html = response.body.decode()
    html = html.replace(
        "</head>",
        '  <link rel="stylesheet" href="/docs/theme.css">\n</head>',
        1,
    )
    return HTMLResponse(html)


def swagger_theme() -> Response:
    """Minimal theme: brand accent, softer surfaces, no visual noise."""
    return Response(content=_SWAGGER_THEME, media_type="text/css")


def favicon() -> Response:
    """Small map-pin mark used by the docs pages."""
    return Response(
        content=(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
            '<rect width="64" height="64" rx="16" fill="#0b8457"/>'
            '<path fill="#fff" d="M32 13c-7.7 0-14 6.2-14 13.9 0 10.4 14 24.1 14 24.1'
            "s14-13.7 14-24.1C46 19.2 39.7 13 32 13Zm0 19.2a5.3 5.3 0 1 1 0-10.6 5.3 5.3 0"
            '0 1 0 10.6Z"/></svg>'
        ),
        media_type="image/svg+xml",
    )


_SWAGGER_THEME = """
:root {
  --sa-brand: #0b8457;
  --sa-brand-dark: #086b46;
  --sa-ink: #0f172a;
  --sa-muted: #64748b;
  --sa-line: #e2e8f0;
  --sa-surface: #f8fafc;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif;
}

.swagger-ui .topbar {
  background: var(--sa-brand);
}

.swagger-ui .topbar .download-url-wrapper .select-label select {
  border-color: rgba(255, 255, 255, 0.6);
}

.swagger-ui .info {
  margin: 36px 0 24px;
}

.swagger-ui .info .title {
  color: var(--sa-ink);
  letter-spacing: -0.01em;
}

.swagger-ui .info .title small {
  background: var(--sa-surface);
  border: 1px solid var(--sa-line);
  color: var(--sa-muted);
}

.swagger-ui .info .title small.version-stamp {
  background: var(--sa-brand);
  color: #fff;
}

.swagger-ui .scheme-container {
  background: transparent;
  box-shadow: none;
  border-bottom: 1px solid var(--sa-line);
  padding: 18px 0;
}

.swagger-ui .opblock-tag {
  border-bottom: 1px solid var(--sa-line);
  color: var(--sa-ink);
  font-size: 1.1rem;
}

.swagger-ui .opblock {
  border-radius: 10px;
  box-shadow: none;
}

.swagger-ui .opblock .opblock-summary {
  border-radius: 10px;
}

.swagger-ui .opblock.opblock-post {
  background: rgba(11, 132, 87, 0.04);
  border-color: var(--sa-brand);
}

.swagger-ui .opblock.opblock-get {
  background: rgba(14, 116, 144, 0.04);
  border-color: #0e7490;
}

.swagger-ui .opblock.opblock-put {
  background: rgba(245, 158, 11, 0.06);
  border-color: #d97706;
}

.swagger-ui .opblock.opblock-delete {
  background: rgba(220, 38, 38, 0.04);
  border-color: #dc2626;
}

.swagger-ui .btn.authorize {
  background: var(--sa-brand);
  border-color: var(--sa-brand);
  color: #fff;
}

.swagger-ui .btn.authorize svg {
  fill: #fff;
}

.swagger-ui .btn.authorize:hover {
  background: var(--sa-brand-dark);
}

.swagger-ui .btn.execute {
  background: var(--sa-brand);
  border-color: var(--sa-brand);
}

.swagger-ui .btn.execute:hover {
  background: var(--sa-brand-dark);
}

.swagger-ui select,
.swagger-ui input[type="text"],
.swagger-ui input[type="email"],
.swagger-ui textarea {
  border-radius: 8px;
}

.swagger-ui table thead tr th,
.swagger-ui table thead tr td {
  border-bottom: 1px solid var(--sa-line);
  color: var(--sa-muted);
  font-weight: 600;
}

.swagger-ui .model-container {
  background: var(--sa-surface);
  border-radius: 10px;
}
"""
