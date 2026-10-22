# Todo app

A small todo app built mostly by agents, using the software factory setup in `.github/` and `.claude/`. It starts small and grows in phases, ending with agentic features.

```
web/  React + TypeScript (Vite)      -> Firebase Hosting (free tier)
api/  FastAPI (Python, uv)           -> Cloud Run (free tier)
      TodoRepository                 -> in-memory now, Firestore next (free tier)
```

## Run it locally

Two terminals, from the repo root:

```bash
uv run --directory api uvicorn app.main:app --reload    # http://localhost:8000/docs
npm --prefix web run dev                               # http://localhost:5173
```

The frontend proxies `/api/*` to the backend, so there's nothing to configure.

By default todos live in memory and vanish on restart. To store them in Firestore, run
`gcloud auth application-default login` once, then start the backend with `STORAGE=firestore`
(the Google Cloud project comes from your gcloud config).

## Run in Docker

```bash
docker build -t todo-api api
docker run --rm -p 8080:8080 todo-api    # http://localhost:8080/docs
```

The container listens on `$PORT` (Cloud Run sets it) and defaults to 8080.

## Deploy the frontend

Firebase Hosting serves `web/dist` (config in `firebase.json`). Build with the Cloud Run URL, then deploy:

```bash
VITE_API_URL=https://<your-cloud-run-url> npm --prefix web run build
firebase deploy --only hosting
```

See `web/.env.example`. Add the Hosting origin to the API's `ALLOWED_ORIGINS`.

## How work gets done

1. Pick the next issue from the backlog (`backlog/`, or the GitHub issues created from it).
2. Add the `agent-ready` label.
3. Claude implements it and opens a PR. CI and the review bot run on it.
4. Review and merge.

Issues labeled `human` are for you (GCP setup, secrets). Agents can't do those.

## Roadmap

| Phase | What | Issues |
|---|---|---|
| 0 | Walking skeleton: list + add todos, CI green | done |
| 1 | Core features: complete, delete, edit, due dates, filters | 01-05 |
| 2 | Real database: Firestore behind the repository interface | 06 |
| 3 | Deploy: Cloud Run + Firebase Hosting | 07-09 |
| 4 | Agentic: natural-language add, task breakdown, MCP server | 10-12 |
| Q | Quality: e2e, API contract, Firestore integration, smoke test, evals | 13-17 |

See `backlog/README.md` for the order and how to create the issues.

## Quality and security gates

Every PR has to pass these before it can merge:

| Check | What it catches |
|---|---|
| Lint, format, types | Sloppy or inconsistent code, type errors |
| Unit + API tests with coverage floors (85%) | Broken behavior, untested changes |
| `pip-audit`, `npm audit`, dependency review | Known-vulnerable or unwanted dependencies |
| CodeQL (`security-extended`) | Injection, XSS, unsafe patterns in Python and TypeScript |
| API contract, e2e, Firestore integration | UI and API drifting apart, broken user flows, storage bugs (turn on as issues 13-15 land) |
| Codex review | Logic and design problems, rule violations from `AGENTS.md` |

Plus GitHub secret scanning with push protection, and Dependabot. See `SECURITY.md`.

## Models and usage

**Which model runs what**

| Agent | Default model | Change it with |
|---|---|---|
| Implement (Small issue) | `sonnet` | `gh variable set MODEL_SMALL --body haiku` |
| Implement (Medium issue) | `sonnet` | `gh variable set MODEL_MEDIUM --body opus` |
| Implement (Large issue) | `opus` | `gh variable set MODEL_LARGE --body sonnet` |
| Implement (no size) | `sonnet` | `gh variable set MODEL_DEFAULT --body ...` |
| `@claude` helper | `sonnet` | `gh variable set MODEL_HELPER --body ...` |
| Orchestrator | `haiku` | `gh variable set MODEL_ORCHESTRATOR --body ...` |

To force a model for one issue, add a label: `model:haiku`, `model:sonnet`, or `model:opus`. The label wins over the issue's size.

**Seeing usage**

- **Per run:** every implement run comments on its PR with the model used, turns, tokens (input, output, cache), and an estimated cost. The same table is in the run's job summary.
- **Totals:** `./scripts/usage-report.sh` (last 30 days) or `./scripts/usage-report.sh 7`, broken down by role and model, plus the most expensive runs.

Costs are estimates at API prices. With a Claude subscription token, runs count against your plan's usage limits rather than being billed.
