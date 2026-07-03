import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class Paper(Base):
    """A single paper in the library."""
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(String, default="")          # comma-separated for simplicity in Phase 2
    abstract = Column(Text, default="")
    source = Column(String, default="manual")      # "manual" | "arxiv" | "doi" | "semantic_scholar"
    external_id = Column(String, nullable=True)     # arXiv ID or DOI, used for metadata auto-fetch later
    url = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

    notes = relationship("Note", back_populates="paper", cascade="all, delete-orphan")

    # links where this paper is the source
    links_from = relationship(
        "Link", foreign_keys="Link.from_paper_id", back_populates="from_paper", cascade="all, delete-orphan"
    )
    # links where this paper is the target
    links_to = relationship(
        "Link", foreign_keys="Link.to_paper_id", back_populates="to_paper"
    )


class Note(Base):
    """A personal note attached to a paper — 'what did I actually learn'."""
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    paper = relationship("Paper", back_populates="notes")


class Link(Base):
    """A directed relationship between two papers, e.g. 'builds_on', 'contradicts'."""
    __tablename__ = "links"
    __table_args__ = (
        UniqueConstraint("from_paper_id", "to_paper_id", "relation_type", name="uq_link_triplet"),
    )

    id = Column(Integer, primary_key=True, index=True)
    from_paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    to_paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    relation_type = Column(String, nullable=False)   # "builds_on" | "contradicts" | "same_method" | "related"
    description = Column(Text, default="")            # optional free-text on why they're linked
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    from_paper = relationship("Paper", foreign_keys=[from_paper_id], back_populates="links_from")
    to_paper = relationship("Paper", foreign_keys=[to_paper_id], back_populates="links_to")
