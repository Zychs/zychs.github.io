// SNAKE-MAN · abilities
// SKILLS you buy on the upgrades screen (upgrades.js), 2 upgrade points each, once. Each has
// its own key, controller button and touch button, and a cooldown:
//   SPIDER-SENSE  (L / L1)  a red marker over your head whenever a ghost, or an enemy snake, is
//                           close enough to hit you. Press while it shows to DODGE: for about a
//                           second nothing can touch you.
//   TIME BEND     (T)       ghosts and enemy snakes move at half speed for 4 seconds
//   STUN BLAST    (B)       freezes every ghost and stuns every snake within 5 tiles
//   MAGNET        (Y)       eats every dot within 6 tiles at once
//   SECOND WIND   (J)       wins back 1 life, once a run
// Not to be mixed up with the special skills (special.js) and the learn-by-doing ones (skills.js).
// Emits: 'dodge' (SPIDER-SENSE dodged), 'frozen' (STUN BLAST froze a ghost).
'use strict';
(() => {
    const { MAX_LIVES, tdist, emit } = SM.core;
    const G = SM.G, fx = SM.fx;

    const COST = 2;
    const SENSE_RANGE = 8;          // a winding-up or lunging ghost this close can hit you
    const SENSE_SNAKE = 4;          // an enemy snake this close can bite you
    const DODGE_MS = 1100;
    const DEFS = [
        { id: 'sense',  name: 'SPIDER-SENSE', short: 'SENSE',  key: 'l', color: '#ff4444', cool: 4000,
          desc: 'MARKS YOUR HEAD WHEN A GHOST CAN HIT YOU. PRESS TO DODGE IT' },
        { id: 'bend',   name: 'TIME BEND',    short: 'BEND',   key: 't', color: '#7fdfff', cool: 20000, ms: 4000,
          desc: 'GHOSTS AND SNAKES AT HALF SPEED FOR 4s' },
        { id: 'blast',  name: 'STUN BLAST',   short: 'BLAST',  key: 'b', color: '#ffd24a', cool: 15000,
          desc: 'FREEZES GHOSTS AND STUNS SNAKES WITHIN 5 TILES' },
        { id: 'magnet', name: 'MAGNET',       short: 'MAGNET', key: 'y', color: '#ff9cf0', cool: 12000,
          desc: 'EATS EVERY DOT WITHIN 6 TILES AT ONCE' },
        { id: 'wind',   name: 'SECOND WIND',  short: 'WIND',   key: 'j', color: '#33ff66', once: true,
          desc: 'WIN BACK 1 LIFE (ONCE A RUN)' },
    ];
    const byId = Object.fromEntries(DEFS.map(d => [d.id, d]));
    const byKey = Object.fromEntries(DEFS.map(d => [d.key, d.id]));

    let cool = {};          // id → ms left
    let windUsed = false;
    G.slowT = 0;            // ms of TIME BEND left; game.js slows ghosts and snakes while it runs

    const owned = id => SM.profile.hasSkill(id);
    const head = () => G.snake[0];

    function reset() { cool = {}; windUsed = false; G.slowT = 0; }

    // Is something close enough to hurt you? (the SPIDER-SENSE marker)
    function threatened() {
        const h = head();
        for (const g of G.ghosts) {
            if (!g.active || g.traitor || g.frozen > 0) continue;
            if ((g.state === 'aim' || g.state === 'lunge') && tdist(g.x, g.y, h.x, h.y) <= SENSE_RANGE) return true;
        }
        for (const s of SM.snakes.list) {
            if (!s.ally && s.stun <= 0 && tdist(s.body[0].x, s.body[0].y, h.x, h.y) <= SENSE_SNAKE) return true;
        }
        return false;
    }

    function use(id) {
        const d = byId[id], h = head();
        if (!d || !owned(id) || G.mode !== 'play') return false;
        if (d.once && windUsed) { fx.popup(h.x, h.y - 1, d.short + ' USED', '#777'); return false; }
        if (cool[id] > 0) { fx.popup(h.x, h.y - 1, d.short + ' ' + (cool[id] / 1000).toFixed(1) + 's', '#777'); return false; }
        if (!effects[id](d, h)) return false;
        if (d.cool) cool[id] = d.cool;
        fx.burst(h.x, h.y, { n: 14, colors: [d.color, '#fff'], speed: 3, up: 6, life: 600 });
        return true;
    }

    const effects = {
        sense(d, h) {
            if (!threatened()) { fx.popup(h.x, h.y - 1, 'NOTHING NEAR', '#777'); return false; }
            G.invuln = Math.max(G.invuln, DODGE_MS);
            fx.popup(h.x, h.y - 1.5, 'DODGE!', d.color);
            return true;
        },
        bend(d, h) {
            G.slowT = d.ms;
            fx.popup(h.x, h.y - 1.5, 'TIME BEND', d.color);
            return true;
        },
        blast(d, h) {
            let n = 0;
            for (const g of G.ghosts) {
                if (!g.active || g.traitor || g.frozen > 0 || tdist(g.x, g.y, h.x, h.y) > 5) continue;
                g.frozen = 3000;
                if (g.state === 'aim' || g.state === 'lunge') { SM.ghosts.enterState(g, 'hunt'); g.cool = 2000; }
                fx.popup(g.x, g.y, 'STUNNED', d.color);
                emit('frozen', g);
                n++;
            }
            for (const s of SM.snakes.list) if (!s.ally && tdist(s.body[0].x, s.body[0].y, h.x, h.y) <= 5) { s.stun = 3000; n++; }
            fx.popup(h.x, h.y - 1.5, n ? 'STUN BLAST x' + n : 'STUN BLAST', d.color);
            return true;
        },
        magnet(d, h) {
            const dots = SM.pellets.list.filter(p => !p.rainbow && !p.fruit && tdist(p.x, p.y, h.x, h.y) <= 6);
            for (const p of dots) SM.player.eat({ x: p.x, y: p.y }, SM.pellets.YELLOW);
            fx.popup(h.x, h.y - 1.5, dots.length ? 'MAGNET +' + dots.length : 'NO DOTS NEAR', d.color);
            return dots.length > 0;
        },
        wind(d, h) {
            if (G.lives >= MAX_LIVES) { fx.popup(h.x, h.y - 1, 'LIVES FULL', '#777'); return false; }
            G.lives++;
            windUsed = true;
            fx.popup(h.x, h.y - 1.5, 'SECOND WIND +1 LIFE', d.color);
            return true;
        },
    };

    function tick(dt) {
        for (const id of Object.keys(cool)) cool[id] = Math.max(0, cool[id] - dt);
        G.slowT = Math.max(0, G.slowT - dt);
    }

    // --- DRAWING ---
    // The tingle: a flashing red mark and rays over your head while something can hit you.
    function draw(now) {
        if (!owned('sense') || G.mode !== 'play' || !threatened()) return;
        const { ctx, sx, sy, snap } = SM.view, s = SM.core.GRID_SIZE, h = head();
        const x = sx(h.x), y = sy(h.y) - s * 1.1, on = Math.floor(now / 110) % 2;
        ctx.save();
        ctx.fillStyle = on ? '#ff4444' : '#ffd24a';
        for (const a of [-1, 0, 1]) {            // three short rays fanning up
            const dx = a * 9, dy = -Math.abs(a) * 3;
            ctx.fillRect(snap(x + dx - 1), snap(y - 12 + dy), 3, 7);
        }
        ctx.restore();
        SM.gfx.pixelText('!', x, y + 4, 12, on ? '#ff4444' : '#fff', '#000');
    }

    // A tidy line per owned skill, under the missions.
    function hud(now) {
        if (G.mode !== 'play' && G.mode !== 'paused') return;
        const { pixelText } = SM.gfx;
        let row = 0;
        for (const d of DEFS) {
            if (!owned(d.id)) continue;
            const y = 82 + row++ * 11;
            const left = cool[d.id] || 0;
            let txt, col = d.color;
            if (d.once && windUsed) { txt = 'USED'; col = '#666'; }
            else if (d.id === 'bend' && G.slowT > 0) txt = (G.slowT / 1000).toFixed(1) + 's';
            else if (left > 0) { txt = (left / 1000).toFixed(0) + 's'; col = '#666'; }
            else if (d.id === 'sense' && threatened()) { txt = 'PRESS!'; col = Math.floor(now / 110) % 2 ? '#ff4444' : '#fff'; }
            else txt = 'READY';
            pixelText(d.key.toUpperCase() + ' ' + d.short + ' ' + txt, 10, y, 8, col, '#000', 'left');
        }
    }

    // --- TOUCH BUTTONS: one per owned skill, added to the button column ---
    function buttons() {
        const col = document.querySelector('.btns');
        if (!col) return;
        for (const d of DEFS) {
            const id = 'btnAb_' + d.id;
            let b = document.getElementById(id);
            if (owned(d.id) && !b) {
                b = document.createElement('button');
                b.id = id; b.textContent = d.short;
                b.style.color = d.color; b.style.fontSize = '9px'; b.style.borderColor = d.color + '88';
                b.addEventListener('pointerdown', e => { e.preventDefault(); use(d.id); });
                col.insertBefore(b, document.getElementById('btnPause'));
            }
            if (b) b.style.display = owned(d.id) ? '' : 'none';
        }
    }

    SM.abilities = { DEFS, byId, byKey, COST, reset, use, tick, draw, hud, buttons, threatened, owned };
    SM.core.on('skillBought', buttons);
    document.addEventListener('DOMContentLoaded', buttons);
    buttons();
})();
