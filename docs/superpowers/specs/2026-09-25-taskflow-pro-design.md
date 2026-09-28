# TaskFlow Pro — Design Specification

**Project:** Dependency-Aware Workflow & DAG Scheduling Engine  
**Date:** September 25, 2026  
**Architecture:** Three-Layer Monolith (React → FastAPI → PostgreSQL + Claude API)  
**Sprint:** 72-hour hackathon (September 25–28, 2026)

---

## 1. Overview

TaskFlow Pro is a task management system with first-class support for dependency tracking, schedule propagation, and AI-assisted dependency discovery. It models task relationships as a Directed Acyclic Graph (DAG) and enforces invariants (no cycles, correct schedule propagation, blocked/ready status) at the engine level.

### Success Criteria
- Functional DAG engine with cycle detection, schedule propagation, and status management
- Interactive Kanban board with drag-and-drop status transitions
- Interactive DAG visualization showing task dependency relationships
- Claude API integration for dependency suggestion with human-in-loop validation
- Complete documentation: architecture, data model, known limitations
- Clean, well-structured code with type safety and error handling

---

## 2. Architecture

### 2.1 System Layers

```
┌──────────────────────────────────────────────┐
│  FRONTEND — React 18 + TypeScript            │
│  React Beautiful DnD • React Flow • Zustand  │
└────────────────────┬─────────────────────────┘
                     │ REST API + WebSocket
┌────────────────────┴─────────────────────────┐
│  BACKEND — FastAPI + Python                  │
│  DAG Engine • Schedule Propagator • AI       │
└────────────────────┬─────────────────────────┘
                     │ SQLAlchemy ORM
┌────────────────────┴─────────────────────────┐
│  DATABASE — PostgreSQL                       │
│  Tasks • Dependencies • Alembic Migrations   │
└──────────────────────────────────────────────┘
         ╎
   ┌─────┴──────┐
   │ Claude API │  (dependency suggestions)
   └────────────┘
```

### 2.2 Why a Monolith

For a 72-hour sprint, a monolith provides:
- **Speed:** Single deployment, no inter-service communication overhead.
- **Debuggability:** One process, one log stream, straightforward stack traces.
- **Simplicity:** Clear layer boundaries without the operational cost of service discovery, message brokers, or distributed tracing.

The architecture uses clean layer separation (models/schemas/engine/api) so it could be decomposed later without rewriting business logic.

---

## 3. Data Model

### 3.1 Tasks Table

| Column         | Type             | Constraints                        |
|---------------|------------------|------------------------------------|
| id            | UUID             | PK, default uuid4                  |
| title         | VARCHAR(200)     | NOT NULL                           |
| description   | TEXT             | nullable                           |
| status        | ENUM             | backlog, in_progress, review, done |
| start_date    | DATE             | nullable                           |
| end_date      | DATE             | nullable                           |
| board_position| INTEGER          | default 0                          |
| created_at    | TIMESTAMP(tz)    | auto, server_default=now()         |
| updated_at    | TIMESTAMP(tz)    | auto, onupdate=now()               |

### 3.2 Dependencies Table

| Column          | Type         | Constraints                                 |
|----------------|--------------|---------------------------------------------|
| id             | INTEGER      | PK, auto-increment                          |
| source_task_id | UUID         | FK → tasks.id, NOT NULL, ON DELETE CASCADE  |
| target_task_id | UUID         | FK → tasks.id, NOT NULL, ON DELETE CASCADE  |
| suggested_by   | ENUM         | user, ai — default 'user'                   |
| validated      | BOOLEAN      | default True (user) / False (AI)            |
| confidence     | FLOAT        | nullable — only for AI suggestions          |
| rationale      | TEXT         | nullable — AI explanation                   |
| created_at     | TIMESTAMP(tz)| auto, server_default=now()                  |

**Unique constraint:** (source_task_id, target_task_id) — prevents duplicate edges.  
**Semantics:** source_task_id depends on target_task_id (source must wait for target to complete).

### 3.3 Relationship Semantics

A dependency `A → B` means "A depends on B" — A cannot start until B is complete. In the DAG:
- `source_task_id` = the dependent task (A)
- `target_task_id` = the prerequisite task (B)
- Edge direction: B → A (prerequisite points to dependent)

---

## 4. Core Algorithms

### 4.1 Cycle Detection — DFS with Three-Color Marking

When adding edge `source → target`, we check whether `target` can already reach `source` in the existing graph. If so, adding the edge creates a cycle.

**Algorithm:**
1. Build adjacency list from all existing dependencies
2. Temporarily add the proposed edge
3. Run DFS from `source` using white(0)/gray(1)/black(2) coloring:
   - White: unvisited
   - Gray: currently in the DFS stack (visiting descendants)
   - Black: fully explored (all descendants visited)
