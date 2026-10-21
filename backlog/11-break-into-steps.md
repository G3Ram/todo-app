# [agent] Break a todo into steps
labels: phase-4-agentic

### Goal
For a big todo like "plan Fabler launch", ask the AI to suggest 3-7 smaller steps, then add the ones you pick as subtasks.

### Acceptance criteria
- [ ] `Todo` gets an optional `parent_id`; the list API returns subtasks with their parent
- [ ] `POST /todos/{id}/suggest-steps` returns suggested step titles without saving them
- [ ] Reuses the LLM interface pattern from issue 10 (real + fake, structured output, validated)
- [ ] UI: a "Break down" action on a todo shows suggestions as checkboxes; "Add selected" creates them as subtasks
- [ ] Subtasks render indented under their parent; completing all subtasks does not auto-complete the parent
- [ ] Deleting a parent deletes its subtasks
- [ ] Tests use the fake only

### Where to look
`api/app/`, `web/src/App.tsx`

### Out of scope
Nested subtasks (one level only), auto-scheduling.

### Size
Medium
