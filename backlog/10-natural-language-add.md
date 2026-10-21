# [agent] Natural-language add
labels: phase-4-agentic

### Goal
Type something like "call the dentist next Tuesday" and get a todo with the right title and due date. First agentic feature.

### Acceptance criteria
- [ ] `POST /todos/parse` takes `{"text": "..."}` and returns `{"title": "...", "due_date": "YYYY-MM-DD" | null}` without saving anything
- [ ] The LLM call lives behind a small interface (like `TodoParser`) with a real implementation and a fake for tests
- [ ] The real implementation uses structured output / tool calling, not regex on free text, and validates the result with a Pydantic model
- [ ] Today's date is passed into the prompt so relative dates work
- [ ] If the model call fails or returns something invalid, the endpoint returns the raw text as the title with no due date (never a 500)
- [ ] API key comes from an env var. Document it in README. No keys in code
- [ ] UI: a toggle or second input for "smart add" that calls parse, shows the result for confirmation, then creates the todo
- [ ] Tests use the fake parser only. No real model calls in CI

### Where to look
`api/app/`, `web/src/api.ts`, `web/src/App.tsx`

### Out of scope
Chat UI, multiple todos from one sentence, recurring todos.

### Size
Medium
