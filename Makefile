.DEFAULT_GOAL := help

.PHONY: install install-backend install-frontend dev dev-backend dev-frontend \
        build lint lint-backend lint-frontend format format-backend format-frontend \
        clean clean-backend clean-frontend test test-backend db-reset help

# ─── Install ──────────────────────────────────────────────────────────────────

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend Python dependencies
	cd backend && pip3 install -r requirements.txt

install-frontend: ## Install frontend npm dependencies
	cd frontend && npm install

# ─── Development ──────────────────────────────────────────────────────────────

dev: dev-backend dev-frontend ## Run both servers concurrently

dev-backend: ## Start backend server (port 8000)
	cd backend && uvicorn main:app --reload --port 8000

dev-frontend: ## Start frontend dev server (port 5173)
	cd frontend && npm run dev

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build frontend for production
	cd frontend && npm run build

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Lint backend with Ruff
	cd backend && ruff check --fix .

lint-frontend: ## Type-check frontend with TypeScript
	cd frontend && npx tsc --noEmit

# ─── Format ───────────────────────────────────────────────────────────────────

format: format-backend format-frontend ## Format all code

format-backend: ## Format backend with Ruff
	cd backend && ruff format .

format-frontend: ## Format frontend with Prettier
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"

# ─── Test ─────────────────────────────────────────────────────────────────────

test: test-backend ## Run all tests

test-backend: ## Run backend API tests
	cd backend && python3 -m tests.test_api

# ─── Database ────────────────────────────────────────────────────────────────

db-reset: ## Delete & recreate SQLite database
	rm -f backend/shahr_ara.db
	cd backend && python3 -c "from app.db.session import Base, engine; Base.metadata.create_all(bind=engine)"
	@echo "Database reset complete."

# ─── Clean ────────────────────────────────────────────────────────────────────

clean: clean-backend clean-frontend ## Remove all artifacts

clean-backend: ## Remove backend cache and database files
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -f backend/shahr_ara.db backend/shahr_ara_test.db
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

clean-frontend: ## Remove frontend dist and node_modules
	rm -rf frontend/dist frontend/node_modules

# ─── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; section = ""} \
		/^# ─── / { \
			s = $$0; \
			gsub(/^# ──+ /, "", s); \
			gsub(/ ──+.*$$/, "", s); \
			section = s; \
		} \
		/^[a-zA-Z_-]+:.*##/ { \
			target = $$1; \
			desc = $$2; \
			if (!printed_first) { \
				printf "\n  \033[1mUsage:\033[0m  make \033[36m<target>\033[0m\n\n"; \
				printed_first = 1; \
			} \
			if (section != "" && section != last_section) { \
				printf "  \033[33m%s\033[0m\n", section; \
				last_section = section; \
			} \
			printf "    \033[36m%-20s\033[0m %s\n", target, desc; \
		}' Makefile
	@echo ""
