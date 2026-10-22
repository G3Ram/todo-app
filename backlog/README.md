# Backlog

Each file is one GitHub issue, written in the Agent task format so the `implement-issue` skill can follow it.

## Create the issues

```bash
./scripts/create-issues.sh            # creates all of them
./scripts/create-issues.sh 01 02      # or just some
```

The script adds a phase label to each one. It never adds `agent-ready`. You do that, one issue at a time.

## Order

Go in order. Each one builds on the last.

| # | Issue | Who | Size |
|---|---|---|---|
| 01 | Mark a todo done | agent | Small |
| 02 | Delete a todo | agent | Small |
| 03 | Edit a todo's title | agent | Small |
| 04 | Due dates | agent | Medium |
| 05 | Filters and remaining count | agent | Small |
| 06 | Firestore repository | agent | Medium |
| 07 | Container for the API | agent | Small |
| 08 | Firebase Hosting config | agent | Small |
| 09 | Set up GCP and deploy | **you** | - |
| 10 | Natural-language add | agent | Medium |
| 11 | Break a todo into steps | agent | Medium |
| 12 | Todos as an MCP server | agent | Medium |
| 13 | End-to-end tests (Playwright) | agent | Medium |
| 14 | API contract types | agent | Small |
| 15 | Firestore integration tests | agent | Medium |
| 16 | Post-deploy smoke test | agent | Small |
| 17 | Evals for natural-language add | agent | Medium |

13-17 are the quality issues. CI already has jobs waiting for 13, 14, and 15: each one turns on by itself once its tests exist. Good order to slot them in: 14 any time, 13 after 03, 15 after 06 and 08, 16 after 07, 17 after 10.

Phase 4 (10-12) needs an LLM API key in Cloud Run. Decide which model provider before starting it.

## Let the orchestrator run the queue

Queue issues and the orchestrator starts the next one every time you merge an agent PR.

```bash
for n in <issue numbers>; do gh issue edit $n --add-label queued; done
gh variable set ORCHESTRATOR_ENABLED --body true    # turn it on
gh workflow run orchestrator.yml                     # start the first task
```

Pause with `gh variable set ORCHESTRATOR_ENABLED --body false`. Add `blocked` to skip an issue, or put `Depends on #N` in its body.

## Tips

- Start with 01 and watch the whole run. It's the best test of the factory.
- If an agent PR misses the mark, fix the issue text or AGENTS.md before relabeling. Don't just retry.
- Add your own issues using `.github/ISSUE_TEMPLATE/agent-task.yml`.
