# CongésFlow — Gestion des demandes de congés

Projet de fin d'études — Titre Professionnel **Concepteur Développeur d'Applications (RNCP niveau 6)**.

Application web de gestion des demandes de congés : un salarié pose une demande,
son manager la valide ou la refuse, les RH pilotent les soldes. L'application couvre
les **3 blocs de compétences** du référentiel CDA.

## Stack technique

| Couche | Technologie |
|---|---|
| Front-end | React + TypeScript + Vite, Tailwind CSS, React Query |
| Back-end | Python + FastAPI, SQLAlchemy |
| Base de données | PostgreSQL (SQLite pour les tests) |
| Sécurité | JWT (python-jose), hachage bcrypt, RBAC |
| Tests | pytest (back), Vitest (front) |
| DevOps | Docker, docker-compose, GitHub Actions |

## Démarrage rapide (Docker)

```bash
docker compose up --build
# API     : http://localhost:8000
# Swagger : http://localhost:8000/docs
```

## Démarrage du backend en local (sans Docker)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt        # SQLite par défaut si DATABASE_URL absent
uvicorn app.main:app --reload
```

## Lancer les tests

```bash
cd backend && source .venv/bin/activate
pytest -q
```

## Comptes de démonstration (mot de passe : `Password123`)

| Email | Rôle |
|---|---|
| rh@congesflow.fr | RH |
| manager@congesflow.fr | Manager |
| salarie@congesflow.fr | Salarié |

## Architecture du dépôt

```
backend/
  app/
    business/conges.py   # logique métier pure (jours ouvrés, machine à états)
    routers/             # endpoints REST (auth, demandes, users)
    models.py            # entités SQLAlchemy
    schemas.py           # validation Pydantic
    security.py          # JWT + bcrypt
    deps.py              # authentification + RBAC
  tests/                 # tests unitaires + intégration
frontend/                # application React (à venir)
docs/                    # diagrammes UML, scripts SQL, dossier projet
```
