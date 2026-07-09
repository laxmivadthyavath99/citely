# Citely

**A connected knowledge base for research papers — built for PhD students and researchers who read a lot and forget most of it.**

Citely lets you save papers, write what you actually learned from each one, and explicitly link papers together (builds on, contradicts, same method, related) — then visualizes your whole reading history as an interactive graph.

🔗 **Live app:** [citely-eta-one.vercel.app](https://citely-eta-one.vercel.app)
🔗 **API docs:** [citely-niy0.onrender.com/docs](https://citely-niy0.onrender.com/docs)
🔗 **Repository:** [github.com/laxmivadthyavath99/citely](https://github.com/laxmivadthyavath99/citely)

> **Note:** the backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The first request after a gap can take 30–50 seconds to wake up — this is expected, not a bug.

---

## Why

Existing reference managers (Zotero, Mendeley) are built for **storing citations**, not **retaining knowledge**. PhD students read hundreds of papers over the course of a degree and routinely lose track of which paper said what, how two papers relate, and what they personally concluded after reading something months ago.

Citely combines lightweight reference management with structured personal notes and explicit paper-to-paper relationships, so your own reading history becomes searchable and navigable — not just your citation list.

---

## Features

- **Add papers three ways** — paste an arXiv ID/URL, a DOI, or just a title to search (auto-fetches metadata via the Semantic Scholar API), or enter details manually.
- **Notes per paper** — capture what you actually learned, not just a citation.
- **Typed links between papers** — `builds_on`, `contradicts`, `same_method`, `related`, with an optional note on *why*.
- **Full-text search** — across titles, authors, abstracts, and your own notes in one query.
- **Interactive graph view** — a force-directed visualization of how your papers connect, color-coded by relationship type.
- **Clean, purpose-built UI** — a "research corkboard" visual identity (index-card layout, serif/mono type pairing) rather than a generic CRUD dashboard.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router |
| Backend | FastAPI (Python), SQLAlchemy |
| Database | PostgreSQL (Supabase, free tier) — SQLite for local dev |
| Metadata source | Semantic Scholar Graph API (free, no key required) |
| Hosting | Vercel (frontend) · Render (backend) · Supabase (database) — all free tier |

No paid infrastructure anywhere in this stack.

---

## Architecture

```
frontend/          React + Vite SPA
  src/
    api.js           centralized API client
    App.jsx           routes + nav
    components/
      NavBar.jsx
    pages/
      Library.jsx       add/list/delete papers
      PaperDetail.jsx     notes + links for one paper
      Search.jsx            full-text search
      GraphView.jsx           force-directed graph (plain SVG, no extra deps)

backend/            FastAPI app
  main.py              app entrypoint, CORS, router registration
  database.py            SQLAlchemy engine/session (SQLite or Postgres via DATABASE_URL)
  models.py                 Paper, Note, Link tables
  schemas.py                  Pydantic request/response models
  crud.py                       DB operations
  metadata_fetch.py               Semantic Scholar lookup (arXiv/DOI/title)
  routers/
    papers.py                       /papers — CRUD + /papers/import
    notes.py                          /notes
    links.py                            /links
    search.py                             /search
    graph.py                                /graph — nodes/edges for visualization
```

**Data model:** a `Paper` has many `Note`s and many `Link`s (directed, paper-to-paper). The `/graph` endpoint returns papers as nodes and links as edges, shaped for direct use by the frontend's force-directed layout.

---

## Running locally

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
python init_db.py          # creates tables (SQLite by default)
uvicorn main:app --reload --port 8000
```
Visit `http://localhost:8000/health` to confirm it's running, and `http://localhost:8000/docs` for the interactive API explorer.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`.

By default the frontend talks to `http://localhost:8000`. To point it elsewhere, copy `.env.example` to `.env.local` and set `VITE_API_BASE`.

---

## Environment variables

**Backend** (`backend/.env`, see `.env.example`)
| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection string for production | `sqlite:///./citely.db` |
| `FRONTEND_URL` | Deployed frontend origin, added to CORS allow-list | *(none — only localhost allowed)* |

**Frontend** (`frontend/.env.local`, see `.env.example`)
| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE` | Backend base URL | `http://localhost:8000` |

---

## API overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/papers/` | List all papers |
| `POST` | `/papers/` | Add a paper manually |
| `POST` | `/papers/import` | Add a paper by arXiv ID/URL, DOI, or title search |
| `GET` | `/papers/{id}` | Paper detail, including notes and links |
| `PATCH` | `/papers/{id}` | Update a paper |
| `DELETE` | `/papers/{id}` | Delete a paper (cascades to its notes/links) |
| `POST` | `/notes/` | Add a note to a paper |
| `PATCH` / `DELETE` | `/notes/{id}` | Update / delete a note |
| `POST` | `/links/` | Link two papers with a relation type |
| `GET` | `/links/paper/{id}` | All links touching a paper |
| `DELETE` | `/links/{id}` | Remove a link |
| `GET` | `/search/?q=` | Full-text search across titles, authors, abstracts, notes |
| `GET` | `/graph/` | All papers/links as nodes/edges, for visualization |

Full interactive documentation: [citely-niy0.onrender.com/docs](https://citely-niy0.onrender.com/docs)

---

## Deployment

Deployed entirely on free tiers:
- **Frontend** → Vercel, auto-deploys on push to `main`, root directory `frontend`
- **Backend** → Render, auto-deploys on push to `main`, root directory `backend`, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Database** → Supabase Postgres, connected via the session pooler (IPv4-compatible) for Render compatibility

---

## Roadmap / possible next steps

- [ ] Bulk import (BibTeX / CSV)
- [ ] Tagging / collections beyond paper-to-paper links
- [ ] Export library as BibTeX
- [ ] Embedding-based "related papers" suggestions
- [ ] Alembic migrations for schema changes in production

---

## License

MIT — see [LICENSE](LICENSE) if included, otherwise free to use and adapt.

---

Built by [Laxmi Vadthyavath](https://github.com/laxmivadthyavath99).