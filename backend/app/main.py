from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, demandes, users
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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(demandes.router)
app.include_router(users.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
