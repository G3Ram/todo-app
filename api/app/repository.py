"""Storage layer.

Routes only talk to TodoRepository. Today the app uses the in-memory version.
A Firestore version will implement the same interface, so routes and tests
don't change when the database does.
"""

import uuid
from datetime import UTC, datetime
from typing import Protocol

from app.models import Todo, TodoCreate, TodoUpdate


class TodoRepository(Protocol):
    def list(self) -> list[Todo]: ...

    def create(self, data: TodoCreate) -> Todo: ...

    def update(self, todo_id: str, data: TodoUpdate) -> Todo | None: ...

    def delete(self, todo_id: str) -> bool: ...


class InMemoryTodoRepository:
    def __init__(self) -> None:
        self._todos: dict[str, Todo] = {}

    def list(self) -> list[Todo]:
        return sorted(self._todos.values(), key=lambda t: t.created_at)

    def create(self, data: TodoCreate) -> Todo:
        todo = Todo(
            id=uuid.uuid4().hex,
            title=data.title.strip(),
            created_at=datetime.now(UTC),
        )
        self._todos[todo.id] = todo
        return todo

    def update(self, todo_id: str, data: TodoUpdate) -> Todo | None:
        todo = self._todos.get(todo_id)
        if todo is None:
            return None
        updated = todo.model_copy(update={"done": data.done})
        self._todos[todo_id] = updated
        return updated

    def delete(self, todo_id: str) -> bool:
        return self._todos.pop(todo_id, None) is not None
