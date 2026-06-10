from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Employe, Role
from app.schemas import EmployeCreate, EmployeOut, LoginIn, TokenOut
from app.security import creer_token, hacher_mot_de_passe, verifier_mot_de_passe

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=EmployeOut, status_code=status.HTTP_201_CREATED)
def register(data: EmployeCreate, db: Session = Depends(get_db)):
    if db.query(Employe).filter(Employe.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email deja utilise")

    employe = Employe(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        mot_de_passe_hash=hacher_mot_de_passe(data.mot_de_passe),
        role=Role.SALARIE,
    )
    db.add(employe)
    db.commit()
    db.refresh(employe)
    return employe


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    employe = db.query(Employe).filter(Employe.email == data.email).first()
    if not employe or not verifier_mot_de_passe(data.mot_de_passe, employe.mot_de_passe_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = creer_token(sujet=str(employe.id), role=employe.role.value)
    return TokenOut(access_token=token)


@router.get("/me", response_model=EmployeOut)
def me(user: Employe = Depends(get_current_user)):
    return user
