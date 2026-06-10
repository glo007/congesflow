const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, Footer,
} = require("docx");

const CONTENT_W = 9026;
const border = { style: BorderStyle.SINGLE, size: 1, color: "B7C3D0" };
const borders = { top: border, bottom: border, left: border, right: border };

const P = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts,
  children: Array.isArray(text) ? text : [new TextRun({ text, ...(opts.run || {}) })] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const bullet = (t) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60 }, children: [new TextRun(t)] });
const fill = (t) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, italics: true, color: "B3267A" })] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

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

// Bloc "exemple de pratique professionnelle"
const exemple = (titre, contexte, actions, competences) => [
  H2(titre),
  P("Contexte et description de la situation professionnelle :", { run: { bold: true } }),
  P(contexte),
  P("Actions réalisées :", { run: { bold: true } }),
  ...actions.map(bullet),
  P("Compétences mises en œuvre :", { run: { bold: true } }),
  ...competences.map(bullet),
];

const cover = [
  new Paragraph({ spacing: { before: 1000, after: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "DOSSIER PROFESSIONNEL (DP)", bold: true, size: 40, color: "2F59C2" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: "Titre Professionnel", size: 24, color: "44505F" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Concepteur Développeur d'Applications", bold: true, size: 36 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 },
    children: [new TextRun({ text: "Niveau 6 (RNCP)", size: 24, italics: true, color: "44505F" })] }),
  tableau(["Rubrique", "Information"], [
    ["Nom et prénom", "[À COMPLÉTER]"],
    ["Date de naissance", "[À COMPLÉTER]"],
    ["Centre de formation", "ESTIAM"],
    ["Session d'examen", "Septembre 2026"],
    ["Projet support", "CongésFlow — Application de gestion des congés"],
  ], [3200, 5826]),
  new Paragraph({ spacing: { before: 500 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "⚠️ Si votre centre a fourni un modèle officiel de DP, recopiez-y ce contenu.", italics: true, size: 18, color: "6B7785" })] }),
  pageBreak(),
];

const honneur = [
  H1("Déclaration sur l'honneur"),
  P("Je soussigné(e) [Nom Prénom], déclare sur l'honneur que les informations contenues dans ce dossier professionnel sont exactes et que le travail présenté est le résultat de ma propre activité."),
  P("Fait à [Ville], le [date].", { spacing: { before: 240 } }),
  P("Signature : ______________________", { spacing: { before: 360 } }),
  pageBreak(),
];

const presentation = [
  H1("1. Présentation du candidat et du parcours"),
  fill("[À COMPLÉTER : présentez en quelques lignes votre parcours, votre projet professionnel et le contexte de réalisation du projet — formation à l'ESTIAM, éventuel stage/alternance.]"),
  H2("Contexte du projet support"),
  P("Le projet CongésFlow a été réalisé en centre de formation. Il s'agit d'une application web de gestion des demandes de congés destinée à une PME, permettant à un salarié de poser une demande, à son manager de la valider, et au service RH de piloter les soldes. Ce projet a servi de support à la mise en œuvre des compétences des trois activités-types du titre."),
  pageBreak(),
];

const synthese = [
  H1("2. Synthèse des activités-types et compétences"),
  P("Le titre CDA est constitué de trois activités-types (AT). Le tableau ci-dessous récapitule la couverture par le projet CongésFlow."),
  tableau(["Activité-type", "Couverture par CongésFlow"], [
    ["AT1 — Développer une interface utilisateur sécurisée (front-end)", "Maquettes Figma, SPA React/TypeScript, routes protégées, consommation d'API REST"],
    ["AT2 — Concevoir et développer la persistance des données", "MCD/MLD/MPD, PostgreSQL, ORM SQLAlchemy, script SQL, contraintes d'intégrité"],
    ["AT3 — Concevoir et développer une application multicouche sécurisée", "API FastAPI, architecture en couches, JWT/RBAC, tests, Docker, CI/CD, gestion agile"],
  ], [3600, 5426]),
  pageBreak(),
];

const at1 = [
  H1("3. Activité-type 1 — Développer une interface utilisateur sécurisée"),
  ...exemple(
    "3.1 Exemple — Conception et développement de l'interface de CongésFlow",
    "À partir de l'expression des besoins, j'ai d'abord maquetté les écrans clés sous Figma (connexion, tableau de bord, validation), puis développé l'interface en React et TypeScript. L'enjeu de sécurité était de n'exposer chaque écran qu'aux rôles autorisés et de gérer le jeton d'authentification côté client.",
    [
      "Réalisation des maquettes Figma et définition du parcours utilisateur.",
      "Développement de composants React réutilisables (formulaire de demande, badges de statut, mise en page responsive avec Tailwind CSS).",
      "Mise en place de la gestion d'état serveur avec React Query et de la consommation de l'API REST via Axios.",
      "Sécurisation côté client : routes protégées par rôle (RBAC), stockage et injection du JWT, déconnexion automatique en cas de jeton invalide.",
    ],
    [
      "Maquetter une application.",
      "Développer la partie front-end d'une interface utilisateur web.",
      "Développer des composants d'accès aux données (consommation d'API REST).",
    ],
  ),
  fill("[À COMPLÉTER éventuellement : ajoutez une difficulté concrète rencontrée sur le front et la manière dont vous l'avez résolue — ex. configuration CORS, gestion de l'expiration du token.]"),
  pageBreak(),
];

