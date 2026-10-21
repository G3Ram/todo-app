# [agent] Due dates
labels: phase-1-core

### Goal
Todos can have an optional due date, so the app can later sort, remind, and reason about deadlines. This field is also what the natural-language add feature in phase 4 will fill in.

### Acceptance criteria
- [ ] `Todo` has an optional `due_date` (ISO date, no time)
- [ ] Create and PATCH accept `due_date`; PATCH with `due_date: null` clears it
- [ ] The add form has an optional date input
- [ ] Each todo shows its due date in a short, readable format
- [ ] Todos that are past due and not done are visibly marked as overdue
- [ ] Overdue logic is a small pure function with its own unit tests (pass "today" in, don't read the clock inside it)
- [ ] Backend and frontend tests cover all of the above

### Where to look
`api/app/models.py`, `web/src/api.ts`, `web/src/App.tsx`

### Out of scope
Times of day, time zones, reminders, recurring todos.

### Size
Medium
