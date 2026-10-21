# [agent] Delete a todo
labels: phase-1-core

### Goal
Let users remove a todo.

### Acceptance criteria
- [ ] `DELETE /todos/{id}` returns 204 and removes the todo
- [ ] `DELETE` on an unknown id returns 404
- [ ] `TodoRepository` gets a `delete` method, implemented in `InMemoryTodoRepository`
- [ ] Each todo has a delete button with an accessible name like "Delete Buy milk"
- [ ] Clicking it removes the todo from the list after the API succeeds
- [ ] If the API call fails, the todo stays and an error shows
- [ ] Backend and frontend tests cover all of the above

### Where to look
`api/app/repository.py`, `api/app/main.py`, `web/src/api.ts`, `web/src/App.tsx`

### Out of scope
Undo, confirmation dialogs, bulk delete.

### Size
Small
