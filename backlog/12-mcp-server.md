# [agent] Todos as an MCP server
labels: phase-4-agentic

### Goal
Expose todos as MCP tools so Claude (or any MCP client) can read and manage your list directly.

### Acceptance criteria
- [ ] New `api/app/mcp_server.py` using the official MCP Python SDK
- [ ] Tools: `list_todos` (optional filter: all/active/done), `add_todo` (title, optional due_date), `complete_todo` (id), `delete_todo` (id)
- [ ] Tools go through `TodoRepository`, same as the HTTP routes. No duplicated storage logic
- [ ] Tool descriptions are clear enough that a model picks the right one without extra prompting
- [ ] Runs locally over stdio: `uv run --directory api python -m app.mcp_server`
- [ ] README shows how to add it to Claude Code (`claude mcp add ...`)
- [ ] Tests call each tool function against the in-memory repository

### Where to look
`api/app/`

### Out of scope
Remote/HTTP MCP transport, auth. Those come with multi-user support.

### Size
Medium
