# ShahrAra — Municipal Engagement Platform

<div align="center">

![ShahrAra Logo](docs/icons/icon.svg)

Bilingual (Persian/English) civic platform for reporting urban problems, submitting city improvement ideas, tracking request status in real time, and voting on community submissions. Connects citizens directly with municipal administrators via an interactive map interface.

</div>

---

## Screenshots

| Home | Reports & Ideas | Submit Request |
|:----:|:---------------:|:--------------:|
| ![Home](docs/images/صفحه%20اصلی.png) | ![Reports](docs/images/گزارش%20و%20ایده.png) | ![Submit](docs/images/ثبت%20درخواست%20جدید.png) |

| Admin Panel | My Profile | Dark Mode |
|:-----------:|:----------:|:---------:|
| ![Admin](docs/images/پنل%20مدیریت.png) | ![Profile](docs/images/پروفایل%20من.png) | ![Dark](docs/images/تم%20دارک.png) |

---

## Features

- **Problem Reporting** — citizens submit geo-tagged urban issue reports (potholes, broken lights, waste accumulation, etc.)
- **Idea Submission** — propose city improvements (green spaces, smart city initiatives, cultural programs)
- **Interactive Map** — Leaflet-based map with coordinate picker, auto region detection, and dark mode tiles
- **Real-Time Tracking** — follow request status through its lifecycle: submitted → under review → in progress → resolved / archived
- **Voting System** — toggle likes on submissions to surface community priorities
- **Admin Dashboard** — manage requests, update statuses, and respond to citizens
- **Dark Mode** — persistent theme preference with CSS view-transition animations
- **JWT Authentication** — phone + national ID login with auto-admin provisioning
- **Search & Filter** — full-text search, category/type/region/status/date range filters
- **Responsive Design** — mobile-friendly with bottom navigation bar

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix primitives) |
| **Backend** | Python 3.9+, FastAPI, SQLAlchemy, Pydantic v2 |
| **Database** | SQLite |
| **Auth** | JWT (phone + national ID, no passwords) |
| **Maps** | Leaflet with CartoDB tiles (Voyager / Dark Matter) |
| **Icons** | Lucide React |
| **Tools** | Ruff (lint/format), Prettier, ESLint, pre-commit |

---

## Project Structure

```
ShahrAra/
├── frontend/                # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # UI components (shadcn/ui, panels, modals)
│   │   │   └── ui/          # RTL-aware Radix primitives
│   │   ├── lib/             # Utility functions
│   │   ├── utils/           # Domain helpers (categories, regions, dates, filters)
│   │   ├── App.tsx          # Root app (state-based tab switching)
│   │   ├── main.tsx         # Entry point
│   │   └── types.ts         # Shared TypeScript types
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                 # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/v1/          # Route definitions and endpoint handlers
│   │   ├── core/            # Config, security, error handling
│   │   ├── db/              # Database session management
│   │   ├── models/          # SQLAlchemy ORM models
│   │   └── schemas/         # Pydantic v2 request/response schemas
│   ├── tests/               # pytest integration tests (67 tests)
│   ├── main.py              # FastAPI app entry point
│   ├── seed.py              # Database seeder (60 sample requests)
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/                    # Documentation and visual assets
│   ├── images/              # Screenshots
│   └── charts/              # Chart generation scripts
├── scripts/                 # Utility scripts
├── Makefile                 # Development automation
└── CLAUDE.md                # AI assistant project guide
```

---

## Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **npm 9+**

### Installation

```bash
# Clone and enter
git clone https://github.com/your-org/shahr-ara.git
cd shahr-ara

# Install all dependencies
make install

# Configure environment
cp backend/.env.example backend/.env

# (Optional) Seed sample data
make seed
```

### Running Locally

```bash
# Start both backend and frontend concurrently
make dev
```

Or run separately:

