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
