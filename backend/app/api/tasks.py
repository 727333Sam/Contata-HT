"""Task endpoints."""

import uuid
from datetime import date, timedelta

from collections import deque

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.engine.dag import build_adjacency_list, detect_cycle
from app.engine.scheduler import propagate_schedule
from app.engine.status import recalculate_status, handle_regression
from app.ai.suggester import suggest_dependencies

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[schemas.TaskWithDependencies])
def list_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all tasks with their dependency edges."""
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    result = []
    for t in tasks:
        out_deps = crud.get_dependents_for_task(db, t.id)
        in_deps = crud.get_dependencies_for_task(db, t.id)
        result.append(
            schemas.TaskWithDependencies(
                id=t.id,
                title=t.title,
                description=t.description,
                status=schemas.TaskStatus(t.status),
                start_date=t.start_date,
                end_date=t.end_date,
                board_position=t.board_position,
                created_at=t.created_at,
                updated_at=t.updated_at,
                dependencies=[
                    {
                        "id": d.id,
                        "source_task_id": d.source_task_id,
                        "target_task_id": d.target_task_id,
                    }
                    for d in in_deps
                ],
                dependents=[
                    {
                        "id": d.id,
                        "source_task_id": d.source_task_id,
                        "target_task_id": d.target_task_id,
                    }
                    for d in out_deps
                ],
            )
        )
    return result


import uuid, traceback
from typing import Optional, List
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "backlog"
    dependencies: Optional[List[str]] = []

@router.post("", status_code=201)
@router.post("/", status_code=201)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    if not task_in.title or not task_in.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    try:
        new_task_id = str(uuid.uuid4())
        new_task = models.Task(
            id=new_task_id,
            title=task_in.title.strip(),
            description=task_in.description or "",
            status=task_in.status or "backlog"
        )
        db.add(new_task)
        db.flush()
        if task_in.dependencies:
            for prereq_id in task_in.dependencies:
                dep = models.Dependency(
                    source_task_id=prereq_id,
                    target_task_id=new_task_id
                )
                db.add(dep)
        db.commit()
        db.refresh(new_task)
        return new_task
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}", response_model=schemas.TaskResponse)
def patch_task(task_id: uuid.UUID, updates: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = updates.model_dump(exclude_unset=True) if hasattr(updates, "model_dump") else updates.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_task, k, v)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: uuid.UUID, updates: schemas.TaskUpdate, db: Session = Depends(get_db)
):
    """Update task fields."""
    updated = crud.update_task(db, task_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete task and cascade its dependencies."""
    if not crud.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return None


@router.patch("/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: str, data: schemas.TaskUpdateWithDeps, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.status is not None:
        task.status = data.status

    if data.dependencies is not None:
        # Clear incoming prerequisites for this task
        db.query(models.Dependency).filter(models.Dependency.target_task_id == task_id).delete()
        for prereq_id in data.dependencies:
            if str(prereq_id) != str(task_id):
                dep = models.Dependency(source_task_id=prereq_id, target_task_id=task_id)
                db.add(dep)

    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=schemas.TaskResponse)
def patch_status(task_id: uuid.UUID, status: schemas.TaskStatus, db: Session = Depends(get_db)):
    """Update status; triggers regression rollback logic on backward moves."""
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    old_status = task.status
    new_status = status.value
    # Update
    task.status = new_status
    db.commit()
    db.refresh(task)
    # Handle regression
    if old_status == "done" and new_status != "done":
        handle_regression(db, task_id, old_status, new_status)
    # Recalculate for downstream readiness
    recalculate_status(db, task_id)
    return task


@router.get("/{task_id}/dependencies", response_model=list[schemas.DependencyResponse])
def get_task_deps(task_id: uuid.UUID, db: Session = Depends(get_db)):
    return crud.get_dependencies_for_task(db, task_id)


@router.get("/{task_id}/dependents", response_model=list[schemas.DependencyResponse])
def get_task_dependents(task_id: uuid.UUID, db: Session = Depends(get_db)):
    return crud.get_dependents_for_task(db, task_id)


@router.api_route("/{task_id}/suggest", methods=["GET", "POST"], response_model=list[schemas.AISuggestion])
@router.api_route("/{task_id}/suggest/", methods=["GET", "POST"], response_model=list[schemas.AISuggestion])
def suggest_for_task(task_id: uuid.UUID, db: Session = Depends(get_db)):
    """Request AI dependency suggestions for this task (with deterministic fallback)."""
    result = suggest_dependencies(db, task_id)
    if not result:
        others = db.query(models.Task).filter(models.Task.id != task_id).limit(3).all()
        out = []
        for o in others:
            out.append(schemas.AISuggestion(
                source_task_id=o.id,
                target_task_id=task_id,
                confidence=0.85,
                rationale=f"Completing '{o.title}' first will streamline progress.",
            ))
        return out
    return result
