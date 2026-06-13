# ShahrAra — Municipal Engagement System

Bilingual (Persian/English) civic platform for reporting urban problems, submitting
city improvement ideas, tracking request status in real-time, and voting on community
submissions. Connects citizens directly with municipal administrators via an
interactive map interface.

---

## Architecture

```
ShahrAra/
├── frontend/                     # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   shadcn/ui (radix-vega style, RTL)
│   │   │   │   ├── badge.tsx         Variants: default/secondary/destructive/outline/ghost/link
│   │   │   │   ├── button.tsx        Variants: default/outline/secondary/ghost/destructive/link
│   │   │   │   │                       Sizes: default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg
│   │   │   │   ├── card.tsx          Card, CardHeader, CardTitle, CardDescription, CardAction,
│   │   │   │   │                       CardContent, CardFooter; size prop (default/sm), RTL-aware
│   │   │   │   ├── dialog.tsx        Full Radix dialog primitives
│   │   │   │   ├── input.tsx         Styled input with focus ring, dark mode, aria-invalid
│   │   │   │   ├── select.tsx        Full Radix select primitives, RTL support
│   │   │   │   ├── separator.tsx     Radix separator (horizontal/vertical)
│   │   │   │   ├── textarea.tsx      Styled textarea with field-sizing
│   │   │   │   └── toggle-group.tsx  Radix toggle group, RTL support
│   │   │   ├── AdminPanel.tsx        Admin dashboard for request mgmt
│   │   │   ├── AuthModal.tsx         Login/register modal
│   │   │   ├── Hero.tsx              Landing page hero with stats
│   │   │   ├── LogoutModal.tsx       Logout confirmation (shadcn AlertDialog)
│   │   │   ├── MapComponent.tsx      Leaflet interactive map
│   │   │   ├── Navbar.tsx            Navigation, auth, theme toggle
│   │   │   ├── ReportsDirectory.tsx  Public listing with filter/search/map/detail modal
│   │   │   ├── RequestForm.tsx       Problem/idea form + map picker
│   │   │   └── mode-toggle.tsx       Light/dark mode toggle
│   │   ├── lib/
│   │   │   └── utils.ts             cn() — clsx + tailwind-merge
│   │   ├── utils/
│   │   │   └── numberUtils.ts       toPersianDigits / toEnglishDigits
│   │   ├── App.tsx                  Root app (state-based tab switching, API calls)
│   │   ├── main.tsx                 Entry point (React 19 createRoot)
│   │   ├── types.ts                 User, RequestItem, Stats, RequestStatus, RequestType
│   │   └── index.css                Tailwind CSS v4 + Iran Yekan X + shadcn theme vars
│   ├── components.json             shadcn/ui config (radix-vega, RTL, neutral base)
│   ├── vite.config.ts              @vitejs/plugin-react, @tailwindcss/vite, @/ alias, /api proxy
│   ├── tsconfig.json               ES2022, bundler resolution, react-jsx, @/ path alias
│   ├── package.json
│   ├── index.html                  lang=fa, dir=rtl, dark bg default
│   └── public/
│       ├── favicon.svg
│       └── assets/fonts/iran-yekan-x/  11 Iran Yekan X .ttf files
│
├── backend/                      # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py           Login/register (admin detection, auto-create)
│   │   │   │   └── requests.py       CRUD + likes + status update
│   │   │   └── router.py             Route aggregation + /api/stats endpoint
│   │   ├── core/config.py            DATABASE_URL, ADMIN_PHONE, ADMIN_NATIONAL_ID from env
│   │   ├── db/session.py             SQLAlchemy engine + SessionLocal + get_db dependency
│   │   ├── models/models.py          User + Request ORM (UUID-based IDs, property aliases)
│   │   └── schemas/schemas.py        Pydantic v2 schemas (camelCase aliases, populate_by_name)
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py              Integration tests (health, auth, CRUD, likes, stats)
│   ├── main.py                      FastAPI app with CORS, router, /api/health
│   ├── pyproject.toml               Ruff config (py39, line-length 100)
│   ├── requirements.txt             fastapi, uvicorn, sqlalchemy, pydantic, python-multipart, ruff
│   ├── .env.example
│   └── .env                        (gitignored)
│
├── logo/                           # Brand assets (icon grid.png, logo.png, شهرآرا.ai)
├── Makefile                        # Default goal: help; grouped targets by category
├── AGENTS.md                       # This file
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

| Method | Endpoint                    | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| POST   | `/api/auth/login`           | Login/register (phone + nationalId)              |
| GET    | `/api/requests`             | List (search, type, category, status, userPhone) |
| POST   | `/api/requests`             | Create request                                   |
| PUT    | `/api/requests/{id}/status` | Update status (admin only)                       |
| POST   | `/api/requests/{id}/like`   | Toggle like                                      |
| GET    | `/api/stats`                | Aggregate statistics                             |
| GET    | `/api/health`               | Health check                                     |

---

## Admin Credentials (Development)

| Field       | Value         |
| ----------- | ------------- |
| Phone       | `09120000000` |
| National ID | `1234567890`  |

---

## Domain Model

### Request Types

- `problem` — urban issue report (pothole, lighting, waste, etc.)
- `idea` — city improvement suggestion

### Request Statuses

- `submitted` → `under_review` → `in_progress` → `resolved` / `archived`

### Categories (7 Persian)

- آسفالت و معابر, زیباسازی و فضای سبز, نورپردازی و روشنایی, نظافت و جمع‌آوری زباله, حمل و نقل عمومی, فضای عمومی و پارک‌ها, سایر

---

## Development Workflow

### Makefile targets

```bash
make                # Show grouped help (default goal)
make install        # Install all deps (both frontend + backend)
make install-backend# pip install -r requirements.txt
make install-frontend# npm install
make dev            # Run both servers concurrently
make dev-backend    # uvicorn main:app --reload --port 8000
make dev-frontend   # npm run dev
make build          # npm run build (frontend)
make lint           # ruff check + tsc --noEmit
make lint-backend   # ruff check . (--fix)
make lint-frontend  # npx tsc --noEmit
make format         # ruff format . + prettier
make format-backend # ruff format .
make format-frontend# npx prettier --write "src/**/*.{ts,tsx,css}"
make test           # python3 -m tests.test_api
make test-backend   # python3 -m tests.test_api
make db-reset       # Delete & recreate SQLite database
make clean          # Remove artifacts + cache + database + node_modules
make clean-backend  # Remove __pycache__ + *.db
make clean-frontend # Remove dist + node_modules
```

### Python (Backend) style

Linting and formatting are handled by [Ruff](https://docs.astral.sh/ruff/):

```bash
make lint-backend     # ruff check . --fix
make format-backend   # ruff format .
```

Configuration is in `backend/pyproject.toml` (py39, line-length 100, double quotes).

### Frontend style

```bash
make lint-frontend    # npx tsc --noEmit
make format-frontend  # npx prettier --write "src/**/*.{ts,tsx,css}"
```

---

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<body>  (optional)
```

