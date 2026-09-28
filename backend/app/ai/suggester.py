"""AI dependency suggester — OpenAI (ChatGPT) integration."""

import json
import os
from typing import List

from openai import OpenAI
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import get_settings

settings = get_settings()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY or "")

PROMPT_TEMPLATE = """You are an expert project planner. Given the following task and existing project tasks, suggest dependencies (prerequisites) that this task requires to proceed safely.

Task to analyze:
- Title: {title}
- Description: {description}
- Status: {status}

Existing tasks in project:
{existing_tasks}

Respond ONLY with a JSON array of objects with keys: source_task_id (string UUID), target_task_id (string UUID — must be one of the existing IDs above), confidence (float 0-1), rationale (string <=300 chars). Only include suggestions where confidence > 0.6. If no dependencies make sense, return [].
"""


def suggest_dependencies(db: Session, task_id) -> List[schemas.AISuggestion]:
    task = crud.get_task(db, task_id)
    if not task:
        return []
    existing = crud.get_tasks(db, skip=0, limit=50)
    existing_text = "\n".join(
        f"- ID={t.id} Title={t.title} Status={t.status}" for t in existing
    )
    prompt = PROMPT_TEMPLATE.format(
        title=task.title,
        description=task.description or "(none)",
        status=task.status,
        existing_tasks=existing_text,
    )
    suggestions: List[schemas.AISuggestion] = []
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        raw = response.choices[0].message.content or "[]"
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[-2] if "```" in raw else raw
            raw = raw.strip()
        if "```json" in raw:
            raw = raw.split("```json")[-1].split("```")[0].strip()
        parsed = json.loads(raw)
        if isinstance(parsed, dict) and "suggestions" in parsed:
            parsed = parsed["suggestions"]
        if not isinstance(parsed, list):
            parsed = []
    except Exception:
        return []

    for item in parsed:
        if not isinstance(item, dict):
            continue
        confidence = float(item.get("confidence", 0))
        if confidence <= 0.6:
            continue
        s_id = item.get("source_task_id")
        t_id = item.get("target_task_id")
        if s_id is None or t_id is None:
            continue
        try:
            source_exists = crud.get_task(db, __import__("uuid").UUID(s_id)) is not None
            target_exists = crud.get_task(db, __import__("uuid").UUID(t_id)) is not None
        except Exception:
            continue
        if not source_exists or not target_exists:
            continue
        existing_dep = db.query(models.Dependency).filter(
            models.Dependency.source_task_id == __import__("uuid").UUID(s_id),
            models.Dependency.target_task_id == __import__("uuid").UUID(t_id),
        ).first()
        if existing_dep:
            continue
        dep_create = schemas.DependencyCreate(
            source_task_id=__import__("uuid").UUID(s_id),
            target_task_id=__import__("uuid").UUID(t_id),
            suggested_by=schemas.SuggestedByEnum.ai,
            validated=False,
            confidence=confidence,
            rationale=str(item.get("rationale", "AI suggested dependency"))[:1000],
        )
        db_dep = crud.create_dependency(db, dep_create)
        suggestions.append(
            schemas.AISuggestion(
                source_task_id=db_dep.source_task_id,
                target_task_id=db_dep.target_task_id,
                confidence=db_dep.confidence or confidence,
                rationale=db_dep.rationale or "",
            )
        )
    return suggestions
