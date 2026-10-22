from datetime import datetime

from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class TodoUpdate(BaseModel):
    done: bool


class Todo(BaseModel):
    id: str
    title: str
    done: bool = False
    created_at: datetime
