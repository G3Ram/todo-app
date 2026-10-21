# [agent] Mark a todo done
labels: phase-1-core

### Goal
Let users check off a todo, and keep that state on the server.

### Acceptance criteria
- [ ] `PATCH /todos/{id}` accepts `{"done": true|false}` and returns the updated todo
- [ ] `PATCH` on an unknown id returns 404
- [ ] `TodoRepository` gets an `update` method, implemented in `InMemoryTodoRepository`
- [ ] Each todo in the UI has a checkbox labeled with the todo's title
- [ ] Checking it calls the API and shows the todo as done (line-through and muted color)
- [ ] If the API call fails, the checkbox goes back to its old state and an error shows
- [ ] Backend and frontend tests cover all of the above

### Where to look
`api/app/models.py`, `api/app/repository.py`, `api/app/main.py`, `web/src/api.ts`, `web/src/App.tsx`

### Out of scope
Delete and edit. Don't restructure App.tsx into many components yet.

### Size
Small
