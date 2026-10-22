from datetime import datetime
from typing import Any

import pytest

from app.main import get_repository
from app.models import TodoCreate, TodoUpdate
from app.repository import FirestoreTodoRepository, InMemoryTodoRepository


class FakeSnapshot:
    def __init__(self, id: str, data: dict[str, Any] | None) -> None:
        self.id = id
        self._data = data
        self.exists = data is not None

    def to_dict(self) -> dict[str, Any] | None:
        return self._data


class FakeDoc:
    def __init__(self, store: dict[str, dict[str, Any]], id: str) -> None:
        self._store, self.id = store, id

    def set(self, data: dict[str, Any]) -> None:
        self._store[self.id] = dict(data)

    def get(self) -> FakeSnapshot:
        return FakeSnapshot(self.id, self._store.get(self.id))

    def update(self, fields: dict[str, Any]) -> None:
        self._store[self.id].update(fields)

    def delete(self) -> None:
        del self._store[self.id]


class FakeCollection:
    def __init__(self) -> None:
        self.store: dict[str, dict[str, Any]] = {}

    def document(self, id: str) -> FakeDoc:
        return FakeDoc(self.store, id)

    def order_by(self, field: str) -> "FakeCollection":
        assert field == "created_at"
        return self

    def stream(self) -> list[FakeSnapshot]:
        rows = sorted(self.store.items(), key=lambda kv: kv[1]["created_at"])
        return [FakeSnapshot(i, d) for i, d in rows]


class FakeClient:
    def __init__(self) -> None:
        self.collections: dict[str, FakeCollection] = {}

    def collection(self, name: str) -> FakeCollection:
        return self.collections.setdefault(name, FakeCollection())


@pytest.fixture
def client() -> FakeClient:
    return FakeClient()


@pytest.fixture
def repo(client: FakeClient) -> FirestoreTodoRepository:
    return FirestoreTodoRepository(client)  # type: ignore[arg-type]


def test_create_persists_in_todos_collection(
    repo: FirestoreTodoRepository, client: FakeClient
) -> None:
    todo = repo.create(TodoCreate(title="  buy milk "))
    assert todo.title == "buy milk"
    assert not todo.done
    assert isinstance(client.collections["todos"].store[todo.id]["created_at"], datetime)


def test_list_oldest_first(repo: FirestoreTodoRepository) -> None:
    first = repo.create(TodoCreate(title="a"))
    second = repo.create(TodoCreate(title="b"))
    assert [t.id for t in repo.list()] == [first.id, second.id]


def test_update(repo: FirestoreTodoRepository) -> None:
    todo = repo.create(TodoCreate(title="a"))
    updated = repo.update(todo.id, TodoUpdate(done=True))
    assert updated is not None
    assert updated.done and updated.title == "a"
    renamed = repo.update(todo.id, TodoUpdate(title="b"))
    assert renamed is not None
    assert renamed.title == "b" and renamed.done
    assert repo.list() == [renamed]


def test_update_missing(repo: FirestoreTodoRepository) -> None:
    assert repo.update("nope", TodoUpdate(done=True)) is None


def test_delete(repo: FirestoreTodoRepository) -> None:
    todo = repo.create(TodoCreate(title="a"))
    assert repo.delete(todo.id) is True
    assert repo.delete(todo.id) is False
    assert repo.list() == []


def test_get_repository_defaults_to_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("STORAGE", raising=False)
    get_repository.cache_clear()
    assert isinstance(get_repository(), InMemoryTodoRepository)
    get_repository.cache_clear()


def test_get_repository_firestore(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("STORAGE", "firestore")
    monkeypatch.setattr("app.main.firestore.Client", FakeClient)
    get_repository.cache_clear()
    assert isinstance(get_repository(), FirestoreTodoRepository)
    get_repository.cache_clear()
