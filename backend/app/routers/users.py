from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import exiger_roles, get_current_user
from app.models import Employe, Role, SoldeConge
from app.schemas import EmployeOut, SoldeOut, SoldeUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me/solde", response_model=list[SoldeOut])
def mon_solde(
    db: Session = Depends(get_db),
    user: Employe = Depends(get_current_user),
):
    soldes = db.query(SoldeConge).filter(SoldeConge.employe_id == user.id).all()
    return [
        SoldeOut(
            type_absence_id=s.type_absence_id,
            annee=s.annee,
            jours_acquis=s.jours_acquis,
            jours_pris=s.jours_pris,
            jours_restants=s.jours_restants,
        )
        for s in soldes
    ]


@router.get("", response_model=list[EmployeOut])
def lister_employes(
    db: Session = Depends(get_db),
    user: Employe = Depends(exiger_roles(Role.RH)),
):
    return db.query(Employe).all()


@router.patch("/{employe_id}/solde", response_model=SoldeOut)
def ajuster_solde(
    employe_id: int,
    data: SoldeUpdate,
    db: Session = Depends(get_db),
    user: Employe = Depends(exiger_roles(Role.RH)),
):
    solde = (
        db.query(SoldeConge)
        .filter(
            SoldeConge.employe_id == employe_id,
            SoldeConge.type_absence_id == data.type_absence_id,
            SoldeConge.annee == data.annee,
        )
        .first()
    )
    if solde is None:
        solde = SoldeConge(
            employe_id=employe_id,
            type_absence_id=data.type_absence_id,
            annee=data.annee,
            jours_acquis=data.jours_acquis,
            jours_pris=0.0,
        )
        db.add(solde)
    else:
        solde.jours_acquis = data.jours_acquis
    db.commit()
    db.refresh(solde)
    return SoldeOut(
        type_absence_id=solde.type_absence_id,
        annee=solde.annee,
        jours_acquis=solde.jours_acquis,
        jours_pris=solde.jours_pris,
        jours_restants=solde.jours_restants,
    )
