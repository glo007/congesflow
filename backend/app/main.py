from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, demandes, stats, users
from app.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cree les tables au demarrage (MVP). En production : migrations Alembic.
    Base.metadata.create_all(bind=engine)
    seed_data()
    yield


app = FastAPI(
    title="CongesFlow API",
    description="API de gestion des demandes de conges (Titre CDA - Bloc 2).",
    version="1.0.0",
    lifespan=lifespan,
)

# Securite : CORS restreint au front local (a durcir en prod)
app.add_middleware(
    CORSMiddleware,
    # Autorise le front local (localhost / 127.0.0.1) et tout sous-domaine Render
    # (deploiement). En production, on peut restreindre a l'origine exacte.
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+|https://[a-z0-9-]+\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(demandes.router)
app.include_router(users.router)
app.include_router(stats.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
