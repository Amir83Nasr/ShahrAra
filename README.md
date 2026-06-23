# ShahrAra — Municipal Engagement System

![ShahrAra Logo](docs/icons/icon.svg)

Bilingual (Persian/English) civic platform for reporting urban problems, submitting
city improvement ideas, tracking request status in real-time, and voting on community
submissions. Connects citizens directly with municipal administrators via an
interactive map interface.

---

## Screenshots

### Home Page

![Home Page](docs/images/صفحه%20اصلی.png)

### Reports & Ideas

![Reports & Ideas](docs/images/گزارش%20و%20ایده.png)

### Submit Request

![Submit Request](docs/images/ثبت%20درخواست%20جدید.png)

### Admin Panel

![Admin Panel](docs/images/پنل%20مدیریت.png)

### My Profile

![My Profile](docs/images/my%20profile.png)

### Dark Mode

![Dark Mode](docs/images/تم%20دارک.png)

---

## Architecture

```
ShahrAra/
├── frontend/                     # React 19 + Vite + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   shadcn/ui (radix-vega style, RTL)
│   │   │   │   ├── alert-dialog.tsx  Radix AlertDialog (confirm modals)
│   │   │   │   ├── badge.tsx         Variants: default/secondary/destructive/outline
│   │   │   │   ├── button.tsx        Variants: default/outline/secondary/ghost/destructive
│   │   │   │   │                       Sizes: default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg
│   │   │   │   ├── card.tsx          Card, CardHeader, CardTitle, CardDescription,
│   │   │   │   │                       CardContent, CardFooter; size prop, RTL-aware
│   │   │   │   ├── dialog.tsx        Full Radix dialog primitives, RTL support
│   │   │   │   ├── dropdown-menu.tsx Radix dropdown with RTL support
│   │   │   │   ├── input.tsx         Styled input with focus ring, dark mode, aria-invalid
│   │   │   │   ├── radio-group.tsx   Radix radio group (RTL-aware)
│   │   │   │   ├── select.tsx        Full Radix select primitives, RTL support
│   │   │   │   ├── separator.tsx     Radix separator (horizontal/vertical)
│   │   │   │   ├── textarea.tsx      Styled textarea with field-sizing
│   │   │   │   ├── toggle.tsx        Radix toggle button
│   │   │   │   └── toggle-group.tsx  Radix toggle group, RTL support
│   │   │   ├── AdminPanel.tsx        Admin dashboard for request mgmt
│   │   │   ├── AuthModal.tsx         Login/register modal
│   │   │   ├── ErrorBoundary.tsx     React class-based error boundary (Persian UI)
│   │   │   ├── Hero.tsx              Landing page hero with stats
│   │   │   ├── LogoutModal.tsx       Logout confirmation (AlertDialog)
│   │   │   ├── MapComponent.tsx      Leaflet interactive map (Qom, Iran)
│   │   │   ├── mode-toggle.tsx       Dark/light theme toggle with CSS view-transition
│   │   │   ├── Navbar.tsx            Navigation, auth controls, theme toggle,
│   │   │   │                         notification bell dropdown, user dropdown
│   │   │   ├── ReportsDirectory.tsx  Public listing with search/filter/map/detail modal
│   │   │   ├── RequestForm.tsx       Problem/idea submission + map picker + auto region
│   │   │   └── UserProfile.tsx       My/liked requests, edit/delete own, card detail dialog
│   │   ├── lib/
│   │   │   └── utils.ts             cn() — clsx + tailwind-merge
│   │   ├── utils/
│   │   │   ├── apiCache.ts          Stale-while-revalidate in-memory cache (30s TTL)
│   │   │   ├── numberUtils.ts       toPersianDigits / toEnglishDigits converters
│   │   │   ├── persianDate.ts       Jalali date formatting helpers
│   │   │   └── regionUtils.ts       determineRegion() — lat/lng → Qom district (1-8)
│   │   ├── App.tsx                  Root app (state-based tab switching, data fetching)
│   │   ├── main.tsx                 Entry point (React 19 createRoot)
│   │   ├── types.ts                 User, RequestItem, Stats, RequestStatus, RequestType
│   │   └── index.css                Tailwind v4 + Iran Yekan X + shadcn theme vars + dark mode
│   ├── components.json             shadcn/ui config (radix-vega, RTL, neutral, lucide)
│   ├── vite.config.ts              @vitejs/plugin-react, @tailwindcss/vite, @/ alias, /api proxy
│   ├── tsconfig.json               ES2022, bundler resolution, react-jsx, @/ path alias
│   ├── package.json
│   ├── index.html                  lang=fa, dir=rtl
│   └── public/
│       ├── favicon.svg
│       └── assets/fonts/iran-yekan-x/  11 Iran Yekan X .ttf files (Regular–Black)
│
├── backend/                      # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py           Login/register (phone + national ID, admin auto-create)
│   │   │   │   └── requests.py       CRUD + like toggle + admin status update
│   │   │   └── router.py             Route aggregation + /api/v1/stats endpoint
│   │   ├── core/
│   │   │   ├── config.py             DATABASE_URL, JWT settings, admin creds from env
│   │   │   ├── errors.py             Persian error messages + exception handlers
│   │   │   └── security.py           JWT creation, get_current_user, require_admin
│   │   ├── db/
│   │   │   └── session.py            SQLAlchemy engine + SessionLocal + get_db generator
│   │   ├── models/
│   │   │   └── models.py             User, Request, Like ORM models
│   │   └── schemas/
│   │       └── schemas.py            Pydantic v2 schemas (camelCase aliases, populate_by_name)
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py               Test fixtures (isolated SQLite DB, client, auth tokens)
│   │   ├── test_auth.py              Register, login, admin auth, parametrized tests
│   │   ├── test_health.py            Health check, API root, root redirect
│   │   └── test_requests.py          CRUD, likes toggle, status update, stats, like-aware listing
│   ├── main.py                      FastAPI app with CORS, router, exception handlers
│   ├── seed.py                      Seed 60 sample requests and 4 users
│   ├── pyproject.toml               Ruff config (py39, line-length 100)
│   ├── requirements.txt             fastapi, uvicorn, sqlalchemy, pydantic, python-jose, ruff
│   ├── .env.example                 Environment variable template
│   └── .env                        (gitignored)
│
├── docs/                           # Project documentation & visual assets
│   ├── شرح پروژه شهرآرا.docx       Project specification document
│   ├── icons/
│   │   └── icon.svg                 App logo (mountain/city silhouette)
│   └── images/
│       ├── صفحه اصلی.png            Home page screenshot
│       ├── گزارش و ایده.png         Reports & ideas directory screenshot
│       ├── ثبت درخواست جدید.png      Request submission form screenshot
│       ├── پنل مدیریت.png           Admin panel screenshot
│       └── تم دارک.png             Dark mode screenshot
│
├── scripts/
│   └── ascii_logo.py               ASCII logo generator (used in `make help`)
├── Makefile                        # Grouped targets: install, dev, lint, format, test, db
├── .pre-commit-config.yaml         # Ruff, Prettier, ESLint, trailing-whitespace hooks
├── .gitignore
├── README.md                       # This file
└── LICENSE                         # Apache 2.0
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
npm run dev                          # → http://localhost:3000
```

