#!/usr/bin/env bash
# Crée les labels (colonnes Kanban) et les 16 issues du backlog CongésFlow sur GitHub.
#
# Prérequis :
#   1. GitHub CLI installé :   brew install gh
#   2. Connecté :              gh auth login
#   3. Lancé depuis le dépôt déjà poussé sur GitHub (origin défini).
#
# Usage :  bash scripts/creer-issues-github.sh
set -euo pipefail

command -v gh >/dev/null || { echo "❌ 'gh' non installé. Fais : brew install gh"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "❌ Non connecté. Fais : gh auth login"; exit 1; }

echo "→ Création des labels (priorités MoSCoW + colonnes Kanban)…"
lbl() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null 2>&1 || true; }
lbl "user-story"        "1D76DB" "User Story du backlog"
lbl "prio:must"         "B60205" "MoSCoW — Must have"
lbl "prio:should"       "D93F0B" "MoSCoW — Should have"
lbl "prio:could"        "FBCA04" "MoSCoW — Could have"
lbl "status:todo"       "C2E0C6" "Kanban — À faire"
lbl "status:in-progress" "FEF2C0" "Kanban — En cours"
lbl "status:done"       "0E8A16" "Kanban — Terminé"

echo "→ Création des issues…"
iss() { gh issue create --title "$1" --label "$2" --body "$3" >/dev/null && echo "  ✓ $1"; }

iss "[US1] S'inscrire et se connecter (JWT)" "user-story,prio:must,status:done" \
"**En tant que** visiteur, **je veux** créer un compte et me connecter, **afin d'**accéder à l'application.

**Critères :** email unique ; mot de passe haché (bcrypt) ; JWT renvoyé ; 401 si invalides.
Story points : 5 · Must · Done"

iss "[US2] Poser une demande de congé" "user-story,prio:must,status:done" \
"**En tant que** salarié, **je veux** poser une demande (type, dates, motif).

**Critères :** dates cohérentes ; jours ouvrés calculés ; refus si solde insuffisant ; statut SOUMISE.
Story points : 8 · Must · Done"

iss "[US3] Consulter mon solde et mes demandes" "user-story,prio:must,status:done" \
"**En tant que** salarié, **je veux** voir mes soldes et l'historique de mes demandes.

**Critères :** solde restant = acquis − pris ; liste filtrée sur l'utilisateur.
Story points : 3 · Must · Done"

iss "[US4] Annuler une demande" "user-story,prio:must,status:done" \
"**En tant que** salarié, **je veux** annuler une demande.

**Critères :** possible si SOUMISE ou VALIDEE ; restitution du solde si validée.
Story points : 3 · Must · Done"

iss "[US5] Voir les demandes de mon équipe (manager)" "user-story,prio:must,status:done" \
"**En tant que** manager, **je veux** voir les demandes de mon équipe.

**Critères :** je ne vois que mes subordonnés (RBAC).
Story points : 5 · Must · Done"

iss "[US6] Valider / refuser une demande" "user-story,prio:must,status:done" \
"**En tant que** manager, **je veux** valider ou refuser une demande (avec commentaire).

**Critères :** transition depuis SOUMISE seulement (409 sinon) ; solde décrémenté si validée.
Story points : 5 · Must · Done"

iss "[US7] Gérer les soldes (RH)" "user-story,prio:must,status:done" \
"**En tant que** RH, **je veux** consulter et ajuster les soldes des employés.

**Critères :** accès réservé au rôle RH (403 sinon).
Story points : 5 · Must · Done"

iss "[US8] Exclure les jours fériés du calcul" "user-story,prio:should,status:done" \
"**En tant que** salarié, **je veux** que les jours fériés ne soient pas décomptés.

**Critères :** fériés français (fixes + mobiles via calcul de Pâques) exclus, en plus des week-ends.
Story points : 3 · Should · Done"

iss "[US9] Tableau de bord d'indicateurs" "user-story,prio:should,status:done" \
"**En tant que** manager/RH, **je veux** un tableau de bord d'indicateurs.

**Critères :** indicateurs filtrés par périmètre (équipe / global).
Story points : 5 · Should · Done"

iss "[US10] Notifications visuelles (toasts)" "user-story,prio:should,status:done" \
"**En tant qu'**utilisateur, **je veux** un retour visuel après mes actions.

**Critères :** toast succès/erreur à la création, validation, refus, annulation.
Story points : 2 · Should · Done"

iss "[US11] Déployer l'application en ligne" "user-story,prio:should,status:in-progress" \
"**En tant qu'**administrateur, **je veux** déployer l'application (Render).

**Critères :** blueprint render.yaml (BDD + API + front) ; CORS et variables d'environnement gérés.
Story points : 3 · Should · In Progress"

iss "[US12] Calendrier d'équipe + détection des chevauchements" "user-story,prio:should,status:todo" \
"**En tant que** manager, **je veux** un calendrier d'équipe signalant les chevauchements d'absences.
Story points : 8 · Should · To Do"

iss "[US13] Notifications par e-mail" "user-story,prio:could,status:todo" \
"**En tant qu'**utilisateur, **je veux** recevoir un e-mail à chaque changement de statut.
Story points : 5 · Could · To Do"

iss "[US14] Gestion des demi-journées" "user-story,prio:could,status:todo" \
"**En tant que** salarié, **je veux** poser une demi-journée (matin / après-midi).
Story points : 3 · Could · To Do"

iss "[US15] Export comptable (CSV / PDF)" "user-story,prio:could,status:todo" \
"**En tant que** RH, **je veux** exporter les congés (CSV / PDF) pour la paie.
Story points : 5 · Could · To Do"

iss "[US16] Réinitialisation du mot de passe + refresh token" "user-story,prio:should,status:todo" \
"**En tant qu'**utilisateur, **je veux** réinitialiser mon mot de passe et garder ma session active.
Story points : 5 · Should · To Do"

echo ""
echo "✅ Labels et issues créés."
echo "→ (Optionnel) Tableau Kanban : crée un Project sur GitHub (onglet Projects),"
echo "  vue 'Board', et groupe par le label 'status:*' pour obtenir les colonnes."
gh project create --owner "@me" --title "CongésFlow — Suivi agile" >/dev/null 2>&1 \
  && echo "  ✓ Projet 'CongésFlow — Suivi agile' créé (ajoute-y les issues)." \
  || echo "  ⚠ Project non créé automatiquement (droits requis : gh auth refresh -s project)."
