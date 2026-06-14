const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, Footer, ImageRun,
} = require("docx");

const CW = 9026;
const IMG_DIR = path.join(__dirname, "..", "docs", "diagrammes", "images");
const pngSize = (file) => { const b = fs.readFileSync(file); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
// diagramme intégré : renvoie [image centrée, légende]
const dimg = (fig, legende, name) => {
  const file = path.join(IMG_DIR, name + ".png");
  const { w, h } = pngSize(file);
  const scale = Math.min(520 / w, 320 / h, 1);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w * scale), height: Math.round(h * scale) }, altText: { title: fig, description: legende, name } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 }, children: [new TextRun({ text: `${fig} — ${legende}`, italics: true, size: 18, color: "44505F" })] }),
  ];
};
const b = { style: BorderStyle.SINGLE, size: 1, color: "B7C3D0" };
const borders = { top: b, bottom: b, left: b, right: b };

const P = (t, o = {}) => new Paragraph({ spacing: { after: 120 }, ...o,
  children: Array.isArray(t) ? t : [new TextRun({ text: t, ...(o.run || {}) })] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const li = (t) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 50 }, children: Array.isArray(t) ? t : [new TextRun(t)] });
const fill = (t) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, italics: true, color: "B3267A" })] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const code = (caption, src) => {
  const lines = src.replace(/\t/g, "    ").split("\n");
  const cell = new TableCell({
    borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "D6DEE6" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "D6DEE6" }, left: { style: BorderStyle.SINGLE, size: 4, color: "0B5394" }, right: { style: BorderStyle.SINGLE, size: 1, color: "D6DEE6" } },
    width: { size: CW, type: WidthType.DXA }, shading: { fill: "F6F8FA", type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 160, right: 120 },
    children: lines.map((l) => new Paragraph({ spacing: { after: 0, line: 230, lineRule: "auto" }, children: [new TextRun({ text: l.length ? l : " ", font: "Courier New", size: 16, color: "1B2A3A" })] })),
  });
  const out = [];
  if (caption) out.push(new Paragraph({ spacing: { after: 40, before: 60 }, children: [new TextRun({ text: caption, bold: true, size: 18, color: "0B5394" })] }));
  out.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({ children: [cell] })] }));
  out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return out;
};

const tbl = (headers, rows, widths) => new Table({
  width: { size: CW, type: WidthType.DXA }, columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, shading: { fill: "0B5394", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] })] })) }),
    ...rows.map((r) => new TableRow({ children: r.map((c, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 19 })] })] })) })),
  ],
});

const exemple = (titre, contexte, actions, competences) => [
  H3(titre),
  P("Contexte et description de la situation professionnelle :", { run: { bold: true } }),
  P(contexte),
  P("Actions réalisées :", { run: { bold: true } }),
  ...actions.map(li),
  P("Compétences mises en œuvre :", { run: { bold: true } }),
  ...competences.map(li),
];

const cover = [
  new Paragraph({ spacing: { before: 1000, after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DOSSIER PROFESSIONNEL (DP)", bold: true, size: 40, color: "0B5394" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: "Titre Professionnel", size: 24, color: "44505F" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Concepteur Développeur d'Applications", bold: true, size: 36 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 }, children: [new TextRun({ text: "Niveau 6 (RNCP)", size: 24, italics: true, color: "44505F" })] }),
  tbl(["Rubrique", "Information"], [
    ["Nom et prénom", "BOUNGOU MBIMI Gloire Bryan"],
    ["Date de naissance", "[votre date de naissance]"],
    ["Centre de formation", "ESTIAM"],
    ["Période du projet", "Octobre 2025 – juin 2026"],
    ["Session d'examen", "Septembre 2026"],
    ["Projet support", "CongésFlow — Application de gestion des congés"],
  ], [3200, 5826]),
  new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "⚠️ Si votre centre a fourni un modèle officiel de DP, recopiez-y ce contenu.", italics: true, size: 18, color: "6B7785" })] }),
  pageBreak(),
];

