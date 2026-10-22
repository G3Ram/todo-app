from datetime import datetime
from typing import Annotated, Self

from pydantic import BaseModel, Field, StringConstraints, model_validator


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class TodoUpdate(BaseModel):
    title: (
        Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
        | None
    ) = None
    done: bool | None = None

    @model_validator(mode="after")
    def require_a_field(self) -> Self:
        if self.title is None and self.done is None:
            raise ValueError("Provide title and/or done")
        return self


class Todo(BaseModel):
    id: str
    title: str
    done: bool = False
    created_at: datetime
