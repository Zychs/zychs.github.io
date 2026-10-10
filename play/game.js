// SNAKE-MAN · game
// Boot, a fresh run, the per-tick update order, and the end of a run. The main loop lives here.
'use strict';
(() => {
    const { TIME_LIMIT_MS, START_LIVES, RAINBOW_COUNT, CHUNK, CN } = SM.core;
    const G = SM.G, M = SM.map;
    const { on } = SM.core;

    function init() {
        M.generate(G.mapSeed);
        G.score = 0; G.lives = START_LIVES; G.eaten = 0;
        G.timeLeft = TIME_LIMIT_MS;
        G.overReason = '';
        G.board = null;
        G.run = { dodges: 0, kills: 0, stealth: 0 };
        G.hi = SM.scores.best();
        G.ghosts = [];
        G.invuln = 0; G.flash = 0; G.prism = 0; G.prismChain = 0; G.boost = 0;
        SM.fx.clear(); SM.anim.reset(); SM.coat.reset(); SM.dash.reset(); SM.heal.reset(); SM.skills.reset();
        SM.special.reset(); SM.profile.reset(); SM.lunge.reset(); SM.upgrades.comboReset(); SM.abilities.reset();

        // The seeded rng continues from map generation, so the opening layout is the same every run.
        // You start in a plaza, fenced into the highway block around it.
        const rng = M.rng;
        const pk = M.plazas[Math.floor(rng() * M.plazas.length)];
        const px = (pk / CN | 0) * CHUNK + CHUNK / 2, py = (pk % CN) * CHUNK + CHUNK / 2;
        M.setupDomain(px, py, rng);
        SM.player.place(SM.player.findSpawn(px, py, 4, rng));
        SM.pellets.reset();
        for (let i = 0; i < M.STAGES[0].food; i++) SM.pellets.spawn(rng, 6);
        for (let i = 0; i < RAINBOW_COUNT; i++) SM.pellets.spawn(rng, 12, true);

        SM.ghosts.reset();
        SM.voidmode.reset();
        SM.zombies.reset();
        SM.missions.reset();
        SM.snakes.reset();
    }

    // A brand-new map after you lose a life. The run carries over (score, lives, zone, upgrades,
    // missions); the streets, pellets and gates are new, and everyone out there is moved.
    // G.mapSeed is left alone, so "same map" on the start screen still means the run's first map.
    function newWorld() {
        M.generate(1 + Math.floor(Math.random() * 999999));
        const rng = M.rng;
        const pk = M.plazas[Math.floor(rng() * M.plazas.length)];
        const px = (pk / CN | 0) * CHUNK + CHUNK / 2, py = (pk % CN) * CHUNK + CHUNK / 2;
        M.setupDomain(px, py, rng);
        M.growTo(G.eaten);                       // keep the zones you've already opened
        SM.player.place(SM.player.findSpawn(px, py, 4, rng));
        SM.dash.reset();                         // old tunnels belonged to the old map
        G.ghosts.forEach(g => {
            if (!g.active) return;
            if (g.state === 'aim' || g.state === 'lunge') { SM.ghosts.enterState(g, 'hunt'); g.cool = 3000; }
            SM.ghosts.placeInRing(g);
        });
        SM.pellets.reset();
        SM.pellets.fillTo(M.STAGES[M.stage].food);
        for (let i = 0; i < RAINBOW_COUNT; i++) SM.pellets.spawn(Math.random, 12, true);
        SM.snakes.moveToNewMap();
        SM.voidmode.moveToNewMap();
        SM.zombies.moveToNewMap();
    }

    function restart(newMap) {
        if (newMap) G.mapSeed = M.newSeed();
        init();
        G.mode = 'ready';
    }

    function end(reason) {
        G.mode = 'over';
        G.overReason = reason;
        G.board = SM.scores.record({ score: G.score, ...G.run });   // filed on the board for your skill tier (or VOID)
        G.hi = SM.scores.best(G.board.tier);
        SM.profile.finish();
        G.result = { name: SM.profile.name, xp: SM.profile.runXp, level: SM.profile.level() };   // for the game-over screen
    }

    // One tick of the rules. Order matters: the player moves first, then the ghosts react.
    function update(dt) {
        G.timeLeft -= dt;
        if (G.timeLeft <= 0) { G.timeLeft = 0; end('TIME UP'); return; }

        if (!SM.player.update(dt)) return;
        const slow = G.slowT > 0 ? dt * 0.5 : dt;       // TIME BEND (abilities.js) slows the hunters
        if (!SM.ghosts.update(slow)) return;
        SM.snakes.update(slow);
        if (G.mode !== 'play') return;
        G.invuln = Math.max(0, G.invuln - dt);
        G.prism = Math.max(0, G.prism - dt);
        G.boost = Math.max(0, G.boost - dt);
        SM.coat.update(dt);
        SM.dash.tick(dt);
        SM.lunge.tick(dt);
        SM.upgrades.tick(dt);
        SM.abilities.tick(dt);
        SM.heal.update(dt);
        SM.skills.update(dt);
        SM.special.update(dt);
        SM.voidmode.update(dt);
        SM.zombies.update(dt);
        if (G.mode !== 'play') return;
        SM.missions.update(dt);
        SM.profile.update(dt);
        SM.pellets.update(dt);
        SM.ghosts.direct(dt);
        SM.anim.tick(dt);
        SM.fx.update(dt);
    }

    // This run's counts for the record boards.
    on('dodge', () => { if (G.mode === 'play') G.run.dodges++; });
    on('ghostKilled', k => { if (G.mode === 'play') { G.run.kills++; if (k.stealth) G.run.stealth++; } });

    let last = performance.now();
    function loop(now) {
        const dt = Math.min(100, now - last);
        last = now;
        if (G.mode === 'play') update(dt);
        SM.render.draw(now, dt);
        requestAnimationFrame(loop);
    }

    SM.game = { init, restart, newWorld, end, update };

    G.mapSeed = M.loadSeed();
    init();
    requestAnimationFrame(loop);
})();
