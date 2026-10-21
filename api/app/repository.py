"""Storage layer.

Routes only talk to TodoRepository. Today the app uses the in-memory version.
A Firestore version will implement the same interface, so routes and tests
don't change when the database does.
"""

import uuid
from datetime import UTC, datetime
from typing import Protocol

from app.models import Todo, TodoCreate


class TodoRepository(Protocol):
    def list(self) -> list[Todo]: ...

    def create(self, data: TodoCreate) -> Todo: ...


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
