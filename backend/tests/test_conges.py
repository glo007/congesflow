"""Tests unitaires de la logique metier (jours ouvres, solde, machine a etats)."""
from datetime import date

import pytest

from app.business.conges import (
    compter_jours_ouvres,
    feries_sur_periode,
    jours_feries_france,
    solde_suffisant,
    transition_possible,
)
from app.models import StatutDemande


class TestJoursOuvres:
    def test_une_semaine_complete_vaut_cinq_jours(self):
        # lundi 2 juin -> vendredi 6 juin 2025
        assert compter_jours_ouvres(date(2025, 6, 2), date(2025, 6, 6)) == 5

    def test_le_week_end_est_exclu(self):
        # samedi + dimanche
        assert compter_jours_ouvres(date(2025, 6, 7), date(2025, 6, 8)) == 0

    def test_meme_jour_ouvre_vaut_un(self):
        assert compter_jours_ouvres(date(2025, 6, 2), date(2025, 6, 2)) == 1

    def test_periode_a_cheval_sur_un_week_end(self):
        # vendredi -> lundi : vendredi + lundi = 2 jours ouvres
        assert compter_jours_ouvres(date(2025, 6, 6), date(2025, 6, 9)) == 2

    def test_date_fin_avant_debut_leve_erreur(self):
        with pytest.raises(ValueError):
            compter_jours_ouvres(date(2025, 6, 10), date(2025, 6, 2))


class TestJoursFeries:
    def test_feries_fixes_presents(self):
        feries = jours_feries_france(2025)
        assert date(2025, 1, 1) in feries    # Jour de l'an
        assert date(2025, 5, 1) in feries     # Fete du travail
        assert date(2025, 7, 14) in feries    # Fete nationale
        assert date(2025, 12, 25) in feries   # Noel

    def test_feries_mobiles_paques_2025(self):
        # Paques 2025 = 20 avril -> lundi de Paques = 21 avril
        feries = jours_feries_france(2025)
        assert date(2025, 4, 21) in feries    # Lundi de Paques
        assert date(2025, 5, 29) in feries    # Ascension
        assert date(2025, 6, 9) in feries     # Lundi de Pentecote

    def test_feries_exclus_du_decompte(self):
        # jeudi 1er mai 2025 (ferie) sur la semaine du 28 avril au 2 mai
        feries = jours_feries_france(2025)
        # lun 28, mar 29, mer 30, jeu 1er (ferie), ven 2 -> 4 jours ouvres
        assert compter_jours_ouvres(date(2025, 4, 28), date(2025, 5, 2), feries) == 4

    def test_feries_sur_periode_couvre_les_annees(self):
        feries = feries_sur_periode(date(2024, 12, 30), date(2025, 1, 2))
        assert date(2025, 1, 1) in feries
        assert date(2024, 12, 25) in feries


class TestSolde:
    def test_solde_suffisant(self):
        assert solde_suffisant(jours_restants=10, jours_demandes=5) is True

    def test_solde_exactement_egal(self):
        assert solde_suffisant(jours_restants=5, jours_demandes=5) is True

    def test_solde_insuffisant(self):
        assert solde_suffisant(jours_restants=3, jours_demandes=5) is False


class TestMachineAEtats:
    def test_soumise_peut_etre_validee(self):
        assert transition_possible(StatutDemande.SOUMISE, StatutDemande.VALIDEE)

    def test_soumise_peut_etre_refusee(self):
        assert transition_possible(StatutDemande.SOUMISE, StatutDemande.REFUSEE)

    def test_validee_peut_etre_annulee(self):
        assert transition_possible(StatutDemande.VALIDEE, StatutDemande.ANNULEE)

    def test_refusee_est_un_etat_final(self):
        assert not transition_possible(StatutDemande.REFUSEE, StatutDemande.VALIDEE)

    def test_validee_ne_peut_pas_etre_refusee(self):
        assert not transition_possible(StatutDemande.VALIDEE, StatutDemande.REFUSEE)
