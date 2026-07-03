from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import crud, schemas
from database import get_db

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=list[schemas.SearchResult])
def search(q: str = Query(..., min_length=1, description="Search term"), db: Session = Depends(get_db)):
    """
    Searches paper titles, authors, abstracts, and your note content in one go.
    Returns each match with the field it matched in and a short snippet.
    """
    return crud.search(db, q)
