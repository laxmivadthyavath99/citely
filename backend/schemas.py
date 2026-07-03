from pydantic import BaseModel
from typing import Optional
import datetime


# --- Paper ---
class PaperCreate(BaseModel):
    title: str
    authors: str = ""
    abstract: str = ""
    source: str = "manual"
    external_id: Optional[str] = None
    url: Optional[str] = None
    year: Optional[int] = None


class PaperOut(PaperCreate):
    id: int
    added_at: datetime.datetime

    class Config:
        from_attributes = True


class PaperUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    abstract: Optional[str] = None
    url: Optional[str] = None
    year: Optional[int] = None


# --- Note ---
class NoteCreate(BaseModel):
    paper_id: int
    content: str


class NoteOut(BaseModel):
    id: int
    paper_id: int
    content: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class NoteUpdate(BaseModel):
    content: str


# --- Link ---
class LinkCreate(BaseModel):
    from_paper_id: int
    to_paper_id: int
    relation_type: str   # "builds_on" | "contradicts" | "same_method" | "related"
    description: str = ""


class LinkOut(LinkCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Composite: paper with its notes and links, for the paper detail view ---
class PaperDetailOut(PaperOut):
    notes: list[NoteOut] = []
    links_from: list[LinkOut] = []
    links_to: list[LinkOut] = []
