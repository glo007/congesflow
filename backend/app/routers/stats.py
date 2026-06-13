"""Endpoint de tableau de bord : indicateurs agreges pour managers et RH."""
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import exiger_roles
from app.models import DemandeConge, Employe, Role, StatutDemande

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
def tableau_de_bord(
    db: Session = Depends(get_db),
    user: Employe = Depends(exiger_roles(Role.MANAGER, Role.RH)),
):
    """Retourne les indicateurs cles selon le perimetre de l'utilisateur.

    Un manager ne voit que son equipe ; un RH voit l'ensemble de l'organisation.
    """
    query = db.query(DemandeConge)
    if user.role == Role.MANAGER:
        ids_equipe = [e.id for e in db.query(Employe).filter(Employe.manager_id == user.id).all()]
        query = query.filter(DemandeConge.employe_id.in_(ids_equipe or [-1]))

    # Comptage par statut
    par_statut = dict(
        query.with_entities(DemandeConge.statut, func.count())
        .group_by(DemandeConge.statut)
        .all()
    )
    compte = {s.value: int(par_statut.get(s, 0)) for s in StatutDemande}

    # Jours valides sur le mois courant
    debut_mois = date.today().replace(day=1)
    jours_mois = (
        query.filter(
            DemandeConge.statut == StatutDemande.VALIDEE,
            DemandeConge.date_debut >= debut_mois,
        )
        .with_entities(func.coalesce(func.sum(DemandeConge.nb_jours_ouvres), 0))
        .scalar()
    )

    # Effectif suivi
    if user.role == Role.MANAGER:
        effectif = db.query(Employe).filter(Employe.manager_id == user.id).count()
    else:
        effectif = db.query(Employe).count()

    return {
        "en_attente": compte[StatutDemande.SOUMISE.value],
        "validees": compte[StatutDemande.VALIDEE.value],
        "refusees": compte[StatutDemande.REFUSEE.value],
        "annulees": compte[StatutDemande.ANNULEE.value],
        "total": sum(compte.values()),
        "jours_valides_mois": float(jours_mois or 0),
        "effectif": effectif,
    }
