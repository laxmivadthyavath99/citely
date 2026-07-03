from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/")
def get_graph(db: Session = Depends(get_db)):
    """
    Returns the whole library as a graph: every paper is a node,
    every Link row is a directed edge. Shaped for direct use by a
    force-directed graph renderer on the frontend.
    """
    papers = db.query(models.Paper).all()
    links = db.query(models.Link).all()

    nodes = [
        {"id": p.id, "title": p.title, "year": p.year, "authors": p.authors}
        for p in papers
    ]
    edges = [
        {
            "id": l.id,
            "source": l.from_paper_id,
            "target": l.to_paper_id,
            "relation_type": l.relation_type,
            "description": l.description,
        }
        for l in links
    ]
    return {"nodes": nodes, "edges": edges}
