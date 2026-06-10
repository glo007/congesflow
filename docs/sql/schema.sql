-- =====================================================================
--  CongésFlow — Modèle Physique de Données (PostgreSQL)
--  Annexe du dossier projet — Titre CDA (RNCP niveau 6)
-- =====================================================================

DROP TABLE IF EXISTS demande_conge CASCADE;
DROP TABLE IF EXISTS solde_conge CASCADE;
DROP TABLE IF EXISTS employe CASCADE;
DROP TABLE IF EXISTS type_absence CASCADE;
DROP TABLE IF EXISTS service CASCADE;

-- ---------------------------------------------------------------------
-- Table : service
-- ---------------------------------------------------------------------
CREATE TABLE service (
    id   SERIAL PRIMARY KEY,
    nom  VARCHAR(120) NOT NULL
);

-- ---------------------------------------------------------------------
-- Table : type_absence (CP, RTT, ...)
-- ---------------------------------------------------------------------
CREATE TABLE type_absence (
    id       SERIAL PRIMARY KEY,
    code     VARCHAR(20)  NOT NULL UNIQUE,
    libelle  VARCHAR(120) NOT NULL
);

-- ---------------------------------------------------------------------
-- Table : employe
--   role : SALARIE | MANAGER | RH
--   manager_id : auto-référence (le manager est aussi un employé)
-- ---------------------------------------------------------------------
CREATE TABLE employe (
    id                 SERIAL PRIMARY KEY,
    nom                VARCHAR(120) NOT NULL,
    prenom             VARCHAR(120) NOT NULL,
    email              VARCHAR(180) NOT NULL UNIQUE,
    mot_de_passe_hash  VARCHAR(255) NOT NULL,
    role               VARCHAR(20)  NOT NULL DEFAULT 'SALARIE'
                       CHECK (role IN ('SALARIE', 'MANAGER', 'RH')),
    date_embauche      DATE         NOT NULL DEFAULT CURRENT_DATE,
    service_id         INTEGER      REFERENCES service(id),
    manager_id         INTEGER      REFERENCES employe(id)
);

CREATE INDEX idx_employe_email   ON employe(email);
CREATE INDEX idx_employe_manager ON employe(manager_id);

-- ---------------------------------------------------------------------
-- Table : solde_conge (un solde par employé, par type, par année)
-- ---------------------------------------------------------------------
CREATE TABLE solde_conge (
    id               SERIAL PRIMARY KEY,
    employe_id       INTEGER NOT NULL REFERENCES employe(id) ON DELETE CASCADE,
    type_absence_id  INTEGER NOT NULL REFERENCES type_absence(id),
    annee            INTEGER NOT NULL,
    jours_acquis     NUMERIC(5,1) NOT NULL DEFAULT 25.0 CHECK (jours_acquis >= 0),
    jours_pris       NUMERIC(5,1) NOT NULL DEFAULT 0.0  CHECK (jours_pris >= 0),
    CONSTRAINT uq_solde UNIQUE (employe_id, type_absence_id, annee)
);

-- ---------------------------------------------------------------------
-- Table : demande_conge
--   statut : SOUMISE | VALIDEE | REFUSEE | ANNULEE (machine à états)
-- ---------------------------------------------------------------------
CREATE TABLE demande_conge (
    id                   SERIAL PRIMARY KEY,
    employe_id           INTEGER NOT NULL REFERENCES employe(id) ON DELETE CASCADE,
    type_absence_id      INTEGER NOT NULL REFERENCES type_absence(id),
    date_debut           DATE    NOT NULL,
    date_fin             DATE    NOT NULL,
    nb_jours_ouvres      NUMERIC(5,1) NOT NULL CHECK (nb_jours_ouvres > 0),
    motif                TEXT,
    statut               VARCHAR(20) NOT NULL DEFAULT 'SOUMISE'
                         CHECK (statut IN ('SOUMISE','VALIDEE','REFUSEE','ANNULEE')),
    commentaire_manager  TEXT,
    valideur_id          INTEGER REFERENCES employe(id),
    created_at           TIMESTAMP NOT NULL DEFAULT now(),
    updated_at           TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_dates CHECK (date_fin >= date_debut)
);

CREATE INDEX idx_demande_employe ON demande_conge(employe_id);
CREATE INDEX idx_demande_statut  ON demande_conge(statut);
