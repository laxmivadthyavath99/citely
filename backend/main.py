"""
Citely backend entrypoint.

Run locally:
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Then visit http://localhost:8000/health
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # noqa: F401  (registers models with Base.metadata)
from routers import papers, notes, links, search, graph
import os

app = FastAPI(title="Citely API", version="0.8.0")

# Auto-create tables on startup — fine for SQLite/dev.
# In production this also runs once against Postgres, which is fine for
# a project this size; a larger app would switch to Alembic migrations.
Base.metadata.create_all(bind=engine)

# Local dev origins are always allowed. Add your deployed frontend URL
# via the FRONTEND_URL env var (set it in Render's dashboard).
allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(papers.router)
app.include_router(notes.router)
app.include_router(links.router)
app.include_router(search.router)
app.include_router(graph.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "citely-api"}


@app.get("/")
def root():
    return {"message": "Citely API is running. See /docs for the interactive API explorer."}


@app.get("/debug/tables")
def list_tables():
    """Quick sanity check that the data model is wired up correctly."""
    return {"tables": list(Base.metadata.tables.keys())}