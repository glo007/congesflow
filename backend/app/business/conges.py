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


def _dimanche_paques(annee: int) -> date:
    """Calcule la date du dimanche de Paques (algorithme de Butcher / Meeus)."""
    a = annee % 19
    b, c = divmod(annee, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    el = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * el) // 451
    mois, jour = divmod(h + el - 7 * m + 114, 31)
    return date(annee, mois, jour + 1)


def jours_feries_france(annee: int) -> set[date]:
    """Retourne l'ensemble des jours feries francais (metropole) d'une annee.

    Combine les feries fixes et les feries mobiles derives de la date de Paques
    (lundi de Paques, Ascension, lundi de Pentecote).
    """
    paques = _dimanche_paques(annee)
    feries = {
        date(annee, 1, 1),    # Jour de l'an
        date(annee, 5, 1),    # Fete du travail
        date(annee, 5, 8),    # Victoire 1945
        date(annee, 7, 14),   # Fete nationale
        date(annee, 8, 15),   # Assomption
        date(annee, 11, 1),   # Toussaint
        date(annee, 11, 11),  # Armistice 1918
        date(annee, 12, 25),  # Noel
        paques + timedelta(days=1),   # Lundi de Paques
        paques + timedelta(days=39),  # Ascension
        paques + timedelta(days=50),  # Lundi de Pentecote
    }
    return feries


def compter_jours_ouvres(date_debut: date, date_fin: date, feries: set[date] | None = None) -> int:
    """Compte les jours ouvres (lundi-vendredi) entre deux dates incluses.

    Leve ValueError si la date de fin est anterieure a la date de debut.
    Les samedis (5), dimanches (6) et, si `feries` est fourni, les jours feries
    sont exclus du decompte.
    """
    if date_fin < date_debut:
        raise ValueError("La date de fin doit etre posterieure ou egale a la date de debut.")

    feries = feries or set()
    jours = 0
    courant = date_debut
    while courant <= date_fin:
        if courant.weekday() < 5 and courant not in feries:  # 0=lundi ... 4=vendredi
            jours += 1
        courant += timedelta(days=1)
    return jours


def feries_sur_periode(date_debut: date, date_fin: date) -> set[date]:
    """Construit l'ensemble des jours feries couvrant les annees de la periode."""
    feries: set[date] = set()
    for annee in range(date_debut.year, date_fin.year + 1):
        feries |= jours_feries_france(annee)
    return feries


def solde_suffisant(jours_restants: float, jours_demandes: float) -> bool:
    """Verifie que le solde disponible couvre la demande."""
    return jours_demandes <= jours_restants


def transition_possible(actuel: StatutDemande, cible: StatutDemande) -> bool:
    """Indique si le passage de `actuel` vers `cible` respecte la machine a etats."""
    return cible in TRANSITIONS_AUTORISEES.get(actuel, set())
