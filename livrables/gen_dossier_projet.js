const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, TableOfContents, PageNumber, PageBreak, Header, Footer,
} = require("docx");

const CONTENT_W = 9026; // A4, marges 1"
const border = { style: BorderStyle.SINGLE, size: 1, color: "B7C3D0" };
const borders = { top: border, bottom: border, left: border, right: border };

// ---------- helpers ----------
const P = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts,
  children: Array.isArray(text) ? text : [new TextRun({ text, ...(opts.run || {}) })] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const bullet = (t) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60 },
  children: [new TextRun(t)] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// Encadré "capture à insérer"
const shot = (legende) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
  rows: [ new TableRow({ children: [ new TableCell({
    borders: { top: {style:BorderStyle.DASHED,size:2,color:"2F59C2"}, bottom: {style:BorderStyle.DASHED,size:2,color:"2F59C2"}, left: {style:BorderStyle.DASHED,size:2,color:"2F59C2"}, right: {style:BorderStyle.DASHED,size:2,color:"2F59C2"} },
    width: { size: CONTENT_W, type: WidthType.DXA },
    shading: { fill: "EEF3FC", type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 160, right: 160 },
    children: [
      new Paragraph({ spacing:{after:40}, children: [ new TextRun({ text: "📷  CAPTURE D'ÉCRAN À INSÉRER ICI", bold: true, color: "2F59C2" }) ] }),
      new Paragraph({ children: [ new TextRun({ text: legende, italics: true, color: "44505F" }) ] }),
    ],
  }) ] }) ],
});
const figma = (legende) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
  rows: [ new TableRow({ children: [ new TableCell({
    borders: { top: {style:BorderStyle.DASHED,size:2,color:"B3267A"}, bottom: {style:BorderStyle.DASHED,size:2,color:"B3267A"}, left: {style:BorderStyle.DASHED,size:2,color:"B3267A"}, right: {style:BorderStyle.DASHED,size:2,color:"B3267A"} },
    width: { size: CONTENT_W, type: WidthType.DXA },
    shading: { fill: "FBEEF6", type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 160, right: 160 },
    children: [
      new Paragraph({ spacing:{after:40}, children: [ new TextRun({ text: "🎨  MAQUETTE FIGMA À INSÉRER ICI", bold: true, color: "B3267A" }) ] }),
      new Paragraph({ children: [ new TextRun({ text: legende, italics: true, color: "44505F" }) ] }),
    ],
  }) ] }) ],
});
const diagram = (fig, legende, fichier) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
  rows: [ new TableRow({ children: [ new TableCell({
    borders: { top: {style:BorderStyle.DASHED,size:2,color:"1E8E5A"}, bottom: {style:BorderStyle.DASHED,size:2,color:"1E8E5A"}, left: {style:BorderStyle.DASHED,size:2,color:"1E8E5A"}, right: {style:BorderStyle.DASHED,size:2,color:"1E8E5A"} },
    width: { size: CONTENT_W, type: WidthType.DXA },
    shading: { fill: "EAF6EF", type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 160, right: 160 },
    children: [
      new Paragraph({ spacing:{after:40}, children: [ new TextRun({ text: `📐  ${fig} — DIAGRAMME À INSÉRER ICI`, bold: true, color: "1E8E5A" }) ] }),
      new Paragraph({ children: [ new TextRun({ text: legende, italics: true, color: "44505F" }) ] }),
      new Paragraph({ children: [ new TextRun({ text: `Source : docs/diagrammes/${fichier} — à rendre sur mermaid.live ou plantuml.com`, italics: true, size: 18, color: "6B7785" }) ] }),
    ],
  }) ] }) ],
});

// Tableau générique
const tableau = (headers, rows, widths) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: "2F59C2", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })] })],
    })) }),
    ...rows.map((r) => new TableRow({ children: r.map((c, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 20 })] })],
    })) })),
  ],
});