```bash
make dev-backend    # http://localhost:8000
make dev-frontend   # http://localhost:3000
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

### Admin Credentials (Development)

| Field | Value |
|-------|-------|
| Phone | `09120000000` |
| National ID | `1234567890` |

Configured in `backend/.env` — change for production.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./shahr_ara.db` | SQLite database path |
| `ADMIN_PHONE` | `09120000000` | Admin user phone |
| `ADMIN_NATIONAL_ID` | `1234567890` | Admin national ID |
| `ADMIN_FIRST_NAME` | `Admin` | Admin first name |
| `ADMIN_LAST_NAME` | `Admin` | Admin last name |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `JWT_EXPIRATION_MINUTES` | `1440` | Token expiry in minutes |

---

## Development Workflow

### Makefile Targets

```bash
make                  # Show grouped help
make dev              # Run backend + frontend concurrently
make install          # Install all dependencies
make build            # Build frontend for production
make lint             # Run all linters
make format           # Run all formatters
make test             # Run all tests
make seed             # Seed sample data
make db-reset         # Delete, recreate, and seed database
make clean            # Remove cache and build artifacts
make install-precommit# Install Git pre-commit hooks
```

### API Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | — |
| GET | `/api/v1/stats` | Aggregate statistics | — |
| POST | `/api/v1/auth/login` | Login / register | — |
| GET | `/api/v1/requests` | List requests (search, filter, paginate) | — |
| POST | `/api/v1/requests` | Create a request | — |
| GET | `/api/v1/requests/{id}` | Get request details | — |
| PUT | `/api/v1/requests/{id}` | Edit own request | User |
| DELETE | `/api/v1/requests/{id}` | Delete own request | User |
| PUT | `/api/v1/requests/{id}/status` | Update status + admin response | Admin |
| POST | `/api/v1/requests/{id}/like` | Toggle like | — |
| GET | `/api/v1/requests/user/{phone}/stats` | User statistics | — |
| GET | `/api/v1/notifications` | List notifications | — |
| PUT | `/api/v1/notifications/{id}/read` | Mark notification read | — |

### Linting and Formatting

```bash
# Backend (Ruff)
make lint-backend       # ruff check --fix .
make format-backend     # ruff format .

# Frontend (ESLint + TypeScript + Prettier)
make lint-frontend      # npx eslint . && npx tsc --noEmit
make format-frontend    # npx prettier --write
```

### Testing

```bash
make test
# Or: cd backend && python3 -m pytest tests/ -v
```

Tests use an isolated temporary SQLite database with FastAPI `TestClient` — no setup required. Fixtures in `conftest.py` provide `client`, `user_token`, `admin_token`, and `sample_request`.

---

## Domain Model

### Request Types

- **`problem`** — urban issue report (pothole, broken lights, waste accumulation, etc.)
- **`idea`** — city improvement suggestion (green spaces, smart city, cultural initiatives)

### Status Lifecycle

```
submitted → under_review → in_progress → resolved / archived
```

### Categories (7)

| Persian | English |
|---------|---------|
| آسفالت و معابر | Asphalt & Roads |
| زیباسازی و فضای سبز | Beautification & Green Space |
| روشنایی و برق شهری | Lighting & Urban Electricity |
| مدیریت پسماند و بازیافت | Waste Management & Recycling |
| ترافیک و حمل و نقل | Traffic & Transportation |
| مناسب‌سازی و خدمات اجتماعی | Accessibility & Social Services |
| سایر | Other |

---

## Known Gaps

- **No database migrations** — schema changes require manual migration or delete-and-reset
- **No image upload** — request descriptions are text-only
- **Opt-in pagination** — `/api/v1/requests` defaults to full flat list; pagination UX not yet unified across panels
- **No refresh tokens** — tokens expire after 24 hours with no renewal mechanism

---

## Roadmap

- [ ] Database migration system (Alembic)
- [ ] Image upload support for requests
- [ ] Email/SMS notifications
- [ ] Unified pagination across all views
- [ ] Refresh token mechanism
- [ ] Mobile app (React Native / PWA)
- [ ] Multi-city support
- [ ] CI/CD pipeline with automated testing

---

## Contributing

We welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup and prerequisites
- Coding standards and branch naming
- Commit message conventions
- Pull request guidelines
- Testing and linting expectations

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).

Copyright (c) 2026 SHAHR ARA Team.
