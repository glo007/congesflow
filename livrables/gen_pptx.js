const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";

const DIMG = path.join(__dirname, "..", "docs", "diagrammes", "images");
const SHOTS = path.join(__dirname, "..", "docs", "screenshots");
const pngSize = (f) => { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
// place une image (chemin complet) en la centrant dans une boîte (bx,by,bw,bh), ratio conservé
const imgFitPath = (s, f, bx, by, bw, bh) => {
  const { w, h } = pngSize(f);
  const iw0 = w / 96, ih0 = h / 96;
  const scale = Math.min(bw / iw0, bh / ih0);
  const iw = iw0 * scale, ih = ih0 * scale;
  s.addImage({ path: f, x: bx + (bw - iw) / 2, y: by + (bh - ih) / 2, w: iw, h: ih });
};
const imgFit = (s, name, bx, by, bw, bh) => imgFitPath(s, path.join(DIMG, name + ".png"), bx, by, bw, bh);
const shotImg = (s, file, bx, by, bw, bh) => imgFitPath(s, path.join(SHOTS, file), bx, by, bw, bh);

// Palette (Ocean — professionnel, sobre)
const NAVY = "0A1A2F", PRIMARY = "0B5394", TEAL = "1C7293", MIST = "EAF1F6";
const INK = "1B2A3A", MUTE = "5B6B7B", WHITE = "FFFFFF", ACCENT = "13A89E";
const FH = "Cambria", FB = "Calibri";

// helpers
const titleSlide = () => {
  const s = p.addSlide();
  s.background = { color: NAVY };
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: NAVY } });
  s.addText("CongésFlow", { x: 0.9, y: 2.2, w: 11.5, h: 1.2, fontFace: FH, fontSize: 60, bold: true, color: WHITE });
  s.addText("Application web de gestion des demandes de congés", { x: 0.9, y: 3.4, w: 11.5, h: 0.6, fontFace: FB, fontSize: 22, color: "AFC6DC", italic: true });
  s.addShape("line", { x: 0.95, y: 4.2, w: 3.2, h: 0, line: { color: ACCENT, width: 3 } });
  s.addText([
    { text: "Soutenance — Titre Professionnel CDA (RNCP niveau 6)\n", options: { fontSize: 16, color: WHITE, bold: true } },
    { text: "Concepteur Développeur d'Applications · ESTIAM · 2025-2026", options: { fontSize: 14, color: "AFC6DC" } },
  ], { x: 0.9, y: 4.5, w: 11.5, h: 1, fontFace: FB });
  s.addText("BOUNGOU MBIMI Gloire Bryan  ·  Encadrant : M'hand BOUFALA", { x: 0.9, y: 6.5, w: 11.5, h: 0.5, fontFace: FB, fontSize: 13, color: "8FA9C2" });
  return s;
};

const header = (s, kicker, title) => {
  s.background = { color: WHITE };
  s.addText(kicker.toUpperCase(), { x: 0.7, y: 0.45, w: 12, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: ACCENT, charSpacing: 2 });
  s.addText(title, { x: 0.7, y: 0.72, w: 12, h: 0.7, fontFace: FH, fontSize: 30, bold: true, color: NAVY });
};

const card = (s, x, y, w, h, fill) => s.addShape("roundRect", { x, y, w, h, rectRadius: 0.08, fill: { color: fill || MIST }, line: { color: "DCE6EE", width: 1 }, shadow: { type: "outer", blur: 6, offset: 2, angle: 90, color: "B9C6D2", opacity: 0.3 } });

const iconDot = (s, x, y, label, color) => {
  s.addShape("ellipse", { x, y, w: 0.5, h: 0.5, fill: { color: color || PRIMARY } });
  s.addText(label, { x, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: FB, fontSize: 16, bold: true, color: WHITE });
};

const shotBox = (s, x, y, w, h, legende) => {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: "F4F8FB" }, line: { color: PRIMARY, width: 1.5, dashType: "dash" } });
  s.addText([
    { text: "📷 CAPTURE D'ÉCRAN À INSÉRER\n", options: { fontSize: 14, bold: true, color: PRIMARY } },
    { text: legende, options: { fontSize: 11, color: MUTE, italic: true } },
  ], { x: x + 0.2, y, w: w - 0.4, h, align: "center", valign: "middle", fontFace: FB });
};

