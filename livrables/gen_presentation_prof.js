const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, Footer, PageNumber, ImageRun,
} = require("docx");

const CW = 9026;
const IMG_DIR = path.join(__dirname, "..", "docs", "diagrammes", "images");
const pngSize = (file) => { const x = fs.readFileSync(file); return { w: x.readUInt32BE(16), h: x.readUInt32BE(20) }; };
const dimg = (fig, legende, name) => {
  const file = path.join(IMG_DIR, name + ".png");
  const { w, h } = pngSize(file);
  const scale = Math.min(500 / w, 300 / h, 1);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w * scale), height: Math.round(h * scale) }, altText: { title: fig, description: legende, name } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 }, children: [new TextRun({ text: `${fig} — ${legende}`, italics: true, size: 17, color: "44505F" })] }),
  ];
};
const b = { style: BorderStyle.SINGLE, size: 1, color: "B7C3D0" };
const borders = { top: b, bottom: b, left: b, right: b };

const P = (t, o = {}) => new Paragraph({ spacing: { after: 110 }, ...o,
  children: Array.isArray(t) ? t : [new TextRun({ text: t, ...(o.run || {}) })] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const li = (t) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 50 }, children: Array.isArray(t) ? t : [new TextRun(t)] });

const tbl = (headers, rows, widths) => new Table({
  width: { size: CW, type: WidthType.DXA }, columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: "0B5394", type: ShadingType.CLEAR },
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] })],
    })) }),
    ...rows.map((r) => new TableRow({ children: r.map((c, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children: [new Paragraph({ children: Array.isArray(c) ? c : [new TextRun({ text: c, size: 19 })] })],
    })) })),
  ],
});

