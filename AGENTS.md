# AGENTS.md

Instructions for any coding agent working in this repo. Keep this file short. Agents read it on every run.

## Project
A todo app: React frontend, FastAPI backend, Firestore database, hosted on GCP free tier (Cloud Run + Firebase Hosting). It will grow into an agentic app, so keep the backend's layers clean.

## Stack
- Frontend: React 19 + TypeScript + Vite, tested with Vitest + Testing Library, linted with oxlint
- Backend: Python 3.12+ FastAPI, managed with uv, tested with pytest, linted with ruff, typed with mypy (strict)
- Database: in-memory for now, Firestore next (see `api/app/repository.py`)

## Repo map
- `web/src/api.ts` - every backend call. Components never call fetch directly
- `web/src/App.tsx` - UI
- `api/app/main.py` - routes only, no business logic or storage code
- `api/app/models.py` - Pydantic request/response models
- `api/app/repository.py` - storage interface (`TodoRepository`) and implementations
- `api/tests/` - API tests. The `client` fixture gives each test a fresh in-memory repo

## Commands
Run from the repo root. Don't `cd`. All must pass before a task is done.

```bash
# frontend
npm ci --prefix web
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web test

# backend
uv sync --directory api
uv run --directory api ruff check .
uv run --directory api ruff format --check .
uv run --directory api mypy
uv run --directory api pytest
```

Run the backend locally: `uv run --directory api uvicorn app.main:app --reload`
Run the frontend locally: `npm --prefix web run dev` (proxies `/api` to the backend)

## How to work
- Read the issue's acceptance criteria first. If they're unclear, ask in a comment instead of guessing.
- Keep changes small and focused on the issue. No drive-by refactors.
- Add or update tests for every behavior change, frontend and backend.
- New storage operations go on the `TodoRepository` protocol first, then each implementation.
- API shape changes need matching updates in `web/src/api.ts` and its types.
- Match existing patterns in nearby files before inventing new ones.
- If a check fails, fix it. Don't skip, delete, or weaken tests to make them pass.

## Don't touch
- `.github/workflows/`
- `.env*`, secrets, API keys, service account files
- Never call real GCP services from tests. Use the in-memory repo or mocks

## PR description
Include: what changed, why, how you tested it, and anything you weren't sure about.