// 1. Titre
titleSlide();

// 2. Sommaire
(() => {
  const s = p.addSlide(); header(s, "Plan", "Déroulé de la présentation");
  const items = [
    ["1", "Contexte & problématique"], ["2", "Solutions existantes & positionnement"],
    ["3", "Périmètre fonctionnel & rôles"], ["4", "Architecture technique"],
    ["5", "Conception & modélisation"], ["6", "Sécurité de l'application"],
    ["7", "Démonstration"], ["8", "Tests & qualité"],
    ["9", "Couverture des 3 blocs"], ["10", "Bilan & perspectives"],
  ];
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.7 + col * 6.2, y = 1.7 + row * 1.0;
    iconDot(s, x, y, it[0], i % 2 ? TEAL : PRIMARY);
    s.addText(it[1], { x: x + 0.65, y, w: 5.3, h: 0.5, valign: "middle", fontFace: FB, fontSize: 16, color: INK });
  });
})();

// 3. Contexte & problématique
(() => {
  const s = p.addSlide(); header(s, "01 · Contexte", "Un processus RH encore trop manuel");
  card(s, 0.7, 1.7, 5.9, 4.6);
  s.addText([
    { text: "Le constat\n\n", options: { fontSize: 18, bold: true, color: PRIMARY } },
    { text: "Dans beaucoup de PME, les congés se gèrent par e-mail et tableurs :\n\n", options: { fontSize: 14, color: INK } },
    { text: "• Erreurs de calcul des soldes\n• Demandes perdues ou non tracées\n• Validation managériale informelle\n• Aucune sécurité sur les données", options: { fontSize: 14, color: INK } },
  ], { x: 1.0, y: 2.0, w: 5.3, h: 3.9, fontFace: FB, valign: "top", lineSpacingMultiple: 1.1 });
  card(s, 6.9, 1.7, 5.7, 4.6, NAVY);
  s.addText("Problématique", { x: 7.2, y: 2.1, w: 5.1, h: 0.5, fontFace: FH, fontSize: 18, bold: true, color: ACCENT });
  s.addText("Comment fiabiliser et fluidifier la gestion des demandes de congés au sein d'une PME, tout en garantissant la sécurité des données et le respect des rôles de l'organisation ?",
    { x: 7.2, y: 2.7, w: 5.1, h: 3.3, fontFace: FB, fontSize: 18, color: WHITE, italic: true, valign: "top", lineSpacingMultiple: 1.2 });
})();

// 4. Solutions existantes
(() => {
  const s = p.addSlide(); header(s, "02 · État de l'art", "Solutions existantes & positionnement");
  const rows = [
    ["Critère", "SIRH du marché", "Tableur Excel", "CongésFlow"],
    ["Coût pour une PME", "Élevé", "Gratuit", "Auto-hébergé"],
    ["Sécurité / rôles", "Oui", "Aucune", "JWT + RBAC"],
    ["Suivi des soldes", "Auto", "Manuel", "Auto"],
    ["Workflow validation", "Intégré", "Par e-mail", "Tracé"],
  ];
  const colW = [3.0, 3.0, 3.0, 2.93];
  let y = 1.8;
  rows.forEach((r, ri) => {
    let x = 0.7;
    r.forEach((c, ci) => {
      const isHead = ri === 0, isUs = ci === 3;
      s.addShape("rect", { x, y, w: colW[ci], h: 0.78, fill: { color: isHead ? PRIMARY : (isUs ? "E3F4F2" : (ri % 2 ? "F4F8FB" : WHITE)) }, line: { color: "DCE6EE", width: 1 } });
      s.addText(c, { x: x + 0.1, y, w: colW[ci] - 0.2, h: 0.78, valign: "middle", align: ci === 0 ? "left" : "center", fontFace: FB, fontSize: 13, bold: isHead || isUs, color: isHead ? WHITE : INK });
      x += colW[ci];
    });
    y += 0.78;
  });
  s.addText("→ Positionnement : un outil léger, ciblé, sécurisé et déployable en interne pour la PME.", { x: 0.7, y: 5.9, w: 11.9, h: 0.5, fontFace: FB, fontSize: 15, italic: true, color: TEAL });
})();

