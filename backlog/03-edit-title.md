# [agent] Edit a todo's title
labels: phase-1-core

### Goal
Let users fix a typo or reword a todo without deleting it.

### Acceptance criteria
- [ ] `PATCH /todos/{id}` also accepts `title`, with the same rules as create (trimmed, 1-200 chars)
- [ ] Sending both `title` and `done` in one PATCH works; sending neither returns 422
- [ ] Double-clicking a todo's title, or clicking an "Edit" button, switches it to an input
- [ ] Enter saves, Escape cancels, and blurring the input saves
- [ ] Saving a blank title cancels the edit instead of saving
- [ ] Backend and frontend tests cover all of the above

### Where to look
`api/app/models.py`, `api/app/main.py`, `web/src/App.tsx`

### Out of scope
Rich text, reordering.

### Size
Small