const honneur = [
  H1("Déclaration sur l'honneur"),
  P("Je soussigné(e) BOUNGOU MBIMI Gloire Bryan, déclare sur l'honneur que les informations contenues dans ce dossier professionnel sont exactes et que le travail présenté est le résultat de ma propre activité."),
  P("Fait à Massy, le ____ juin 2026.", { spacing: { before: 240 } }),
  P("Signature : ______________________", { spacing: { before: 360 } }),
  pageBreak(),
];

const presentation = [
  H1("1. Présentation du candidat et du parcours"),
  P("Dans le cadre de ma formation de Concepteur Développeur d'Applications à l'ESTIAM, j'ai réalisé le projet CongésFlow comme projet de fin d'études. Ce projet m'a permis de mettre en pratique l'ensemble des compétences acquises durant la formation, de la conception jusqu'à la mise en production en ligne. Il illustre mon projet professionnel : concevoir et développer des applications web complètes, sécurisées et déployées, en maîtrisant aussi bien le front-end que le back-end et les pratiques de qualité (tests, intégration continue, conteneurisation)."),
  H2("Contexte du projet support"),
  P("Le projet CongésFlow a été réalisé en centre de formation. Il s'agit d'une application web de gestion des demandes de congés destinée à une PME : un salarié pose une demande, son manager la valide ou la refuse, et le service RH pilote les soldes. Ce projet a servi de support à la mise en œuvre des compétences des trois activités-types du titre, depuis la conception jusqu'au déploiement conteneurisé."),
  H2("Environnement technique"),
  tbl(["Domaine", "Technologies / outils"], [
    ["Front-end", "React, TypeScript, Vite, Tailwind CSS, React Query, Axios"],
    ["Back-end", "Python, FastAPI, SQLAlchemy, Pydantic"],
    ["Base de données", "PostgreSQL (SQLite pour les tests)"],
    ["Sécurité", "JWT (python-jose), bcrypt (passlib), RBAC"],
    ["Tests", "pytest, httpx, Vitest"],
    ["DevOps / outils", "Git, GitHub, Docker, docker-compose, GitHub Actions, VS Code"],
  ], [2400, 6626]),
  pageBreak(),
];

const synthese = [
  H1("2. Synthèse des activités-types et compétences"),
  P("Le titre CDA est constitué de trois activités-types (AT). Le tableau ci-dessous récapitule leur couverture par le projet CongésFlow."),
  tbl(["Activité-type", "Couverture par CongésFlow"], [
    ["AT1 — Développer une interface utilisateur sécurisée (front-end)", "Maquettes Figma, SPA React/TypeScript, routes protégées par rôle, consommation d'API REST"],
    ["AT2 — Concevoir et développer la persistance des données", "MCD/MLD/MPD, PostgreSQL, ORM SQLAlchemy, script SQL, contraintes d'intégrité"],
    ["AT3 — Concevoir et développer une application multicouche sécurisée", "API FastAPI, architecture en couches, JWT/RBAC, tests, Docker, CI/CD, gestion agile"],
  ], [3600, 5426]),
  pageBreak(),
];

