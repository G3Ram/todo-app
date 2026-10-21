from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app, get_repository
from app.repository import InMemoryTodoRepository


@pytest.fixture
def client() -> Iterator[TestClient]:
    """A test client with a fresh, empty repository for each test."""
    repo = InMemoryTodoRepository()
    app.dependency_overrides[get_repository] = lambda: repo
    yield TestClient(app)
    app.dependency_overrides.clear()
