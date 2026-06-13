"""Configuration des tests d'integration : base SQLite jetable + client HTTP."""
import os

# Force une base de test isolee AVANT tout import de l'application.
os.environ["DATABASE_URL"] = "sqlite:///./test_congesflow.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed_data  # noqa: E402


@pytest.fixture(autouse=True)
def reset_db():
    """Recree un schema vierge et reinjecte les comptes de demonstration
    avant chaque test. `engine.dispose()` ferme les connexions residuelles
    du test precedent pour garantir une isolation totale."""
    engine.dispose()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_data()
    yield
    engine.dispose()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def login(client, email: str, mot_de_passe: str = "Password123") -> str:
    resp = client.post("/api/auth/login", json={"email": email, "mot_de_passe": mot_de_passe})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
