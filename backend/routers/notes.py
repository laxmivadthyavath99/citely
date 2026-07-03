from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas
from database import get_db

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/", response_model=schemas.NoteOut)
def add_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    if not crud.get_paper(db, note.paper_id):
        raise HTTPException(status_code=404, detail="Paper not found")
    return crud.create_note(db, note)


@router.get("/paper/{paper_id}", response_model=list[schemas.NoteOut])
def get_notes_for_paper(paper_id: int, db: Session = Depends(get_db)):
    return crud.list_notes_for_paper(db, paper_id)


@router.patch("/{note_id}", response_model=schemas.NoteOut)
def edit_note(note_id: int, updates: schemas.NoteUpdate, db: Session = Depends(get_db)):
    note = crud.update_note(db, note_id, updates)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{note_id}")
def remove_note(note_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_note(db, note_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"deleted": True, "note_id": note_id}