const at1 = [
  H1("3. Activité-type 1 — Développer une interface utilisateur sécurisée"),
  ...dimg("Fig.2", "Diagramme de cas d'utilisation", "02-cas-utilisation"),
  ...exemple(
    "3.1 Exemple — Conception et développement de l'interface de CongésFlow",
    "À partir de l'expression des besoins, j'ai d'abord maquetté les écrans clés sous Figma (connexion, tableau de bord, validation), puis développé l'interface en React et TypeScript. L'enjeu de sécurité était de n'exposer chaque écran qu'aux rôles autorisés et de gérer correctement le jeton d'authentification côté client.",
    [
      "Réalisation des maquettes Figma et définition du parcours utilisateur (moins de trois clics pour poser une demande).",
      "Initialisation du projet front avec Vite, TypeScript et Tailwind CSS.",
      "Développement de composants React réutilisables (formulaire de demande, badges de statut, mise en page responsive).",
      "Mise en place de la gestion d'état serveur avec React Query et de la consommation de l'API REST via Axios.",
      "Sécurisation côté client : injection automatique du jeton JWT, déconnexion sur réponse 401, routes protégées par rôle.",
    ],
    [
      "Maquetter une application.",
      "Développer la partie front-end d'une interface utilisateur web.",
      "Développer des composants d'accès aux données (consommation d'API REST).",
    ],
  ),
  H3("Réalisations techniques concrètes"),
  P("Installation et démarrage de l'environnement front-end :", { run: { bold: true } }),
  ...code("Terminal — front-end",
    "cd frontend\n" +
    "npm install        # installe React, TypeScript, Tailwind, etc.\n" +
    "npm run dev        # démarre le serveur de développement (port 5173)"),
  P("Protection des routes selon l'authentification et le rôle (RBAC côté client) :", { run: { bold: true } }),
  ...code("frontend/src/components/ProtectedRoute.tsx (extrait)",
    "export default function ProtectedRoute({ children, roles }) {\n" +
    "  const { user, loading } = useAuth();\n" +
    "  if (loading) return <div>Chargement…</div>;\n" +
    "  if (!user) return <Navigate to=\"/login\" replace />;\n" +
    "  if (roles && !roles.includes(user.role))\n" +
    "    return <Navigate to=\"/\" replace />;\n" +
    "  return children;\n" +
    "}"),
  P("Difficulté rencontrée : la communication entre le front-end (port 5173) et l'API (port 8000) était bloquée par la politique de sécurité CORS du navigateur. Je l'ai résolue en configurant un middleware CORS côté serveur autorisant l'origine du front, puis, lors du déploiement en ligne, en élargissant la règle aux domaines de l'hébergeur."),
  pageBreak(),
];

const at2 = [
  H1("4. Activité-type 2 — Concevoir et développer la persistance des données"),
  ...dimg("Fig.7", "Modèle conceptuel de données (MCD)", "07-mcd"),
  ...dimg("Fig.6", "Diagramme de classes", "06-classes"),
  ...exemple(
    "4.1 Exemple — Modélisation et mise en place de la base de données",
    "Le cœur de CongésFlow repose sur des données relationnelles (employés, demandes, soldes, types d'absence). J'ai conduit la modélisation depuis le besoin métier jusqu'au modèle physique exécutable, en garantissant l'intégrité des données.",
    [
      "Élaboration du modèle conceptuel (MCD) puis logique (MLD) : entités, relations et cardinalités.",
      "Écriture du modèle physique en SQL pour PostgreSQL (clés primaires/étrangères, contraintes UNIQUE / NOT NULL / CHECK, index).",
      "Mise en place de l'accès aux données via l'ORM SQLAlchemy, garantissant des requêtes préparées (protection contre les injections SQL).",
      "Création d'un jeu de données de démonstration pour les tests et la soutenance.",
    ],
    [
      "Concevoir une base de données.",
      "Mettre en place une base de données.",
      "Développer des composants dans le langage d'une base de données.",
    ],
  ),
  H3("Réalisations techniques concrètes"),
  P("Définition des tables et des contraintes d'intégrité en SQL :", { run: { bold: true } }),
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
  P("Définition du modèle correspondant côté ORM (SQLAlchemy), qui produit des requêtes préparées :", { run: { bold: true } }),
  ...code("backend/app/models.py (extrait)",
    "class SoldeConge(Base):\n" +
    "    __tablename__ = \"solde_conge\"\n" +
    "    id = mapped_column(Integer, primary_key=True)\n" +
    "    employe_id = mapped_column(ForeignKey(\"employe.id\"))\n" +
    "    annee = mapped_column(Integer)\n" +
    "    jours_acquis = mapped_column(default=25.0)\n" +
    "    jours_pris = mapped_column(default=0.0)\n\n" +
    "    @property\n" +
    "    def jours_restants(self) -> float:\n" +
    "        return self.jours_acquis - self.jours_pris"),
  P("Choix de modélisation : le solde de congés est identifié par la combinaison employé / type d'absence / année. Ce choix permet de gérer plusieurs types de congés (congés payés, RTT…) indépendamment, de conserver l'historique année par année, et de garantir l'unicité de chaque solde grâce à une contrainte UNIQUE portant sur ces trois colonnes."),
  pageBreak(),
];

