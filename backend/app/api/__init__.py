"""API package exports."""

from app.api.router import router
from app.api import tasks, dependencies

__all__ = ["router"]
