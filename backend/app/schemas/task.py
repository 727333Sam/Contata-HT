"""Task Pydantic schemas."""

from datetime import date, datetime
from enum import Enum as PyEnum
from uuid import UUID

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskStatus(str, PyEnum):
    backlog = "backlog"
    in_progress = "in_progress"
    review = "review"
    done = "done"


class TaskBase(BaseModel):
    title: str = Field(..., max_length=200, description="Task title (max 200 chars)")
    description: str | None = Field(None, description="Optional description")
    status: TaskStatus = Field(TaskStatus.backlog, description="Current status")
    start_date: date | None = Field(None, description="Scheduled start")
    end_date: date | None = Field(None, description="Scheduled end")
    board_position: int = Field(0, description="Board column position")


class TaskCreate(TaskBase):
    dependencies: Optional[List[str]] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    description: str | None = None
    status: TaskStatus | None = None
    start_date: date | None = None
    end_date: date | None = None
    board_position: int | None = None


class TaskUpdateWithDeps(BaseModel):
    title: str | None = Field(None, max_length=200)
    description: str | None = None
    status: TaskStatus | None = None
    dependencies: list[str] | None = Field(None, description="Prerequisite task IDs")


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class TaskWithDependencies(TaskResponse):
    dependencies: list[dict] = Field(default_factory=list, description="Incoming dependencies")
    dependents: list[dict] = Field(default_factory=list, description="Outgoing dependents")