// 5. Périmètre & rôles
(() => {
  const s = p.addSlide(); header(s, "03 · Périmètre", "Fonctionnalités (MoSCoW) & rôles");
  card(s, 0.7, 1.7, 7.2, 4.7);
  s.addText("Périmètre fonctionnel", { x: 1.0, y: 1.9, w: 6.6, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: PRIMARY });
  s.addText([
    { text: "MUST  ", options: { bold: true, color: ACCENT } }, { text: "Auth JWT · poser une demande · calcul jours ouvrés · contrôle du solde · validation manager · pilotage RH des soldes\n\n", options: { color: INK } },
    { text: "SHOULD  ", options: { bold: true, color: TEAL } }, { text: "calendrier d'équipe · tableau de bord · détection des chevauchements\n\n", options: { color: INK } },
    { text: "COULD  ", options: { bold: true, color: MUTE } }, { text: "notifications e-mail · jours fériés · export\n\n", options: { color: INK } },
    { text: "WON'T  ", options: { bold: true, color: MUTE } }, { text: "paie · multi-entreprise · mobile natif", options: { color: MUTE } },
  ], { x: 1.0, y: 2.35, w: 6.6, h: 3.9, fontFace: FB, fontSize: 13, valign: "top", lineSpacingMultiple: 1.05 });
  card(s, 8.2, 1.7, 4.4, 4.7, NAVY);
  s.addText("Rôles (RBAC)", { x: 8.5, y: 1.9, w: 3.8, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: ACCENT });
  [["Salarié", "pose, consulte, annule ses demandes"], ["Manager", "valide / refuse son équipe"], ["RH / Admin", "gère soldes & supervise tout"]].forEach((r, i) => {
    const y = 2.45 + i * 1.25;
    s.addText(r[0], { x: 8.5, y, w: 3.8, h: 0.4, fontFace: FB, fontSize: 15, bold: true, color: WHITE });
    s.addText(r[1], { x: 8.5, y: y + 0.38, w: 3.8, h: 0.7, fontFace: FB, fontSize: 12, color: "AFC6DC" });
  });
})();

// 6. Architecture
(() => {
  const s = p.addSlide(); header(s, "04 · Architecture", "Une application multicouche");
  const layers = [
    ["React + TypeScript", "SPA · Tailwind · React Query", PRIMARY],
    ["API REST — FastAPI", "JWT · RBAC · validation Pydantic", TEAL],
    ["Logique métier (Python)", "jours ouvrés · soldes · machine à états", ACCENT],
    ["ORM SQLAlchemy → PostgreSQL", "requêtes préparées · contraintes", "0A6E63"],
  ];
  layers.forEach((l, i) => {
    const y = 1.8 + i * 1.12;
    s.addShape("roundRect", { x: 1.6, y, w: 7.0, h: 0.92, rectRadius: 0.06, fill: { color: l[2] } });
    s.addText(l[0], { x: 1.9, y: y + 0.08, w: 6.5, h: 0.45, fontFace: FB, fontSize: 16, bold: true, color: WHITE });
    s.addText(l[1], { x: 1.9, y: y + 0.5, w: 6.5, h: 0.35, fontFace: FB, fontSize: 11, color: "EAF1F6" });
    if (i < 3) s.addShape("line", { x: 5.1, y: y + 0.92, w: 0, h: 0.2, line: { color: MUTE, width: 1.5, endArrowType: "triangle" } });
  });
  card(s, 9.1, 1.8, 3.5, 4.5);
  s.addText("DevOps & qualité", { x: 9.3, y: 2.0, w: 3.1, h: 0.4, fontFace: FH, fontSize: 15, bold: true, color: PRIMARY });
  s.addText("• Docker + docker-compose\n• CI GitHub Actions\n• Git (main / develop / feature)\n• pytest + Vitest\n• Documentation OpenAPI auto", { x: 9.3, y: 2.5, w: 3.1, h: 3.6, fontFace: FB, fontSize: 13, color: INK, valign: "top", lineSpacingMultiple: 1.3 });
})();

