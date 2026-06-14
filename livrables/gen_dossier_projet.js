const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, TableOfContents, PageNumber, PageBreak, Footer, ImageRun,
} = require("docx");

const CONTENT_W = 9026;
const IMG_DIR = path.join(__dirname, "..", "docs", "diagrammes", "images");
const SCREEN_DIR = path.join(__dirname, "..", "docs", "screenshots");
const MAQ_DIR = path.join(__dirname, "..", "docs", "maquettes");
const pngSize = (file) => { const b = fs.readFileSync(file); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const border = { style: BorderStyle.SINGLE, size: 1, color: "B7C3D0" };
const borders = { top: border, bottom: border, left: border, right: border };

const P = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts,
  children: Array.isArray(text) ? text : [new TextRun({ text, ...(opts.run || {}) })] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const bullet = (t) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60 },
  children: Array.isArray(t) ? t : [new TextRun(t)] });
const num = (t) => new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 60 }, children: Array.isArray(t) ? t : [new TextRun(t)] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const B = (t) => new TextRun({ text: t, bold: true });
const R = (t) => new TextRun(t);

const code = (caption, src) => {
  const lines = src.replace(/\t/g, "    ").split("\n");
  const cell = new TableCell({
    borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "D6DEE6" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "D6DEE6" }, left: { style: BorderStyle.SINGLE, size: 4, color: "0B5394" }, right: { style: BorderStyle.SINGLE, size: 1, color: "D6DEE6" } },
    width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill: "F6F8FA", type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 160, right: 120 },
    children: lines.map((l) => new Paragraph({ spacing: { after: 0, line: 230, lineRule: "auto" }, children: [new TextRun({ text: l.length ? l : " ", font: "Courier New", size: 16, color: "1B2A3A" })] })),
  });
  const out = [];
  if (caption) out.push(new Paragraph({ spacing: { after: 40, before: 60 }, children: [new TextRun({ text: caption, bold: true, size: 19, color: "0B5394" })] }));
  out.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], rows: [new TableRow({ children: [cell] })] }));
  out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return out;
};

const boxFactory = (color, fill, label) => (legende) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
  rows: [new TableRow({ children: [new TableCell({
    borders: { top: { style: BorderStyle.DASHED, size: 2, color }, bottom: { style: BorderStyle.DASHED, size: 2, color }, left: { style: BorderStyle.DASHED, size: 2, color }, right: { style: BorderStyle.DASHED, size: 2, color } },
    width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 160, right: 160 },
    children: [
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: label, bold: true, color })] }),
      new Paragraph({ children: [new TextRun({ text: legende, italics: true, color: "44505F" })] }),
    ],
  })] })],
});
const shot = boxFactory("0B5394", "EEF3FC", "📷  CAPTURE D'ÉCRAN À INSÉRER ICI");
const figma = boxFactory("B3267A", "FBEEF6", "🎨  MAQUETTE FIGMA À INSÉRER ICI");

const diagram = (fig, legende, fichier) => {
  const name = fichier.replace(/\.(mmd|puml)$/, "");
  const file = path.join(IMG_DIR, name + ".png");
  let imgPara;
  if (fs.existsSync(file)) {
    const { w, h } = pngSize(file);
    const scale = Math.min(560 / w, 360 / h, 1);
    imgPara = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w * scale), height: Math.round(h * scale) }, altText: { title: fig, description: legende, name } })] });
  } else imgPara = new Paragraph({ children: [new TextRun({ text: `[image manquante : ${name}.png]`, color: "B23A48" })] });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ borders, width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 140, right: 140 },
      children: [imgPara, new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${fig} — ${legende}`, italics: true, size: 18, color: "44505F" })] })] })] })] });
};

// Maquette Figma (repli sur le placeholder rose si absente)
const maquette = (fig, legende, fichier) => {
  const file = path.join(MAQ_DIR, fichier);
  if (!fs.existsSync(file)) return figma(`${fig} — ${legende}`);
  const { w, h } = pngSize(file);
  const scale = Math.min(560 / w, 620 / h, 1);
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ borders, width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 120, right: 120 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w * scale), height: Math.round(h * scale) }, altText: { title: fig, description: legende, name: fichier } })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${fig} — ${legende}`, italics: true, size: 18, color: "44505F" })] }),
      ] })] })] });
};

