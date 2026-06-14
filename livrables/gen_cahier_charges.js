const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, TableOfContents, PageNumber, PageBreak, Footer,
} = require("docx");

const CW = 9026;
const bd = { style: BorderStyle.SINGLE, size: 1, color: "B7C3D0" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };

const P = (t, o = {}) => new Paragraph({ spacing: { after: 120 }, ...o, children: Array.isArray(t) ? t : [new TextRun({ text: t, ...(o.run || {}) })] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const li = (t) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 50 }, children: Array.isArray(t) ? t : [new TextRun(t)] });
const B = (t) => new TextRun({ text: t, bold: true });
const R = (t) => new TextRun(t);
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const tbl = (headers, rows, widths) => new Table({
  width: { size: CW, type: WidthType.DXA }, columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, shading: { fill: "4F46E5", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 110, right: 110 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 19 })] })] })) }),
    ...rows.map((r) => new TableRow({ children: r.map((c, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children: [new Paragraph({ children: Array.isArray(c) ? c : [new TextRun({ text: c, size: 18 })] })] })) })),
  ],
});

const badge = (txt, color) => new TextRun({ text: txt, bold: true, color, size: 18 });

const cover = [
  new Paragraph({ spacing: { before: 1100, after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CAHIER DES CHARGES", bold: true, size: 44, color: "4F46E5" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "CongésFlow", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 }, children: [new TextRun({ text: "Application web de gestion des demandes de congés", size: 24, italics: true, color: "44505F" })] }),
  tbl(["Rubrique", "Information"], [
    ["Projet", "CongésFlow"],
    ["Maître d'ouvrage", "ESTIAM (projet de fin d'études)"],
    ["Maître d'œuvre", "BOUNGOU MBIMI Gloire Bryan"],
    ["Titre visé", "Concepteur Développeur d'Applications (RNCP niveau 6)"],
    ["Encadrant", "M'hand BOUFALA — ESTIAM"],
    ["Version", "1.0 — Juin 2026"],
  ], [2800, 6226]),
  pageBreak(),
];

const sommaire = [
  H1("Sommaire"),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-2" }),
  P("(Word : clic droit → Mettre à jour les champs.)", { run: { italics: true, size: 18, color: "6B7785" } }),
  pageBreak(),
];

const presentation = [
  H1("1. Présentation du projet"),
  H2("1.1 Contexte"),
  P("Dans de nombreuses PME, la gestion des congés repose sur des outils non spécialisés (e-mails, tableurs partagés), source d'erreurs de soldes, de pertes de demandes et d'un manque de traçabilité et de sécurité. CongésFlow vise à digitaliser ce processus de bout en bout."),
  H2("1.2 Problématique"),
  P("Comment fiabiliser et fluidifier la gestion des demandes de congés au sein d'une PME, tout en garantissant la sécurité des données personnelles et le respect des rôles de l'organisation ?"),
  H2("1.3 Objectifs"),
  li("Offrir un parcours de demande de congé simple et guidé."),
  li("Automatiser le calcul des jours ouvrés (week-ends et jours fériés exclus) et le contrôle des soldes."),
  li("Fournir un workflow de validation tracé, restreint au périmètre d'équipe."),
  li("Garantir la sécurité : authentification, autorisations par rôle, protection des données."),
  li("Offrir un tableau de bord d'indicateurs aux managers et aux RH."),
  pageBreak(),
];

const perimetre = [
  H1("2. Périmètre fonctionnel"),
  H2("2.1 Acteurs et rôles"),
  tbl(["Acteur", "Responsabilités"], [
    ["Salarié", "Pose, consulte et annule ses demandes ; consulte ses soldes."],
    ["Manager", "Actions du salarié + validation/refus des demandes de son équipe + tableau de bord."],
    ["RH / Administrateur", "Supervision globale + gestion des soldes + tableau de bord global."],
  ], [2400, 6626]),
  H2("2.2 Priorisation (méthode MoSCoW)"),
  P([B("Must have — "), R("indispensables : authentification JWT, 3 rôles (RBAC), poser/annuler une demande, calcul des jours ouvrés et fériés, contrôle du solde, validation/refus manager, consultation des soldes et de l'historique, gestion RH des soldes.")]),
  P([B("Should have — "), R("calendrier d'équipe, détection des chevauchements, tableau de bord d'indicateurs, notifications visuelles.")]),
  P([B("Could have — "), R("notifications par e-mail, export comptable, demi-journées, mode sombre.")]),
  P([B("Won't have — "), R("paie, multi-entreprise, application mobile native (hors périmètre de cette version).")]),
  pageBreak(),
];

const fonctionnels = [
  H1("3. Besoins fonctionnels détaillés"),
  P("La colonne « État » distingue les fonctionnalités déjà livrées de celles planifiées."),
  tbl(["Réf.", "Besoin fonctionnel", "État"], [
    ["F1", "Inscription et connexion par jeton JWT", "Livré"],
    ["F2", "Gestion de trois rôles avec contrôle d'accès (RBAC)", "Livré"],
    ["F3", "Poser une demande (type, dates, motif)", "Livré"],
    ["F4", "Calcul automatique des jours ouvrés (week-ends exclus)", "Livré"],
    ["F5", "Exclusion des jours fériés français du décompte", "Livré"],
    ["F6", "Contrôle du solde avant enregistrement", "Livré"],
    ["F7", "Consulter ses demandes et ses soldes", "Livré"],
    ["F8", "Annuler une demande (avec restitution du solde si validée)", "Livré"],
    ["F9", "Workflow de validation (machine à états)", "Livré"],
    ["F10", "Validation / refus par le manager (périmètre équipe)", "Livré"],
    ["F11", "Gestion des soldes par les RH", "Livré"],
    ["F12", "Tableau de bord d'indicateurs (manager / RH)", "Livré"],
    ["F13", "Notifications visuelles (toasts) des actions", "Livré"],
    ["F14", "Calendrier d'équipe et détection des chevauchements", "À venir"],
    ["F15", "Notifications par e-mail", "À venir"],
    ["F16", "Gestion des demi-journées", "À venir"],
    ["F17", "Export comptable (CSV / PDF)", "À venir"],
  ], [800, 6126, 2100]),
  pageBreak(),
];

const nonFonctionnels = [
  H1("4. Besoins non fonctionnels"),
  tbl(["Catégorie", "Exigence"], [
    ["Sécurité", "JWT, hachage bcrypt, RBAC, requêtes préparées (ORM), CORS restreint, validation des entrées, OWASP Top 10."],
    ["Performance", "API asynchrone (FastAPI), index sur les colonnes filtrées, temps de réponse faibles."],
    ["Ergonomie", "Interface responsive et moderne, parcours principal en moins de trois clics, retours visuels (toasts, états de chargement)."],
    ["Maintenabilité", "Architecture en couches, logique métier isolée et testée, typage statique (TypeScript, Pydantic)."],
    ["Fiabilité", "Tests automatisés (unitaires et intégration) exécutés en intégration continue."],
    ["Portabilité", "Application conteneurisée (Docker), indépendante du système hôte."],
    ["Accessibilité", "Contrastes suffisants, libellés de formulaire, navigation clavier."],
  ], [2200, 6826]),
  pageBreak(),
];

const technique = [
  H1("5. Contraintes et choix techniques"),
  tbl(["Couche", "Technologie"], [
    ["Front-end", "React, TypeScript, Vite, Tailwind CSS, React Query, Axios"],
    ["Back-end", "Python, FastAPI, SQLAlchemy, Pydantic"],
    ["Base de données", "PostgreSQL (SQLite pour les tests)"],
    ["Sécurité", "python-jose (JWT), passlib / bcrypt, RBAC"],
    ["Tests", "pytest, httpx, Vitest"],
    ["DevOps", "Docker, docker-compose, GitHub Actions, Git / GitHub"],
  ], [2400, 6626]),
  pageBreak(),
];

const ameliorations = [
  H1("6. Liste des améliorations (feuille de route)"),
  P("Cette section recense l'ensemble des améliorations identifiées. Les améliorations marquées « Réalisée » ont été implémentées dans la présente version ; les autres constituent les perspectives d'évolution."),
  H2("6.1 Améliorations réalisées dans cette version"),
  tbl(["Amélioration", "Apport", "État"], [
    ["Exclusion des jours fériés français", "Décompte exact des congés (calcul de Pâques inclus)", "Réalisée"],
    ["Endpoint et page tableau de bord", "Indicateurs clés pour managers et RH", "Réalisée"],
    ["Refonte de l'interface visuelle", "Design moderne : sidebar, cartes, icônes, palette cohérente", "Réalisée"],
    ["Notifications toast", "Retour visuel immédiat des actions (succès / erreur)", "Réalisée"],
    ["États de chargement et états vides", "Meilleure expérience utilisateur", "Réalisée"],
    ["Page de connexion repensée", "Présentation produit + comptes de démonstration", "Réalisée"],
  ], [3000, 4026, 2000]),
  H2("6.2 Améliorations planifiées (perspectives)"),
  tbl(["Domaine", "Amélioration", "Priorité"], [
    ["Fonctionnel", "Calendrier d'équipe et détection des chevauchements", "Haute"],
    ["Fonctionnel", "Gestion des demi-journées", "Moyenne"],
    ["Fonctionnel", "Circuit de validation multi-niveaux", "Moyenne"],
    ["Communication", "Notifications par e-mail (soumise / validée / refusée)", "Haute"],
    ["Reporting", "Export comptable (CSV / PDF) pour la paie", "Moyenne"],
    ["Sécurité", "Jetons de rafraîchissement et réinitialisation du mot de passe", "Haute"],
    ["Sécurité", "Journal d'audit des décisions et limitation du débit (anti-bruteforce)", "Moyenne"],
    ["Technique", "Migrations de base de données (Alembic) et pagination", "Moyenne"],
    ["Qualité", "Tests end-to-end (Playwright) et couverture de code", "Moyenne"],
    ["UI/UX", "Mode sombre, internationalisation (FR/EN), accessibilité renforcée", "Basse"],
    ["DevOps", "Déploiement en ligne (HTTPS, domaine) et livraison continue", "Haute"],
  ], [2000, 5026, 2000]),
  pageBreak(),
];

const livrables = [
  H1("7. Livrables"),
  li("Application web fonctionnelle (front-end + back-end + base de données)."),
  li("Code source complet versionné sur GitHub."),
  li("Dossier projet (mémoire) et Dossier Professionnel."),
  li("Diagrammes UML / Merise, scripts SQL et documentation d'API (OpenAPI)."),
  li("Jeu de tests automatisés et pipeline d'intégration continue."),
  li("Support de présentation pour la soutenance."),
  H1("8. Planning indicatif"),
  tbl(["Phase", "Contenu"], [
    ["Cadrage", "Expression des besoins, choix techniques, maquettes."],
    ["Conception", "Diagrammes UML, modèle de données, architecture."],
    ["Développement", "Back-end, front-end, sécurité, par incréments testés."],
    ["Améliorations", "Jours fériés, tableau de bord, refonte visuelle."],
    ["Tests & industrialisation", "Tests, Docker, intégration continue."],
    ["Documentation & soutenance", "Dossiers, support de présentation."],
  ], [2600, 6426]),
];

const body = [cover, sommaire, presentation, perimetre, fonctionnels, nonFonctionnels, technique, ameliorations, livrables].flat(Infinity);

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "312E81" },
        paragraph: { spacing: { before: 260, after: 140 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "4F46E5", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "4F46E5" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CongésFlow — Cahier des charges   |   Page ", size: 18, color: "6B7785" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7785" })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(__dirname + "/Cahier_des_charges_CongesFlow.docx", buf); console.log("OK Cahier_des_charges_CongesFlow.docx"); });
