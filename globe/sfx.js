// SNAKE-MAN GLOBE · sfx
// The flat game's synthesized sounds (snake-man/sfx.js), keyed by the globe's event names,
// plus coat on/off and game over. No audio files. One AudioContext, started on the first
// key or touch (browsers refuse audio before a gesture). V toggles mute.
'use strict';
(function (root) {
    const VOL = 0.18;
    let ac = null, master = null, muted = false;
    try { muted = localStorage.getItem('snakeman-mute') === '1'; } catch (e) { /* storage blocked */ }

    function unlock() {
        if (!ac) {
            const AC = root.AudioContext || root.webkitAudioContext;
            if (!AC) return;
            ac = new AC();
            master = ac.createGain();
            master.gain.value = muted ? 0 : VOL;
            master.connect(ac.destination);
        }
        if (ac.state === 'suspended') ac.resume();
    }
    ['keydown', 'pointerdown', 'touchstart'].forEach(ev => root.addEventListener(ev, unlock, { capture: true, passive: true }));

    function tone(f0, f1 = f0, dur = 0.08, { type = 'square', vol = 1, at = 0 } = {}) {
        if (!ac || muted || ac.state !== 'running') return;
        const t = ac.currentTime + at;
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + dur + 0.02);
    }
    const arp = (notes, step, opts = {}) => notes.forEach((f, i) => tone(f, f, step * 1.1, { ...opts, at: (opts.at || 0) + i * step }));

    let waka = 0;
    const SOUNDS = {
        eat:        e => e.rainbow ? arp([660, 880, 1100, 1320], 0.05, { type: 'triangle' })
                                   : tone((waka ^= 1) ? 520 : 390, 260, 0.06, { vol: 0.5 }),
        prism:      () => tone(200, 1200, 0.35, { type: 'sawtooth', vol: 0.35 }),
        map:        () => tone(120, 700, 0.4, { type: 'sawtooth', vol: 0.3 }),
        ghostEaten: () => tone(1400, 180, 0.25, { type: 'square', vol: 0.6 }),
        hit:        () => { tone(300, 60, 0.4, { type: 'sawtooth' }); tone(150, 40, 0.4, { type: 'square', vol: 0.5 }); },
        dash:       () => tone(180, 60, 0.18, { type: 'triangle' }),
        surfaced:   () => tone(80, 260, 0.15, { type: 'triangle', at: 0.12 }),
        bonk:       () => tone(140, 90, 0.1, { type: 'square', vol: 0.6 }),
        dodge:      () => tone(900, 1300, 0.05, { type: 'sine', vol: 0.4 }),
        heal:       () => arp([392, 523, 659, 784], 0.08, { type: 'triangle' }),
        boost:      () => arp([523, 659, 784, 1047, 1319], 0.06, { type: 'triangle' }),
        coat:       () => tone(500, 1000, 0.12, { type: 'sine', vol: 0.45 }),
        coatOff:    () => tone(1000, 500, 0.12, { type: 'sine', vol: 0.35 }),
        over:       () => arp([392, 330, 262, 196], 0.16, { type: 'square', vol: 0.5, at: 0.4 }),
    };

    function play(e) { const f = SOUNDS[e.name]; if (f) f(e); }
    function toggleMute() {
        muted = !muted;
        try { localStorage.setItem('snakeman-mute', muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
        if (master) master.gain.setTargetAtTime(muted ? 0 : VOL, ac.currentTime, 0.02);
        return muted;
    }

    root.SnakeManGlobeSfx = { play, toggleMute, get muted() { return muted; } };
})(window);