Or use the Makefile:

```bash
make install        # Install all dependencies
make dev-backend    # Start backend server (port 8000)
make dev-frontend   # Start frontend dev server (port 3000)
```

---

## API Endpoints

| Method | Endpoint                                     | Description                                           | Auth     |
| ------ | -------------------------------------------- | ----------------------------------------------------- | -------- |
| GET    | `/`                                          | Redirect to Swagger docs                              | —        |
| GET    | `/api`                                       | API root (version info)                               | —        |
| GET    | `/api/health`                                | Health check                                          | —        |
| GET    | `/api/v1/stats`                              | Aggregate statistics                                  | —        |
| POST   | `/api/v1/auth/login`                         | Login/register (phone + nationalId)                   | —        |
| GET    | `/api/v1/requests`                           | List (search, type, category, status, region,         | —        |
|        |                                              | userPhone, limit, offset, sort, date range)           |          |
| POST   | `/api/v1/requests`                           | Create request (problem or idea)                      | —        |
| GET    | `/api/v1/requests/{id}`                      | Get single request by ID                              | —        |
| PUT    | `/api/v1/requests/{id}`                      | Edit own request (title, description, category)       | User     |
| DELETE | `/api/v1/requests/{id}`                      | Delete own submitted request                          | User     |
| PUT    | `/api/v1/requests/{id}/status`               | Update status + admin response                        | Admin    |
| POST   | `/api/v1/requests/{id}/like`                 | Toggle like per user                                  | —        |
| GET    | `/api/v1/requests/user/{phone}/stats`        | User stats (total requests, likes received)           | —        |
| GET    | `/api/v1/notifications`                      | List notifications for a user                         | —        |
| PUT    | `/api/v1/notifications/{id}/read`            | Mark notification as read                             | —        |

