# Dossier Projet — CongésFlow

> Trame du mémoire pré-remplie, suivant le *Plan de rendus (ESTIAM)* et le *Rendu Final CDA 25/26*.
> Les passages `[À COMPLÉTER]` sont à personnaliser avec ton vécu (difficultés, captures, dates).
> Une fois rédigé, exporte en Word/PDF. Les diagrammes sont dans `docs/diagrammes/`, le SQL dans `docs/sql/`.

---

## 1. Page de couverture

- **École** : ESTIAM
- **Titre du projet** : CongésFlow — Application web de gestion des demandes de congés
- **Nom et prénom** : `[Ton nom]`
- **Classe et spécialité** : Concepteur Développeur d'Applications (RNCP niveau 6)
- **Encadrant** : M'hand BOUFALA
- **Année scolaire** : 2025-2026

---

## 2. Résumé / Abstract

**Contexte.** La gestion des congés reste, dans beaucoup de PME, un processus manuel (e-mails, tableurs) source d'erreurs, de pertes de temps et de litiges sur les soldes. CongésFlow est une application web qui digitalise ce processus de bout en bout.

**Objectifs.** Permettre à un salarié de poser une demande de congé, à son manager de la valider ou la refuser, et au service RH de piloter les soldes — le tout dans une application sécurisée, testée et conteneurisée.

**Résultats attendus.** Une application full-stack fonctionnelle (React + FastAPI + PostgreSQL), couvrant les trois blocs de compétences du titre CDA : front-end sécurisé, back-end avec API REST et RBAC, et démarche de conception/gestion de projet outillée (UML, tests, CI/CD, Docker).

*(Abstract anglais — facultatif :)* `[À COMPLÉTER : traduction du résumé]`

---

## 3. Sommaire

`[À générer automatiquement à l'export Word/PDF à partir des titres]`

---

## 4. Liste des figures

| Réf. | Figure |
|------|--------|
| Fig.1 | Diagramme de contexte |
| Fig.2 | Diagramme de cas d'utilisation |
| Fig.3 | Diagramme d'activité — créer une demande |
| Fig.4 | Diagramme de séquence — créer une demande |
| Fig.5 | Diagramme d'état-transition — demande |
| Fig.6 | Diagramme de classes |
| Fig.7 | Modèle conceptuel de données (MCD) |
| Fig.8 | Diagramme d'objets |
| Fig.9 | Diagramme de composants |
| Fig.10 | Diagramme de déploiement |
| Fig.11 | Capture — écran de connexion |
| Fig.12 | Capture — tableau de bord salarié (soldes + demandes) |
| Fig.13 | Capture — espace de validation manager |
| Fig.14 | Capture — documentation Swagger de l'API |
| Fig.15 | Capture — exécution des tests (pytest / vitest) |

---

## 5. Introduction générale

*(À rédiger en dernier.)*
- **Contexte global** : besoin métier RH, dématérialisation des process.
- **Problématique** : *Comment fiabiliser et fluidifier la gestion des demandes de congés tout en garantissant la sécurité des données et le respect des rôles de l'entreprise ?*
- **Objectifs** : `[reprendre les objectifs spécifiques du chapitre 1]`
- **Méthodologie** : développement agile (Scrum/Kanban), méthode itérative.
- **Structure du mémoire** : annonce des 4 chapitres.

---

## Chapitre 1 — Contexte et état de l'art

### 1.1 Présentation du domaine
Digitalisation des processus RH ; enjeux : conformité (droit du travail), traçabilité, réduction des tâches administratives.

### 1.2 Étude des solutions existantes
Comparer 2-3 outils du marché : `[ex : Lucca, Kelio, PayFit, ou un tableur Excel]`.

### 1.3 Comparaison des solutions
| Critère | Solution A | Solution B | Tableur Excel |
|---|---|---|---|
| Coût | … | … | gratuit mais manuel |
| Sécurité / droits | … | … | aucune |
| Suivi des soldes | … | … | erreurs fréquentes |
| Workflow de validation | … | … | par e-mail |

### 1.4 Analyse critique
Limites des solutions existantes : coût pour une petite structure, sur-dimensionnement fonctionnel, ou absence totale de contrôle (Excel).

### 1.5 Choix de la solution (positionnement)
CongésFlow vise une **PME** : un outil simple, ciblé sur le workflow congés, sécurisé et auto-hébergeable.
**Valeur ajoutée** : workflow de validation clair, calcul automatique des jours ouvrés et des soldes, gestion fine des rôles.
**Objectifs spécifiques** : (1) authentification sécurisée, (2) parcours de demande complet, (3) validation managériale, (4) pilotage RH des soldes.

