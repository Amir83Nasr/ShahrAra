.DEFAULT_GOAL := help

.PHONY: install install-backend install-frontend dev dev-backend dev-frontend \
        build lint lint-backend lint-frontend format format-backend format-frontend \
        clean clean-backend clean-frontend test test-backend db-reset seed help

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

dev-frontend: ## Start frontend dev server (port 3000)
	cd frontend && npm run dev

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build frontend for production
	cd frontend && npm run build

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Lint backend with Ruff
	cd backend && ruff check --fix .

lint-frontend: ## Lint frontend with ESLint + TypeScript
	cd frontend && npx eslint . && npx tsc --noEmit

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

db-reset: ## Delete, recreate & seed the SQLite database
	rm -f backend/shahr_ara.db
	cd backend && python3 -c "from app.db.session import Base, engine; Base.metadata.create_all(bind=engine)"
	cd backend && python3 -m seed
	@echo "Database reset & seeded."

seed: ## Seed database with sample data
	cd backend && python3 -m seed

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
	@awk 'BEGIN {FS = ":.*##"; section = ""; \
		group["install"]=1; group["dev"]=1; group["lint"]=1; \
		group["format"]=1; group["test"]=1; group["clean"]=1} \
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
				printf "\n\n"; \
				printed_first = 1; \
			} \
			if (section != "" && section != last_section) { \
				if (last_section != "") printf "\n"; \
				printf "  \033[1;33m%s\033[0m\n", section; \
				last_section = section; \
			} \
			if (target in group) \
				printf "   \033[1;36m%-22s\033[0m \033[97m%s\033[0m\n", target, desc; \
			else \
				printf "   \033[36m%-22s\033[0m %s\n", target, desc; \
		}' Makefile
	@echo ""