// 7. Conception / modélisation — vue d'ensemble
(() => {
  const s = p.addSlide(); header(s, "05 · Conception", "Modélisation : 10 diagrammes UML / Merise");
  const tiles = [
    ["Contexte", "01-contexte"], ["Cas d'utilisation", "02-cas-utilisation"],
    ["Activité", "03-activite-demande"], ["Séquence", "04-sequence-creation"],
    ["État-transition", "05-etat-demande"], ["Classes", "06-classes"],
    ["MCD / Merise", "07-mcd"], ["Objets", "08-objets"],
    ["Composants", "09-composants"], ["Déploiement", "10-deploiement"],
  ];
  tiles.forEach((t, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = 0.7 + col * 2.42, y = 1.9 + row * 2.4;
    card(s, x, y, 2.25, 2.15);
    imgFit(s, t[1], x + 0.12, y + 0.12, 2.01, 1.55);
    s.addText(t[0], { x: x + 0.05, y: y + 1.72, w: 2.15, h: 0.35, align: "center", valign: "middle", fontFace: FB, fontSize: 11, bold: true, color: INK });
  });
  s.addText("Sources Mermaid / PlantUML versionnées dans le dépôt (docs/diagrammes/). Diagrammes en grand sur les slides suivantes.", { x: 0.7, y: 6.85, w: 11.9, h: 0.4, fontFace: FB, fontSize: 12, italic: true, color: MUTE });
})();

// 7bis. Slides dédiées aux diagrammes clés (image en grand)
const grandsDiagrammes = [
  ["05 · Conception", "Diagramme de cas d'utilisation", "02-cas-utilisation"],
  ["05 · Conception", "Modèle conceptuel de données (MCD)", "07-mcd"],
  ["05 · Conception", "Diagramme de classes", "06-classes"],
  ["05 · Conception", "Cycle de vie d'une demande (état-transition)", "05-etat-demande"],
  ["04 · Architecture", "Diagramme de déploiement", "10-deploiement"],
];
grandsDiagrammes.forEach(([k, titre, name]) => {
  const s = p.addSlide(); header(s, k, titre);
  imgFit(s, name, 0.7, 1.6, 11.9, 5.5);
});

// 8. Focus métier
(() => {
  const s = p.addSlide(); header(s, "06 · Cœur métier", "Règles métier & machine à états");
  card(s, 0.7, 1.7, 5.9, 4.7);
  s.addText("Machine à états d'une demande", { x: 1.0, y: 1.95, w: 5.3, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: PRIMARY });
  const states = [["SOUMISE", ACCENT], ["VALIDÉE", "1E7E4F"], ["REFUSÉE", "B23A48"], ["ANNULÉE", MUTE]];
  states.forEach((st, i) => {
    const y = 2.5 + i * 0.92;
    s.addShape("roundRect", { x: 1.1, y, w: 2.4, h: 0.6, rectRadius: 0.3, fill: { color: st[1] } });
    s.addText(st[0], { x: 1.1, y, w: 2.4, h: 0.6, align: "center", valign: "middle", fontFace: FB, fontSize: 14, bold: true, color: WHITE });
  });
  s.addText("→ valide / −solde\n→ refuse\n→ annule / +solde", { x: 3.7, y: 2.55, w: 2.7, h: 3.3, fontFace: FB, fontSize: 12, color: INK, valign: "top", lineSpacingMultiple: 2.2 });
  card(s, 6.9, 1.7, 5.7, 4.7);
  s.addText("Logique testable & isolée", { x: 7.2, y: 1.95, w: 5.1, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: PRIMARY });
  s.addText([
    { text: "compter_jours_ouvres()", options: { fontFace: "Courier New", bold: true, color: NAVY } },
    { text: "  exclut samedis et dimanches\n\n", options: { color: INK } },
    { text: "solde_suffisant()", options: { fontFace: "Courier New", bold: true, color: NAVY } },
    { text: "  refuse si dépassement\n\n", options: { color: INK } },
    { text: "transition_possible()", options: { fontFace: "Courier New", bold: true, color: NAVY } },
    { text: "  bloque les transitions incohérentes\n\n", options: { color: INK } },
    { text: "Fonctions pures → couvertes par des tests unitaires.", options: { italic: true, color: TEAL } },
  ], { x: 7.2, y: 2.5, w: 5.1, h: 3.7, fontFace: FB, fontSize: 14, valign: "top", lineSpacingMultiple: 1.1 });
})();

