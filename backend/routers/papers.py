from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas
from database import get_db

router = APIRouter(prefix="/papers", tags=["papers"])


@router.post("/", response_model=schemas.PaperOut)
def add_paper(paper: schemas.PaperCreate, db: Session = Depends(get_db)):
    return crud.create_paper(db, paper)


@router.get("/", response_model=list[schemas.PaperOut])
def get_papers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_papers(db, skip, limit)


@router.get("/{paper_id}", response_model=schemas.PaperDetailOut)
def get_paper_detail(paper_id: int, db: Session = Depends(get_db)):
    paper = crud.get_paper(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.patch("/{paper_id}", response_model=schemas.PaperOut)
def edit_paper(paper_id: int, updates: schemas.PaperUpdate, db: Session = Depends(get_db)):
    paper = crud.update_paper(db, paper_id, updates)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.delete("/{paper_id}")
def remove_paper(paper_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_paper(db, paper_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Paper not found")
    return {"deleted": True, "paper_id": paper_id}
