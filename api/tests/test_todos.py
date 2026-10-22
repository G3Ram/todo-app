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


def test_patch_title_is_trimmed(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    res = client.patch(f"/todos/{todo['id']}", json={"title": "  Buy oat milk  "})
    assert res.status_code == 200
    assert res.json()["title"] == "Buy oat milk"
    assert res.json()["done"] is False
    assert client.get("/todos").json()[0]["title"] == "Buy oat milk"


def test_patch_title_and_done_together(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    res = client.patch(f"/todos/{todo['id']}", json={"title": "y", "done": True})
    assert res.json()["title"] == "y"
    assert res.json()["done"] is True


def test_patch_done_keeps_title(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    assert client.patch(f"/todos/{todo['id']}", json={"done": True}).json()["title"] == "x"


def test_patch_with_neither_field_is_422(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    assert client.patch(f"/todos/{todo['id']}", json={}).status_code == 422


def test_patch_rejects_blank_or_long_title(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    for title in ("", "   ", "x" * 201):
        assert client.patch(f"/todos/{todo['id']}", json={"title": title}).status_code == 422


def test_patch_title_unknown_id_is_404(client: TestClient) -> None:
    assert client.patch("/todos/nope", json={"title": "y"}).status_code == 404


def test_create_with_due_date(client: TestClient) -> None:
    res = client.post("/todos", json={"title": "x", "due_date": "2026-11-01"})
    assert res.json()["due_date"] == "2026-11-01"
    assert client.get("/todos").json()[0]["due_date"] == "2026-11-01"


def test_due_date_defaults_to_null(client: TestClient) -> None:
    assert client.post("/todos", json={"title": "x"}).json()["due_date"] is None


def test_rejects_invalid_due_date(client: TestClient) -> None:
    for bad in ("tomorrow", "2026-13-01", "2026-11-01T10:00:00"):
        assert client.post("/todos", json={"title": "x", "due_date": bad}).status_code == 422
    todo = client.post("/todos", json={"title": "x"}).json()
    assert client.patch(f"/todos/{todo['id']}", json={"due_date": "nope"}).status_code == 422


def test_patch_sets_and_clears_due_date(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x"}).json()
    res = client.patch(f"/todos/{todo['id']}", json={"due_date": "2026-11-01"})
    assert res.json()["due_date"] == "2026-11-01"

    res = client.patch(f"/todos/{todo['id']}", json={"due_date": None})
    assert res.status_code == 200
    assert res.json()["due_date"] is None


def test_patch_other_fields_keeps_due_date(client: TestClient) -> None:
    todo = client.post("/todos", json={"title": "x", "due_date": "2026-11-01"}).json()
    res = client.patch(f"/todos/{todo['id']}", json={"done": True})
    assert res.json()["due_date"] == "2026-11-01"
