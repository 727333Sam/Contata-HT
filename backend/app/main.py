"""FastAPI entry point with CORS, lifespan, health check."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import engine, Base, get_db
from app.api.router import router
from app import seed
import socketio

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup: create tables; seed data if empty."""
    Base.metadata.create_all(bind=engine)
    # Seed only if no tasks exist
    db = next(get_db())
    try:
        count = db.query(__import__("app.models", fromlist=["Task"]).Task).count()
        if count == 0:
            seed.run_seed(db)
    finally:
        db.close()
    yield
    # Shutdown: nothing special


app = FastAPI(
    title="TaskFlow Pro API",
    description="Dependency-Aware Workflow & DAG Scheduling Engine",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main router
app.include_router(router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "TaskFlow Pro API"}


# Critical path endpoint
from app.engine.dag import build_adjacency_list, topological_sort

@app.get("/api/dag/critical-path")
def critical_path():
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        all_deps = db.query(__import__("app.models", fromlist=["Dependency"]).Dependency).all()
        graph = build_adjacency_list(all_deps)
        ordered = topological_sort(graph)
        return {"critical_path": ordered, "length": len(ordered)}
    finally:
        db.close()
# ----------------------------------------------------
# Socket.IO Real-Time Engine
# ----------------------------------------------------
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

@sio.event
async def connect(sid, environ):
    pass

@sio.event
async def disconnect(sid):
    pass

# Wrap the FastAPI app with Socket.IO so both share port 8000
app = socketio.ASGIApp(sio, other_asgi_app=app)