4. If DFS encounters a gray node, a back edge exists → cycle detected
5. **Time complexity:** O(V + E) per edge addition

**Invariant:** The graph is always a valid DAG. No mutation occurs until cycle detection passes.

### 4.2 Schedule Propagation — Kahn's Algorithm + BFS

When a task's dates change, we propagate the change to all downstream dependents.

**Algorithm:**
1. Find all downstream tasks via topological sort of the affected subgraph
2. Process tasks in topological order using BFS with a visited-set
3. For each downstream task:
   - `start_date = max(end_dates of all direct predecessors)`
   - `end_date = start_date + task_duration` (if duration is set)
4. The visited-set ensures each task is processed exactly once

**Diamond Dependency Rule:**
```
    A
   / \
  B   C
   \ /
    D
```
If A delays by 3 days, both B and C shift by 3 days. D's new start_date = max(B.end_date, C.end_date). D shifts by exactly 3 days, not 6. The visited-set prevents double-counting.

### 4.3 Status Management — Blocked/Ready Dynamic

Tasks have a dynamic blocked/ready state computed from their prerequisites:

- **Ready:** All prerequisite tasks are in `done` status.
- **Blocked:** At least one prerequisite is NOT in `done` status.

**Rollback on Regression:**
When a task moves backward (e.g., `done` → `in_progress`):
1. Find all downstream dependents
2. For each dependent, recalculate blocked/ready status
3. If any prerequisite is now unsatisfied, the dependent is blocked
4. This cascades: if the dependent was `done`, its downstream tasks are also re-evaluated

**Status Transition Rules:**
- `backlog` → `in_progress`: Allowed if task is not blocked (all prereqs done)
- `in_progress` → `review`: Always allowed
- `review` → `done`: Always allowed
- Any status → `backlog`: Always allowed (regression, triggers cascade)
- `done` → any lower status: Triggers downstream re-evaluation

---

## 5. API Design

### 5.1 REST Endpoints

| Method  | Path                              | Purpose                          |
|---------|-----------------------------------|----------------------------------|
| GET     | /api/health                       | Health check                     |
| GET     | /api/tasks                        | List all tasks                   |
| POST    | /api/tasks                        | Create task                      |
| PUT     | /api/tasks/{id}                   | Update task                      |
| DELETE  | /api/tasks/{id}                   | Delete task (cascades deps)      |
| PATCH   | /api/tasks/{id}/status            | Change task status               |
| POST    | /api/dependencies                 | Add dependency (cycle check)     |
| DELETE  | /api/dependencies/{id}            | Remove dependency                |
| GET     | /api/tasks/{id}/dependencies      | Task's prerequisites             |
| GET     | /api/tasks/{id}/dependents        | Tasks that depend on this task   |
| POST    | /api/tasks/{id}/suggest           | Get AI dependency suggestions    |
| PATCH   | /api/dependencies/{id}/validate   | Accept/reject AI suggestion      |
| GET     | /api/dag/critical-path            | Compute critical path            |

### 5.2 WebSocket Events

| Event                   | Payload                          | Direction   |
|------------------------|----------------------------------|-------------|
| task.created           | Task object                      | Server → Client |
| task.updated           | Task object                      | Server → Client |
| task.deleted           | {task_id}                        | Server → Client |
| task.status.changed    | {task_id, old_status, new_status}| Server → Client |
| dependency.added       | Dependency object                | Server → Client |
| dependency.removed     | {dependency_id}                  | Server → Client |
| dependency.validated   | {dependency_id, validated}       | Server → Client |

---

## 6. AI Integration — Claude API

### 6.1 Dependency Suggestion Flow

1. User clicks "Suggest Dependencies" for a task
2. Backend sends structured prompt to Claude API:
   - Includes the target task's title and description
   - Includes all existing tasks with their titles, descriptions, and current dependencies
   - Requests JSON array of suggested dependencies with confidence scores
3. Claude returns suggestions:
   ```json
   {
     "suggestions": [
       {
         "source_task_id": "uuid-of-dependent",
         "target_task_id": "uuid-of-prerequisite",
         "confidence": 0.85,
         "rationale": "Frontend dashboard requires API endpoints to be ready"
       }
     ]
   }
   ```
4. Backend validates:
   - All task IDs exist in the database
   - Proposed edges would not create cycles
   - Confidence > 0.6 threshold
5. Valid suggestions are stored with `suggested_by='ai'`, `validated=False`
6. Frontend displays suggestions in the SuggestionPanel
7. User accepts or rejects each suggestion

### 6.2 Confidence Thresholding

- Suggestions with confidence ≤ 0.6 are filtered out
- Displayed confidence: progress bar in the SuggestionPanel
- Accepted suggestions become validated dependencies
- Rejected suggestions are deleted

### 6.3 Graceful Degradation

