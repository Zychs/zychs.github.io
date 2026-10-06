// SNAKE-MAN GLOBE · rules
// Snake-Man played on a sphere, with the ternary headings from Zychs/stray-snake: the snake
// moves along great circles and turns only by ±120°, so it always has three ways to go.
// Positions are unit vectors and distances are angles. No drawing, no DOM, no audio: the page
// reads state and drains `events` (the same names the flat game's event bus uses).
// Depends on globe/ternary.js (window.TernaryGlobe). Plain script, like the flat game.
'use strict';
(function (root) {
    const T = root.TernaryGlobe;

    // --- CONFIG (numbers follow the flat game where there is one) ---
    const STEP = (Math.PI * 2) / 72;      // one move: 5°, 72 moves around the globe
    const STEP_MS = 125;                  // snake speed
    const GHOST_STEP_MS = 165;            // ghosts are a little slower
    const DAZE_SLOW = 1.7;                // dazed ghosts are slower again
    const EAT = STEP * 0.9;               // pickup radius
    const TOUCH = STEP * 1.1;             // ghost contact radius
    const BITE = STEP * 0.6;              // self and wall contact radius
    const TIME_LIMIT_MS = 5 * 60 * 1000;
    const START_LIVES = 3, MAX_LIVES = 5, START_LENGTH = 4;
    const PELLET_SCORE = 10, RAINBOW_SCORE = 30;
    const YELLOW_COUNT = 70, RAINBOW_COUNT = 2, RAINBOW_RESPAWN_MS = 25000;
    const ZONES = [15, 40, 75];           // pellets eaten to reach each new zone
    const START_WALLS = 5, WALLS_PER_ZONE = 3, WALL_HALF = 4 * STEP;
    const DASH_TILES = 6, DASH_MIN = 2, DASH_COOL_MS = 4000;
    const INVULN_MS = 2000, SELF_INVULN_MS = 1000;
    const FORAGE_GOAL = 5, FORAGE_WIN = 7000, BANK_POINTS = 100;
    const COAT_MS = 8000, COAT_COOL_MS = 10000;
    const PRISM_MS = 7000, GHOST_BASE = 50, CHAIN_CAP = 3, RESPAWN_MS = 5000;
    const PINKY_LEAD = 4, INKY_LEAD = 6;
    const GHOSTS = ['BLINKY', 'PINKY', 'INKY', 'CLYDE'];

    // --- VECTORS ---
    const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
    const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
    const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
    const scale = (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s });
    function unit(v) {
        const n = Math.hypot(v.x, v.y, v.z);
        return n > 1e-12 ? scale(v, 1 / n) : { x: 0, y: 0, z: 1 };
    }
    const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));

    // Move along the pose's great circle by `a` radians (ternary.js's advance, any step size).
    function stepPose(pose, a) {
        const position = unit(add(scale(pose.position, Math.cos(a)), scale(pose.heading, Math.sin(a))));
        const h = pose.heading, r = dot(h, position);
        return { position, heading: unit({ x: h.x - position.x * r, y: h.y - position.y * r, z: h.z - position.z * r }) };
    }

    // Rotate p toward q by at most `a` radians along their great circle.
    function toward(p, q, a) {
        const d = angle(p, q);
        if (d < 1e-9) return p;
        let axis = cross(p, q);
        if (Math.hypot(axis.x, axis.y, axis.z) < 1e-9) axis = cross(p, Math.abs(p.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 });
        axis = unit(axis);
        const t = Math.min(a, d);
        return unit(add(scale(p, Math.cos(t)), scale(cross(axis, p), Math.sin(t))));
    }

    // Seeded RNG (mulberry32), so a seed replays the same map.
    function rng(seed) {
        let s = seed >>> 0;
        return () => {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function randomPoint(rand) {
        const z = rand() * 2 - 1, a = rand() * Math.PI * 2, r = Math.sqrt(1 - z * z);
        return { x: r * Math.cos(a), y: r * Math.sin(a), z };
    }
    function randomTangent(p, rand) {
        const q = randomPoint(rand);
        const t = { x: q.x - p.x * dot(q, p), y: q.y - p.y * dot(q, p), z: q.z - p.z * dot(q, p) };
        return unit(t);
    }

    // --- GAME ---
    function create(seed = 1) {
        const G = {
            seed, rand: rng(seed), mode: 'ready', over: '',
            score: 0, hi: 0, lives: START_LIVES, timeLeft: TIME_LIMIT_MS, played: 0,
            eaten: 0, stage: 0, pose: null, body: [], grow: 0, turns: [],
            pellets: [], rainbowTimers: [], walls: [], ghosts: [],
            invuln: 0, prism: 0, chain: 0, disguised: false, coatT: 0, coatCool: 0, digCool: 0,
            acc: 0, gacc: 0, forage: [], events: [],
        };
        G.pose = T.initialPose();
        G.body = trail(G.pose, START_LENGTH);
        for (let i = 0; i < START_WALLS; i++) addWall(G, 0.6);
        for (let i = 0; i < YELLOW_COUNT; i++) spawnPellet(G, false, 0.25);
        for (let i = 0; i < RAINBOW_COUNT; i++) spawnPellet(G, true, 0.5);
        GHOSTS.forEach((name, i) => {
            const home = unit({ x: Math.cos(i * Math.PI / 2), y: Math.sin(i * Math.PI / 2), z: -0.6 });
            G.ghosts.push({ name, home, pos: home, state: 'hunt' , t: 0 });
        });
        return G;
    }

    // Body points behind a pose, head first.
    function trail(pose, n) {
        const back = { position: pose.position, heading: scale(pose.heading, -1) };
        const out = [pose.position];
        let p = back;
        for (let i = 1; i < n; i++) { p = stepPose(p, STEP); out.push(p.position); }
        return out;
    }

    const emit = (G, name, data = {}) => G.events.push({ ...data, name });

    function wallAt(G, p) {
        for (const w of G.walls) for (const q of w.points) if (angle(p, q) < BITE) return true;
        return false;
    }

    // A wall is a short great-circle arc, sampled every half step.
    function addWall(G, minFromHead) {
        const head = G.pose.position;
        for (let tries = 0; tries < 200; tries++) {
            const c = randomPoint(G.rand);
            if (angle(c, head) < minFromHead) continue;
            const d = randomTangent(c, G.rand);
            const points = [];
            for (let a = -WALL_HALF; a <= WALL_HALF + 1e-9; a += STEP / 2) points.push(stepPose({ position: c, heading: d }, a).position);
            if (G.body.some(b => points.some(q => angle(b, q) < STEP * 2))) continue;
            G.walls.push({ points });
            return;
        }
    }

    function spawnPellet(G, rainbow, minFromHead = 0.2) {
        const head = G.pose.position;
        for (let tries = 0; tries < 300; tries++) {
            const p = randomPoint(G.rand);
            if (angle(p, head) < minFromHead || wallAt(G, p)) continue;
            if (G.pellets.some(q => angle(p, q.p) < STEP * 1.5)) continue;
            G.pellets.push({ p, rainbow });
            return;
        }
    }

    function start(G) { if (G.mode === 'ready') G.mode = 'play'; }

    function turn(G, dir) {
        if (G.mode === 'ready') start(G);
        if (G.mode !== 'play') return;
        if (G.turns.length < 2) G.turns.push(dir);
    }

    function togglePause(G) {
        if (G.mode === 'ready') start(G);
        else if (G.mode === 'play') G.mode = 'paused';
        else if (G.mode === 'paused') G.mode = 'play';
        else if (G.mode === 'over') {
            const hi = G.hi, seed = G.seed + 1;
            Object.assign(G, create(seed), { hi });
        }
    }

    function turncoat(G) {
        if (G.mode !== 'play') return;
        if (G.disguised) { G.disguised = false; G.coatCool = COAT_COOL_MS; emit(G, 'coatOff'); return; }
        if (G.coatCool > 0) return;
        G.disguised = true; G.coatT = COAT_MS; emit(G, 'coat');
    }

    // Dash forward up to DASH_TILES, under walls; land on the farthest clear spot.
    function dig(G) {
        if (G.mode !== 'play' || G.digCool > 0) return false;
        if (G.turns.length) G.pose = G.turns.shift() === 'L' ? T.turnLeft(G.pose) : T.turnRight(G.pose);
        const path = [];
        let p = G.pose;
        for (let k = 1; k <= DASH_TILES; k++) { p = stepPose(p, STEP); path.push(p); }
        let land = -1;
        for (let k = path.length; k >= DASH_MIN; k--) if (!wallAt(G, path[k - 1].position)) { land = k; break; }
        if (land < DASH_MIN) { G.digCool = 300; emit(G, 'bonk'); return false; }
        emit(G, 'dash', { len: land });
        for (let k = 0; k < land; k++) advance(G, path[k], k === land - 1);
        G.digCool = DASH_COOL_MS;
        emit(G, 'surfaced');
        if (G.mode === 'play') contacts(G);
        return true;
    }

    function advance(G, next, eats) {
        G.body.unshift(next.position);
        if (G.grow > 0) G.grow--; else G.body.pop();
        G.pose = next;
        if (eats) eat(G);
    }

    function update(G, dt) {
        if (G.mode !== 'play') return;
        G.played += dt;
        G.timeLeft -= dt;
        if (G.timeLeft <= 0) { G.timeLeft = 0; end(G, 'TIME UP'); return; }
        G.digCool = Math.max(0, G.digCool - dt);
        G.invuln = Math.max(0, G.invuln - dt);
        if (G.prism > 0) {
            G.prism = Math.max(0, G.prism - dt);
            if (G.prism === 0) for (const g of G.ghosts) if (g.state === 'daze') g.state = 'hunt';
        }
        if (G.disguised) {
            G.coatT -= dt;
            if (G.coatT <= 0) { G.disguised = false; G.coatCool = COAT_COOL_MS; emit(G, 'coatOff'); }
        } else G.coatCool = Math.max(0, G.coatCool - dt);
        G.rainbowTimers = G.rainbowTimers.map(t => t - dt);
        while (G.rainbowTimers.length && G.rainbowTimers[0] <= 0) { G.rainbowTimers.shift(); spawnPellet(G, true, 0.5); }

        G.acc += dt;
        for (let guard = 0; G.mode === 'play' && G.acc >= STEP_MS && guard < 8; guard++) { G.acc -= STEP_MS; step(G); }
        if (G.mode !== 'play') return;
        G.gacc += dt;
        for (const g of G.ghosts) {
            if (g.state !== 'out') continue;
            g.t -= dt;
            if (g.t <= 0) { g.state = G.prism > 0 ? 'daze' : 'hunt'; g.pos = g.home; }
        }
        while (G.mode === 'play' && G.gacc >= GHOST_STEP_MS) { G.gacc -= GHOST_STEP_MS; ghostStep(G); }
    }

    function step(G) {
        if (G.turns.length) G.pose = G.turns.shift() === 'L' ? T.turnLeft(G.pose) : T.turnRight(G.pose);
        const next = stepPose(G.pose, STEP);
        if (wallAt(G, next.position)) {
            if (G.invuln > 0) { relocate(G); emit(G, 'bonk'); return; }
            loseLife(G);
            return;
        }
        for (let i = 3; i < G.body.length; i++) {
            if (angle(next.position, G.body[i]) < BITE) {
                if (G.invuln > 0) break;
                relocate(G); G.invuln = SELF_INVULN_MS; emit(G, 'bonk');
                return;
            }
        }
        advance(G, next, true);
        contacts(G);
    }

    function eat(G) {
        const head = G.pose.position;
        for (let i = G.pellets.length - 1; i >= 0; i--) {
            const q = G.pellets[i];
            if (angle(head, q.p) > EAT) continue;
            G.pellets.splice(i, 1);
            G.grow++;
            G.eaten++;
            if (q.rainbow) {
                G.score += RAINBOW_SCORE;
                G.prism = PRISM_MS; G.chain = 0;
                for (const g of G.ghosts) if (g.state === 'hunt') g.state = 'daze';
                G.rainbowTimers.push(RAINBOW_RESPAWN_MS);
                emit(G, 'eat', { rainbow: true });
                emit(G, 'prism');
            } else {
                G.score += PELLET_SCORE;
                spawnPellet(G, false, 0.35);
                emit(G, 'eat', { rainbow: false });
            }
            forage(G);
            zones(G);
        }
        if (G.score > G.hi) G.hi = G.score;
    }

    function zones(G) {
        while (G.stage < ZONES.length && G.eaten >= ZONES[G.stage]) {
            G.stage++;
            for (let i = 0; i < WALLS_PER_ZONE; i++) addWall(G, 0.45);
            emit(G, 'map', { stage: G.stage });
        }
    }

    // Eat FORAGE_GOAL pellets within FORAGE_WIN: a life back, or points if lives are full.
    function forage(G) {
        G.forage = G.forage.filter(t => G.played - t < FORAGE_WIN);
        G.forage.push(G.played);
        if (G.forage.length < FORAGE_GOAL) return;
        G.forage = [];
        if (G.lives < MAX_LIVES) { G.lives++; emit(G, 'heal'); }
        else { G.score += BANK_POINTS; emit(G, 'boost'); }
    }

    function target(G, g) {
        const head = G.pose.position;
        if (g.state === 'daze') return scale(head, -1);            // run to the far side
        if (G.disguised) return g.home;                            // the coat fools them: they go home
        switch (g.name) {
            case 'PINKY': return stepPose(G.pose, PINKY_LEAD * STEP).position;
            case 'INKY': return stepPose(G.pose, INKY_LEAD * STEP).position;
            case 'CLYDE': return unit(G.body.reduce((s, b) => add(s, b), { x: 0, y: 0, z: 0 }));
            default: return head;
        }
    }

    function ghostStep(G) {
        for (const g of G.ghosts) {
            if (g.state === 'out') continue;
            g.pos = toward(g.pos, target(G, g), g.state === 'daze' ? STEP / DAZE_SLOW : STEP);
        }
        contacts(G);
    }

    function contacts(G) {
        const head = G.pose.position;
        for (const g of G.ghosts) {
            if (g.state === 'out' || angle(g.pos, head) > TOUCH) continue;
            if (g.state === 'daze') {
                const pts = GHOST_BASE * Math.pow(2, Math.min(CHAIN_CAP, G.chain));
                G.chain++;
                G.score += pts;
                if (G.score > G.hi) G.hi = G.score;
                g.state = 'out'; g.t = RESPAWN_MS;
                emit(G, 'ghostEaten', { ghost: g.name, pts });
                continue;
            }
            if (G.disguised) { emit(G, 'dodge', { ghost: g.name }); continue; }
            if (G.invuln > 0) continue;
            loseLife(G);
            return;
        }
    }

    function loseLife(G) {
        G.lives--;
        emit(G, 'hit');
        if (G.lives <= 0) { end(G, 'OUT OF LIVES'); return; }
        relocate(G);
        G.invuln = INVULN_MS;
    }

    // Start again somewhere safe: away from walls and ghosts, same length.
    function relocate(G) {
        for (let tries = 0; tries < 300; tries++) {
            const p = randomPoint(G.rand);
            if (G.ghosts.some(g => g.state !== 'out' && angle(g.pos, p) < 0.6)) continue;
            const pose = { position: p, heading: randomTangent(p, G.rand) };
            const body = trail(pose, G.body.length);
            let clear = true;
            for (let k = 0; k <= 4 && clear; k++) if (wallAt(G, stepPose(pose, k * STEP).position)) clear = false;
            if (!clear || body.some(b => wallAt(G, b))) continue;
            G.pose = pose; G.body = body; G.turns = [];
            emit(G, 'placed');
            return;
        }
    }

    function end(G, reason) {
        G.mode = 'over'; G.over = reason;
        if (G.score > G.hi) G.hi = G.score;
        emit(G, 'over', { reason });
    }

    root.SnakeManGlobe = {
        STEP, STEP_MS, TIME_LIMIT_MS, START_LIVES, MAX_LIVES, PRISM_MS, COAT_COOL_MS, DASH_COOL_MS, GHOSTS,
        create, update, turn, togglePause, turncoat, dig, start,
        stepPose, angle, unit, dot, cross, wallAt,
    };
})(typeof window !== 'undefined' ? window : globalThis);
