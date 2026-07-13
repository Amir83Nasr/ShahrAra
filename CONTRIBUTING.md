# Contributing to ShahrAra

Thank you for your interest in ShahrAra — a bilingual (Persian/English) municipal engagement platform. We welcome contributions that help improve civic participation and urban problem-solving.

## Project Overview

ShahrAra connects citizens with municipal administrators through an interactive map interface. Citizens can report urban problems, submit improvement ideas, track request status in real time, and vote on community submissions. Built with FastAPI + React 19 + TypeScript.

## Table of Contents

- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Issue Reporting](#issue-reporting)
- [Testing](#testing)
- [Linting and Formatting](#linting-and-formatting)
- [Code Review](#code-review)
- [Communication](#communication)

## Development Setup

### Prerequisites

- **Python 3.9+** — backend runtime
- **Node.js 18+** — frontend runtime
- **npm 9+** — package manager
- **Git** — version control

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/shahr-ara.git
cd shahr-ara

# Install all dependencies
make install

# Install pre-commit hooks (recommended)
make install-precommit
```

This runs:
- `pip install -r backend/requirements.txt`
- `npm install` in `frontend/`

### Environment Configuration

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings. Defaults work for local development.

### Running the Project

```bash
# Start both servers concurrently
make dev

# Or run individually:
make dev-backend    # FastAPI on http://localhost:8000
make dev-frontend   # React on http://localhost:3000

# Seed the database with sample data
make seed
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`

## Coding Standards

### General

- Write clean, readable code that matches the surrounding style.
- Keep functions focused and small.
- Avoid dead code, commented-out code, or console.log/print debugging.
- Write Persian-first: all UI text and error messages are in Persian.
- RTL layout is the default — ensure UI components work correctly in RTL.

### Backend (Python)

- Target **Python 3.9+**.
- Use type hints for all function signatures.
- Follow FastAPI conventions: dependency injection via `Depends()`, Pydantic v2 for schemas.
- SQLAlchemy models use UUID-style string IDs with prefixes (`usr_`, `req_`, etc.).
- Error responses return Persian messages in a consistent `{ success, error }` format.

### Frontend (TypeScript/React)

- Use **TypeScript** — avoid `any` where possible.
- React components use functional style with hooks.
- Import paths use the `@/` alias (maps to `src/`).
- Use `cn()` utility for conditional class merging.
- UI components built on shadcn/ui primitives (Radix, RTL-aware).
- Icons use `lucide-react` throughout.

## Branch Naming

Use descriptive kebab-case names with type prefixes:

| Pattern | Example |
|---------|---------|
| `feat/<description>` | `feat/add-image-upload` |
| `fix/<description>` | `fix/map-marker-position` |
| `refactor/<description>` | `refactor/auth-middleware` |
| `docs/<description>` | `docs/api-endpoints` |
| `chore/<description>` | `chore/update-dependencies` |
| `test/<description>` | `test/request-pagination` |

## Commit Messages

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<body> (optional)
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (whitespace, semicolons) |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or modifying tests |
| `chore` | Maintenance (deps, tooling, CI) |

### Scope Examples

`(auth)`, `(map)`, `(api)`, `(frontend)`, `(backend)`, `(deps)`

### Examples

```
feat(auth): add national ID validation for Iranian citizens
fix(map): correct marker positioning on coordinate click
refactor(api): extract stats endpoint to router
chore(deps): add ruff to requirements.txt
```

## Pull Requests

1. **Create a branch** — follow the naming convention above.
2. **Make your changes** — keep commits small and focused.
3. **Run checks locally** before opening a PR:
   ```bash
   make lint
   make test
   ```
4. **Open a PR** against the `main` branch with:
   - Clear title following Conventional Commits format.
   - Description of what changed and why.
   - References to related issues (if any).
   - Screenshots for UI changes.
5. **Respond to feedback** — address review comments promptly.

### PR Checklist

- [ ] Code compiles without errors (`tsc --noEmit` for frontend, no syntax errors for backend)
- [ ] All tests pass (`make test`)
- [ ] Linting passes (`make lint`)
- [ ] No dead code, console.log, or print debugging
- [ ] UI changes are RTL-compatible and tested
- [ ] New environment variables are documented in `.env.example`
- [ ] Commit messages follow Conventional Commits

## Issue Reporting

### Bug Reports

When filing a bug report, include:

- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, browser, Node/Python versions)
- Screenshots or logs (if applicable)

### Feature Requests

Describe the feature, its use case, and how it benefits the project. If possible, outline an implementation approach.

## Testing

```bash
# Run all backend tests
make test

# Or directly:
cd backend && python3 -m pytest tests/ -v
```

- Tests use an isolated temporary SQLite database — no setup required.
- Write tests for new backend endpoints or logic changes.
- Test fixtures are available in `backend/tests/conftest.py` (client, user_token, admin_token, sample_request).
- Frontend type-checking is part of lint: `tsc --noEmit`.

## Linting and Formatting

Run before every PR:

```bash
# All linters
make lint

# All formatters
make format

# Individual checks:
make lint-backend    # ruff check --fix .
make lint-frontend   # npx eslint . && tsc --noEmit
make format-backend  # ruff format .
make format-frontend # npx prettier --write "src/**/*.{ts,tsx,css}"
```

### Pre-commit Hooks

Install once, and checks run automatically on every commit:

```bash
make install-precommit
```

The hooks run: Ruff format, Ruff lint, Prettier, ESLint, and general file checks (trailing whitespace, YAML/JSON/TOML validity, etc.).

## Code Review

- All PRs require at least one review before merging.
- Reviewers focus on correctness, maintainability, and adherence to project standards.
- Be constructive and specific in feedback.
- Address ALL review comments before merging — either implement the suggestion or explain why not.

## Communication

- Use GitHub Issues for bug reports and feature requests.
- Use GitHub Discussions or pull request comments for design discussions.
- Keep discussions focused and respectful.
- For security vulnerabilities, open a private issue or contact maintainers directly.

## Recognition

Contributors are recognized in the project's release notes. By contributing, you agree that your contributions are licensed under the Apache License 2.0.
