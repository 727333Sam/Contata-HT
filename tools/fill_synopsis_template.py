"""
Fill the Hackathon Synopsis Template (.xlsx) with TaskFlow Pro synopsis content.

Usage:
    python tools/fill_synopsis_template.py

Reads: Desktop/Hackathon-Synopsis-Template.xlsx
Writes: Desktop/Contata HT/.tmp/Hackathon-Synopsis-Filled.xlsx
"""

import os
import sys
from pathlib import Path

try:
    from openpyxl import load_workbook
except ImportError:
    print("ERROR: openpyxl not installed. Run: pip install openpyxl")
    sys.exit(1)

# --- Synopsis Content (plain text, 200-2500 chars each) ---

SECTIONS = {
    1: (
        "TaskFlow Pro addresses a critical gap in project management: most Kanban tools treat tasks as "
        "independent units, ignoring the dependency relationships that define real-world workflows. "
        "When teams manage software sprints, construction projects, or product launches, tasks are "
        "inherently interconnected. Delaying a design review blocks frontend development, which blocks QA, "
        "which blocks deployment. Current tools force project managers to track these cascading impacts "
        "manually, leading to missed deadlines and stalled pipelines.\n\n"
        "Target users are project managers, engineering leads, and operations teams managing 20-200 "
        "interdependent tasks. These users need to visualize both task status (via Kanban columns) and "
        "task relationships (via a dependency graph) in a single interface.\n\n"
        "The core complexity lies in maintaining a valid Directed Acyclic Graph (DAG) while supporting "
        "intuitive drag-and-drop Kanban interactions. Specific challenges include: (1) Rejecting circular "
        "dependencies in real time without disrupting workflow. (2) Propagating schedule changes downstream "
        "through the entire graph without double-counting delays when multiple paths converge on the same "
        "task. (3) Dynamically recalculating blocked/ready status when upstream tasks regress. "
        "(4) Persisting the complete graph state, board positions, and dates across browser refreshes.\n\n"
        "Edge cases are significant. A task with converging dependency paths (A to B to D, and A to C to D) "
        "must receive a single propagated delay, not a compounded one. Moving a completed task back to "
        "In Progress must re-block all downstream dependents whose prerequisites are no longer satisfied. "
        "The system must handle disconnected subgraphs, tasks with no dependencies, and graphs with "
        "long chains gracefully."
    ),

    2: (
        "The solution is a three-layer architecture: a React frontend with a four-column Kanban board "
        "and interactive DAG visualizer, a FastAPI backend exposing RESTful endpoints for task and "
        "dependency CRUD operations, and a PostgreSQL database for persistent storage.\n\n"
        "DAG Engine (Backend Core):\n"
        "The dependency engine maintains an adjacency list representation of the task graph. "
        "Cycle detection uses Depth-First Search (DFS) with a coloring scheme (white/gray/black). "
        "Before persisting any new edge, the engine runs DFS from the target node to check reachability "
        "back to the source. If a cycle is detected, the edge is rejected and the graph remains unchanged. "
        "Time complexity is O(V+E) per edge addition.\n\n"
        "Schedule Propagation Algorithm:\n"
        "When a task's dates change, the engine performs a topological sort (Kahn's algorithm) on the "
        "downstream subgraph to determine processing order. It then applies a BFS traversal with a "
        "visited-set to handle converging paths. Each downstream task computes its new start date as "
        "max(end_dates of all direct predecessors). The visited-set prevents the same upstream delay from "
        "being applied multiple times through different paths, solving the no-compounding requirement.\n\n"
        "Rollback on Regression:\n"
        "When a task moves backward (e.g., Done to In Progress), the engine traverses all downstream "
        "dependents and re-evaluates their blocked/ready status. A task becomes Blocked if any prerequisite "
        "is not in the Done state.\n\n"
        "Critical Path (Bonus):\n"
        "Longest-path calculation through the DAG using topological ordering and dynamic programming, "
        "highlighting the chain of tasks that determines minimum project completion time.\n\n"
        "Tech Stack: React 18 with React Beautiful DnD for drag-and-drop, React Flow for DAG "
        "visualization, FastAPI with Pydantic validation, PostgreSQL with SQLAlchemy ORM, and "
        "an LLM integration layer for AI-augmented dependency suggestions."
    ),

    3: (
        "Data Model:\n"
        "Tasks table: id (UUID), title, description, status (enum: backlog/in_progress/review/done), "
        "start_date, end_date, board_position (integer), created_at, updated_at. "
        "Dependencies table: id, source_task_id (FK), target_task_id (FK), suggested_by (enum: "
        "user/ai), validated (boolean), created_at. Unique constraint on (source, target) pairs.\n\n"
        "Data Integrity:\n"
        "All dependency mutations are wrapped in database transactions. Edge creation follows a strict "
        "sequence: validate both tasks exist, run cycle detection, persist edge, recalculate downstream "
        "statuses, propagate schedule changes. If any step fails, the transaction rolls back entirely.\n\n"
        "Security Considerations:\n"
        "Input validation via Pydantic schemas on all API endpoints. SQL injection prevention through "
        "ORM parameterized queries. Rate limiting on AI suggestion endpoints to prevent LLM API abuse. "
        "AI-suggested dependencies are stored with suggested_by=ai and validated=false, requiring explicit "
        "human approval before the engine treats them as real edges. No user authentication is scoped for "
        "this sprint (single-user prototype), but the data model supports multi-tenancy extension.\n\n"
        "Feasibility Assessment:\n"
        "The 72-hour sprint is feasible with a prioritized build order: (1) Hours 0-8: Data model, "
        "migrations, seed data with 8-10 realistic tasks and dependency relationships. (2) Hours 8-24: "
        "DAG engine with cycle detection, schedule propagation, and status recalculation, tested "
        "independently with unit tests. (3) Hours 24-48: Kanban UI with drag-and-drop, DAG visualization, "
        "wired to backend APIs. (4) Hours 48-64: AI integration layer with LLM dependency suggestions and "
        "human validation flow. (5) Hours 64-72: Persistence verification, error handling, responsive "
        "polish, README with Key Assumptions and Limitations section."
    ),

    4: (
        "AI Integration (Mandatory 15% Component):\n\n"
        "The system integrates LLM-powered dependency suggestion as a first-class feature. When a user "
        "creates or updates a task, the AI module analyzes the task title and description against all "
        "existing tasks to suggest likely dependency relationships.\n\n"
        "Model and Prompting Strategy:\n"
        "The system uses the Claude API (claude-sonnet model) with structured prompting. Each suggestion "
        "request sends the new task's title and description alongside a concise summary of existing tasks "
        "(id, title, status). The prompt instructs the model to return a JSON array of suggested edges "
        "with confidence scores and one-line rationale for each suggestion.\n\n"
        "Grounding and Hallucination Reduction:\n"
        "Three techniques reduce hallucination risk: (1) Constrained output format: The LLM must return "
        "only task IDs that exist in the provided context. The backend validates every returned ID against "
        "the database before presenting suggestions. Invalid IDs are silently dropped. (2) Confidence "
        "thresholding: Only suggestions with confidence above 0.6 are shown to the user, reducing low-"
        "quality noise. (3) Context grounding: The prompt includes only factual task data (titles, "
        "descriptions, statuses) with no speculative context, minimizing hallucination surface area.\n\n"
        "Human-in-the-Loop Validation:\n"
        "AI suggestions are never auto-applied. They appear in a dedicated Suggested Dependencies panel "
        "with Accept/Reject buttons. Each suggestion shows the LLM's rationale. Only accepted suggestions "
        "are passed to the DAG engine for cycle validation and persistence. The engine treats AI-accepted "
        "edges identically to manually created ones, enforcing all graph constraints.\n\n"
        "AI-Tool Declaration:\n"
        "Claude API is used for dependency suggestion. ChatGPT/GitHub Copilot may be used during "
        "development for code assistance. All AI usage will be declared in the required AI-Tool "
        "Declaration document as part of the submission."
    ),

    5: (
        "Business Impact:\n"
        "TaskFlow Pro eliminates manual dependency tracking, which typically consumes 3-5 hours per week "
        "for project managers on medium-complexity projects. Automatic schedule propagation removes the "
        "error-prone process of manually updating downstream dates when plans shift. For a team managing "
        "50 interdependent tasks, this reduces schedule update time from approximately 30 minutes of "
        "manual recalculation to under 1 second of automated propagation.\n\n"
        "Performance Targets:\n"
        "Cycle detection: sub-100ms for graphs up to 500 nodes and 2000 edges. Schedule propagation: "
        "sub-200ms for full-graph recalculation. Kanban drag-and-drop: sub-50ms visual feedback with "
        "optimistic UI updates. API response times: p95 under 300ms for all CRUD operations. "
        "AI suggestion latency: under 3 seconds per request (bounded by LLM API response time).\n\n"
        "Scalability Path:\n"
        "The architecture supports horizontal scaling. The DAG engine is stateless per request, "
        "reading graph state from PostgreSQL. The database schema supports partitioning by project/workspace. "
        "For larger deployments, the dependency engine could be extracted into a dedicated microservice "
        "with graph computation offloaded to an in-memory representation, synced with the database via "
        "event sourcing.\n\n"
        "Sustainability and Long-Term Value:\n"
        "The core DAG engine (cycle detection, topological sort, schedule propagation) uses well-established "
        "graph algorithms with predictable performance characteristics. The AI suggestion layer is modular "
        "and model-agnostic, allowing swaps between LLM providers without affecting the deterministic engine. "
        "The Kanban plus DAG dual-view pattern addresses a genuine market gap. Existing tools offer either "
        "Kanban boards (Trello, Jira boards) or Gantt charts with dependencies (MS Project), but rarely "
        "both in a unified, lightweight interface."
    ),

    6: (
        "Key Assumptions:\n"
        "(1) Single-user prototype: No authentication or multi-user collaboration is implemented in the "
        "sprint. The data model supports future multi-tenancy but the UI assumes one user. "
        "(2) Graph scale: The prototype is optimized for projects with up to 200 tasks and 500 dependency "
        "edges. Performance beyond this scale is not tested within the sprint. "
        "(3) LLM availability: AI features depend on external API availability. The system degrades "
        "gracefully if the LLM endpoint is unreachable, with dependency suggestion disabled and all other "
        "features fully functional. "
        "(4) Browser support: Chrome, Edge, and Safari as specified. No mobile-specific optimizations.\n\n"
        "Known Limitations:\n"
        "(1) No undo/redo for dependency operations in the current sprint scope. "
        "(2) Schedule propagation uses simple start/end date arithmetic without support for working-day "
        "calendars, holidays, or resource allocation. "
        "(3) AI suggestions are based on text similarity in task titles and descriptions. Domain-specific "
        "workflow knowledge (e.g., knowing that code review always follows development) requires training "
        "data or fine-tuning not included in this prototype.\n\n"
        "Technical Risks and Mitigation:\n"
        "Risk 1: Complex graph operations causing UI lag. Mitigation: Optimistic UI updates with backend "
        "validation, debounced API calls. "
        "Risk 2: LLM hallucinating non-existent task IDs. Mitigation: Backend validation of all returned "
        "IDs, confidence thresholding, human approval gate. "
        "Risk 3: Data loss on concurrent operations. Mitigation: Database transactions with row-level "
        "locking on dependency mutations.\n\n"
        "72-Hour Sprint Milestones:\n"
        "Hours 0-8: Schema, migrations, seed data (8-10 tasks with dependencies). "
        "Hours 8-24: DAG engine with full test coverage. "
        "Hours 24-48: Kanban UI and DAG visualization wired to APIs. "
        "Hours 48-64: AI integration with human-in-loop validation. "
        "Hours 64-72: Persistence checks, error handling, README, deployment attempt."
    ),
}

