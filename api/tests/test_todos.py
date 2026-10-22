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


def test_mark_done_and_undone(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    res = client.patch(f"/todos/{todo['id']}", json={"done": True})
    assert res.status_code == 200
    assert res.json()["done"] is True
    assert client.get("/todos").json()[0]["done"] is True

    res = client.patch(f"/todos/{todo['id']}", json={"done": False})
    assert res.json()["done"] is False


def test_patch_unknown_id_is_404(client: TestClient) -> None:
    assert client.patch("/todos/nope", json={"done": True}).status_code == 404


def test_delete_removes_todo(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    assert client.delete(f"/todos/{todo['id']}").status_code == 204
    assert client.get("/todos").json() == []


def test_delete_unknown_id_is_404(client: TestClient) -> None:
    assert client.delete("/todos/nope").status_code == 404


def test_rejects_long_title(client: TestClient) -> None:
    assert client.post("/todos", json={"title": "x" * 201}).status_code == 422