const at3 = [
  H1("5. Activité-type 3 — Concevoir et développer une application multicouche sécurisée"),
  ...dimg("Fig.9", "Diagramme de composants", "09-composants"),
  ...dimg("Fig.10", "Diagramme de déploiement", "10-deploiement"),
  ...exemple(
    "5.1 Exemple — Conception, développement et déploiement de l'application",
    "J'ai conçu et développé l'application complète selon une architecture en couches (présentation, API, métier, persistance), en intégrant la sécurité et la qualité logicielle à chaque étape, et en organisant le travail en mode agile.",
    [
      "Organisation agile : rédaction du backlog, des User Stories et priorisation MoSCoW.",
      "Conception : diagrammes UML (contexte, cas d'utilisation, séquence, classes, état-transition, composants, déploiement).",
      "Développement de l'API REST avec FastAPI : authentification JWT, autorisations par rôle (RBAC).",
      "Développement de la logique métier isolée et testable (jours ouvrés, soldes, machine à états des demandes).",
      "Sécurité : hachage bcrypt des mots de passe, CORS restreint, validation des entrées, prise en compte de l'OWASP Top 10.",
      "Qualité : 21 tests automatisés (pytest, Vitest), tous au vert.",
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
  H3("Réalisations techniques concrètes"),
  P("Contrôle d'accès par rôle au niveau de l'API (RBAC) :", { run: { bold: true } }),
  ...code("backend/app/deps.py (extrait)",
    "def exiger_roles(*roles: Role):\n" +
    "    def verificateur(user = Depends(get_current_user)):\n" +
    "        if user.role not in roles:\n" +
    "            raise HTTPException(403, \"Accès refusé : rôle insuffisant\")\n" +
    "        return user\n" +
    "    return verificateur"),
  P("Démarrage de l'ensemble de l'application en conteneurs, et exécution des tests :", { run: { bold: true } }),
  ...code("Terminal — déploiement et tests",
    "docker compose up --build     # db + backend + frontend\n" +
    "cd backend && pytest -q       # 19 tests back-end\n" +
    "cd frontend && npm test       # 2 tests front-end"),
  P("Mise en place de la machine à états : le statut d'une demande ne peut évoluer que selon des transitions autorisées (SOUMISE → VALIDÉE / REFUSÉE / ANNULÉE, et VALIDÉE → ANNULÉE). Centraliser ces règles dans une fonction dédiée garantit la cohérence métier : il devient impossible, par exemple, de valider une demande déjà refusée, et toute transition interdite renvoie une erreur 409. C'est un point fort du projet en matière de fiabilité."),
  pageBreak(),
];

const annexes = [
  H1("6. Titres, diplômes et annexes"),
  H2("Titres et diplômes"),
  fill("[À COMPLÉTER : listez vos diplômes et certifications éventuels.]"),
  H2("Curriculum Vitae"),
  fill("[À COMPLÉTER : joindre votre CV.]"),
  H2("Annexes techniques"),
  li("Dépôt GitHub du projet : https://github.com/glo007/congesflow"),
  li("Application déployée en ligne : https://congesflow-web.onrender.com"),
  li("Dossier Projet complet (mémoire) joint séparément."),
  li("Diagrammes, scripts SQL et documentation d'API dans le dépôt (dossier docs/)."),
];

const body = [cover, honneur, presentation, synthese, at1, at2, at3, annexes].flat(Infinity);

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "1B2A4A" },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0B5394", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "0B5394" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: "44505F" }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Dossier Professionnel — CDA   |   Page ", size: 18, color: "6B7785" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7785" })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/Dossier_Professionnel_CDA.docx", buf);
  console.log("OK Dossier_Professionnel_CDA.docx");
});
