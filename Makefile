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
dev-backend: ## Start backend server (port 8000)
	cd backend && uvicorn main:app --reload --port 8000 --host 0.0.0.0

dev-frontend: ## Start frontend dev server (port 3000)
	cd frontend && npm run dev

# ─── Build ────────────────────────────────────────────────────────────────────
build: ## Build frontend for production
	cd frontend && npm run build

# ─── Lint ─────────────────────────────────────────────────────────────────────
lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Lint backend with Ruff
	cd backend && ruff check --fix .

lint-frontend: ## Lint frontend with ESLint + TS
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
	cd backend && python3 -m pytest tests/ -v

# ─── Database ────────────────────────────────────────────────────────────────
db-reset: ## Reset and seed database
	rm -f backend/shahr_ara.db
	cd backend && python3 -c "from app.db.session import Base, engine; Base.metadata.create_all(bind=engine)"
	cd backend && python3 -m seed

seed: ## Seed database with sample data
	cd backend && python3 -m seed

# ─── Clean ────────────────────────────────────────────────────────────────────
clean: clean-backend clean-frontend ## Remove all artifacts

clean-db: ## Delete SQLite database
	rm -f backend/shahr_ara.db

clean-backend: ## Remove backend cache & artifacts
	find backend -type d \( -name __pycache__ -o -name .pytest_cache -o -name .ruff_cache -o -name .mypy_cache -o -name .egg-info \) -exec rm -rf {} + 2>/dev/null || true
	find backend -type f -name '*.pyc' -delete

clean-frontend: ## Remove frontend dist
	rm -rf frontend/dist

clean-frontend-full: ## Remove frontend dist + node_modules
	rm -rf frontend/dist frontend/node_modules


# ─── Generate ASCII Logo ───────────────────────────────────────────────────────
generate-logo: ## Generate ASCII logo
	@python3 scripts/ascii_logo.py $(PROJECT_NAME)

# ─── Project Variables ──────────────────────────────────────────────────────────
PROJECT_NAME := SHAR ARA
PROJECT_NAME_ASCII := $(shell python3 scripts/ascii_logo.py $(PROJECT_NAME))

# ─── Help ──────────────────────────────────────────────────────────────────────
help: ## Show this help message
	@printf "\n\n\n\n"
	@printf "\033[1;30m"
	@printf "%s\n" "$$(python3 scripts/ascii_logo.py $(PROJECT_NAME))"
	@printf "\033[0m\n"
	@printf "\n"
	@awk 'BEGIN {FS = ":.*##"; section = ""; last = ""; line = "──────────────────────────────────────────────────────────────────────"} \
	/^# ─── / { \
		s=$$0; gsub(/^# ──+ /,"",s); gsub(/ ──+.*$$/,"",s); section=s; \
	} \
	/^[a-zA-Z_-]+:.*##/ { \
		t=$$1; d=$$2; \
		if (section != last) { \
			if (last != "") printf "\033[2;37m└" line "┘\033[0m\n\n"; \
			printf "\033[2;37m┌──────────────────────────────────────────────────────────────────────┐\033[0m\n"; \
			printf "\033[2;37m│ \033[1;37m%-60s\033[0m \033[2;37m        │\033[0m\n", section; \
			printf "\033[2;37m├──────────────────────────────────────────────────────────────────────┤\033[0m\n"; \
			last = section; \
		} \
		printf "\033[2;37m│ \033[1;36m%-28s\033[0m \033[2;37m%-39s\033[0m \033[2;37m│\033[0m\n", t, d; \
	} END {printf "\033[2;37m└" line "┘\033[0m\n\n";}' Makefile
	@printf "\033[2;37m────────────────────────────────────────────────────────────────────────\033[0m\n"
	@printf "\033[2;37m→\033[0m \033[1;37mmake\033[0m \033[1;36m<command>\033[0m\n"
	@printf "\n"
