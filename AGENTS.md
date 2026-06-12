# ShahrAra — Municipal Engagement System

Bilingual (Persian/English) civic platform for reporting urban problems, submitting
city improvement ideas, tracking request status in real-time, and voting on community
submissions. Connects citizens directly with municipal administrators via an
interactive map interface.

---

## Architecture

```
شهرآرا/
├── frontend/                     # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── Navbar.tsx            Navigation, auth, theme toggle
│   │   │   ├── Hero.tsx              Landing page hero with stats
│   │   │   ├── RequestForm.tsx       Problem/idea form + map picker
│   │   │   ├── ReportsDirectory.tsx  Public listing with filter/search
│   │   │   ├── AdminPanel.tsx        Admin dashboard for request mgmt
│   │   │   ├── StatsSection.tsx      Analytics charts
│   │   │   ├── MapComponent.tsx      Leaflet interactive map
│   │   │   └── AuthModal.tsx         Login/register modal
│   │   ├── utils/
│   │   │   └── numberUtils.ts        Persian/English digit conversion
│   │   ├── App.tsx                   Root app (routing, state, API calls)
│   │   ├── main.tsx                  Entry point
│   │   ├── types.ts                  TypeScript interfaces
│   │   └── index.css                 Tailwind CSS + Iran Yekan X font
│   └── public/assets/fonts/          Iran Yekan X font files
│
├── backend/                      # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py           Login/register
│   │   │   │   └── requests.py       Request CRUD + likes
│   │   │   └── router.py             Route aggregation
│   │   ├── core/config.py            DB & admin configuration
│   │   ├── db/session.py             SQLAlchemy session management
│   │   ├── models/models.py          ORM models (User, Request)
│   │   └── schemas/schemas.py        Pydantic schemas
│   ├── main.py                    FastAPI entry point
│   ├── pyproject.toml             Ruff config + project metadata
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                       (gitignored)
│
├── Makefile                      # Dev, test, lint, build commands
├── AGENTS.md                     # This file
└── .gitignore
```

---

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                          # → http://localhost:5173
```

Or use the Makefile:

```bash
make install        # Install all dependencies
make dev-backend    # Start backend server (port 8000)
make dev-frontend   # Start frontend dev server (port 5173)
```

---

## API Endpoints

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|-----------------------------------|
| POST   | `/api/auth/login`           | Login/register (phone + nationalId)|
| GET    | `/api/requests`             | List (search, type, category, status, userPhone) |
| POST   | `/api/requests`             | Create request                     |
| PUT    | `/api/requests/{id}/status` | Update status (admin only)         |
| POST   | `/api/requests/{id}/like`   | Toggle like                        |
| GET    | `/api/stats`                | Aggregate statistics               |
| GET    | `/api/health`               | Health check                       |

---

## Admin Credentials (Development)

| Field       | Value        |
|-------------|-------------|
| Phone       | `09120000000`|
| National ID | `1234567890` |

---

## Domain Model

### Request Types
- `problem` — urban issue report (pothole, lighting, waste, etc.)
- `idea` — city improvement suggestion

### Request Statuses
- `submitted` → `under_review` → `in_progress` → `resolved` / `archived`

---

## Development Workflow

### Makefile targets

```bash
make install            # Install all deps (both frontend + backend)
make install-backend    # pip install -r requirements.txt
make install-frontend   # npm install
make dev                # Run both servers concurrently
make dev-backend        # uvicorn main:app --reload --port 8000
make dev-frontend       # npm run dev
make build              # npm run build (frontend)
make lint               # ruff check + tsc --noEmit
make lint-backend       # ruff check .
make lint-frontend      # npx tsc --noEmit
make format             # ruff format .
make test               # Run backend API tests
make db-reset           # Delete & recreate SQLite database
make clean              # Remove artifacts
```

### Python (Backend) style

Linting and formatting are handled by [Ruff](https://docs.astral.sh/ruff/):

```bash
make lint-backend     # ruff check .
make format           # ruff format .
```

Configuration is in `backend/pyproject.toml`.

### Frontend style

TypeScript checking via `tsc --noEmit`:
```bash
make lint-frontend    # npx tsc --noEmit
```

---

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<body>  (optional)
```

### Types

| Type       | Usage                                  |
|-----------|-----------------------------------------|
| `feat`    | New feature                             |
| `fix`     | Bug fix                                 |
| `docs`    | Documentation changes                    |
| `style`   | Code formatting (whitespace, semicolons) |
| `refactor`| Code restructuring (no behavior change)  |
| `test`    | Adding/modifying tests                   |
| `chore`   | Maintenance (deps, tooling, CI)          |

### Examples

```
feat(auth): add national ID validation for Iranian citizens
fix(map): correct marker positioning on coordinate click
refactor(api): extract stats endpoint to router
chore(deps): add ruff to requirements.txt
```

---

## Environment Variables

| Variable             | Default                    | Description              |
|----------------------|---------------------------|--------------------------|
| `DATABASE_URL`       | `sqlite:///./shahr_ara.db`| SQLite database path     |
| `ADMIN_PHONE`        | `09120000000`             | Admin user phone number  |
| `ADMIN_NATIONAL_ID`  | `1234567890`              | Admin user national ID   |

Copy `backend/.env.example` to `backend/.env` and adjust as needed.

---

## Common Patterns

- User session stored in `localStorage.shahr_ara_user`
- Theme preference stored in `localStorage.shahr_ara_theme`
- All numeric displays use Persian digits via `toPersianDigits()`
- Frontend proxies `/api/*` → FastAPI (port 8000) via Vite `proxy` config
- Database file: `backend/shahr_ara.db` (SQLite, auto-created on first run)

---

## License

Apache-2.0