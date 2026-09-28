"""Task model definition."""

import uuid

from sqlalchemy import Column, Date, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Task(Base):
    """Represents a single task in the project board."""

    __tablename__ = "tasks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        String(20),
        nullable=False,
        default="backlog",
        index=True,
    )
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    board_position = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Dependencies where this task is the prerequisite (source)
    outgoing_deps = relationship(
        "Dependency",
        foreign_keys="Dependency.source_task_id",
        back_populates="source_task",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    # Dependencies where this task is the dependent (target)
    incoming_deps = relationship(
        "Dependency",
        foreign_keys="Dependency.target_task_id",
        back_populates="target_task",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
