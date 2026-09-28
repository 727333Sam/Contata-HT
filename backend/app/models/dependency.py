"""Dependency model defining task prerequisite relationships."""

from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class SuggestedByEnum(str, PyEnum):
    user = "user"
    ai = "ai"


class Dependency(Base):
    """Directed edge from source_task (prerequisite) to target_task (dependent)."""

    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    source_task_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_task_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    suggested_by = Column(
        String(10),
        nullable=False,
        default=SuggestedByEnum.user,
    )
    validated = Column(Boolean, nullable=False, default=True)
    confidence = Column(Float, nullable=True)
    rationale = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "source_task_id", "target_task_id", name="uq_dependency_pair"
        ),
    )

    source_task = relationship(
        "Task", foreign_keys=[source_task_id], back_populates="outgoing_deps"
    )
    target_task = relationship(
        "Task", foreign_keys=[target_task_id], back_populates="incoming_deps"
    )

    def __repr__(self) -> str:
        return (
            f"<Dependency({self.source_task_id} -> {self.target_task_id}, "
            f"suggested_by={self.suggested_by}, validated={self.validated})>"
        )
