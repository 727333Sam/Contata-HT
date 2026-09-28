"""Dependency endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.engine.dag import build_adjacency_list, detect_cycle

router = APIRouter(prefix="/dependencies", tags=["dependencies"])


@router.get("", response_model=list[dict])
def get_dependencies(db: Session = Depends(get_db)):
    from app import models
    deps = db.query(models.Dependency).all()
    return [
        {"id": f"e-{d.source_task_id}-{d.target_task_id}", "source": str(d.source_task_id), "target": str(d.target_task_id)}
        for d in deps
    ]


@router.post("", response_model=schemas.DependencyResponse, status_code=201)
def create_dependency(dep: schemas.DependencyCreate, db: Session = Depends(get_db)):
    """Add dependency after cycle detection."""
    all_deps = db.query(__import__("app.models", fromlist=["Dependency"]).Dependency).all()
    graph = build_adjacency_list(all_deps)
    source = str(dep.source_task_id)
    target = str(dep.target_task_id)
    if detect_cycle(graph, source, target):
        raise HTTPException(status_code=409, detail="Cycle detected — dependency rejected.")
    # Prevent self-loop
    if source == target:
        raise HTTPException(status_code=400, detail="Self-dependency not allowed.")
    return crud.create_dependency(db, dep)


@router.delete("/{dep_id}", status_code=204)
def delete_dependency(dep_id: int, db: Session = Depends(get_db)):
    if not crud.delete_dependency(db, dep_id):
        raise HTTPException(status_code=404, detail="Dependency not found")
    return None


@router.patch("/{dep_id}/validate", response_model=schemas.DependencyResponse)
def validate_dep(dep_id: int, validated: bool, db: Session = Depends(get_db)):
    result = crud.validate_dependency(db, dep_id, validated)
    if not result:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return result
