# ShahrAra

<p align="center">
  <img src="logo/Final/svg/01.svg" alt="ShahrAra logo" width="120" />
</p>

Municipal engagement platform. Citizens report urban problems and submit improvement ideas on an interactive map; administrators track and manage requests. Persian-language UI with Jalali dates.

## Stack

- **Backend** — FastAPI + SQLAlchemy + PostgreSQL, JWT auth (`backend/`)
- **Frontend** — Next.js + React + Tailwind CSS + Leaflet map (`frontend/`)
- **Infra** — Docker Compose (Postgres), Makefile, lefthook

## Requirements

- Python ≥ 3.10 with [uv](https://docs.astral.sh/uv/)
- Node.js with [pnpm](https://pnpm.io/)
- Docker

## Quick Start

```bash
make install   # backend (uv sync) + frontend (pnpm install)
make db-up     # start Postgres
make dev-backend
make dev-frontend
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:8000> — Swagger UI at `/docs`
- Sample data: `make seed`

## Make Targets

| Target | Description |
| --- | --- |
| `make install` | Install backend + frontend dependencies |
| `make db-up` / `make db-down` | Start / stop Postgres container |
| `make dev-backend` / `make dev-frontend` | Run dev servers |
| `make seed` | Seed database with sample data |
| `make test` | Run backend tests (pytest) |
| `make lint` / `make format` | Ruff + ESLint / Prettier |
| `make hooks` | Install lefthook git hooks |

## API

Base URL: `/api/v1` — routers: `auth`, `requests`, `notifications`.

## Testing

```bash
make test
```

## License

Apache 2.0 — see [LICENCE.md](LICENCE.md).
