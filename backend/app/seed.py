"""Seed realistic software project tasks with diamond dependency."""

import uuid
from datetime import date

from sqlalchemy.orm import Session

from app import models

TASKS = [
    {
        "id": uuid.UUID("a1111111-1111-1111-1111-111111111111"),
        "title": "Project Setup & Repository Init",
        "description": "Initialize git repo, CI pipeline, and project scaffold.",
        "status": "done",
        "start_date": date(2026, 1, 1),
        "end_date": date(2026, 1, 3),
        "board_position": 0,
    },
    {
        "id": uuid.UUID("a2222222-2222-2222-2222-222222222222"),
        "title": "Database Schema Design",
        "description": "Design relational schema for users, tasks, and dependencies.",
        "status": "done",
        "start_date": date(2026, 1, 4),
        "end_date": date(2026, 1, 7),
        "board_position": 1,
    },
    {
        "id": uuid.UUID("a3333333-3333-3333-3333-333333333333"),
        "title": "Backend API Framework Setup",
        "description": "FastAPI app, SQLAlchemy models, and routing layer.",
        "status": "review",
        "start_date": date(2026, 1, 4),
        "end_date": date(2026, 1, 8),
        "board_position": 2,
    },
    {
        "id": uuid.UUID("a4444444-4444-4444-4444-444444444444"),
        "title": "User Authentication Module",
        "description": "JWT login, session management, role-based access.",
        "status": "in_progress",
        "start_date": date(2026, 1, 9),
        "end_date": date(2026, 1, 14),
        "board_position": 3,
    },
    {
        "id": uuid.UUID("a5555555-5555-5555-5555-555555555555"),
        "title": "Core Business Logic",
        "description": "Task scheduling rules, dependency validation, status engine.",
        "status": "in_progress",
        "start_date": date(2026, 1, 9),
        "end_date": date(2026, 1, 13),
        "board_position": 4,
    },
    {
        "id": uuid.UUID("a6666666-6666-6666-6666-666666666666"),
        "title": "Frontend UI Framework Setup",
        "description": "React/Vite scaffold, component library integration.",
        "status": "backlog",
        "start_date": None,
        "end_date": None,
        "board_position": 5,
    },
    {
        "id": uuid.UUID("a7777777-7777-7777-7777-777777777777"),
        "title": "API Integration Layer",
        "description": "Connect frontend to backend endpoints, error handling.",
        "status": "backlog",
        "start_date": None,
        "end_date": None,
        "board_position": 6,
    },
    {
        "id": uuid.UUID("a8888888-8888-8888-8888-888888888888"),
        "title": "Testing Suite Setup",
        "description": "Unit + integration tests for DAG engine and APIs.",
        "status": "backlog",
        "start_date": None,
        "end_date": None,
        "board_position": 7,
    },
    {
        "id": uuid.UUID("a9999999-9999-9999-9999-999999999999"),
        "title": "Frontend Dashboard Components",
        "description": "Kanban board, dependency graphs, critical path view.",
        "status": "backlog",
        "start_date": None,
        "end_date": None,
        "board_position": 8,
    },
    {
        "id": uuid.UUID("aa000000-0000-0000-0000-000000000000"),
        "title": "Deployment Pipeline",
        "description": "Docker build, cloud deploy, health checks.",
        "status": "backlog",
        "start_date": None,
        "end_date": None,
        "board_position": 9,
    },
]

DEPENDENCIES = [
    # 2 depends on 1
    ("a2222222-2222-2222-2222-222222222222", "a1111111-1111-1111-1111-111111111111", "user", True),
    # 3 depends on 1
    ("a3333333-3333-3333-3333-333333333333", "a1111111-1111-1111-1111-111111111111", "user", True),
    # 4 depends on 2, 3
    ("a4444444-4444-4444-4444-444444444444", "a2222222-2222-2222-2222-222222222222", "user", True),
    ("a4444444-4444-4444-4444-444444444444", "a3333333-3333-3333-3333-333333333333", "user", True),
    # 5 depends on 2
    ("a5555555-5555-5555-5555-555555555555", "a2222222-2222-2222-2222-222222222222", "user", True),
    # 6 depends on 3
    ("a6666666-6666-6666-6666-666666666666", "a3333333-3333-3333-3333-333333333333", "user", True),
    # 7 depends on 4, 5 (diamond convergence)
    ("a7777777-7777-7777-7777-777777777777", "a4444444-4444-4444-4444-444444444444", "user", True),
    ("a7777777-7777-7777-7777-777777777777", "a5555555-5555-5555-5555-555555555555", "user", True),
    # 8 depends on 5
    ("a8888888-8888-8888-8888-888888888888", "a5555555-5555-5555-5555-555555555555", "user", True),
    # 9 depends on 6, 7
    ("a9999999-9999-9999-9999-999999999999", "a6666666-6666-6666-6666-666666666666", "user", True),
    ("a9999999-9999-9999-9999-999999999999", "a7777777-7777-7777-7777-777777777777", "user", True),
    # 10 depends on 8, 9
    ("aa000000-0000-0000-0000-000000000000", "a8888888-8888-8888-8888-888888888888", "user", True),
    ("aa000000-0000-0000-0000-000000000000", "a9999999-9999-9999-9999-999999999999", "user", True),
]


def run_seed(db: Session):
    for t in TASKS:
        db.add(models.Task(**t))
    db.commit()
    # Create dependencies
    for s_id, t_id, suggested, validated in DEPENDENCIES:
        dep = models.Dependency(
            source_task_id=uuid.UUID(s_id),
            target_task_id=uuid.UUID(t_id),
            suggested_by=suggested,
            validated=validated,
        )
        db.add(dep)
    db.commit()
