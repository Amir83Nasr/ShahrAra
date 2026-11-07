# Backend Guide

FastAPI service for ShahrAra: citizens report urban problems and submit
improvement ideas, administrators move requests through a review lifecycle, and
status changes notify the request owner.

- **Runtime** — Python 3.14, FastAPI, SQLAlchemy 2, PostgreSQL
- **Auth** — JWT bearer tokens, issued after OTP or password sign-in
- **Docs** — Swagger UI at `/docs`, ReDoc at `/redoc`, schema at `/openapi.json`

## Layout

```
backend/
├── main.py                    App wiring, landing page, health checks
├── app/
│   ├── api/
│   │   ├── docs.py            OpenAPI metadata, landing page, Swagger theme
│   │   ├── responses.py       Shared error response declarations
│   │   └── v1/
│   │       ├── router.py      Route assembly + /stats
│   │       └── endpoints/     auth, requests, notifications
│   ├── core/                  Config, security, error handlers
│   ├── db/session.py          Engine and session factory
│   ├── models/models.py       SQLAlchemy models
│   └── schemas/               Pydantic request/response models
├── migrations/                Alembic migrations
├── scripts/seed.py            Sample data
└── tests/                     Pytest suite
```

## Running

```bash
make install        # uv sync + pnpm install
make db-up          # start PostgreSQL
make db-migrate     # apply migrations
make seed           # optional sample data
make dev-backend    # http://localhost:8000
make test           # backend tests
```

| URL | Purpose |
| --- | --- |
| `/` | Persian landing page in a browser, JSON descriptor for API clients |
| `/docs` | Swagger UI |
| `/redoc` | ReDoc |
| `/openapi.json` | OpenAPI 3.1 schema |
| `/api` | Service descriptor |
| `/api/health` | Health check |

## Configuration

Loaded from `backend/.env` (see `.env.example`); the process environment wins.

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | local Postgres | Pooled URL in production |
| `DATABASE_URL_UNPOOLED` | `DATABASE_URL` | Required for migrations on pooled hosts |
| `JWT_SECRET` | dev placeholder | **Must** be set in production |
| `JWT_ALGORITHM` | `HS256` | |
| `JWT_EXPIRATION_MINUTES` | `1440` | 24-hour tokens |
| `ADMIN_PHONE` / `ADMIN_NATIONAL_ID` / `ADMIN_FIRST_NAME` / `ADMIN_LAST_NAME` | dev values | Admin account is created on first contact |
| `OTP_EXPIRATION_MINUTES` | `2` | Code lifetime |
| `OTP_MAX_ATTEMPTS` | `5` | Wrong guesses before the code is locked |
| `OTP_DEV_MODE` | `true` | Returns `devCode` instead of sending SMS; **never** enable in production |
| `CORS_ORIGINS` | localhost origins | Comma-separated allow-list |

## Authentication

### OTP flow

1. `POST /api/v1/auth/otp/request` with `{"phone": "09123456789"}`.
   One active code per phone; requesting again invalidates the previous one.
2. `POST /api/v1/auth/otp/verify` with the phone and the six-digit code.
   First-time users add `firstName`, `lastName`, and `nationalId`.
3. Use the returned `accessToken` as `Authorization: Bearer <token>`.

In development the code is returned as `devCode` and also printed to the server
log. No SMS provider is wired yet — replace `_deliver_sms` in
`app/api/v1/endpoints/auth.py` before production. Codes expire after
`OTP_EXPIRATION_MINUTES` and are locked after `OTP_MAX_ATTEMPTS` wrong guesses.

### Password sign-in

- `POST /api/v1/auth/login/password` — accounts that already have a password.
- `PUT /api/v1/auth/password` — set the first password, or rotate an existing
  one by supplying `currentPassword`.

The admin account is auto-created from the `ADMIN_*` variables the first time its
phone is seen, so the seeded admin never needs to register manually.

```bash
# OTP login
curl -s localhost:8000/api/v1/auth/otp/request \
  -H 'Content-Type: application/json' \
  -d '{"phone":"09123456789"}'

curl -s localhost:8000/api/v1/auth/otp/verify \
  -H 'Content-Type: application/json' \
  -d '{"phone":"09123456789","code":"123456","firstName":"Ali","lastName":"Rezaei","nationalId":"1234567890"}'
```

## Conventions

### JSON shape