Swagger UI is available at `http://localhost:8000/docs`.

---

## Admin Credentials (Development)

| Field       | Value                 |
| ----------- | --------------------- |
| Phone       | `09120000000`         |
| National ID | `1234567890`          |

Configured in `backend/.env` — change for production.

---

## Domain Model

### Request Types

- **`problem`** — urban issue report (pothole, broken lights, waste accumulation, etc.)
- **`idea`** — city improvement suggestion (green spaces, smart city, cultural initiatives)

### Request Statuses

```
submitted → under_review → in_progress → resolved / archived
```

### Categories (7 Persian)

- آسفالت و معابر (Asphalt & Roads)
- زیباسازی و فضای سبز (Beautification & Green Space)
- روشنایی و برق شهری (Lighting & Urban Electricity)
- مدیریت پسماند و بازیافت (Waste Management & Recycling)
- ترافیک و حمل و نقل (Traffic & Transportation)
- مناسب‌سازی و خدمات اجتماعی (Accessibility & Social Services)
- سایر (Other)

---

## Development Workflow

### Makefile targets

```bash
make                  # Show grouped help (default goal)
make install          # Install all deps (both frontend + backend)
make dev              # Run both servers concurrently
make dev-backend      # uvicorn main:app --reload --port 8000
make dev-frontend     # npm run dev (port 3000)
make build            # npm run build (frontend)
make lint             # ruff check + eslint + tsc --noEmit
make format           # ruff format + prettier
make test             # python3 -m pytest tests/ -v
make db-reset         # Delete & recreate database + seed
make seed             # Seed database with 60 sample requests
make clean            # Remove cache and build artifacts
```

### Testing

```bash
make test             # Run all backend integration tests
# or directly:
cd backend && python3 -m pytest tests/ -v
```

Tests use an isolated temporary SQLite database with `TestClient` — no setup required.
Fixtures in `conftest.py` provide: `client`, `user_token`, `admin_token`, `sample_request`, etc.

### Python (Backend) style

```bash
make lint-backend     # ruff check --fix .
make format-backend   # ruff format .
```

Configuration in `backend/pyproject.toml` (py39, line-length 100, double quotes).

### Frontend style

```bash
make lint-frontend    # npx tsc --noEmit && npx eslint .
make format-frontend  # npx prettier --write "src/**/*.{ts,tsx,css}"
```

---

## Commit Convention

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

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

| Variable                | Default                    | Description               |
| ----------------------- | -------------------------- | ------------------------- |
| `DATABASE_URL`          | `sqlite:///./shahr_ara.db` | SQLite database path      |
| `ADMIN_PHONE`           | `09120000000`              | Admin user phone number   |
| `ADMIN_NATIONAL_ID`     | `1234567890`               | Admin user national ID    |
| `ADMIN_FIRST_NAME`      | `Admin`                    | Admin user first name     |
| `ADMIN_LAST_NAME`       | `Admin`                    | Admin user last name      |
| `JWT_SECRET`            | —                          | JWT signing secret        |
| `JWT_ALGORITHM`         | `HS256`                    | JWT algorithm             |
| `JWT_EXPIRATION_MINUTES`| `1440`                     | JWT expiration in minutes |

Copy `backend/.env.example` to `backend/.env` and adjust as needed.

---

## Frontend Architecture

### Component Hierarchy

```
App (state: currentTab, currentUser, theme, requests, stats, apiError, notifications)
├── Navbar (tabs, user dropdown, auth controls, theme toggle, mobile bottom bar,
│          notification bell with dropdown)
├── API Error Banner (dismissable)
├── ErrorBoundary (catches render errors, retry button)
├── [loading ? Spinner : currentTab]
│   ├── home:     Hero
│   ├── reports:  ReportsDirectory (filter bar + category chips + sort + date range +
│   │              region filter + grid with 2-line cards + map + detail dialog)
│   ├── submit:   RequestForm (with MapComponent picker + auto region detection +
│   │              region override selector + helper panels)
│   ├── profile:  UserProfile (sub-tabs: my/liked requests, search/filter bar,
│   │              region filter, edit/delete, cards with detail dialog + map)
│   └── admin:    AdminPanel (searchable list + filters + region filter +
│                  detail/response panel with MapComponent)
├── Footer (nav links, copyright)
├── AuthModal (conditional overlay, login/register toggle with Persian validation)
└── LogoutModal (confirmation dialog)
```