const at2 = [
  H1("4. Activité-type 2 — Concevoir et développer la persistance des données"),
  ...exemple(
    "4.1 Exemple — Modélisation et mise en place de la base de données",
    "Le cœur de CongésFlow repose sur des données relationnelles (employés, demandes, soldes, types d'absence). J'ai conduit la modélisation depuis le besoin métier jusqu'au modèle physique exécutable, en garantissant l'intégrité des données.",
    [
      "Élaboration du modèle conceptuel (MCD) puis du modèle logique (MLD) en identifiant entités, relations et cardinalités.",
      "Écriture du modèle physique en SQL pour PostgreSQL (tables, clés primaires et étrangères, contraintes UNIQUE / NOT NULL / CHECK, index).",
      "Mise en place de l'accès aux données via l'ORM SQLAlchemy, garantissant des requêtes préparées (protection contre les injections SQL).",
      "Définition d'un jeu de données de démonstration pour les tests et la soutenance.",
    ],
    [
      "Concevoir une base de données.",
      "Mettre en place une base de données.",
      "Développer des composants dans le langage d'une base de données.",
    ],
  ),
  fill("[À COMPLÉTER éventuellement : justifiez un choix de modélisation, par exemple la table solde_conge par employé / type / année.]"),
  pageBreak(),
];

const at3 = [
  H1("5. Activité-type 3 — Concevoir et développer une application multicouche sécurisée"),
  ...exemple(
    "5.1 Exemple — Conception, développement et déploiement de l'application",
    "J'ai conçu et développé l'application complète selon une architecture en couches (présentation, API, métier, persistance), en intégrant la sécurité et la qualité logicielle à chaque étape, et en organisant le travail en mode agile.",
    [
      "Organisation agile : rédaction du backlog, des User Stories et priorisation MoSCoW.",
      "Conception : diagrammes UML (cas d'utilisation, séquence, classes, état-transition, composants, déploiement).",
      "Développement de l'API REST avec FastAPI : authentification JWT, autorisations par rôle (RBAC), logique métier isolée et testable (calcul des jours ouvrés, contrôle des soldes, machine à états des demandes).",
      "Sécurité : hachage bcrypt des mots de passe, CORS restreint, validation des entrées, prise en compte de l'OWASP Top 10.",
      "Qualité : tests unitaires et d'intégration (pytest), tests front (Vitest).",
      "Déploiement : conteneurisation Docker (front, back, base) et intégration continue via GitHub Actions.",
    ],
    [
      "Collaborer à la gestion d'un projet informatique et à l'organisation de l'environnement de développement.",
      "Concevoir une application.",
      "Développer des composants métier côté serveur.",
      "Construire une application organisée en couches.",
      "Préparer et exécuter les plans de tests d'une application.",
      "Préparer et documenter le déploiement d'une application.",
    ],
  ),
  fill("[À COMPLÉTER éventuellement : décrivez la mise en place de la machine à états des demandes et son intérêt pour la cohérence métier.]"),
  pageBreak(),
];

const annexes = [
  H1("6. Titres, diplômes et annexes"),
  H2("Titres et diplômes"),
  fill("[À COMPLÉTER : listez vos diplômes et certifications éventuels.]"),
  H2("Curriculum Vitae"),
  fill("[À COMPLÉTER : joindre votre CV.]"),
  H2("Annexes techniques"),
  bullet("Dépôt GitHub du projet : [lien]."),
  bullet("Dossier Projet complet (mémoire) joint séparément."),
  bullet("Diagrammes, scripts SQL et documentation d'API dans le dépôt (dossier docs/)."),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "1B2A4A" },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2F59C2", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "2F59C2" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
      children: [ new TextRun({ text: "Dossier Professionnel — CDA   |   Page ", size: 18, color: "6B7785" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7785" }) ] }) ] }) },
    children: [ ...cover, ...honneur, ...presentation, ...synthese, ...at1, ...at2, ...at3, ...annexes ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/Dossier_Professionnel_CDA.docx", buf);
  console.log("OK Dossier_Professionnel_CDA.docx");
});
