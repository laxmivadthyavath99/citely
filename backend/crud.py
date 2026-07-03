from sqlalchemy import func
from sqlalchemy.orm import Session
import models, schemas


# --- Papers ---
def create_paper(db: Session, paper: schemas.PaperCreate):
    db_paper = models.Paper(**paper.model_dump())
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    return db_paper


def list_papers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Paper).order_by(models.Paper.added_at.desc()).offset(skip).limit(limit).all()


def get_paper(db: Session, paper_id: int):
    return db.query(models.Paper).filter(models.Paper.id == paper_id).first()


def update_paper(db: Session, paper_id: int, updates: schemas.PaperUpdate):
    db_paper = get_paper(db, paper_id)
    if not db_paper:
        return None
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_paper, field, value)
    db.commit()
    db.refresh(db_paper)
    return db_paper


def delete_paper(db: Session, paper_id: int):
    db_paper = get_paper(db, paper_id)
    if not db_paper:
        return False
    db.delete(db_paper)  # cascades to notes; links_from cascade too (see models.py)
    db.commit()
    return True


# --- Notes ---
def create_note(db: Session, note: schemas.NoteCreate):
    db_note = models.Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def list_notes_for_paper(db: Session, paper_id: int):
    return db.query(models.Note).filter(models.Note.paper_id == paper_id).order_by(models.Note.created_at.desc()).all()


def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()


def update_note(db: Session, note_id: int, updates: schemas.NoteUpdate):
    db_note = get_note(db, note_id)
    if not db_note:
        return None
    db_note.content = updates.content
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int):
    db_note = get_note(db, note_id)
    if not db_note:
        return False
    db.delete(db_note)
    db.commit()
    return True


# --- Search ---
def _snippet(text: str, query: str, radius: int = 60) -> str:
    """Returns a short excerpt of `text` centered on the first match of `query`."""
    lower_text = text.lower()
    idx = lower_text.find(query.lower())
    if idx == -1:
        return text[: radius * 2].strip()
    start = max(0, idx - radius)
    end = min(len(text), idx + len(query) + radius)
    prefix = "…" if start > 0 else ""
    suffix = "…" if end < len(text) else ""
    return f"{prefix}{text[start:end].strip()}{suffix}"


def search(db: Session, query: str, limit: int = 50):
    """
    Simple, portable substring search (case-insensitive) across paper
    title/authors/abstract and note content. Works identically on SQLite
    and Postgres — no engine-specific full-text index required.
    """
    like_query = f"%{query.lower()}%"
    results = []

    matched_papers = (
        db.query(models.Paper)
        .filter(
            func.lower(models.Paper.title).like(like_query)
            | func.lower(models.Paper.authors).like(like_query)
            | func.lower(models.Paper.abstract).like(like_query)
        )
        .limit(limit)
        .all()
    )
    for paper in matched_papers:
        if query.lower() in paper.title.lower():
            field, text = "title", paper.title
        elif query.lower() in (paper.authors or "").lower():
            field, text = "authors", paper.authors
        else:
            field, text = "abstract", paper.abstract
        results.append(
            {"paper_id": paper.id, "title": paper.title, "matched_field": field, "snippet": _snippet(text, query)}
        )

    matched_notes = (
        db.query(models.Note)
        .filter(func.lower(models.Note.content).like(like_query))
        .limit(limit)
        .all()
    )
    for note in matched_notes:
        results.append(
            {
                "paper_id": note.paper_id,
                "title": note.paper.title,
                "matched_field": "note",
                "snippet": _snippet(note.content, query),
            }
        )

    return results[:limit]


# --- Links ---
def create_link(db: Session, link: schemas.LinkCreate):
    db_link = models.Link(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def list_links_for_paper(db: Session, paper_id: int):
    """All links touching this paper, in either direction."""
    return (
        db.query(models.Link)
        .filter((models.Link.from_paper_id == paper_id) | (models.Link.to_paper_id == paper_id))
        .all()
    )


def delete_link(db: Session, link_id: int):
    db_link = db.query(models.Link).filter(models.Link.id == link_id).first()
    if not db_link:
        return False
    db.delete(db_link)
    db.commit()
    return True
