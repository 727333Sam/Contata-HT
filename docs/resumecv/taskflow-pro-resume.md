# Candidate Resume / CV — TaskFlow Pro Build

**Name:** [Candidate]  
**Role:** Software Engineer / Full-Stack Developer  
**Project:** TaskFlow Pro — Dependency-Aware Workflow & DAG Scheduling Engine  
**Hackathon:** Contata — Sept 25–28, 2026  
**GitHub:** https://github.com/[candidate]/taskflow-pro  
**LinkedIn:** https://linkedin.com/in/[candidate]

---

## Project Summary

Built a complete workflow and DAG scheduling engine in a 72-hour sprint using a Three-Layer Monolith architecture (React → FastAPI → PostgreSQL + Claude API). The system tracks task dependencies as a Directed Acyclic Graph with cycle detection, schedule propagation, blocked/ready status management, and AI-assisted dependency discovery.

---

## Key Technical Contributions

- **DAG Engine:** Implemented DFS three-color cycle detection (O(V+E)) and topological sort using Kahn's algorithm
- **Schedule Propagation:** Built BFS with visited-set to handle diamond-dependency scheduling without double-counting delays
- **Status Management:** Dynamic blocked/ready computation with rollback cascade on task regression
- **AI Integration:** Claude API dependency suggestions with structured JSON prompting, confidence thresholding (>0.6), and full human-in-loop validation
- **Frontend:** React 18 with Zustand state, React Beautiful DnD Kanban board, React Flow DAG visualization
- **Backend:** FastAPI with SQLAlchemy ORM, Alembic migrations, Pydantic validation, WebSocket events

---

## Skills Demonstrated

- Python (FastAPI, SQLAlchemy, Pydantic)  
- TypeScript / React (Zustand, Tailwind CSS, React Flow)  
- Database Design (PostgreSQL, relational modeling, constraints)  
- Algorithms (DFS, BFS, topological sort)  
- AI / LLM Integration (Anthropic Claude API, structured prompting, confidence filtering)  
- Software Architecture (layered monolith, clean separation of concerns)  
- Testing (unit tests for DAG algorithms, API integration)  
- Documentation (architecture spec, data model docs, known limitations)
