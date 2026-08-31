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