// 9. Sécurité
(() => {
  const s = p.addSlide(); header(s, "07 · Sécurité", "Une application sécurisée (Bloc 2)");
  const items = [
    ["JWT", "Authentification par jeton signé, serveur sans état"],
    ["bcrypt", "Mots de passe hachés, jamais stockés en clair"],
    ["RBAC", "3 rôles, autorisations vérifiées côté serveur"],
    ["ORM", "Requêtes préparées → anti-injection SQL"],
    ["CORS", "Origines restreintes au front autorisé"],
    ["Validation", "Schémas Pydantic sur toutes les entrées"],
  ];
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.7 + col * 6.1, y = 1.75 + row * 1.55;
    card(s, x, y, 5.8, 1.35);
    iconDot(s, x + 0.3, y + 0.42, "🔒", PRIMARY);
    s.addText(it[0], { x: x + 1.0, y: y + 0.15, w: 4.6, h: 0.4, fontFace: FB, fontSize: 15, bold: true, color: NAVY });
    s.addText(it[1], { x: x + 1.0, y: y + 0.58, w: 4.6, h: 0.6, fontFace: FB, fontSize: 12, color: MUTE });
  });
})();

// 10. Démonstration
(() => {
  const s = p.addSlide(); header(s, "08 · Démonstration", "L'application en ligne — congesflow-web.onrender.com");
  [
    ["fig13-login.png", "Connexion", 0.7, 1.7],
    ["fig14-mes-demandes.png", "Espace salarié", 6.7, 1.7],
    ["fig15-validation.png", "Validation manager", 0.7, 4.2],
    ["fig16-dashboard.png", "Tableau de bord", 6.7, 4.2],
  ].forEach(([file, cap, x, y]) => {
    card(s, x, y, 5.9, 2.4);
    shotImg(s, file, x + 0.12, y + 0.12, 5.66, 1.9);
    s.addText(cap, { x: x, y: y + 2.0, w: 5.9, h: 0.3, align: "center", fontFace: FB, fontSize: 12, bold: true, color: INK });
  });
})();

// 11. Tests & qualité
(() => {
  const s = p.addSlide(); header(s, "09 · Qualité", "Tests & industrialisation");
  const stats = [["21/21", "tests au vert"], ["100%", "réussite"], ["3", "couches testées"]];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 1.8, 3.75, 2.0, NAVY);
    s.addText(st[0], { x, y: 2.0, w: 3.75, h: 1.0, align: "center", fontFace: FH, fontSize: 44, bold: true, color: ACCENT });
    s.addText(st[1], { x, y: 3.0, w: 3.75, h: 0.5, align: "center", fontFace: FB, fontSize: 14, color: WHITE });
  });
  card(s, 0.7, 4.1, 11.9, 2.3);
  s.addText("Stratégie de test", { x: 1.0, y: 4.3, w: 11.3, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: PRIMARY });
  s.addText([
    { text: "Unitaires  ", options: { bold: true, color: TEAL } }, { text: "logique métier (jours ouvrés, soldes, machine à états) — pytest\n", options: { color: INK } },
    { text: "Intégration  ", options: { bold: true, color: TEAL } }, { text: "parcours API complets : login, création, RBAC, transitions interdites — httpx\n", options: { color: INK } },
    { text: "Front  ", options: { bold: true, color: TEAL } }, { text: "fonctions d'affichage — Vitest    ·    CI GitHub Actions à chaque push", options: { color: INK } },
  ], { x: 1.0, y: 4.75, w: 11.3, h: 1.5, fontFace: FB, fontSize: 14, valign: "top", lineSpacingMultiple: 1.25 });
})();

