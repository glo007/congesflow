# Product Backlog — CongésFlow (méthodologie agile)

Backlog des User Stories, priorisées par la méthode **MoSCoW** et estimées en **story points**
(suite de Fibonacci). La colonne **Statut** représente le tableau **Kanban** (To Do / In Progress / Done).

## Tableau Kanban (synthèse)

| ID | User Story | Priorité | Points | Statut |
|----|------------|----------|--------|--------|
| US1 | S'inscrire et se connecter (JWT) | Must | 5 | ✅ Done |
| US2 | Poser une demande de congé | Must | 8 | ✅ Done |
| US3 | Consulter mon solde et mes demandes | Must | 3 | ✅ Done |
| US4 | Annuler une demande | Must | 3 | ✅ Done |
| US5 | Voir les demandes de mon équipe (manager) | Must | 5 | ✅ Done |
| US6 | Valider / refuser une demande | Must | 5 | ✅ Done |
| US7 | Gérer les soldes des employés (RH) | Must | 5 | ✅ Done |
| US8 | Exclure les jours fériés du calcul | Should | 3 | ✅ Done |
| US9 | Tableau de bord d'indicateurs | Should | 5 | ✅ Done |
| US10 | Notifications visuelles (toasts) | Should | 2 | ✅ Done |
| US11 | Déployer l'application en ligne | Should | 3 | 🔄 In Progress |
| US12 | Calendrier d'équipe + détection des chevauchements | Should | 8 | 📋 To Do |
| US13 | Notifications par e-mail | Could | 5 | 📋 To Do |
| US14 | Gestion des demi-journées | Could | 3 | 📋 To Do |
| US15 | Export comptable (CSV / PDF) | Could | 5 | 📋 To Do |
| US16 | Réinitialisation du mot de passe + refresh token | Should | 5 | 📋 To Do |

**Vélocité réalisée** (Done) : 44 points · **Reste à faire** : 29 points.

---

## Détail des User Stories

### US1 — S'inscrire et se connecter · Must · 5 pts · ✅
**En tant que** visiteur, **je veux** créer un compte et me connecter, **afin d'**accéder à l'application.
**Critères d'acceptation :** email unique ; mot de passe haché (bcrypt) ; jeton JWT renvoyé à la connexion ; erreur 401 si identifiants invalides.

### US2 — Poser une demande de congé · Must · 8 pts · ✅
**En tant que** salarié, **je veux** poser une demande (type, dates, motif), **afin d'**être absent.
**Critères :** dates cohérentes ; jours ouvrés calculés automatiquement ; refus si solde insuffisant ; statut initial SOUMISE.

### US3 — Consulter mon solde et mes demandes · Must · 3 pts · ✅
**En tant que** salarié, **je veux** voir mes soldes et l'historique de mes demandes.
**Critères :** solde restant = acquis − pris ; liste filtrée sur l'utilisateur courant.

### US4 — Annuler une demande · Must · 3 pts · ✅
**En tant que** salarié, **je veux** annuler une demande.
**Critères :** possible si statut SOUMISE ou VALIDEE ; restitution du solde si la demande était validée.

### US5 — Voir les demandes de mon équipe · Must · 5 pts · ✅
**En tant que** manager, **je veux** voir les demandes de mon équipe.
**Critères :** je ne vois que les salariés dont je suis le manager (RBAC).

### US6 — Valider / refuser une demande · Must · 5 pts · ✅
**En tant que** manager, **je veux** valider ou refuser une demande (avec commentaire).
**Critères :** transition autorisée seulement depuis SOUMISE (sinon 409) ; solde décrémenté si validée.

### US7 — Gérer les soldes (RH) · Must · 5 pts · ✅
**En tant que** RH, **je veux** consulter et ajuster les soldes des employés.
**Critères :** accès réservé au rôle RH (403 sinon).

### US8 — Exclure les jours fériés du calcul · Should · 3 pts · ✅
**En tant que** salarié, **je veux** que les jours fériés ne soient pas décomptés.
**Critères :** fériés français (fixes + mobiles via calcul de Pâques) exclus en plus des week-ends.

### US9 — Tableau de bord d'indicateurs · Should · 5 pts · ✅
**En tant que** manager/RH, **je veux** un tableau de bord (demandes en attente, validées, jours du mois, effectif).
**Critères :** indicateurs filtrés selon le périmètre (équipe pour le manager, global pour les RH).

### US10 — Notifications visuelles · Should · 2 pts · ✅
**En tant qu'**utilisateur, **je veux** un retour visuel (toast) après mes actions.
**Critères :** toast succès/erreur affiché à la création, validation, refus, annulation.

### US11 — Déployer l'application en ligne · Should · 3 pts · 🔄
**En tant qu'**administrateur, **je veux** déployer l'application (Render).
**Critères :** blueprint render.yaml (BDD + API + front) ; CORS et variables d'environnement gérés.

### US12 — Calendrier d'équipe + chevauchements · Should · 8 pts · 📋
**En tant que** manager, **je veux** un calendrier d'équipe signalant les chevauchements d'absences.

### US13 — Notifications par e-mail · Could · 5 pts · 📋
**En tant qu'**utilisateur, **je veux** recevoir un e-mail à chaque changement de statut.

### US14 — Gestion des demi-journées · Could · 3 pts · 📋
**En tant que** salarié, **je veux** poser une demi-journée (matin / après-midi).

### US15 — Export comptable · Could · 5 pts · 📋
**En tant que** RH, **je veux** exporter les congés (CSV / PDF) pour la paie.

### US16 — Réinitialisation du mot de passe + refresh token · Should · 5 pts · 📋
**En tant qu'**utilisateur, **je veux** réinitialiser mon mot de passe et garder ma session active.