- Field names are **camelCase** (`accessToken`, `createdAt`).
- Successful mutations wrap the resource with `success: true`.
- Errors always use one envelope:

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "درخواست مورد نظر یافت نشد."
  }
}
```

Validation failures add a `fields` array with dot-separated paths:

```json
{
  "success": false,
  "error": {
    "code": 422,
    "message": "داده‌های ارسالی از نظر ساختاری مشکل دارند.",
    "fields": [{ "field": "body.phone", "message": "String should match pattern..." }]
  }
}
```

### Enums

| Field | Values |
| --- | --- |
| `type` | `problem`, `idea` |
| `status` | `submitted`, `under_review`, `in_progress`, `resolved`, `archived` |

`type` and `status` query filters are enums in the OpenAPI schema, so Swagger
shows a dropdown and invalid values are rejected with `422`.

### Pagination

`GET /api/v1/requests` keeps backward compatibility:

- `limit=0` (default) → flat JSON array.
- `limit>0` → `{ "items": [...], "total": 42, "limit": 10, "offset": 0 }`.

### Dates and coordinates

- Timestamps are ISO 8601 strings in UTC (`2025-06-13T10:30:00`).
- Coordinates are WGS-84 `{ "lat": 35.7219, "lng": 51.3347 }`.
- `startDate` / `endDate` filter on creation time; `endDate` includes the whole
  day.

## Endpoint Reference

### Authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/check-phone` | — | Registration state and password availability |
| `POST` | `/api/v1/auth/otp/request` | — | Send a one-time code |
| `POST` | `/api/v1/auth/otp/verify` | — | Verify the code, register if needed, return a token |
| `POST` | `/api/v1/auth/login/password` | — | Password sign-in |
| `PUT` | `/api/v1/auth/password` | Bearer | Set or rotate the password |

### Requests

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/requests` | — | List with search, filters, sorting, pagination |
| `POST` | `/api/v1/requests` | Bearer | Create a problem report or idea |
| `PUT` | `/api/v1/requests/{id}` | Bearer | Edit your own request |
| `DELETE` | `/api/v1/requests/{id}` | Bearer | Delete your own `submitted` request |
| `POST` | `/api/v1/requests/{id}/like` | Bearer | Toggle a like |
| `PUT` | `/api/v1/requests/{id}/status` | Admin | Change status and optionally respond |
| `GET` | `/api/v1/requests/user/{phone}/stats` | — | Likes and request count for a user |

Listing supports `search`, `type`, `status`, `category`, `userPhone`,
`likedByUser`, `currentUserPhone`, `startDate`, `endDate`, `sort_by`
(`created_at` or `likes`), `sort_order`, `limit`, and `offset`.

Ownership and state rules:

- Only the owner can edit or delete; administrators cannot edit another user's
  content through these endpoints.
- Editing is allowed while the status is `submitted` or `under_review`.
- Deleting is allowed only while the status is `submitted`.
- A status change creates a notification for the owner unless an admin updates
  their own request.

### Notifications

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/notifications` | Bearer | Unread notifications, newest first |
| `PUT` | `/api/v1/notifications/{id}/read` | Bearer | Mark one as read |

Pass `includeRead=true` to include notifications that were already read.

### Statistics and system

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/stats` | — | Totals by type, status, and category |
| `GET` | `/api` | — | Service descriptor |
| `GET` | `/api/health` | — | Health check |

## Request Lifecycle

```
submitted ──▶ under_review ──▶ in_progress ──▶ resolved ──▶ archived
```

The API does not enforce transition order; administrators may move a request to
any status. Every change is recorded on the request and, except for self-edits,
notifies the owner.

## Documentation

- Tag order and descriptions live in `app/api/docs.py`.
- Shared error responses live in `app/api/responses.py`.
- Operation summaries, descriptions, and operation IDs are set on the endpoint
  decorators; request/response examples live in `app/schemas/`.
- The Swagger theme is the `_SWAGGER_THEME` string in `app/api/docs.py`.

Keep new endpoints on an existing tag and give them a stable `operation_id` so
generated clients do not break between releases.

## Database and Migrations

```bash
make db-revision m="add column"   # autogenerate
make db-migrate                   # upgrade head
```

Tests create and drop the `shahr_ara_test` database schema directly, so they do
not need migrations. They do require a running Postgres (`make db-up`).

## Testing and Linting

```bash
make test
make lint-backend
make format-backend
```

Tests cover auth (OTP limits, password flows), request CRUD and filters, likes,
pagination, notifications, stats, and the documentation endpoints.
