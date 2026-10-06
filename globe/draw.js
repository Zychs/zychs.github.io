// SNAKE-MAN GLOBE · draw and input
// A chase camera: the view sits just ahead of the snake's head with "up" along its heading,
// so left and right on the keyboard are left and right on screen. Only the near half of the
// globe is drawn. Globe shading and projection follow Zychs/stray-snake's draw.js.
'use strict';
(function () {
    const S = window.SnakeManGlobe, sfx = window.SnakeManGlobeSfx;
    const { dot, cross, unit } = S;
    const GHOST_COLOR = { BLINKY: '#ff3b3b', PINKY: '#ffb8de', INKY: '#3ee0ff', CLYDE: '#ffb347' };
    const LOOK_AHEAD = 0.32;   // how far ahead of the head the view centers, in radians-ish
    const FOLLOW = 7;          // camera catch-up rate, per second

    function boot() {
        const canvas = document.getElementById('globe');
        const ctx = canvas.getContext('2d');
        const SIZE = 640;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cx = SIZE / 2, cy = SIZE / 2, R = SIZE * 0.46;
        const cell = S.STEP * R;   // one step, in pixels, at the center of the view

        let G = S.create(Math.floor(Math.random() * 1e9));
        try { G.hi = Number(localStorage.getItem('snakeman-globe-hi')) || 0; } catch (e) { /* storage blocked */ }
        let savedHi = G.hi;

        const desired = () => ({
            cam: unit({ x: G.pose.position.x + G.pose.heading.x * LOOK_AHEAD, y: G.pose.position.y + G.pose.heading.y * LOOK_AHEAD, z: G.pose.position.z + G.pose.heading.z * LOOK_AHEAD }),
            up: G.pose.heading,
        });
        let cam = desired().cam, upHint = desired().up;
        const view = { right: null, up: null, cam: null };

        function setView() {
            const r = dot(upHint, cam);
            let up = { x: upHint.x - cam.x * r, y: upHint.y - cam.y * r, z: upHint.z - cam.z * r };
            if (Math.hypot(up.x, up.y, up.z) < 1e-6) up = cross(cam, Math.abs(cam.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 0, z: 1 });
            up = unit(up);
            view.right = cross(up, cam);
            view.up = up;
            view.cam = cam;
        }
        const project = p => ({ x: cx + dot(p, view.right) * R, y: cy - dot(p, view.up) * R, z: dot(p, view.cam) });

        function blend(a, b, t) { return unit({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }); }

        function latLon(lat, lon) {
            const cl = Math.cos(lat);
            return { x: cl * Math.sin(lon), y: Math.sin(lat), z: cl * Math.cos(lon) };
        }

        function strokeFront(points, closed) {
            ctx.beginPath();
            let pen = false;
            const n = points.length + (closed ? 1 : 0);
            for (let i = 0; i < n; i++) {
                const p = points[i % points.length];
                if (dot(p, view.cam) < 0.02) { pen = false; continue; }
                const s = project(p);
                if (!pen) { ctx.moveTo(s.x, s.y); pen = true; } else ctx.lineTo(s.x, s.y);
            }
            ctx.stroke();
        }

        function dotAt(p, size, fill) {
            const z = dot(p, view.cam);
            if (z < 0.05) return null;
            const s = project(p);
            ctx.beginPath();
            ctx.fillStyle = fill;
            ctx.arc(s.x, s.y, Math.max(1, size * (0.35 + 0.65 * z)), 0, Math.PI * 2);
            ctx.fill();
            return { s, z };
        }

        function drawGlobe() {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, SIZE, SIZE);
            const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.06, cx, cy, R);
            g.addColorStop(0, '#1f4a33');
            g.addColorStop(0.5, '#0d2a1b');
            g.addColorStop(1, '#03100a');
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
            ctx.strokeStyle = 'rgba(120, 255, 160, 0.10)';
            ctx.lineWidth = 1;
            for (let lon = -Math.PI; lon < Math.PI - 1e-9; lon += Math.PI / 12) {
                const m = []; for (let lat = -Math.PI / 2; lat <= Math.PI / 2 + 1e-9; lat += Math.PI / 36) m.push(latLon(lat, lon));
                strokeFront(m, false);
            }
            for (let lat = -5 * Math.PI / 12; lat <= 5 * Math.PI / 12 + 1e-9; lat += Math.PI / 12) {
                const p = []; for (let lon = -Math.PI; lon <= Math.PI + 1e-9; lon += Math.PI / 36) p.push(latLon(lat, lon));
                strokeFront(p, false);
            }
        }

        function drawWalls() {
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#4059f2';
            ctx.lineWidth = cell * 0.9;
            for (const w of G.walls) strokeFront(w.points, false);
            ctx.strokeStyle = 'rgba(170, 185, 255, 0.55)';
            ctx.lineWidth = cell * 0.25;
            for (const w of G.walls) strokeFront(w.points, false);
        }

        function drawPellets(now) {
            for (const q of G.pellets) {
                if (q.rainbow) dotAt(q.p, cell * 0.55, `hsl(${(now / 4) % 360}, 95%, 62%)`);
                else dotAt(q.p, cell * 0.22, '#ffd84a');
            }
        }

        function drawGhosts(now) {
            for (const g of G.ghosts) {
                if (g.state === 'out') continue;
                let color = GHOST_COLOR[g.name];
                if (g.state === 'daze') color = G.prism < 2000 && Math.floor(now / 160) % 2 ? '#f4f4ff' : '#2a44ff';
                const hit = dotAt(g.pos, cell * 0.62, color);
                if (!hit) continue;
                const r = cell * 0.62 * (0.35 + 0.65 * hit.z);
                for (const side of [-1, 1]) {
                    ctx.beginPath(); ctx.fillStyle = '#fff';
                    ctx.arc(hit.s.x + side * r * 0.38, hit.s.y - r * 0.2, r * 0.28, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.fillStyle = '#123';
                    ctx.arc(hit.s.x + side * r * 0.38, hit.s.y - r * 0.2, r * 0.13, 0, Math.PI * 2); ctx.fill();
                }
            }
        }

        function drawSnake(now) {
            if (G.invuln > 0 && Math.floor(now / 90) % 2) return;
            const body = G.disguised ? '#c9a0ff' : '#36f26b';
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.strokeStyle = body;
            ctx.lineWidth = cell * 0.7;
            strokeFront(G.body, false);
            dotAt(G.pose.position, cell * 0.5, G.disguised ? '#f0e0ff' : '#d9ff66');
            // three short ticks: the ways the snake can go next (straight, 120° left, 120° right)
            const T = window.TernaryGlobe;
            [G.pose, T.turnLeft(G.pose), T.turnRight(G.pose)].forEach((p, i) => {
                const tip = S.stepPose(p, S.STEP * 1.6).position;
                if (dot(tip, view.cam) < 0.05) return;
                const a = project(S.stepPose(p, S.STEP * 0.8).position), b = project(tip);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = i === 0 ? 'rgba(255,216,74,0.9)' : 'rgba(255,255,255,0.45)';
                ctx.lineWidth = i === 0 ? 3 : 2;
                ctx.stroke();
            });
        }

        function drawRim() {
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(120, 255, 160, 0.45)'; ctx.lineWidth = 2; ctx.stroke();
        }

        function banner(lines) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
            ctx.fillRect(0, cy - 60, SIZE, 120);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0f0';
            ctx.font = "20px 'Press Start 2P', monospace";
            ctx.fillText(lines[0], cx, cy - 12);
            ctx.fillStyle = '#9c9';
            ctx.font = "11px 'Press Start 2P', monospace";
            ctx.fillText(lines[1], cx, cy + 24);
        }

        const hud = id => document.getElementById(id);
        function drawHud() {
            hud('score').textContent = G.score;
            hud('hi').textContent = G.hi;
            hud('lives').textContent = '♥'.repeat(Math.max(0, G.lives));
            const s = Math.ceil(G.timeLeft / 1000);
            hud('time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
            hud('time').classList.toggle('low', G.timeLeft < 30000);
            hud('zone').textContent = `${G.stage + 1}/4`;
            hud('dig').textContent = G.digCool > 0 ? `${(G.digCool / 1000).toFixed(1)}s` : 'ready';
            hud('coat').textContent = G.disguised ? `on ${(G.coatT / 1000).toFixed(1)}s` : G.coatCool > 0 ? `${(G.coatCool / 1000).toFixed(1)}s` : 'ready';
        }

        function render(now) {
            setView();
            drawGlobe();
            drawWalls();
            drawPellets(now);
            drawGhosts(now);
            drawSnake(now);
            drawRim();
            if (G.mode === 'ready') banner(['SNAKE-MAN GLOBE', '← → TURN 120° · SPACE STARTS']);
            else if (G.mode === 'paused') banner(['PAUSED', 'SPACE TO GO ON']);
            else if (G.mode === 'over') banner([G.over, `SCORE ${G.score} · SPACE FOR A NEW GLOBE`]);
            drawHud();
        }

        let last = null;
        function frame(now) {
            const dt = last === null ? 0 : Math.min(50, now - last);
            last = now;
            S.update(G, dt);
            for (const e of G.events) sfx.play(e);
            G.events.length = 0;
            if (G.hi !== savedHi) { savedHi = G.hi; try { localStorage.setItem('snakeman-globe-hi', String(G.hi)); } catch (e) { /* storage blocked */ } }
            const want = desired(), k = 1 - Math.exp(-FOLLOW * dt / 1000);
            cam = blend(cam, want.cam, k);
            upHint = blend(upHint, want.up, k);
            render(now);
            requestAnimationFrame(frame);
        }

        function act(a) {
            if (a === 'left') S.turn(G, 'L');
            else if (a === 'right') S.turn(G, 'R');
            else if (a === 'dig') S.dig(G);
            else if (a === 'coat') S.turncoat(G);
            else if (a === 'pause') S.togglePause(G);
            else if (a === 'mute') hud('mute').textContent = sfx.toggleMute() ? 'muted' : 'on';
        }

        document.addEventListener('keydown', ev => {
            const k = ev.key;
            const a = (k === 'ArrowLeft' || k === 'a' || k === 'A' || k === 'q' || k === 'Q') ? 'left'
                : (k === 'ArrowRight' || k === 'd' || k === 'D' || k === 'e' || k === 'E') ? 'right'
                : k === 'Shift' ? 'dig' : k === 'Escape' ? 'coat' : k === ' ' ? 'pause'
                : (k === 'v' || k === 'V') ? 'mute' : null;
            if (!a || ev.repeat) return;
            ev.preventDefault();
            act(a);
        });
        for (const b of document.querySelectorAll('[data-action]')) {
            b.addEventListener('pointerdown', ev => { ev.preventDefault(); act(b.dataset.action); });
        }
        hud('mute').textContent = sfx.muted ? 'muted' : 'on';

        window.SnakeManGlobePage = { get state() { return G; }, act };
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
