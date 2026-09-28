"""Schema package exports."""

from app.schemas.task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    TaskUpdateWithDeps,
    TaskResponse,
    TaskStatus,
    TaskWithDependencies,
)
from app.schemas.dependency import (
    DependencyBase,
    DependencyCreate,
    DependencyResponse,
    SuggestedByEnum,
    AISuggestion,
)

__all__ = [
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskUpdateWithDeps",
    "TaskResponse",
    "TaskStatus",
    "TaskWithDependencies",
    "DependencyBase",
    "DependencyCreate",
    "DependencyResponse",
    "SuggestedByEnum",
    "AISuggestion",
]
