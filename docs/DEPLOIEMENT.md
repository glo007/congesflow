# Déploiement de CongésFlow sur Render

Ce guide déploie l'application complète (base PostgreSQL + API FastAPI + frontend React)
grâce au fichier `render.yaml` (Blueprint) présent à la racine du dépôt.

## Prérequis
- Le code doit être **poussé sur GitHub** (Render déploie depuis un dépôt Git).
- Un compte **Render** (gratuit) : https://render.com

## Étape 1 — Pousser le code sur GitHub
```bash
cd ~/Desktop/ProjetCda
git add -A
git commit -m "Préparation du déploiement Render"
git push        # vers votre dépôt GitHub
```

## Étape 2 — Créer le Blueprint sur Render
1. Connectez-vous sur https://dashboard.render.com
2. Cliquez sur **New +** → **Blueprint**.
3. Sélectionnez votre dépôt GitHub `congesflow` (autorisez Render à y accéder si demandé).
4. Render détecte automatiquement le fichier `render.yaml` et propose de créer :
   - `congesflow-db` (PostgreSQL)
   - `congesflow-api` (API FastAPI, conteneur Docker)
   - `congesflow-web` (frontend React statique)
5. Cliquez sur **Apply** / **Create**.

## Étape 3 — Attendre le déploiement
- Le premier déploiement prend quelques minutes (build Docker + build front).
- Une fois terminé, l'application est accessible à l'URL du service **congesflow-web**
  (du type `https://congesflow-web.onrender.com`).
- L'API est sur `https://congesflow-api.onrender.com` (documentation : `/docs`).

## Comptes de démonstration (créés automatiquement au démarrage)
| Email | Rôle | Mot de passe |
|---|---|---|
| salarie@congesflow.fr | Salarié | Password123 |
| manager@congesflow.fr | Manager | Password123 |
| rh@congesflow.fr | RH | Password123 |

## Bon à savoir (offre gratuite Render)
- **Mise en veille** : un service gratuit s'endort après ~15 min d'inactivité ;
  la première requête suivante peut prendre ~50 s (démarrage à froid). C'est normal.
- **Base gratuite** : la base PostgreSQL gratuite a une durée de vie limitée
  (pensez à vérifier avant la soutenance, ou à la recréer si besoin).
- **Secret JWT** : généré automatiquement par Render (variable `JWT_SECRET`).

## Variables d'environnement (déjà gérées par le Blueprint)
| Service | Variable | Valeur |
|---|---|---|
| API | `DATABASE_URL` | injectée depuis la base PostgreSQL |
| API | `JWT_SECRET` | générée par Render |
| API | `JWT_EXPIRE_MINUTES` | 120 |
| Web | `VITE_API_URL` | nom d'hôte de l'API (préfixé par https:// côté front) |

## Adaptations techniques réalisées pour le déploiement
- **CORS** : l'API autorise les origines `*.onrender.com` (et le local).
- **Port dynamique** : le conteneur écoute sur `$PORT` fourni par Render.
- **URL PostgreSQL** : `postgres://` est normalisé en `postgresql+psycopg2://`.
- **Routage SPA** : les routes inconnues du front sont redirigées vers `index.html`.