const ok = (t) => [new TextRun({ text: "✓ ", bold: true, color: "1E7E4F", size: 19 }), new TextRun({ text: t, size: 19 })];
const wip = (t) => [new TextRun({ text: "◐ ", bold: true, color: "C77A0A", size: 19 }), new TextRun({ text: t, size: 19 })];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "0A1A2F", font: "Cambria" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0B5394", space: 3 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: "0B5394", font: "Cambria" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, right: 1440, bottom: 1300, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
      children: [ new TextRun({ text: "CongésFlow — Présentation du projet   |   ", size: 16, color: "6B7785" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "6B7785" }) ] }) ] }) },
    children: [
      // En-tête
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "CongésFlow", bold: true, size: 40, color: "0B5394", font: "Cambria" })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Application web de gestion des demandes de congés", size: 22, italics: true, color: "44505F" })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Présentation du projet — État d'avancement", size: 18, color: "6B7785" })] }),
      tbl(["", ""], [
        ["Étudiant", "BOUNGOU MBIMI Gloire Bryan"],
        ["Formation", "Concepteur Développeur d'Applications (RNCP niveau 6) — ESTIAM"],
        ["Encadrant", "M'hand BOUFALA"],
        ["Date", "Juin 2026"],
      ], [2200, 6826]),

      H1("1. Contexte et problématique"),
      P("Dans de nombreuses PME, la gestion des congés repose encore sur des e-mails et des tableurs, ce qui génère des erreurs de soldes, des demandes non tracées et une absence de sécurité sur les données."),
      P([new TextRun({ text: "Problématique : ", bold: true }), new TextRun("comment fiabiliser et fluidifier la gestion des demandes de congés au sein d'une PME, tout en garantissant la sécurité des données et le respect des rôles de l'organisation ?")]),

      H1("2. Solution proposée"),
      P("CongésFlow est une application web où un salarié pose une demande de congé, son manager la valide ou la refuse, et le service RH pilote les soldes. L'application est sécurisée, testée et conteneurisée, et a été conçue pour couvrir les trois blocs de compétences du titre."),
      P([new TextRun({ text: "Trois rôles : ", bold: true }), new TextRun("Salarié (pose et suit ses demandes), Manager (valide les demandes de son équipe), RH (supervise et gère les soldes).")]),

      H1("3. Fonctionnalités développées"),
      tbl(["Module", "Fonctionnalités"], [
        ["Authentification", "Inscription, connexion par jeton JWT, gestion de 3 rôles (RBAC)"],
        ["Demandes (salarié)", "Création avec calcul automatique des jours ouvrés, contrôle du solde, consultation et annulation"],
        ["Validation (manager)", "Liste des demandes de l'équipe, validation / refus avec commentaire, mise à jour automatique du solde"],
        ["RH", "Vue de toutes les demandes, consultation et ajustement des soldes"],
        ["Règle métier centrale", "Machine à états de la demande : SOUMISE → VALIDÉE / REFUSÉE / ANNULÉE (transitions verrouillées)"],
      ], [2600, 6426]),

      H1("4. Choix techniques"),
      tbl(["Couche", "Technologies", "Justification"], [
        ["Front-end", "React, TypeScript, Tailwind, React Query", "Écosystème moderne, typage = qualité"],
        ["Back-end", "Python, FastAPI, SQLAlchemy", "Rapide, typé, documentation OpenAPI auto"],
        ["Base de données", "PostgreSQL", "Relationnel, intégrité des données"],
        ["Sécurité", "JWT, bcrypt, RBAC, validation Pydantic", "Standards éprouvés, OWASP"],
        ["Qualité / DevOps", "pytest, Vitest, Docker, GitHub Actions", "Tests, conteneurisation, CI/CD"],
      ], [1900, 3600, 3526]),

      H1("5. Aperçu de la modélisation"),
      P("La conception s'appuie sur dix diagrammes UML / Merise (contexte, cas d'utilisation, activité, séquence, état-transition, classes, MCD, objets, composants, déploiement). En voici deux représentatifs."),
      ...dimg("Fig.2", "Diagramme de cas d'utilisation", "02-cas-utilisation"),
      ...dimg("Fig.7", "Modèle conceptuel de données (MCD)", "07-mcd"),

      H1("6. État d'avancement"),
      H2("Réalisé"),
      li(ok("Application full-stack fonctionnelle (front + back + base de données)")),
      li(ok("Sécurité : authentification JWT, RBAC à 3 rôles, hachage bcrypt, requêtes préparées")),
      li(ok("Logique métier testée : 21 tests automatisés au vert (19 back + 2 front)")),
      li(ok("Conception : 10 diagrammes UML, MCD / MLD, script SQL")),
      li(ok("Industrialisation : Docker, docker-compose, pipeline CI GitHub Actions")),
      li(ok("Dossier projet (mémoire), Dossier Professionnel et support de soutenance rédigés")),
      H2("En cours / à finaliser"),
      li(wip("Insertion des captures d'écran et des maquettes Figma dans le dossier")),
      li(wip("Mise en ligne du code sur GitHub et déploiement de démonstration")),
      li(wip("Éventuelles améliorations selon vos recommandations (voir section 7)")),

      H1("7. Couverture des 3 blocs de compétences"),
      tbl(["Bloc", "Démonstration dans le projet"], [
        ["Bloc 1 — Front-end sécurisé", "SPA React/TypeScript responsive, routes protégées par rôle, consommation d'API REST"],
        ["Bloc 2 — Back-end sécurisé", "API REST FastAPI, PostgreSQL, JWT, RBAC, bcrypt, protection OWASP"],
        ["Bloc 3 — Conception & organisation", "Diagrammes UML, modèle de données, gestion agile, tests, Docker, CI/CD"],
      ], [3000, 6026]),

      H1("8. Points sur lesquels je souhaite votre avis"),
      P("Avant de poursuivre, je souhaiterais valider la direction du projet avec vous :"),
      li("Le périmètre fonctionnel est-il suffisant pour le niveau 6, ou faut-il l'enrichir ?"),
      li("La modélisation UML couvre-t-elle bien tous les diagrammes attendus ?"),
      li("Pour le Dossier Professionnel, dois-je utiliser le modèle officiel du centre ?"),
      li("Le niveau de sécurité (JWT + RBAC + bcrypt + OWASP) est-il jugé suffisant ?"),
      li("Quelles 1 ou 2 améliorations me conseillez-vous de prioriser sur le temps restant ?"),
      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Je reste à votre disposition pour une démonstration en direct de l'application.", italics: true, color: "44505F" })] }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/Presentation_Projet_CongesFlow.docx", buf);
  console.log("OK Presentation_Projet_CongesFlow.docx");
});
