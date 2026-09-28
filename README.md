# TaskFlow Pro — README

**Dependency-Aware Workflow & DAG Scheduling Engine**  
Built for the Contata Hackathon (Sept 25–28, 2026) — 72-hour sprint.

---

## What It Does

TaskFlow Pro is a task management engine that treats dependencies as a Directed Acyclic Graph (DAG). It provides:

- **Kanban board:** 4 columns (Backlog → In Progress → Review → Done) with drag-and-drop
- **DAG visualization:** Interactive dependency graph showing prerequisites
- **Cycle detection:** Rejects circular dependencies before they are added
- **Schedule propagation:** Updates downstream dates when upstream tasks shift
- **Status management:** Dynamic blocked/ready state; rollback when tasks regress
- **AI suggestions:** Claude API proposes dependencies with confidence scores; human approves/rejects

---

## Quick Start

```bash
# 1. Clone and install
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# 2. Set up database
cp .env.example .env
# Edit .env with your DATABASE_URL (PostgreSQL)

# 3. Run migrations and seed
alembic upgrade head
python -c "from app.seed import main; main()"

# 4. Start backend
uvicorn app.main:app --reload --port 8000

# 5. Start frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Architecture

Three-Layer Monolith: React frontend → FastAPI backend → PostgreSQL database + Claude API.

See `docs/superpowers/specs/2026-09-25-taskflow-pro-design.md` for full design spec.

---

## Key Design Decisions

- **DAG Engine:** DFS three-color marking (O(V+E)) for cycle detection
- **Schedule Propagation:** Kahn's topological sort + BFS with visited-set prevents double-counting in diamond dependencies
- **Rollback:** When a completed task regresses, all downstream tasks are re-evaluated and blocked if prerequisites are unsatisfied
- **AI Integration:** Structured Claude API prompting with JSON output; only suggestions > 0.6 confidence shown; all validated against DB
- **Graceful Degradation:** AI failures never break core functionality

---

## AI Tool Declaration

This project uses the **Claude API (claude-sonnet)** for dependency suggestion:
- Structured prompting requests JSON array of {source, target, confidence, rationale}
- Confidence thresholding (>0.6) filters low-quality suggestions
- Human-in-loop validation: every AI suggestion requires user approval
- All suggested dependencies are stored with `suggested_by='ai'`, `validated=False`
- Respected: no secrets in code; API key only in `.env`

---

## Directory Layout

```
backend/    - FastAPI app, DAG engine, AI integration, database models
frontend/   - React 18 + TypeScript + Zustand + React Beautiful DnD + React Flow
docs/       - Design spec, AI declaration, resume
tools/      - Utility scripts (fill synopsis template, etc.)
workflows/  - WAT framework SOPs
.tmp/       - Temporary processing files (disposable)
```

---

## Known Limitations

Documented in `docs/superpowers/specs/2026-09-25-taskflow-pro-design.md` section 10.

---

## License

Built for the Contata Hackathon — open source for evaluation purposes.
