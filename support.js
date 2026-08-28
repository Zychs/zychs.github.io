// Sesefus public site — thin router only.
// Canonical content now lives in pages/*.html (standalone, extracted from artifacts).
// This file kept minimal to avoid duplicating prose. Direct links or simple hash redirects preferred.


(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const viewRoot = () => $('#view-root');
  const nav = () => $('#top-nav');

  // Curated public excerpts (high-signal only, IP-safe)
  const capsuleDetails = {
    architecture: {
      title: 'Architecture — Layer Cake',
      html: `<p>Sesefus = offline-first audio journaling + circadian prosthetic.</p>
<pre><code>User (voice or UI)
  │
  ▼
Zig Client (edge) — WinMM waveIn / TCP frames → host
  │ WAV stream
  ▼
Zig Host Daemon (port 3000) — scheduler, router, ChaCha20-Poly1305
  │
  ▼
Encrypted Vault (sesephus_vault.db)
  │
  +-- Python FastAPI bridge (port 3001) — Whisper + ETDI
        │
        ▼
      React + Vite dashboard (port 5173)</code></pre>
<p><strong>Key components:</strong> Circadia (alarm), Arcadium (journal), Vault (AEAD), ETDI pipeline, Semantic router (future).</p>
<p>Edge mesh: desktop hub owns vault + heavy models; clients capture + buffer. Zero-cloud core.</p>`
    },
    cli: {
      title: 'CLI — ssfs Command Surface',
      html: `<p>Global entry: <code>ssfs</code> (via ssfs.bat wrapper).</p>
<h4>Global Flags</h4>
<ul>
  <li><code>--production</code> — required for destructive ops</li>
  <li><code>--dry-run</code> / <code>-n</code></li>
  <li><code>--json</code></li>
  <li><code>--help</code> / <code>-h</code></li>
</ul>
<h4>Core Modules (excerpt)</h4>
<table style="width:100%; font-size:13px; border-collapse:collapse;">
  <tr><td><strong>status</strong></td><td>Speak current state + next rhythm cue</td></tr>
  <tr><td><strong>journal record [mins]</strong></td><td>Voice capture (default sustainable)</td></tr>
  <tr><td><strong>journal review last</strong></td><td>Playback</td></tr>
  <tr><td><strong>rhythm schedule morning/evening</strong></td><td>Circadian anchors</td></tr>
  <tr><td><strong>stoic daily-reflection</strong></td><td>Guided evening review</td></tr>
  <tr><td><strong>stoic virtue-check &lt;virtue&gt;</strong></td><td>courage / wisdom / temperance / justice</td></tr>
  <tr><td><strong>stoic obstacle</strong></td><td>Reframe current block</td></tr>
  <tr><td><strong>vault status / key-verify</strong></td><td>Encryption metadata + verify</td></tr>
</table>
<p><strong>Typical:</strong> <code>ssfs status &amp;&amp; ssfs journal record 8</code></p>`
    },
    etdi: {
      title: 'ETDI — Emotional Time Density Index',
      html: `<p>Single trendable number for perceptual time bias. No manual ratings.</p>
<pre><code>ETDI = (|valence| × arousal × salience) / duration_minutes</code></pre>
<p>valence (−1…+1), arousal, salience (0…1), duration (mins, floor 0.05).</p>
<p><strong>Pipeline:</strong> Record (aurgio) → Transcribe (local Whisper) → Infer → Compute + upsert etdi.db → Dashboard panels.</p>
<p>Higher = denser emotional signal per unit time.</p>`
    },
    vault: {
      title: 'Vault — Security &amp; Storage',
      html: `<p>Encrypted path resolution with magic header <code>SESEPHUS</code>.</p>
<ul>
  <li>ChaCha20-Poly1305 AEAD + PBKDF2 key derivation</li>
  <li>Public key verify via CLI without exposing password</li>
  <li>Drive checks + graceful fallback to CWD</li>
  <li>Offline client buffering on disconnect</li>
</ul>
<p>Never hardcode drive letters. Use config + ssfs/storage discipline.</p>`
    },
    vision: {
      title: 'Vision — Sovereign Edge Mesh',
      html: `<ul>
  <li><strong>Edge mesh:</strong> high-compute desktop hub + heterogeneous clients (capture + local buffer)</li>
  <li><strong>Adaptive Voice (LoRA):</strong> user-corrected transcripts train rank-8 adapter locally for personalized STT</li>
  <li><strong>Semantic Routing:</strong> bypass LLM for structured queries (&lt;100ms) — PII stays local</li>
  <li><strong>CONF-KV:</strong> confidence-based eviction + bilateral structural protection of cache prefix/suffix</li>
  <li><strong>APreQEL + mixed precision:</strong> protect critical layers under thermal/battery constraints</li>
</ul>`
    }
  };

  const stateDetails = {
    inventory: {
      title: 'State — Inventory Snapshot',
      html: `<p>Live data flow: speak → Zig client (WAV/TCP) → Zig host (encrypt) → Python (Whisper+ETDI) → React dashboard.</p>
<p><strong>High-signal touch points (public view):</strong> core/sesephus/src/host.zig, dashboard_server.py, tools/etdi_pipeline.py, ssfs.bat, docs/ETDI.md</p>
<p>~226 files. Current focus: ETDI scoring + dashboard + voice control.</p>`
    }
  };

  function wireRouteLinks(container) {
    $$('.route-link', container).forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const r = a.getAttribute('data-route') || a.getAttribute('href').replace('#', '');
        navigate(r);
      });
    });
  }

  function renderHome() {
    const html = `
      <div style="max-width:46rem;margin:0 auto;padding:32px 24px 64px;color:#e7e7f2;font-family:'Outfit',system-ui,sans-serif;font-weight:300;font-size:17px;line-height:1.72;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(124,247,255,0.85);display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;">⬡</span> <span>Sesefus</span> <span style="color:#3a3a4d;">/</span> <span style="color:#7b7b92;">Data Navigator</span>
        </div>

        <h1 style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:clamp(28px,5vw,40px);margin:16px 0 8px;">Sisyphus, Flipped — Live Data</h1>
        <p style="color:#a7a7bd;max-width:34rem;">Click through the prologue + data from the working ledgers, cheatsheets, and architecture docs (Session Ledger, Whole Machine, CLI Cheatsheets, Drift Architecture, Branch Audit, etc.). All public excerpts, kept in sync with the repos.</p>

        <div style="margin:28px 0 12px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9fe9f1;">Start here</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px;">
          <div onclick="navigate('prologue')" class="nav-card">Prologue Essay<br><span style="opacity:.6;font-size:12px;">The full public post</span></div>
          <div onclick="navigate('systems')" class="nav-card">Systems<br><span style="opacity:.6;font-size:12px;">Architecture • CLI • ETDI • Vault • Vision</span></div>
          <div onclick="navigate('reference')" class="nav-card">Whole Machine Reference<br><span style="opacity:.6;font-size:12px;">Complete command grid (wired / stub / legacy)</span></div>
          <div onclick="navigate('specs')" class="nav-card">Specs<br><span style="opacity:.6;font-size:12px;">Cognitive fidelity • Security</span></div>
          <div onclick="navigate('state')" class="nav-card">State<br><span style="opacity:.6;font-size:12px;">Inventory &amp; current signals</span></div>
          <div onclick="navigate('ledgers')" class="nav-card">Ledgers &amp; Sources<br><span style="opacity:.6;font-size:12px;">Session Ledger, Drift, Audits, Cheatsheets</span></div>
          <div onclick="navigate('repos')" class="nav-card">Repos<br><span style="opacity:.6;font-size:12px;">sesefus + repo-libs-naissance (verified)</span></div>
        </div>

        <div style="margin-top:32px;padding:18px 20px;border:1px solid #272739;border-radius:12px;background:rgba(16,16,24,0.6);font-size:14px;">
          <strong>IP note:</strong> Curated public demo for video. Sources: quicker context + the six H:\My Drive ledgers/cheatsheets/arch docs. Full material stays in the repos + your Drive.
        </div>

        <div style="margin:40px 0 0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5a5a70;">For Everyone · Voice-First · Unhurried · Negentropic</div>
      </div>`;
    const root = viewRoot();
    root.innerHTML = html;
    // style cards
    $$('.nav-card', root).forEach(c => {
      c.style.cssText = 'cursor:pointer;padding:16px 18px;border:1px solid #272739;border-radius:12px;background:rgba(16,16,24,0.7);transition:transform .1s,border-color .1s;';
      c.onmouseenter = () => { c.style.borderColor = 'rgba(124,247,255,0.4)'; c.style.transform='translateY(-1px)'; };
      c.onmouseleave = () => { c.style.borderColor = '#272739'; c.style.transform=''; };
    });
  }

  function renderPrologue() {
    // Clone the original rich content from the hidden template
    const tpl = $('#tpl-prologue');
    const root = viewRoot();
    if (!tpl) {
      root.innerHTML = '<p>Prologue content unavailable.</p>';
      return;
    }
    root.innerHTML = tpl.innerHTML;

    // Post-wire interactive terms from the post (basic click-through)
    const post = root;
    const terms = [
      {text: 'ssfs', route: 'systems/cli'},
      {text: 'CLI', route: 'systems/cli'},
      {text: 'Zig', route: 'systems'},
      {text: 'host + client', route: 'systems/architecture'},
      {text: 'artifact database', route: 'systems'},
      {text: 'circadian entrainment', route: 'systems'},
      {text: 'cognitive prosthetic', route: 'home'},
      {text: 'vLLM', route: 'repos'},
      {text: 'Crow-9B', route: 'repos'},
      {text: 'vault', route: 'systems/vault'},
    ];
    terms.forEach(t => {
      // simple text replace for first occurrences inside p/li (non-destructive for video)
      $$('p, li', post).forEach(el => {
        if (el.textContent.includes(t.text) && !el.querySelector('a.route-link')) {
          el.innerHTML = el.innerHTML.replace(
            new RegExp('\\b' + t.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'),
            `<a href="#/${t.route}" class="route-link" data-route="${t.route}" style="color:#7cf7ff;text-decoration:underline;cursor:pointer;">${t.text}</a>`
          );
        }
      });
    });

    wireRouteLinks(root);
  }

  function renderSystems() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:46rem;margin:0 auto;padding:32px 24px 80px;color:#e7e7f2;font-family:'Outfit',system-ui,sans-serif;">
        <div style="font-family:'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;font-size:11px;color:#9fe9f1;">CORE SYSTEMS</div>
        <h2 style="font-family:'JetBrains Mono',monospace;margin:6px 0 20px;font-size:26px;">Layered Architecture + CLI</h2>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-bottom:24px;">
          ${Object.keys(capsuleDetails).map(k => {
            const c = capsuleDetails[k];
            return `<div class="sys-card" data-key="${k}" style="padding:14px 16px;border:1px solid #272739;border-radius:12px;background:rgba(16,16,24,0.7);cursor:pointer;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#7cf7ff;">${c.title.split('—')[0].trim()}</div>
              <div style="font-size:13px;opacity:.85;margin-top:4px;">${c.title.split('—')[1] || ''}</div>
            </div>`;
          }).join('')}
        </div>

        <div id="sys-detail" style="padding:18px 20px;border:1px solid #272739;border-radius:14px;background:rgba(10,10,16,0.85);min-height:120px;display:none;"></div>

        <div style="margin-top:18px;font-size:12px;opacity:.7;">Click a capsule above. Content drawn from quicker context (2026-07-07) aligned to sesefus repo.</div>
      </div>`;

    $$('.sys-card', root).forEach(card => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-key');
        const d = capsuleDetails[key];
        const det = $('#sys-detail', root);
        det.style.display = 'block';
        det.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#9fe9f1;margin-bottom:8px;">${d.title}</div>${d.html}
          <div style="margin-top:12px;"><a href="#/systems" class="route-link" data-route="systems" style="font-size:12px;color:#7cf7ff;">close detail</a></div>`;
        wireRouteLinks(det);
      });
    });
  }

  function renderSpecs() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:46rem;margin:0 auto;padding:32px 24px;color:#e7e7f2;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9fe9f1;">SPECS</div>
        <h2 style="font-family:'JetBrains Mono',monospace;margin:6px 0 18px;">Cognitive Fidelity &amp; Security</h2>

        <div class="spec-block">
          <h3 style="font-size:15px;margin:0 0 6px;">Cognitive Fidelity</h3>
          <p style="margin:0 0 8px;">Goal: high-fidelity local LLM analysis on consumer hardware without destroying user-specific semantic fields.</p>
          <p style="margin:0;">Generic 4-bit quant crushes outliers. Solution: user Gemini conversations as calibration for custom Imatrix (Fisher-like). Protects the semantic poles that matter to <em>you</em>.</p>
          <p style="margin-top:8px;font-size:12px;opacity:.7;">See specs/cognitive-fidelity.md in quicker context.</p>
        </div>

        <div class="spec-block" style="margin-top:18px;">
          <h3 style="font-size:15px;margin:0 0 6px;">Security &amp; Vault Invariants</h3>
          <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;">
            <li>Magic header SESEPHUS (reject anything else)</li>
            <li>ChaCha20-Poly1305 + PBKDF2</li>
            <li>Public key parity check (CLI) without password exposure</li>
            <li>Drive existence + write probe before use</li>
          </ul>
        </div>
      </div>`;
  }

  function renderState() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:46rem;margin:0 auto;padding:32px 24px;color:#e7e7f2;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9fe9f1;">CURRENT STATE</div>
        <h2 style="font-family:'JetBrains Mono',monospace;margin:6px 0 18px;">Inventory &amp; Signals</h2>
        <p>Data flow and high-signal files (public view from inventory capsule):</p>
        <pre style="background:#11121e;padding:14px;border-radius:10px;font-size:12px;line-height:1.55;overflow:auto;">speak → Zig client (WAV/TCP) → Zig host (encrypt → vault.db)
                                 ↓
                              Python bridge (Whisper + ETDI)
                                 ↓
                              React dashboard</pre>
        <p style="margin-top:12px;">Focus areas: ETDI scoring, dashboard integration, voice control. See state/inventory.md + decisions.md for full distilled map.</p>
        <div style="margin:16px 0 0;font-size:13px;opacity:.75;">Quicker context snapshot 2026-07-07 — cross-checked against canonical sesefus.</div>
      </div>`;
  }

  function renderRepos() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:46rem;margin:0 auto;padding:32px 24px;color:#e7e7f2;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9fe9f1;">REPOSITORIES — VERIFIED</div>
        <h2 style="font-family:'JetBrains Mono',monospace;margin:6px 0 18px;">Live &amp; Canonical Sources</h2>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="border:1px solid #272739;border-radius:12px;padding:16px 18px;background:rgba(16,16,24,0.7);">
            <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#7cf7ff;">github.com/zychs/sesefus</div>
            <div style="margin:6px 0 10px;font-size:14px;">Offline-first audio-first growth engine. Zig core (Circadia/Arcadium), Python bridge, React dashboard, ssfs CLI, ETDI pipeline.</div>
            <a href="https://github.com/zychs/sesefus" target="_blank" style="color:#7cf7ff;font-size:13px;">Open on GitHub →</a>
            <div style="margin-top:8px;font-size:12px;opacity:.65;">README + overallreadmee.md verified current (local canonical + remote match).</div>
          </div>

          <div style="border:1px solid #272739;border-radius:12px;padding:16px 18px;background:rgba(16,16,24,0.7);">
            <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#7cf7ff;">github.com/zychs/repo-libs-naissance</div>
            <div style="margin:6px 0 10px;font-size:14px;">Prompt library (LeadLogic, Jetstream, Circadia-adjacent). Temperature-routed (Hot/Warm/Cold/Agent). Canonical SSOT via meta/INDEX.md.</div>
            <a href="https://github.com/zychs/repo-libs-naissance" target="_blank" style="color:#7cf7ff;font-size:13px;">Open on GitHub →</a>
            <div style="margin-top:8px;font-size:12px;opacity:.65;">Prompts organized for selective load. Tools include infogen.</div>
          </div>
        </div>

        <p style="margin-top:22px;font-size:13px;">All capsules on this site are derived from quicker context (Desktop snapshot 2026-07-07) and kept in sync with the above repos. No private material exposed.</p>
      </div>`;
  }

  const documents = [
    { id: 'session-ledger', title: 'Sesefus — Session Ledger 07·04', desc: 'Dated session notes, decisions, and state during voice-control / editorial work.' },
    { id: 'whole-machine', title: 'Sesefus — The Whole Machine', desc: 'Big picture state of the full system (Zig + Python + React + vault + ETDI).' },
    { id: 'ssfs-cheatsheet', title: 'SSFS — Sesephus CLI Cheatsheet', desc: 'Concise command reference for ssfs (journal, rhythm, stoic, vault, etc.).' },
    { id: 'branch-audit', title: 'Sesefus — Branch Audit · voice-control vs main', desc: 'Comparison of the voice-control branch work versus mainline.' },
    { id: 'command-cheatsheet', title: 'Sesefus — Command Cheatsheet', desc: 'Additional command surface and usage patterns.' },
    { id: 'drift-arch', title: 'sesefus — drift architecture', desc: 'Architecture notes focused on drift, layers, and data flow.' }
  ];

  function renderLedgers() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:46rem;margin:0 auto;padding:32px 24px;color:#e7e7f2;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9fe9f1;">LEDGERS &amp; CHEATSHEETS</div>
        <h2 style="font-family:'JetBrains Mono',monospace;margin:6px 0 18px;">Source Documents</h2>
        <p style="margin-bottom:18px;font-size:14px;opacity:.8;">These are the working documents (Claude artifact exports) being incorporated for the video. Click a card for highlights and cross-links into the live data views. Content is curated for the public demo.</p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
          ${documents.map(d => `
            <div class="doc-card" data-id="${d.id}" style="padding:14px 16px;border:1px solid #272739;border-radius:12px;background:rgba(16,16,24,0.7);cursor:pointer;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#7cf7ff;margin-bottom:4px;">${d.title}</div>
              <div style="font-size:13px;opacity:.85;">${d.desc}</div>
            </div>`).join('')}
        </div>

        <div id="ledger-detail" style="margin-top:20px;padding:16px 18px;border:1px solid #272739;border-radius:12px;background:rgba(10,10,16,0.85);display:none;"></div>

        <div style="margin-top:16px;font-size:12px;opacity:.6;">Full originals live in H:\\My Drive\\. These views surface the high-signal parts for navigation during the video.</div>
      </div>`;

    $$('.doc-card', root).forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const det = $('#ledger-detail', root);
        det.style.display = 'block';
        let html = '';
        if (id === 'ssfs-cheatsheet' || id === 'command-cheatsheet') {
          html = `<strong>CLI Cheatsheet Highlights</strong><br>
Use the <a href="#/systems" data-route="systems" class="route-link">Systems → CLI</a> view above for the full current command surface (flags + modules + flows). These documents are the expanded reference versions of the same material.`;
        } else if (id === 'drift-arch') {
          html = `<strong>Drift Architecture</strong><br>
This document is now a first-class view: <a href="#/drift" data-route="drift" class="route-link" style="color:#7cf7ff;">open the full drift domains page</a>. It covers porosity as a willingness modulator, the cull test, domain sensitivities, and the disclosure gate invariants that protect stigmatized signals. Cross-ref <a href="#/systems" data-route="systems" class="route-link">Systems</a> and <a href="#/reference" data-route="reference" class="route-link">Reference</a>.`;
        } else if (id === 'whole-machine') {
          html = `<strong>The Whole Machine</strong><br>
High-level inventory of the running system: Zig daemons (host + clients), Python ETDI/Whisper sidecar, React dashboard, encrypted vault, TCP framing, and the ssfs CLI as the single source of truth for all actions. Cross-ref <a href="#/state" data-route="state" class="route-link">State</a>.`;
        } else if (id === 'session-ledger') {
          html = `<strong>Session Ledger 07·04</strong><br>
Working notes from the voice-control / editorial period. Key themes: command surface stabilization, ETDI pipeline, branch hygiene, and keeping the prosthetic usable in constrained environments. See also <a href="#/state" data-route="state" class="route-link">current state signals</a>.`;
        } else if (id === 'branch-audit') {
          html = `<strong>Branch Audit: voice-control vs main</strong><br>
Full audit now live at <a href="#/audit" data-route="audit" class="route-link" style="color:#7cf7ff;">#/audit</a>. 6 ahead / 13 behind, only 2 real conflicts, 18 files clean. Verdict: tractable rebase. Includes live ETDI calculator from the doc.`;
        }
        det.innerHTML = html + `<div style="margin-top:10px;"><a href="#/ledgers" data-route="ledgers" class="route-link" style="font-size:12px;color:#7cf7ff;">back to list</a></div>`;
        wireRouteLinks(det);
      });
    });
  }

  // Full "Sesefus — the whole machine" command reference
  // Replicates the provided reference design for video click-through
  const REFERENCE_SECTIONS = [
    {
      title: "INVOCATION & ROLE",
      items: [
        { cmd: "sesefus —role host|client", desc: "One sesefus executable replaces the old host.exe / client.exe", tag: "wired" },
        { cmd: "sesefus —reset-role", desc: "Run as daemon scheduler or edge client. Persisted after first pack.", tag: "wired" },
        { cmd: "sesefus —host <role> [auto] —reason", desc: "Check the stored role or set the next launch in prompts.", tag: "wired" },
        { cmd: "sesefus —port <port> —reason", desc: "Client TCP port (default 5000); skip the record (y/N) prompt.", tag: "wired" }
      ]
    },
    {
      title: "GLOBAL FLAGS",
      items: [
        { cmd: "--production", desc: "Strict mode — destructive ops demand confirmation or an override flag.", tag: "wired" },
        { cmd: "--dry-run / -n", desc: "Show what would happen; make no state changes.", tag: "wired" },
        { cmd: "--json", desc: "Machine-readable output for the dashboard/CLI.", tag: "wired" },
        { cmd: "--help / -h", desc: "Usage text for the command.", tag: "wired" }
      ]
    },
    {
      title: "JOURNAL",
      items: [
        { cmd: "sesefus journal record [minutes]", desc: "Start a voice journal entry. Defaults to 3-10 min.", tag: "wired" },
        { cmd: "sesefus journal review last", desc: "Play back the most recent journal.", tag: "wired" },
        { cmd: "sesefus journal prompt stoic", desc: "Spoken Stoic reflection prompt.", tag: "wired" }
      ]
    },
    {
      title: "RHYTHM",
      items: [
        { cmd: "sesefus rhythm schedule morning/evening", desc: "Set the ritual alarm sequence for each part of day.", tag: "wired" },
        { cmd: "sesefus rhythm next", desc: "What is my next growth anchor?", tag: "wired" }
      ]
    },
    {
      title: "STOIC",
      items: [
        { cmd: "sesefus stoic daily-reflection", desc: "Guided evening audio review.", tag: "wired" },
        { cmd: "sesefus stoic virtue-check <virtue>", desc: "courage / wisdom / temperance / justice", tag: "wired" },
        { cmd: "sesefus stoic obstacle", desc: "Speak an obstacle; get reframing logic.", tag: "wired" }
      ]
    },
    {
      title: "LEAD",
      items: [
        { cmd: "sesefus lead mine stoic", desc: "High-signal stoic content for journal (local vLLM or surface).", tag: "wired" },
        { cmd: "sesefus lead feed journal", desc: "Turn good input into journal prompts.", tag: "wired" }
      ]
    },
    {
      title: "VAULT",
      items: [
        { cmd: "sesefus vault status", desc: "Capacity + encryption metadata.", tag: "wired" },
        { cmd: "sesefus vault key-verify <hex>", desc: "Verify public key against the vault.", tag: "wired" },
        { cmd: "sesefus vault backup <path> --production", desc: "Safe backup (requires --production).", tag: "wired" }
      ]
    },
    {
      title: "HOST — DIRECT FLAGS",
      items: [
        { cmd: "--role <host|client>", desc: "Pin the role for this invocation.", tag: "wired" },
        { cmd: "--vault <path>", desc: "Custom vault DB path.", tag: "wired" },
        { cmd: "--reason <text>", desc: "Log the reason for this launch.", tag: "wired" },
        { cmd: "--port <port>", desc: "Override the TCP port.", tag: "wired" }
      ]
    },
    {
      title: "HOST SHELL — ALARMS",
      items: [
        { cmd: "alarm list", desc: "List all scheduled alarms.", tag: "wired" },
        { cmd: "alarm schedule <time> <action>", desc: "Schedule an alarm (record, prompt, etc.).", tag: "wired" },
        { cmd: "alarm group <name>", desc: "Group related alarms.", tag: "wired" },
        { cmd: "alarm interval <every> <count> <action>", desc: "Repeating alarm sequence.", tag: "wired" }
      ]
    },
    {
      title: "HOST SHELL — SUBGROUPS & VAULT OPS",
      items: [
        { cmd: "group create <name>", desc: "Create a named alarm group.", tag: "wired" },
        { cmd: "group add <group> <alarm>", desc: "Add an alarm to a group.", tag: "wired" },
        { cmd: "vault status / vault key-verify", desc: "Vault health and key checks.", tag: "wired" },
        { cmd: "vault backup / vault audit", desc: "Backup and audit the vault DB.", tag: "wired" }
      ]
    },
    {
      title: "STORAGE & SIGNAL TOOLING",
      items: [
        { cmd: "ssfs/drive-mapping.json", desc: "SSOT for drive letters (V: = live vault, E: = archive).", tag: "wired" },
        { cmd: "python tools/etdi_pipeline.py --backend grok", desc: "Run ETDI scoring over journals.", tag: "wired" }
      ]
    },
    {
      title: "LEGACY (PHASING OUT)",
      items: [
        { cmd: "legacy alarm schedule", desc: "Old alarm syntax (compat only).", tag: "legacy" }
      ]
    }
  ];

  function renderReference() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:1100px;margin:0 auto;padding:24px 20px 80px;color:#e7e7f2;font-family:'Outfit',system-ui,sans-serif;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(124,247,255,0.85);">⬡ Sesefus</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;letter-spacing:0.02em;">— the whole machine</div>
        </div>
        <div style="color:#a7a7bd;max-width:46rem;margin-bottom:12px;">
          Audio-first growth engine. circadian rhythm cues, encrypted voice journaling, Stoic reflection. Everything routes through the Zig CLI or its mirrored HTTP API.
        </div>

        <!-- Legend -->
        <div style="display:flex;gap:16px;margin:8px 0 20px;font-size:12px;font-family:'JetBrains Mono',monospace;align-items:center;">
          <div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span> <span style="color:#22c55e;">wired</span> <span style="opacity:.6">— real logic, works today</span></div>
          <div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;"></span> <span style="color:#f59e0b;">stub</span> <span style="opacity:.6">— parses, prints no-op</span></div>
          <div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#64748b;"></span> <span style="color:#64748b;">legacy</span> <span style="opacity:.6">— kept for compat, phasing out</span></div>
          <div style="flex:1"></div>
          <input id="ref-search" placeholder="Filter commands..." style="background:#11121e;border:1px solid #272739;color:#e7e7f2;padding:4px 10px;font-family:'JetBrains Mono',monospace;font-size:12px;border-radius:6px;width:220px;">
        </div>

        <div id="ref-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
          ${REFERENCE_SECTIONS.map((sec, idx) => `
            <div class="ref-section" data-section="${idx}" style="border:1px solid #272739;border-radius:10px;background:rgba(16,16,24,0.85);padding:12px 14px;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9fe9f1;margin-bottom:8px;border-bottom:1px solid #272739;padding-bottom:4px;">${sec.title}</div>
              ${sec.items.map(item => `
                <div class="ref-cmd" data-cmd="${item.cmd}" style="display:flex;gap:8px;align-items:flex-start;margin:6px 0;font-size:13px;">
                  <code style="font-family:'JetBrains Mono',monospace;color:#a5f3fc;background:rgba(124,247,255,0.08);padding:1px 5px;border-radius:4px;white-space:nowrap;">${item.cmd}</code>
                  <span style="opacity:.85;flex:1;">${item.desc}</span>
                  <span class="tag" style="font-size:10px;padding:1px 6px;border-radius:999px;background:${item.tag==='wired'?'#052e16':item.tag==='stub'?'#431407':'#1f2937'};color:${item.tag==='wired'?'#22c55e':item.tag==='stub'?'#f59e0b':'#64748b'};border:1px solid ${item.tag==='wired'?'#166534':item.tag==='stub'?'#9a3412':'#374151'};">${item.tag}</span>
                </div>`).join('')}
            </div>`).join('')}
        </div>

        <div style="margin-top:20px;font-size:11px;opacity:.6;font-family:'JetBrains Mono',monospace;">
          Click any command row to copy. Filter above to narrow. This is the live reference distilled from the working ledgers and cheatsheets.
        </div>
      </div>`;

    // Interactions
    const grid = $('#ref-grid', root);
    const search = $('#ref-search', root);

    // Copy on click
    $$('.ref-cmd', root).forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const cmd = row.getAttribute('data-cmd');
        navigator.clipboard?.writeText(cmd).catch(()=>{});
        const orig = row.style.background;
        row.style.background = 'rgba(124,247,255,0.15)';
        setTimeout(() => { row.style.background = orig || ''; }, 420);
      });
    });

    // Live filter
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        $$('.ref-cmd', grid).forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = (!q || text.includes(q)) ? '' : 'none';
        });
        // Also hide empty sections
        $$('.ref-section', grid).forEach(sec => {
          const visible = $$('.ref-cmd', sec).some(r => r.style.display !== 'none');
          sec.style.display = visible ? '' : 'none';
        });
      });
    }
  }

  function renderDrift() {
    const root = viewRoot();
    root.innerHTML = `
      <div class="drift-wrap" style="color:#d9dfe8; background:transparent;">
        <div class="drift-hero">
          <div class="drift-eyebrow">sesefus · architecture</div>
          <h1>drift domains <span class="dim">/ porosity &amp; willingness</span></h1>
          <p class="lede" style="color:#b3bccb;">How we detect state from speech without violating the user. The cull test, the domains, and the disclosure gate that protects the most sensitive signals.</p>
        </div>

        <!-- Nesting -->
        <div class="drift-nest">
          <div class="drift-shell">
            <div class="tag"><span class="name">Sesefus</span> <span class="role">/ the whole prosthetic</span></div>
          </div>
          <div class="drift-shell">
            <div class="tag"><span class="name">Domains</span> <span class="role">/ semantic fields with different sensitivities</span></div>
          </div>
          <div class="drift-shell this">
            <div class="tag"><span class="name">Porosity</span> <span class="role">/ speech slowing as post-run signal</span></div>
            <div class="youarehere">you are here</div>
          </div>
        </div>

        <div class="drift-purpose">
          <b>Purpose:</b> give the system a soft, high-signal cue that the user may be in a vulnerable window after a journal run — without ever assuming or storing clinical state unless the user has explicitly opened the gate.
        </div>

        <!-- Cull -->
        <div class="drift-cull" style="margin-top:22px;">
          <div class="idx">01</div>
          <div>
            <div class="test">The cull test: <em>if we detect X, do we surface or act?</em></div>
            <div class="sub">Porosity fails the cull for any stigmatized or recovery-adjacent use. It is allowed only as a modulator of <b>willingness</b> — "back off for a while."</div>
          </div>
        </div>

        <section class="drift-sec">
          <div class="drift-sec-head">
            <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#4fd6b8;">02</span>
            <h2>Domains &amp; their signals</h2>
          </div>
          <div class="drift-cards">
            <div class="drift-card">
              <div class="top"><span class="h">recovery status</span> <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#ff7183;">gated</span></div>
              <p>Stigmatized. Disclosure only. The system must never infer from speech rate, affect, or any other signal.</p>
            </div>
            <div class="drift-card">
              <div class="top"><span class="h">porosity</span> <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#4fd6b8;">open (willingness only)</span></div>
              <p>Speech slowing in the minutes after a run. Used only to lower pressure on the user. Never surfaced as "state."</p>
            </div>
            <div class="drift-card">
              <div class="top"><span class="h">willingness</span> <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#f2b544;">modulator</span></div>
              <p>Not a domain. It receives signals from open domains and decides how hard the loop should push right now.</p>
            </div>
          </div>
        </section>

        <section class="drift-sec">
          <div class="drift-sec-head">
            <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#ff7183;">03</span>
            <h2>The disclosure gate</h2>
            <span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:11px;color:#8592a3;">default: sealed</span>
          </div>
          <p style="color:#8592a3;max-width:64ch;">Porosity can indicate state, but only for a user who has <b>said so</b>. The gate is a system primitive: never-measure-until-open.</p>

          <div class="drift-gate">
            <div style="font-weight:600;margin-bottom:8px;color:#ff7183;">Gate invariants</div>
            <ol class="drift-invs">
              <li>Detection ≠ permission. A sealed signal is inadmissible.</li>
              <li>The system never opens the gate. Disclosure is the user's act.</li>
              <li>Opening requires deliberate, verified intent (affirmative flow).</li>
              <li>Accidental utterance does nothing. Overhearing is not consent.</li>
              <li>Disclosure is durable. Once made, it is remembered and acted on.</li>
            </ol>
          </div>
        </section>

        <div style="margin-top:28px;font-size:12px;color:#616e7f;font-family:'JetBrains Mono',monospace;">
          See also: <a href="#/reference" data-route="reference" class="route-link">Whole Machine command reference</a> · <a href="#/systems" data-route="systems" class="route-link">Systems architecture</a>
        </div>
        <div style="margin-top:12px;font-size:11px;opacity:.5;">sesefus · drift-domains · ssfs ⊂ sesefus ⊂ sesephus</div>
      </div>`;

    wireRouteLinks(root);
  }

  function renderAudit() {
    const root = viewRoot();
    root.innerHTML = `
      <div style="max-width:48rem;margin:0 auto;padding:56px clamp(20px,5vw,52px) 96px;color:#e7e7f2;font-family:'Outfit',system-ui,sans-serif;font-weight:300;font-size:17px;line-height:1.62;">
        <div style="display:flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(124,247,255,0.85);">
          <span style="font-size:14px;">⬡</span><span>Sesefus</span><span style="color:#3a3a4d;">/</span><span style="color:#7b7b92;">Branch Audit</span>
        </div>

        <h1 style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:clamp(28px,5.5vw,44px);line-height:1.05;text-transform:uppercase;margin:20px 0 0;color:#f4f4fb;">Voice Branch<br>vs Main</h1>
        <p style="margin:14px 0 0;font-size:clamp(16px,2.2vw,19px);color:#a7a7bd;max-width:36rem;line-height:1.5;">
          <code style="font-family:'JetBrains Mono',monospace;font-size:0.85em;padding:1px 6px;border-radius:6px;background:rgba(124,247,255,0.08);border:1px solid rgba(124,247,255,0.16);color:#9fe9f1;">claude/voice-control-integration</code> diverged from <code style="font-family:'JetBrains Mono',monospace;font-size:0.85em;padding:1px 6px;border-radius:6px;background:rgba(124,247,255,0.08);border:1px solid rgba(124,247,255,0.16);color:#9fe9f1;">main</code> while main moved underneath it. Here's exactly what collides — and how little.
        </p>

        <!-- Stats -->
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin:26px 0 0;">
          <div style="flex:1 1 130px;min-width:120px;padding:16px 18px;border:1px solid #272739;border-radius:14px;background:rgba(16,16,24,0.7);">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;font-variant-numeric:tabular-nums;color:#7cf7ff;">6</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6c6c83;margin-top:6px;">commits ahead</div>
          </div>
          <div style="flex:1 1 130px;min-width:120px;padding:16px 18px;border:1px solid #272739;border-radius:14px;background:rgba(16,16,24,0.7);">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;font-variant-numeric:tabular-nums;color:#f0937c;">13</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6c6c83;margin-top:6px;">commits behind</div>
          </div>
          <div style="flex:1 1 130px;min-width:120px;padding:16px 18px;border:1px solid #272739;border-radius:14px;background:rgba(16,16,24,0.7);">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;font-variant-numeric:tabular-nums;color:#f0937c;">2</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6c6c83;margin-top:6px;">real conflicts</div>
          </div>
          <div style="flex:1 1 130px;min-width:120px;padding:16px 18px;border:1px solid #272739;border-radius:14px;background:rgba(16,16,24,0.7);">
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;font-variant-numeric:tabular-nums;color:#4CAE7C;">18</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6c6c83;margin-top:6px;">files apply clean</div>
          </div>
        </div>

        <div style="margin:24px 0 0;padding:22px 26px;border:1px solid rgba(76,174,124,0.4);border-left:3px solid #4CAE7C;border-radius:14px;background:linear-gradient(180deg, rgba(76,174,124,0.08), rgba(10,10,16,0.6));">
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4CAE7C;">Verdict</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:clamp(20px,4vw,27px);color:#f4f4fb;margin:8px 0 0;line-height:1.2;">Tractable. Not a rewrite.</div>
          <p style="margin-top:10px;color:#a7a7bd;font-size:15px;">The branch is a focused voice-control feature layer on top of the core. Most divergence is additive or parallel. Rebase is mechanical.</p>
        </div>

        <h2 style="font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;color:#9fe9f1;margin:50px 0 4px;">What Actually Collides</h2>
        <div style="height:2px;width:48px;background:rgba(124,247,255,0.5);margin:0 0 18px;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0 0;">
          <div style="padding:18px 20px;border:1px solid #272739;border-radius:14px;background:rgba(16,16,24,0.7);">
            <h3 style="margin:0;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9fe9f1;">voice-control branch (mine)</h3>
            <p style="margin:10px 0 0;font-size:14px;color:#a7a7bd;">New CLI surface for voice, ETDI wiring, dashboard panels, client capture improvements, and the willingness / porosity experiments. Mostly new files + targeted patches to host and commands.</p>
          </div>
          <div style="padding:18px 20px;border:1px solid #272739;border-radius:14px;background:rgba(16,16,24,0.7);">
            <h3 style="margin:0;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#e8b24a;">main (theirs, now)</h3>
            <p style="margin:10px 0 0;font-size:14px;color:#a7a7bd;">Continued core hardening: more vault invariants, additional alarm subgroups, storage mapping work, and general CLI guardrails. The foundation moved while the feature branch was open.</p>
          </div>
        </div>

        <h2 style="font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;color:#9fe9f1;margin:50px 0 4px;">Rebase Plan (Tractable)</h2>
        <div style="height:2px;width:48px;background:rgba(124,247,255,0.5);margin:0 0 18px;"></div>

        <ol style="margin:16px 0 0;padding-left:22px;color:#a7a7bd;line-height:1.65;">
          <li>Rebase onto current main (expect the 2 conflicts in host command routing and ETDI manifest wiring).</li>
          <li>Resolve conflicts by keeping the new voice paths and the updated core invariants.</li>
          <li>Run the full test matrix (ssfs status, journal record, rhythm, stoic, vault key-verify).</li>
          <li>Land as a single clean merge commit or a small stack if preferred.</li>
        </ol>

        <div style="margin-top:28px;padding:16px 20px;border:1px solid #272739;border-radius:12px;background:rgba(10,10,16,0.85);font-size:14px;">
          <strong style="color:#f4f4fb;">Bottom line:</strong> 18 files are already clean. The two conflicts are localized and well-understood. This branch is ready to come home after a short rebase pass.
        </div>

        <!-- Bonus: ETDI live tool from the doc -->
        <h2 style="font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;color:#9fe9f1;margin:50px 0 4px;">ETDI Live Calculator (from the audit context)</h2>
        <div style="height:2px;width:48px;background:rgba(124,247,255,0.5);margin:0 0 18px;"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:12px;">
          <label style="font-size:12px;color:#6c6c83;">valence (−1…+1)<br><input id="v" type="range" min="-1" max="1" step="0.1" value="0.6" style="width:100%;"></label>
          <label style="font-size:12px;color:#6c6c83;">arousal (0…1)<br><input id="a" type="range" min="0" max="1" step="0.05" value="0.7" style="width:100%;"></label>
          <label style="font-size:12px;color:#6c6c83;">salience (0…1)<br><input id="s" type="range" min="0" max="1" step="0.05" value="0.8" style="width:100%;"></label>
          <label style="font-size:12px;color:#6c6c83;">duration min<br><input id="d" type="range" min="0.05" max="15" step="0.05" value="4" style="width:100%;"></label>
        </div>
        <div style="margin-top:16px;font-family:'JetBrains Mono',monospace;font-size:28px;color:#7cf7ff;" id="etdi-num">0.0840</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#9fe9f1;" id="etdi-cls">quiet</div>

        <div style="margin-top:40px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5a5a70;">For Everyone · Voice-First · Unhurried · Negentropic</div>
      </div>`;

    // simple ETDI live calc
    setTimeout(() => {
      const v = document.getElementById('v');
      const a = document.getElementById('a');
      const s = document.getElementById('s');
      const d = document.getElementById('d');
      const num = document.getElementById('etdi-num');
      const cls = document.getElementById('etdi-cls');
      if (!v || !num) return;
      function upd() {
        const et = (Math.abs(parseFloat(v.value)) * parseFloat(a.value) * parseFloat(s.value)) / Math.max(parseFloat(d.value), 0.05);
        num.textContent = et.toFixed(4);
        let label = 'quiet';
        if (et >= 0.15) label = 'heavy — flagged';
        else if (et >= 0.05) label = 'charged';
        cls.textContent = label;
      }
      [v,a,s,d].forEach(el => el && el.addEventListener('input', upd));
      upd();
    }, 50);

    wireRouteLinks(root);
  }

  const ROUTES = {
    '': renderHome,
    'home': renderHome,
    'prologue': renderPrologue,
    'systems': renderSystems,
    'systems/architecture': () => { renderSystems(); /* could deep link but simple: highlight */ },
    'systems/cli': () => { renderSystems(); },
    'systems/vault': () => { renderSystems(); },
    'specs': renderSpecs,
    'state': renderState,
    'ledgers': renderLedgers,
    'reference': renderReference,
    'drift': renderDrift,
    'audit': renderAudit,
    'repos': renderRepos
  };

  function navigate(route = '') {
    const clean = (route || '').replace(/^#\/?/, '').trim().toLowerCase();
    const r = clean || '';
    location.hash = r ? '#/' + r : '#/';
    const fn = ROUTES[r] || ROUTES[''];
    fn();
    // active nav styling
    highlightNav(r || 'home');
  }

  function highlightNav(route) {
    if (!nav()) return;
    $$('a[data-route]', nav()).forEach(a => {
      const active = (a.getAttribute('data-route') || '').toLowerCase() === (route || 'home');
      a.style.color = active ? '#7cf7ff' : 'rgba(231,231,242,0.75)';
      a.style.borderBottom = active ? '1px solid rgba(124,247,255,0.5)' : 'none';
    });
  }

  function initRouter() {
    // Build nav
    if (nav()) {
      nav().innerHTML = `
        <div style="max-width:46rem;margin:0 auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 20px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.08em;">
          <a href="#/" data-route="" style="color:#7cf7ff;text-decoration:none;margin-right:6px;">⬡ SESEFUS</a>
          <a href="#/prologue" data-route="prologue" class="nav-item">Prologue</a>
          <a href="#/systems" data-route="systems" class="nav-item">Systems</a>
          <a href="#/specs" data-route="specs" class="nav-item">Specs</a>
          <a href="#/state" data-route="state" class="nav-item">State</a>
          <a href="#/ledgers" data-route="ledgers" class="nav-item">Ledgers</a>
          <a href="#/reference" data-route="reference" class="nav-item">Reference</a>
          <a href="#/drift" data-route="drift" class="nav-item">Drift</a>
          <a href="#/audit" data-route="audit" class="nav-item">Audit</a>
          <a href="#/repos" data-route="repos" class="nav-item">Repos</a>
          <span style="flex:1"></span>
          <a href="https://github.com/zychs/sesefus" target="_blank" style="opacity:.65;color:inherit;text-decoration:none;">sesefus</a>
          <span style="opacity:.3;">·</span>
          <a href="https://github.com/zychs/repo-libs-naissance" target="_blank" style="opacity:.65;color:inherit;text-decoration:none;">naissance</a>
        </div>`;
      // style nav items
      $$('a.nav-item', nav()).forEach(a => {
        a.style.cssText = 'color:rgba(231,231,242,0.75);text-decoration:none;padding:2px 0;margin:0 2px;';
      });
      $$('a[data-route]', nav()).forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const r = a.getAttribute('data-route') || '';
          navigate(r);
        });
      });
    }

    // initial route
    const initial = (location.hash || '').replace(/^#\/?/, '');
    const fn = ROUTES[initial] || ROUTES[''];
    fn();
    highlightNav(initial || 'home');

    window.addEventListener('hashchange', () => {
      const h = (location.hash || '').replace(/^#\/?/, '');
      (ROUTES[h] || ROUTES[''])();
      highlightNav(h || 'home');
    });

    // Keyboard hint (video friendly): / focuses nav or home
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName === 'BODY') {
        e.preventDefault();
        navigate('');
      }
    });
  }

  // Public API for console/video scripting if desired
  window.SesefusSite = { navigate, renderHome, renderPrologue, renderSystems };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }
})();
