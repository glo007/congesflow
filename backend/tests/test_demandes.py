"""Tests d'integration du parcours principal (API + base de donnees)."""
from datetime import date, timedelta

from tests.conftest import auth_header, login


def _prochain_lundi() -> date:
    d = date.today()
    while d.weekday() != 0:
        d += timedelta(days=1)
    return d


def test_login_invalide_renvoie_401(client):
    resp = client.post("/api/auth/login", json={"email": "x@y.fr", "mot_de_passe": "bad"})
    assert resp.status_code == 401


def test_salarie_cree_une_demande(client):
    token = login(client, "salarie@congesflow.fr")
    lundi = _prochain_lundi()
    resp = client.post(
        "/api/demandes",
        headers=auth_header(token),
        json={
            "type_absence_id": 1,
            "date_debut": lundi.isoformat(),
            "date_fin": (lundi + timedelta(days=2)).isoformat(),  # lun-mar-mer = 3 jours
            "motif": "Vacances",
        },
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["nb_jours_ouvres"] == 3
    assert resp.json()["statut"] == "SOUMISE"


def test_demande_refusee_si_solde_insuffisant(client):
    token = login(client, "salarie@congesflow.fr")
    lundi = _prochain_lundi()
    resp = client.post(
        "/api/demandes",
        headers=auth_header(token),
        json={
            "type_absence_id": 1,
            "date_debut": lundi.isoformat(),
            "date_fin": (lundi + timedelta(days=60)).isoformat(),  # > 25 jours ouvres
        },
    )
    assert resp.status_code == 400
    assert "insuffisant" in resp.json()["detail"].lower()


def test_salarie_ne_peut_pas_lister_toutes_les_demandes(client):
    token = login(client, "salarie@congesflow.fr")
    resp = client.get("/api/demandes", headers=auth_header(token))
    assert resp.status_code == 403  # RBAC : reserve manager/RH


def test_manager_valide_et_decremente_le_solde(client):
    # Le salarie pose une demande
    tok_sal = login(client, "salarie@congesflow.fr")
    lundi = _prochain_lundi()
    creation = client.post(
        "/api/demandes",
        headers=auth_header(tok_sal),
        json={
            "type_absence_id": 1,
            "date_debut": lundi.isoformat(),
            "date_fin": (lundi + timedelta(days=2)).isoformat(),  # 3 jours
        },
    )
    demande_id = creation.json()["id"]

    # Le manager valide
    tok_mgr = login(client, "manager@congesflow.fr")
    valid = client.patch(f"/api/demandes/{demande_id}/valider", headers=auth_header(tok_mgr))
    assert valid.status_code == 200
    assert valid.json()["statut"] == "VALIDEE"

    # Le solde du salarie a bien ete decremente de 3 jours
    solde = client.get("/api/users/me/solde", headers=auth_header(tok_sal)).json()
    cp = next(s for s in solde if s["type_absence_id"] == 1)
    assert cp["jours_pris"] == 3


def test_stats_reservees_au_manager_et_rh(client):
    tok_sal = login(client, "salarie@congesflow.fr")
    assert client.get("/api/stats", headers=auth_header(tok_sal)).status_code == 403

    tok_mgr = login(client, "manager@congesflow.fr")
    resp = client.get("/api/stats", headers=auth_header(tok_mgr))
    assert resp.status_code == 200
    data = resp.json()
    assert "en_attente" in data and "total" in data and "effectif" in data


def test_transition_invalide_renvoie_409(client):
    tok_sal = login(client, "salarie@congesflow.fr")
    lundi = _prochain_lundi()
    creation = client.post(
        "/api/demandes",
        headers=auth_header(tok_sal),
        json={
            "type_absence_id": 1,
            "date_debut": lundi.isoformat(),
            "date_fin": (lundi + timedelta(days=2)).isoformat(),
        },
    )
    demande_id = creation.json()["id"]

    tok_mgr = login(client, "manager@congesflow.fr")
    # On refuse...
    client.patch(
        f"/api/demandes/{demande_id}/refuser",
        headers=auth_header(tok_mgr),
        json={"commentaire": "Periode chargee"},
    )
    # ... puis on tente de valider une demande deja refusee -> transition interdite
    resp = client.patch(f"/api/demandes/{demande_id}/valider", headers=auth_header(tok_mgr))
    assert resp.status_code == 409
