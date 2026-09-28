"""Dependency Pydantic schemas."""

from datetime import datetime
from enum import Enum as PyEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SuggestedByEnum(str, PyEnum):
    user = "user"
    ai = "ai"


class DependencyBase(BaseModel):
    source_task_id: UUID = Field(..., description="Prerequisite task UUID")
    target_task_id: UUID = Field(..., description="Dependent task UUID")
    suggested_by: SuggestedByEnum = Field(SuggestedByEnum.user)
    validated: bool = Field(True)
    confidence: float | None = Field(None, ge=0.0, le=1.0)
    rationale: str | None = Field(None, max_length=1000)


class DependencyCreate(BaseModel):
    source_task_id: UUID
    target_task_id: UUID
    suggested_by: SuggestedByEnum = SuggestedByEnum.user
    validated: bool = True
    confidence: float | None = None
    rationale: str | None = None


class DependencyResponse(DependencyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class AISuggestion(BaseModel):
    source_task_id: UUID
    target_task_id: UUID
    confidence: float = Field(..., ge=0.0, le=1.0)
    rationale: str = Field(..., max_length=500)
