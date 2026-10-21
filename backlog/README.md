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

Phase 4 (10-12) needs an LLM API key in Cloud Run. Decide which model provider before starting it.

## Tips

- Start with 01 and watch the whole run. It's the best test of the factory.
- If an agent PR misses the mark, fix the issue text or AGENTS.md before relabeling. Don't just retry.
- Add your own issues using `.github/ISSUE_TEMPLATE/agent-task.yml`.
