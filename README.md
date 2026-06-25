# Sisyphus, Flipped

Circadian entrainment, audio journaling, and AI as a cognitive prosthetic.

A prologue project exploring **Sesefus** — AI-augmented recovery tools for individuals in therapeutic settings and beyond.

**View the site:** https://zychs.github.io

## Project

This repository hosts the project prologue and documentation for Sesefus, a comprehensive system built around:

- **Circadian entrainment** through structured audio journaling
- **Rich alarm scheduling** with profile-based management
- **Local-first AI inference** for cognitive augmentation
- **Voice-first interfaces** for accessibility in restricted environments

## Contents

- `index.html` — Full prologue essay with design and typographic styling
- `support.js` — Minimal supporting script
- `README.md` — This file

## Development

To run locally:

```bash
# Clone the repository
git clone https://github.com/zychs/zychs.github.io
cd zychs.github.io

# Serve with a local server (Python)
python -m http.server 8000

# Or with Node.js
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## Architecture Overview

- **Host + Client Model** — Scalable audio capture and processing
- **Local Inference** — vLLM integration for local language model support
- **Vault Storage** — Encrypted audio and artifact databases
- **TCP-based Communication** — Low-latency client-server messaging

## Technologies

- **Language:** HTML5 + CSS3, JavaScript
- **Fonts:** Outfit (body), JetBrains Mono (code/headings)
- **Styling:** Custom gradient backgrounds with responsive typography

## Related Work

- **Core Engine:** Zig-based Circadia/Sesefus alarm system
- **Inference Layer:** Crow-9B-HERETIC via local vLLM
- **Infrastructure:** LeadLogic-Engine for embedding and reflection

---

**For Everyone · Voice-First · Unhurried · Negentropic**