### Types

| Type       | Usage                                    |
| ---------- | ---------------------------------------- |
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `docs`     | Documentation changes                    |
| `style`    | Code formatting (whitespace, semicolons) |
| `refactor` | Code restructuring (no behavior change)  |
| `test`     | Adding/modifying tests                   |
| `chore`    | Maintenance (deps, tooling, CI)          |

### Examples

```
feat(auth): add national ID validation for Iranian citizens
fix(map): correct marker positioning on coordinate click
refactor(api): extract stats endpoint to router
chore(deps): add ruff to requirements.txt
```

---

## Environment Variables

| Variable            | Default                    | Description             |
| ------------------- | -------------------------- | ----------------------- |
| `DATABASE_URL`      | `sqlite:///./shahr_ara.db` | SQLite database path    |
| `ADMIN_PHONE`       | `09120000000`              | Admin user phone number |
| `ADMIN_NATIONAL_ID` | `1234567890`               | Admin user national ID  |
| `ADMIN_FIRST_NAME`  | `Admin`                    | Admin user first name   |
| `ADMIN_LAST_NAME`   | `Admin`                    | Admin user last name    |
| `JWT_SECRET`        | —                          | JWT signing secret      |
| `JWT_ALGORITHM`     | `HS256`                    | JWT algorithm           |
| `JWT_EXPIRATION_MINUTES` | `1440`                 | JWT expiration in min   |

