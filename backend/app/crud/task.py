"""Task CRUD operations."""

import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app import models, schemas


def get_task(db: Session, task_id: uuid.UUID) -> models.Task | None:
    """Fetch a single task by UUID."""
    return db.get(models.Task, task_id)


def get_tasks(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Task]:
    """List tasks with pagination."""
    stmt = select(models.Task).offset(skip).limit(limit).order_by(models.Task.board_position)
    return db.execute(stmt).scalars().all()


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    """Create a new task record."""
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: uuid.UUID, updates: schemas.TaskUpdate) -> models.Task | None:
    """Partially update a task."""
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_task, field, value)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: uuid.UUID) -> bool:
    """Delete a task; cascade removes its dependency edges."""
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    return True
