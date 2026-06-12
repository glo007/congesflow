#!/usr/bin/env python3
"""Rend les diagrammes (.mmd / .puml) en PNG via les serveurs de rendu publics.
Mermaid -> https://mermaid.ink   |   PlantUML -> https://www.plantuml.com
Aucune dependance externe (urllib + zlib de la lib standard).
"""
import base64
import glob
import os
import sys
import time
import urllib.request
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "images")
os.makedirs(OUT, exist_ok=True)


def fetch(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    with open(dest, "wb") as f:
        f.write(data)
    return len(data)


# ---- Mermaid (.mmd) ----
def render_mermaid(path):
    code = open(path, encoding="utf-8").read()
    b64 = base64.urlsafe_b64encode(code.encode("utf-8")).decode("ascii")
    url = f"https://mermaid.ink/img/{b64}?type=png&bgColor=FFFFFF"
    return url


# ---- PlantUML (.puml) ----
def _enc_byte(bb):
    if bb < 10:
        return chr(48 + bb)
    bb -= 10
    if bb < 26:
        return chr(65 + bb)
    bb -= 26
    if bb < 26:
        return chr(97 + bb)
    bb -= 26
    return "-" if bb == 0 else "_"


def _enc3(b1, b2, b3):
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return _enc_byte(c1) + _enc_byte(c2) + _enc_byte(c3) + _enc_byte(c4)


def plantuml_encode(text):
    comp = zlib.compress(text.encode("utf-8"), 9)[2:-4]  # raw deflate
    out = []
    i = 0
    while i < len(comp):
        if i + 2 < len(comp):
            out.append(_enc3(comp[i], comp[i + 1], comp[i + 2]))
        elif i + 1 < len(comp):
            out.append(_enc3(comp[i], comp[i + 1], 0))
        else:
            out.append(_enc3(comp[i], 0, 0))
        i += 3
    return "".join(out)


def render_plantuml(path):
    code = open(path, encoding="utf-8").read()
    return f"https://www.plantuml.com/plantuml/png/{plantuml_encode(code)}"


ok, ko = 0, 0
for path in sorted(glob.glob(os.path.join(HERE, "*.mmd")) + glob.glob(os.path.join(HERE, "*.puml"))):
    name = os.path.splitext(os.path.basename(path))[0]
    dest = os.path.join(OUT, name + ".png")
    try:
        url = render_mermaid(path) if path.endswith(".mmd") else render_plantuml(path)
        size = fetch(url, dest)
        if size < 800:  # trop petit = page d'erreur
            print(f"  ⚠️  {name}.png ({size} o) — vérifier le diagramme")
            ko += 1
        else:
            print(f"  ✓ {name}.png ({size // 1024} Ko)")
            ok += 1
        time.sleep(0.5)
    except Exception as e:
        print(f"  ✗ {name} : {e}")
        ko += 1

print(f"\n{ok} réussi(s), {ko} échec(s) → {OUT}")
sys.exit(0 if ko == 0 else 1)