---

## Chapitre 2 — Analyse et conception

### 2.1 Analyse du besoin (besoins fonctionnels)
Voir **Fig.2 (cas d'utilisation)**. User Stories principales :

| ID | Acteur | Action | Critères d'acceptation |
|----|--------|--------|------------------------|
| US1 | Visiteur | S'authentifier | Email unique, mot de passe haché, JWT renvoyé |
| US2 | Salarié | Poser une demande | Dates valides, jours ouvrés calculés, refus si solde insuffisant |
| US3 | Salarié | Consulter solde et demandes | solde = acquis − pris |
| US4 | Salarié | Annuler une demande | possible si SOUMISE ou VALIDEE |
| US5 | Manager | Voir les demandes de son équipe | périmètre limité à son équipe |
| US6 | Manager | Valider / refuser | transition autorisée seulement depuis SOUMISE |
| US7 | RH | Gérer les soldes | accès global |

### 2.2 Besoins non fonctionnels
- **Sécurité** : JWT, hachage bcrypt, RBAC, protection OWASP, requêtes préparées (ORM).
- **Performance** : API asynchrone (FastAPI), index sur les colonnes filtrées.
- **Maintenabilité** : séparation logique métier / API / persistance, tests automatisés.
- **Scalabilité** : architecture conteneurisée (Docker), stateless (JWT).

### 2.3 Modélisation (UML)
- **Fig.1** Diagramme de contexte
- **Fig.2** Cas d'utilisation
- **Fig.3** Diagramme d'activité (créer une demande)
- **Fig.4** Diagramme de séquence
- **Fig.5** Diagramme d'état-transition de la demande (règle métier centrale)
- **Fig.6** Diagramme de classes
- **Fig.7** MCD (+ MLD ci-dessous)

**MLD (modèle logique).**
```
service(id, nom)
type_absence(id, code, libelle)
employe(id, nom, prenom, email, mot_de_passe_hash, role, date_embauche, #service_id, #manager_id)
solde_conge(id, #employe_id, #type_absence_id, annee, jours_acquis, jours_pris)
demande_conge(id, #employe_id, #type_absence_id, date_debut, date_fin, nb_jours_ouvres,
              motif, statut, commentaire_manager, #valideur_id, created_at, updated_at)
```

### 2.4 Architecture technique
Architecture **client-serveur en couches** : SPA React ↔ API REST FastAPI ↔ ORM SQLAlchemy ↔ PostgreSQL (voir **Fig.9 composants** et **Fig.10 déploiement**).
- **Langage back** : Python (FastAPI) — typage Pydantic, documentation OpenAPI automatique.
- **SGBD** : PostgreSQL (relationnel, intégrité référentielle).
- **Front** : React + TypeScript.

### 2.5 Conception UI/UX
Maquettes / parcours utilisateur : connexion → tableau de bord (soldes + formulaire + historique) → (manager) écran de validation. `[Insérer maquettes Figma ou captures réelles Fig.11-13]`

---

## Chapitre 3 — Réalisation et mise en œuvre

### 3.1 Environnement et outils
- OS : macOS / IDE : VS Code
- Versioning : Git + GitHub (branches `main` / `develop` / `feature/*`)
- Conteneurisation : Docker + docker-compose
- CI : GitHub Actions

### 3.2 Technologies utilisées
| Couche | Technologie |
|---|---|
| Front-end | React, TypeScript, Vite, Tailwind CSS, React Query, Axios |
| Back-end | Python, FastAPI, SQLAlchemy, Pydantic |
| Sécurité | python-jose (JWT), passlib/bcrypt |
| Base de données | PostgreSQL (SQLite pour les tests) |
| Tests | pytest, Vitest |

### 3.3 Développement — modules réalisés
- **Module Authentification** (`routers/auth.py`, `security.py`) : register, login (JWT), profil.
- **Module Demandes** (`routers/demandes.py`) : création avec calcul des jours ouvrés et contrôle du solde, listing par rôle, validation/refus/annulation pilotés par la machine à états.
- **Module Soldes / Utilisateurs** (`routers/users.py`) : consultation et ajustement RH.
- **Logique métier isolée** (`business/conges.py`) : `compter_jours_ouvres`, `solde_suffisant`, `transition_possible`. `[Mettre en valeur un extrait de code]`
- **Front** : contexte d'authentification, routes protégées par rôle, pages Demandes et Validation.

### 3.4 Difficultés rencontrées
- `[Réel : ex. incompatibilité passlib/bcrypt résolue en figeant bcrypt==4.0.1]`
- `[Réel : gestion des transitions d'état pour éviter les états incohérents]`
- `[Réel : configuration CORS entre front :5173 et back :8000]`

### 3.5 Illustrations
Captures Fig.11 à Fig.15.

---

## Chapitre 4 — Tests et validation

### 4.1 Stratégie de test
- **Tests unitaires** : logique métier pure (jours ouvrés, solde, machine à états) — `backend/tests/test_conges.py`.
- **Tests d'intégration** : parcours API complets (login, création, RBAC, validation, transition interdite) — `backend/tests/test_demandes.py`.
- **Tests front** : helpers/affichage — `frontend/src/api/constants.test.ts`.

### 4.2 Outils de test
pytest + httpx (TestClient), Vitest + Testing Library, Postman/Swagger pour les tests manuels.

### 4.3 Résultats obtenus
- Back : **19 tests passés / 19** (13 unitaires + 6 intégration). `[Insérer capture Fig.15]`
- Front : **2 tests passés / 2**.
- Taux de réussite : 100 % sur le périmètre couvert.

### 4.4 Analyse des performances
`[À COMPLÉTER : temps de réponse moyen des endpoints via Swagger/Postman]`

### 4.5 Limites
`[Ex : pas de gestion des jours fériés, notifications e-mail non implémentées, un seul type de solde par défaut]`

---

## 7. Conclusion générale

- **Bilan** : application fonctionnelle couvrant les 3 blocs ; réponse à la problématique de fiabilisation du processus congés.
- **Apports** : montée en compétences full-stack, sécurité, conception UML, tests, DevOps.
- **Limites** : `[reprendre 4.5]`
- **Perspectives** : notifications e-mail, calendrier d'équipe, jours fériés, export comptable, application mobile.

---

## 8. Bibliographie

- Documentation FastAPI — https://fastapi.tiangolo.com
- Documentation React — https://react.dev
- Documentation SQLAlchemy — https://docs.sqlalchemy.org
- OWASP Top 10 — https://owasp.org/www-project-top-ten/
- `[Cours ESTIAM, articles, IA utilisée (préciser)]`

---

## 9. Annexes

- **A. Extraits de code** : `business/conges.py`, `security.py`, un router.
- **B. Diagrammes détaillés** : dossier `docs/diagrammes/`.
- **C. Script SQL** : `docs/sql/schema.sql` + `donnees-demo.sql`.
- **D. Documentation API** : export Swagger (`http://localhost:8000/docs`).
- **E. Dépôt GitHub** : `[lien du repo]`

---

## Annexe transverse — Couverture des 3 blocs de compétences (à mettre en début de dossier)

| Bloc | Compétence | Où c'est démontré dans CongésFlow |
|------|------------|-----------------------------------|
| **Bloc 1 — Front-end sécurisé** | Maquettage / responsive / UX | Pages React + Tailwind responsive, parcours utilisateur |
| | Framework moderne + gestion d'état | React + TypeScript + React Query |
| | Consommation d'API REST | Client Axios, intercepteurs JWT |
| | Sécurité côté client | Routes protégées par rôle (`ProtectedRoute`), gestion du token, déconnexion auto sur 401 |
| **Bloc 2 — Back-end sécurisé** | API REST robuste | FastAPI, endpoints documentés (OpenAPI), codes HTTP normalisés |
| | Base de données | PostgreSQL, MCD/MLD/MPD, ORM SQLAlchemy, contraintes d'intégrité |
| | Authentification | JWT (python-jose) |
| | Autorisations (RBAC) | 3 rôles, dépendance `exiger_roles` |
| | Sécurisation des données | Hachage bcrypt, requêtes préparées (ORM), CORS restreint, validation Pydantic, protection OWASP |
| **Bloc 3 — Conception / organisation** | Architecture logicielle | Architecture en couches, séparation métier/API/persistance |
| | Diagrammes techniques | 10 diagrammes UML (`docs/diagrammes/`) |
| | Gestion de projet agile | Product backlog, User Stories, MoSCoW |
| | Qualité logicielle / DevOps | Tests unitaires + intégration, Docker, docker-compose, CI GitHub Actions, branching Git |
