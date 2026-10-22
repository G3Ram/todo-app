"""Storage layer.

Routes only talk to TodoRepository. The app uses the in-memory version by
default and the Firestore version when STORAGE=firestore.
"""

import uuid
from datetime import UTC, datetime
from typing import Protocol

from google.cloud import firestore

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
        updated = todo.model_copy(update=data.model_dump(exclude_none=True))
        self._todos[todo_id] = updated
        return updated

    def delete(self, todo_id: str) -> bool:
        return self._todos.pop(todo_id, None) is not None


class FirestoreTodoRepository:
    def __init__(self, client: firestore.Client) -> None:
        self._todos = client.collection("todos")

    def list(self) -> list[Todo]:
        docs = self._todos.order_by("created_at").stream()
        return [Todo(id=d.id, **(d.to_dict() or {})) for d in docs]

    def create(self, data: TodoCreate) -> Todo:
        todo = Todo(
            id=uuid.uuid4().hex,
            title=data.title.strip(),
            created_at=datetime.now(UTC),
        )
        self._todos.document(todo.id).set(todo.model_dump(exclude={"id"}))
        return todo

    def update(self, todo_id: str, data: TodoUpdate) -> Todo | None:
        ref = self._todos.document(todo_id)
        snapshot = ref.get()
        if not snapshot.exists:
            return None
        fields = data.model_dump(exclude_none=True)
        ref.update(fields)
        return Todo(id=todo_id, **{**(snapshot.to_dict() or {}), **fields})

    def delete(self, todo_id: str) -> bool:
        ref = self._todos.document(todo_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True
