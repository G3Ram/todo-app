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
npm --prefix web run test:coverage

# backend
uv sync --directory api
uv run --directory api ruff check .
uv run --directory api ruff format --check .
uv run --directory api mypy
uv run --directory api pytest --cov
```

If they exist, also run: `npm --prefix web run check:api` (API contract) and `npm --prefix web run e2e` (browser tests).
CI also runs dependency audits and CodeQL. If CI flags a vulnerable package, upgrade it rather than ignoring the finding.

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

## Testing strategy
Pick the test that matches the change. Most changes need more than one.

| Change | Test it with |
|---|---|
| Storage logic | Repository unit tests against `InMemoryTodoRepository` (and the Firestore integration suite once it exists) |
| Route or validation | API tests with the `client` fixture: happy path, 404, 422 |
| UI behavior | Vitest + Testing Library in `web/src`, mocking `./api` |
| `web/src/api.ts` | `web/src/api.test.ts`, stubbing `fetch` |
| A user-facing flow end to end | One Playwright test in `web/e2e/` (keep these few: core flows only) |
| API request/response shape | Regenerate the API types and update callers |

- Coverage floors: 85% backend, 85% lines frontend. Don't lower them, and don't add `# pragma: no cover` or coverage excludes to get under them.
- Test behavior through public interfaces, not private helpers.
- Pure logic (dates, filtering) goes in small functions with direct unit tests. Pass "now" in instead of reading the clock.

## Security rules
- Validate all input at the API boundary with Pydantic: types, lengths, allowed values. Never trust the client.
- Never log or return secrets, tokens, or full request bodies.
- Config and secrets come from environment variables only. Never hardcode keys, URLs with credentials, or project IDs.
- CORS stays restricted to `ALLOWED_ORIGINS`. Never `*`.
- Don't build queries, shell commands, or HTML from user input by string concatenation.
- New dependencies: prefer well-known, maintained packages, and say why in the PR description.
- For LLM features: treat model output as untrusted input. Validate it with Pydantic before using it, and never let it trigger writes without a code path that checks it.

## Review guidelines
For reviewers (Codex, or a human). Flag these as blocking:
- Any violation of the security rules above
- Behavior changes without tests, or tests that don't actually assert the new behavior
- API shape changes without matching `web/src/api.ts` updates
- Storage code outside `repository.py`, or business logic in route handlers
- Changes outside the issue's scope

Don't block on: formatting (CI handles it), naming preferences, or style that matches nearby code.

## Don't touch
- `.github/workflows/`
- `.env*`, secrets, API keys, service account files
- Never call real GCP services from tests. Use the in-memory repo or mocks

## PR description
Include: what changed, why, how you tested it, and anything you weren't sure about.
