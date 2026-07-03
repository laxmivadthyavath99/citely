from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas
from database import get_db

router = APIRouter(prefix="/links", tags=["links"])

VALID_RELATIONS = {"builds_on", "contradicts", "same_method", "related"}


@router.post("/", response_model=schemas.LinkOut)
def add_link(link: schemas.LinkCreate, db: Session = Depends(get_db)):
    if link.relation_type not in VALID_RELATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"relation_type must be one of {sorted(VALID_RELATIONS)}",
        )
    if link.from_paper_id == link.to_paper_id:
        raise HTTPException(status_code=400, detail="A paper cannot link to itself")
    if not crud.get_paper(db, link.from_paper_id) or not crud.get_paper(db, link.to_paper_id):
        raise HTTPException(status_code=404, detail="One or both papers not found")
    return crud.create_link(db, link)


@router.get("/paper/{paper_id}", response_model=list[schemas.LinkOut])
def get_links_for_paper(paper_id: int, db: Session = Depends(get_db)):
    return crud.list_links_for_paper(db, paper_id)


@router.delete("/{link_id}")
def remove_link(link_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_link(db, link_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"deleted": True, "link_id": link_id}
