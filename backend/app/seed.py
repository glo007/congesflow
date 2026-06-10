"""Jeu de donnees initial pour la demo et la soutenance.

Cree (si absents) : 2 types d'absence, 1 service, 1 RH, 1 manager,
1 salarie rattache au manager, et leurs soldes de conges payes.

Comptes de demonstration (mot de passe identique : Password123) :
  - rh@congesflow.fr       (role RH)
  - manager@congesflow.fr  (role MANAGER)
  - salarie@congesflow.fr  (role SALARIE, manager = manager@congesflow.fr)
"""
from datetime import date

from app.database import SessionLocal
from app.models import Employe, Role, Service, SoldeConge, TypeAbsence
from app.security import hacher_mot_de_passe

MDP_DEMO = "Password123"
ANNEE = date.today().year


def seed_data() -> None:
    db = SessionLocal()
    try:
        if db.query(Employe).first():
            return  # deja initialise

        cp = TypeAbsence(code="CP", libelle="Conges payes")
        rtt = TypeAbsence(code="RTT", libelle="RTT")
        service = Service(nom="Production")
        db.add_all([cp, rtt, service])
        db.flush()

        rh = Employe(
            nom="Martin", prenom="Sophie", email="rh@congesflow.fr",
            mot_de_passe_hash=hacher_mot_de_passe(MDP_DEMO), role=Role.RH,
            service_id=service.id,
        )
        manager = Employe(
            nom="Durand", prenom="Paul", email="manager@congesflow.fr",
            mot_de_passe_hash=hacher_mot_de_passe(MDP_DEMO), role=Role.MANAGER,
            service_id=service.id,
        )
        db.add_all([rh, manager])
        db.flush()

        salarie = Employe(
            nom="Bernard", prenom="Lea", email="salarie@congesflow.fr",
            mot_de_passe_hash=hacher_mot_de_passe(MDP_DEMO), role=Role.SALARIE,
            service_id=service.id, manager_id=manager.id,
        )
        db.add(salarie)
        db.flush()

        for emp in (rh, manager, salarie):
            db.add(SoldeConge(employe_id=emp.id, type_absence_id=cp.id,
                              annee=ANNEE, jours_acquis=25.0, jours_pris=0.0))
            db.add(SoldeConge(employe_id=emp.id, type_absence_id=rtt.id,
                              annee=ANNEE, jours_acquis=10.0, jours_pris=0.0))

        db.commit()
    finally:
        db.close()
