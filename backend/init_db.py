"""
Creates all tables defined in models.py.

Run once (and again any time you add a new model):
    python init_db.py
"""
from database import engine, Base
import models  # noqa: F401  (import registers the models with Base.metadata)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tables created:", list(Base.metadata.tables.keys()))
