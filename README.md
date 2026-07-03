# Citely

A connected knowledge base for research papers — built for PhD students who read a lot and forget most of it.

## Phase 1 — Project skeleton (current)

This phase sets up a working backend + frontend that can talk to each other. No database or real features yet — just the scaffold.

### Run the backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Visit http://localhost:8000/health — should return `{"status": "ok", "service": "citely-api"}`.
Interactive API docs: http://localhost:8000/docs

### Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173 — should show "Backend status: connected" if the backend is running.

## Roadmap
- **Phase 1** — skeleton (this phase)
- **Phase 2** — data model: Paper, Note, Link tables + DB setup
- **Phase 3** — core CRUD: add/edit/delete papers, attach notes
- **Phase 4** — metadata auto-fetch (Semantic Scholar / CrossRef APIs)
- **Phase 5** — full-text search across notes + titles
- **Phase 6** — graph view of paper-to-paper links
- **Phase 7** — deploy (Vercel + Render/Supabase, all free tier)

## Stack
- Backend: FastAPI + SQLAlchemy
- Frontend: React + Vite
- DB: SQLite locally → Supabase (Postgres) free tier when deployed
