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
