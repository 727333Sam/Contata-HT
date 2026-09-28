"""Dependency CRUD operations."""

from typing import Sequence

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app import models, schemas


def get_dependency(db: Session, dep_id: int) -> models.Dependency | None:
    return db.get(models.Dependency, dep_id)


def get_dependencies_for_task(db: Session, task_id) -> Sequence[models.Dependency]:
    stmt = (
        select(models.Dependency)
        .where(models.Dependency.target_task_id == task_id)
        .order_by(models.Dependency.created_at.desc())
    )
    return db.execute(stmt).scalars().all()


def get_dependents_for_task(db: Session, task_id) -> Sequence[models.Dependency]:
    stmt = (
        select(models.Dependency)
        .where(models.Dependency.source_task_id == task_id)
        .order_by(models.Dependency.created_at.desc())
    )
    return db.execute(stmt).scalars().all()


def create_dependency(db: Session, dep: schemas.DependencyCreate) -> models.Dependency:
    db_dep = models.Dependency(**dep.model_dump())
    db.add(db_dep)
    db.commit()
    db.refresh(db_dep)
    return db_dep


def delete_dependency(db: Session, dep_id: int) -> bool:
    db_dep = get_dependency(db, dep_id)
    if not db_dep:
        return False
    db.delete(db_dep)
    db.commit()
    return True


def validate_dependency(db: Session, dep_id: int, validated: bool) -> models.Dependency | None:
    db_dep = get_dependency(db, dep_id)
    if not db_dep:
        return None
    db_dep.validated = validated
    db.commit()
    db.refresh(db_dep)
    return db_dep
