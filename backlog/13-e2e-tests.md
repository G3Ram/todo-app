# [agent] End-to-end tests with Playwright
labels: testing

### Goal
Prove the real app works in a browser: the real React build talking to the real API. CI already has an `e2e` job waiting; it switches on as soon as `web/playwright.config.ts` exists.

Depends on the delete and edit issues (backlog 02 and 03). If either is still open, test only the flows that exist.

### Acceptance criteria
- [ ] `@playwright/test` added as a dev dependency in `web/`, with an `e2e` script: `playwright test`
- [ ] `web/playwright.config.ts` uses `webServer` to start both servers itself:
  - API: `uv run --directory ../api uvicorn app.main:app --port 8000`, ready when `http://localhost:8000/health` responds
  - Frontend: `npm run dev -- --port 5173 --strictPort`, ready on `http://localhost:5173`
  - `reuseExistingServer: !process.env.CI`
- [ ] Chromium only; 1 retry in CI and 0 locally; trace on first retry; HTML report in `playwright-report/`
- [ ] Tests in `web/e2e/` cover: empty state, add a todo, mark it done, edit its title, delete it
- [ ] Each test uses unique titles so tests don't depend on each other or on order
- [ ] Use role- and label-based locators (`getByRole`, `getByLabel`), not CSS classes
- [ ] `web/e2e/` and the config pass `npm run lint` and `npm run typecheck` (add them to a tsconfig if needed)
- [ ] Vitest still ignores `e2e/` (it already only includes `src/**`)
- [ ] README gets a "Run the browser tests" line, and AGENTS.md's Commands section is updated if anything changed

### Where to look
`web/`, `web/vite.config.ts`, `web/tsconfig*.json`

### Out of scope
Other browsers, visual snapshots, testing against the deployed site.

### Size
Medium