### Key Design Decisions

- **No React Router** — state-based tab switching via `currentTab` in `App.tsx`
- **shadcn/ui radix-vega style** — RTL-first, neutral base color, custom theme tokens
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin, `tw-animate-css` for animations
- **Stale-while-revalidate data fetching** — in-memory `Map` cache with 30s TTL, serves cached data instantly then revalidates in background
- **Icons** — `lucide-react` throughout (except logo which is an inline SVG)
- **Theme** — `.dark` class on `<html>` + `<body>`, CSS view-transition animation, persisted in `localStorage`
- **Session** — user object (including JWT token) in `localStorage.shahr_ara_user`
- **Persian UX** — full Persian UI, inverse RTL layout, Persian digit conversion everywhere

### Map (Leaflet)

- Two modes: **picker** (click/drag to place marker on submission) and **display** (show all items with popup cards)
- Custom SVG div icons: red (`#f87171`) = problem, emerald (`#10b981`) = idea, blue (`#3b82f6`) = picker
- CartoDB tile layers: Voyager (light) / Dark Matter (dark) — adaptive
- Qom region heuristic via lat/lng boundary checks (5 districts)

---

## Backend Architecture

### ORM Models

**User** (`users` table)

- `id` — UUID-based (`usr_xxxxxxxx`)
- `phone` — unique index, primary identifier
- `national_id`, `first_name`, `last_name`, `is_admin`
- Property aliases: `nationalId`, `firstName`, `lastName`, `isAdmin`

**Request** (`requests` table)

- `id` — UUID-based (`req_xxxxxxxx`)
- `title`, `description`, `type`, `category`
- `lat`, `lng` — stored as strings, exposed as `coordinates` dict
- `region`, `status`, `user_phone`, `user_name`
- `created_at` — server default `func.now()`
- `admin_response` — nullable text
- `likes` — integer counter
- Property aliases: `coordinates`, `userPhone`, `userName`, `createdAt`, `adminResponse`

**Like** (`likes` table)

- `id` — UUID-based (`lik_xxxxxxxx`)
- `user_phone` + `request_id` — unique constraint (one like per user per request)

### Schemas (Pydantic v2)

- All use `model_config = {"populate_by_name": True}` for camelCase ↔ snake_case
- `UserCreate`, `UserResponse`, `TokenResponse`, `LoginResponse`
- `RequestCreate`, `RequestResponse`, `CreateRequestResponse`
- `StatusUpdate`, `StatusUpdateResponse`, `LikeRequest`, `LikeResponse`
- `StatsResponse` (total, problems, ideas, byStatus, byCategory)
- `ErrorResponse` — consistent Persian error format

### Auth Logic

1. If phone + national ID match admin env vars → auto-create/sync admin user, return admin token
2. If phone exists → verify national ID match, return token
3. If new phone → require firstName + lastName, auto-register user, return token
4. Tokens include `sub` (phone) and `is_admin` — no refresh tokens

### Like System

- Toggle: one like per `(user_phone, request_id)` pair
- `UNIQUE CONSTRAINT` prevents duplicates
- `likedByCurrentUser` flag returned when `currentUserPhone` query param is provided
- Frontend shows filled/unfilled heart with optimistic update

### Error Handling

- Custom `http_exception_handler`, `validation_exception_handler`, `generic_exception_handler`
- All errors return `{ success: false, error: { code, message, fields? } }` format
- All errors return `{ success: false, error: { code, message, fields? } }` format
- Persian error messages throughout (16 distinct Persian error strings)
- Default Starlette status phrases are detected and replaced with Persian equivalents

---

## Common Patterns

- `cn(...)` utility — conditional class merging (clsx + tailwind-merge)
- Persian digit conversion — `toPersianDigits()` / `toEnglishDigits()` in `numberUtils.ts`
- UI components accept `className` prop merged via `cn()`
- Frontend proxies `/api/*` → FastAPI (port 8000) via Vite `proxy` config
- Database: `backend/shahr_ara.db` (SQLite, auto-created on first run)
- Seeded data: 60 sample requests (65% problems, 35% ideas) across 7 categories and 5 regions

---

## Known Gaps

- No database migration system — schema changes require manual migration or delete-and-reset
- No notification system — users are not notified when their request status changes
- No image upload — request descriptions are text-only
- No pagination on `/api/v1/requests` — returns all records at once
- No refresh token mechanism — tokens expire after 24 hours with no way to renew
- No user profile page — users cannot view or edit their submitted requests

---

## License

Apache-2.0
