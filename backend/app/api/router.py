"""Main API router combining all endpoint modules."""

from fastapi import APIRouter

from app.api import tasks, dependencies

router = APIRouter(prefix="/api")
router.include_router(tasks.router)
router.include_router(dependencies.router)
