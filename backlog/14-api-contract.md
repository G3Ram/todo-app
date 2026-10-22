# [agent] Generate frontend API types from the backend schema
labels: testing

### Goal
Stop the frontend and backend from drifting apart. Today `web/src/api.ts` hand-copies the API's types, so a backend change can silently break the UI. CI already has a `contract` job waiting; it switches on when `web/package.json` has a `check:api` script.

### Acceptance criteria
- [ ] `api/scripts/export_openapi.py` writes FastAPI's OpenAPI schema (`app.openapi()`) to a path given as an argument, as JSON with sorted keys and a trailing newline, so output is stable between runs
- [ ] `openapi-typescript` added as a dev dependency in `web/`
- [ ] `web/package.json` scripts:
  - `gen:api`: exports the schema to `src/generated/openapi.json`, then generates `src/generated/api-types.ts`
  - `check:api`: runs `gen:api`, then `git diff --exit-code -- src/generated` (fails if the committed types are out of date)
- [ ] Generated files are committed, and excluded from lint and from coverage
- [ ] `web/src/api.ts` uses the generated types (for example `components['schemas']['Todo']`) instead of hand-written ones
- [ ] Existing tests still pass with no behavior change
- [ ] AGENTS.md: add `npm --prefix web run gen:api` to Commands, with a note to run it after any API change

### Where to look
`api/app/main.py`, `web/src/api.ts`, `web/package.json`, `web/vite.config.ts`

### Out of scope
Generating a full API client; keep the hand-written fetch wrapper.

### Size
Small
