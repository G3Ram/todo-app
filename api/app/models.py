from datetime import date, datetime
from typing import Annotated, Self

from pydantic import BaseModel, Field, StringConstraints, model_validator


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    due_date: date | None = None


class TodoUpdate(BaseModel):
    title: (
        Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
        | None
    ) = None
    done: bool | None = None
    due_date: date | None = None  # explicit null clears it

    @model_validator(mode="after")
    def require_a_field(self) -> Self:
        if self.title is None and self.done is None and "due_date" not in self.model_fields_set:
            raise ValueError("Provide title, done and/or due_date")
        return self


class Todo(BaseModel):
    id: str
    title: str
    done: bool = False
    due_date: date | None = None
    created_at: datetime
