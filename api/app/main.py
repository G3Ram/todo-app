import os
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import Todo, TodoCreate
from app.repository import InMemoryTodoRepository, TodoRepository

app = FastAPI(title="Todo API")

# Comma-separated list of allowed frontend origins.
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache
def get_repository() -> TodoRepository:
    return InMemoryTodoRepository()


Repo = Annotated[TodoRepository, Depends(get_repository)]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/todos")
def list_todos(repo: Repo) -> list[Todo]:
    return repo.list()


@app.post("/todos", status_code=201)
def create_todo(data: TodoCreate, repo: Repo) -> Todo:
    return repo.create(data)
