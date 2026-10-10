// SNAKE-MAN · pad
// Game controllers. Every physical input gets one plain name (A, B, X, Y, L1, R1, L2, R2,
// START, SELECT, L3, R3, HOME, UP/DOWN/LEFT/RIGHT for the d-pad, LS_UP.. and RS_UP.. for the
// sticks; anything unrecognised is BTN7, AXIS4+, K188...), and a binding maps each game action
// to up to two names. The bindings live in localStorage and are edited in the controller
// screen (padmenu.js).
//
// Two sources feed the names:
//   the browser Gamepad API, polled every frame (desktop, phone browsers);
//   the Android app, whose activity takes the controller's keys and axes before the WebView
//   sees them and calls SM.pad.nativeKey / nativeAxes (the WebView's own gamepad support is
//   patchy, and handheld d-pads often arrive as keys rather than a gamepad).
// A name is "down" while any source holds it; actions fire on the press.
'use strict';
(() => {
    const { DIRS, store } = SM.core;
    const G = SM.G;
    const html = document.documentElement;
    const inApp = new URLSearchParams(location.search).has('app') || navigator.userAgent.includes('SnakeManApp');

    // --- ACTIONS AND BINDINGS ---
    const ACTIONS = [
        { id: 'up',    label: 'UP' },
        { id: 'down',  label: 'DOWN' },
        { id: 'left',  label: 'LEFT' },
        { id: 'right', label: 'RIGHT' },
        { id: 'dig',   label: 'DIG' },
        { id: 'lunge', label: 'DASH (SPEED 5)' },
        { id: 'coat',  label: 'TURNCOAT' },
        { id: 'sense', label: 'SPIDER-SENSE (SKILL)' },
        { id: 'bend',  label: 'TIME BEND (SKILL)' },
        { id: 'blast', label: 'STUN BLAST (SKILL)' },
        { id: 'magnet', label: 'MAGNET (SKILL)' },
        { id: 'wind',  label: 'SECOND WIND (SKILL)' },
        { id: 'shoot', label: 'SHOOT (ZOMBIES)' },
        { id: 'skill', label: 'SPECIAL SKILL' },
        { id: 'swap',  label: 'SWAP SKILL' },
        { id: 'pause', label: 'START / PAUSE' },
        { id: 'new',   label: 'NEW MAP / NEXT GUN' },
        { id: 'menu',  label: 'CONTROLS' },
        { id: 'scores', label: 'HIGH SCORES' },
        { id: 'mode',  label: 'CLASSIC / VOID' },
        { id: 'name',  label: 'PLAYER NAME' },
        { id: 'upgrades', label: 'UPGRADES' },
    ];
    const DEFAULTS = {
        up: ['UP', 'LS_UP'], down: ['DOWN', 'LS_DOWN'], left: ['LEFT', 'LS_LEFT'], right: ['RIGHT', 'LS_RIGHT'],
        dig: ['A', null], lunge: ['R1', null], coat: ['X', null], sense: ['L1', null], bend: [null, null], blast: [null, null], magnet: [null, null], wind: [null, null], shoot: ['R2', null], skill: ['B', null], swap: ['L2', null],
        pause: ['START', null], new: ['Y', null], menu: ['SELECT', null], scores: ['R3', null], mode: ['L3', null], name: [null, null], upgrades: [null, null],
    };
    const KEY = 'snakeman-pad';
    const copy = o => JSON.parse(JSON.stringify(o));

    let cfg = load();   // { bind: { action: [name|null, name|null] }, dead: 0.2..0.8 }
    function load() {
        const out = { bind: copy(DEFAULTS), dead: 0.4 };
        try {
            const s = JSON.parse(store.get(KEY) || '{}');
            // L1 used to be TURNCOAT's second button; it now belongs to SPIDER-SENSE
            if (s.bind && !s.bind.sense && Array.isArray(s.bind.coat) && s.bind.coat[1] === 'L1') s.bind.coat[1] = null;
            if (s.bind) {
                const saved = ACTIONS.filter(a => Array.isArray(s.bind[a.id]));
                for (const a of saved) out.bind[a.id] = [0, 1].map(i => typeof s.bind[a.id][i] === 'string' ? s.bind[a.id][i] : null);
                // An action added since this save (DASH, SHOOT...) only gets the default buttons the
                // save hasn't already given to something else; otherwise one button would be bound
                // twice and only the first action would ever fire.
                const taken = new Set(saved.flatMap(a => out.bind[a.id]).filter(Boolean));
                for (const a of ACTIONS) if (!s.bind[a.id]) out.bind[a.id] = out.bind[a.id].map(n => n && taken.has(n) ? null : n);
            }
            if (Number.isFinite(s.dead)) out.dead = Math.min(0.8, Math.max(0.2, s.dead));
        } catch (e) {}
        return out;
    }
    const save = () => store.set(KEY, JSON.stringify(cfg));

    // Put name in (action, slot), taking it off anything else that had it.
    function bind(action, slot, name) {
        if (name) for (const a of ACTIONS) cfg.bind[a.id] = cfg.bind[a.id].map(n => n === name ? null : n);
        cfg.bind[action][slot] = name;
        save();
    }
    function resetBinds() { cfg.bind = copy(DEFAULTS); save(); }
    function setDead(v) { cfg.dead = Math.round(Math.min(0.8, Math.max(0.2, v)) * 20) / 20; save(); }
    const actionOf = name => { for (const a of ACTIONS) if (cfg.bind[a.id].includes(name)) return a.id; return null; };
    // The first thing bound to an action, for on-screen hints.
    const label = id => cfg.bind[id].find(Boolean) || '—';

    // --- HELD STATE ---
    const held = new Map();            // source → Set of names it holds
    const listeners = [];              // fn(name, down) — the controller screen listens here
    const isDown = name => { for (const s of held.values()) if (s.has(name)) return true; return false; };
    function set(src, name, down) {
        if (!held.has(src)) held.set(src, new Set());
        const s = held.get(src), was = isDown(name);
        if (down) s.add(name); else s.delete(name);
        const now = isDown(name);
        if (now === was) return;
        if (now) press(name);
        for (const fn of listeners) fn(name, now);
    }
    // Replace everything a source holds with `names` (used by the polled / axis sources).
    function setAll(src, names) {
        const prev = held.get(src) || new Set();
        for (const n of [...prev]) if (!names.has(n)) set(src, n, false);
        for (const n of names) if (!prev.has(n)) set(src, n, true);
    }
    const allHeld = () => { const out = new Set(); for (const s of held.values()) for (const n of s) out.add(n); return [...out]; };

    // A stick as one digital direction: past the dead zone, the dominant axis wins.
    function stickDir(prefix, x, y, out) {
        if (Math.hypot(x, y) < cfg.dead) return;
        out.add(prefix + (Math.abs(x) > Math.abs(y) ? (x > 0 ? 'RIGHT' : 'LEFT') : (y > 0 ? 'DOWN' : 'UP')));
    }

    // --- FIRING ACTIONS ---
    let device = '';
    function press(name) {
        if (!html.classList.contains('padmode')) html.classList.add('padmode');   // hide the touch pad
        if (SM.names.onPress(name) || SM.upgrades.onPress(name) || SM.scores.onPress(name) || SM.padmenu.onPress(name)) return;
        const a = actionOf(name);
        if (a) fire(a);
    }
    function fire(a) {
        const I = SM.input;
        switch (a) {
            case 'up': return I.pressDir(DIRS[0]);
            case 'right': return I.pressDir(DIRS[1]);
            case 'down': return I.pressDir(DIRS[2]);
            case 'left': return I.pressDir(DIRS[3]);
            case 'dig': return SM.dash.start();
            case 'lunge': return SM.lunge.start();
            case 'coat': return SM.coat.toggle();
            case 'sense': case 'bend': case 'blast': case 'magnet': case 'wind': return SM.abilities.use(a);
            case 'skill': return SM.special.use();
            case 'swap': return SM.special.cycle();
            case 'mode': return SM.voidmode.toggle();
            case 'name': if (G.mode !== 'play') SM.names.show(); return;
            case 'upgrades': return SM.upgrades.toggle();
            case 'pause': if (G.mode === 'ready') { G.mode = 'play'; return; } return I.togglePause();
            case 'new': if (G.mode === 'play') SM.zombies.nextGun(); else SM.game.restart(true); return;
            case 'shoot': return;   // held, not pressed: zombies.js reads the trigger every tick
            case 'menu': return SM.padmenu.toggle();
            case 'scores': return SM.scores.toggle();
        }
    }
    // Touch brings the on-screen pad back.
    window.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') html.classList.remove('padmode'); }, { capture: true, passive: true });

    // --- SOURCE: the browser Gamepad API ---
    const STD = ['A', 'B', 'X', 'Y', 'L1', 'R1', 'L2', 'R2', 'SELECT', 'START', 'L3', 'R3', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'HOME'];
    function poll() {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        const seen = new Set();
        for (const p of pads) {
            if (!p || !p.connected) continue;
            const src = 'gp' + p.index, names = new Set();
            seen.add(src);
            const std = p.mapping === 'standard';
            p.buttons.forEach((b, i) => { if (b.pressed || b.value > 0.5) names.add(std && STD[i] ? STD[i] : 'BTN' + i); });
            if (std) {
                stickDir('LS_', p.axes[0] || 0, p.axes[1] || 0, names);
                stickDir('RS_', p.axes[2] || 0, p.axes[3] || 0, names);
            } else {
                p.axes.forEach((v, i) => { if (Math.abs(v) >= cfg.dead) names.add('AXIS' + i + (v > 0 ? '+' : '-')); });
            }
            if (names.size) device = p.id;
            setAll(src, names);
        }
        for (const src of held.keys()) if (src.startsWith('gp') && !seen.has(src)) setAll(src, new Set());   // unplugged
        requestAnimationFrame(poll);
    }
    // In the app the activity owns the controller, so the WebView's copy (if any) is ignored.
    if (!inApp) requestAnimationFrame(poll);

    // --- SOURCE: the Android app (MainActivity calls these) ---
    function nativeKey(name, down) { set('nk', String(name), !!down); }
    function nativeAxes(lx, ly, rx, ry, hx, hy, lt, rt) {
        const names = new Set();
        stickDir('LS_', lx, ly, names);
        stickDir('RS_', rx, ry, names);
        if (hx < -0.5) names.add('LEFT'); if (hx > 0.5) names.add('RIGHT');   // a hat is a d-pad
        if (hy < -0.5) names.add('UP');   if (hy > 0.5) names.add('DOWN');
        if (lt > 0.5) names.add('L2');    if (rt > 0.5) names.add('R2');
        setAll('na', names);
    }
    function nativeDevice(name) { device = String(name); }

    SM.pad = {
        ACTIONS, inApp,
        bind, resetBinds, setDead, label, actionOf, allHeld, isDown,
        nativeKey, nativeAxes, nativeDevice,
        onChange: fn => listeners.push(fn),
        get cfg() { return cfg; },
        get device() { return device; },
        get active() { return html.classList.contains('padmode'); },
    };
})();
