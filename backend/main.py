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
from routers import papers, notes, links

app = FastAPI(title="Citely API", version="0.4.0")

# Auto-create tables on startup — fine for SQLite/dev.
# In Phase 7 (deploy) we'll switch to Alembic migrations for Postgres.
Base.metadata.create_all(bind=engine)

app.include_router(papers.router)
app.include_router(notes.router)
app.include_router(links.router)

# Allow the Vite dev server (and later, the deployed frontend) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "citely-api"}


@app.get("/")
def root():
    return {"message": "Citely API is running. See /docs for the interactive API explorer."}


@app.get("/debug/tables")
def list_tables():
    """Quick sanity check that the data model (Phase 2) is wired up correctly."""
    return {"tables": list(Base.metadata.tables.keys())}