If the Claude API is unreachable or returns an error:
- The suggestion endpoint returns an empty array with a user-friendly error message
- All other features (kanban, DAG visualization, manual dependencies) continue working
- No dependency on AI for core functionality

---

## 7. Frontend Architecture

### 7.1 Component Tree

```
App
├── Header (title, theme toggle)
├── Main Layout
│   ├── KanbanBoard (60% width)
│   │   ├── KanbanColumn (Backlog)
│   │   │   └── TaskCard[]
│   │   ├── KanbanColumn (In Progress)
│   │   │   └── TaskCard[]
│   │   ├── KanbanColumn (Review)
│   │   │   └── TaskCard[]
│   │   └── KanbanColumn (Done)
│   │       └── TaskCard[]
│   └── Right Panel (40% width)
│       ├── DAGVisualizer
│       │   ├── Node[] (task nodes by status color)
│       │   └── Edge[] (solid=validated, dashed=AI-suggested)
│       └── SuggestionPanel
│           └── SuggestionCard[] (accept/reject)
└── Sidebar (filters, stats)
```

### 7.2 State Management (Zustand)

Single store with slices:
- `tasks`: Task array, selected task ID
- `dependencies`: Dependency array, pending suggestions
- `ui`: loading states, WebSocket status, panel visibility
- Actions: fetchTasks, addTask, updateTask, deleteTask, addDependency, removeDependency, validateDependency

### 7.3 Optimistic UI

When a user drags a task to a new column:
1. Immediately move the card in the UI (optimistic)
2. Send PATCH request to backend
3. If backend rejects (e.g., task is blocked):
   - Revert the card to its original position
   - Show error toast message
   - The backend performs all validation

---

## 8. Security & Compliance

- **API keys:** Stored in `.env` only, never committed to git
- **`.env.example`:** Committed with placeholder values
- **`.gitignore`:** Covers node_modules, .venv, dist, build, __pycache__, .env
- **No secrets in code:** All credentials via environment variables
- **Input validation:** Pydantic models for all API inputs
- **SQL injection prevention:** SQLAlchemy ORM with parameterized queries
- **CORS:** Restricted to allowed origins
- **Rate limiting:** On AI suggestion endpoint to prevent API abuse

---

## 9. Testing Strategy

### 9.1 Backend Tests
- **Unit tests:** DAG engine (cycle detection edge cases, topological sort), schedule propagation (diamond dependency), status management (regression cascades)
- **Integration tests:** API endpoints with test database
- **AI tests:** Mock Claude API responses, test confidence filtering, test graceful degradation

### 9.2 Frontend Tests
- **Component tests:** Kanban board rendering, task card interactions
- **DAG visualization tests:** Node/edge rendering with different states
- **Integration tests:** API service calls with mocked backend

---

## 10. Known Limitations

1. **Single-user system:** No authentication or multi-user support. Designed for single-user task management.
2. **No real-time collaboration:** WebSocket events are for UI reactivity, not multi-user sync.
3. **PostgreSQL required:** No SQLite fallback for development. Requires PostgreSQL installation.
4. **AI suggestion latency:** Claude API calls are synchronous and may take 2-5 seconds. No background job queue.
5. **No undo/redo:** Status changes and dependency mutations are immediate. No undo stack.
6. **Fixed Kanban columns:** The four columns (Backlog, In Progress, Review, Done) are hardcoded. No custom workflow states.
7. **No timezone handling:** Dates are stored as naive dates. No timezone-aware scheduling.
8. **Schedule propagation assumes sequential execution:** No parallel task execution or resource constraints modeled.

---

## 11. Sprint Timeline

| Phase   | Hours   | Deliverables                                              |
|---------|---------|----------------------------------------------------------|
| Setup   | H 0–8   | Schema, migrations, seed data (8–10 tasks)               |
| Engine  | H 8–24  | DAG engine: cycle detection + schedule propagation + tests|
| UI      | H 24–48 | Kanban board + DAG visualization + API integration       |
| AI      | H 48–64 | Claude API integration + human-in-loop validation        |
| Polish  | H 64–72 | Docs, testing, error handling, deployment                |

---

## 12. Evaluation Criteria Mapping

| Criterion                    | Weight | How We Address It                                    |
|------------------------------|--------|------------------------------------------------------|
| Functional Correctness       | 20%    | DFS cycle detection, diamond math, rollback, blocked/ready |
| Code Quality & Architecture  | 20%    | Clean layers, Pydantic types, error boundaries, naming |
| AI/LLM Usage                 | 15%    | Claude API suggestions, confidence thresholding, human-in-loop |
| Documentation                | 13%    | This spec, README, data model docs, known limitations |
| Testing                      | Bonus  | DAG engine unit tests, API integration tests          |
| Deployment                   | Bonus  | Docker setup, environment configuration               |