// Capture d'ecran reelle de l'application (repli sur le placeholder si absente)
const screenshot = (fig, legende, fichier) => {
  const file = path.join(SCREEN_DIR, fichier);
  if (!fs.existsSync(file)) return shot(`${fig} — ${legende}`);
  const { w, h } = pngSize(file);
  const scale = Math.min(560 / w, 620 / h, 1);
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ borders, width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 120, right: 120 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w * scale), height: Math.round(h * scale) }, altText: { title: fig, description: legende, name: fichier } })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${fig} — ${legende}`, italics: true, size: 18, color: "44505F" })] }),
      ] })] })] });
};

const tableau = (headers, rows, widths) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, shading: { fill: "0B5394", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 110, right: 110 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 19 })] })] })) }),
    ...rows.map((r) => new TableRow({ children: r.map((c, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 18 })] })] })) })),
  ],
});

// Fiche descriptive de cas d'utilisation (tableau 2 colonnes)
const ficheUC = (id, lignes) => [
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: id, bold: true, size: 21, color: "0B5394" })] }),
  new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [2400, 6626],
    rows: lignes.map(([k, v]) => new TableRow({ children: [
      new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "EEF3FC", type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 110, right: 110 }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 18 })] })] }),
      new TableCell({ borders, width: { size: 6626, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 110, right: 110 }, children: v.split("\n").map((l) => new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: l, size: 18 })] })) }),
    ] })) }),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
];

// =====================================================================
//  PAGE DE COUVERTURE / LIMINAIRES
// =====================================================================
const cover = [
  new Paragraph({ spacing: { before: 900, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ESTIAM", bold: true, size: 36, color: "0B5394" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: "Dossier Projet — Mémoire de fin d'études", size: 24, color: "44505F" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "CongésFlow", bold: true, size: 56 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Application web de gestion des demandes de congés", size: 26, italics: true, color: "44505F" })] }),
  tableau(["Rubrique", "Information"], [
    ["Titre visé", "Concepteur Développeur d'Applications (RNCP niveau 6)"],
    ["Nom et prénom", "[À COMPLÉTER]"],
    ["Classe et spécialité", "CDA — promotion 2025-2026"],
    ["Encadrant", "M'hand BOUFALA"],
    ["Année scolaire", "2025-2026"],
    ["Session d'examen", "Septembre 2026"],
    ["Dépôt GitHub", "https://github.com/glo007/congesflow"],
    ["Application en ligne", "https://congesflow-web.onrender.com"],
  ], [3200, 5826]),
  pageBreak(),
];

const remerciements = [
  H1("Remerciements"),
  P("Je tiens à remercier mon encadrant, M'hand BOUFALA, pour son accompagnement et ses conseils tout au long de ce projet. Je remercie également l'ensemble de l'équipe pédagogique de l'ESTIAM pour la qualité de la formation dispensée, ainsi que toutes les personnes qui, de près ou de loin, ont contribué à la réalisation de ce travail et m'ont soutenu durant cette période."),
  pageBreak(),
];

const resume = [
  H1("Résumé"),
  P("Contexte. Dans de nombreuses petites et moyennes entreprises, la gestion des congés repose encore sur des outils non spécialisés (messagerie électronique, tableurs partagés). Cette organisation manuelle est source d'erreurs de calcul des soldes, de pertes de demandes, d'un manque de traçabilité des décisions et d'une absence de sécurité des données à caractère personnel."),
  P("Objectifs. CongésFlow est une application web qui digitalise ce processus de bout en bout : un salarié pose une demande de congé, son responsable hiérarchique la valide ou la refuse, et le service des ressources humaines pilote les soldes. L'application devait être sécurisée, testée, documentée et déployable de façon reproductible."),
  P("Résultats. Le projet a abouti à une application full-stack fonctionnelle (React + TypeScript en front-end, FastAPI + PostgreSQL en back-end) couvrant les trois blocs de compétences du titre Concepteur Développeur d'Applications : une interface front-end responsive et sécurisée, une API REST robuste protégée par une authentification à jeton et un contrôle d'accès par rôle, et une démarche de conception complète (modélisation UML et Merise, tests automatisés, intégration continue, conteneurisation Docker). Le projet est accompagné de vingt-et-un tests automatisés, tous au vert, et d'une documentation d'API générée automatiquement."),
  P("Mots-clés : gestion des congés, application web, React, FastAPI, PostgreSQL, sécurité, JWT, RBAC, API REST, Docker, intégration continue, UML, Merise.", { run: { italics: true } }),
  H2("Abstract (English)"),
  P("Context. In many small and medium-sized companies, leave management still relies on non-specialised tools such as email and shared spreadsheets, leading to balance miscalculations, lost requests, lack of traceability and poor data security."),
  P("Objectives and results. CongésFlow is a web application that fully digitalises this process: an employee submits a leave request, their manager approves or rejects it, and the HR department manages balances. The project resulted in a working full-stack application (React + TypeScript, FastAPI + PostgreSQL) covering the three skill blocks of the certification: a secure responsive front-end, a robust REST API protected by token-based authentication and role-based access control, and a complete engineering approach (UML and Merise modelling, automated tests, continuous integration, Docker containerisation). It includes twenty-one automated tests, all passing, and automatically generated API documentation."),
  P("Keywords: leave management, web application, React, FastAPI, PostgreSQL, security, JWT, RBAC, REST API, Docker, continuous integration, UML, Merise.", { run: { italics: true } }),
  pageBreak(),
];

const sommaire = [
  H1("Sommaire"),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-3" }),
  P("(Dans Word : clic droit sur le sommaire → « Mettre à jour les champs » → « Mettre à jour toute la table » pour générer la pagination.)", { run: { italics: true, size: 18, color: "6B7785" } }),
  pageBreak(),
];

const figures = [
  H1("Liste des figures"),
  tableau(["Réf.", "Figure", "Type"], [
    ["Fig.1", "Diagramme de contexte", "UML"],
    ["Fig.2", "Diagramme de cas d'utilisation", "UML"],
    ["Fig.3", "Diagramme d'activité — créer une demande", "UML"],
    ["Fig.4", "Diagramme de séquence — créer une demande", "UML"],
    ["Fig.5", "Diagramme d'état-transition — demande de congé", "UML"],
    ["Fig.6", "Diagramme de classes", "UML"],
    ["Fig.7", "Modèle conceptuel de données (MCD)", "Merise"],
    ["Fig.8", "Diagramme d'objets", "UML"],
    ["Fig.9", "Diagramme de composants", "UML"],
    ["Fig.10", "Diagramme de déploiement", "UML"],
    ["Fig.11 à 12", "Maquettes Figma (connexion, tableau de bord)", "Maquette"],
    ["Fig.13 à 18", "Captures d'écran de l'application et des tests", "Capture"],
  ], [1300, 5726, 2000]),
  pageBreak(),
];

const intro = [
  H1("Introduction générale"),
  P("La transformation numérique des entreprises a profondément modifié la manière dont les processus internes sont gérés. La dématérialisation, l'automatisation et la sécurisation des échanges sont devenues des standards attendus, y compris dans les structures de taille modeste. Parmi les processus les plus universels figure la gestion des absences et des congés : elle concerne l'ensemble des salariés, mobilise quotidiennement l'encadrement et engage la responsabilité du service des ressources humaines."),
  P("Pourtant, de nombreuses petites et moyennes entreprises continuent de gérer ce processus avec des outils inadaptés. Les demandes circulent par courrier électronique, les soldes sont tenus dans des tableurs recalculés à la main, et les validations ne laissent aucune trace exploitable. Il en résulte des erreurs, des litiges et une exposition des données personnelles."),
  H2("Problématique"),
  P("Comment concevoir et développer une application web permettant de fiabiliser et de fluidifier la gestion des demandes de congés au sein d'une PME, tout en garantissant la sécurité des données personnelles et le respect des rôles de l'organisation ?"),
  H2("Objectifs du projet"),
  P("Pour répondre à cette problématique, quatre objectifs ont été fixés :"),
  num("Offrir au salarié un parcours de demande simple, guidé et accessible, lui permettant de connaître son solde et l'historique de ses demandes."),
  num("Automatiser les règles métier sensibles, en particulier le calcul des jours ouvrés et le contrôle du solde, afin de supprimer les erreurs manuelles."),
  num("Fournir à l'encadrement un workflow de validation clair, tracé et restreint à son périmètre d'équipe."),
  num("Garantir la sécurité de l'application : authentification, autorisations par rôle, protection des données et des échanges."),
  H2("Méthodologie"),
  P("Le projet a été conduit selon une démarche agile itérative inspirée du cadre Scrum, complétée par une visualisation Kanban du flux de travail. Les besoins ont été formalisés sous forme de User Stories, priorisées par la méthode MoSCoW, puis développées par incréments. Chaque fonctionnalité a été conçue (diagrammes), développée, puis systématiquement couverte par des tests automatisés avant d'être considérée comme terminée (définition du « fini »)."),
  H2("Structure du mémoire"),
  P("Ce mémoire est organisé en quatre chapitres. Le premier présente le contexte, l'état de l'art et le positionnement du projet. Le deuxième détaille l'analyse des besoins et la conception (gestion de projet, cas d'utilisation, modélisation des données, architecture, API, interface). Le troisième décrit la réalisation technique (environnement, organisation du code, modules développés, sécurité mise en œuvre). Le quatrième présente la stratégie de tests, les résultats et la validation. Une conclusion, une section de veille technologique, un glossaire, une bibliographie et des annexes complètent le document."),
  pageBreak(),
];

// =====================================================================
//  CHAPITRE 1
// =====================================================================
const chap1 = [
  H1("Chapitre 1 — Contexte et état de l'art"),
  H2("1.1 Présentation du domaine"),
  P("Le projet s'inscrit dans le domaine de la digitalisation des processus de gestion des ressources humaines, communément regroupés sous l'acronyme SIRH (Système d'Information de gestion des Ressources Humaines). Ce domaine recouvre la paie, la gestion des temps et des activités, le recrutement, la formation et la gestion des absences."),
  P("La gestion des congés y occupe une place singulière. Elle est récurrente (chaque salarié pose plusieurs demandes par an), réglementée (le Code du travail encadre l'acquisition et la prise des congés payés), et transversale, puisqu'elle implique trois acteurs aux intérêts parfois divergents : le salarié, qui souhaite poser ses congés librement ; le manager, qui doit assurer la continuité de service de son équipe ; et le service RH, qui garantit la conformité réglementaire et l'exactitude des compteurs."),
  P("Les enjeux actuels du domaine sont la dématérialisation (suppression du papier et des échanges informels par courriel), la traçabilité (être capable de justifier qui a demandé, validé ou refusé quoi, et quand), la fiabilité des calculs (jours décomptés, soldes acquis et pris) et la protection des données à caractère personnel."),
  H2("1.2 Cadre réglementaire et contraintes métier"),
  P("Plusieurs règles métier structurent la gestion des congés et ont guidé la conception de l'application :"),
  bullet([B("Jours ouvrés et jours ouvrables : "), R("on distingue les jours ouvrés (du lundi au vendredi) des jours ouvrables (du lundi au samedi). CongésFlow décompte par défaut les jours ouvrés, en excluant les samedis et dimanches.")]),
  bullet([B("Solde de congés : "), R("chaque salarié dispose d'un solde par type d'absence et par année (par exemple vingt-cinq jours de congés payés et dix jours de RTT). Le solde restant correspond aux jours acquis diminués des jours pris.")]),
  bullet([B("Validation hiérarchique : "), R("une demande n'est effective qu'après validation du responsable, qui peut aussi la refuser en motivant sa décision.")]),
  bullet([B("Protection des données (RGPD) : "), R("les données traitées (identité, e-mail, absences) sont des données personnelles. Leur accès doit être restreint selon le rôle, et les mots de passe ne doivent jamais être stockés en clair.")]),
  H2("1.3 Étude des solutions existantes"),
  P("Trois grandes familles de solutions coexistent sur le marché de la gestion des congés."),
  P([B("Les SIRH complets "), R("(Lucca, PayFit, Kelio, Eurécia) couvrent l'ensemble du périmètre RH. Ils sont riches fonctionnellement (paie, notes de frais, entretiens, congés) et bien sécurisés, mais leur coût et leur complexité de mise en œuvre sont élevés, souvent disproportionnés pour une TPE/PME qui ne cherche qu'à gérer les absences.")]),
  P([B("Les applications spécialisées "), R("dans la gestion des absences sont plus légères et abordables, mais restent des solutions SaaS propriétaires : l'entreprise ne maîtrise ni l'hébergement de ses données, ni les évolutions du produit.")]),
  P([B("Les solutions « maison » à base de tableurs "), R("partagés (Microsoft Excel, Google Sheets) sont encore très répandues. Gratuites et flexibles, elles n'offrent en revanche aucune sécurité (toute personne ayant accès au fichier peut tout modifier), aucune fiabilité (les soldes sont recalculés manuellement) et aucune traçabilité des validations.")]),
  H2("1.4 Comparaison des solutions"),
  P("Le tableau suivant compare ces familles de solutions selon les critères les plus pertinents pour une PME."),
  tableau(["Critère", "SIRH complet", "Tableur partagé", "CongésFlow"], [
    ["Coût pour une PME", "Élevé (abonnement par salarié)", "Gratuit", "Auto-hébergé, faible"],
    ["Périmètre fonctionnel", "Très large (souvent surdimensionné)", "Très limité", "Ciblé sur le besoin"],
    ["Sécurité / droits d'accès", "Forte", "Quasi inexistante", "JWT + RBAC + OWASP"],
    ["Calcul automatique des soldes", "Oui", "Non (manuel, erreurs)", "Oui"],
    ["Workflow de validation", "Intégré", "Par e-mail, non tracé", "Tracé (machine à états)"],
    ["Traçabilité des décisions", "Oui", "Non", "Oui (valideur, commentaire)"],
    ["Maîtrise / hébergement", "Limitée (SaaS)", "Totale mais artisanale", "Totale (conteneurs Docker)"],
  ], [2100, 2400, 2300, 2226]),
  H2("1.5 Analyse critique"),
  P("Les SIRH du marché sont puissants mais coûteux et souvent surdimensionnés pour une petite structure dont le seul besoin est de gérer les congés. À l'opposé, le tableur partagé est gratuit et flexible mais ne garantit ni la sécurité, ni la fiabilité, ni la traçabilité. Entre ces deux extrêmes, il existe un espace pour une solution intermédiaire : légère, ciblée sur un besoin précis, sécurisée selon les standards actuels, et maîtrisable en interne grâce à un déploiement conteneurisé."),
  P("C'est précisément ce vide que CongésFlow entend combler, en se concentrant sur un parcours métier unique et bien traité plutôt que sur une couverture fonctionnelle exhaustive."),
  H2("1.6 Choix de la solution, valeur ajoutée et objectifs spécifiques"),
  P("CongésFlow se positionne comme un outil métier interne pour PME. Sa valeur ajoutée repose sur trois piliers : un workflow de validation clair et tracé, le calcul automatique des jours ouvrés et des soldes, et une gestion fine des rôles. Le périmètre est volontairement resserré autour d'un parcours central — poser une demande, la faire valider — afin de garantir la qualité et la robustesse plutôt que l'étendue."),
  P("Les objectifs spécifiques mesurables du projet sont : (1) une authentification sécurisée par jeton ; (2) un parcours complet de demande avec calcul automatique et contrôle du solde ; (3) un espace de validation managériale restreint au périmètre d'équipe ; (4) un pilotage des soldes par le service RH ; (5) une couverture de tests automatisés sur la logique métier critique ; (6) un déploiement reproductible par conteneurs."),
  pageBreak(),
];

// =====================================================================
//  CHAPITRE 2
// =====================================================================
const chap2 = [
  H1("Chapitre 2 — Analyse et conception"),

  H2("2.1 Démarche de gestion de projet (agile)"),
  P("Le projet a été organisé selon une approche agile inspirée de Scrum, adaptée à un développeur unique. Les besoins ont été exprimés sous forme de User Stories regroupées dans un Product Backlog, priorisées, estimées en points de complexité (story points selon la suite de Fibonacci), puis réparties en incréments."),
  H3("2.1.1 Product Backlog et priorisation MoSCoW"),
  P("La méthode MoSCoW a permis de distinguer ce qui devait absolument être livré (Must) de ce qui pouvait être différé (Should, Could) ou explicitement exclu (Won't). Cette priorisation a été déterminante pour tenir le périmètre."),
  tableau(["ID", "User Story", "Priorité", "Estimation"], [
    ["US1", "S'inscrire et se connecter (JWT)", "Must", "5 pts"],
    ["US2", "Poser une demande de congé", "Must", "8 pts"],
    ["US3", "Consulter mon solde et mes demandes", "Must", "3 pts"],
    ["US4", "Annuler une demande", "Must", "3 pts"],
    ["US5", "Voir les demandes de mon équipe (manager)", "Must", "5 pts"],
    ["US6", "Valider / refuser une demande (manager)", "Must", "5 pts"],
    ["US7", "Gérer les soldes (RH)", "Must", "5 pts"],
    ["US8", "Calendrier d'équipe et chevauchements", "Should", "8 pts"],
    ["US9", "Tableau de bord RH (indicateurs)", "Should", "5 pts"],
    ["US10", "Notifications par e-mail", "Could", "5 pts"],
    ["US11", "Gestion des jours fériés", "Could", "3 pts"],
  ], [700, 4626, 1600, 2100]),
  H3("2.1.2 Découpage en sprints"),
  P("Le développement a été découpé en incréments courts, chacun produisant une partie fonctionnelle et testée de l'application :"),
  bullet([B("Sprint 0 — Cadrage : "), R("expression des besoins, choix techniques, maquettes Figma, mise en place du dépôt Git et de l'environnement.")]),
  bullet([B("Sprint 1 — Socle back-end : "), R("modèles de données, authentification JWT, contrôle d'accès par rôle, logique métier (jours ouvrés, soldes, machine à états) et tests unitaires.")]),
  bullet([B("Sprint 2 — API et intégration : "), R("endpoints REST (demandes, soldes), tests d'intégration, documentation OpenAPI.")]),
  bullet([B("Sprint 3 — Front-end : "), R("authentification, parcours de demande, espace salarié, puis espace de validation manager.")]),
  bullet([B("Sprint 4 — Industrialisation : "), R("conteneurisation Docker, pipeline d'intégration continue, finalisation de la documentation.")]),
  H3("2.1.3 Outils de suivi et de collaboration"),
  P("Le suivi des tâches a été assuré par un tableau Kanban (colonnes À faire / En cours / En revue / Terminé). Le versionnement du code a suivi une stratégie de branches (voir chapitre 3) et chaque incrément a été validé par l'exécution automatique des tests via l'intégration continue."),

  H3("2.1.4 Adaptation de la méthode agile à un projet individuel"),
  P("Le projet ayant été mené seul, la méthode agile a été adaptée : il s'agit d'une approche « Scrumban » (un Scrum allégé, piloté au quotidien par un tableau Kanban). J'ai endossé l'ensemble des rôles et remplacé les cérémonies collectives par des équivalents adaptés au travail individuel. Assumer cette adaptation fait partie de la démarche : elle démontre la compréhension des principes agiles autant que leur mise en œuvre."),
  P("Rôles endossés :", { run: { bold: true } }),
  tableau(["Rôle Scrum", "Assuré par", "En pratique sur le projet"], [
    ["Product Owner", "Le candidat", "Rédaction et priorisation du backlog (MoSCoW), arbitrage du périmètre"],
    ["Scrum Master", "Le candidat", "Organisation du travail, suivi du Kanban, levée des obstacles techniques"],
    ["Équipe de développement", "Le candidat", "Conception, développement, tests et documentation"],
  ], [2300, 1900, 4826]),
  P("Adaptation des cérémonies :", { run: { bold: true } }),
  tableau(["Cérémonie Scrum (équipe)", "Adaptation au contexte individuel"], [
    ["Daily meeting", "Point d'avancement personnel quotidien et mise à jour du tableau Kanban"],
    ["Sprint planning", "Sélection des User Stories de l'itération depuis le backlog priorisé"],
    ["Sprint review", "Vérification de la « Definition of Done » et démonstration à l'encadrant"],
    ["Rétrospective", "Bilan personnel écrit en fin de projet (voir ci-dessous)"],
  ], [3300, 5726]),
  P("Definition of Done (définition du « terminé ») — une User Story est considérée comme terminée lorsque :", { run: { bold: true } }),
  bullet("le code de la fonctionnalité est écrit et fonctionnel ;"),
  bullet("il est couvert par des tests automatisés qui passent ;"),
  bullet("il est documenté (commentaires utiles, documentation mise à jour si nécessaire) ;"),
  bullet("il est versionné sur sa branche et intégré après succès de l'intégration continue."),
  P("Rétrospective de fin de projet :", { run: { bold: true } }),
  tableau(["Ce qui a bien fonctionné", "Difficultés rencontrées", "Axes d'amélioration"], [
    ["Découpage en User Stories testées ; la priorisation MoSCoW a permis de tenir le périmètre dans les délais.", "Incompatibilités de versions de dépendances ; cohérence des statuts de demande à garantir.", "Mettre en place le déploiement plus tôt ; ajouter des tests end-to-end (Playwright)."],
  ], [3008, 3008, 3010]),

  H2("2.2 Analyse du besoin (besoins fonctionnels)"),
  P("Les grandes fonctionnalités sont représentées par le diagramme de cas d'utilisation, qui identifie les acteurs et leurs interactions avec le système."),
  diagram("Fig.2", "Diagramme de cas d'utilisation", "02-cas-utilisation.puml"),
  P(""),
  P("Trois acteurs principaux ont été identifiés, organisés selon une relation d'héritage : le manager dispose de toutes les capacités du salarié, et le service RH de toutes celles du manager."),
  tableau(["Acteur", "Rôle et responsabilités"], [
    ["Salarié", "Pose des demandes de congé, consulte son solde et l'historique de ses demandes, annule une demande."],
    ["Manager", "Toutes les actions du salarié, plus la consultation et la validation/refus des demandes de son équipe."],
    ["RH / Administrateur", "Toutes les actions précédentes, plus la supervision globale et la gestion des soldes des employés."],
  ], [2400, 6626]),

  H3("2.2.1 Spécifications détaillées des cas d'utilisation"),
  P("Les cas d'utilisation les plus importants sont décrits ci-dessous selon un format normalisé (acteurs, préconditions, flux nominal, flux alternatifs, postconditions)."),
  ...ficheUC("UC01 — S'authentifier", [
    ["Acteur principal", "Visiteur (futur Salarié, Manager ou RH)"],
    ["Préconditions", "Le visiteur possède un compte (email + mot de passe)."],
    ["Flux nominal", "1. Le visiteur saisit son e-mail et son mot de passe.\n2. Le système vérifie l'existence du compte.\n3. Le système compare le mot de passe au hachage stocké.\n4. Le système génère un jeton JWT signé et le renvoie.\n5. Le client stocke le jeton et accède à l'application."],
    ["Flux alternatifs", "3a. Identifiants incorrects → message d'erreur (HTTP 401), pas de jeton."],
    ["Postconditions", "Le visiteur est authentifié ; ses requêtes suivantes portent le jeton."],
  ]),
  ...ficheUC("UC02 — Poser une demande de congé", [
    ["Acteur principal", "Salarié"],
    ["Préconditions", "Le salarié est authentifié et possède un solde pour le type d'absence."],
    ["Flux nominal", "1. Le salarié saisit le type, la date de début, la date de fin et un motif.\n2. Le système contrôle la cohérence des dates.\n3. Le système calcule le nombre de jours ouvrés.\n4. Le système vérifie que le solde restant est suffisant.\n5. Le système enregistre la demande au statut SOUMISE."],
    ["Flux alternatifs", "2a. Date de fin antérieure à la date de début → erreur 400.\n3a. Aucun jour ouvré sur la période → erreur 400.\n4a. Solde insuffisant → erreur 400 avec le détail du solde."],
    ["Postconditions", "Une demande au statut SOUMISE est créée et visible du manager."],
  ]),
  ...ficheUC("UC03 — Valider ou refuser une demande", [
    ["Acteur principal", "Manager (ou RH)"],
    ["Préconditions", "Le manager est authentifié ; la demande appartient à un membre de son équipe et est au statut SOUMISE."],
    ["Flux nominal", "1. Le manager consulte les demandes de son équipe.\n2. Il choisit de valider (ou refuser, avec commentaire).\n3. Le système vérifie que la transition d'état est autorisée.\n4. En cas de validation, le système décrémente le solde du salarié.\n5. Le système met à jour le statut et enregistre le valideur."],
    ["Flux alternatifs", "3a. La demande n'est pas au statut SOUMISE → erreur 409 (transition invalide).\n4a. Solde devenu insuffisant → erreur 400."],
    ["Postconditions", "La demande passe au statut VALIDEE ou REFUSEE ; le solde est mis à jour si validée."],
  ]),
  ...ficheUC("UC04 — Gérer les soldes (RH)", [
    ["Acteur principal", "RH / Administrateur"],
    ["Préconditions", "L'utilisateur est authentifié avec le rôle RH."],
    ["Flux nominal", "1. Le RH consulte la liste des employés.\n2. Il sélectionne un employé et un type d'absence.\n3. Il ajuste le nombre de jours acquis.\n4. Le système enregistre le nouveau solde."],
    ["Flux alternatifs", "1a. Un utilisateur non RH tente d'accéder → erreur 403."],
    ["Postconditions", "Le solde de l'employé est mis à jour."],
  ]),
  P("Les autres cas d'utilisation (consulter son solde, consulter ses demandes, annuler une demande) suivent la même logique et figurent dans le backlog."),

  H2("2.3 Besoins non fonctionnels"),
  P("Au-delà des fonctionnalités, plusieurs exigences de qualité ont structuré la conception :"),
  tableau(["Catégorie", "Exigence"], [
    ["Sécurité", "Authentification par jeton (JWT), hachage des mots de passe (bcrypt), contrôle d'accès par rôle (RBAC), requêtes préparées, protection OWASP Top 10."],
    ["Performance", "API asynchrone (FastAPI/Starlette), index sur les colonnes fréquemment filtrées (email, statut)."],
    ["Maintenabilité", "Architecture en couches, logique métier isolée et testable, typage statique (TypeScript, Pydantic)."],
    ["Fiabilité", "Tests unitaires et d'intégration automatisés exécutés à chaque modification (intégration continue)."],
    ["Portabilité", "Application conteneurisée (Docker), indépendante du système hôte."],
    ["Utilisabilité", "Interface responsive, parcours principal réalisable en moins de trois clics."],
  ], [2200, 6826]),

  H2("2.4 Modélisation UML"),
  P("La conception comportementale et dynamique s'appuie sur plusieurs diagrammes UML, dont les sources (Mermaid et PlantUML) sont versionnées dans le dépôt."),
  P("Le diagramme de contexte situe le système et ses acteurs dans leur environnement."),
  diagram("Fig.1", "Diagramme de contexte", "01-contexte.puml"),
  P(""),
  P("Le diagramme d'activité décrit le flux de contrôle lors de la création d'une demande, avec ses points de décision successifs (validité des dates, présence de jours ouvrés, suffisance du solde)."),
  diagram("Fig.3", "Diagramme d'activité — création d'une demande", "03-activite-demande.mmd"),
  P(""),
  P("Le diagramme de séquence détaille les échanges chronologiques entre l'interface, l'API, la couche de sécurité et la base de données lors d'une création de demande."),
  diagram("Fig.4", "Diagramme de séquence — création d'une demande", "04-sequence-creation.mmd"),
  P(""),
  P("Le diagramme d'état-transition modélise le cycle de vie d'une demande. Il s'agit de la règle métier centrale du projet : seules certaines transitions sont autorisées, ce qui prévient les incohérences telles que la validation d'une demande déjà refusée."),
  diagram("Fig.5", "Diagramme d'état-transition — demande de congé", "05-etat-demande.mmd"),
  P(""),
  P("Le diagramme de classes présente le modèle de domaine et les relations entre les entités."),
  diagram("Fig.6", "Diagramme de classes", "06-classes.mmd"),
  P(""),
  P("Enfin, le diagramme d'objets illustre un instantané concret du système (un salarié ayant posé une demande validée par son manager). Il figure en annexe."),

  H2("2.5 Conception de la base de données"),
  P("La modélisation des données suit la démarche Merise, qui décline le modèle conceptuel (MCD), le modèle logique (MLD) et le modèle physique (MPD/SQL)."),
  H3("2.5.1 Modèle conceptuel de données (MCD)"),
  diagram("Fig.7", "Modèle conceptuel de données (MCD)", "07-mcd.mmd"),
  P(""),
  P("Cinq entités ont été identifiées : Service, Employé, TypeAbsence, SoldeConge et DemandeConge. Les relations notables sont : un service regroupe plusieurs employés ; un employé peut être le manager de plusieurs autres (relation réflexive) ; un employé pose plusieurs demandes et possède plusieurs soldes ; une demande et un solde portent chacun sur un type d'absence."),
  H3("2.5.2 Modèle logique de données (MLD)"),
  P("Le passage au modèle logique traduit les entités en tables et les relations en clés étrangères. Les relations « plusieurs à plusieurs » potentielles sont résolues, et chaque solde est identifié par la combinaison employé / type / année."),
  ...code(null,
    "service(id, nom)\n" +
    "type_absence(id, code, libelle)\n" +
    "employe(id, nom, prenom, email, mot_de_passe_hash, role,\n" +
    "        date_embauche, #service_id, #manager_id)\n" +
    "solde_conge(id, #employe_id, #type_absence_id, annee,\n" +
    "            jours_acquis, jours_pris)\n" +
    "demande_conge(id, #employe_id, #type_absence_id, date_debut,\n" +
    "              date_fin, nb_jours_ouvres, motif, statut,\n" +
    "              commentaire_manager, #valideur_id,\n" +
    "              created_at, updated_at)"),
  H3("2.5.3 Dictionnaire de données"),
  P("Le dictionnaire de données recense, pour chaque attribut, son type, ses contraintes et sa signification."),
  tableau(["Table.attribut", "Type", "Contraintes", "Description"], [
    ["employe.id", "SERIAL", "PK", "Identifiant unique de l'employé"],
    ["employe.email", "VARCHAR(180)", "UNIQUE, NOT NULL", "Adresse e-mail (identifiant de connexion)"],
    ["employe.mot_de_passe_hash", "VARCHAR(255)", "NOT NULL", "Empreinte bcrypt du mot de passe"],
    ["employe.role", "VARCHAR(20)", "CHECK (SALARIE/MANAGER/RH)", "Rôle applicatif"],
    ["employe.manager_id", "INTEGER", "FK → employe.id", "Responsable hiérarchique (réflexif)"],
    ["solde_conge.annee", "INTEGER", "NOT NULL", "Année de référence du solde"],
    ["solde_conge.jours_acquis", "NUMERIC(5,1)", "CHECK ≥ 0", "Jours acquis pour l'année"],
    ["solde_conge.jours_pris", "NUMERIC(5,1)", "CHECK ≥ 0", "Jours déjà consommés"],
    ["demande_conge.date_debut", "DATE", "NOT NULL", "Premier jour d'absence"],
    ["demande_conge.date_fin", "DATE", "NOT NULL, ≥ date_debut", "Dernier jour d'absence"],
    ["demande_conge.nb_jours_ouvres", "NUMERIC(5,1)", "CHECK > 0", "Jours ouvrés décomptés"],
    ["demande_conge.statut", "VARCHAR(20)", "CHECK (4 valeurs)", "État de la machine à états"],
    ["demande_conge.valideur_id", "INTEGER", "FK → employe.id", "Auteur de la décision"],
  ], [2700, 1700, 2300, 2326]),
  H3("2.5.4 Normalisation"),
  P("Le modèle respecte les trois premières formes normales :"),
  bullet([B("1NF : "), R("chaque attribut est atomique (pas de liste ni de groupe répétitif dans une colonne).")]),
  bullet([B("2NF : "), R("chaque attribut non clé dépend de la totalité de la clé. Par exemple, le solde dépend bien du triplet (employé, type, année).")]),
  bullet([B("3NF : "), R("aucun attribut non clé ne dépend d'un autre attribut non clé. Le libellé d'un type d'absence est stocké dans sa propre table plutôt que répété dans chaque demande.")]),
  H3("2.5.5 Modèle physique (SQL)"),
  P("Le modèle physique génère le code SQL exécutable pour PostgreSQL. Extrait de la table centrale, avec ses contraintes d'intégrité :"),
  ...code("Extrait — création de la table demande_conge (PostgreSQL)",
    "CREATE TABLE demande_conge (\n" +
    "    id               SERIAL PRIMARY KEY,\n" +
    "    employe_id       INTEGER NOT NULL REFERENCES employe(id),\n" +
    "    type_absence_id  INTEGER NOT NULL REFERENCES type_absence(id),\n" +
    "    date_debut       DATE NOT NULL,\n" +
    "    date_fin         DATE NOT NULL,\n" +
    "    nb_jours_ouvres  NUMERIC(5,1) NOT NULL CHECK (nb_jours_ouvres > 0),\n" +
    "    statut           VARCHAR(20) NOT NULL DEFAULT 'SOUMISE'\n" +
    "        CHECK (statut IN ('SOUMISE','VALIDEE','REFUSEE','ANNULEE')),\n" +
    "    valideur_id      INTEGER REFERENCES employe(id),\n" +
    "    created_at       TIMESTAMP NOT NULL DEFAULT now(),\n" +
    "    CONSTRAINT chk_dates CHECK (date_fin >= date_debut)\n" +
    ");\n\n" +
    "CREATE INDEX idx_demande_employe ON demande_conge(employe_id);\n" +
    "CREATE INDEX idx_demande_statut  ON demande_conge(statut);"),
  P("Les contraintes CHECK déportent une partie des règles métier au niveau de la base, garantissant la cohérence même en cas d'accès direct : un nombre de jours strictement positif, un statut appartenant à l'énumération autorisée, et une date de fin postérieure ou égale à la date de début. Les index accélèrent les filtres les plus fréquents."),

  H2("2.6 Architecture technique"),
  P("L'application adopte une architecture client-serveur organisée en couches. Cette séparation des responsabilités facilite la maintenance et les tests : chaque couche peut évoluer indépendamment des autres."),
  bullet([B("Couche présentation : "), R("application monopage (SPA) React, exécutée dans le navigateur.")]),
  bullet([B("Couche API : "), R("interface REST/JSON exposée par FastAPI, qui valide les entrées et applique la sécurité.")]),
  bullet([B("Couche métier : "), R("fonctions pures regroupant les règles (jours ouvrés, soldes, transitions d'état), sans dépendance à l'infrastructure.")]),
  bullet([B("Couche persistance : "), R("ORM SQLAlchemy assurant le mapping objet-relationnel et la base PostgreSQL.")]),
  diagram("Fig.9", "Diagramme de composants", "09-composants.puml"),
  P(""),
  diagram("Fig.10", "Diagramme de déploiement (conteneurs Docker)", "10-deploiement.puml"),
  P(""),
  P("Justification des principaux choix technologiques :"),
  tableau(["Couche", "Technologie retenue", "Justification"], [
    ["Front-end", "React + TypeScript + Vite", "Écosystème mature, typage statique réduisant les bugs, démarrage et rechargement rapides"],
    ["Style", "Tailwind CSS", "Mise en page responsive cohérente et rapide à produire"],
    ["État serveur", "React Query (TanStack)", "Cache, synchronisation et gestion des requêtes API"],
    ["Back-end", "Python + FastAPI", "Performant (asynchrone), typé (Pydantic), documentation OpenAPI automatique"],
    ["ORM", "SQLAlchemy", "Mapping objet-relationnel, requêtes préparées (anti-injection)"],
    ["Base de données", "PostgreSQL", "SGBD relationnel robuste, intégrité référentielle, contraintes avancées"],
    ["Sécurité", "python-jose, passlib/bcrypt", "JWT signé et hachage éprouvé des mots de passe"],
    ["Tests", "pytest, Vitest", "Tests unitaires et d'intégration côté back et front"],
    ["DevOps", "Docker, GitHub Actions", "Conteneurisation et intégration continue"],
  ], [1700, 3000, 4326]),

  H2("2.7 Conception de l'API REST"),
  P("L'API suit les principes REST : des ressources nommées, des verbes HTTP standards et des codes de retour normalisés. Le tableau ci-dessous décrit les endpoints principaux."),
  tableau(["Méthode", "Endpoint", "Rôle requis", "Description / retour"], [
    ["POST", "/api/auth/register", "public", "Création de compte → 201"],
    ["POST", "/api/auth/login", "public", "Connexion → 200 + jeton JWT"],
    ["GET", "/api/auth/me", "authentifié", "Profil de l'utilisateur courant"],
    ["POST", "/api/demandes", "salarié", "Créer une demande → 201 / 400"],
    ["GET", "/api/demandes/me", "salarié", "Mes demandes"],
    ["GET", "/api/demandes", "manager/RH", "Demandes de l'équipe / toutes"],
    ["PATCH", "/api/demandes/{id}/valider", "manager/RH", "Valider → 200 / 409"],
    ["PATCH", "/api/demandes/{id}/refuser", "manager/RH", "Refuser (commentaire) → 200"],
    ["PATCH", "/api/demandes/{id}/annuler", "salarié", "Annuler → 200"],
    ["GET", "/api/users/me/solde", "authentifié", "Soldes de l'utilisateur"],
    ["PATCH", "/api/users/{id}/solde", "RH", "Ajuster un solde → 200"],
  ], [1100, 3300, 1600, 3026]),
  P("Les codes de retour respectent la sémantique HTTP : 200/201 en cas de succès, 400 pour une violation de règle métier, 401 lorsque l'utilisateur n'est pas authentifié, 403 lorsque son rôle est insuffisant, et 409 lorsqu'une transition d'état n'est pas autorisée."),

  H2("2.8 Conception de l'interface (UI/UX)"),
  P("Les maquettes ont été réalisées sous Figma avant le développement, afin de valider le parcours utilisateur et de réduire les retouches ultérieures. Le parcours principal a été pensé pour être réalisable en moins de trois clics : se connecter, remplir le formulaire, envoyer. Le tableau de bord regroupe sur un même écran les soldes, le formulaire de demande et l'historique, pour limiter la navigation."),
  maquette("Fig.11", "Maquette Figma de l'écran de connexion", "connexion.png"),
  P(""),
  maquette("Fig.12", "Maquette Figma de l'écran « Mes demandes » (soldes, formulaire, historique)", "tableau-de-bord.png"),
  pageBreak(),
];

// =====================================================================
//  CHAPITRE 3
// =====================================================================
const chap3 = [
  H1("Chapitre 3 — Réalisation et mise en œuvre"),
  H2("3.1 Environnement et outils de développement"),
  tableau(["Catégorie", "Outils"], [
    ["Système d'exploitation", "macOS"],
    ["Éditeur de code", "Visual Studio Code (extensions Python, ESLint, Tailwind)"],
    ["Gestion de versions", "Git + GitHub (branches main / develop / feature/*)"],
    ["Conteneurisation", "Docker + docker-compose"],
    ["Intégration continue", "GitHub Actions"],
    ["Tests d'API manuels", "Documentation Swagger (OpenAPI) intégrée"],
  ], [2800, 6226]),

  H2("3.2 Organisation du code source"),
  P("Le dépôt est structuré pour séparer clairement le back-end, le front-end et la documentation."),
  ...code("Arborescence du projet (simplifiée)",
    "ProjetCda/\n" +
    "├── backend/\n" +
    "│   ├── app/\n" +
    "│   │   ├── business/conges.py   # logique métier pure\n" +
    "│   │   ├── routers/             # endpoints REST (auth, demandes, users)\n" +
    "│   │   ├── models.py            # entités SQLAlchemy\n" +
    "│   │   ├── schemas.py           # validation Pydantic\n" +
    "│   │   ├── security.py          # JWT + bcrypt\n" +
    "│   │   ├── deps.py              # authentification + RBAC\n" +
    "│   │   └── main.py              # application FastAPI\n" +
    "│   └── tests/                   # tests unitaires + intégration\n" +
    "├── frontend/\n" +
    "│   └── src/                     # composants React, pages, contexte auth\n" +
    "├── docs/                        # diagrammes, scripts SQL\n" +
    "├── docker-compose.yml\n" +
    "└── .github/workflows/ci.yml     # intégration continue"),

  H2("3.3 Installation et lancement du projet"),
  P("Le projet se lance de deux manières : en local pour le développement, ou via Docker pour reproduire l'environnement de production."),
  H3("3.3.1 Lancement en local"),
  P("Back-end — création de l'environnement virtuel Python, installation des dépendances et démarrage du serveur :"),
  ...code("Terminal — back-end",
    "cd backend\n" +
    "python3 -m venv .venv            # créer l'environnement virtuel\n" +
    "source .venv/bin/activate        # l'activer (macOS / Linux)\n" +
    "pip install -r requirements.txt  # installer les dépendances\n" +
    "uvicorn app.main:app --reload    # démarrer l'API sur le port 8000"),
  P("Front-end — installation des paquets Node puis démarrage du serveur de développement Vite :"),
  ...code("Terminal — front-end",
    "cd frontend\n" +
    "npm install                      # installer les dépendances\n" +
    "npm run dev                      # démarrer l'app sur le port 5173"),
  P("L'API est alors disponible sur http://localhost:8000 (documentation interactive sur /docs) et l'interface sur http://localhost:5173."),
  H3("3.3.2 Lancement via Docker"),
  P("Une seule commande construit et démarre les trois conteneurs (base de données, API, front-end) :"),
  ...code("Terminal — Docker",
    "docker compose up --build\n" +
    "# db       -> PostgreSQL 16 (port 5432)\n" +
    "# backend  -> API FastAPI    (port 8000)\n" +
    "# frontend -> Nginx + build React (port 5173)"),

  H2("3.4 Stratégie de versionnement (Git)"),
  P("Le code est versionné avec Git et hébergé sur GitHub. La stratégie de branches retenue distingue la branche de production (main), la branche d'intégration (develop) et des branches de fonctionnalité (feature/*). Chaque fonctionnalité est développée sur sa propre branche, puis fusionnée après exécution des tests. Cette organisation facilite le travail incrémental et la traçabilité des évolutions."),

  H2("3.5 Technologies et dépendances"),
  P("Les principales dépendances du back-end (fichier requirements.txt) :"),
  ...code("backend/requirements.txt (extrait)",
    "fastapi            # framework web / API REST\n" +
    "uvicorn[standard]  # serveur ASGI\n" +
    "sqlalchemy         # ORM\n" +
    "psycopg2-binary    # pilote PostgreSQL\n" +
    "pydantic           # validation des données\n" +
    "passlib[bcrypt]    # hachage des mots de passe\n" +
    "bcrypt==4.0.1      # version compatible avec passlib\n" +
    "python-jose        # création / vérification des JWT\n" +
    "pytest, httpx      # tests"),

  H2("3.6 Modules back-end développés"),
  P("Le code back-end est organisé par responsabilité. Les sections suivantes détaillent les modules les plus significatifs, illustrés par des extraits du code réel."),

  H3("3.6.1 Modèles de données (ORM)"),
  P("Les entités sont décrites avec SQLAlchemy. L'énumération des statuts et la propriété calculée du solde restant illustrent la richesse du modèle."),
  ...code("backend/app/models.py (extrait)",
    "class StatutDemande(str, enum.Enum):\n" +
    "    SOUMISE = \"SOUMISE\"\n" +
    "    VALIDEE = \"VALIDEE\"\n" +
    "    REFUSEE = \"REFUSEE\"\n" +
    "    ANNULEE = \"ANNULEE\"\n\n" +
    "class SoldeConge(Base):\n" +
    "    __tablename__ = \"solde_conge\"\n" +
    "    id = mapped_column(Integer, primary_key=True)\n" +
    "    jours_acquis = mapped_column(default=25.0)\n" +
    "    jours_pris = mapped_column(default=0.0)\n\n" +
    "    @property\n" +
    "    def jours_restants(self) -> float:\n" +
    "        return self.jours_acquis - self.jours_pris"),

  H3("3.6.2 Validation des données (Pydantic)"),
  P("Les schémas Pydantic valident automatiquement les données entrantes et sortantes, et documentent l'API. La validation rejette par exemple un mot de passe trop court ou un e-mail mal formé."),
  ...code("backend/app/schemas.py (extrait)",
    "class EmployeCreate(BaseModel):\n" +
    "    nom: str\n" +
    "    prenom: str\n" +
    "    email: EmailStr\n" +
    "    mot_de_passe: str = Field(min_length=8)\n\n" +
    "class DemandeCreate(BaseModel):\n" +
    "    type_absence_id: int\n" +
    "    date_debut: date\n" +
    "    date_fin: date\n" +
    "    motif: str | None = None"),

  H3("3.6.3 Sécurité — hachage et jetons JWT"),
  P("La sécurité repose sur deux mécanismes : le hachage des mots de passe avec bcrypt (les mots de passe ne sont jamais stockés en clair) et la signature de jetons JWT contenant l'identifiant et le rôle de l'utilisateur, avec une date d'expiration."),
  ...code("backend/app/security.py (extrait)",
    "pwd_context = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")\n\n" +
    "def hacher_mot_de_passe(mot_de_passe: str) -> str:\n" +
    "    return pwd_context.hash(mot_de_passe)\n\n" +
    "def verifier_mot_de_passe(en_clair: str, hache: str) -> bool:\n" +
    "    return pwd_context.verify(en_clair, hache)\n\n" +
    "def creer_token(sujet: str, role: str) -> str:\n" +
    "    expire = datetime.now(timezone.utc) + timedelta(\n" +
    "        minutes=settings.jwt_expire_minutes)\n" +
    "    payload = {\"sub\": sujet, \"role\": role, \"exp\": expire}\n" +
    "    return jwt.encode(payload, settings.jwt_secret,\n" +
    "                      algorithm=settings.jwt_algorithm)"),

  H3("3.6.4 Contrôle d'accès par rôle (RBAC)"),
  P("Chaque requête protégée passe par une dépendance qui décode le jeton, récupère l'utilisateur, puis vérifie son rôle si nécessaire. La fabrique exiger_roles permet de restreindre une route à certains rôles de façon déclarative."),
  ...code("backend/app/deps.py (extrait)",
    "def get_current_user(token=Depends(oauth2_scheme),\n" +
    "                     db=Depends(get_db)) -> Employe:\n" +
    "    payload = decoder_token(token)\n" +
    "    if payload is None or \"sub\" not in payload:\n" +
    "        raise HTTPException(401, \"Identifiants invalides\")\n" +
    "    employe = db.get(Employe, int(payload[\"sub\"]))\n" +
    "    if employe is None:\n" +
    "        raise HTTPException(401, \"Identifiants invalides\")\n" +
    "    return employe\n\n" +
    "def exiger_roles(*roles: Role):\n" +
    "    def verificateur(user = Depends(get_current_user)):\n" +
    "        if user.role not in roles:\n" +
    "            raise HTTPException(403, \"Accès refusé : rôle insuffisant\")\n" +
    "        return user\n" +
    "    return verificateur"),
  P("Ainsi, une route de validation déclare simplement Depends(exiger_roles(Role.MANAGER, Role.RH)) : un salarié qui tente d'y accéder reçoit une erreur 403 sans qu'aucune logique supplémentaire ne soit nécessaire."),

  H3("3.6.5 Logique métier (le cœur testable)"),
  P("La logique métier est volontairement isolée dans des fonctions pures, sans dépendance à la base de données ni au framework, ce qui les rend faciles à tester et à raisonner. Le calcul des jours ouvrés et la machine à états en sont les deux exemples les plus importants."),
  ...code("backend/app/business/conges.py — calcul des jours ouvrés",
    "def compter_jours_ouvres(date_debut: date, date_fin: date) -> int:\n" +
    "    if date_fin < date_debut:\n" +
    "        raise ValueError(\"La date de fin doit être >= la date de début.\")\n" +
    "    jours = 0\n" +
    "    courant = date_debut\n" +
    "    while courant <= date_fin:\n" +
    "        if courant.weekday() < 5:   # 0=lundi ... 4=vendredi\n" +
    "            jours += 1\n" +
    "        courant += timedelta(days=1)\n" +
    "    return jours"),
  ...code("backend/app/business/conges.py — machine à états",
    "TRANSITIONS_AUTORISEES = {\n" +
    "    StatutDemande.SOUMISE: {StatutDemande.VALIDEE,\n" +
    "                            StatutDemande.REFUSEE,\n" +
    "                            StatutDemande.ANNULEE},\n" +
    "    StatutDemande.VALIDEE: {StatutDemande.ANNULEE},\n" +
    "    StatutDemande.REFUSEE: set(),   # état final\n" +
    "    StatutDemande.ANNULEE: set(),   # état final\n" +
    "}\n\n" +
    "def transition_possible(actuel, cible) -> bool:\n" +
    "    return cible in TRANSITIONS_AUTORISEES.get(actuel, set())"),

  H3("3.6.6 Route de création d'une demande"),
  P("La route POST /api/demandes orchestre les règles métier : validation des dates et calcul des jours ouvrés, contrôle du solde, puis création de la demande au statut SOUMISE."),
  ...code("backend/app/routers/demandes.py (extrait)",
    "@router.post(\"\", response_model=DemandeOut, status_code=201)\n" +
    "def creer_demande(data: DemandeCreate, db=Depends(get_db),\n" +
    "                  user: Employe = Depends(get_current_user)):\n" +
    "    try:\n" +
    "        nb_jours = compter_jours_ouvres(data.date_debut, data.date_fin)\n" +
    "    except ValueError as exc:\n" +
    "        raise HTTPException(400, str(exc))\n" +
    "    solde = _get_solde(db, user.id, data.type_absence_id,\n" +
    "                       data.date_debut.year)\n" +
    "    if not solde_suffisant(solde.jours_restants, nb_jours):\n" +
    "        raise HTTPException(400, \"Solde insuffisant\")\n" +
    "    demande = DemandeConge(employe_id=user.id, nb_jours_ouvres=nb_jours,\n" +
    "                           statut=StatutDemande.SOUMISE, ...)\n" +
    "    db.add(demande); db.commit(); db.refresh(demande)\n" +
    "    return demande"),

  H2("3.7 Modules front-end développés"),
  P("Le front-end est une application React structurée autour d'un contexte d'authentification, d'un client HTTP centralisé et de pages dédiées à chaque parcours."),
  H3("3.7.1 Client HTTP et sécurité côté client"),
  P("Un intercepteur Axios ajoute automatiquement le jeton JWT à chaque requête et déconnecte l'utilisateur si le serveur répond 401 (jeton expiré ou invalide)."),
  ...code("frontend/src/api/client.ts (extrait)",
    "api.interceptors.request.use((config) => {\n" +
    "  const token = localStorage.getItem(TOKEN_KEY);\n" +
    "  if (token) config.headers.Authorization = `Bearer ${token}`;\n" +
    "  return config;\n" +
    "});\n\n" +
    "api.interceptors.response.use(\n" +
    "  (res) => res,\n" +
    "  (error) => {\n" +
    "    if (error.response?.status === 401)\n" +
    "      localStorage.removeItem(TOKEN_KEY);   // déconnexion auto\n" +
    "    return Promise.reject(error);\n" +
    "  },\n" +
    ");"),
  H3("3.7.2 Protection des routes (RBAC côté client)"),
  P("Un composant ProtectedRoute redirige vers la connexion si l'utilisateur n'est pas authentifié, et vers l'accueil s'il ne possède pas le rôle requis."),
  ...code("frontend/src/components/ProtectedRoute.tsx (extrait)",
    "export default function ProtectedRoute({ children, roles }) {\n" +
    "  const { user, loading } = useAuth();\n" +
    "  if (loading) return <div>Chargement…</div>;\n" +
    "  if (!user) return <Navigate to=\"/login\" replace />;\n" +
    "  if (roles && !roles.includes(user.role))\n" +
    "    return <Navigate to=\"/\" replace />;\n" +
    "  return children;\n" +
    "}"),
  H3("3.7.3 Gestion de l'état serveur (React Query)"),
  P("La consommation de l'API s'appuie sur React Query, qui gère le cache, le rechargement et l'invalidation des données. Après création d'une demande, les requêtes des soldes et de l'historique sont automatiquement invalidées et rechargées, garantissant un affichage à jour."),
  P("Captures de l'application en fonctionnement :"),
  screenshot("Fig.13", "Écran de connexion de l'application", "fig13-login.png"),
  P(""),
  screenshot("Fig.14", "Espace salarié : soldes, formulaire de demande et historique", "fig14-mes-demandes.png"),
  P(""),
  screenshot("Fig.15", "Espace manager : demandes à valider (actions Valider / Refuser)", "fig15-validation.png"),
  P(""),
  screenshot("Fig.16", "Tableau de bord du manager : indicateurs et répartition des demandes", "fig16-dashboard.png"),
  P(""),
  screenshot("Fig.17", "Documentation interactive de l'API (Swagger / OpenAPI)", "fig18-swagger.png"),

  H2("3.8 Sécurité mise en œuvre et OWASP Top 10"),
  P("La sécurité a été intégrée à chaque couche. Le tableau suivant met en regard les principaux risques de l'OWASP Top 10 et les mesures prises dans CongésFlow."),
  tableau(["Risque OWASP", "Mesure dans CongésFlow"], [
    ["A01 — Contrôle d'accès défaillant", "RBAC côté serveur (exiger_roles) et côté client (ProtectedRoute) ; un manager ne voit que son équipe"],
    ["A02 — Défaillances cryptographiques", "Mots de passe hachés avec bcrypt ; jetons JWT signés"],
    ["A03 — Injection", "Requêtes préparées via l'ORM SQLAlchemy ; validation Pydantic des entrées"],
    ["A05 — Mauvaise configuration", "CORS restreint à l'origine autorisée ; secrets en variables d'environnement"],
    ["A07 — Authentification défaillante", "Jetons signés avec expiration ; déconnexion automatique sur 401"],
    ["A09 — Journalisation insuffisante", "Traçabilité des décisions (valideur, horodatage) — piste d'amélioration"],
  ], [3000, 6026]),

  H2("3.9 Difficultés rencontrées et solutions"),
  P("Plusieurs difficultés techniques ont été rencontrées et résolues durant le développement :"),
  bullet([B("Incompatibilité passlib / bcrypt : "), R("les versions récentes de bcrypt cassaient passlib au démarrage. Solution : figer la version bcrypt==4.0.1 dans les dépendances.")]),
  bullet([B("Cohérence des statuts : "), R("éviter qu'une demande déjà refusée puisse être validée. Solution : centraliser les transitions autorisées dans une machine à états et renvoyer une erreur 409 en cas de transition invalide.")]),
  bullet([B("Communication front / back : "), R("erreurs CORS entre le front (port 5173) et l'API (port 8000). Solution : middleware CORS restreint à l'origine autorisée.")]),
  bullet([B("Écoute IPv6 du serveur de développement : "), R("la page tardait à s'ouvrir car le serveur n'écoutait qu'en IPv6. Solution : accès via localhost et documentation de la procédure de lancement.")]),
  bullet([B("Déploiement et routage SPA : "), R("après la mise en ligne sur Render, la racine du front renvoyait une erreur 404 et l'URL de l'API n'était pas correctement injectée. Solution : ajout d'une règle de réécriture renvoyant toutes les routes vers index.html, et configuration explicite de l'URL publique de l'API, suivies d'un redéploiement avec purge du cache.")]),
  pageBreak(),
];

// =====================================================================
//  CHAPITRE 4
// =====================================================================
const chap4 = [
  H1("Chapitre 4 — Tests et validation"),
  H2("4.1 Stratégie de test"),
  P("La stratégie de test repose sur deux niveaux complémentaires. Les tests unitaires valident la logique métier pure (calcul des jours ouvrés, suffisance du solde, transitions d'état), indépendamment de toute infrastructure. Les tests d'intégration valident des parcours complets à travers l'API et la base de données (connexion, création d'une demande, contrôle des droits, transitions interdites). Cette approche pyramidale privilégie de nombreux tests unitaires rapides, complétés par des tests d'intégration ciblés sur les parcours critiques."),
  H2("4.2 Outils de test"),
  bullet([B("pytest : "), R("exécution des tests back-end (unitaires et intégration).")]),
  bullet([B("httpx / TestClient : "), R("simulation de requêtes HTTP sur l'API dans les tests d'intégration, sur une base SQLite jetable.")]),
  bullet([B("Vitest : "), R("tests unitaires côté front-end.")]),
  bullet([B("Documentation Swagger : "), R("tests manuels exploratoires des endpoints.")]),
  H2("4.3 Plan de tests détaillé"),
  P("Le tableau suivant recense les principaux cas de test et leur objectif."),
  tableau(["Cas de test", "Type", "Résultat attendu"], [
    ["Une semaine complète vaut cinq jours ouvrés", "Unitaire", "5"],
    ["Un week-end vaut zéro jour ouvré", "Unitaire", "0"],
    ["Période à cheval sur un week-end", "Unitaire", "2 (vendredi + lundi)"],
    ["Date de fin avant la date de début", "Unitaire", "Erreur (ValueError)"],
    ["Solde exactement égal au besoin", "Unitaire", "Autorisé"],
    ["Transition SOUMISE → VALIDEE", "Unitaire", "Autorisée"],
    ["Transition REFUSEE → VALIDEE", "Unitaire", "Interdite"],
    ["Connexion avec identifiants invalides", "Intégration", "HTTP 401"],
    ["Création d'une demande valide", "Intégration", "HTTP 201, statut SOUMISE"],
    ["Demande dépassant le solde", "Intégration", "HTTP 400"],
    ["Salarié accédant à la liste manager", "Intégration", "HTTP 403 (RBAC)"],
    ["Validation décrémentant le solde", "Intégration", "Solde mis à jour"],
    ["Validation d'une demande refusée", "Intégration", "HTTP 409"],
  ], [4626, 1700, 2700]),
  H2("4.4 Exemples de tests"),
  P("Test unitaire — vérification du calcul des jours ouvrés et d'une transition interdite :"),
  ...code("backend/tests/test_conges.py (extrait)",
    "def test_une_semaine_complete_vaut_cinq_jours():\n" +
    "    assert compter_jours_ouvres(date(2025,6,2), date(2025,6,6)) == 5\n\n" +
    "def test_le_week_end_est_exclu():\n" +
    "    assert compter_jours_ouvres(date(2025,6,7), date(2025,6,8)) == 0\n\n" +
    "def test_refusee_est_un_etat_final():\n" +
    "    assert not transition_possible(StatutDemande.REFUSEE,\n" +
    "                                   StatutDemande.VALIDEE)"),
  P("Test d'intégration — un salarié ne peut pas accéder à la liste réservée aux managers (RBAC) :"),
  ...code("backend/tests/test_demandes.py (extrait)",
    "def test_salarie_ne_peut_pas_lister_toutes_les_demandes(client):\n" +
    "    token = login(client, \"salarie@congesflow.fr\")\n" +
    "    resp = client.get(\"/api/demandes\", headers=auth_header(token))\n" +
    "    assert resp.status_code == 403   # accès réservé manager / RH"),
  H2("4.5 Résultats obtenus"),
  tableau(["Périmètre", "Nombre de tests", "Résultat"], [
    ["Back-end — tests unitaires (logique métier)", "13", "100 % réussite"],
    ["Back-end — tests d'intégration (API)", "6", "100 % réussite"],
    ["Front-end — tests unitaires", "2", "100 % réussite"],
    ["Total", "21", "21 / 21 au vert"],
  ], [4626, 2200, 2200]),
  P(""),
  screenshot("Fig.18", "Sortie de l'exécution des tests (pytest) — 26 tests au vert", "fig18-tests.png"),
  H2("4.6 Intégration continue (CI)"),
  P("Un pipeline GitHub Actions exécute automatiquement l'ensemble des tests à chaque push sur les branches main et develop, garantissant qu'aucune régression n'est introduite. Le pipeline comporte deux travaux : l'un pour le back-end (pytest), l'autre pour le front-end (build et tests)."),
  ...code(".github/workflows/ci.yml (extrait)",
    "jobs:\n" +
    "  backend:\n" +
    "    runs-on: ubuntu-latest\n" +
    "    steps:\n" +
    "      - uses: actions/checkout@v4\n" +
    "      - uses: actions/setup-python@v5\n" +
    "        with: { python-version: \"3.12\" }\n" +
    "      - run: pip install -r backend/requirements.txt\n" +
    "      - run: pytest -q\n" +
    "        working-directory: backend"),
  H2("4.7 Conteneurisation (Docker)"),
  P("L'application est conteneurisée pour garantir un déploiement reproductible. Le fichier docker-compose orchestre trois services : la base PostgreSQL, l'API et le front-end servi par Nginx."),
  ...code("docker-compose.yml (extrait)",
    "services:\n" +
    "  db:\n" +
    "    image: postgres:16-alpine\n" +
    "    environment:\n" +
    "      POSTGRES_USER: congesflow\n" +
    "      POSTGRES_PASSWORD: congesflow\n" +
    "  backend:\n" +
    "    build: ./backend\n" +
    "    depends_on: [db]\n" +
    "    ports: [\"8000:8000\"]\n" +
    "  frontend:\n" +
    "    build: ./frontend\n" +
    "    ports: [\"5173:80\"]"),
  H2("4.8 Analyse des performances"),
  P("Les temps de réponse de l'API ont été mesurés en local (moyenne sur 8 appels par endpoint). Les requêtes de lecture sont très rapides :"),
  tableau(["Endpoint", "Temps de réponse moyen"], [
    ["GET /api/health", "≈ 0,8 ms"],
    ["GET /api/auth/me", "≈ 1,5 ms"],
    ["GET /api/demandes/me", "≈ 1,7 ms"],
    ["GET /api/users/me/solde", "≈ 1,6 ms"],
  ], [5026, 4000]),
  P("Ces valeurs, de l'ordre de la milliseconde en local, s'expliquent par l'architecture asynchrone de FastAPI et par les index posés sur les colonnes fréquemment filtrées (email, statut). En production (hébergement Render, offre gratuite), s'ajoutent la latence réseau et, après une période d'inactivité, un délai de « réveil » du service d'environ cinquante secondes au premier appel — comportement propre à l'offre gratuite, sans incidence sur les performances une fois le service actif."),
  H2("4.9 Limites identifiées"),
  bullet("Les jours fériés ne sont pas exclus du calcul (seuls les week-ends le sont)."),
  bullet("Les notifications par e-mail sont prévues mais non implémentées (priorité MoSCoW « Could »)."),
  bullet("Le circuit de validation est à un seul niveau (pas de validation multi-managers)."),
  bullet("La journalisation des accès reste sommaire (piste d'amélioration de sécurité)."),
  pageBreak(),
];

const conclusion = [
  H1("Conclusion générale"),
  P("Bilan. Le projet CongésFlow répond à la problématique posée : l'application fiabilise et fluidifie la gestion des demandes de congés grâce à un workflow tracé, au calcul automatique des soldes et à une sécurité conforme aux standards actuels. Les trois blocs de compétences du titre Concepteur Développeur d'Applications sont couverts par une application réellement fonctionnelle, testée et documentée."),
  P("Apports techniques et professionnels. Ce projet m'a permis de mettre en œuvre l'ensemble de la chaîne de développement full-stack : conception (modélisation UML et Merise), développement front-end et back-end, sécurité applicative, tests automatisés et pratiques DevOps (conteneurisation, intégration continue). Sur le plan méthodologique, il m'a appris à cadrer un périmètre à l'aide de la méthode MoSCoW et à prioriser les fonctionnalités en fonction de la valeur et de la contrainte de temps."),
  P("Limites. Certaines fonctionnalités restent à implémenter : gestion des jours fériés, notifications par e-mail, validation multi-niveaux et journalisation renforcée (voir section 4.9)."),
  P("Perspectives. Les évolutions envisagées sont : l'envoi de notifications par e-mail à chaque changement d'état, un calendrier d'équipe avec détection des chevauchements, la prise en compte des jours fériés, un export comptable destiné à la paie, un tableau de bord RH avec indicateurs, et à terme une application mobile. Le déploiement en ligne (sur un hébergeur de conteneurs) constituerait également une suite naturelle pour rendre l'application accessible en conditions réelles."),
  pageBreak(),
];

const veille = [
  H1("Veille technologique et sécurité"),
  P("La conception d'une application sécurisée nécessite une veille continue, tant sur les technologies que sur les vulnérabilités. Pendant le projet, plusieurs sources ont été suivies :"),
  bullet([B("Veille technologique : "), R("documentations officielles (FastAPI, React, SQLAlchemy, PostgreSQL), notes de version des bibliothèques, et articles techniques de la communauté.")]),
  bullet([B("Veille sécurité : "), R("référentiel OWASP Top 10, qui recense les risques applicatifs les plus critiques, et suivi des annonces de vulnérabilités sur les dépendances utilisées.")]),
  P("Cette veille a eu un impact concret sur le projet : c'est par exemple le suivi des notes de version qui a permis d'identifier l'incompatibilité entre passlib et les versions récentes de bcrypt, et de la corriger en figeant la version appropriée. De même, la consultation de l'OWASP Top 10 a guidé les choix de sécurité (requêtes préparées, hachage, contrôle d'accès)."),
  P("Concrètement, les sources de veille suivies pendant le projet ont été : les documentations officielles et leurs notes de version (FastAPI, React, SQLAlchemy, PostgreSQL), le référentiel OWASP Top 10 pour la sécurité, ainsi que des articles techniques de la communauté (dev.to, blogs spécialisés, dépôts GitHub). Cette veille a eu un impact direct : c'est en consultant les notes de version que j'ai identifié l'incompatibilité entre passlib et les versions récentes de bcrypt, ce qui m'a permis de figer la version adéquate ; de la même manière, la lecture de l'OWASP Top 10 a guidé mes choix de sécurisation (requêtes préparées, hachage des mots de passe, contrôle d'accès par rôle)."),
  pageBreak(),
];

const glossaire = [
  H1("Glossaire"),
  tableau(["Terme", "Définition"], [
    ["API REST", "Interface de programmation exposant des ressources via les verbes HTTP standards."],
    ["JWT", "JSON Web Token : jeton signé contenant des informations d'authentification."],
    ["RBAC", "Role-Based Access Control : contrôle d'accès fondé sur les rôles des utilisateurs."],
    ["ORM", "Object-Relational Mapping : correspondance entre objets du code et tables de la base."],
    ["bcrypt", "Algorithme de hachage de mots de passe résistant aux attaques par force brute."],
    ["CORS", "Cross-Origin Resource Sharing : mécanisme contrôlant les requêtes inter-origines."],
    ["SPA", "Single Page Application : application web monopage rendue côté client."],
    ["MCD / MLD / MPD", "Modèles conceptuel, logique et physique de données (méthode Merise)."],
    ["CI/CD", "Intégration et déploiement continus."],
    ["OWASP", "Organisation publiant des référentiels de sécurité applicative (dont le Top 10)."],
    ["MoSCoW", "Méthode de priorisation : Must, Should, Could, Won't have."],
    ["Story point", "Unité d'estimation de la complexité d'une User Story."],
  ], [2200, 6826]),
  pageBreak(),
];

const biblio = [
  H1("Bibliographie et webographie"),
  bullet("Documentation FastAPI — https://fastapi.tiangolo.com"),
  bullet("Documentation React — https://react.dev"),
  bullet("Documentation TypeScript — https://www.typescriptlang.org/docs/"),
  bullet("Documentation SQLAlchemy — https://docs.sqlalchemy.org"),
  bullet("Documentation PostgreSQL — https://www.postgresql.org/docs/"),
  bullet("OWASP Top 10 — https://owasp.org/www-project-top-ten/"),
  bullet("Documentation Docker — https://docs.docker.com"),
  bullet("Documentation Tailwind CSS — https://tailwindcss.com/docs"),
  bullet("[Supports de cours ESTIAM, articles consultés et outils d'IA utilisés — à préciser]"),
  pageBreak(),
];

const annexes = [
  H1("Annexes"),
  H2("Annexe A — Couverture des trois blocs de compétences"),
  tableau(["Bloc", "Compétence", "Démonstration dans CongésFlow"], [
    ["Bloc 1", "Maquettage / responsive / UX", "Maquettes Figma, pages React + Tailwind responsive"],
    ["Bloc 1", "Framework moderne + gestion d'état", "React + TypeScript + React Query"],
    ["Bloc 1", "Consommation d'API REST", "Client Axios, intercepteurs JWT"],
    ["Bloc 1", "Sécurité côté client", "Routes protégées par rôle (ProtectedRoute), gestion du jeton"],
    ["Bloc 2", "API REST robuste", "FastAPI, endpoints documentés (OpenAPI), codes HTTP normalisés"],
    ["Bloc 2", "Base de données", "PostgreSQL, MCD/MLD/MPD, ORM, contraintes d'intégrité"],
    ["Bloc 2", "Authentification", "JWT (python-jose)"],
    ["Bloc 2", "Autorisations (RBAC)", "Trois rôles, dépendance exiger_roles"],
    ["Bloc 2", "Sécurisation des données", "bcrypt, requêtes préparées, CORS, validation, OWASP"],
    ["Bloc 3", "Architecture logicielle", "Architecture en couches, séparation des responsabilités"],
    ["Bloc 3", "Diagrammes techniques", "Dix diagrammes UML / Merise"],
    ["Bloc 3", "Gestion de projet agile", "Backlog, User Stories, MoSCoW, sprints, story points"],
    ["Bloc 3", "Qualité et DevOps", "Tests (pytest, Vitest), Docker, CI GitHub Actions, Git"],
  ], [900, 3200, 4926]),
  H2("Annexe B — Diagramme d'objets"),
  diagram("Fig.8", "Diagramme d'objets — instantané du système", "08-objets.puml"),
  P(""),
  H2("Annexe C — Scripts SQL"),
  P("Le modèle physique complet figure dans docs/sql/schema.sql ; un jeu de données de démonstration figure dans docs/sql/donnees-demo.sql. Extrait de la table des soldes :"),
  ...code("docs/sql/schema.sql (extrait)",
    "CREATE TABLE solde_conge (\n" +
    "    id               SERIAL PRIMARY KEY,\n" +
    "    employe_id       INTEGER NOT NULL REFERENCES employe(id),\n" +
    "    type_absence_id  INTEGER NOT NULL REFERENCES type_absence(id),\n" +
    "    annee            INTEGER NOT NULL,\n" +
    "    jours_acquis     NUMERIC(5,1) NOT NULL DEFAULT 25.0\n" +
    "                     CHECK (jours_acquis >= 0),\n" +
    "    jours_pris       NUMERIC(5,1) NOT NULL DEFAULT 0.0,\n" +
    "    CONSTRAINT uq_solde UNIQUE (employe_id, type_absence_id, annee)\n" +
    ");"),
  H2("Annexe D — Documentation de l'API"),
  P("La documentation interactive de l'API (Swagger / OpenAPI) est générée automatiquement par FastAPI et accessible à l'adresse http://localhost:8000/docs."),
  P("La documentation Swagger est illustrée en Fig.17. Elle liste l'ensemble des endpoints, leurs paramètres et leurs réponses, et permet de les tester directement."),
  H2("Annexe E — Dépôt GitHub"),
  P([B("Dépôt GitHub : "), R("https://github.com/glo007/congesflow")]),
  P([B("Application déployée en ligne : "), R("https://congesflow-web.onrender.com")]),
  P("Comptes de démonstration (mot de passe : Password123) : salarie@congesflow.fr, manager@congesflow.fr, rh@congesflow.fr."),
];

// =====================================================================
//  DOCUMENT
// =====================================================================
const body = [
  cover, remerciements, resume, sommaire, figures, intro,
  chap1, chap2, chap3, chap4, conclusion, veille, glossaire, biblio, annexes,
].flat(Infinity);

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: "1B2A4A" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0B5394", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "0B5394" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, color: "44505F" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] },
    { reference: "n", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "CongésFlow — Dossier Projet CDA   |   Page ", size: 18, color: "6B7785" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7785" })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/Dossier_Projet_CongesFlow.docx", buf);
  console.log("OK Dossier_Projet_CongesFlow.docx");
});
