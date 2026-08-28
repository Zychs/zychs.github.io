# Sisyphus, Flipped — Sesefus Public Excerpts

**Canonical HTML artifacts site.** Zero-build. GitHub Pages ready.

**Live:** https://zychs.github.io

Neurialab builds drift-correction instruments; Sesefus is the first.

## Structure (canonical hierarchy)

```
index.html                 — video-friendly home + cards (direct links)
pages/
  resume.html              - J.D. Bardwell professional resume + work links
  instruments.html         — unified portfolio (Circadia · Scanner · Sesefus)
  circadia.html            — Circadia public door (Zig alarms, not done)
  artifact-scanner.html    — Artifact Scanner public door (nearly done)
  n-ai-ssance.html         — n-ai-ssance public Grok skill library (MIT)
  prologue.html            — Sisyphus, Flipped (origin essay)
  machine.html             — State of the Machine (master hub)
  drift.html               — Drift Architecture
  cheatsheet.html          — Command Cheatsheet (ssfs surface)
  ledger-2026-07-04.html   — Session Ledger 07·04
assets/
  JD-Bardwell-Resume-UX-QA-Accessibility.pdf - downloadable one-page resume
```

- Each `pages/*.html` is a **standalone canonical document** (extracted from quick context artifacts).
- Router / nav loads the real files (no prose duplicated in support.js or templates).
- Style & layout strictly anchored to **neurialab-web v3.5.4** (tokens, header treatment, spacing, cyan #7cf7ff, dark radial bg, JetBrains Mono + Outfit).

## Pages + roles

| Page                    | Role                              | Accent |
|-------------------------|-----------------------------------|--------|
| resume.html             | Professional profile + resume     | cyan   |
| prologue.html           | Public vision essay               | —      |
| machine.html            | Hub / spine (links to children)   | teal   |
| drift.html              | Architecture + disclosure gate    | teal   |
| cheatsheet.html         | Full CLI surface (wired/stub)     | amber  |
| ledger-2026-07-04.html  | Dated decisions + pitch kit       | ember  |

## Local dev

```bash
cd /mnt/c/dev/zychs.github.io   # or C:\dev\zychs.github.io
python -m http.server 8000
# open http://localhost:8000
```

Works with any static server. No build step for GitHub Pages.

## Source of truth (Tier A artifacts)

Extracted from Desktop "quick context":

- `Sisyphus Flipped - Prologue.dc.html` (clean)
- `Sesefus — State of the Machine_files/saved_resource.html`
- `sesefus — drift architecture.html` (inner) + zychs copy
- `Sesefus - Quick CLI Ledger .../67abc7af...html`
- `Sesefus — Session Ledger 07·04_files/saved_resource.html`

**quicker context capsules** are fact references (point to sections in the pages above).

**sesefus repo + repo-libs-naissance** = engineering truth.

## Sync note (2026-07-11)

- Pages extracted and wrapped with v3.5.4 chrome.
- Home is now thin cards → real pages.
- support.js thinned (no long prose copies).
- Disclosure + Neurialab line present on every page.

Cross-checked against:
- `/home/justavision/sesefus` + `/home/justavision/zychs/repo-libs-naissance`
- Equivalent Windows dev paths

No content invented. All prose from the artifacts or their synced capsules.

## IP / disclosure (mandatory)

- Public excerpts only.
- Prominent note on every page.
- One line: **Neurialab builds drift-correction instruments; Sesefus is the first.**

---

**For Everyone · Voice-First · Unhurried · Negentropic**
