-- =====================================================================
--  CongésFlow — Jeu de données de démonstration
--  (les mots de passe réels sont hachés en bcrypt par l'application ;
--   les valeurs ci-dessous sont des exemples illustratifs)
-- =====================================================================

INSERT INTO service (nom) VALUES ('Production');

INSERT INTO type_absence (code, libelle) VALUES
    ('CP',  'Congés payés'),
    ('RTT', 'RTT');

-- role RH, manager, salarié (mot de passe applicatif : Password123)
INSERT INTO employe (nom, prenom, email, mot_de_passe_hash, role, service_id, manager_id) VALUES
    ('Martin',  'Sophie', 'rh@congesflow.fr',      '<hash_bcrypt>', 'RH',      1, NULL),
    ('Durand',  'Paul',   'manager@congesflow.fr', '<hash_bcrypt>', 'MANAGER', 1, NULL),
    ('Bernard', 'Léa',    'salarie@congesflow.fr', '<hash_bcrypt>', 'SALARIE', 1, 2);

-- soldes 2026 : 25 CP + 10 RTT pour chaque employé
INSERT INTO solde_conge (employe_id, type_absence_id, annee, jours_acquis, jours_pris) VALUES
    (1, 1, 2026, 25, 0), (1, 2, 2026, 10, 0),
    (2, 1, 2026, 25, 0), (2, 2, 2026, 10, 0),
    (3, 1, 2026, 25, 0), (3, 2, 2026, 10, 0);

-- exemple de demande validée
INSERT INTO demande_conge
    (employe_id, type_absence_id, date_debut, date_fin, nb_jours_ouvres, motif, statut, valideur_id)
VALUES
    (3, 1, '2026-06-15', '2026-06-17', 3, 'Vacances', 'VALIDEE', 2);
