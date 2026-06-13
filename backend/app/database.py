from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Normalisation de l'URL : les hebergeurs (ex. Render) fournissent une URL
# au format "postgres://" que SQLAlchemy 2.0 n'accepte plus directement.
database_url = settings.database_url
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg2://", 1)

# connect_args specifique a SQLite (utile pour les tests hors Docker)
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependance FastAPI : ouvre une session et la ferme proprement."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
