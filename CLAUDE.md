# ShahrAra — Claude Project Guide

## Commit Rule (CRITICAL)

**Never commit without the user asking for it.** No auto-commits, no "let me commit this for you", no proactive commits.

When the user *does* ask for a commit:

1. **First**, draft the commit message and show it to the user for approval
2. **Then**, commit only after receiving explicit confirmation
3. Use [Conventional Commits](https://www.conventionalcommits.org/) format:

   ```
   <type>(<scope>): <description>
   ```

4. Append to every commit message:

   ```
   Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
   ```

## Code Quality

- Clean code and best practices are the highest priority
- Match the surrounding code's style, comment density, and idioms
- Zero lint/type errors: always run `ruff check` (backend) and `tsc --noEmit` (frontend) before finishing
- All 41 backend tests must pass: `make test`
- Use pre-commit hooks: `pre-commit install` (runs on every `git commit`)
- Never leave dead code, commented-out code, or `console.log`/`print` debugging

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (Python 3.9+)
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Linting:** Ruff (backend), ESLint + tsc (frontend)
- **Formatting:** Ruff (backend), Prettier (frontend)
- **Auth:** JWT (phone + national ID), no passwords

## Project

- `/backend/` — FastAPI app with `main.py` entry point
- `/frontend/` — React app with `src/App.tsx` entry point
- `make dev-backend` — start backend on port 8000
- `make dev-frontend` — start frontend on port 3000
- Persian‑first: all UI is RTL, errors are in Persian