// 12. Couverture des 3 blocs
(() => {
  const s = p.addSlide(); header(s, "10 · Référentiel", "Couverture des 3 blocs de compétences");
  const blocs = [
    ["Bloc 1", "Front-end sécurisé", "React/TS · maquettes Figma · routes par rôle · consommation API", PRIMARY],
    ["Bloc 2", "Back-end sécurisé", "API FastAPI · PostgreSQL · JWT/RBAC · bcrypt · OWASP", TEAL],
    ["Bloc 3", "Conception & organisation", "UML · agile/MoSCoW · tests · Docker · CI/CD · Git", ACCENT],
  ];
  blocs.forEach((b, i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 1.8, 3.75, 4.4);
    s.addShape("roundRect", { x, y: 1.8, w: 3.75, h: 0.9, rectRadius: 0.06, fill: { color: b[3] } });
    s.addText(b[0], { x, y: 1.9, w: 3.75, h: 0.7, align: "center", fontFace: FH, fontSize: 22, bold: true, color: WHITE });
    s.addText(b[1], { x: x + 0.2, y: 2.95, w: 3.35, h: 0.7, align: "center", fontFace: FB, fontSize: 15, bold: true, color: NAVY });
    s.addText(b[2], { x: x + 0.25, y: 3.7, w: 3.25, h: 2.3, fontFace: FB, fontSize: 13, color: INK, valign: "top", lineSpacingMultiple: 1.2 });
  });
})();

// 13. Bilan & perspectives
(() => {
  const s = p.addSlide(); header(s, "Bilan", "Conclusion & perspectives");
  card(s, 0.7, 1.75, 3.85, 4.5);
  s.addText("Acquis", { x: 0.95, y: 1.95, w: 3.4, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: "1E7E4F" });
  s.addText("• Application full-stack fonctionnelle\n• Sécurité conforme aux standards\n• Démarche de conception complète\n• Chaîne DevOps en place", { x: 0.95, y: 2.45, w: 3.4, h: 3.6, fontFace: FB, fontSize: 13, color: INK, valign: "top", lineSpacingMultiple: 1.4 });
  card(s, 4.75, 1.75, 3.85, 4.5);
  s.addText("Limites", { x: 5.0, y: 1.95, w: 3.4, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: "B23A48" });
  s.addText("• Pas de jours fériés\n• Notifications e-mail non faites\n• Validation à un seul niveau", { x: 5.0, y: 2.45, w: 3.4, h: 3.6, fontFace: FB, fontSize: 13, color: INK, valign: "top", lineSpacingMultiple: 1.4 });
  card(s, 8.8, 1.75, 3.8, 4.5, NAVY);
  s.addText("Perspectives", { x: 9.05, y: 1.95, w: 3.3, h: 0.4, fontFace: FH, fontSize: 16, bold: true, color: ACCENT });
  s.addText("• Notifications e-mail\n• Calendrier d'équipe\n• Jours fériés\n• Export comptable\n• Application mobile", { x: 9.05, y: 2.45, w: 3.3, h: 3.6, fontFace: FB, fontSize: 13, color: WHITE, valign: "top", lineSpacingMultiple: 1.4 });
})();

// 14. Merci
(() => {
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText("Merci de votre attention", { x: 0.9, y: 2.8, w: 11.5, h: 1.0, fontFace: FH, fontSize: 44, bold: true, color: WHITE });
  s.addShape("line", { x: 0.95, y: 3.9, w: 3.0, h: 0, line: { color: ACCENT, width: 3 } });
  s.addText("Place à vos questions", { x: 0.9, y: 4.1, w: 11.5, h: 0.6, fontFace: FB, fontSize: 20, color: "AFC6DC", italic: true });
  s.addText("App : congesflow-web.onrender.com   ·   Code : github.com/glo007/congesflow", { x: 0.9, y: 6.6, w: 11.5, h: 0.5, fontFace: FB, fontSize: 13, color: "8FA9C2" });
})();

p.writeFile({ fileName: __dirname + "/Presentation_Soutenance_CongesFlow.pptx" }).then((f) => console.log("OK", f));
