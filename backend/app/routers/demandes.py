from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.business.conges import (
    compter_jours_ouvres,
    feries_sur_periode,
    solde_suffisant,
    transition_possible,
)
from app.database import get_db
from app.deps import exiger_roles, get_current_user
from app.models import DemandeConge, Employe, Role, SoldeConge, StatutDemande
from app.schemas import DecisionIn, DemandeCreate, DemandeOut

router = APIRouter(prefix="/api/demandes", tags=["demandes"])


def _get_solde(db: Session, employe_id: int, type_id: int, annee: int) -> SoldeConge | None:
    return (
        db.query(SoldeConge)
        .filter(
            SoldeConge.employe_id == employe_id,
            SoldeConge.type_absence_id == type_id,
            SoldeConge.annee == annee,
        )
        .first()
    )


@router.post("", response_model=DemandeOut, status_code=status.HTTP_201_CREATED)
def creer_demande(
    data: DemandeCreate,
    db: Session = Depends(get_db),
    user: Employe = Depends(get_current_user),
):
    # Regle metier 1 : coherence des dates + calcul des jours ouvres
    # (les week-ends ET les jours feries francais sont exclus du decompte)
    try:
        feries = feries_sur_periode(data.date_debut, data.date_fin)
        nb_jours = compter_jours_ouvres(data.date_debut, data.date_fin, feries)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if nb_jours == 0:
        raise HTTPException(status_code=400, detail="La periode ne contient aucun jour ouvre.")

    # Regle metier 2 : controle du solde
    solde = _get_solde(db, user.id, data.type_absence_id, data.date_debut.year)
    if solde is None:
        raise HTTPException(status_code=400, detail="Aucun solde defini pour ce type d'absence.")
    if not solde_suffisant(solde.jours_restants, nb_jours):
        raise HTTPException(
            status_code=400,
            detail=f"Solde insuffisant : {solde.jours_restants} restant(s), {nb_jours} demande(s).",
        )

    demande = DemandeConge(
        employe_id=user.id,
        type_absence_id=data.type_absence_id,
        date_debut=data.date_debut,
        date_fin=data.date_fin,
        nb_jours_ouvres=nb_jours,
        motif=data.motif,
        statut=StatutDemande.SOUMISE,
    )
    db.add(demande)
    db.commit()
    db.refresh(demande)
    return demande


@router.get("/me", response_model=list[DemandeOut])
def mes_demandes(
    db: Session = Depends(get_db),
    user: Employe = Depends(get_current_user),
):
    return (
        db.query(DemandeConge)
        .filter(DemandeConge.employe_id == user.id)
        .order_by(DemandeConge.created_at.desc())
        .all()
    )


@router.get("", response_model=list[DemandeOut])
def lister_demandes(
    statut: StatutDemande | None = Query(default=None),
    db: Session = Depends(get_db),
    user: Employe = Depends(exiger_roles(Role.MANAGER, Role.RH)),
):
    query = db.query(DemandeConge)
    if user.role == Role.MANAGER:
        # Un manager ne voit que les demandes des membres de son equipe
        ids_equipe = [e.id for e in db.query(Employe).filter(Employe.manager_id == user.id).all()]
        query = query.filter(DemandeConge.employe_id.in_(ids_equipe or [-1]))
    if statut is not None:
        query = query.filter(DemandeConge.statut == statut)
    return query.order_by(DemandeConge.created_at.desc()).all()


def _appliquer_decision(
    db: Session,
    demande_id: int,
    cible: StatutDemande,
    user: Employe,
    commentaire: str | None,
) -> DemandeConge:
    demande = db.get(DemandeConge, demande_id)
    if demande is None:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    # Separation des responsabilites : un manager ne valide/refuse pas ses
    # propres demandes (c'est au RH ou au N+1 de le faire).
    if cible in (StatutDemande.VALIDEE, StatutDemande.REFUSEE) and demande.employe_id == user.id:
        raise HTTPException(
            status_code=403,
            detail="Vous ne pouvez pas valider ou refuser votre propre demande.",
        )

    # Verrou machine a etats (Bloc 3)
    if not transition_possible(demande.statut, cible):
        raise HTTPException(
            status_code=409,
            detail=f"Transition invalide : {demande.statut.value} -> {cible.value}",
        )

    # Mise a jour du solde lors d'une validation
    if cible == StatutDemande.VALIDEE:
        solde = _get_solde(db, demande.employe_id, demande.type_absence_id, demande.date_debut.year)
        if solde and solde_suffisant(solde.jours_restants, demande.nb_jours_ouvres):
            solde.jours_pris += demande.nb_jours_ouvres
        else:
            raise HTTPException(status_code=400, detail="Solde insuffisant au moment de la validation.")

    # Restitution du solde si on annule une demande deja validee
    if cible == StatutDemande.ANNULEE and demande.statut == StatutDemande.VALIDEE:
        solde = _get_solde(db, demande.employe_id, demande.type_absence_id, demande.date_debut.year)
        if solde:
            solde.jours_pris -= demande.nb_jours_ouvres

    demande.statut = cible
    demande.valideur_id = user.id
    if commentaire is not None:
        demande.commentaire_manager = commentaire
    db.commit()
    db.refresh(demande)
    return demande


@router.patch("/{demande_id}/valider", response_model=DemandeOut)
def valider(
    demande_id: int,
    payload: DecisionIn | None = None,
    db: Session = Depends(get_db),
    user: Employe = Depends(exiger_roles(Role.MANAGER, Role.RH)),
):
    commentaire = payload.commentaire if payload else None
    return _appliquer_decision(db, demande_id, StatutDemande.VALIDEE, user, commentaire)


@router.patch("/{demande_id}/refuser", response_model=DemandeOut)
def refuser(
    demande_id: int,
    payload: DecisionIn,
    db: Session = Depends(get_db),
    user: Employe = Depends(exiger_roles(Role.MANAGER, Role.RH)),
):
    return _appliquer_decision(db, demande_id, StatutDemande.REFUSEE, user, payload.commentaire)


@router.patch("/{demande_id}/annuler", response_model=DemandeOut)
def annuler(
    demande_id: int,
    db: Session = Depends(get_db),
    user: Employe = Depends(get_current_user),
):
    demande = db.get(DemandeConge, demande_id)
    if demande is None:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    # Un salarie ne peut annuler que ses propres demandes
    if demande.employe_id != user.id and user.role == Role.SALARIE:
        raise HTTPException(status_code=403, detail="Vous ne pouvez annuler que vos demandes.")
    return _appliquer_decision(db, demande_id, StatutDemande.ANNULEE, user, None)