def validate_content():
    """Validate all sections meet character requirements."""
    total = 0
    for num, content in SECTIONS.items():
        length = len(content)
        total += length
        if length < 200:
            print(f"ERROR: Section {num} is {length} chars (minimum 200)")
            return False
        if length > 2500:
            print(f"WARNING: Section {num} is {length} chars (max 2500, will be truncated)")
        print(f"Section {num}: {length} chars {'OK' if 200 <= length <= 2500 else 'OVER'}")
    print(f"\nTotal: {total} chars (minimum 1200)")
    if total < 1200:
        print("ERROR: Total is below 1200 minimum")
        return False
    return True


def fill_template(template_path, output_path):
    """Fill column D of the template with synopsis content."""
    wb = load_workbook(template_path)
    ws = wb["Synopsis"]

    for row_idx in range(2, 8):  # Rows 2-7 (data rows, row 1 is header)
        section_num = row_idx - 1
        if section_num in SECTIONS:
            ws.cell(row=row_idx, column=4, value=SECTIONS[section_num])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    wb.save(output_path)
    print(f"\nFilled template saved to: {output_path}")


if __name__ == "__main__":
    desktop = Path.home() / "Desktop"
    template = desktop / "Hackathon-Synopsis-Template.xlsx"
    output = desktop / "Contata HT" / ".tmp" / "Hackathon-Synopsis-Filled.xlsx"

    if not template.exists():
        print(f"ERROR: Template not found at {template}")
        sys.exit(1)

    print("=== Synopsis Content Validation ===\n")
    if not validate_content():
        sys.exit(1)

    print("\n=== Filling Template ===")
    fill_template(str(template), str(output))
    print("\nDone. Upload this file to https://hackathon.contata.com/synopsis")
