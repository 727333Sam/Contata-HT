# AI-Tool Declaration — TaskFlow Pro

**Project:** TaskFlow Pro — Dependency-Aware Workflow & DAG Scheduling Engine  
**Hackathon:** Contata — September 25–28, 2026  
**AI Tool:** Claude API (Anthropic) — model `claude-3-sonnet-20240229`

---

## How Claude Is Used

1. **Dependency Suggestion (`backend/app/ai/suggester.py`)**
   - Structured prompt sends a task's title/description + all existing tasks
   - Claude returns JSON array with `{source_task_id, target_task_id, confidence, rationale}`
   - Filter applied: only suggestions with `confidence > 0.6` are kept
   - All returned IDs validated against the database before storage
   - Stored with `suggested_by='ai'`, `validated=False`

2. **Design & Architecture Planning (this session)**
   - Claude generated architecture diagrams, evaluation criteria mapping, sprint timeline
   - Claude produced specification documents (`docs/superpowers/specs/`)
   - Claude wrote code for backend engine, frontend components, database schemas

---

## Human-in-Loop Validation (Required)

Every AI-suggested dependency requires explicit user approval:
- Frontend `SuggestionPanel` displays each suggestion with confidence bar
- User clicks "Accept" (PATCH validates) or "Reject" (DELETE removes)
- No AI suggestion is ever applied automatically

---

## Confidence Thresholding

- Threshold: `confidence > 0.6` (hard filter)
- Below threshold: discarded, never shown to user
- At/above threshold: shown with confidence progress bar and rationale text

---

## Graceful Degradation

If Claude API is unreachable or returns invalid output:
- `suggest_dependencies()` catches all exceptions and returns `[]`
- Core functionality (kanban, DAG visualization, manual dependencies) is unaffected
- Error message shown to user; no crash

---

## Data Privacy

- API key stored only in `.env` (never committed)
- No user data sent to Claude except task titles/descriptions for dependency analysis
- No personal information included in prompts
