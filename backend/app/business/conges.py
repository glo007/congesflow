"""Logique metier pure de CongesFlow.

Ces fonctions ne dependent ni de la base de donnees ni du framework :
elles sont donc faciles a tester unitairement (cf. tests/test_conges.py)
et constituent le coeur defendable du projet devant le jury (Bloc 3).
"""
from datetime import date, timedelta

from app.models import StatutDemande

# Transitions autorisees de la machine a etats de la demande de conge.
# Cle = etat courant, valeur = ensemble des etats cibles atteignables.
TRANSITIONS_AUTORISEES: dict[StatutDemande, set[StatutDemande]] = {
    StatutDemande.SOUMISE: {
        StatutDemande.VALIDEE,
        StatutDemande.REFUSEE,
        StatutDemande.ANNULEE,
    },
    StatutDemande.VALIDEE: {StatutDemande.ANNULEE},
    StatutDemande.REFUSEE: set(),
    StatutDemande.ANNULEE: set(),
}


def compter_jours_ouvres(date_debut: date, date_fin: date) -> int:
    """Compte les jours ouvres (lundi-vendredi) entre deux dates incluses.

    Leve ValueError si la date de fin est anterieure a la date de debut.
    Les samedis (5) et dimanches (6) sont exclus.
    """
    if date_fin < date_debut:
        raise ValueError("La date de fin doit etre posterieure ou egale a la date de debut.")

    jours = 0
    courant = date_debut
    while courant <= date_fin:
        if courant.weekday() < 5:  # 0=lundi ... 4=vendredi
            jours += 1
        courant += timedelta(days=1)
    return jours


def solde_suffisant(jours_restants: float, jours_demandes: float) -> bool:
    """Verifie que le solde disponible couvre la demande."""
    return jours_demandes <= jours_restants


def transition_possible(actuel: StatutDemande, cible: StatutDemande) -> bool:
    """Indique si le passage de `actuel` vers `cible` respecte la machine a etats."""
    return cible in TRANSITIONS_AUTORISEES.get(actuel, set())