// ---------- contenu ----------
const cover = [
  new Paragraph({ spacing: { before: 1200, after: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ESTIAM", bold: true, size: 36, color: "2F59C2" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: "Dossier Projet — Titre Professionnel", size: 24, color: "44505F" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "CongésFlow", bold: true, size: 56 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 },
    children: [new TextRun({ text: "Application web de gestion des demandes de congés", size: 28, italics: true, color: "44505F" })] }),
  tableau(["Rubrique", "Information"], [
    ["Titre visé", "Concepteur Développeur d'Applications (RNCP niveau 6)"],
    ["Nom et prénom", "[À COMPLÉTER]"],
    ["Classe et spécialité", "CDA — promotion 2025-2026"],
    ["Encadrant", "M'hand BOUFALA"],
    ["Année scolaire", "2025-2026"],
    ["Dépôt GitHub", "[lien du dépôt à insérer]"],
  ], [3200, 5826]),
  pageBreak(),
];

const resume = [
  H1("Résumé"),
  P("Contexte. Dans de nombreuses PME, la gestion des congés reste un processus manuel (e-mails, tableurs) source d'erreurs, de pertes de temps et de litiges sur les soldes. CongésFlow digitalise ce processus de bout en bout."),
  P("Objectifs. Permettre à un salarié de poser une demande de congé, à son manager de la valider ou la refuser, et au service RH de piloter les soldes, dans une application sécurisée, testée et conteneurisée."),
  P("Résultats. Une application full-stack fonctionnelle (React + FastAPI + PostgreSQL) couvrant les trois blocs de compétences du titre : front-end sécurisé, back-end avec API REST et contrôle d'accès par rôle (RBAC), et démarche de conception outillée (UML, tests automatisés, CI/CD, Docker)."),
  H2("Abstract (anglais)"),
  P("[À COMPLÉTER : traduction anglaise du résumé ci-dessus — environ 8 lignes.]"),
  pageBreak(),
];

const sommaire = [
  H1("Sommaire"),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-3" }),
  P("(Dans Word : clic droit sur le sommaire → « Mettre à jour les champs » pour générer la pagination.)", { run: { italics: true, size: 18, color: "6B7785" } }),
  pageBreak(),
];

const figures = [
  H1("Liste des figures"),
  tableau(["Réf.", "Figure", "Type"], [
    ["Fig.1", "Diagramme de contexte", "UML"],
    ["Fig.2", "Diagramme de cas d'utilisation", "UML"],
    ["Fig.3", "Diagramme d'activité — créer une demande", "UML"],
    ["Fig.4", "Diagramme de séquence — créer une demande", "UML"],
    ["Fig.5", "Diagramme d'état-transition — demande", "UML"],
    ["Fig.6", "Diagramme de classes", "UML"],
    ["Fig.7", "Modèle conceptuel de données (MCD)", "Merise"],
    ["Fig.8", "Diagramme d'objets", "UML"],
    ["Fig.9", "Diagramme de composants", "UML"],
    ["Fig.10", "Diagramme de déploiement", "UML"],
    ["Fig.11", "Maquette Figma — écran de connexion", "Maquette"],
    ["Fig.12", "Maquette Figma — tableau de bord salarié", "Maquette"],
    ["Fig.13", "Capture — écran de connexion", "Capture"],
    ["Fig.14", "Capture — tableau de bord salarié", "Capture"],
    ["Fig.15", "Capture — espace de validation manager", "Capture"],
    ["Fig.16", "Capture — documentation Swagger de l'API", "Capture"],
    ["Fig.17", "Capture — exécution des tests (pytest / Vitest)", "Capture"],
  ], [1100, 5926, 2000]),
  pageBreak(),
];

const intro = [
  H1("Introduction générale"),
  P("La digitalisation des processus internes est devenue un levier de productivité majeur pour les entreprises. Parmi ces processus, la gestion des absences et des congés concerne 100 % des salariés et mobilise quotidiennement les managers et les services RH."),
  H2("Problématique"),
  P("Comment fiabiliser et fluidifier la gestion des demandes de congés au sein d'une PME, tout en garantissant la sécurité des données personnelles et le respect des rôles de l'organisation ?"),
  H2("Objectifs du projet"),
  bullet("Offrir un parcours de demande de congé simple et guidé pour le salarié."),
  bullet("Automatiser le calcul des jours ouvrés et le contrôle des soldes."),
  bullet("Fournir aux managers un workflow de validation clair et tracé."),
  bullet("Donner au service RH une vision d'ensemble et le pilotage des soldes."),
  H2("Méthodologie"),
  P("Le projet a été conduit selon une approche agile itérative (inspirée de Scrum / Kanban) : expression des besoins en User Stories, priorisation MoSCoW, développement par incréments testés, intégration continue."),
  H2("Structure du mémoire"),
  P("Le présent mémoire est organisé en quatre chapitres : (1) contexte et état de l'art, (2) analyse et conception, (3) réalisation et mise en œuvre, (4) tests et validation, suivis d'une conclusion et d'annexes techniques."),
  pageBreak(),
];

const chap1 = [
  H1("Chapitre 1 — Contexte et état de l'art"),
  H2("1.1 Présentation du domaine"),
  P("Le projet s'inscrit dans le domaine de la digitalisation des processus RH. Les enjeux principaux sont la conformité au droit du travail, la traçabilité des décisions, et la réduction des tâches administratives à faible valeur ajoutée."),
  H2("1.2 Étude des solutions existantes"),
  P("Plusieurs solutions existent sur le marché. Les plus répandues sont les logiciels SIRH (Lucca, PayFit, Kelio) et, à l'opposé, les tableurs partagés encore très utilisés dans les petites structures."),
  H2("1.3 Comparaison des solutions"),
  tableau(["Critère", "SIRH du marché", "Tableur Excel"], [
    ["Coût", "Abonnement par salarié, élevé pour une PME", "Gratuit"],
    ["Sécurité / droits d'accès", "Gestion fine des rôles", "Quasi inexistante"],
    ["Suivi automatique des soldes", "Oui", "Manuel, source d'erreurs"],
    ["Workflow de validation", "Intégré", "Par e-mail, non tracé"],
    ["Sur-mesure / hébergement", "Limité (SaaS propriétaire)", "Total mais artisanal"],
  ], [2600, 3413, 3013]),
  H2("1.4 Analyse critique"),
  P("Les SIRH du marché sont souvent sur-dimensionnés et coûteux pour une petite structure, tandis que le tableur n'offre aucune sécurité ni traçabilité. Il existe donc un espace pour une solution ciblée, simple et auto-hébergeable."),
  H2("1.5 Choix de la solution et positionnement"),
  P("CongésFlow vise la PME : un outil léger, focalisé sur le workflow congés, sécurisé et déployable en interne. Sa valeur ajoutée réside dans un workflow de validation clair, le calcul automatique des jours ouvrés et des soldes, et une gestion fine des rôles (salarié, manager, RH)."),
  pageBreak(),
];

const chap2 = [
  H1("Chapitre 2 — Analyse et conception"),
  H2("2.1 Analyse du besoin (besoins fonctionnels)"),
  P("Les fonctionnalités principales sont synthétisées dans le diagramme de cas d'utilisation ci-dessous, puis détaillées sous forme de User Stories."),
  diagram("Fig.2", "Acteurs (Salarié, Manager, RH) et cas d'utilisation du système.", "02-cas-utilisation.puml"),
  P(""),
  P("User Stories principales :", { run: { bold: true } }),
  tableau(["ID", "Acteur", "Action", "Critère d'acceptation clé"], [
    ["US1", "Visiteur", "S'authentifier", "Email unique, mot de passe haché, JWT renvoyé"],
    ["US2", "Salarié", "Poser une demande", "Jours ouvrés calculés, refus si solde insuffisant"],
    ["US3", "Salarié", "Consulter solde / demandes", "Solde = acquis − pris"],
    ["US4", "Salarié", "Annuler une demande", "Possible si SOUMISE ou VALIDEE"],
    ["US5", "Manager", "Voir les demandes de l'équipe", "Périmètre limité à son équipe"],
    ["US6", "Manager", "Valider / refuser", "Transition autorisée depuis SOUMISE"],
    ["US7", "RH", "Gérer les soldes", "Accès global"],
  ], [700, 1400, 3000, 3926]),
  H2("2.2 Besoins non fonctionnels"),
  bullet("Sécurité : JWT, hachage bcrypt, RBAC, protection OWASP, requêtes préparées via l'ORM."),
  bullet("Performance : API asynchrone (FastAPI), index sur les colonnes filtrées."),
  bullet("Maintenabilité : séparation logique métier / API / persistance, tests automatisés."),
  bullet("Scalabilité : architecture conteneurisée (Docker), serveur sans état (JWT)."),
  H2("2.3 Modélisation UML et Merise"),
  P("La conception s'appuie sur les diagrammes suivants, dont les sources figurent dans le dépôt (docs/diagrammes/)."),
  diagram("Fig.1", "Diagramme de contexte : le système et ses trois acteurs.", "01-contexte.puml"),
  P(""),
  diagram("Fig.3", "Diagramme d'activité du processus de création d'une demande.", "03-activite-demande.mmd"),
  P(""),
  diagram("Fig.4", "Diagramme de séquence : interactions front / API / base lors d'une création.", "04-sequence-creation.mmd"),
  P(""),
  diagram("Fig.5", "Diagramme d'état-transition de la demande (règle métier centrale).", "05-etat-demande.mmd"),
  P(""),
  diagram("Fig.6", "Diagramme de classes du modèle de domaine.", "06-classes.mmd"),
  P(""),
  diagram("Fig.7", "Modèle conceptuel de données (MCD).", "07-mcd.mmd"),
  P(""),
  P("Modèle logique de données (MLD) :", { run: { bold: true } }),
  P("service(id, nom)", { run: { font: "Courier New", size: 18 } }),
  P("type_absence(id, code, libelle)", { run: { font: "Courier New", size: 18 } }),
  P("employe(id, nom, prenom, email, mot_de_passe_hash, role, date_embauche, #service_id, #manager_id)", { run: { font: "Courier New", size: 18 } }),
  P("solde_conge(id, #employe_id, #type_absence_id, annee, jours_acquis, jours_pris)", { run: { font: "Courier New", size: 18 } }),
  P("demande_conge(id, #employe_id, #type_absence_id, date_debut, date_fin, nb_jours_ouvres, motif, statut, commentaire_manager, #valideur_id, created_at, updated_at)", { run: { font: "Courier New", size: 18 } }),
  H2("2.4 Architecture technique"),
  P("L'application suit une architecture client-serveur en couches : une SPA React communique en REST avec une API FastAPI, qui s'appuie sur l'ORM SQLAlchemy et une base PostgreSQL."),
  diagram("Fig.9", "Diagramme de composants de l'application.", "09-composants.puml"),
  P(""),
  diagram("Fig.10", "Diagramme de déploiement (architecture conteneurisée Docker).", "10-deploiement.puml"),
  P(""),
  tableau(["Couche", "Choix", "Justification"], [
    ["Front-end", "React + TypeScript", "Écosystème mature, typage = qualité"],
    ["Back-end", "Python + FastAPI", "Typage Pydantic, doc OpenAPI automatique"],
    ["Base de données", "PostgreSQL", "Relationnel, intégrité référentielle"],
    ["Sécurité", "JWT + bcrypt + RBAC", "Standards éprouvés"],
  ], [2200, 2800, 4026]),
  H2("2.5 Conception UI/UX"),
  P("Les maquettes ont été réalisées sous Figma avant le développement, afin de valider le parcours utilisateur : connexion, puis tableau de bord (soldes, formulaire de demande, historique), et pour le manager un écran de validation."),
  figma("Fig.11 — Maquette de l'écran de connexion."),
  P(""),
  figma("Fig.12 — Maquette du tableau de bord salarié (soldes + formulaire + historique)."),
  pageBreak(),
];

const chap3 = [
  H1("Chapitre 3 — Réalisation et mise en œuvre"),
  H2("3.1 Environnement et outils"),
  bullet("Système : macOS — IDE : Visual Studio Code."),
  bullet("Versioning : Git + GitHub, branches main / develop / feature/*."),
  bullet("Conteneurisation : Docker + docker-compose."),
  bullet("Intégration continue : GitHub Actions."),
  H2("3.2 Technologies utilisées"),
  tableau(["Couche", "Technologies"], [
    ["Front-end", "React, TypeScript, Vite, Tailwind CSS, React Query, Axios"],
    ["Back-end", "Python, FastAPI, SQLAlchemy, Pydantic"],
    ["Sécurité", "python-jose (JWT), passlib / bcrypt"],
    ["Base de données", "PostgreSQL (SQLite pour les tests)"],
    ["Tests", "pytest, Vitest"],
  ], [2600, 6426]),
  H2("3.3 Modules développés"),
  bullet("Module Authentification (routers/auth.py, security.py) : inscription, connexion JWT, profil."),
  bullet("Module Demandes (routers/demandes.py) : création avec calcul des jours ouvrés et contrôle du solde, listing filtré par rôle, validation / refus / annulation pilotés par la machine à états."),
  bullet("Module Soldes & Utilisateurs (routers/users.py) : consultation et ajustement RH des soldes."),
  bullet("Logique métier isolée (business/conges.py) : fonctions pures compter_jours_ouvres, solde_suffisant, transition_possible — facilement testables."),
  bullet("Front-end : contexte d'authentification, routes protégées par rôle, pages « Mes demandes » et « Validation »."),
  P("Extrait de code — logique métier (calcul des jours ouvrés) :", { run: { bold: true } }),
  P("def compter_jours_ouvres(date_debut, date_fin):\n    ...", { run: { font: "Courier New", size: 18 } }),
  shot("Fig.13 — Écran de connexion de l'application (http://localhost:5173)."),
  P(""),
  shot("Fig.14 — Tableau de bord salarié : soldes, formulaire de nouvelle demande et historique."),
  P(""),
  shot("Fig.15 — Espace manager : liste des demandes à valider avec actions Valider / Refuser."),
  P(""),
  shot("Fig.16 — Documentation interactive de l'API générée automatiquement (Swagger, http://localhost:8000/docs)."),
  H2("3.4 Difficultés rencontrées"),
  P("[À COMPLÉTER avec ton vécu réel. Exemples concrets de ce projet :]", { run: { italics: true, color: "B3267A" } }),
  bullet("Incompatibilité entre la librairie passlib et les versions récentes de bcrypt, résolue en figeant bcrypt==4.0.1."),
  bullet("Mise en place de la machine à états pour empêcher des transitions de statut incohérentes (ex. valider une demande déjà refusée)."),
  bullet("Configuration CORS entre le front (port 5173) et l'API (port 8000)."),
  pageBreak(),
];

const chap4 = [
  H1("Chapitre 4 — Tests et validation"),
  H2("4.1 Stratégie de test"),
  bullet("Tests unitaires : logique métier pure (jours ouvrés, solde, machine à états) — backend/tests/test_conges.py."),
  bullet("Tests d'intégration : parcours API complets (connexion, création, RBAC, validation, transition interdite) — backend/tests/test_demandes.py."),
  bullet("Tests front : fonctions d'affichage — frontend/src/api/constants.test.ts."),
  H2("4.2 Outils de test"),
  P("pytest + httpx (TestClient) pour le back-end, Vitest + Testing Library pour le front-end, et Postman / Swagger pour les tests manuels exploratoires."),
  H2("4.3 Résultats obtenus"),
  tableau(["Périmètre", "Tests", "Résultat"], [
    ["Back-end — unitaires", "13", "100 % réussite"],
    ["Back-end — intégration", "6", "100 % réussite"],
    ["Front-end — unitaires", "2", "100 % réussite"],
    ["Total", "21", "21 / 21"],
  ], [4026, 2500, 2500]),
  P(""),
  shot("Fig.17 — Sortie de l'exécution des tests (pytest et Vitest), tous au vert."),
  H2("4.4 Analyse des performances"),
  P("[À COMPLÉTER : relever le temps de réponse moyen de quelques endpoints via Swagger ou Postman — par ex. POST /api/demandes < 100 ms en local.]", { run: { italics: true, color: "B3267A" } }),
  H2("4.5 Limites"),
  bullet("Gestion des jours fériés non implémentée (seuls les week-ends sont exclus)."),
  bullet("Notifications par e-mail prévues mais non développées (périmètre MoSCoW « Could »)."),
  bullet("Un seul niveau de validation (pas de circuit multi-managers)."),
  pageBreak(),
];

const conclusion = [
  H1("Conclusion générale"),
  P("Bilan. CongésFlow répond à la problématique posée : l'application fiabilise et fluidifie la gestion des congés grâce à un workflow tracé, au calcul automatique des soldes et à une sécurité conforme aux standards. Les trois blocs de compétences du titre sont couverts."),
  P("Apports. Ce projet m'a permis de monter en compétence sur l'ensemble de la chaîne full-stack, la sécurité applicative, la conception UML et les pratiques DevOps (tests, CI/CD, conteneurisation)."),
  P("Limites. Voir section 4.5 : jours fériés, notifications et validation multi-niveaux restent à implémenter."),
  P("Perspectives. Les évolutions envisagées sont : notifications par e-mail, calendrier d'équipe avec détection des chevauchements, prise en compte des jours fériés, export comptable et une application mobile."),
  pageBreak(),
];

const biblio = [
  H1("Bibliographie"),
  bullet("Documentation FastAPI — https://fastapi.tiangolo.com"),
  bullet("Documentation React — https://react.dev"),
  bullet("Documentation SQLAlchemy — https://docs.sqlalchemy.org"),
  bullet("OWASP Top 10 — https://owasp.org/www-project-top-ten/"),
  bullet("[Supports de cours ESTIAM, articles consultés, et outils d'IA utilisés — à préciser]"),
  pageBreak(),
];

const annexes = [
  H1("Annexes"),
  H2("Annexe A — Couverture des trois blocs de compétences"),
  tableau(["Bloc", "Compétence", "Où c'est démontré dans CongésFlow"], [
    ["Bloc 1", "Maquettage / responsive / UX", "Maquettes Figma, pages React + Tailwind responsive"],
    ["Bloc 1", "Framework moderne + état", "React + TypeScript + React Query"],
    ["Bloc 1", "Consommation d'API REST", "Client Axios, intercepteurs JWT"],
    ["Bloc 1", "Sécurité côté client", "Routes protégées par rôle, gestion du token"],
    ["Bloc 2", "API REST robuste", "FastAPI, endpoints documentés (OpenAPI)"],
    ["Bloc 2", "Base de données", "PostgreSQL, MCD/MLD/MPD, ORM, contraintes"],
    ["Bloc 2", "Authentification", "JWT (python-jose)"],
    ["Bloc 2", "Autorisations (RBAC)", "3 rôles, dépendance exiger_roles"],
    ["Bloc 2", "Sécurisation des données", "bcrypt, requêtes préparées, CORS, validation"],
    ["Bloc 3", "Architecture logicielle", "Architecture en couches, séparation des responsabilités"],
    ["Bloc 3", "Diagrammes techniques", "10 diagrammes UML / Merise"],
    ["Bloc 3", "Gestion de projet agile", "Backlog, User Stories, MoSCoW"],
    ["Bloc 3", "Qualité & DevOps", "Tests, Docker, CI GitHub Actions, Git"],
  ], [1100, 3200, 4726]),
  H2("Annexe B — Diagrammes détaillés"),
  P("Voir le dossier docs/diagrammes/ du dépôt (sources Mermaid et PlantUML)."),
  H2("Annexe C — Script SQL"),
  P("Voir docs/sql/schema.sql (modèle physique complet) et docs/sql/donnees-demo.sql (jeu de données)."),
  H2("Annexe D — Documentation de l'API"),
  P("Export de la documentation Swagger disponible à l'adresse http://localhost:8000/docs."),
  shot("Capture optionnelle : vue complète des endpoints dans Swagger."),
  H2("Annexe E — Dépôt GitHub"),
  P("Code source complet : [lien du dépôt à insérer]."),
];

// ---------- document ----------
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: "1B2A4A" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2F59C2", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "2F59C2" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, color: "44505F" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
      children: [ new TextRun({ text: "CongésFlow — Dossier Projet CDA   |   Page ", size: 18, color: "6B7785" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7785" }) ] }) ] }) },
    children: [
      ...cover, ...resume, ...sommaire, ...figures, ...intro,
      ...chap1, ...chap2, ...chap3, ...chap4, ...conclusion, ...biblio, ...annexes,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/Dossier_Projet_CongesFlow.docx", buf);
  console.log("OK Dossier_Projet_CongesFlow.docx");
});
