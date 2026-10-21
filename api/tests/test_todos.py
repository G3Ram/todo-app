from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_list_starts_empty(client: TestClient) -> None:
    assert client.get("/todos").json() == []


def test_create_and_list(client: TestClient) -> None:
    res = client.post("/todos", json={"title": "  Buy milk  "})
    assert res.status_code == 201
    todo = res.json()
    assert todo["title"] == "Buy milk"
    assert todo["done"] is False

    assert [t["id"] for t in client.get("/todos").json()] == [todo["id"]]


def test_list_is_oldest_first(client: TestClient) -> None:
    client.post("/todos", json={"title": "first"})
    client.post("/todos", json={"title": "second"})
    assert [t["title"] for t in client.get("/todos").json()] == ["first", "second"]


def test_rejects_empty_title(client: TestClient) -> None:
    assert client.post("/todos", json={"title": ""}).status_code == 422


def test_rejects_long_title(client: TestClient) -> None:
    assert client.post("/todos", json={"title": "x" * 201}).status_code == 422