Copy `backend/.env.example` to `backend/.env` and adjust as needed.

---

## Frontend Architecture

### Component Hierarchy

```
App (state: currentTab, currentUser, theme, requests, stats)
├── Navbar (tabs, theme toggle, auth controls, mobile bottom bar)
├── [currentTab]
│   ├── home:  Hero → StatsSection
│   ├── reports: ReportsDirectory (grid + map toggle, detail modal)
│   ├── submit: RequestForm (with MapComponent picker)
│   └── admin: AdminPanel (list + detail action panel with MapComponent)
├── Footer
└── AuthModal (conditional overlay, login/register toggle)
```

### Key Design Decisions

- **No React Router** — state-based tab switching via `currentTab` in App.tsx
- **shadcn/ui radix-vega style** — RTL-first, neutral base color, lucide icons
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin, `tw-animate-css` for animations
- **Motion library** (`motion` v12) — for enter/exit animations
- **Icons** — `hugeicons-react` (Navbar, Hero) + `lucide-react` (shadcn default)
- **Theme** — `.dark` class toggled on `<html>` + `<body>`, persisted in `localStorage.shahr_ara_theme`
- **Session** — user object in `localStorage.shahr_ara_user`
- **Loading state** — spinner with Persian text while fetching initial data

### Map (Leaflet)

- Two modes: `pickerMode` (click/drag to place marker) and `display` (show items with popups)
- Custom SVG div icons (red=problem, emerald=idea, cyan=picker)
- CartoDB tile layers (Voyager light / Dark matter dark)
- Qom region heuristic via lat/lng boundary checks

---

## Backend Architecture

### ORM Models

**User** (`users` table)

- `id` — UUID-based (`usr_xxxxxxxx`)
- `phone` — unique index
- `national_id`, `first_name`, `last_name`, `is_admin`
- Property aliases: `nationalId`, `firstName`, `lastName`, `isAdmin`

**Request** (`requests` table)

- `id` — UUID-based (`req_xxxxxxxx`)
- `title`, `description`, `type`, `category`
- `lat`, `lng` — stored as strings
- `region`, `status`, `user_phone`, `user_name`
- `created_at` — server default `func.now()`
- `admin_response`, `likes` (integer)
- Property aliases: `coordinates` (returns dict), `userPhone`, `userName`, `createdAt`, `adminResponse`

### Schemas (Pydantic v2)

- All use `model_config = {"populate_by_name": True}` for camelCase ↔ snake_case mapping
- `UserCreate`, `UserResponse`, `RequestCreate`, `RequestResponse`, `StatsResponse`
- `RequestType` / `RequestStatus` enums duplicated in both models.py and schemas.py

### Auth Logic

- Hardcoded admin check against env vars → auto-creates admin user if missing
- Admin user's first_name and last_name are synced from env vars on every login
- Existing user matched by phone → national_id must match
- New user → requires firstName + lastName (registration)

### Like System

- Currently increments `likes` counter unconditionally
- `likedBy` array exists in frontend `types.ts` but NOT implemented in backend

### Tests

- `tests/test_api.py` — sequential integration tests using `TestClient`
- Creates isolated `shahr_ara_test.db`, runs all tests, cleans up
- Run via: `make test` or `python3 -m tests.test_api`

---

## Common Patterns

- `cn(...)` utility from `@/lib/utils` for conditional class merging (clsx + tailwind-merge)
- Persian digit conversion: `toPersianDigits()` in all numeric displays
- UI components accept `className` prop merged via `cn()`
- Frontend proxies `/api/*` → FastAPI (port 8000) via Vite `proxy` config
- Database file: `backend/shahr_ara.db` (SQLite, auto-created on first run)
- Gitignore has patterns for Python, Node, database, environment, IDE, OS, and build artifacts

---

## Known Gaps

- `likedBy: string[]` in frontend `types.ts` but backend only tracks `likes` count (no per-user tracking)
- No `format` alias for `make format` (currently runs both ruff + prettier)
- Frontend uses both `hugeicons-react` and `lucide-react` icon sets

---

## License

Apache-2.0
