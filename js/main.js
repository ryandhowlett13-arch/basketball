// Error handler (must be in same file to see details)
window.onerror = function(msg, url, line, col, error) {
    // Skip generic "Script error." with no details (cross-origin/file:// noise)
    if (msg === 'Script error.' && (line === 0 || !line)) return true;
    const errorBox = document.getElementById('errorBox');
    if (errorBox) {
        errorBox.style.display = 'block';
        const stack = error && error.stack ? error.stack : 'no stack';
        errorBox.innerHTML += `<p><strong>Error:</strong> ${msg}<br><small>${url}:${line}:${col}<br>${stack}</small></p>`;
    }
    return false;
};

// Hoop World - Basketball Game

// === HOOP WORLD THEME ===
// Peaceful yet energetic - uplifting and inspiring
let audioCtx = null;
let musicPlaying = false;
let masterGain = null;
let musicLoopTimer = null;

function startMusic() {
    if (musicPlaying) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicPlaying = true;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(audioCtx.destination);

    startMusicNotes(audioCtx.currentTime + 0.1);
}

function startMusicNotes(startTime) {
    if (!musicPlaying || !audioCtx) return;

    // Notes
    const N = {
        C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
        C6: 1046.50, D6: 1174.66, E6: 1318.51
    };

    const bpm = 95;
    const bt = 60 / bpm;

    // Smooth synth note
    function synth(freq, time, dur, vol = 0.1, wave = 'sine') {
        if (!musicPlaying || !audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 2000;
        o.type = wave;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(vol, time + 0.08);
        g.gain.setValueAtTime(vol, time + dur * 0.7);
        g.gain.linearRampToValueAtTime(0, time + dur);
        o.connect(f);
        f.connect(g);
        g.connect(masterGain);
        o.start(time);
        o.stop(time + dur + 0.1);
    }

    // Warm pad
    function pad(freqs, time, dur, vol = 0.04) {
        freqs.forEach(f => {
            synth(f, time, dur, vol, 'sine');
            synth(f * 1.002, time, dur, vol * 0.5, 'sine'); // Slight detune for warmth
        });
    }

    // Plucky sound
    function pluck(freq, time, dur, vol = 0.12) {
        if (!musicPlaying || !audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(3000, time);
        f.frequency.exponentialRampToValueAtTime(500, time + dur);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);
        o.connect(f);
        f.connect(g);
        g.connect(masterGain);
        o.start(time);
        o.stop(time + dur + 0.1);
    }

    // Soft kick
    function kick(time, vol = 0.15) {
        if (!musicPlaying || !audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(150, time);
        o.frequency.exponentialRampToValueAtTime(40, time + 0.12);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        o.connect(g);
        g.connect(masterGain);
        o.start(time);
        o.stop(time + 0.35);
    }

    // Snappy snare
    function snare(time, vol = 0.08) {
        if (!musicPlaying || !audioCtx) return;
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 1500);
        const n = audioCtx.createBufferSource();
        const g = audioCtx.createGain();
        const f = audioCtx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 3000;
        n.buffer = buf;
        g.gain.value = vol;
        n.connect(f);
        f.connect(g);
        g.connect(masterGain);
        n.start(time);
    }

    // Light hi-hat
    function hat(time, vol = 0.04) {
        if (!musicPlaying || !audioCtx) return;
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.03, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 400);
        const n = audioCtx.createBufferSource();
        const g = audioCtx.createGain();
        const f = audioCtx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 8000;
        n.buffer = buf;
        g.gain.value = vol;
        n.connect(f);
        f.connect(g);
        g.connect(masterGain);
        n.start(time);
    }

    // Bass note
    function bass(freq, time, dur, vol = 0.13) {
        synth(freq, time, dur, vol, 'sine');
        synth(freq, time, dur * 0.5, vol * 0.3, 'triangle');
    }

    // Arpeggio pattern
    function arp(notes, time, noteDur, vol = 0.07) {
        notes.forEach((n, i) => pluck(n, time + i * noteDur, noteDur * 1.5, vol));
    }

    let t = startTime;

    // ===== INTRO - Dreamy and hopeful =====
    // Soft pads set the mood
    pad([N.G3, N.B3, N.D4, N.G4], t, bt * 8, 0.05);
    pad([N.C4, N.E4, N.G4, N.B4], t + bt * 8, bt * 8, 0.05);

    // Gentle arpeggio melody
    const introArp = [N.G4, N.B4, N.D5, N.G5, N.D5, N.B4, N.G4, N.D4];
    for (let i = 0; i < 4; i++) {
        arp(introArp, t + i * bt * 4, bt * 0.5, 0.06);
    }

    // Main theme melody - memorable and uplifting
    const mainTheme = [
        [N.D5, 1], [N.G5, 1], [N.A5, 2], [N.G5, 1], [N.E5, 1], [N.D5, 2],
        [N.E5, 1], [N.G5, 1], [N.A5, 1], [N.B5, 1], [N.A5, 4]
    ];

    let m = t + bt * 4;
    mainTheme.forEach(([note, beats]) => {
        synth(note, m, bt * beats * 0.9, 0.1, 'triangle');
        m += bt * beats;
    });

    t += bt * 16;

    // ===== VERSE 1 - Energy builds, groove kicks in =====
    // Chord progression: G - D - Em - C (uplifting pop progression)
    pad([N.G3, N.B3, N.D4], t, bt * 4, 0.05);
    pad([N.D3, N.F3, N.A3], t + bt * 4, bt * 4, 0.05);
    pad([N.E3, N.G3, N.B3], t + bt * 8, bt * 4, 0.05);
    pad([N.C3, N.E3, N.G3], t + bt * 12, bt * 4, 0.05);

    // Bass groove
    const bassLine = [N.G3, N.G3, N.D3, N.D3, N.E3, N.E3, N.C3, N.C3];
    bassLine.forEach((n, i) => bass(n / 2, t + i * bt * 2, bt * 1.8, 0.12));

    // Drums - laid back groove
    for (let i = 0; i < 16; i++) {
        if (i % 4 === 0) kick(t + bt * i, 0.12);
        if (i % 4 === 2) snare(t + bt * i, 0.06);
        hat(t + bt * i, 0.03);
        if (i % 2 === 1) hat(t + bt * i + bt * 0.5, 0.02);
    }

    // Verse melody - playful and flowing
    const verse1 = [
        [N.B4, 1], [N.D5, 1], [N.E5, 1], [N.D5, 1], [N.B4, 2], [N.A4, 2],
        [N.G4, 1], [N.A4, 1], [N.B4, 1], [N.D5, 1], [N.E5, 2], [N.D5, 2],
        [N.B4, 1], [N.G4, 1], [N.A4, 1], [N.B4, 1], [N.G4, 4]
    ];

    m = t;
    verse1.forEach(([note, beats]) => {
        synth(note, m, bt * beats * 0.85, 0.09, 'triangle');
        m += bt * beats;
    });

    t += bt * 16;

    // ===== CHORUS - Full energy! Peaceful power =====
    // Big warm chords
    pad([N.G3, N.B3, N.D4, N.G4], t, bt * 4, 0.07);
    pad([N.D3, N.A3, N.D4, N.F4], t + bt * 4, bt * 4, 0.07);
    pad([N.E3, N.G3, N.B3, N.E4], t + bt * 8, bt * 4, 0.07);
    pad([N.C3, N.G3, N.C4, N.E4], t + bt * 12, bt * 4, 0.07);

    // Driving bass
    for (let i = 0; i < 16; i++) {
        const bassNotes = [N.G2, N.G2, N.D2, N.D2, N.E2, N.E2, N.C2, N.C2];
        bass(bassNotes[Math.floor(i / 2)] || N.G2, t + bt * i, bt * 0.8, 0.14);
    }

    // Full drums
    for (let i = 0; i < 16; i++) {
        kick(t + bt * i, 0.13);
        if (i % 2 === 1) kick(t + bt * i + bt * 0.5, 0.08);
        if (i % 4 === 2) snare(t + bt * i, 0.08);
        hat(t + bt * i, 0.035);
        hat(t + bt * i + bt * 0.5, 0.025);
    }

    // Soaring chorus melody
    const chorus = [
        [N.G5, 2], [N.A5, 1], [N.B5, 1], [N.A5, 2], [N.G5, 2],
        [N.A5, 2], [N.B5, 2], [N.D6, 4],
        [N.B5, 2], [N.A5, 1], [N.G5, 1], [N.E5, 2], [N.D5, 2],
        [N.E5, 2], [N.G5, 2], [N.A5, 4]
    ];

    m = t;
    chorus.forEach(([note, beats]) => {
        synth(note, m, bt * beats * 0.9, 0.11, 'triangle');
        synth(note / 2, m, bt * beats * 0.9, 0.05, 'sine'); // Octave below
        m += bt * beats;
    });

    // Counter melody arpeggios
    for (let i = 0; i < 4; i++) {
        const chordArps = [
            [N.D4, N.G4, N.B4, N.D5],
            [N.A3, N.D4, N.F4, N.A4],
            [N.B3, N.E4, N.G4, N.B4],
            [N.G3, N.C4, N.E4, N.G4]
        ];
        arp(chordArps[i], t + i * bt * 4 + bt, bt * 0.4, 0.05);
    }

    t += bt * 16;

    // ===== BRIDGE - Breakdown, reflective =====
    pad([N.E3, N.G3, N.B3, N.D4], t, bt * 8, 0.05);
    pad([N.C3, N.E3, N.G3, N.C4], t + bt * 8, bt * 8, 0.05);

    // Sparse drums
    for (let i = 0; i < 16; i++) {
        if (i % 4 === 0) kick(t + bt * i, 0.08);
        if (i % 8 === 4) snare(t + bt * i, 0.04);
        if (i % 2 === 0) hat(t + bt * i, 0.02);
    }

    // Emotional bridge melody
    const bridge = [
        [N.E5, 3], [N.D5, 1], [N.B4, 4],
        [N.C5, 2], [N.D5, 2], [N.E5, 4],
        [N.G5, 3], [N.E5, 1], [N.D5, 4],
        [N.E5, 2], [N.D5, 2], [N.B4, 4]
    ];

    m = t;
    bridge.forEach(([note, beats]) => {
        synth(note, m, bt * beats, 0.08, 'sine');
        m += bt * beats;
    });

    // Rising arpeggio buildup
    const buildArp = [N.B3, N.E4, N.G4, N.B4, N.E5, N.G5, N.B5, N.E6];
    arp(buildArp, t + bt * 12, bt * 0.5, 0.06);

    t += bt * 16;

    // ===== FINAL CHORUS - Peak energy, triumphant =====
    pad([N.G3, N.B3, N.D4, N.G4], t, bt * 4, 0.08);
    pad([N.D3, N.A3, N.D4, N.F4], t + bt * 4, bt * 4, 0.08);
    pad([N.E3, N.G3, N.B3, N.E4], t + bt * 8, bt * 4, 0.08);
    pad([N.C3, N.G3, N.C4, N.E4], t + bt * 12, bt * 4, 0.08);

    // Big bass
    for (let i = 0; i < 16; i++) {
        const bn = [N.G2, N.G2, N.D2, N.D2, N.E2, N.E2, N.C2, N.C2];
        bass(bn[Math.floor(i / 2)] || N.G2, t + bt * i, bt * 0.9, 0.15);
    }

    // Full powerful drums
    for (let i = 0; i < 16; i++) {
        kick(t + bt * i, 0.14);
        if (i % 2 === 1) kick(t + bt * i + bt * 0.5, 0.09);
        if (i % 4 === 2) snare(t + bt * i, 0.09);
        if (i % 4 === 0 && i > 0) snare(t + bt * i - bt * 0.25, 0.04);
        hat(t + bt * i, 0.04);
        hat(t + bt * i + bt * 0.25, 0.02);
        hat(t + bt * i + bt * 0.5, 0.03);
        hat(t + bt * i + bt * 0.75, 0.02);
    }

    // Final triumphant melody
    const finalChorus = [
        [N.B5, 1], [N.D6, 1], [N.B5, 1], [N.A5, 1], [N.G5, 2], [N.A5, 2],
        [N.B5, 2], [N.D6, 2], [N.E6, 4],
        [N.D6, 2], [N.B5, 1], [N.A5, 1], [N.G5, 2], [N.E5, 2],
        [N.G5, 2], [N.A5, 2], [N.B5, 4]
    ];

    m = t;
    finalChorus.forEach(([note, beats]) => {
        synth(note, m, bt * beats * 0.9, 0.12, 'triangle');
        synth(note / 2, m, bt * beats * 0.9, 0.06, 'triangle');
        m += bt * beats;
    });

    t += bt * 16;

    // ===== OUTRO - Peaceful resolution =====
    pad([N.G3, N.B3, N.D4, N.G4], t, bt * 8, 0.06);
    pad([N.G3, N.D4, N.G4, N.B4], t + bt * 8, bt * 12, 0.04);

    // Final melody echo
    const outro = [
        [N.D5, 2], [N.G5, 2], [N.A5, 4],
        [N.G5, 2], [N.E5, 2], [N.D5, 4],
        [N.G4, 8]
    ];

    m = t;
    outro.forEach(([note, beats]) => {
        synth(note, m, bt * beats * 1.2, 0.07, 'sine');
        m += bt * beats;
    });

    // Gentle ending arpeggios
    arp([N.G4, N.B4, N.D5, N.G5], t + bt * 12, bt * 0.6, 0.04);
    arp([N.D5, N.G5, N.B5, N.D6], t + bt * 16, bt * 0.8, 0.03);

    // Final chord
    t += bt * 20;
    pad([N.G3, N.D4, N.G4, N.B4, N.D5], t, bt * 6, 0.05);

    // Loop seamlessly — schedule next iteration before this one ends
    const songLength = (bt * 16 * 6 + bt * 26) * 1000;
    if (musicLoopTimer) clearTimeout(musicLoopTimer);
    musicLoopTimer = setTimeout(() => {
        if (musicPlaying && audioCtx) {
            // Re-schedule notes on the same AudioContext for gapless looping
            let t2 = audioCtx.currentTime + 0.1;
            startMusicNotes(t2);
        }
    }, songLength - 100);
}

function stopMusic() {
    musicPlaying = false;
    if (musicLoopTimer) { clearTimeout(musicLoopTimer); musicLoopTimer = null; }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
}

// Resume music (only if user has music enabled)
function resumeMusic() {
    if (!musicPlaying && playerData && playerData.music) {
        startMusic();
    }
}

// Polyfill for roundRect (older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') {
            r = {tl: r, tr: r, br: r, bl: r};
        } else if (typeof r === 'undefined') {
            r = {tl: 0, tr: 0, br: 0, bl: 0};
        }
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
    };
}

// Screen management
const screens = {
    start: document.getElementById('startScreen'),
    menu: document.getElementById('menuScreen'),
    slot: document.getElementById('slotScreen'),
    modePicker: document.getElementById('modePickerScreen'),
    careerIntro: document.getElementById('careerIntroScreen'),
    createPlayer: document.getElementById('createPlayerScreen'),
    playerProfile: document.getElementById('playerProfileScreen'),
    season: document.getElementById('seasonScreen'),
    seasonHub: document.getElementById('seasonHubScreen'),
    schedule: document.getElementById('scheduleScreen'),
    standings: document.getElementById('standingsScreen'),
    bracket: document.getElementById('bracketScreen'),
    champion: document.getElementById('championScreen'),
    settings: document.getElementById('settingsScreen'),
    game: document.getElementById('gameScreen')
};

// ========================================
// SEASON MODE - Single Pixel Art Basketball Player
// ========================================
const playerShowcase = document.getElementById('playerShowcase');
const showcaseCtx = playerShowcase ? playerShowcase.getContext('2d') : null;
let showcaseAnimationId = null;
let showcaseFrame = 0;

// Draw a single pixel (for true pixel art look)
function drawPixel(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
}

// Draw the detailed pixel art basketball player
function drawShowcasePlayer(ctx, frame) {
    const p = 4; // pixel size
    const w = playerShowcase.width;
    const h = playerShowcase.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Center offset
    const ox = Math.floor(w / (2 * p));
    const oy = 8;

    // Animation bounce
    const bounce = Math.floor(Math.abs(Math.sin(frame * 0.1)) * 2);

    // Colors
    const skin = '#c68642';
    const skinDark = '#a56b2a';
    const hair = '#1a1a1a';
    const jersey = '#552583';      // Lakers purple
    const jerseyLight = '#7a4bab';
    const jerseyDark = '#3d1a5e';
    const shorts = '#fdb927';      // Lakers gold
    const shortsDark = '#d4991f';
    const shoes = '#ffffff';
    const shoesDark = '#cccccc';
    const shoesAccent = '#ff0000';
    const armSleeve = '#ffffff';
    const armSleeveStripe = '#552583';
    const headband = '#fdb927';
    const wristband = '#ffffff';

    // === SHADOW ===
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(ox * p, (oy + 60) * p, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // === LEFT SHOE ===
    const lShoeY = oy + 52 - bounce;
    drawPixel(ctx, ox - 5, lShoeY, p, shoesDark);
    drawPixel(ctx, ox - 4, lShoeY, p, shoes);
    drawPixel(ctx, ox - 3, lShoeY, p, shoes);
    drawPixel(ctx, ox - 2, lShoeY, p, shoes);
    drawPixel(ctx, ox - 5, lShoeY + 1, p, shoesDark);
    drawPixel(ctx, ox - 4, lShoeY + 1, p, shoes);
    drawPixel(ctx, ox - 3, lShoeY + 1, p, shoes);
    drawPixel(ctx, ox - 2, lShoeY + 1, p, shoesAccent);
    drawPixel(ctx, ox - 6, lShoeY + 2, p, shoesDark);
    drawPixel(ctx, ox - 5, lShoeY + 2, p, shoes);
    drawPixel(ctx, ox - 4, lShoeY + 2, p, shoes);
    drawPixel(ctx, ox - 3, lShoeY + 2, p, shoes);
    drawPixel(ctx, ox - 2, lShoeY + 2, p, shoes);
    // Sole
    drawPixel(ctx, ox - 6, lShoeY + 3, p, '#333');
    drawPixel(ctx, ox - 5, lShoeY + 3, p, '#333');
    drawPixel(ctx, ox - 4, lShoeY + 3, p, '#333');
    drawPixel(ctx, ox - 3, lShoeY + 3, p, '#333');
    drawPixel(ctx, ox - 2, lShoeY + 3, p, '#333');

    // === RIGHT SHOE ===
    const rShoeY = oy + 52 - bounce;
    drawPixel(ctx, ox + 1, rShoeY, p, shoes);
    drawPixel(ctx, ox + 2, rShoeY, p, shoes);
    drawPixel(ctx, ox + 3, rShoeY, p, shoes);
    drawPixel(ctx, ox + 4, rShoeY, p, shoesDark);
    drawPixel(ctx, ox + 1, rShoeY + 1, p, shoesAccent);
    drawPixel(ctx, ox + 2, rShoeY + 1, p, shoes);
    drawPixel(ctx, ox + 3, rShoeY + 1, p, shoes);
    drawPixel(ctx, ox + 4, rShoeY + 1, p, shoesDark);
    drawPixel(ctx, ox + 1, rShoeY + 2, p, shoes);
    drawPixel(ctx, ox + 2, rShoeY + 2, p, shoes);
    drawPixel(ctx, ox + 3, rShoeY + 2, p, shoes);
    drawPixel(ctx, ox + 4, rShoeY + 2, p, shoes);
    drawPixel(ctx, ox + 5, rShoeY + 2, p, shoesDark);
    // Sole
    drawPixel(ctx, ox + 1, rShoeY + 3, p, '#333');
    drawPixel(ctx, ox + 2, rShoeY + 3, p, '#333');
    drawPixel(ctx, ox + 3, rShoeY + 3, p, '#333');
    drawPixel(ctx, ox + 4, rShoeY + 3, p, '#333');
    drawPixel(ctx, ox + 5, rShoeY + 3, p, '#333');

    // === LEFT LEG (skin) ===
    const lLegY = oy + 44 - bounce;
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, ox - 4, lLegY + i, p, skin);
        drawPixel(ctx, ox - 3, lLegY + i, p, skin);
        drawPixel(ctx, ox - 5, lLegY + i, p, skinDark);
    }

    // === RIGHT LEG (skin) ===
    const rLegY = oy + 44 - bounce;
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, ox + 2, rLegY + i, p, skin);
        drawPixel(ctx, ox + 3, rLegY + i, p, skin);
        drawPixel(ctx, ox + 4, rLegY + i, p, skinDark);
    }

    // === SHORTS ===
    const shortsY = oy + 34 - bounce;
    // Main shorts
    for (let row = 0; row < 10; row++) {
        for (let col = -5; col <= 4; col++) {
            const c = (col === -5 || col === 4) ? shortsDark : shorts;
            drawPixel(ctx, ox + col, shortsY + row, p, c);
        }
    }
    // Shorts stripe (side)
    for (let row = 0; row < 10; row++) {
        drawPixel(ctx, ox - 5, shortsY + row, p, '#ffffff');
        drawPixel(ctx, ox + 4, shortsY + row, p, '#ffffff');
    }
    // Shorts split
    drawPixel(ctx, ox - 1, shortsY + 8, p, '#0a0a0a');
    drawPixel(ctx, ox, shortsY + 8, p, '#0a0a0a');
    drawPixel(ctx, ox - 1, shortsY + 9, p, '#0a0a0a');
    drawPixel(ctx, ox, shortsY + 9, p, '#0a0a0a');

    // === JERSEY ===
    const jerseyY = oy + 18 - bounce;
    // Main jersey body
    for (let row = 0; row < 16; row++) {
        for (let col = -5; col <= 4; col++) {
            let c = jersey;
            if (col === -5 || col === 4) c = jerseyDark;
            if (col === -4 || col === 3) c = jerseyLight;
            drawPixel(ctx, ox + col, jerseyY + row, p, c);
        }
    }
    // Jersey number "23"
    // 2
    drawPixel(ctx, ox - 3, jerseyY + 5, p, '#fdb927');
    drawPixel(ctx, ox - 2, jerseyY + 5, p, '#fdb927');
    drawPixel(ctx, ox - 2, jerseyY + 6, p, '#fdb927');
    drawPixel(ctx, ox - 3, jerseyY + 7, p, '#fdb927');
    drawPixel(ctx, ox - 2, jerseyY + 7, p, '#fdb927');
    drawPixel(ctx, ox - 3, jerseyY + 8, p, '#fdb927');
    drawPixel(ctx, ox - 3, jerseyY + 9, p, '#fdb927');
    drawPixel(ctx, ox - 2, jerseyY + 9, p, '#fdb927');
    // 3
    drawPixel(ctx, ox + 1, jerseyY + 5, p, '#fdb927');
    drawPixel(ctx, ox + 2, jerseyY + 5, p, '#fdb927');
    drawPixel(ctx, ox + 2, jerseyY + 6, p, '#fdb927');
    drawPixel(ctx, ox + 1, jerseyY + 7, p, '#fdb927');
    drawPixel(ctx, ox + 2, jerseyY + 7, p, '#fdb927');
    drawPixel(ctx, ox + 2, jerseyY + 8, p, '#fdb927');
    drawPixel(ctx, ox + 1, jerseyY + 9, p, '#fdb927');
    drawPixel(ctx, ox + 2, jerseyY + 9, p, '#fdb927');

    // Jersey collar
    drawPixel(ctx, ox - 2, jerseyY, p, '#fdb927');
    drawPixel(ctx, ox - 1, jerseyY, p, '#fdb927');
    drawPixel(ctx, ox, jerseyY, p, '#fdb927');
    drawPixel(ctx, ox + 1, jerseyY, p, '#fdb927');

    // === LEFT ARM WITH SLEEVE ===
    const lArmY = oy + 20 - bounce;
    // Shoulder (jersey)
    drawPixel(ctx, ox - 6, lArmY, p, jersey);
    drawPixel(ctx, ox - 7, lArmY + 1, p, jersey);
    drawPixel(ctx, ox - 6, lArmY + 1, p, jerseyDark);
    // Arm sleeve (white with purple stripe)
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, ox - 8, lArmY + 2 + i, p, armSleeve);
        drawPixel(ctx, ox - 7, lArmY + 2 + i, p, (i === 3 || i === 4) ? armSleeveStripe : armSleeve);
    }
    // Wristband
    drawPixel(ctx, ox - 8, lArmY + 10, p, wristband);
    drawPixel(ctx, ox - 7, lArmY + 10, p, wristband);
    // Hand
    drawPixel(ctx, ox - 8, lArmY + 11, p, skin);
    drawPixel(ctx, ox - 7, lArmY + 11, p, skin);
    drawPixel(ctx, ox - 8, lArmY + 12, p, skinDark);
    drawPixel(ctx, ox - 7, lArmY + 12, p, skin);
    // Fingers
    drawPixel(ctx, ox - 9, lArmY + 12, p, skin);
    drawPixel(ctx, ox - 8, lArmY + 13, p, skin);

    // === RIGHT ARM (holding ball) ===
    const rArmY = oy + 20 - bounce;
    // Shoulder (jersey)
    drawPixel(ctx, ox + 5, rArmY, p, jersey);
    drawPixel(ctx, ox + 5, rArmY + 1, p, jerseyDark);
    drawPixel(ctx, ox + 6, rArmY + 1, p, jersey);
    // Upper arm (skin)
    drawPixel(ctx, ox + 6, rArmY + 2, p, skin);
    drawPixel(ctx, ox + 7, rArmY + 2, p, skin);
    drawPixel(ctx, ox + 7, rArmY + 3, p, skin);
    drawPixel(ctx, ox + 8, rArmY + 3, p, skinDark);
    // Forearm
    drawPixel(ctx, ox + 8, rArmY + 4, p, skin);
    drawPixel(ctx, ox + 9, rArmY + 4, p, skin);
    drawPixel(ctx, ox + 9, rArmY + 5, p, skin);
    drawPixel(ctx, ox + 10, rArmY + 5, p, skinDark);
    // Wristband
    drawPixel(ctx, ox + 10, rArmY + 6, p, wristband);
    drawPixel(ctx, ox + 11, rArmY + 6, p, wristband);
    // Hand under ball
    drawPixel(ctx, ox + 11, rArmY + 7, p, skin);
    drawPixel(ctx, ox + 12, rArmY + 7, p, skin);
    drawPixel(ctx, ox + 11, rArmY + 8, p, skinDark);
    drawPixel(ctx, ox + 12, rArmY + 8, p, skin);

    // === BASKETBALL ===
    const ballX = ox + 11;
    const ballY = rArmY + 1 - Math.floor(Math.sin(frame * 0.15) * 2);
    const ballColor = '#ff6b00';
    const ballDark = '#cc5500';
    const ballLine = '#1a0a00';
    // Ball shape (7x7 circle-ish)
    drawPixel(ctx, ballX, ballY, p, ballDark);
    drawPixel(ctx, ballX + 1, ballY, p, ballColor);
    drawPixel(ctx, ballX + 2, ballY, p, ballColor);
    drawPixel(ctx, ballX + 3, ballY, p, ballDark);

    drawPixel(ctx, ballX - 1, ballY + 1, p, ballDark);
    drawPixel(ctx, ballX, ballY + 1, p, ballColor);
    drawPixel(ctx, ballX + 1, ballY + 1, p, ballLine);
    drawPixel(ctx, ballX + 2, ballY + 1, p, ballColor);
    drawPixel(ctx, ballX + 3, ballY + 1, p, ballColor);
    drawPixel(ctx, ballX + 4, ballY + 1, p, ballDark);

    drawPixel(ctx, ballX - 1, ballY + 2, p, ballColor);
    drawPixel(ctx, ballX, ballY + 2, p, ballLine);
    drawPixel(ctx, ballX + 1, ballY + 2, p, ballLine);
    drawPixel(ctx, ballX + 2, ballY + 2, p, ballLine);
    drawPixel(ctx, ballX + 3, ballY + 2, p, ballLine);
    drawPixel(ctx, ballX + 4, ballY + 2, p, ballColor);

    drawPixel(ctx, ballX - 1, ballY + 3, p, ballColor);
    drawPixel(ctx, ballX, ballY + 3, p, ballColor);
    drawPixel(ctx, ballX + 1, ballY + 3, p, ballLine);
    drawPixel(ctx, ballX + 2, ballY + 3, p, ballColor);
    drawPixel(ctx, ballX + 3, ballY + 3, p, ballColor);
    drawPixel(ctx, ballX + 4, ballY + 3, p, ballDark);

    drawPixel(ctx, ballX - 1, ballY + 4, p, ballDark);
    drawPixel(ctx, ballX, ballY + 4, p, ballColor);
    drawPixel(ctx, ballX + 1, ballY + 4, p, ballLine);
    drawPixel(ctx, ballX + 2, ballY + 4, p, ballColor);
    drawPixel(ctx, ballX + 3, ballY + 4, p, ballColor);
    drawPixel(ctx, ballX + 4, ballY + 4, p, ballDark);

    drawPixel(ctx, ballX, ballY + 5, p, ballDark);
    drawPixel(ctx, ballX + 1, ballY + 5, p, ballColor);
    drawPixel(ctx, ballX + 2, ballY + 5, p, ballColor);
    drawPixel(ctx, ballX + 3, ballY + 5, p, ballDark);

    // === HEAD ===
    const headY = oy + 4 - bounce;
    // Face shape
    for (let row = 0; row < 10; row++) {
        for (let col = -4; col <= 3; col++) {
            if (row === 0 && (col === -4 || col === 3)) continue;
            if (row === 9 && (col === -4 || col === 3)) continue;
            const c = (col === -4) ? skinDark : skin;
            drawPixel(ctx, ox + col, headY + row, p, c);
        }
    }

    // === EARS ===
    drawPixel(ctx, ox - 5, headY + 4, p, skinDark);
    drawPixel(ctx, ox - 5, headY + 5, p, skin);
    drawPixel(ctx, ox + 4, headY + 4, p, skin);
    drawPixel(ctx, ox + 4, headY + 5, p, skinDark);

    // === EYEBROWS ===
    drawPixel(ctx, ox - 3, headY + 3, p, hair);
    drawPixel(ctx, ox - 2, headY + 3, p, hair);
    drawPixel(ctx, ox + 1, headY + 3, p, hair);
    drawPixel(ctx, ox + 2, headY + 3, p, hair);

    // === EYES ===
    // Left eye
    drawPixel(ctx, ox - 3, headY + 4, p, '#ffffff');
    drawPixel(ctx, ox - 2, headY + 4, p, '#1a1a1a');
    drawPixel(ctx, ox - 3, headY + 5, p, '#ffffff');
    drawPixel(ctx, ox - 2, headY + 5, p, '#1a1a1a');
    // Right eye
    drawPixel(ctx, ox + 1, headY + 4, p, '#1a1a1a');
    drawPixel(ctx, ox + 2, headY + 4, p, '#ffffff');
    drawPixel(ctx, ox + 1, headY + 5, p, '#1a1a1a');
    drawPixel(ctx, ox + 2, headY + 5, p, '#ffffff');

    // === NOSE ===
    drawPixel(ctx, ox - 1, headY + 5, p, skinDark);
    drawPixel(ctx, ox, headY + 5, p, skinDark);
    drawPixel(ctx, ox - 1, headY + 6, p, skinDark);
    drawPixel(ctx, ox, headY + 6, p, skin);

    // === MOUTH ===
    drawPixel(ctx, ox - 2, headY + 8, p, '#8b4513');
    drawPixel(ctx, ox - 1, headY + 8, p, '#8b4513');
    drawPixel(ctx, ox, headY + 8, p, '#8b4513');
    drawPixel(ctx, ox + 1, headY + 8, p, '#8b4513');

    // === HEADBAND ===
    const hbY = headY - 1;
    for (let col = -4; col <= 3; col++) {
        drawPixel(ctx, ox + col, hbY, p, headband);
    }
    drawPixel(ctx, ox - 5, hbY, p, headband);
    drawPixel(ctx, ox + 4, hbY, p, headband);

    // === HAIR ===
    const hairY = headY - 4;
    // Flat top / fade style
    for (let row = 0; row < 3; row++) {
        for (let col = -4; col <= 3; col++) {
            if (row === 0 && (col === -4 || col === 3)) continue;
            drawPixel(ctx, ox + col, hairY + row, p, hair);
        }
    }
    // Sides (fade)
    drawPixel(ctx, ox - 5, hairY + 2, p, '#333');
    drawPixel(ctx, ox + 4, hairY + 2, p, '#333');
    drawPixel(ctx, ox - 5, hairY + 3, p, '#222');
    drawPixel(ctx, ox + 4, hairY + 3, p, '#222');
}

function animateShowcase() {
    if (!showcaseCtx) return;

    showcaseFrame++;
    drawShowcasePlayer(showcaseCtx, showcaseFrame);

    showcaseAnimationId = requestAnimationFrame(animateShowcase);
}

function startShowcaseAnimation() {
    if (!playerShowcase) return;
    playerShowcase.width = 200;
    playerShowcase.height = 280;
    if (showcaseAnimationId) cancelAnimationFrame(showcaseAnimationId);
    showcaseFrame = 0;
    animateShowcase();
}

function stopShowcaseAnimation() {
    if (showcaseAnimationId) {
        cancelAnimationFrame(showcaseAnimationId);
        showcaseAnimationId = null;
    }
}

// Draw pixel basketball world on start screen
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

// Store hoops for start screen animation
let startHoops = [];

function resizeBgCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    createStartHoops();
}

function createStartHoops() {
    startHoops = [];
    const w = bgCanvas.width;
    const h = bgCanvas.height;

    for (let i = 0; i < 8; i++) {
        startHoops.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 0.5 + Math.random() * 0.5,
            speed: 0.2 + Math.random() * 0.4,
            opacity: 0.3 + Math.random() * 0.4
        });
    }
}

function drawStartHoop(x, y, size, opacity) {
    const scale = size;
    const p = 11;

    bgCtx.save();
    bgCtx.translate(x, y);
    bgCtx.scale(scale, scale);
    bgCtx.globalAlpha = opacity;

    // Pixel letter drawing function
    function drawPixelLetter(letter, startX, startY, color) {
        bgCtx.fillStyle = color;
        const letters = {
            'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
            'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'P': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
            'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
            'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,0,1]],
            'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]]
        };
        const letterData = letters[letter];
        if (letterData) {
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (letterData[row][col]) {
                        bgCtx.fillRect(startX + col * p, startY + row * p, p, p);
                    }
                }
            }
        }
    }

    // Backboard
    bgCtx.fillStyle = '#fff';
    for (let py = -20; py < 10; py++) {
        for (let px = -22; px < 22; px++) {
            bgCtx.fillRect(px * p, py * p, p, p);
        }
    }

    // Backboard border
    bgCtx.fillStyle = '#222';
    for (let px = -22; px < 22; px++) {
        bgCtx.fillRect(px * p, -20 * p, p, p);
        bgCtx.fillRect(px * p, -21 * p, p, p);
        bgCtx.fillRect(px * p, 9 * p, p, p);
    }
    for (let py = -21; py < 10; py++) {
        bgCtx.fillRect(-22 * p, py * p, p, p);
        bgCtx.fillRect(21 * p, py * p, p, p);
    }

    // Draw "HOOP" centered
    const hoopY = -17 * p;
    drawPixelLetter('H', -14 * p, hoopY, '#ff5722');
    drawPixelLetter('O', -7 * p, hoopY, '#ff5722');
    drawPixelLetter('O', 0 * p, hoopY, '#ff5722');
    drawPixelLetter('P', 7 * p, hoopY, '#ff5722');

    // Draw "WORLD" below centered
    const worldY = -10 * p;
    drawPixelLetter('W', -16 * p, worldY, '#ff5722');
    drawPixelLetter('O', -9 * p, worldY, '#ff5722');
    drawPixelLetter('R', -2 * p, worldY, '#ff5722');
    drawPixelLetter('L', 5 * p, worldY, '#ff5722');
    drawPixelLetter('D', 12 * p, worldY, '#ff5722');

    // Basketball below the text
    const ballCenterX = 0;
    const ballCenterY = -1 * p;
    const ballRadius = 4;
    bgCtx.fillStyle = '#ff7518';
    for (let py = -ballRadius; py <= ballRadius; py++) {
        for (let px = -ballRadius; px <= ballRadius; px++) {
            if (px * px + py * py <= ballRadius * ballRadius) {
                bgCtx.fillRect(ballCenterX + px * p, ballCenterY + py * p, p, p);
            }
        }
    }
    bgCtx.fillStyle = '#1a0a00';
    for (let py = -ballRadius + 1; py <= ballRadius - 1; py++) {
        bgCtx.fillRect(ballCenterX, ballCenterY + py * p, p, p);
    }
    for (let px = -ballRadius + 1; px <= ballRadius - 1; px++) {
        bgCtx.fillRect(ballCenterX + px * p, ballCenterY, p, p);
    }
    for (let py = -ballRadius + 2; py <= ballRadius - 2; py++) {
        const curveX = Math.round(Math.sqrt((ballRadius-1) * (ballRadius-1) - py * py) * 0.5);
        bgCtx.fillRect(ballCenterX + (-curveX - 1) * p, ballCenterY + py * p, p, p);
        bgCtx.fillRect(ballCenterX + (curveX + 1) * p, ballCenterY + py * p, p, p);
    }

    // Rim
    bgCtx.fillStyle = '#ff5722';
    for (let px = -8; px <= 8; px++) {
        bgCtx.fillRect(px * p, 11 * p, p, p);
        bgCtx.fillRect(px * p, 12 * p, p, p);
    }
    bgCtx.fillRect(-9 * p, 11 * p, p, p * 2);
    bgCtx.fillRect(9 * p, 11 * p, p, p * 2);

    // Net
    bgCtx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let py = 13; py < 28; py++) {
        const netWidth = 8 - Math.floor((py - 13) * 0.4);
        for (let px = -netWidth; px <= netWidth; px++) {
            if ((px + py) % 2 === 0) {
                bgCtx.fillRect(px * p, py * p, p, p);
            }
        }
    }

    bgCtx.restore();
}

function animateStartHoops() {
    const w = bgCanvas.width;
    const h = bgCanvas.height;

    bgCtx.fillStyle = '#000000';
    bgCtx.fillRect(0, 0, w, h);

    for (const hoop of startHoops) {
        hoop.x -= hoop.speed * 0.7;
        hoop.y -= hoop.speed * 0.5;

        if (hoop.x < -150) hoop.x = w + 150;
        if (hoop.y < -150) hoop.y = h + 150;

        drawStartHoop(hoop.x, hoop.y, hoop.size, hoop.opacity);
    }

    requestAnimationFrame(animateStartHoops);
}

window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();
animateStartHoops();

// Draw floating hoops background for menu screen
const menuBgCanvas = document.getElementById('menuBgCanvas');
const menuBgCtx = menuBgCanvas.getContext('2d');

// Store hoops for animation
let floatingHoops = [];

function resizeMenuBgCanvas() {
    menuBgCanvas.width = window.innerWidth;
    menuBgCanvas.height = window.innerHeight;
    createFloatingHoops();
}

function createFloatingHoops() {
    floatingHoops = [];
    const w = menuBgCanvas.width;
    const h = menuBgCanvas.height;

    // Create floating hoops
    for (let i = 0; i < 8; i++) {
        floatingHoops.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 0.5 + Math.random() * 0.5,
            speed: 0.2 + Math.random() * 0.4,
            opacity: 0.3 + Math.random() * 0.4
        });
    }
}

function drawHoop(x, y, size, opacity) {
    const scale = size;
    const p = 11; // bigger pixel size for more pixelated look

    menuBgCtx.save();
    menuBgCtx.translate(x, y);
    menuBgCtx.scale(scale, scale);
    menuBgCtx.globalAlpha = opacity;

    // Big pixel backboard (white)
    menuBgCtx.fillStyle = '#fff';
    for (let py = -20; py < 10; py++) {
        for (let px = -22; px < 22; px++) {
            menuBgCtx.fillRect(px * p, py * p, p, p);
        }
    }

    // Backboard border (dark)
    menuBgCtx.fillStyle = '#222';
    for (let px = -22; px < 22; px++) {
        menuBgCtx.fillRect(px * p, -20 * p, p, p);
        menuBgCtx.fillRect(px * p, -21 * p, p, p);
        menuBgCtx.fillRect(px * p, 9 * p, p, p);
    }
    for (let py = -21; py < 10; py++) {
        menuBgCtx.fillRect(-22 * p, py * p, p, p);
        menuBgCtx.fillRect(21 * p, py * p, p, p);
    }

    // Pixel letter drawing function
    function drawPixelLetter(letter, startX, startY, color) {
        menuBgCtx.fillStyle = color;
        const letters = {
            'H': [
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,1,1,1,1],
                [1,0,0,0,1],
                [1,0,0,0,1]
            ],
            'P': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,0],
                [1,0,0,0,0],
                [1,0,0,0,0]
            ],
            'W': [
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,0,1,0,1],
                [1,1,0,1,1],
                [1,0,0,0,1]
            ],
            'O': [
                [0,1,1,1,0],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [0,1,1,1,0]
            ],
            'R': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,0],
                [1,0,0,1,0],
                [1,0,0,0,1]
            ],
            'L': [
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,1,1,1,1]
            ],
            'D': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,1,1,1,0]
            ]
        };

        const letterData = letters[letter];
        if (letterData) {
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (letterData[row][col]) {
                        menuBgCtx.fillRect(startX + col * p, startY + row * p, p, p);
                    }
                }
            }
        }
    }

    // Draw "HOOP" centered
    const hoopY = -17 * p;
    drawPixelLetter('H', -14 * p, hoopY, '#ff5722');
    drawPixelLetter('O', -7 * p, hoopY, '#ff5722');
    drawPixelLetter('O', 0 * p, hoopY, '#ff5722');
    drawPixelLetter('P', 7 * p, hoopY, '#ff5722');

    // Draw "WORLD" below centered
    const worldY = -10 * p;
    drawPixelLetter('W', -16 * p, worldY, '#ff5722');
    drawPixelLetter('O', -9 * p, worldY, '#ff5722');
    drawPixelLetter('R', -2 * p, worldY, '#ff5722');
    drawPixelLetter('L', 5 * p, worldY, '#ff5722');
    drawPixelLetter('D', 12 * p, worldY, '#ff5722');

    // Basketball below the text
    const ballCenterX = 0;
    const ballCenterY = -1 * p;
    const ballRadius = 4;
    menuBgCtx.fillStyle = '#ff7518';
    for (let py = -ballRadius; py <= ballRadius; py++) {
        for (let px = -ballRadius; px <= ballRadius; px++) {
            if (px * px + py * py <= ballRadius * ballRadius) {
                menuBgCtx.fillRect(ballCenterX + px * p, ballCenterY + py * p, p, p);
            }
        }
    }
    // Basketball lines
    menuBgCtx.fillStyle = '#1a0a00';
    for (let py = -ballRadius + 1; py <= ballRadius - 1; py++) {
        menuBgCtx.fillRect(ballCenterX, ballCenterY + py * p, p, p);
    }
    for (let px = -ballRadius + 1; px <= ballRadius - 1; px++) {
        menuBgCtx.fillRect(ballCenterX + px * p, ballCenterY, p, p);
    }
    for (let py = -ballRadius + 2; py <= ballRadius - 2; py++) {
        const curveX = Math.round(Math.sqrt((ballRadius-1) * (ballRadius-1) - py * py) * 0.5);
        menuBgCtx.fillRect(ballCenterX + (-curveX - 1) * p, ballCenterY + py * p, p, p);
        menuBgCtx.fillRect(ballCenterX + (curveX + 1) * p, ballCenterY + py * p, p, p);
    }

    // Big pixel rim (orange/red)
    menuBgCtx.fillStyle = '#ff5722';
    for (let px = -8; px <= 8; px++) {
        menuBgCtx.fillRect(px * p, 11 * p, p, p);
        menuBgCtx.fillRect(px * p, 12 * p, p, p);
    }
    menuBgCtx.fillRect(-9 * p, 11 * p, p, p * 2);
    menuBgCtx.fillRect(9 * p, 11 * p, p, p * 2);

    // Big pixel net (white)
    menuBgCtx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let py = 13; py < 28; py++) {
        const netWidth = 8 - Math.floor((py - 13) * 0.4);
        for (let px = -netWidth; px <= netWidth; px++) {
            if ((px + py) % 2 === 0) {
                menuBgCtx.fillRect(px * p, py * p, p, p);
            }
        }
    }

    menuBgCtx.restore();
}

function animateFloatingHoops() {
    const w = menuBgCanvas.width;
    const h = menuBgCanvas.height;

    // Black background
    menuBgCtx.fillStyle = '#000000';
    menuBgCtx.fillRect(0, 0, w, h);

    // Update and draw hoops
    for (const hoop of floatingHoops) {
        // Move up and left
        hoop.x -= hoop.speed * 0.7;
        hoop.y -= hoop.speed * 0.5;

        // Wrap around when off screen
        if (hoop.x < -100) hoop.x = w + 100;
        if (hoop.y < -100) hoop.y = h + 100;

        // Draw hoop
        drawHoop(hoop.x, hoop.y, hoop.size, hoop.opacity);
    }

    requestAnimationFrame(animateFloatingHoops);
}

window.addEventListener('resize', resizeMenuBgCanvas);
resizeMenuBgCanvas();
animateFloatingHoops();

// Player data (saved to localStorage)
let playerData = {
    gamesPlayed: 0,
    wins: 0,
    totalPoints: 0,
    teamColor: '#2196F3',
    courtStyle: 'classic',
    sound: true,
    music: true,
    difficulty: 'normal',
    gameLength: 120,
    shotClockSetting: 24
};

// Load saved data
function loadPlayerData() {
    const saved = localStorage.getItem('hoopWorldData');
    if (saved) {
        playerData = { ...playerData, ...JSON.parse(saved) };
    }
}

// Save player data
function savePlayerData() {
    localStorage.setItem('hoopWorldData', JSON.stringify(playerData));
}

// Show a screen
function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        if (s) s.style.display = 'none';
    });
    if (screens[screenName]) {
        screens[screenName].style.display = 'flex';
    }
    // Music plays on menu and settings only
    if (screenName === 'menu') {
        resumeMusic();
    } else if (screenName !== 'settings') {
        stopMusic();
    }
}

// Update menu display (stats are tracked but not shown on main menu)
function updateMenuDisplay() {
    // Stats are saved but displayed elsewhere now
}

// Go to main menu (global function for onclick)
window.goToMenu = function() {
    loadPlayerData();
    updateMenuDisplay();
    showScreen('menu');
};

// Press any key to start
document.addEventListener('keydown', (e) => {
    if (screens.start.style.display !== 'none') {
        goToMenu();
    }
});

// Season Mode button
document.getElementById('seasonBtn').addEventListener('click', () => {
    showSlotScreen();
});

// Slot back button
document.getElementById('slotBackBtn').addEventListener('click', () => {
    showScreen('menu');
});

// Season back button (team selection) - go back to mode picker
document.getElementById('seasonBackBtn').addEventListener('click', () => {
    showModePicker();
});

// Exhibition Game button
document.getElementById('exhibitionBtn').addEventListener('click', () => {
    showScreen('game');
    startGame(false);
});

// Tutorial button
document.getElementById('tutorialBtn').addEventListener('click', () => {
    showScreen('game');
    startTutorial();
});

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
    updateSettingsDisplay();
    showScreen('settings');
});


// Settings screen
const gameLengthOptions = [60, 120, 180, 300];
const gameLengthLabels = ['1:00', '2:00', '3:00', '5:00'];
const shotClockOptions = [14, 24, 35, 0];
const shotClockLabels = ['14s', '24s', '35s', 'OFF'];

function updateSettingsDisplay() {
    // Ensure boolean types
    playerData.music = !!playerData.music;
    playerData.sound = !!playerData.sound;

    // Music toggle
    const musicBtn = document.getElementById('musicToggle');
    musicBtn.textContent = playerData.music ? 'ON' : 'OFF';
    musicBtn.className = 'btn-toggle ' + (playerData.music ? 'toggle-on' : 'toggle-off');

    // Sound toggle
    const soundBtn = document.getElementById('soundToggle');
    soundBtn.textContent = playerData.sound ? 'ON' : 'OFF';
    soundBtn.className = 'btn-toggle ' + (playerData.sound ? 'toggle-on' : 'toggle-off');

    // Difficulty
    document.getElementById('difficultyBtn').textContent = (playerData.difficulty || 'normal').toUpperCase();

    // Game length
    const glIdx = gameLengthOptions.indexOf(playerData.gameLength);
    document.getElementById('gameLengthBtn').textContent = gameLengthLabels[glIdx >= 0 ? glIdx : 1];

    // Shot clock
    const scIdx = shotClockOptions.indexOf(playerData.shotClockSetting);
    document.getElementById('shotClockBtn').textContent = shotClockLabels[scIdx >= 0 ? scIdx : 1];

}

document.getElementById('musicToggle').addEventListener('click', function() {
    playerData.music = !playerData.music;
    // Update display FIRST before anything that could fail
    this.textContent = playerData.music ? 'ON' : 'OFF';
    this.className = 'btn-toggle ' + (playerData.music ? 'toggle-on' : 'toggle-off');
    savePlayerData();
    try {
        if (!playerData.music) { stopMusic(); } else { startMusic(); }
    } catch(e) { /* music error won't block UI */ }
});

document.getElementById('soundToggle').addEventListener('click', function() {
    playerData.sound = !playerData.sound;
    this.textContent = playerData.sound ? 'ON' : 'OFF';
    this.className = 'btn-toggle ' + (playerData.sound ? 'toggle-on' : 'toggle-off');
    savePlayerData();
});

document.getElementById('difficultyBtn').addEventListener('click', function() {
    const difficulties = ['easy', 'normal', 'hard'];
    const currentIndex = difficulties.indexOf(playerData.difficulty);
    playerData.difficulty = difficulties[(currentIndex + 1) % difficulties.length];
    this.textContent = playerData.difficulty.toUpperCase();
    savePlayerData();
});

document.getElementById('gameLengthBtn').addEventListener('click', function() {
    const idx = gameLengthOptions.indexOf(playerData.gameLength);
    const newIdx = (idx + 1) % gameLengthOptions.length;
    playerData.gameLength = gameLengthOptions[newIdx];
    this.textContent = gameLengthLabels[newIdx];
    savePlayerData();
});

document.getElementById('shotClockBtn').addEventListener('click', function() {
    const idx = shotClockOptions.indexOf(playerData.shotClockSetting);
    const newIdx = (idx + 1) % shotClockOptions.length;
    playerData.shotClockSetting = shotClockOptions[newIdx];
    this.textContent = shotClockLabels[newIdx];
    savePlayerData();
});

document.getElementById('settingsBackBtn').addEventListener('click', () => {
    showScreen('menu');
});

// Back to menu button (in game)
document.getElementById('backToLobbyBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    gameRunning = false;
    if (seasonState.active) {
        if (seasonState.phase === 'marchMadness') {
            showBracketScreen();
        } else {
            showSeasonHub();
        }
    } else {
        updateMenuDisplay();
        showScreen('menu');
    }
});

// Also allow Escape key to go back to menu
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && gameRunning) {
        gameRunning = false;
        if (seasonState.active) {
            if (seasonState.phase === 'marchMadness') {
                showBracketScreen();
            } else {
                showSeasonHub();
            }
        } else {
            updateMenuDisplay();
            showScreen('menu');
        }
    }
});

// Initialize
loadPlayerData();
updateSettingsDisplay();

// ========================================
// COLLEGE TEAMS DATA — Real conferences
// ========================================
const conferenceOrder = ['SEC', 'Big Ten', 'Big 12', 'ACC', 'Big East', 'Mountain West', 'West Coast'];

const collegeTeams = [
    // === SEC (16 teams) ===
    { name: "Kentucky Thoroughbreds", abbr: "KEN", color1: "#0033A0", color2: "#ffffff", strength: 93, conference: "SEC" },
    { name: "Alabama Stampede", abbr: "ALA", color1: "#9E1B32", color2: "#ffffff", strength: 90, conference: "SEC" },
    { name: "Auburn Bengals", abbr: "AUB", color1: "#0C2340", color2: "#E87722", strength: 89, conference: "SEC" },
    { name: "Tennessee Generals", abbr: "TEN", color1: "#FF8200", color2: "#ffffff", strength: 88, conference: "SEC" },
    { name: "Texas Wranglers", abbr: "TEX", color1: "#BF5700", color2: "#ffffff", strength: 87, conference: "SEC" },
    { name: "Oklahoma Pioneers", abbr: "OKL", color1: "#841617", color2: "#ffffff", strength: 85, conference: "SEC" },
    { name: "Florida Crocs", abbr: "FLA", color1: "#0021A5", color2: "#FA4616", strength: 84, conference: "SEC" },
    { name: "Arkansas Tuskers", abbr: "ARK", color1: "#9D2235", color2: "#ffffff", strength: 82, conference: "SEC" },
    { name: "LSU Bayou Cats", abbr: "LSU", color1: "#461D7C", color2: "#FDD023", strength: 81, conference: "SEC" },
    { name: "Texas A&M Harvesters", abbr: "TAM", color1: "#500000", color2: "#ffffff", strength: 80, conference: "SEC" },
    { name: "Missouri Prowlers", abbr: "MIZ", color1: "#F1B82D", color2: "#000000", strength: 78, conference: "SEC" },
    { name: "Mississippi State Hounds", abbr: "MSS", color1: "#660000", color2: "#ffffff", strength: 77, conference: "SEC" },
    { name: "Ole Miss Raiders", abbr: "OLM", color1: "#CE1126", color2: "#14213D", strength: 76, conference: "SEC" },
    { name: "Georgia Mastiffs", abbr: "UGA", color1: "#BA0C2F", color2: "#000000", strength: 75, conference: "SEC" },
    { name: "South Carolina Roosters", abbr: "SCA", color1: "#73000A", color2: "#000000", strength: 73, conference: "SEC" },
    { name: "Vanderbilt Admirals", abbr: "VAN", color1: "#866D4B", color2: "#000000", strength: 72, conference: "SEC" },

    // === Big Ten (16 teams) ===
    { name: "UCLA Golden Bears", abbr: "UCL", color1: "#2D68C4", color2: "#F2A900", strength: 92, conference: "Big Ten" },
    { name: "Michigan State Centurions", abbr: "MSU", color1: "#18453B", color2: "#ffffff", strength: 90, conference: "Big Ten" },
    { name: "Purdue Ironworks", abbr: "PUR", color1: "#000000", color2: "#CEB888", strength: 87, conference: "Big Ten" },
    { name: "Ohio State Bucks", abbr: "OSU", color1: "#BB0000", color2: "#666666", strength: 86, conference: "Big Ten" },
    { name: "Michigan Wolves", abbr: "MIC", color1: "#00274C", color2: "#FFCB05", strength: 85, conference: "Big Ten" },
    { name: "Oregon Mallards", abbr: "ORE", color1: "#154733", color2: "#FEE123", strength: 84, conference: "Big Ten" },
    { name: "Illinois Flames", abbr: "ILL", color1: "#E84A27", color2: "#13294B", strength: 84, conference: "Big Ten" },
    { name: "Indiana Racers", abbr: "IND", color1: "#990000", color2: "#ffffff", strength: 83, conference: "Big Ten" },
    { name: "USC Titans", abbr: "USC", color1: "#990000", color2: "#FFC72C", strength: 83, conference: "Big Ten" },
    { name: "Wisconsin Claws", abbr: "WIS", color1: "#C5050C", color2: "#ffffff", strength: 82, conference: "Big Ten" },
    { name: "Maryland Snappers", abbr: "MAR", color1: "#E03A3E", color2: "#FFD520", strength: 81, conference: "Big Ten" },
    { name: "Iowa Falcons", abbr: "IOW", color1: "#FFCD00", color2: "#000000", strength: 80, conference: "Big Ten" },
    { name: "Washington Malamutes", abbr: "WAS", color1: "#4B2E83", color2: "#E8D3A2", strength: 77, conference: "Big Ten" },
    { name: "Penn State Mountain Lions", abbr: "PSU", color1: "#041E42", color2: "#ffffff", strength: 76, conference: "Big Ten" },
    { name: "Minnesota Goldens", abbr: "MIN", color1: "#7A0019", color2: "#FFCC33", strength: 75, conference: "Big Ten" },
    { name: "Rutgers Paladins", abbr: "RUT", color1: "#CC0033", color2: "#5F6A72", strength: 70, conference: "Big Ten" },

    // === Big 12 (16 teams) ===
    { name: "Kansas Bluehawks", abbr: "KAN", color1: "#0051BA", color2: "#E8000D", strength: 95, conference: "Big 12" },
    { name: "Houston Pumas", abbr: "HOU", color1: "#C8102E", color2: "#ffffff", strength: 92, conference: "Big 12" },
    { name: "Arizona Bobcats", abbr: "ARI", color1: "#CC0033", color2: "#003366", strength: 91, conference: "Big 12" },
    { name: "Baylor Grizzlies", abbr: "BAY", color1: "#003015", color2: "#FFB81C", strength: 89, conference: "Big 12" },
    { name: "Texas Tech Outlaws", abbr: "TTU", color1: "#CC0000", color2: "#000000", strength: 85, conference: "Big 12" },
    { name: "Iowa State Twisters", abbr: "ISU", color1: "#C8102E", color2: "#F1BE48", strength: 84, conference: "Big 12" },
    { name: "Cincinnati Lynx", abbr: "CIN", color1: "#E00122", color2: "#000000", strength: 82, conference: "Big 12" },
    { name: "Kansas State Panthers", abbr: "KSU", color1: "#512888", color2: "#ffffff", strength: 81, conference: "Big 12" },
    { name: "BYU Catamounts", abbr: "BYU", color1: "#002E5D", color2: "#ffffff", strength: 80, conference: "Big 12" },
    { name: "Colorado Bison", abbr: "COL", color1: "#000000", color2: "#CFB87C", strength: 79, conference: "Big 12" },
    { name: "TCU Horned Toads", abbr: "TCU", color1: "#4D1979", color2: "#A3A9AC", strength: 78, conference: "Big 12" },
    { name: "Oklahoma State Rustlers", abbr: "OKS", color1: "#FF7300", color2: "#000000", strength: 77, conference: "Big 12" },
    { name: "West Virginia Trailblazers", abbr: "WVU", color1: "#002855", color2: "#EAAA00", strength: 76, conference: "Big 12" },
    { name: "Arizona State Scorpions", abbr: "ASU", color1: "#8C1D40", color2: "#FFC627", strength: 76, conference: "Big 12" },
    { name: "UCF Sentinels", abbr: "UCF", color1: "#000000", color2: "#BA9B37", strength: 75, conference: "Big 12" },
    { name: "Utah Peaks", abbr: "UTA", color1: "#CC0000", color2: "#000000", strength: 74, conference: "Big 12" },

    // === ACC (16 teams) ===
    { name: "Duke Royals", abbr: "DUK", color1: "#003087", color2: "#ffffff", strength: 96, conference: "ACC" },
    { name: "North Carolina Pines", abbr: "UNC", color1: "#7BAFD4", color2: "#ffffff", strength: 94, conference: "ACC" },
    { name: "Virginia Monarchs", abbr: "UVA", color1: "#232D4B", color2: "#F84C1E", strength: 88, conference: "ACC" },
    { name: "Louisville Redbirds", abbr: "LOU", color1: "#AD0000", color2: "#000000", strength: 85, conference: "ACC" },
    { name: "Florida State Spears", abbr: "FSU", color1: "#782F40", color2: "#CEB888", strength: 84, conference: "ACC" },
    { name: "Notre Dame Shamrocks", abbr: "NDM", color1: "#0C2340", color2: "#C99700", strength: 83, conference: "ACC" },
    { name: "Syracuse Blaze", abbr: "SYR", color1: "#F76900", color2: "#ffffff", strength: 82, conference: "ACC" },
    { name: "Miami Typhoons", abbr: "MIA", color1: "#F47321", color2: "#005030", strength: 81, conference: "ACC" },
    { name: "NC State Fangs", abbr: "NCS", color1: "#CC0000", color2: "#ffffff", strength: 80, conference: "ACC" },
    { name: "Pittsburgh Forge", abbr: "PIT", color1: "#003594", color2: "#FFB81C", strength: 79, conference: "ACC" },
    { name: "Clemson Stripes", abbr: "CLM", color1: "#F56600", color2: "#522D80", strength: 78, conference: "ACC" },
    { name: "Virginia Tech Gobblers", abbr: "VTH", color1: "#630031", color2: "#CF4520", strength: 77, conference: "ACC" },
    { name: "SMU Broncos", abbr: "SMU", color1: "#0033A0", color2: "#CC0000", strength: 76, conference: "ACC" },
    { name: "Wake Forest Phantoms", abbr: "WKF", color1: "#9E7E38", color2: "#000000", strength: 76, conference: "ACC" },
    { name: "Georgia Tech Hornets", abbr: "GTA", color1: "#B3A369", color2: "#003057", strength: 74, conference: "ACC" },
    { name: "Boston College Hawks", abbr: "BCE", color1: "#8C2633", color2: "#B29D6C", strength: 72, conference: "ACC" },

    // === Big East (10 teams) ===
    { name: "UConn Blizzard", abbr: "UCN", color1: "#0E1A2E", color2: "#ffffff", strength: 93, conference: "Big East" },
    { name: "Villanova Jaguars", abbr: "VIL", color1: "#003366", color2: "#ffffff", strength: 91, conference: "Big East" },
    { name: "Marquette Falcons", abbr: "MRQ", color1: "#003366", color2: "#FFCC00", strength: 86, conference: "Big East" },
    { name: "Creighton Jays", abbr: "CRE", color1: "#005CA9", color2: "#ffffff", strength: 85, conference: "Big East" },
    { name: "Xavier Swordsmen", abbr: "XAV", color1: "#0C2340", color2: "#9EA2A2", strength: 82, conference: "Big East" },
    { name: "St. John's Tempest", abbr: "SJU", color1: "#CC0000", color2: "#ffffff", strength: 80, conference: "Big East" },
    { name: "Providence Monks", abbr: "PRO", color1: "#000000", color2: "#ffffff", strength: 78, conference: "Big East" },
    { name: "Butler Boxers", abbr: "BUT", color1: "#13294B", color2: "#ffffff", strength: 76, conference: "Big East" },
    { name: "Seton Hall Corsairs", abbr: "SHU", color1: "#004488", color2: "#ffffff", strength: 75, conference: "Big East" },
    { name: "Georgetown Greyhounds", abbr: "GTN", color1: "#041E42", color2: "#8D817B", strength: 73, conference: "Big East" },

    // === Mountain West (8 teams) ===
    { name: "San Diego State Warriors", abbr: "SDS", color1: "#A6192E", color2: "#000000", strength: 86, conference: "Mountain West" },
    { name: "Nevada Timber Wolves", abbr: "NEV", color1: "#003366", color2: "#ffffff", strength: 78, conference: "Mountain West" },
    { name: "Boise State Chargers", abbr: "BOI", color1: "#0033A0", color2: "#D64309", strength: 77, conference: "Mountain West" },
    { name: "New Mexico Coyotes", abbr: "UNM", color1: "#BA0C2F", color2: "#ffffff", strength: 75, conference: "Mountain West" },
    { name: "UNLV Aces", abbr: "UNL", color1: "#CF0A2C", color2: "#000000", strength: 74, conference: "Mountain West" },
    { name: "Colorado State Bighorns", abbr: "CSU", color1: "#1E4D2B", color2: "#C8C372", strength: 73, conference: "Mountain West" },
    { name: "Utah State Ranchers", abbr: "USU", color1: "#0F2439", color2: "#ffffff", strength: 72, conference: "Mountain West" },
    { name: "Fresno State Retrievers", abbr: "FRS", color1: "#DB0032", color2: "#13294B", strength: 71, conference: "Mountain West" },

    // === West Coast Conference (6 teams) ===
    { name: "Gonzaga Setters", abbr: "GON", color1: "#002967", color2: "#C8102E", strength: 97, conference: "West Coast" },
    { name: "Saint Mary's Celts", abbr: "SMC", color1: "#D4002A", color2: "#003DA5", strength: 84, conference: "West Coast" },
    { name: "San Francisco Fog", abbr: "USF", color1: "#006633", color2: "#FDBB30", strength: 74, conference: "West Coast" },
    { name: "Santa Clara Colts", abbr: "SCU", color1: "#AA1F2E", color2: "#ffffff", strength: 72, conference: "West Coast" },
    { name: "Loyola Marymount Kings", abbr: "LMU", color1: "#00355F", color2: "#8E0028", strength: 70, conference: "West Coast" },
    { name: "Pepperdine Breakers", abbr: "PEP", color1: "#00205B", color2: "#FF6900", strength: 68, conference: "West Coast" }
];

// ========================================
// SEASON STATE (multi-slot)
// ========================================
const MAX_SEASON_SLOTS = 3;
let currentSlot = 0; // 0-indexed internally, displayed as 1-indexed

let seasonState = {
    active: false,
    myTeam: null,
    schedule: [],
    record: { wins: 0, losses: 0 },
    currentGame: 0,
    standings: [],
    phase: 'regular',
    bracket: null,
    bracketRound: 0
};

function getSlotKey(slot) {
    return `hoopWorldSeason_${slot + 1}`;
}

function saveSeasonState() {
    localStorage.setItem(getSlotKey(currentSlot), JSON.stringify(seasonState));
}

function loadSeasonState() {
    const saved = localStorage.getItem(getSlotKey(currentSlot));
    if (saved) {
        seasonState = JSON.parse(saved);
        // Ensure careerPlayer exists for old saves
        if (!seasonState.careerPlayer) {
            seasonState.careerPlayer = {
                firstName: 'Rookie', lastName: '', number: 1, hometown: '',
                position: 'PG', primaryArchetype: null, secondaryArchetype: null,
                height: 1.0, heightLabel: "6'3\"", weight: 200,
                skinColor: skinTones[2], hairColor: hairColors[0], hairStyle: 'fade',
                attributes: { ...BASE_ATTRIBUTES }
            };
        }
        // Restore careerPlayer global from saved state
        careerPlayer = { ...seasonState.careerPlayer };
    } else {
        seasonState = {
            active: false,
            myTeam: null,
            schedule: [],
            record: { wins: 0, losses: 0 },
            currentGame: 0,
            standings: [],
            phase: 'regular',
            bracket: null,
            bracketRound: 0
        };
    }
}

function loadSlotPreview(slot) {
    const saved = localStorage.getItem(getSlotKey(slot));
    if (saved) return JSON.parse(saved);
    return null;
}

function deleteSlot(slot) {
    localStorage.removeItem(getSlotKey(slot));
    if (slot === currentSlot) {
        seasonState = {
            active: false,
            myTeam: null,
            schedule: [],
            record: { wins: 0, losses: 0 },
            currentGame: 0,
            standings: [],
            phase: 'regular',
            bracket: null,
            bracketRound: 0
        };
    }
}

// Migrate old single-key save to slot 1 if it exists
(function migrateOldSave() {
    const old = localStorage.getItem('hoopWorldSeason');
    if (old) {
        localStorage.setItem(getSlotKey(0), old);
        localStorage.removeItem('hoopWorldSeason');
    }
})();

loadSeasonState();

// Canvas setup - capped at reasonable size
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 700;

function getGameSize() {
    return {
        width: Math.min(window.innerWidth, MAX_WIDTH),
        height: Math.min(window.innerHeight, MAX_HEIGHT)
    };
}

const gameSize = getGameSize();
canvas.width = gameSize.width;
canvas.height = gameSize.height;

// Handle window resize
function resizeGameCanvas() {
    const size = getGameSize();
    canvas.width = size.width;
    canvas.height = size.height;

    // Update court dimensions
    court.width = size.width;
    court.height = size.height;
    court.centerX = size.width / 2;
    court.centerY = size.height / 2;
    court.hoop.x = size.width - 160;
    court.hoop.y = size.height * 0.50;
    court.top = size.height * 0.12;
    court.bottom = size.height * 0.88;
    court.right = size.width - 160;
}
window.addEventListener('resize', resizeGameCanvas);

let gameRunning = false;
let practiceMode = false;
let tutorialStep = 0;
let tutorialScore = 0;
let tutorialTimer = 0;
let tutorialSubState = 'instruction'; // 'instruction' | 'active' | 'success' | 'complete'
let tutorialMoveDistance = 0;
let tutorialSprintFrames = 0;
let tutorialPrevX = 0;
let tutorialPrevY = 0;
let tutorialRebounder = null;
let tutorialResetTimer = 0;

const TUTORIAL_STEPS = [
    { title: 'MOVE', instruction: 'Use Arrow Keys or WASD to move around', successMessage: 'Nice!' },
    { title: 'SPRINT', instruction: 'Hold C to sprint! Watch your stamina drain', successMessage: 'Fast!' },
    { title: 'SHOOT', instruction: 'Hold Z to aim, release in the green zone!', successMessage: 'Swish!' },
    { title: 'PASS', instruction: 'Press X to pass to your teammate', successMessage: 'Great pass!' },
    { title: 'STEAL', instruction: 'Get close to the opponent and press X to steal!', successMessage: 'Stolen!' },
    { title: 'SWITCH', instruction: 'Press Space to switch to the teammate closest to the ball', successMessage: 'Good switch!' }
];

// Shooting bar
let shootingBarActive = false;
let shootingBarValue = 0;
let shootingBarDirection = 1;
let shootingBarSpeed = 3;

// Dribbling
let dribblePhase = 0;

// Net animation
let netSwayTimer = 0;
let netSwayMax = 30;

// Game state
const game = {
    score: { player: 0, opponent: 0 },
    possession: 'player', // 'player' or 'opponent'
    shotClock: 24,
    lastShotClockUpdate: Date.now(),
    paused: false,
    gameTime: 120, // 2 minute games
    lastTimeUpdate: Date.now(),
    gameOver: false
};

// Court dimensions - COURTSIDE VIEW (half court, hoop on RIGHT, room for hoop + chairs)
const court = {
    width: gameSize.width,
    height: gameSize.height,
    centerX: gameSize.width / 2,
    centerY: gameSize.height / 2,
    // Hoop on the RIGHT side (at court boundary)
    hoop: { x: gameSize.width - 160, y: gameSize.height * 0.50 },
    // Court boundaries (shrunk to leave room for hoop/chairs)
    top: gameSize.height * 0.12,
    bottom: gameSize.height * 0.88,
    left: 80,
    right: gameSize.width - 160
};

// Ball
const ball = {
    x: court.centerX,
    y: court.centerY,
    z: 0, // height for shooting arc
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 7,
    holder: null, // reference to player holding ball
    shooting: false,
    swishing: false,
    swishTimer: 0,
    targetX: 0,
    targetY: 0
};

// Skin tone and hair color options for random players
const skinTones = ['#ffe0cc', '#fce4d4', '#f5d0c5', '#f0d5b0', '#f0c5a0', '#eabb88', '#e0b090', '#dbb89a', '#d4a878', '#c8a07a', '#c68642', '#bc8040', '#b07030', '#a46832', '#9a6028', '#8d5524', '#7a4825', '#6b4423', '#5a3520', '#4a2d12', '#3c2415', '#2c1a0e'];
const hairColors = ['#0a0a0a', '#1a1a1a', '#2c1810', '#3d2314', '#5c3a1e', '#8b4513', '#a0522d', '#d4a574', '#c4a35a', '#e8c872', '#f5e6b8', '#b22222', '#cc4400', '#888888', '#c0c0c0', '#ffffff'];
const hairStyles = ['buzz', 'crewcut', 'fade', 'taper', 'midFade', 'flat', 'afro', 'miniAfro', 'curly', 'curlytop', 'wavytop', 'messytop', 'spiky', 'fauxhawk', 'mohawk', 'dreads', 'shortdreads', 'cornrows', 'braids', 'twists', 'long', 'longtied', 'manbun', 'ponytail', 'slickback', 'combover', 'sidepart', 'curtains', 'bowlcut', 'mullet', 'hightop', 'frohawk', 'bald'];

// === ARCHETYPES & ATTRIBUTES ===
const ARCHETYPES = {
    sharpshooter: { name: 'Sharpshooter', desc: 'Elite shooter', boosts: { threePoint: 20, midRange: 18, ballHandling: 5, speed: 2, defense: -5, rebounding: -8, finishing: -2, passing: 5 } },
    playmaker: { name: 'Playmaker', desc: 'Court vision', boosts: { threePoint: 5, midRange: 8, ballHandling: 18, speed: 10, defense: 0, rebounding: -5, finishing: 5, passing: 20 } },
    slasher: { name: 'Slasher', desc: 'Attacks the rim', boosts: { threePoint: -5, midRange: 5, ballHandling: 10, speed: 18, defense: 0, rebounding: 0, finishing: 20, passing: 2 } },
    lockdown: { name: 'Lockdown Defender', desc: 'Stops anyone', boosts: { threePoint: -8, midRange: -2, ballHandling: 5, speed: 10, defense: 20, rebounding: 10, finishing: 0, passing: 5 } },
    glassCleaner: { name: 'Glass Cleaner', desc: 'Board specialist', boosts: { threePoint: -10, midRange: -5, ballHandling: -5, speed: -2, defense: 10, rebounding: 20, finishing: 12, passing: 0 } },
    twoWay: { name: 'Two-Way', desc: 'Both ends', boosts: { threePoint: 5, midRange: 8, ballHandling: 5, speed: 8, defense: 12, rebounding: 5, finishing: 5, passing: 5 } },
    stretchBig: { name: 'Stretch Big', desc: 'Shooting big', boosts: { threePoint: 15, midRange: 15, ballHandling: -5, speed: -5, defense: 5, rebounding: 10, finishing: 5, passing: 2 } },
    postScorer: { name: 'Post Scorer', desc: 'Back to basket', boosts: { threePoint: -8, midRange: 10, ballHandling: 0, speed: -2, defense: 5, rebounding: 12, finishing: 18, passing: 5 } }
};

const BASE_ATTRIBUTES = { midRange: 50, threePoint: 45, ballHandling: 50, speed: 50, defense: 45, rebounding: 40, finishing: 50, passing: 50 };

const ATTRIBUTE_LABELS = {
    midRange: 'Mid-Range',
    threePoint: 'Three-Point',
    ballHandling: 'Ball Handling',
    speed: 'Speed',
    defense: 'Defense',
    rebounding: 'Rebounding',
    finishing: 'Finishing',
    passing: 'Passing'
};

// Position attribute modifiers
const POSITION_BOOSTS = {
    PG: { midRange: 2, threePoint: 3, ballHandling: 8, speed: 6, defense: -2, rebounding: -6, finishing: -2, passing: 8 },
    SG: { midRange: 5, threePoint: 5, ballHandling: 4, speed: 4, defense: 0, rebounding: -4, finishing: 2, passing: 2 },
    SF: { midRange: 2, threePoint: 0, ballHandling: 0, speed: 0, defense: 2, rebounding: 0, finishing: 2, passing: 0 },
    PF: { midRange: -2, threePoint: -4, ballHandling: -4, speed: -3, defense: 4, rebounding: 6, finishing: 5, passing: -2 },
    C:  { midRange: -4, threePoint: -6, ballHandling: -6, speed: -5, defense: 6, rebounding: 8, finishing: 6, passing: -4 }
};

function calculateAttributes(primaryKey, secondaryKey) {
    const attrs = { ...BASE_ATTRIBUTES };

    // Apply archetype boosts
    if (primaryKey && ARCHETYPES[primaryKey]) {
        const boosts = ARCHETYPES[primaryKey].boosts;
        for (const key in boosts) {
            attrs[key] += boosts[key];
        }
    }
    if (secondaryKey && ARCHETYPES[secondaryKey]) {
        const boosts = ARCHETYPES[secondaryKey].boosts;
        for (const key in boosts) {
            attrs[key] += Math.round(boosts[key] * 0.6);
        }
    }

    // Apply position boosts
    const pos = careerPlayer.position || 'PG';
    const posBoosts = POSITION_BOOSTS[pos];
    if (posBoosts) {
        for (const key in posBoosts) {
            attrs[key] += posBoosts[key];
        }
    }

    // Apply height modifiers (base height = 1.0 / 6'3")
    // Taller: +rebounding, +finishing, +defense, -speed, -ballHandling
    const ht = careerPlayer.height || 1.0;
    const htDiff = (ht - 1.0) / 0.2; // normalized: -1 at 5'8", 0 at 6'3", +1 at 6'11"
    attrs.rebounding += Math.round(htDiff * 6);
    attrs.finishing += Math.round(htDiff * 4);
    attrs.defense += Math.round(htDiff * 3);
    attrs.speed -= Math.round(htDiff * 5);
    attrs.ballHandling -= Math.round(htDiff * 4);

    // Apply weight modifiers (base weight = 200)
    // Heavier: +finishing, +rebounding, +defense, -speed
    const wt = careerPlayer.weight || 200;
    const wtDiff = (wt - 200) / 40; // normalized: -1.25 at 150, 0 at 200, +2 at 280
    attrs.finishing += Math.round(wtDiff * 3);
    attrs.rebounding += Math.round(wtDiff * 3);
    attrs.defense += Math.round(wtDiff * 2);
    attrs.speed -= Math.round(wtDiff * 4);

    // Clamp all values
    for (const key in attrs) {
        attrs[key] = Math.min(99, Math.max(25, attrs[key]));
    }

    return attrs;
}

// Player class - Pixel art basketball player
class Player {
    constructor(x, y, team, isControlled = false, randomize = false) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 15;
        this.team = team;
        this.isControlled = isControlled;
        this.speed = 4;
        this.sprintSpeed = 6;
        this.sprinting = false;
        this.stamina = 100;
        this.hasBall = false;
        this.shootingCooldown = 0;
        this.animFrame = 0;
        this.facingDir = 1; // 1 = right, -1 = left

        // Jump mechanics
        this.jumpZ = 0;
        this.jumpVZ = 0;
        this.jumpCooldown = 0;

        // Crossover / step back
        this.crossoverCooldown = 0;
        this.crossoverTimer = 0;
        this.stepBackCooldown = 0;
        this.stepBackTimer = 0;

        // Screen
        this.screenTimer = 0;
        this.screenCooldown = 0;

        // Charge detection
        this.stationaryFrames = 0;

        // Stumble (from crossover ankle-breaker)
        this.stumbleTimer = 0;

        // Randomize appearance if requested
        if (randomize) {
            this.skinColor = skinTones[Math.floor(Math.random() * skinTones.length)];
            this.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
            this.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
            this.jerseyNumber = Math.floor(Math.random() * 99) + 1;
            this.height = 0.9 + Math.random() * 0.3; // Height variation
        } else {
            this.skinColor = '#c68642';
            this.hairColor = '#1a1a1a';
            this.hairStyle = 'fade';
            this.jerseyNumber = 23;
            this.height = 1.0;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Keep player on the court
        const minY = court.top + 10;
        const maxY = court.bottom - 10;
        this.y = Math.max(minY, Math.min(maxY, this.y));

        // X bounds
        const leftBound = court.left + 15;
        const rightBound = court.right - 15;
        this.x = Math.max(leftBound, Math.min(rightBound, this.x));

        this.vx *= 0.85;
        this.vy *= 0.85;

        if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
            this.animFrame += 0.2;
            if (Math.abs(this.vx) > 0.3) {
                this.facingDir = this.vx > 0 ? 1 : -1;
            }
        }

        if (!this.sprinting && this.stamina < 100) {
            this.stamina = Math.min(100, this.stamina + 0.3);
        }

        if (this.shootingCooldown > 0) this.shootingCooldown--;
        if (this.crossoverCooldown > 0) this.crossoverCooldown--;
        if (this.crossoverTimer > 0) this.crossoverTimer--;
        if (this.stepBackCooldown > 0) this.stepBackCooldown--;
        if (this.stepBackTimer > 0) this.stepBackTimer--;
        if (this.jumpCooldown > 0) this.jumpCooldown--;
        if (this.screenTimer > 0) this.screenTimer--;
        if (this.screenCooldown > 0) this.screenCooldown--;
        if (this.stumbleTimer > 0) {
            this.stumbleTimer--;
            // Random velocity jitter while stumbling
            this.vx += (Math.random() - 0.5) * 1.5;
            this.vy += (Math.random() - 0.5) * 1.5;
        }

        // Jump physics
        if (this.jumpZ > 0 || this.jumpVZ > 0) {
            this.jumpZ += this.jumpVZ;
            this.jumpVZ -= 1.5; // gravity
            if (this.jumpZ <= 0) {
                this.jumpZ = 0;
                this.jumpVZ = 0;
            }
        }

        // Stationary tracking for charge detection
        if (Math.abs(this.vx) + Math.abs(this.vy) < 1) {
            this.stationaryFrames++;
        } else {
            this.stationaryFrames = 0;
        }

        if (this.hasBall) {
            dribblePhase += 0.15;
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const sx = screen.x;
        const groundY = screen.y;
        const sy = groundY - (this.jumpZ || 0);
        const p = 2; // smaller pixels = more detail
        const dir = this.facingDir;

        const jerseyColor = this.jerseyColor || (this.team === 'player' ? '#1d428a' : '#ce1141');
        const jerseyColor2 = this.jerseyColor2 || (this.team === 'player' ? '#ffc72c' : '#ffffff');
        const shortsColor = this.shortsColor || (this.team === 'player' ? '#ffc72c' : '#ce1141');
        const shortsDark = this._darkenColor(shortsColor);
        const jerseyDark = this._darkenColor(jerseyColor);
        const skin = this.skinColor;
        const skinDark = this._darkenColor(skin);
        const skinLight = this._lightenColor ? this._lightenColor(skin) : skin;

        const px = (gx, gy, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(sx + gx * p, sy + gy * p, p, p);
        };

        // Animation
        const isMoving = Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5;
        const t = this.animFrame * 0.8;
        const runCycle = isMoving ? Math.sin(t) : 0;
        const runAbs = Math.abs(runCycle);
        const legL = isMoving ? Math.floor(runCycle * 3) : 0;
        const legR = isMoving ? Math.floor(-runCycle * 3) : 0;
        const armL = isMoving ? Math.floor(-runCycle * 2) : 0;
        const armR = isMoving ? Math.floor(runCycle * 2) : 0;
        const bodyBob = isMoving ? Math.floor(runAbs * 0.5) : 0;
        const isDribbling = this.hasBall && !shootingBarActive;

        // Shadow (stays on ground when jumping)
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(sx, groundY + 4, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        const baseY = 0 - bodyBob;

        // === SHOES ===
        const shoeY = baseY;
        const lsx = -3 + legL;
        const rsx = 2 + legR;
        // Left shoe
        px(lsx, shoeY, '#eee'); px(lsx + 1, shoeY, '#fff'); px(lsx + 2, shoeY, '#fff');
        px(lsx, shoeY + 1, '#555'); px(lsx + 1, shoeY + 1, '#444'); px(lsx + 2, shoeY + 1, '#444');
        // Right shoe
        px(rsx, shoeY, '#fff'); px(rsx + 1, shoeY, '#fff'); px(rsx + 2, shoeY, '#eee');
        px(rsx, shoeY + 1, '#444'); px(rsx + 1, shoeY + 1, '#444'); px(rsx + 2, shoeY + 1, '#555');

        // === SOCKS ===
        const sockY = shoeY - 1;
        px(lsx + 0, sockY, '#fff'); px(lsx + 1, sockY, '#eee'); px(lsx + 2, sockY, '#eee');
        px(rsx + 0, sockY, '#eee'); px(rsx + 1, sockY, '#eee'); px(rsx + 2, sockY, '#fff');

        // === CALVES (skin) ===
        const calfLen = 3;
        for (let i = 0; i < calfLen; i++) {
            px(lsx + 0, sockY - 1 - i, skin); px(lsx + 1, sockY - 1 - i, skinDark);
            px(rsx + 1, sockY - 1 - i, skin); px(rsx + 2, sockY - 1 - i, skinDark);
        }

        // === KNEES ===
        const kneeY = sockY - calfLen - 1;
        px(lsx + 0, kneeY, skinDark); px(lsx + 1, kneeY, skin);
        px(rsx + 1, kneeY, skinDark); px(rsx + 2, kneeY, skin);

        // === THIGHS (under shorts, skin) ===
        const thighY = kneeY - 1;
        px(lsx + 0, thighY, skin); px(lsx + 1, thighY, skinDark);
        px(rsx + 1, thighY, skin); px(rsx + 2, thighY, skinDark);

        // === SHORTS ===
        const shortsBot = thighY - 1;
        const shortsH = 5;
        const shortsTop = shortsBot - shortsH + 1;
        for (let row = 0; row < shortsH; row++) {
            const w = row < 2 ? 4 : 5; // narrower at waist
            for (let col = -w; col <= w; col++) {
                const edge = (col === -w || col === w);
                px(col, shortsTop + row, edge ? shortsDark : shortsColor);
            }
        }
        // Shorts stripe
        for (let row = 0; row < shortsH; row++) {
            px(-4, shortsTop + row, jerseyColor2);
            px(4, shortsTop + row, jerseyColor2);
        }
        // Waistband
        for (let col = -4; col <= 4; col++) px(col, shortsTop, shortsDark);

        // === JERSEY ===
        const jerseyBot = shortsTop - 1;
        const jerseyH = 9;
        const jerseyTop = jerseyBot - jerseyH + 1;
        for (let row = 0; row < jerseyH; row++) {
            const w = row < 2 ? 5 : 4; // wider at shoulders
            for (let col = -w; col <= w; col++) {
                const edge = (col === -w || col === w);
                px(col, jerseyTop + row, edge ? jerseyDark : jerseyColor);
            }
        }
        // Collar (V-neck)
        px(-1, jerseyTop, jerseyColor2); px(0, jerseyTop, jerseyColor2); px(1, jerseyTop, jerseyColor2);
        px(0, jerseyTop + 1, jerseyColor2);

        // Jersey number
        const numStr = this.jerseyNumber.toString();
        ctx.fillStyle = jerseyColor2;
        ctx.font = `bold ${p * 4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(numStr, sx, sy + (jerseyTop + 5) * p);

        // === NECK ===
        const neckBot = jerseyTop - 1;
        px(-1, neckBot, skin); px(0, neckBot, skin); px(1, neckBot, skinDark);
        px(-1, neckBot - 1, skin); px(0, neckBot - 1, skin); px(1, neckBot - 1, skinDark);

        // === ARMS ===
        const shoulderY = jerseyTop;
        const backX = dir === 1 ? -1 : 1;
        const frontX = -backX;

        // Back arm (behind body)
        const ba = dir === 1 ? -6 : 6;
        const baOff = dir === 1 ? -1 : 1;
        px(ba, shoulderY, jerseyColor); px(ba + baOff, shoulderY, jerseyColor);
        px(ba, shoulderY + 1, jerseyColor); px(ba + baOff, shoulderY + 1, jerseyDark);
        for (let i = 0; i < 3; i++) {
            px(ba, shoulderY + 2 + i + armL, skin);
            px(ba + baOff, shoulderY + 2 + i + armL, skinDark);
        }
        // Hand
        px(ba, shoulderY + 5 + armL, skin); px(ba + baOff, shoulderY + 5 + armL, skin);
        px(ba, shoulderY + 6 + armL, skinDark); px(ba + baOff, shoulderY + 6 + armL, skinDark);

        // Front arm
        const fa = dir === 1 ? 6 : -6;
        const faOff = dir === 1 ? 1 : -1;
        px(fa, shoulderY, jerseyColor); px(fa + faOff, shoulderY, jerseyColor);
        px(fa, shoulderY + 1, jerseyColor); px(fa + faOff, shoulderY + 1, jerseyDark);
        if (isDribbling) {
            // Dribbling arm - hand reaches down
            const dribY = Math.floor(Math.abs(Math.sin(dribblePhase)) * 3);
            for (let i = 0; i < 3; i++) {
                px(fa, shoulderY + 2 + i, skin);
                px(fa + faOff, shoulderY + 2 + i, skinDark);
            }
            px(fa, shoulderY + 5 + dribY, skin); px(fa + faOff, shoulderY + 5 + dribY, skin);
            px(fa, shoulderY + 6 + dribY, skinDark); px(fa + faOff, shoulderY + 6 + dribY, skinDark);
        } else {
            for (let i = 0; i < 3; i++) {
                px(fa, shoulderY + 2 + i + armR, skin);
                px(fa + faOff, shoulderY + 2 + i + armR, skinDark);
            }
            px(fa, shoulderY + 5 + armR, skin); px(fa + faOff, shoulderY + 5 + armR, skin);
            px(fa, shoulderY + 6 + armR, skinDark); px(fa + faOff, shoulderY + 6 + armR, skinDark);
        }

        // === HEAD ===
        const headBot = neckBot - 2;
        const headH = 7;
        const headTop = headBot - headH + 1;
        // Head shape (rounded)
        for (let row = 0; row < headH; row++) {
            let w = 3;
            if (row === 0 || row === headH - 1) w = 2; // top/bottom rounded
            for (let col = -w; col <= w; col++) {
                const shade = col <= -w ? skinDark : skin;
                px(col, headTop + row, shade);
            }
        }

        // Ears
        px(-4, headTop + 3, skinDark); px(-4, headTop + 4, skinDark);
        px(4, headTop + 3, skin); px(4, headTop + 4, skin);

        // Eyes (row 3 of head)
        const eyeRow = headTop + 3;
        if (dir === 1) {
            px(0, eyeRow, '#fff'); px(1, eyeRow, '#000'); px(2, eyeRow, '#fff');
            px(-1, eyeRow, '#fff'); px(-2, eyeRow, '#000');
        } else {
            px(0, eyeRow, '#fff'); px(-1, eyeRow, '#000'); px(-2, eyeRow, '#fff');
            px(1, eyeRow, '#fff'); px(2, eyeRow, '#000');
        }

        // Mouth
        px(-1, headTop + 5, skinDark); px(0, headTop + 5, skinDark);

        // === EYEBROWS ===
        const ebStyle = this.eyebrowStyle || 'normal';
        const ebColor = this.hairColor;
        const ebRow = headTop + 2;
        if (ebStyle === 'normal') {
            px(-2, ebRow, ebColor); px(-1, ebRow, ebColor);
            px(1, ebRow, ebColor); px(2, ebRow, ebColor);
        } else if (ebStyle === 'thick') {
            for (let c = -3; c <= 3; c++) px(c, ebRow, ebColor);
        } else if (ebStyle === 'thin') {
            px(-1, ebRow, ebColor); px(1, ebRow, ebColor);
        } else if (ebStyle === 'high') {
            px(-2, ebRow - 1, ebColor); px(-1, ebRow - 1, ebColor);
            px(1, ebRow - 1, ebColor); px(2, ebRow - 1, ebColor);
        } else if (ebStyle === 'angry') {
            px(-2, ebRow, ebColor); px(-1, ebRow - 1, ebColor);
            px(1, ebRow - 1, ebColor); px(2, ebRow, ebColor);
        }

        // === HAIR ===
        const hc = this.hairColor;
        const hs = this.hairStyle;
        if (hs === 'buzz') {
            // Very short all over
            for (let c = -2; c <= 2; c++) px(c, headTop - 1, hc);
        } else if (hs === 'crewcut') {
            // Short on top, tapered sides
            for (let c = -2; c <= 2; c++) { px(c, headTop - 1, hc); px(c, headTop - 2, hc); }
        } else if (hs === 'fade') {
            // Top hair with faded sides
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-3, headTop, hc); px(3, headTop, hc);
            px(-3, headTop + 1, hc); px(3, headTop + 1, hc);
        } else if (hs === 'taper') {
            // Clean taper, hair on top
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-3, headTop, hc); px(3, headTop, hc);
        } else if (hs === 'midFade') {
            // Mid fade - more hair on top, sides fade halfway
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-3, headTop + 1, hc); px(3, headTop + 1, hc);
        } else if (hs === 'flat') {
            // Flat top
            for (let c = -3; c <= 3; c++) { px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
        } else if (hs === 'afro') {
            // Full afro
            for (let c = -4; c <= 4; c++) { px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            for (let c = -4; c <= 4; c++) if (Math.abs(c) >= 3) { px(c, headTop, hc); px(c, headTop + 1, hc); px(c, headTop + 2, hc); }
        } else if (hs === 'miniAfro') {
            // Smaller afro
            for (let c = -4; c <= 4; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-4, headTop, hc); px(4, headTop, hc);
        } else if (hs === 'curly') {
            // Curly medium
            for (let c = -4; c <= 4; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-4, headTop, hc); px(4, headTop, hc);
            px(-3, headTop - 3, hc); px(-1, headTop - 3, hc); px(1, headTop - 3, hc); px(3, headTop - 3, hc);
        } else if (hs === 'curlytop') {
            // Curly on top only, short sides
            for (let c = -2; c <= 2; c++) { px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-2, headTop - 4, hc); px(0, headTop - 4, hc); px(2, headTop - 4, hc);
        } else if (hs === 'wavytop') {
            // Wavy hair on top
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-2, headTop - 3, hc); px(0, headTop - 3, hc); px(2, headTop - 3, hc);
        } else if (hs === 'messytop') {
            // Messy textured top
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-3, headTop - 2, hc); px(-1, headTop - 3, hc); px(1, headTop - 2, hc); px(3, headTop - 3, hc);
            px(0, headTop - 2, hc); px(2, headTop - 2, hc); px(-2, headTop - 2, hc);
        } else if (hs === 'spiky') {
            // Spiky
            px(-3, headTop - 3, hc); px(-1, headTop - 4, hc); px(1, headTop - 4, hc); px(3, headTop - 3, hc);
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
        } else if (hs === 'fauxhawk') {
            // Faux hawk - pointed center, short sides
            for (let c = -1; c <= 1; c++) { px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-2, headTop - 1, hc); px(2, headTop - 1, hc);
            px(-2, headTop, hc); px(2, headTop, hc);
        } else if (hs === 'mohawk') {
            // Full mohawk
            for (let c = -1; c <= 1; c++) { px(c, headTop - 4, hc); px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
        } else if (hs === 'dreads') {
            // Long dreads
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            for (let r = 0; r < 6; r++) { px(-4, headTop + r, hc); px(4, headTop + r, hc); }
            px(-3, headTop + 5, hc); px(3, headTop + 5, hc);
            px(-2, headTop + 6, hc); px(2, headTop + 6, hc);
        } else if (hs === 'shortdreads') {
            // Short dreads
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-4, headTop, hc); px(4, headTop, hc);
            px(-4, headTop + 1, hc); px(4, headTop + 1, hc);
            px(-3, headTop + 2, hc); px(3, headTop + 2, hc);
        } else if (hs === 'cornrows') {
            // Cornrows - lines across scalp
            for (let c = -2; c <= 2; c += 2) { px(c, headTop - 1, hc); px(c, headTop, hc); px(c, headTop + 1, hc); px(c, headTop + 2, hc); }
        } else if (hs === 'braids') {
            // Braids hanging down
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-3, headTop, hc); px(-1, headTop, hc); px(1, headTop, hc); px(3, headTop, hc);
            px(-3, headTop + 1, hc); px(-1, headTop + 1, hc); px(1, headTop + 1, hc); px(3, headTop + 1, hc);
            px(-4, headTop + 2, hc); px(-2, headTop + 2, hc); px(2, headTop + 2, hc); px(4, headTop + 2, hc);
            px(-4, headTop + 3, hc); px(-2, headTop + 3, hc); px(2, headTop + 3, hc); px(4, headTop + 3, hc);
            px(-4, headTop + 4, hc); px(4, headTop + 4, hc);
        } else if (hs === 'twists') {
            // Two-strand twists
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-3, headTop - 2, hc); px(-1, headTop - 2, hc); px(1, headTop - 2, hc); px(3, headTop - 2, hc);
            px(-4, headTop, hc); px(4, headTop, hc);
            px(-4, headTop + 1, hc); px(4, headTop + 1, hc);
        } else if (hs === 'long') {
            // Long flowing
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            for (let r = 0; r < 8; r++) { px(-4, headTop + r, hc); px(4, headTop + r, hc); }
            px(-3, headTop + 7, hc); px(3, headTop + 7, hc);
        } else if (hs === 'longtied') {
            // Long hair tied back
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-4, headTop, hc); px(4, headTop, hc);
            px(-4, headTop + 1, hc); px(4, headTop + 1, hc);
            // Tied tail on back side
            const bk = dir === 1 ? -4 : 4;
            px(bk, headTop + 2, hc); px(bk, headTop + 3, hc); px(bk, headTop + 4, hc); px(bk, headTop + 5, hc);
        } else if (hs === 'manbun') {
            // Man bun - tight on sides, bun on top-back
            for (let c = -2; c <= 2; c++) px(c, headTop - 1, hc);
            px(0, headTop - 2, hc); px(-1, headTop - 2, hc); px(1, headTop - 2, hc);
            px(0, headTop - 3, hc); px(-1, headTop - 3, hc); px(1, headTop - 3, hc);
        } else if (hs === 'ponytail') {
            // Ponytail
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-3, headTop, hc); px(3, headTop, hc);
            const bk = dir === 1 ? -4 : 4;
            for (let r = 1; r < 6; r++) px(bk, headTop + r, hc);
        } else if (hs === 'slickback') {
            // Slicked back
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            const bk = dir === 1 ? -1 : 1;
            for (let c = -3; c <= 3; c++) px(c + bk, headTop - 2, hc);
            px(-3, headTop, hc); px(3, headTop, hc);
        } else if (hs === 'combover') {
            // Comb over - hair sweeps to one side
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(dir * 3, headTop, hc); px(dir * 4, headTop, hc);
            px(dir * 4, headTop - 1, hc);
        } else if (hs === 'sidepart') {
            // Side part
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            // Part line
            px(dir * -1, headTop - 2, this.skinColor);
        } else if (hs === 'curtains') {
            // Curtain bangs - parted in middle, hangs on sides
            for (let c = -3; c <= 3; c++) px(c, headTop - 1, hc);
            px(-3, headTop - 2, hc); px(-2, headTop - 2, hc); px(2, headTop - 2, hc); px(3, headTop - 2, hc);
            px(-4, headTop, hc); px(-4, headTop + 1, hc);
            px(4, headTop, hc); px(4, headTop + 1, hc);
        } else if (hs === 'bowlcut') {
            // Bowl cut
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); px(c, headTop, hc); }
            px(-4, headTop, hc); px(4, headTop, hc);
            px(-4, headTop + 1, hc); px(4, headTop + 1, hc);
        } else if (hs === 'mullet') {
            // Mullet - short on top/sides, long in back
            for (let c = -3; c <= 3; c++) { px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            const bk = dir === 1 ? -4 : 4;
            for (let r = 0; r < 7; r++) px(bk, headTop + r, hc);
            px(bk + (dir === 1 ? 1 : -1), headTop + 5, hc);
            px(bk + (dir === 1 ? 1 : -1), headTop + 6, hc);
        } else if (hs === 'hightop') {
            // High top fade
            for (let c = -2; c <= 2; c++) { px(c, headTop - 4, hc); px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-3, headTop - 1, hc); px(3, headTop - 1, hc);
        } else if (hs === 'frohawk') {
            // Frohawk - afro mohawk
            for (let c = -2; c <= 2; c++) { px(c, headTop - 4, hc); px(c, headTop - 3, hc); px(c, headTop - 2, hc); px(c, headTop - 1, hc); }
            px(-3, headTop - 2, hc); px(3, headTop - 2, hc);
            px(-3, headTop - 1, hc); px(3, headTop - 1, hc);
        }

        // === HEADBAND (controlled player) ===
        if (this.isControlled) {
            for (let col = -4; col <= 4; col++) px(col, headTop + 1, jerseyColor2);
        }

        // === STAMINA BAR ===
        if (this.isControlled) {
            const barW = 20;
            const barH = 3;
            const barX = sx - barW / 2;
            const barY = sy + (headTop - 5) * p;
            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = this.stamina > 30 ? '#4caf50' : '#ff9800';
            ctx.fillRect(barX, barY, barW * (this.stamina / 100), barH);
        }
    }

    _darkenColor(hex) {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b)) return '#444444';
            return '#' + [r, g, b].map(c => Math.floor(c * 0.7).toString(16).padStart(2, '0')).join('');
        } catch(e) {
            return '#444444';
        }
    }

    _lightenColor(hex) {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b)) return '#cccccc';
            return '#' + [r, g, b].map(c => Math.min(255, Math.floor(c * 1.3)).toString(16).padStart(2, '0')).join('');
        } catch(e) {
            return '#cccccc';
        }
    }
}

// Rebounder removed


// Create teams (side view positions - will be reset by startGame/startTutorial)
const midDepth = court.height * 0.6;
const playerTeam = [
    new Player(court.centerX - 150, midDepth, 'player', true),
    new Player(court.centerX - 250, midDepth - 80, 'player'),
    new Player(court.centerX - 250, midDepth + 80, 'player'),
    new Player(200, midDepth - 60, 'player'),
    new Player(200, midDepth + 60, 'player')
];

const opponentTeam = [
    new Player(court.centerX + 150, midDepth, 'opponent'),
    new Player(court.centerX + 250, midDepth - 80, 'opponent'),
    new Player(court.centerX + 250, midDepth + 80, 'opponent'),
    new Player(court.width - 200, midDepth - 60, 'opponent'),
    new Player(court.width - 200, midDepth + 60, 'opponent')
];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    if (gameRunning) {
        keys[e.code] = true;
        e.preventDefault();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Get controlled player
function getControlledPlayer() {
    return playerTeam.find(p => p.isControlled);
}

// Switch controlled player
function switchPlayer() {
    const current = getControlledPlayer();
    current.isControlled = false;

    // Find closest teammate to ball
    let closest = playerTeam[0];
    let closestDist = Infinity;

    for (const p of playerTeam) {
        if (p === current) continue;
        const dist = Math.hypot(p.x - ball.x, p.y - ball.y);
        if (dist < closestDist) {
            closestDist = dist;
            closest = p;
        }
    }
    closest.isControlled = true;
}

// Handle input
function handleInput() {
    const player = getControlledPlayer();
    if (!player) return;

    let speed = (keys['KeyC'] && player.stamina > 0) ? player.sprintSpeed : player.speed;
    player.sprinting = keys['KeyC'] && player.stamina > 0;

    if (player.sprinting) {
        player.stamina = Math.max(0, player.stamina - 0.8);
    }

    // Ball handling reduces dribble speed penalty
    if (player.hasBall) {
        const bh = (player.attrs && player.attrs.ballHandling) || 50;
        // At 25 BH: 15% slower, at 99 BH: 0% slower
        const penalty = 1 - (0.15 * (1 - (bh - 25) / 74));
        speed *= penalty;
    }

    if (keys['ArrowUp'] || keys['KeyW']) player.vy = -speed;
    if (keys['ArrowDown'] || keys['KeyS']) player.vy = speed;
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.vx = speed;

    // Shoot (Z)
    if (keys['KeyZ'] && player.hasBall && !ball.shooting && player.shootingCooldown === 0) {
        shoot(player);
        keys['KeyZ'] = false;
    }

    // Pass (X)
    if (keys['KeyX'] && player.hasBall && !ball.shooting) {
        pass(player);
        keys['KeyX'] = false;
    }

    // Steal attempt (X when not having ball)
    if (keys['KeyX'] && !player.hasBall) {
        attemptSteal(player);
        keys['KeyX'] = false;
    }

    // Switch player (Space)
    if (keys['Space']) {
        switchPlayer();
        keys['Space'] = false;
    }

    // Crossover (V)
    if (keys['KeyV'] && player.hasBall && !ball.shooting) {
        performCrossover(player);
        keys['KeyV'] = false;
    }

    // Step back (B)
    if (keys['KeyB'] && player.hasBall && !ball.shooting) {
        performStepBack(player);
        keys['KeyB'] = false;
    }

    // Jump / Block (Q)
    if (keys['KeyQ']) {
        performJump(player);
        keys['KeyQ'] = false;
    }

    // Call screen (E)
    if (keys['KeyE'] && player.hasBall) {
        callScreen(player);
        keys['KeyE'] = false;
    }
}

// Shooting
function shoot(player) {
    const targetHoop = court.hoop;
    const dist = Math.hypot(targetHoop.x - player.x, targetHoop.y - player.y);

    player.hasBall = false;
    ball.holder = null;
    ball.shooting = true;
    ball.targetX = targetHoop.x;
    ball.targetY = targetHoop.y;

    // Calculate trajectory
    const dx = targetHoop.x - ball.x;
    const dy = targetHoop.y - ball.y;
    const time = 40; // frames to reach target

    ball.vx = dx / time;
    ball.vy = dy / time;
    ball.vz = 15; // initial upward velocity
    ball.z = 0;

    // Accuracy based on distance + attributes
    let accuracy = Math.max(0.3, 1 - dist / 800);
    const attrs = player.attrs;
    if (attrs) {
        const isThree = dist > (court.threePointRadius || 200);
        const shotAttr = isThree ? attrs.threePoint : (dist < 80 ? attrs.finishing : attrs.midRange);
        // Attr 50 = no change, 99 = +20% accuracy, 25 = -10% accuracy
        accuracy += (shotAttr - 50) / 250;
        accuracy = Math.max(0.1, Math.min(0.95, accuracy));
    }
    ball.willScore = Math.random() < accuracy;

    // Add some randomness to non-scoring shots
    if (!ball.willScore) {
        ball.vx += (Math.random() - 0.5) * 3;
        ball.vy += (Math.random() - 0.5) * 3;
    }

    player.shootingCooldown = 30;
    game.possession = player.team;
}

// Passing
function pass(player) {
    const teammates = player.team === 'player' ? playerTeam : opponentTeam;

    // Find closest teammate in front
    let target = null;
    let closestDist = Infinity;

    for (const p of teammates) {
        if (p === player) continue;
        const dist = Math.hypot(p.x - player.x, p.y - player.y);
        if (dist < closestDist && dist < 400) {
            closestDist = dist;
            target = p;
        }
    }

    if (target) {
        player.hasBall = false;
        ball.holder = null;

        const dx = target.x - ball.x;
        const dy = target.y - ball.y;
        const dist = Math.hypot(dx, dy);
        // Passing attr affects pass speed: 25->10, 99->16
        const passAttr = (player.attrs && player.attrs.passing) || 50;
        const speed = 10 + (passAttr - 25) / (99 - 25) * 6;

        ball.vx = (dx / dist) * speed;
        ball.vy = (dy / dist) * speed;
        ball.z = 0;
        ball.vz = 0;
        ball.shooting = false;
    }
}

// Steal attempt
function attemptSteal(player) {
    const opponents = player.team === 'player' ? opponentTeam : playerTeam;

    for (const opp of opponents) {
        if (opp.hasBall && Math.hypot(opp.x - player.x, opp.y - player.y) < 50) {
            // Steal chance: base 30%, adjusted by stealer's defense vs handler's ball handling
            let stealChance = 0.3;
            const stealerDef = (player.attrs && player.attrs.defense) || 50;
            const handlerBH = (opp.attrs && opp.attrs.ballHandling) || 50;
            stealChance += (stealerDef - handlerBH) / 200;
            stealChance = Math.max(0.1, Math.min(0.6, stealChance));
            if (Math.random() < stealChance) {
                opp.hasBall = false;
                player.hasBall = true;
                ball.holder = player;
                game.possession = player.team;
            }
            break;
        }
    }
}

// Crossover move (V key)
function performCrossover(player) {
    if (!player.hasBall || player.crossoverCooldown > 0 || shootingBarActive) return;
    player.crossoverCooldown = 30;
    player.crossoverTimer = 15;

    // Lateral burst perpendicular to facing direction
    player.vy += (Math.random() > 0.5 ? 1 : -1) * 8;

    // Fumble chance based on ball handling
    const bh = (player.attrs && player.attrs.ballHandling) || 50;
    const fumbleChance = Math.max(0.02, 0.15 - (bh - 25) / 500);
    if (Math.random() < fumbleChance) {
        player.hasBall = false;
        ball.holder = null;
        ball.vx = (Math.random() - 0.5) * 6;
        ball.vy = (Math.random() - 0.5) * 6;
        return;
    }

    // Ankle-breaker: nearby defenders stumble
    const defenders = player.team === 'player' ? opponentTeam : playerTeam;
    for (const def of defenders) {
        if (Math.hypot(def.x - player.x, def.y - player.y) < 50) {
            def.stumbleTimer = 10;
        }
    }
}

// Step back move (B key)
function performStepBack(player) {
    if (!player.hasBall || player.stepBackCooldown > 0 || shootingBarActive) return;
    player.stepBackCooldown = 30;
    player.stepBackTimer = 12;

    // Hop backward (opposite of facing direction)
    player.vx = -player.facingDir * 10;

    // Fumble chance
    const bh = (player.attrs && player.attrs.ballHandling) || 50;
    const fumbleChance = Math.max(0.02, 0.12 - (bh - 25) / 500);
    if (Math.random() < fumbleChance) {
        player.hasBall = false;
        ball.holder = null;
        ball.vx = (Math.random() - 0.5) * 6;
        ball.vy = (Math.random() - 0.5) * 6;
    }
}

// Jump / Block attempt (Q key)
function performJump(player) {
    if (player.jumpZ > 0 || player.jumpCooldown > 0) return;
    player.jumpCooldown = 20;
    player.jumpVZ = 12; // initial upward velocity
    player.jumpZ = 1; // start slightly off ground

    // Check for block attempt — is a nearby opponent shooting?
    const opponents = player.team === 'player' ? opponentTeam : playerTeam;
    if (ball.shooting && ball.z < 30) {
        // Find the shooter (the last player who had the ball on the opponent team)
        for (const opp of opponents) {
            if (Math.hypot(opp.x - player.x, opp.y - player.y) < 60 && opp.shootingCooldown > 0) {
                // Block attempt!
                const defAttr = (player.attrs && player.attrs.defense) || 50;
                const blockChance = 0.15 + (defAttr - 25) / 200;
                if (Math.random() < blockChance) {
                    // Blocked!
                    ball.willScore = false;
                    ball.vx = -ball.vx * 0.5 + (Math.random() - 0.5) * 5;
                    ball.vy = (Math.random() - 0.5) * 5;
                    ball.vz = -2;
                    ball.shooting = false;
                    ball.z = 0;
                }
                break;
            }
        }
    }
}

// Call for screen (E key)
function callScreen(player) {
    if (!player.hasBall || player.screenCooldown > 0) return;
    player.screenCooldown = 120;

    // Find closest teammate (not controlled)
    const teammates = player.team === 'player' ? playerTeam : opponentTeam;
    let screener = null;
    let closestDist = Infinity;
    for (const t of teammates) {
        if (t === player || t.screenTimer > 0) continue;
        const dist = Math.hypot(t.x - player.x, t.y - player.y);
        if (dist < closestDist) {
            closestDist = dist;
            screener = t;
        }
    }
    if (!screener) return;

    // Find nearest defender to the controlled player
    const defenders = player.team === 'player' ? opponentTeam : playerTeam;
    let nearestDef = null;
    let nearestDefDist = Infinity;
    for (const d of defenders) {
        const dist = Math.hypot(d.x - player.x, d.y - player.y);
        if (dist < nearestDefDist) {
            nearestDefDist = dist;
            nearestDef = d;
        }
    }
    if (!nearestDef) return;

    // Position screener between player and defender
    screener.x = (player.x + nearestDef.x) / 2;
    screener.y = (player.y + nearestDef.y) / 2;
    screener.screenTimer = 90;
    screener.vx = 0;
    screener.vy = 0;
}

// Charge notification state
let chargeNotification = { text: '', timer: 0 };

// Update ball
function updateBall() {
    if (ball.holder) {
        // Ball follows holder
        ball.x = ball.holder.x + 15;
        ball.y = ball.holder.y;
        ball.z = 0;
        return;
    }

    // Apply velocity
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.shooting) {
        ball.z += ball.vz;
        ball.vz -= 0.5; // gravity

        // Block detection: jumping defender near the ball in flight
        if (ball.z < 40 && ball.z > 0) {
            const defTeam = game.possession === 'player' ? opponentTeam : playerTeam;
            for (const def of defTeam) {
                if (def.jumpZ > 10 && Math.hypot(def.x - ball.x, def.y - ball.y) < 50) {
                    const defAttr = (def.attrs && def.attrs.defense) || 50;
                    const blockChance = 0.12 + (defAttr - 25) / 250;
                    if (Math.random() < blockChance) {
                        ball.willScore = false;
                        ball.vx = -ball.vx * 0.5 + (Math.random() - 0.5) * 5;
                        ball.vy = (Math.random() - 0.5) * 5;
                        ball.vz = -2;
                        ball.shooting = false;
                        ball.z = 0;
                        break;
                    }
                }
            }
        }

        // Check if ball reached target area
        const targetHoop = court.hoop;
        const distToHoop = Math.hypot(ball.x - targetHoop.x, ball.y - targetHoop.y);

        if (distToHoop < 30 && ball.z < 20 && ball.vz < 0) {
            // Ball at hoop
            if (ball.willScore) {
                // Score!
                const points = distToHoop > court.threePointRadius ? 3 : 2;
                if (game.possession === 'player') {
                    game.score.player += points;
                } else {
                    game.score.opponent += points;
                }
                resetAfterScore(game.possession === 'player' ? 'opponent' : 'player');
            } else {
                // Miss - ball bounces
                ball.shooting = false;
                ball.vx = (Math.random() - 0.5) * 8;
                ball.vy = (Math.random() - 0.5) * 8;
                ball.z = 0;
            }
        }

        // Ball hit ground
        if (ball.z < 0 && !ball.shooting) {
            ball.z = 0;
            ball.vz = 0;
        }
    }

    // Friction when on ground
    if (ball.z === 0 && !ball.shooting) {
        ball.vx *= 0.95;
        ball.vy *= 0.95;
    }

    // Keep ball in bounds
    if (ball.x < ball.radius || ball.x > court.width - ball.radius) {
        ball.vx *= -0.5;
        ball.x = Math.max(ball.radius, Math.min(court.width - ball.radius, ball.x));
    }
    if (ball.y < ball.radius + 50 || ball.y > court.height - ball.radius - 10) {
        ball.vy *= -0.5;
        ball.y = Math.max(ball.radius + 50, Math.min(court.height - ball.radius - 10, ball.y));
    }

    // Check if any player can pick up the ball (rebounding extends pickup radius)
    if (!ball.shooting && ball.z === 0) {
        const allPlayers = [...playerTeam, ...opponentTeam];
        for (const p of allPlayers) {
            const rebAttr = (p.attrs && p.attrs.rebounding) || 50;
            const pickupRadius = p.radius + ball.radius + (rebAttr - 25) / (99 - 25) * 20;
            if (!p.hasBall && Math.hypot(p.x - ball.x, p.y - ball.y) < pickupRadius) {
                p.hasBall = true;
                ball.holder = p;
                ball.vx = 0;
                ball.vy = 0;
                game.possession = p.team;
                break;
            }
        }
    }
}

// Reset after score
function resetAfterScore(newPossession) {
    ball.shooting = false;
    ball.z = 0;
    ball.vx = 0;
    ball.vy = 0;

    game.possession = newPossession;
    game.shotClock = playerData.shotClockSetting !== undefined ? playerData.shotClockSetting : 24;

    // Reset positions
    const startX = newPossession === 'player' ? 150 : court.width - 150;

    if (newPossession === 'player') {
        playerTeam[0].x = startX;
        playerTeam[0].y = court.centerY;
        playerTeam[0].hasBall = true;
        ball.holder = playerTeam[0];
    } else {
        opponentTeam[0].x = startX;
        opponentTeam[0].y = court.centerY;
        opponentTeam[0].hasBall = true;
        ball.holder = opponentTeam[0];
    }

    // Clear other players' ball possession
    for (const p of [...playerTeam, ...opponentTeam]) {
        if (p !== ball.holder) p.hasBall = false;
    }
}

// Simple AI for opponent team
function updateAI() {
    // AI speed and accuracy based on difficulty
    let aiSpeed, shootChance, passChance;
    switch (playerData.difficulty) {
        case 'easy':
            aiSpeed = 2;
            shootChance = 0.01;
            passChance = 0.003;
            break;
        case 'hard':
            aiSpeed = 4;
            shootChance = 0.04;
            passChance = 0.01;
            break;
        default: // normal
            aiSpeed = 3;
            shootChance = 0.02;
            passChance = 0.005;
    }

    for (const opp of opponentTeam) {
        // Skip AI if setting a screen
        if (opp.screenTimer > 0) {
            opp.vx = 0;
            opp.vy = 0;
            continue;
        }
        if (opp.hasBall) {
            // Move toward hoop
            const targetX = court.hoop.x - 150;
            const targetY = court.hoop.y + (Math.random() - 0.5) * 100;

            const dx = targetX - opp.x;
            const dy = targetY - opp.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 10) {
                opp.vx = (dx / dist) * aiSpeed;
                opp.vy = (dy / dist) * aiSpeed;
            }

            // Shoot if close enough
            if (Math.hypot(court.hoop.x - opp.x, court.hoop.y - opp.y) < 250 && Math.random() < shootChance) {
                shoot(opp);
            }

            // Sometimes pass
            if (Math.random() < passChance) {
                pass(opp);
            }
        } else {
            // Move toward ball or defensive position
            const controlled = getControlledPlayer();
            if (game.possession === 'player' && controlled) {
                // Defense - move toward player with ball
                const dx = controlled.x - opp.x;
                const dy = controlled.y - opp.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 80) {
                    opp.vx = (dx / dist) * 2.5;
                    opp.vy = (dy / dist) * 2.5;
                }
            } else if (game.possession === 'opponent') {
                // Offense - spread out
                const targetY = court.centerY + (opponentTeam.indexOf(opp) - 2) * 80;
                const dy = targetY - opp.y;
                opp.vy = Math.sign(dy) * Math.min(Math.abs(dy), 2);
            }
        }
    }

    // AI for player teammates (not controlled)
    for (const p of playerTeam) {
        // Skip AI if setting a screen
        if (p.screenTimer > 0) {
            p.vx = 0;
            p.vy = 0;
            continue;
        }
        if (!p.isControlled && !p.hasBall) {
            // Move to open positions
            if (game.possession === 'player') {
                // Offense - move toward hoop area
                const targetX = court.hoop.x - 200 + Math.random() * 100;
                const targetY = court.centerY + (playerTeam.indexOf(p) - 2) * 100;

                const dx = targetX - p.x;
                const dy = targetY - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 30) {
                    p.vx = (dx / dist) * 2;
                    p.vy = (dy / dist) * 2;
                }
            } else {
                // Defense
                const matchup = opponentTeam[playerTeam.indexOf(p)];
                if (matchup) {
                    const dx = matchup.x - p.x;
                    const dy = matchup.y - p.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 60) {
                        p.vx = (dx / dist) * 2.5;
                        p.vy = (dy / dist) * 2.5;
                    }
                }
            }
        }
    }

    // Screen collision: defenders hitting a screener get slowed
    const allPlayers = [...playerTeam, ...opponentTeam];
    for (const screener of allPlayers) {
        if (screener.screenTimer <= 0) continue;
        const enemies = screener.team === 'player' ? opponentTeam : playerTeam;
        for (const def of enemies) {
            if (Math.hypot(def.x - screener.x, def.y - screener.y) < 30) {
                def.vx *= 0.2;
                def.vy *= 0.2;
            }
        }
    }
}

// Convert court position to screen position (3D perspective - COURTSIDE VIEW)
// Looking from the side of the court, hoop on the right
function toScreen(x, y, z = 0) {
    // Simple 2D side view - x maps directly, y is vertical position on court
    // z is elevation (for jumping/shooting arc)

    // Screen position
    const screenX = x;
    const screenY = y - z;  // Subtract z to go higher when elevated

    return { x: screenX, y: screenY, scale: 1.0 };
}

// Draw pixel art NBA hoop - 3D with depth
function drawHoop3D(hoopX, courtMidY, dir) {
    const p = 3;
    const cy = Math.floor(courtMidY / p);
    const cx = Math.floor(hoopX / p);

    function px(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * p, y * p, p, p);
    }

    function pxRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * p, y * p, w * p, h * p);
    }

    // === HOOP LAND STYLE BACKBOARD & STAND ===
    const rx = 7;
    const rimCX = cx - dir * 17;  // rim position
    const ry = 4;
    const rimCY = cy - 1;

    // Floor level
    const floorY = cy + 55;

    // --- BACKBOARD (Hoop Land style) ---
    const bbHeight = 32;
    const bbWidth = 10;
    const bbShear = 3;
    const bbX = rimCX + rx + 2;
    const bbTop = cy - Math.floor(bbHeight / 2);

    // Clear glass fill
    for (let row = 0; row < bbHeight; row++) {
        const shear = Math.floor(row * bbShear / bbHeight);
        for (let col = 0; col < bbWidth; col++) {
            px(bbX + dir * (col + shear), bbTop + row, 'rgba(200, 230, 255, 0.15)');
        }
    }

    // Border outline
    for (let col = 0; col < bbWidth; col++) {
        px(bbX + dir * col, bbTop, 'rgba(180, 210, 240, 0.7)');
    }
    for (let col = 0; col < bbWidth; col++) {
        px(bbX + dir * (col + bbShear), bbTop + bbHeight - 1, 'rgba(180, 210, 240, 0.7)');
    }
    for (let row = 0; row < bbHeight; row++) {
        const shear = Math.floor(row * bbShear / bbHeight);
        px(bbX + dir * shear, bbTop + row, 'rgba(180, 210, 240, 0.7)');
    }
    for (let row = 0; row < bbHeight; row++) {
        const shear = Math.floor(row * bbShear / bbHeight);
        px(bbX + dir * (bbWidth - 1 + shear), bbTop + row, 'rgba(180, 210, 240, 0.7)');
    }

    // Target square (white outline)
    const sqH = 8;
    const sqW = 4;
    const sqTop = cy - Math.floor(sqH / 2) - 2;
    for (let row = 0; row < sqH; row++) {
        const shear = Math.floor((sqTop - bbTop + row) * bbShear / bbHeight);
        for (let col = 0; col < sqW; col++) {
            if (row === 0 || row === sqH - 1 || col === 0 || col === sqW - 1) {
                px(bbX + dir * (2 + col + shear), sqTop + row, '#ffffff');
            }
        }
    }

    // --- CONNECTOR (orange, from rim to backboard) ---
    const barY = rimCY - 1;
    for (let i = 0; i < 3; i++) {
        const xi = rimCX + rx + i;
        px(xi, barY, '#ff8a50');
        px(xi, barY + 1, '#ff5722');
        px(xi, barY + 2, '#cc4400');
    }

    const topEdge = [];
    const botEdge = [];
    for (let xi = -rx; xi <= rx; xi++) {
        const yf = ry * Math.sqrt(Math.max(0, 1 - (xi * xi) / (rx * rx)));
        topEdge[xi + rx] = Math.floor(rimCY - yf);
        botEdge[xi + rx] = Math.floor(rimCY + yf);
    }

    // Net sway animation
    const netH = 7;
    let sway = 0;
    let netStretch = 0;
    if (netSwayTimer > 0) {
        const t = netSwayTimer / netSwayMax;
        // Sway starts strong, fades out with a sine bounce
        sway = Math.sin(netSwayTimer * 0.5) * t * 3;
        // Net stretches down then bounces back
        netStretch = Math.sin(t * Math.PI) * 4;
    }

    // Back net
    for (let xi = -rx + 2; xi < rx - 1; xi++) {
        const topY = topEdge[xi + rx];
        for (let ny = 1; ny < netH + Math.floor(netStretch); ny++) {
            const narrow = Math.floor(ny * 0.3);
            if (Math.abs(xi) <= rx - 1 - narrow) {
                // Sway offset increases toward bottom of net
                const swayOffset = Math.floor(sway * (ny / netH));
                if ((xi + ny) % 2 === 0) {
                    px(rimCX + xi + swayOffset, topY + ny, '#d0d0d0');
                }
            }
        }
    }

    // Back edge
    for (let xi = -rx; xi <= rx; xi++) {
        const y = topEdge[xi + rx];
        px(rimCX + xi, y, '#ff5722');
        px(rimCX + xi, y - 1, '#ff6b35');
    }

    // Front edge
    for (let xi = -rx; xi <= rx; xi++) {
        const y = botEdge[xi + rx];
        px(rimCX + xi, y, '#ff5722');
        px(rimCX + xi, y + 1, '#cc4400');
        px(rimCX + xi, y + 2, '#aa3800');
    }

    // Left cap
    for (let yi = topEdge[0]; yi <= botEdge[0]; yi++) {
        px(rimCX - rx, yi, '#ff5722');
        px(rimCX - rx - 1, yi, '#cc4400');
    }
    // Right cap
    for (let yi = topEdge[rx * 2]; yi <= botEdge[rx * 2]; yi++) {
        px(rimCX + rx, yi, '#ff5722');
        px(rimCX + rx + 1, yi, '#cc4400');
    }

    // Front net
    const frontNetH = netH + Math.floor(netStretch);
    for (let xi = -rx + 2; xi < rx - 1; xi++) {
        const botY = botEdge[xi + rx];
        for (let ny = 1; ny < frontNetH; ny++) {
            const narrow = Math.floor(ny * 0.35);
            if (Math.abs(xi) <= rx - 1 - narrow) {
                const swayOffset = Math.floor(sway * (ny / netH));
                if ((xi + ny) % 2 === 0) {
                    const c = ny < 4 ? '#ffffff' : (ny < 7 ? '#f0f0f0' : '#e0e0e0');
                    px(rimCX + xi + swayOffset, botY + ny + 1, c);
                }
            }
        }
    }

    // Net gather
    const gatherSway = Math.floor(sway);
    const gatherY = botEdge[rx] + frontNetH + 1;
    px(rimCX + gatherSway, gatherY, '#e0e0e0');
    px(rimCX - 1 + gatherSway, gatherY, '#d0d0d0');
    px(rimCX + 1 + gatherSway, gatherY, '#d0d0d0');
    px(rimCX + gatherSway, gatherY + 1, '#cccccc');

    const rimCenterX = rimCX * p;
    const rimCenterY = rimCY * p;
    return { rimX: rimCenterX, rimY: rimCenterY };
}

// Draw half court (hoop on right, half court line on left, fills screen)
function drawCourt() {
    // Dark arena background
    ctx.fillStyle = '#0e0e1a';
    ctx.fillRect(0, 0, court.width, court.height);

    // === COURT DIMENSIONS (room for hoop + chairs) ===
    const courtTop = Math.floor(court.height * 0.12);
    const courtBottom = Math.floor(court.height * 0.88);
    const courtLeft = 80;
    const courtRight = court.width - 160;

    const courtMidY = Math.floor((courtTop + courtBottom) / 2);
    const courtH = courtBottom - courtTop;
    const courtW = courtRight - courtLeft;

    // === EVEN WOOD FLOOR ===
    ctx.fillStyle = '#c28a4e';
    ctx.fillRect(courtLeft, courtTop, courtW, courtH);

    // Even plank lines
    ctx.strokeStyle = '#b07a40';
    ctx.lineWidth = 1;
    const plankHeight = 12;
    for (let y = courtTop + plankHeight; y < courtBottom; y += plankHeight) {
        ctx.beginPath();
        ctx.moveTo(courtLeft, y);
        ctx.lineTo(courtRight, y);
        ctx.stroke();
    }

    // === COURT LINES (basketball markings) ===
    ctx.save();
    ctx.beginPath();
    ctx.rect(courtLeft, courtTop, courtW, courtH);
    ctx.clip();

    const lineColor = 'rgba(255, 255, 255, 0.45)';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;

    // Sidelines (top and bottom)
    ctx.beginPath();
    ctx.moveTo(courtLeft, courtTop);
    ctx.lineTo(courtRight, courtTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(courtLeft, courtBottom);
    ctx.lineTo(courtRight, courtBottom);
    ctx.stroke();

    // Baseline (right edge at courtRight)
    ctx.beginPath();
    ctx.moveTo(courtRight, courtTop);
    ctx.lineTo(courtRight, courtBottom);
    ctx.stroke();

    // Key/Paint rectangle (extends ~120px left from baseline, ~100px tall centered on courtMidY)
    const paintW = 120;
    const paintH = 100;
    const paintLeft = courtRight - paintW;
    const paintTop = courtMidY - paintH / 2;

    // Paint fill
    ctx.fillStyle = 'rgba(255, 107, 53, 0.08)';
    ctx.fillRect(paintLeft, paintTop, paintW, paintH);

    // Paint outline
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.rect(paintLeft, paintTop, paintW, paintH);
    ctx.stroke();

    // Free throw line (left edge of paint)
    ctx.beginPath();
    ctx.moveTo(paintLeft, paintTop);
    ctx.lineTo(paintLeft, paintTop + paintH);
    ctx.stroke();

    // Free throw circle (semicircle at free throw line, opening left)
    const ftRadius = 50;
    ctx.beginPath();
    ctx.arc(paintLeft, courtMidY, ftRadius, -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();

    // Three-point arc (semicircular, centered on hoop)
    const hoopCenterX = courtRight + 10;
    const threeRadius = 180;
    ctx.beginPath();
    ctx.arc(hoopCenterX, courtMidY, threeRadius, Math.PI / 2 + 0.3, -Math.PI / 2 - 0.3, true);
    ctx.stroke();

    // Three-point straight lines connecting arc to baseline
    const arcEndTopY = courtMidY - Math.sin(Math.PI / 2 + 0.3) * threeRadius;
    const arcEndTopX = hoopCenterX + Math.cos(Math.PI / 2 + 0.3) * threeRadius;
    const arcEndBotY = courtMidY + Math.sin(Math.PI / 2 + 0.3) * threeRadius;
    const arcEndBotX = hoopCenterX + Math.cos(-Math.PI / 2 - 0.3) * threeRadius;
    ctx.beginPath();
    ctx.moveTo(arcEndTopX, arcEndTopY);
    ctx.lineTo(courtRight, arcEndTopY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(arcEndBotX, arcEndBotY);
    ctx.lineTo(courtRight, arcEndBotY);
    ctx.stroke();

    ctx.restore(); // End court lines clip

    // === HALF COURT LOGO (on left edge, half in half out) ===
    const logoR = Math.floor(courtH * 0.32);

    // Clip to court area so logo is half in, half out
    ctx.save();
    ctx.beginPath();
    ctx.rect(courtLeft, courtTop, courtW, courtH);
    ctx.clip();

    // Outer ring
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(courtLeft, courtMidY, logoR, 0, Math.PI * 2);
    ctx.stroke();

    // Second ring
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(courtLeft, courtMidY, logoR - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    ctx.fillStyle = 'rgba(255, 107, 53, 0.06)';
    ctx.beginPath();
    ctx.arc(courtLeft, courtMidY, logoR - 13, 0, Math.PI * 2);
    ctx.fill();

    // Inner accent ring
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(courtLeft, courtMidY, logoR * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // "HOOP" curved text (top)
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textR = logoR * 0.7;
    const hoopText = 'H O O P';
    for (let i = 0; i < hoopText.length; i++) {
        const angle = -Math.PI/2 - 0.45 + (i / (hoopText.length - 1)) * 0.9;
        const tx = courtLeft + Math.cos(angle) * textR;
        const ty = courtMidY + Math.sin(angle) * textR;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle + Math.PI/2);
        ctx.fillText(hoopText[i], 0, 0);
        ctx.restore();
    }

    // "WORLD" curved text (bottom)
    ctx.font = 'bold 11px Arial';
    const worldText = 'W O R L D';
    for (let i = 0; i < worldText.length; i++) {
        const angle = Math.PI/2 + 0.5 - (i / (worldText.length - 1)) * 1.0;
        const tx = courtLeft + Math.cos(angle) * textR;
        const ty = courtMidY + Math.sin(angle) * textR;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle - Math.PI/2);
        ctx.fillText(worldText[i], 0, 0);
        ctx.restore();
    }

    // Center basketball icon
    const iconR = 14;
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(courtLeft, courtMidY, iconR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b3500';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(courtLeft - iconR, courtMidY);
    ctx.lineTo(courtLeft + iconR, courtMidY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(courtLeft, courtMidY - iconR);
    ctx.lineTo(courtLeft, courtMidY + iconR);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(courtLeft - iconR * 0.35, courtMidY, iconR * 0.65, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(courtLeft + iconR * 0.35, courtMidY, iconR * 0.65, Math.PI/2, -Math.PI/2);
    ctx.stroke();

    ctx.restore(); // End logo clip


}

// Draw hoop separately so it can be layered on top of players
function drawHoopOverlay() {
    const courtRight = court.width - 160;
    const courtMidY = Math.floor((court.height * 0.12 + court.height * 0.88) / 2);

    const rightHoop = drawHoop3D(courtRight + 10, courtMidY, 1);

    // Save rim position for game logic
    court.hoopScreenX = rightHoop.rimX;
    court.hoopScreenY = rightHoop.rimY;
}

// Draw ball with 3D perspective
// Draw pixel art basketball
function drawPixelBall(cx, cy, r) {
    const P = 2; // pixel size
    const ballColor = '#ff7518';
    const ballDark = '#cc5500';
    const lineColor = '#5a2000';

    // Draw filled pixel circle
    for (let py = -r; py <= r; py += P) {
        for (let px = -r; px <= r; px += P) {
            const dist = Math.sqrt(px * px + py * py);
            if (dist <= r) {
                // Shading: lighter top-left, darker bottom-right
                let color = ballColor;
                if (dist > r * 0.8) color = ballDark;
                else if (px < -r * 0.3 && py < -r * 0.3) color = '#ff8a30';

                ctx.fillStyle = color;
                ctx.fillRect(Math.floor((cx + px) / P) * P, Math.floor((cy + py) / P) * P, P, P);
            }
        }
    }

    // Pixel ball lines
    ctx.fillStyle = lineColor;

    // Horizontal line
    for (let px = -r; px <= r; px += P) {
        if (Math.sqrt(px * px) <= r) {
            ctx.fillRect(Math.floor((cx + px) / P) * P, Math.floor(cy / P) * P, P, P);
        }
    }

    // Vertical line
    for (let py = -r; py <= r; py += P) {
        if (Math.sqrt(py * py) <= r) {
            ctx.fillRect(Math.floor(cx / P) * P, Math.floor((cy + py) / P) * P, P, P);
        }
    }

    // Left curve
    for (let py = -r + P; py <= r - P; py += P) {
        const curveX = Math.round(-r * 0.35 + Math.sqrt(Math.max(0, (r * 0.65) * (r * 0.65) - py * py)) * -0.3);
        ctx.fillRect(Math.floor((cx + curveX) / P) * P, Math.floor((cy + py) / P) * P, P, P);
    }

    // Right curve
    for (let py = -r + P; py <= r - P; py += P) {
        const curveX = Math.round(r * 0.35 - Math.sqrt(Math.max(0, (r * 0.65) * (r * 0.65) - py * py)) * -0.3);
        ctx.fillRect(Math.floor((cx + curveX) / P) * P, Math.floor((cy + py) / P) * P, P, P);
    }
}

function drawBall() {
    if (ball.holder) return;

    const elevation = Math.max(0, ball.z || 0);
    const p = 5;

    const screen = toScreen(ball.x, ball.y, elevation);
    const sx = screen.x;
    const sy = screen.y;

    // Shadow
    const shadowScreen = toScreen(ball.x, ball.y, 0);
    const shadowScale = Math.max(0.1, 1 - elevation / 200);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(shadowScreen.x, shadowScreen.y + 4, 8 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    drawBasketball(sx, sy, 8);
}

// Draw HUD
function drawHUD() {
    const playerColor = (seasonState.active && seasonState.myTeam !== null) ? collegeTeams[seasonState.myTeam].color1 : '#2196F3';
    const oppColor = (seasonState.active && seasonState.phase === 'regular' && seasonState.currentGame < seasonState.schedule.length)
        ? collegeTeams[seasonState.schedule[seasonState.currentGame].opponent].color1
        : (seasonState.active && seasonState.phase === 'marchMadness' && seasonState.bracket)
            ? (() => { const r = seasonState.bracket[seasonState.bracket.length - 1]; const g = r.find(m => m.team1 === seasonState.myTeam || m.team2 === seasonState.myTeam); return g ? collegeTeams[g.team1 === seasonState.myTeam ? g.team2 : g.team1].color1 : '#f44336'; })()
            : '#f44336';

    // Score background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(court.centerX - 120, 5, 240, 40);

    // Scores
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Player score
    ctx.fillStyle = playerColor;
    ctx.fillText(game.score.player, court.centerX - 60, 25);

    // Separator
    ctx.fillStyle = '#fff';
    ctx.fillText('-', court.centerX, 25);

    // Opponent score
    ctx.fillStyle = oppColor;
    ctx.fillText(game.score.opponent, court.centerX + 60, 25);

    // Possession indicator
    ctx.font = '14px Arial';
    ctx.fillStyle = game.possession === 'player' ? playerColor : oppColor;
    ctx.fillText(game.possession === 'player' ? 'YOUR BALL' : 'CPU BALL', court.centerX, 55);
}

// Update shot clock
function updateShotClock() {
    if (playerData.shotClockSetting === 0) return; // Shot clock OFF
    const now = Date.now();
    if (now - game.lastShotClockUpdate >= 1000) {
        game.shotClock--;
        game.lastShotClockUpdate = now;

        if (game.shotClock <= 0) {
            // Shot clock violation - turnover
            game.possession = game.possession === 'player' ? 'opponent' : 'player';
            resetAfterScore(game.possession);
        }
    }
}

// Update game timer
function updateGameTime() {
    if (practiceMode) return; // No timer in practice mode

    const now = Date.now();
    if (now - game.lastTimeUpdate >= 1000) {
        game.gameTime--;
        game.lastTimeUpdate = now;

        if (game.gameTime <= 0) {
            endGame();
        }
    }
}

// End the game
function endGame() {
    game.gameOver = true;
    gameRunning = false;

    // Update player stats
    playerData.gamesPlayed++;
    playerData.totalPoints += game.score.player;

    if (game.score.player > game.score.opponent) {
        playerData.wins++;
    }

    savePlayerData();

    if (seasonState.active) {
        const won = game.score.player > game.score.opponent;
        const myScore = game.score.player;
        const oppScore = game.score.opponent;

        if (seasonState.phase === 'regular') {
            recordSeasonGameResult(won, myScore, oppScore);
            simOtherTeamGames();
            saveSeasonState();

            setTimeout(() => {
                const result = won ? 'WIN' : 'LOSS';
                alert(`${result}!\n\nFinal Score: ${myScore} - ${oppScore}\n\nRecord: ${seasonState.record.wins}-${seasonState.record.losses}`);
                if (seasonState.currentGame >= seasonState.schedule.length) {
                    startMarchMadness();
                } else {
                    showSeasonHub();
                }
            }, 100);
        } else if (seasonState.phase === 'marchMadness') {
            recordBracketGameResult(won, myScore, oppScore);
            saveSeasonState();

            setTimeout(() => {
                const result = won ? 'WIN' : 'LOSS';
                alert(`${result}!\n\nFinal Score: ${myScore} - ${oppScore}`);
                if (!won) {
                    alert('Your March Madness run is over! Better luck next year.');
                    seasonState.active = false;
                    saveSeasonState();
                    showSlotScreen();
                } else if (seasonState.bracketRound >= 6) {
                    seasonState.phase = 'champion';
                    saveSeasonState();
                    showChampionScreen();
                } else {
                    showBracketScreen();
                }
            }, 100);
        }
    } else {
        setTimeout(() => {
            const result = game.score.player > game.score.opponent ? 'YOU WIN!' :
                           game.score.player < game.score.opponent ? 'YOU LOSE!' : 'TIE GAME!';
            alert(`Game Over!\n\n${result}\n\nFinal Score: ${game.score.player} - ${game.score.opponent}`);
            showScreen('menu');
            updateMenuDisplay();
        }, 100);
    }
}

// Draw game timer
function drawTimer() {
    const minutes = Math.floor(game.gameTime / 60);
    const seconds = game.gameTime % 60;
    const timeStr = practiceMode ? 'PRACTICE' : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(court.centerX - 40, 45, 80, 25);

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = game.gameTime <= 10 ? '#f44336' : '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, court.centerX, 62);
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    try {
    // Clear
    ctx.clearRect(0, 0, court.width, court.height);

    // Draw court
    drawCourt();

    // Handle input
    handleInput();

    // Update AI
    updateAI();

    // Update all players
    for (const p of [...playerTeam, ...opponentTeam]) {
        p.update();
    }

    // Update ball
    updateBall();

    // Charge detection
    if (ball.holder && !ball.shooting) {
        const carrier = ball.holder;
        const carrierSpeed = Math.abs(carrier.vx) + Math.abs(carrier.vy);
        if (carrierSpeed > 4) {
            const defenders = carrier.team === 'player' ? opponentTeam : playerTeam;
            for (const def of defenders) {
                if (def.stationaryFrames >= 15 && Math.hypot(carrier.x - def.x, carrier.y - def.y) < 25) {
                    // Charge! Turnover
                    chargeNotification.text = 'CHARGE!';
                    chargeNotification.timer = 60;
                    const newPossession = carrier.team === 'player' ? 'opponent' : 'player';
                    resetAfterScore(newPossession);
                    break;
                }
            }
        }
    }

    // Decrement charge notification timer
    if (chargeNotification.timer > 0) chargeNotification.timer--;

    // Update shot clock
    if (ball.holder && !ball.shooting) {
        updateShotClock();
    }

    // Update game time
    updateGameTime();

    // Draw players (sorted by Y for depth)
    const allPlayers = [...playerTeam, ...opponentTeam].sort((a, b) => a.y - b.y);
    for (const p of allPlayers) {
        p.draw();
    }

    // Draw hoop on top of players
    drawHoopOverlay();

    // Draw ball
    drawBall();

    // Draw charge notification
    if (chargeNotification.timer > 0) {
        const alpha = Math.min(1, chargeNotification.timer / 30);
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(chargeNotification.text, court.centerX, court.centerY);
        ctx.textAlign = 'left';
    }

    } catch (error) {
        const errorBox = document.getElementById('errorBox');
        if (errorBox) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = `<p><strong>Game Error:</strong> ${error.message}<br><small>${error.stack}</small></p>`;
        }
    }

    requestAnimationFrame(gameLoop);
}

function setupTutorialStep(step) {
    // No-op — free practice has no steps
}

function advanceTutorialStep() {
    // No-op — free practice has no steps
}

function drawTutorialOverlay() {
    // No-op — no tutorial UI
}

function startTutorial() {
    practiceMode = true;
    gameRunning = true;
    tutorialStep = 0;
    tutorialScore = 0;
    tutorialSubState = 'active';
    tutorialTimer = 0;
    tutorialResetTimer = 0;
    shootingBarActive = false;
    shootingBarValue = 0;
    tutorialRebounder = null;

    // Reset game state
    game.score.player = 0;
    game.score.opponent = 0;
    game.gameOver = false;

    // Randomize player[0] appearance
    const p0 = playerTeam[0];
    p0.skinColor = skinTones[Math.floor(Math.random() * skinTones.length)];
    p0.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    p0.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    p0.jerseyNumber = Math.floor(Math.random() * 99) + 1;
    p0.height = 0.9 + Math.random() * 0.2;

    // Place player[0] at mid-court with ball
    const midY = court.height * 0.6;
    p0.x = court.centerX - 150;
    p0.y = midY;
    p0.isControlled = true;
    p0.hasBall = true;
    p0.stamina = 100;
    p0.vx = 0;
    p0.vy = 0;

    // Hide all other players off-screen
    for (let i = 1; i < playerTeam.length; i++) {
        playerTeam[i].x = -500;
        playerTeam[i].y = -500;
        playerTeam[i].isControlled = false;
        playerTeam[i].hasBall = false;
        playerTeam[i].vx = 0;
        playerTeam[i].vy = 0;
    }
    for (const opp of opponentTeam) {
        opp.x = -500;
        opp.y = -500;
        opp.hasBall = false;
        opp.vx = 0;
        opp.vy = 0;
    }

    // Give ball to player
    ball.holder = p0;
    ball.x = p0.x + 20;
    ball.y = p0.y;
    ball.z = 0;
    ball.vx = 0;
    ball.vy = 0;
    ball.shooting = false;
    ball.swishing = false;
    game.possession = 'player';

    tutorialLoop();
}

// Draw shooting bar with distance-based green zone
function drawShootingBar(x, y, greenSize) {
    greenSize = greenSize || 0.20;
    const barWidth = 120;
    const barHeight = 15;
    const greenStart = 1 - greenSize - 0.15;
    const yellowStart = 0.3;

    // Bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth/2, y, barWidth, barHeight);

    // Red zone (left)
    ctx.fillStyle = '#f44336';
    ctx.fillRect(x - barWidth/2, y, barWidth * yellowStart, barHeight);

    // Yellow zone (middle)
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(x - barWidth/2 + barWidth * yellowStart, y, barWidth * (greenStart - yellowStart), barHeight);

    // Green zone (sweet spot - shrinks with distance)
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x - barWidth/2 + barWidth * greenStart, y, barWidth * greenSize, barHeight);

    // Red zone (far right)
    ctx.fillStyle = '#f44336';
    ctx.fillRect(x - barWidth/2 + barWidth * (greenStart + greenSize), y, barWidth * 0.15, barHeight);

    // Moving indicator
    const indicatorX = x - barWidth/2 + (shootingBarValue / 100) * barWidth;
    ctx.fillStyle = '#fff';
    ctx.fillRect(indicatorX - 3, y - 3, 6, barHeight + 6);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(indicatorX - 3, y - 3, 6, barHeight + 6);

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - barWidth/2, y, barWidth, barHeight);
}

// Draw a realistic basketball at given position
function drawBasketball(cx, cy, r) {
    ctx.save();

    // Clip to ball circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Base color
    ctx.fillStyle = '#e87318';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Gradient shading for 3D look
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ff9944');
    grad.addColorStop(0.5, '#ee7518');
    grad.addColorStop(1, '#aa4400');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Seam lines (dark brown)
    ctx.strokeStyle = '#3a1500';
    ctx.lineWidth = 1.2;

    // Horizontal seam
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();

    // Vertical seam
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // Left curved seam (bows left)
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.15, cy - r);
    ctx.bezierCurveTo(
        cx - r * 0.9, cy - r * 0.4,
        cx - r * 0.9, cy + r * 0.4,
        cx - r * 0.15, cy + r
    );
    ctx.stroke();

    // Right curved seam (bows right)
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.15, cy - r);
    ctx.bezierCurveTo(
        cx + r * 0.9, cy - r * 0.4,
        cx + r * 0.9, cy + r * 0.4,
        cx + r * 0.15, cy + r
    );
    ctx.stroke();

    ctx.restore();

    // Outline
    ctx.strokeStyle = '#5a2000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
}

// Draw dribbling ball with 3D perspective
function drawDribblingBall(player) {
    const jumpOffset = player.jumpZ || 0;
    const bounceHeight = Math.abs(Math.sin(dribblePhase)) * 18;
    const p = 5;

    // Get screen position (next to player's hand)
    const screen = toScreen(player.x + player.facingDir * 22, player.y + 8, bounceHeight);
    const sx = screen.x;
    const sy = screen.y - jumpOffset;

    // Shadow
    const shadowScreen = toScreen(player.x + player.facingDir * 22, player.y + 8, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(shadowScreen.x, shadowScreen.y + 4, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    drawBasketball(sx, sy, 8);
}

// Tutorial game loop — one player, one hoop, pure shooting practice
function tutorialLoop() {
    if (!gameRunning) return;

    try {
    // Clear
    ctx.clearRect(0, 0, court.width, court.height);

    // Draw court
    drawCourt();

    const controlled = playerTeam[0];

    // === Input: move, sprint, shoot ===
    if (controlled) {
        // Movement + sprint
        const speed = (keys['KeyC'] && controlled.stamina > 0) ? controlled.sprintSpeed : controlled.speed;
        controlled.sprinting = keys['KeyC'] && controlled.stamina > 0;

        if (controlled.sprinting) {
            controlled.stamina = Math.max(0, controlled.stamina - 0.8);
        }

        // Ball handling speed penalty
        let moveSpeed = speed;
        if (controlled.hasBall) {
            const bh = (controlled.attrs && controlled.attrs.ballHandling) || 50;
            const penalty = 1 - (0.15 * (1 - (bh - 25) / 74));
            moveSpeed *= penalty;
        }

        if (!shootingBarActive) {
            if (keys['ArrowUp'] || keys['KeyW']) controlled.vy = -moveSpeed;
            if (keys['ArrowDown'] || keys['KeyS']) controlled.vy = moveSpeed;
            if (keys['ArrowLeft'] || keys['KeyA']) controlled.vx = -moveSpeed;
            if (keys['ArrowRight'] || keys['KeyD']) controlled.vx = moveSpeed;
        }

        // Shooting (with shooting bar)
        if (controlled.hasBall || shootingBarActive) {
            const distToHoop = Math.hypot(court.hoop.x - controlled.x, court.hoop.y - controlled.y);
            const isThreeRange = distToHoop > (court.threePointRadius || 200);
            const shotAttr = controlled.attrs ? (isThreeRange ? controlled.attrs.threePoint : (distToHoop < 80 ? controlled.attrs.finishing : controlled.attrs.midRange)) : 50;
            const attrBonus = Math.max(0, (shotAttr - 50) / 600);
            const greenSize = Math.max(0.08, 0.25 - distToHoop / 2000 + attrBonus);
            const barSpeed = 2 + distToHoop / 150;

            if (keys['KeyZ'] && controlled.hasBall && !ball.shooting && !shootingBarActive) {
                shootingBarActive = true;
                shootingBarValue = 0;
                shootingBarDirection = 1;
                shootingBarSpeed = barSpeed;
            }

            if (!keys['KeyZ'] && shootingBarActive) {
                shootingBarActive = false;
                const greenStart = 1 - greenSize - 0.15;
                const greenEnd = greenStart + greenSize;
                const barPos = shootingBarValue / 100;

                let accuracy;
                if (barPos >= greenStart && barPos < greenEnd) {
                    accuracy = 1.0;
                } else if (barPos >= 0.3 && barPos < greenStart) {
                    accuracy = 0.5;
                } else {
                    accuracy = 0.15;
                }

                controlled.hasBall = false;
                ball.holder = null;
                ball.shooting = true;
                ball.willScore = Math.random() < accuracy;
                tutorialResetTimer = 0;

                const rimX = court.hoopScreenX || court.hoop.x;
                const rimY = court.hoopScreenY || court.hoop.y;
                const dx = rimX - ball.x;
                const dy = rimY - ball.y;
                const dist = Math.hypot(dx, dy);
                const time = Math.max(30, dist / 8);

                ball.vx = dx / time;
                ball.vy = dy / time;
                ball.vz = 12 + dist / 40;
                ball.z = 0;

                if (!ball.willScore) {
                    ball.vx += (Math.random() - 0.5) * 3;
                    ball.vy += (Math.random() - 0.5) * 3;
                }
            }
        }
    }

    // Update shooting bar
    if (shootingBarActive) {
        shootingBarValue += shootingBarSpeed * shootingBarDirection;
        if (shootingBarValue >= 100 || shootingBarValue <= 0) {
            shootingBarDirection *= -1;
        }
    }

    // === Update player ===
    controlled.update();

    // === Update ball ===
    if (ball.holder) {
        ball.x = ball.holder.x + 20;
        ball.y = ball.holder.y;
        ball.z = 0;
    } else {
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.shooting) {
            ball.z += ball.vz;
            ball.vz -= 0.4;

            const rimX = court.hoopScreenX || court.hoop.x;
            const rimY = court.hoopScreenY || court.hoop.y;
            const distToRim = Math.hypot(ball.x - rimX, ball.y - rimY);

            if (distToRim < 40 && ball.vz < 0) {
                if (ball.willScore) {
                    game.score.player += 2;
                    ball.shooting = false;
                    ball.x = rimX;
                    ball.y = rimY;
                    ball.z = 30;
                    ball.vx = 0;
                    ball.vy = 0;
                    ball.vz = -2;
                    ball.swishing = true;
                    ball.swishTimer = 25;
                    netSwayTimer = netSwayMax;
                } else {
                    ball.shooting = false;
                    ball.z = 20;
                    ball.vx = -4 - Math.random() * 2;
                    ball.vy = (Math.random() - 0.5) * 4;
                    ball.vz = 3 + Math.random() * 2;
                }
            }

            if (ball.z < 0) {
                ball.shooting = false;
                ball.z = 0;
            }
        }

        if (ball.swishing) {
            ball.swishTimer--;
            ball.z = Math.max(0, ball.z + ball.vz);
            ball.vz -= 0.15;
            if (ball.swishTimer <= 0) {
                ball.swishing = false;
                ball.z = 0;
                ball.vx = -3 - Math.random() * 2;
                ball.vy = (Math.random() - 0.5) * 2;
                ball.vz = 0;
            }
        }

        if (netSwayTimer > 0) {
            netSwayTimer--;
        }

        if (ball.z > 0 && !ball.swishing) {
            ball.vz -= 0.3;
            ball.z += ball.vz;
            if (ball.z < 0) {
                ball.z = 0;
                ball.vz = 0;
            }
        }

        // Auto-rebound: ball on ground, not shooting/swishing → snap back to player after delay
        if (!ball.shooting && !ball.swishing && ball.z === 0) {
            tutorialResetTimer++;
            if (tutorialResetTimer >= 30) {
                controlled.hasBall = true;
                ball.holder = controlled;
                ball.vx = 0;
                ball.vy = 0;
                ball.z = 0;
                game.possession = 'player';
                tutorialResetTimer = 0;
            }
        }

        ball.vx *= 0.98;
        ball.vy *= 0.98;

        // Keep ball in bounds
        const minX = 100;
        const maxX = court.width - 100;
        const minY = court.height * 0.40;
        const maxY = court.height * 0.85;
        if (ball.x < minX || ball.x > maxX) ball.vx *= -0.8;
        if (ball.y < minY || ball.y > maxY) ball.vy *= -0.8;
        ball.x = Math.max(minX, Math.min(maxX, ball.x));
        ball.y = Math.max(minY, Math.min(maxY, ball.y));
    }

    // === Draw player ===
    controlled.draw();

    // Ball depth: draw ball BEHIND hoop when arcing high over it
    const ballBehindHoop = !ball.holder && ball.z > 40;

    // Draw ball behind hoop if it's arcing over
    if (ballBehindHoop) {
        drawBall();
    }

    // Draw hoop on top of player (and behind-ball if applicable)
    drawHoopOverlay();

    // Draw ball in front of hoop (normal case)
    if (!ballBehindHoop) {
        const ballHolder = ball.holder;
        if (ballHolder) {
            if (shootingBarActive && ballHolder === controlled) {
                const screen = toScreen(ballHolder.x, ballHolder.y, 70);
                const scale = screen.scale;
                const ballRadius = 12 * scale;

                ctx.fillStyle = '#ff8c00';
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, ballRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#8b4513';
                ctx.lineWidth = 2 * scale;
                ctx.beginPath();
                ctx.moveTo(screen.x - ballRadius, screen.y);
                ctx.lineTo(screen.x + ballRadius, screen.y);
                ctx.moveTo(screen.x, screen.y - ballRadius);
                ctx.lineTo(screen.x, screen.y + ballRadius);
                ctx.stroke();
            } else {
                drawDribblingBall(ballHolder);
            }
        } else if (!ball.holder) {
            drawBall();
        }
    }

    // Draw shooting bar if active
    if (shootingBarActive && controlled) {
        const screen = toScreen(controlled.x, controlled.y, 90);
        const distToHoop = Math.hypot(court.hoop.x - controlled.x, court.hoop.y - controlled.y);
        const greenSize = Math.max(0.08, 0.25 - distToHoop / 2000);
        drawShootingBar(screen.x, screen.y, greenSize);
    }

    } catch (error) {
        console.error('Tutorial error:', error);
        const errorBox = document.getElementById('errorBox');
        if (errorBox) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = `<p><strong>Tutorial Error:</strong> ${error.message}<br><small>${error.stack}</small></p>`;
        }
    }

    requestAnimationFrame(tutorialLoop);
}

// Start/restart game
function startGame(isPractice) {
    practiceMode = isPractice;
    gameRunning = true;

    // Reset game state
    game.score.player = 0;
    game.score.opponent = 0;
    game.gameTime = playerData.gameLength || 120;
    game.lastTimeUpdate = Date.now();
    game.gameOver = false;
    game.shotClock = playerData.shotClockSetting !== undefined ? playerData.shotClockSetting : 24;

    // Reset player positions (side view: x = left-right, y = depth)
    const midY = court.height * 0.6; // Middle depth

    playerTeam[0].x = court.centerX - 150;
    playerTeam[0].y = midY;
    playerTeam[0].isControlled = true;

    playerTeam[1].x = court.centerX - 250;
    playerTeam[1].y = midY - 80;
    playerTeam[1].isControlled = false;

    playerTeam[2].x = court.centerX - 250;
    playerTeam[2].y = midY + 80;
    playerTeam[2].isControlled = false;

    playerTeam[3].x = 200;
    playerTeam[3].y = midY - 60;
    playerTeam[3].isControlled = false;

    playerTeam[4].x = 200;
    playerTeam[4].y = midY + 60;
    playerTeam[4].isControlled = false;

    opponentTeam[0].x = court.centerX + 150;
    opponentTeam[0].y = midY;

    opponentTeam[1].x = court.centerX + 250;
    opponentTeam[1].y = midY - 80;

    opponentTeam[2].x = court.centerX + 250;
    opponentTeam[2].y = midY + 80;

    opponentTeam[3].x = court.width - 200;
    opponentTeam[3].y = midY - 60;

    opponentTeam[4].x = court.width - 200;
    opponentTeam[4].y = midY + 60;

    // Reset jersey colors for non-season games
    if (!seasonState.active) {
        for (const p of playerTeam) {
            p.jerseyColor = null;
            p.jerseyColor2 = null;
            p.shortsColor = null;
        }
        for (const p of opponentTeam) {
            p.jerseyColor = null;
            p.jerseyColor2 = null;
            p.shortsColor = null;
        }
    }

    // Clear ball possession
    for (const p of [...playerTeam, ...opponentTeam]) {
        p.hasBall = false;
    }

    // Give ball to player
    resetAfterScore('player');

    // Start the loop
    gameLoop();
}

// ========================================
// SEASON MODE LOGIC
// ========================================

// ========================================
// SLOT SELECTION
// ========================================
// ========================================
// MODE PICKER
// ========================================
function showModePicker() {
    showScreen('modePicker');
}

document.getElementById('modeCollege').querySelector('.btn').addEventListener('click', () => {
    showScreen('careerIntro');
});

document.getElementById('careerIntroContinueBtn').addEventListener('click', () => {
    showScreen('createPlayer');
});

// Create Player screen
const heightOptions = [
    { label: '5\'8"', value: 0.80 },
    { label: '5\'9"', value: 0.83 },
    { label: '5\'10"', value: 0.85 },
    { label: '5\'11"', value: 0.88 },
    { label: '6\'0"', value: 0.92 },
    { label: '6\'2"', value: 0.97 },
    { label: '6\'3"', value: 1.0 },
    { label: '6\'5"', value: 1.05 },
    { label: '6\'7"', value: 1.1 },
    { label: '6\'9"', value: 1.15 },
    { label: '6\'11"', value: 1.2 }
];

let careerPlayer = {
    firstName: '', lastName: '', number: 1, hometown: '',
    position: 'PG',
    primaryArchetype: null, secondaryArchetype: null,
    height: 1.0, heightLabel: "6'3\"", weight: 200,
    skinColor: '#c68642', hairColor: '#1a1a1a',
    hairStyle: 'fade', eyebrowStyle: 'normal',
    attributes: { ...BASE_ATTRIBUTES }
};

// === ARROW PICKER BUILDER ===
const arrowPickers = {};
function buildArrowPicker(containerId, options, onChange, renderFn) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = '';
    let idx = 0;

    const leftBtn = document.createElement('button');
    leftBtn.className = 'arrow-picker-left';
    leftBtn.innerHTML = '&#9664;';

    const display = document.createElement('div');
    display.className = 'arrow-picker-display';

    const rightBtn = document.createElement('button');
    rightBtn.className = 'arrow-picker-right';
    rightBtn.innerHTML = '&#9654;';

    container.appendChild(leftBtn);
    container.appendChild(display);
    container.appendChild(rightBtn);

    function render() {
        display.innerHTML = '';
        if (options.length === 0) {
            display.innerHTML = '<span class="arrow-picker-none">None</span>';
            return;
        }
        const opt = options[idx];
        if (renderFn) {
            renderFn(display, opt, idx);
        } else {
            display.innerHTML = `<span class="arrow-picker-label">${opt.label}</span>`;
        }
    }

    leftBtn.addEventListener('click', () => {
        if (options.length === 0) return;
        idx = (idx - 1 + options.length) % options.length;
        render();
        if (onChange) onChange(options[idx], idx);
    });

    rightBtn.addEventListener('click', () => {
        if (options.length === 0) return;
        idx = (idx + 1) % options.length;
        render();
        if (onChange) onChange(options[idx], idx);
    });

    render();
    const picker = {
        setIndex(i) { idx = i; render(); },
        getIndex() { return idx; },
        getCurrent() { return options[idx]; },
        setOptions(newOpts) { options = newOpts; idx = 0; render(); }
    };
    arrowPickers[containerId] = picker;
    return picker;
}

// Expanded hair styles
const allHairStyles = [
    { key: 'buzz', label: 'Style 1 - Buzz Cut' },
    { key: 'crewcut', label: 'Style 2 - Crew Cut' },
    { key: 'fade', label: 'Style 3 - Fade' },
    { key: 'taper', label: 'Style 4 - Taper Fade' },
    { key: 'midFade', label: 'Style 5 - Mid Fade' },
    { key: 'flat', label: 'Style 6 - Flat Top' },
    { key: 'afro', label: 'Style 7 - Afro' },
    { key: 'miniAfro', label: 'Style 8 - Mini Afro' },
    { key: 'curly', label: 'Style 9 - Curly' },
    { key: 'curlytop', label: 'Style 10 - Curly Top' },
    { key: 'wavytop', label: 'Style 11 - Wavy Top' },
    { key: 'messytop', label: 'Style 12 - Messy Top' },
    { key: 'spiky', label: 'Style 13 - Spiky' },
    { key: 'fauxhawk', label: 'Style 14 - Faux Hawk' },
    { key: 'mohawk', label: 'Style 15 - Mohawk' },
    { key: 'dreads', label: 'Style 16 - Dreads' },
    { key: 'shortdreads', label: 'Style 17 - Short Dreads' },
    { key: 'cornrows', label: 'Style 18 - Cornrows' },
    { key: 'braids', label: 'Style 19 - Braids' },
    { key: 'twists', label: 'Style 20 - Twists' },
    { key: 'long', label: 'Style 21 - Long' },
    { key: 'longtied', label: 'Style 22 - Long Tied' },
    { key: 'manbun', label: 'Style 23 - Man Bun' },
    { key: 'ponytail', label: 'Style 24 - Ponytail' },
    { key: 'slickback', label: 'Style 25 - Slick Back' },
    { key: 'combover', label: 'Style 26 - Comb Over' },
    { key: 'sidepart', label: 'Style 27 - Side Part' },
    { key: 'curtains', label: 'Style 28 - Curtains' },
    { key: 'bowlcut', label: 'Style 29 - Bowl Cut' },
    { key: 'mullet', label: 'Style 30 - Mullet' },
    { key: 'hightop', label: 'Style 31 - High Top' },
    { key: 'frohawk', label: 'Style 32 - Frohawk' },
    { key: 'bald', label: 'Style 33 - Bald' }
];

// Eyebrow styles
const eyebrowStyles = [
    { key: 'normal', label: 'Normal' },
    { key: 'thick', label: 'Thick' },
    { key: 'thin', label: 'Thin' },
    { key: 'high', label: 'High Arch' },
    { key: 'angry', label: 'Angry' },
    { key: 'none', label: 'None' }
];

// Skin color options with labels
const skinColorOptions = [
    { color: '#ffe0cc', label: 'Porcelain' },
    { color: '#fce4d4', label: 'Light' },
    { color: '#f5d0c5', label: 'Fair' },
    { color: '#f0d5b0', label: 'Ivory' },
    { color: '#f0c5a0', label: 'Peach' },
    { color: '#eabb88', label: 'Warm Beige' },
    { color: '#e0b090', label: 'Sand' },
    { color: '#dbb89a', label: 'Medium' },
    { color: '#d4a878', label: 'Honey' },
    { color: '#c8a07a', label: 'Olive' },
    { color: '#c68642', label: 'Tan' },
    { color: '#bc8040', label: 'Golden' },
    { color: '#b07030', label: 'Caramel' },
    { color: '#a46832', label: 'Bronze' },
    { color: '#9a6028', label: 'Toffee' },
    { color: '#8d5524', label: 'Brown' },
    { color: '#7a4825', label: 'Chestnut' },
    { color: '#6b4423', label: 'Dark Brown' },
    { color: '#5a3520', label: 'Cocoa' },
    { color: '#4a2d12', label: 'Dark' },
    { color: '#3c2415', label: 'Deep' },
    { color: '#2c1a0e', label: 'Espresso' }
];

// Hair color options with labels
const allHairColorOptions = [
    { color: '#0a0a0a', label: 'Jet Black' },
    { color: '#1a1a1a', label: 'Black' },
    { color: '#2c1810', label: 'Off Black' },
    { color: '#3d2314', label: 'Dark Brown' },
    { color: '#5c3a1e', label: 'Chestnut' },
    { color: '#8b4513', label: 'Brown' },
    { color: '#a0522d', label: 'Auburn' },
    { color: '#d4a574', label: 'Light Brown' },
    { color: '#c4a35a', label: 'Dirty Blonde' },
    { color: '#e8c872', label: 'Blonde' },
    { color: '#f5e6b8', label: 'Platinum' },
    { color: '#b22222', label: 'Red' },
    { color: '#cc4400', label: 'Ginger' },
    { color: '#d46a00', label: 'Copper' },
    { color: '#888888', label: 'Gray' },
    { color: '#c0c0c0', label: 'Silver' },
    { color: '#ffffff', label: 'White' },
    { color: '#2050cc', label: 'Blue' },
    { color: '#cc2060', label: 'Pink' },
    { color: '#8b30d4', label: 'Purple' }
];

// Color swatch render helper
function renderColorOption(display, opt) {
    display.innerHTML = `<div class="arrow-picker-swatch" style="background:${opt.color};"></div><span class="arrow-picker-label">${opt.label}</span>`;
}

// Archetype render helper
function renderArchOption(display, opt) {
    display.innerHTML = `<span class="arrow-picker-label">${opt.name}</span><span class="arrow-picker-sublabel">${opt.desc}</span>`;
}

// Build all arrow pickers
// Skin Color
buildArrowPicker('skinColorArrow', skinColorOptions, (opt) => {
    careerPlayer.skinColor = opt.color;
    drawPlayerPreview();
}, renderColorOption);
arrowPickers['skinColorArrow'].setIndex(10); // default Tan

// Hair Style
buildArrowPicker('hairStyleArrow', allHairStyles, (opt) => {
    careerPlayer.hairStyle = opt.key;
    drawPlayerPreview();
});

// Hair Color
buildArrowPicker('hairColorArrow', allHairColorOptions, (opt) => {
    careerPlayer.hairColor = opt.color;
    drawPlayerPreview();
}, renderColorOption);

// Eyebrows
buildArrowPicker('eyebrowArrow', eyebrowStyles, (opt) => {
    careerPlayer.eyebrowStyle = opt.key;
    drawPlayerPreview();
});

// Position
const positionOptions = [
    { key: 'PG', label: 'PG - Point Guard' },
    { key: 'SG', label: 'SG - Shooting Guard' },
    { key: 'SF', label: 'SF - Small Forward' },
    { key: 'PF', label: 'PF - Power Forward' },
    { key: 'C', label: 'C - Center' }
];
buildArrowPicker('positionArrow', positionOptions, (opt) => {
    careerPlayer.position = opt.key;
    updateAttributeDisplay();
});

// Height
const heightArrowOptions = heightOptions.map(h => ({ label: h.label, value: h.value }));
buildArrowPicker('heightArrow', heightArrowOptions, (opt) => {
    careerPlayer.height = opt.value;
    careerPlayer.heightLabel = opt.label;
    drawPlayerPreview();
    updateAttributeDisplay();
});
arrowPickers['heightArrow'].setIndex(6); // default 6'3"

// Weight
const weightArrowOptions = [];
for (let w = 150; w <= 280; w += 5) weightArrowOptions.push({ label: w + ' lbs', value: w });
buildArrowPicker('weightArrow', weightArrowOptions, (opt) => {
    careerPlayer.weight = opt.value;
    updateAttributeDisplay();
});
arrowPickers['weightArrow'].setIndex(10); // default 200 lbs

// State & City arrow pickers
const STATE_CITIES = {
    'Alabama': ['Birmingham', 'Huntsville', 'Montgomery', 'Mobile', 'Tuscaloosa'],
    'Alaska': ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka'],
    'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'],
    'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
    'California': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno'],
    'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'],
    'Connecticut': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
    'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Bear'],
    'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg'],
    'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah'],
    'Hawaii': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu'],
    'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Caldwell'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford'],
    'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
    'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
    'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka'],
    'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
    'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
    'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
    'Maryland': ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf'],
    'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor'],
    'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington'],
    'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
    'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'],
    'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena'],
    'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
    'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
    'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester'],
    'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton'],
    'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
    'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
    'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'],
    'Oregon': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie'],
    'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
    'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Greenville'],
    'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
    'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
    'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth'],
    'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
    'Vermont': ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
    'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Arlington'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
    'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
    'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'],
    'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
};

// State arrow picker
const stateNames = Object.keys(STATE_CITIES);
const stateOptions = [{ key: '', label: 'Select State' }, ...stateNames.map(s => ({ key: s, label: s }))];
let selectedState = '';
buildArrowPicker('stateArrow', stateOptions, (opt) => {
    selectedState = opt.key;
    const cityField = document.getElementById('cityField');
    const customInput = document.getElementById('customCityInput');
    customInput.style.display = 'none';
    customInput.value = '';
    if (!selectedState) {
        cityField.style.display = 'none';
        careerPlayer.hometown = '';
        return;
    }
    cityField.style.display = 'block';
    const cities = STATE_CITIES[selectedState] || [];
    const cityOpts = [...cities.map(c => ({ key: c, label: c })), { key: '__other__', label: 'Other' }];
    arrowPickers['cityArrow'].setOptions(cityOpts);
    careerPlayer.hometown = cities[0] + ', ' + selectedState;
});

// City arrow picker
buildArrowPicker('cityArrow', [{ key: '', label: 'Select state first' }], (opt) => {
    const customInput = document.getElementById('customCityInput');
    if (opt.key === '__other__') {
        customInput.style.display = 'block';
        customInput.focus();
        const customVal = customInput.value.trim();
        careerPlayer.hometown = customVal ? (customVal + ', ' + selectedState) : '';
    } else {
        customInput.style.display = 'none';
        customInput.value = '';
        careerPlayer.hometown = opt.key ? (opt.key + ', ' + selectedState) : '';
    }
});

// Custom city input
document.getElementById('customCityInput').addEventListener('input', function() {
    const city = this.value.trim();
    careerPlayer.hometown = city ? (city + ', ' + selectedState) : '';
});

// Archetype arrow pickers
const archetypeKeys = Object.keys(ARCHETYPES);
const archetypeOptions = archetypeKeys.map(k => ({ key: k, name: ARCHETYPES[k].name, desc: ARCHETYPES[k].desc }));

// Primary archetype - skip options used by secondary
function getPrimaryOptions() {
    return archetypeOptions.filter(o => o.key !== careerPlayer.secondaryArchetype);
}
function getSecondaryOptions() {
    return archetypeOptions.filter(o => o.key !== careerPlayer.primaryArchetype);
}

buildArrowPicker('primaryArchArrow', archetypeOptions, (opt) => {
    careerPlayer.primaryArchetype = opt.key;
    // Rebuild secondary to exclude this one
    const secPicker = arrowPickers['secondaryArchArrow'];
    const newOpts = getSecondaryOptions();
    const secIdx = newOpts.findIndex(o => o.key === careerPlayer.secondaryArchetype);
    secPicker.setOptions(newOpts);
    if (secIdx >= 0) secPicker.setIndex(secIdx);
    updateAttributeDisplay();
}, renderArchOption);

buildArrowPicker('secondaryArchArrow', archetypeOptions, (opt) => {
    careerPlayer.secondaryArchetype = opt.key;
    // Rebuild primary to exclude this one
    const priPicker = arrowPickers['primaryArchArrow'];
    const newOpts = getPrimaryOptions();
    const priIdx = newOpts.findIndex(o => o.key === careerPlayer.primaryArchetype);
    priPicker.setOptions(newOpts);
    if (priIdx >= 0) priPicker.setIndex(priIdx);
    updateAttributeDisplay();
}, renderArchOption);

function getAttrBarColor(val) {
    if (val >= 90) return '#4caf50';
    if (val >= 80) return '#8bc34a';
    if (val >= 65) return '#ffeb3b';
    if (val >= 50) return '#ff9800';
    return '#f44336';
}

function updateAttributeDisplay() {
    careerPlayer.attributes = calculateAttributes(careerPlayer.primaryArchetype, careerPlayer.secondaryArchetype);
    const container = document.getElementById('attributeDisplay');
    if (!container) return;
    container.innerHTML = '';
    for (const key in ATTRIBUTE_LABELS) {
        const val = careerPlayer.attributes[key];
        const row = document.createElement('div');
        row.className = 'attr-row';
        row.innerHTML = `
            <span class="attr-label">${ATTRIBUTE_LABELS[key]}</span>
            <div class="attr-bar-bg"><div class="attr-bar-fill" style="width:${val}%;background:${getAttrBarColor(val)};"></div></div>
            <span class="attr-value">${val}</span>
        `;
        container.appendChild(row);
    }
}

updateAttributeDisplay();

// Player preview drawing
function drawPlayerPreview() {
    const canvas = document.getElementById('playerPreviewCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const ht = canvas.height;
    ctx.clearRect(0, 0, w, ht);

    // Blue background
    ctx.fillStyle = '#1a3a8a';
    ctx.fillRect(0, 0, w, ht);

    const p = 5; // pixel size for preview
    const sx = w / 2;
    const sy = ht * 0.78;

    const skin = careerPlayer.skinColor;
    const darken = (hex) => {
        try {
            const r = parseInt(hex.slice(1,3),16);
            const g = parseInt(hex.slice(3,5),16);
            const b = parseInt(hex.slice(5,7),16);
            return '#' + [r,g,b].map(c => Math.max(0, Math.floor(c * 0.7)).toString(16).padStart(2,'0')).join('');
        } catch(e) { return '#444'; }
    };
    const skinDark = darken(skin);
    const jerseyColor = '#1d428a';
    const jerseyColor2 = '#ffc72c';
    const shortsColor = '#ffc72c';
    const shortsDark = darken(shortsColor);
    const jerseyDark = darken(jerseyColor);
    const jerseyLight = (() => {
        try {
            const r = parseInt(jerseyColor.slice(1,3),16);
            const g = parseInt(jerseyColor.slice(3,5),16);
            const b = parseInt(jerseyColor.slice(5,7),16);
            return '#' + [r,g,b].map(c => Math.min(255, Math.floor(c * 1.3 + 15)).toString(16).padStart(2,'0')).join('');
        } catch(e) { return jerseyColor; }
    })();

    // Buffer pixels for outline rendering
    const pixelBuf = {};
    const px = (gx, gy, color) => {
        pixelBuf[`${gx},${gy}`] = color;
    };

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 3 * p, 12 * p, 3 * p, 0, 0, Math.PI * 2);
    ctx.fill();

    const baseY = 0;

    // Skin highlight for 3-tone shading
    const skinLight = (() => {
        try {
            const r = parseInt(skin.slice(1,3),16);
            const g = parseInt(skin.slice(3,5),16);
            const b = parseInt(skin.slice(5,7),16);
            return '#' + [r,g,b].map(c => Math.min(255, Math.floor(c * 1.2 + 25)).toString(16).padStart(2,'0')).join('');
        } catch(e) { return skin; }
    })();

    // === SHOES (5px wide, 3 rows with sole) ===
    // Left shoe
    px(-6, baseY+1, '#111'); px(-5, baseY+1, '#333'); px(-4, baseY+1, '#333'); px(-3, baseY+1, '#333'); px(-2, baseY+1, '#111');
    px(-6, baseY, '#ccc'); px(-5, baseY, '#fff'); px(-4, baseY, '#fff'); px(-3, baseY, '#fff'); px(-2, baseY, '#ccc');
    px(-5, baseY-1, '#ddd'); px(-4, baseY-1, '#eee'); px(-3, baseY-1, '#eee'); px(-2, baseY-1, '#ddd');
    // Right shoe
    px(2, baseY+1, '#111'); px(3, baseY+1, '#333'); px(4, baseY+1, '#333'); px(5, baseY+1, '#333'); px(6, baseY+1, '#111');
    px(2, baseY, '#ccc'); px(3, baseY, '#fff'); px(4, baseY, '#fff'); px(5, baseY, '#fff'); px(6, baseY, '#ccc');
    px(2, baseY-1, '#ddd'); px(3, baseY-1, '#eee'); px(4, baseY-1, '#eee'); px(5, baseY-1, '#ddd');

    // === SOCKS (4px wide, 1 row) ===
    px(-5, baseY-2, '#fff'); px(-4, baseY-2, '#eee'); px(-3, baseY-2, '#eee'); px(-2, baseY-2, '#fff');
    px(2, baseY-2, '#fff'); px(3, baseY-2, '#eee'); px(4, baseY-2, '#eee'); px(5, baseY-2, '#fff');

    // === CALVES (4px wide, 3 rows) ===
    for (let i = 0; i < 3; i++) {
        px(-5, baseY-3-i, skinDark); px(-4, baseY-3-i, skin); px(-3, baseY-3-i, skinLight); px(-2, baseY-3-i, skin);
        px(2, baseY-3-i, skin); px(3, baseY-3-i, skinLight); px(4, baseY-3-i, skin); px(5, baseY-3-i, skinDark);
    }

    // === KNEES (4px wide) ===
    px(-5, baseY-6, skinDark); px(-4, baseY-6, skinDark); px(-3, baseY-6, skin); px(-2, baseY-6, skinDark);
    px(2, baseY-6, skinDark); px(3, baseY-6, skin); px(4, baseY-6, skinDark); px(5, baseY-6, skinDark);

    // === THIGHS (4px wide, 2 rows) ===
    for (let i = 0; i < 2; i++) {
        px(-5, baseY-7-i, skinLight); px(-4, baseY-7-i, skin); px(-3, baseY-7-i, skinDark); px(-2, baseY-7-i, skin);
        px(2, baseY-7-i, skin); px(3, baseY-7-i, skinDark); px(4, baseY-7-i, skin); px(5, baseY-7-i, skinLight);
    }

    // === SHORTS (4 rows, split legs) ===
    const shortsBot = baseY - 9;
    const shortsH = 4;
    const shortsTop = shortsBot - shortsH + 1;
    // Bottom 2 rows: split into leg openings
    for (let row = 0; row < 2; row++) {
        for (let col = -6; col <= -1; col++) px(col, shortsBot + row, col === -6 ? shortsDark : shortsColor);
        for (let col = 1; col <= 6; col++) px(col, shortsBot + row, col === 6 ? shortsDark : shortsColor);
    }
    // Top 2 rows: connected
    for (let row = 0; row < 2; row++) {
        for (let col = -6; col <= 6; col++) px(col, shortsTop + row, (col === -6 || col === 6) ? shortsDark : shortsColor);
    }
    // Waistband
    for (let col = -6; col <= 6; col++) px(col, shortsTop, shortsDark);
    // Side stripes
    for (let row = 0; row < shortsH; row++) {
        px(-5, shortsTop + row, jerseyColor2);
        px(5, shortsTop + row, jerseyColor2);
    }

    // === JERSEY (9 rows, tapered shoulders) ===
    const jerseyBot = shortsTop - 1;
    const jerseyH = 9;
    const jerseyTop = jerseyBot - jerseyH + 1;
    for (let row = 0; row < jerseyH; row++) {
        const jw = row < 3 ? 6 : 5; // wider shoulders
        for (let col = -jw; col <= jw; col++) {
            let c = jerseyColor;
            if (col === -jw || col === jw) c = jerseyDark;
            else if (Math.abs(col) <= 1) c = jerseyLight;
            px(col, jerseyTop + row, c);
        }
    }
    // V-neck collar
    px(-2, jerseyTop, jerseyColor2); px(-1, jerseyTop, jerseyColor2); px(0, jerseyTop, jerseyColor2); px(1, jerseyTop, jerseyColor2); px(2, jerseyTop, jerseyColor2);
    px(-1, jerseyTop+1, jerseyColor2); px(0, jerseyTop+1, jerseyColor2); px(1, jerseyTop+1, jerseyColor2);
    px(0, jerseyTop+2, jerseyColor2);

    // === NECK (2 rows, 5px then 3px) ===
    const neckBot = jerseyTop - 1;
    px(-2, neckBot, skinDark); px(-1, neckBot, skin); px(0, neckBot, skinLight); px(1, neckBot, skin); px(2, neckBot, skinDark);
    px(-1, neckBot-1, skinDark); px(0, neckBot-1, skin); px(1, neckBot-1, skinLight);

    // === ARMS (3px wide, 10 rows each) ===
    const shoulderY = jerseyTop;
    // Left arm - sleeve (3 rows)
    for (let i = 0; i < 3; i++) {
        px(-7, shoulderY+i, jerseyDark); px(-8, shoulderY+i, jerseyColor); px(-9, shoulderY+i, jerseyDark);
    }
    // Left arm - skin (5 rows)
    for (let i = 0; i < 5; i++) {
        px(-7, shoulderY+3+i, skinLight); px(-8, shoulderY+3+i, skin); px(-9, shoulderY+3+i, skinDark);
    }
    // Left hand (2 rows)
    px(-7, shoulderY+8, skin); px(-8, shoulderY+8, skinDark); px(-9, shoulderY+8, skinDark);
    px(-7, shoulderY+9, skinDark); px(-8, shoulderY+9, skinDark); px(-9, shoulderY+9, skinDark);
    // Right arm - sleeve (3 rows)
    for (let i = 0; i < 3; i++) {
        px(7, shoulderY+i, jerseyDark); px(8, shoulderY+i, jerseyColor); px(9, shoulderY+i, jerseyDark);
    }
    // Right arm - skin (5 rows)
    for (let i = 0; i < 5; i++) {
        px(7, shoulderY+3+i, skinDark); px(8, shoulderY+3+i, skin); px(9, shoulderY+3+i, skinLight);
    }
    // Right hand (2 rows)
    px(7, shoulderY+8, skinDark); px(8, shoulderY+8, skinDark); px(9, shoulderY+8, skin);
    px(7, shoulderY+9, skinDark); px(8, shoulderY+9, skinDark); px(9, shoulderY+9, skinDark);

    // === HEAD (13px wide at widest, 10 rows tall, rounded) ===
    const headBot = neckBot - 2;
    const headH = 10;
    const headTop = headBot - headH + 1;
    for (let row = 0; row < headH; row++) {
        let hw;
        if (row === 0 || row === headH - 1) hw = 4;      // top/chin: 9px
        else if (row === 1 || row === headH - 2) hw = 5;  // 11px
        else hw = 6;                                        // middle: 13px
        for (let col = -hw; col <= hw; col++) {
            const shade = col <= -(hw-1) ? skinDark : (col >= (hw-1) ? skinLight : skin);
            px(col, headTop + row, shade);
        }
    }

    // Ears
    px(-7, headTop+3, skinDark); px(-7, headTop+4, skinDark); px(-7, headTop+5, skinDark);
    px(7, headTop+3, skinLight); px(7, headTop+4, skinLight); px(7, headTop+5, skinLight);

    // Eyes (3px each, wider apart)
    px(-5, headTop+4, '#fff'); px(-4, headTop+4, '#fff'); px(-3, headTop+4, '#111');
    px(3, headTop+4, '#111'); px(4, headTop+4, '#fff'); px(5, headTop+4, '#fff');

    // Nose
    px(-1, headTop+5, skinDark); px(0, headTop+5, skinDark);

    // Mouth
    px(-2, headTop+6, skinDark); px(-1, headTop+6, '#833'); px(0, headTop+6, '#833'); px(1, headTop+6, skinDark);

    // === EYEBROWS ===
    const eb = careerPlayer.eyebrowStyle || 'normal';
    const ec = careerPlayer.hairColor;
    const ebRow = headTop + 3;
    if (eb === 'normal') {
        px(-5, ebRow, ec); px(-4, ebRow, ec); px(3, ebRow, ec); px(4, ebRow, ec);
    } else if (eb === 'thick') {
        for (let c = -5; c <= 5; c++) if (Math.abs(c) > 1) px(c, ebRow, ec);
    } else if (eb === 'thin') {
        px(-4, ebRow, ec); px(4, ebRow, ec);
    } else if (eb === 'high') {
        px(-5, ebRow-1, ec); px(-4, ebRow-1, ec); px(3, ebRow-1, ec); px(4, ebRow-1, ec);
    } else if (eb === 'angry') {
        px(-5, ebRow, ec); px(-4, ebRow-1, ec); px(3, ebRow-1, ec); px(4, ebRow, ec);
    }

    // === HAIR ===
    const hc = careerPlayer.hairColor;
    const hs = careerPlayer.hairStyle;
    if (hs === 'buzz') {
        for (let c = -4; c <= 4; c++) px(c, headTop-1, hc);
    } else if (hs === 'crewcut') {
        for (let c = -4; c <= 4; c++) { px(c, headTop-1, hc); px(c, headTop-2, hc); }
    } else if (hs === 'fade') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-6, headTop, hc); px(6, headTop, hc);
        px(-6, headTop+1, hc); px(6, headTop+1, hc);
    } else if (hs === 'taper') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-6, headTop, hc); px(6, headTop, hc);
    } else if (hs === 'midFade') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-6, headTop+1, hc); px(6, headTop+1, hc);
    } else if (hs === 'flat') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
    } else if (hs === 'afro') {
        for (let c = -7; c <= 7; c++) { px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
        for (let c = -7; c <= 7; c++) if (Math.abs(c) >= 6) { px(c, headTop, hc); px(c, headTop+1, hc); px(c, headTop+2, hc); }
    } else if (hs === 'miniAfro') {
        for (let c = -6; c <= 6; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-7, headTop, hc); px(7, headTop, hc);
    } else if (hs === 'curly') {
        for (let c = -6; c <= 6; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-7, headTop, hc); px(7, headTop, hc);
        px(-5, headTop-3, hc); px(-3, headTop-3, hc); px(-1, headTop-3, hc); px(1, headTop-3, hc); px(3, headTop-3, hc); px(5, headTop-3, hc);
    } else if (hs === 'curlytop') {
        for (let c = -4; c <= 4; c++) { px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-4, headTop-4, hc); px(-2, headTop-4, hc); px(0, headTop-4, hc); px(2, headTop-4, hc); px(4, headTop-4, hc);
    } else if (hs === 'wavytop') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-4, headTop-3, hc); px(-2, headTop-3, hc); px(0, headTop-3, hc); px(2, headTop-3, hc); px(4, headTop-3, hc);
    } else if (hs === 'messytop') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-5, headTop-2, hc); px(-3, headTop-3, hc); px(-1, headTop-2, hc); px(1, headTop-2, hc); px(3, headTop-3, hc); px(5, headTop-2, hc);
        px(-4, headTop-2, hc); px(-2, headTop-2, hc); px(0, headTop-2, hc); px(2, headTop-2, hc); px(4, headTop-2, hc);
    } else if (hs === 'spiky') {
        px(-5, headTop-3, hc); px(-3, headTop-4, hc); px(-1, headTop-4, hc); px(1, headTop-4, hc); px(3, headTop-4, hc); px(5, headTop-3, hc);
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
    } else if (hs === 'fauxhawk') {
        for (let c = -1; c <= 1; c++) { px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-3, headTop-1, hc); px(3, headTop-1, hc);
        px(-4, headTop, hc); px(4, headTop, hc);
    } else if (hs === 'mohawk') {
        for (let c = -1; c <= 1; c++) { px(c, headTop-4, hc); px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
    } else if (hs === 'dreads') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        for (let r = 0; r < 6; r++) { px(-7, headTop+r, hc); px(7, headTop+r, hc); }
        px(-6, headTop+5, hc); px(6, headTop+5, hc);
        px(-5, headTop+6, hc); px(5, headTop+6, hc);
    } else if (hs === 'shortdreads') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-7, headTop, hc); px(7, headTop, hc);
        px(-7, headTop+1, hc); px(7, headTop+1, hc);
        px(-6, headTop+2, hc); px(6, headTop+2, hc);
    } else if (hs === 'cornrows') {
        for (let c = -4; c <= 4; c += 2) { px(c, headTop-1, hc); px(c, headTop, hc); px(c, headTop+1, hc); px(c, headTop+2, hc); }
    } else if (hs === 'braids') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-5, headTop, hc); px(-3, headTop, hc); px(-1, headTop, hc); px(1, headTop, hc); px(3, headTop, hc); px(5, headTop, hc);
        px(-5, headTop+1, hc); px(-3, headTop+1, hc); px(-1, headTop+1, hc); px(1, headTop+1, hc); px(3, headTop+1, hc); px(5, headTop+1, hc);
        px(-7, headTop+2, hc); px(-5, headTop+2, hc); px(5, headTop+2, hc); px(7, headTop+2, hc);
        px(-7, headTop+3, hc); px(-5, headTop+3, hc); px(5, headTop+3, hc); px(7, headTop+3, hc);
        px(-7, headTop+4, hc); px(7, headTop+4, hc);
    } else if (hs === 'twists') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-5, headTop-2, hc); px(-3, headTop-2, hc); px(-1, headTop-2, hc); px(1, headTop-2, hc); px(3, headTop-2, hc); px(5, headTop-2, hc);
        px(-7, headTop, hc); px(7, headTop, hc);
        px(-7, headTop+1, hc); px(7, headTop+1, hc);
    } else if (hs === 'long') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        for (let r = 0; r < 8; r++) { px(-7, headTop+r, hc); px(7, headTop+r, hc); }
        px(-6, headTop+7, hc); px(6, headTop+7, hc);
    } else if (hs === 'longtied') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-7, headTop, hc); px(7, headTop, hc);
        px(-7, headTop+1, hc); px(7, headTop+1, hc);
        px(-7, headTop+2, hc); px(-7, headTop+3, hc); px(-7, headTop+4, hc); px(-7, headTop+5, hc);
    } else if (hs === 'manbun') {
        for (let c = -4; c <= 4; c++) px(c, headTop-1, hc);
        px(0, headTop-2, hc); px(-1, headTop-2, hc); px(1, headTop-2, hc);
        px(0, headTop-3, hc); px(-1, headTop-3, hc); px(1, headTop-3, hc);
    } else if (hs === 'ponytail') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-6, headTop, hc); px(6, headTop, hc);
        for (let r = 1; r < 6; r++) px(-7, headTop+r, hc);
    } else if (hs === 'slickback') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        for (let c = -6; c <= 4; c++) px(c, headTop-2, hc);
        px(-6, headTop, hc); px(6, headTop, hc);
    } else if (hs === 'combover') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(6, headTop, hc); px(7, headTop, hc);
        px(6, headTop-1, hc);
    } else if (hs === 'sidepart') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-2, headTop-2, skinDark);
    } else if (hs === 'curtains') {
        for (let c = -5; c <= 5; c++) px(c, headTop-1, hc);
        px(-5, headTop-2, hc); px(-4, headTop-2, hc); px(4, headTop-2, hc); px(5, headTop-2, hc);
        px(-7, headTop, hc); px(-7, headTop+1, hc);
        px(7, headTop, hc); px(7, headTop+1, hc);
    } else if (hs === 'bowlcut') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); px(c, headTop, hc); }
        px(-7, headTop, hc); px(7, headTop, hc);
        px(-7, headTop+1, hc); px(7, headTop+1, hc);
    } else if (hs === 'mullet') {
        for (let c = -5; c <= 5; c++) { px(c, headTop-2, hc); px(c, headTop-1, hc); }
        for (let r = 0; r < 7; r++) px(-7, headTop+r, hc);
        px(-6, headTop+5, hc); px(-6, headTop+6, hc);
    } else if (hs === 'hightop') {
        for (let c = -4; c <= 4; c++) { px(c, headTop-4, hc); px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-5, headTop-1, hc); px(5, headTop-1, hc);
    } else if (hs === 'frohawk') {
        for (let c = -4; c <= 4; c++) { px(c, headTop-4, hc); px(c, headTop-3, hc); px(c, headTop-2, hc); px(c, headTop-1, hc); }
        px(-5, headTop-2, hc); px(5, headTop-2, hc);
        px(-5, headTop-1, hc); px(5, headTop-1, hc);
    }
    // bald = no hair


    // === RENDER WITH BLACK OUTLINES ===
    // Draw black outline around the entire silhouette
    const outlineDirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    ctx.fillStyle = '#000';
    for (const key of Object.keys(pixelBuf)) {
        const [gx, gy] = key.split(',').map(Number);
        for (const [dx, dy] of outlineDirs) {
            const nk = `${gx+dx},${gy+dy}`;
            if (!pixelBuf[nk]) {
                ctx.fillRect(sx + (gx+dx) * p, sy + (gy+dy) * p, p, p);
            }
        }
    }
    // Draw colored pixels on top
    for (const [key, color] of Object.entries(pixelBuf)) {
        const [gx, gy] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(sx + gx * p, sy + gy * p, p, p);
    }

    // Jersey number (drawn on top of everything)
    const numStr = (careerPlayer.number || 1).toString();
    ctx.fillStyle = jerseyColor2;
    ctx.font = `bold ${p * 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numStr, sx, sy + (jerseyTop + 5) * p);
}

// Draw initial preview when screen opens
const origShowScreen = showScreen;
showScreen = function(name) {
    origShowScreen(name);
    if (name === 'createPlayer') {
        updateAttributeDisplay();
        drawPlayerPreview();
    }
};

// Update preview when number changes
document.getElementById('playerNumberInput').addEventListener('input', function() {
    careerPlayer.number = parseInt(this.value) || 1;
    drawPlayerPreview();
});

// Continue button
const POSITION_NAMES = { PG: 'Point Guard', SG: 'Shooting Guard', SF: 'Small Forward', PF: 'Power Forward', C: 'Center' };

document.getElementById('createPlayerContinueBtn').addEventListener('click', () => {
    const firstVal = document.getElementById('playerFirstNameInput').value.trim();
    const lastVal = document.getElementById('playerLastNameInput').value.trim();
    const numVal = parseInt(document.getElementById('playerNumberInput').value);
    const errorEl = document.getElementById('createPlayerError');

    // Validation
    if (!firstVal) { errorEl.textContent = 'Enter your first name'; return; }
    if (!lastVal) { errorEl.textContent = 'Enter your last name'; return; }
    if (isNaN(numVal) || numVal < 0 || numVal > 99) { errorEl.textContent = 'Pick a number (0-99)'; return; }
    if (!selectedState) { errorEl.textContent = 'Select your home state'; return; }
    if (!careerPlayer.hometown) { errorEl.textContent = 'Pick your city'; return; }
    if (!careerPlayer.primaryArchetype) { errorEl.textContent = 'Choose a primary archetype'; return; }
    if (!careerPlayer.secondaryArchetype) { errorEl.textContent = 'Choose a secondary archetype'; return; }

    errorEl.textContent = '';
    careerPlayer.firstName = firstVal;
    careerPlayer.lastName = lastVal;
    careerPlayer.number = Math.max(0, Math.min(99, numVal));
    showPlayerProfile();
});

function showPlayerProfile() {
    showScreen('playerProfile');

    // Draw player preview on profile canvas
    const canvas = document.getElementById('profilePreviewCanvas');
    const ctx2 = canvas.getContext('2d');
    const w = canvas.width, ht = canvas.height;
    ctx2.clearRect(0, 0, w, ht);
    // Reuse the preview draw logic by temporarily swapping canvas
    const origCanvas = document.getElementById('playerPreviewCanvas');
    drawPlayerPreview();
    ctx2.imageSmoothingEnabled = false;
    ctx2.drawImage(origCanvas, 0, 0, origCanvas.width, origCanvas.height, 0, 0, w, ht);

    // Build the sentence
    const fullName = (careerPlayer.firstName + ' ' + careerPlayer.lastName).trim();
    const heightStr = careerPlayer.heightLabel || "6'3\"";
    const archName = (careerPlayer.primaryArchetype && ARCHETYPES[careerPlayer.primaryArchetype]) ? ARCHETYPES[careerPlayer.primaryArchetype].name : '';
    const hometown = careerPlayer.hometown;

    let sentence = `${fullName}, ${heightStr}`;
    if (archName) sentence += `, ${archName}`;
    if (hometown) sentence += `, out of ${hometown}`;

    document.getElementById('profileName').textContent = sentence;
    document.getElementById('profileDetails').innerHTML = '';
    document.getElementById('profileArchetypes').innerHTML = '';

    // Attribute bars
    const attrsDiv = document.getElementById('profileAttrs');
    attrsDiv.innerHTML = '';
    const attrs = careerPlayer.attributes;
    for (const key in ATTRIBUTE_LABELS) {
        const val = attrs[key];
        const row = document.createElement('div');
        row.className = 'profile-attr-row';
        row.innerHTML = `
            <span class="profile-attr-label">${ATTRIBUTE_LABELS[key]}</span>
            <div class="profile-attr-bar-bg"><div class="profile-attr-bar-fill" style="width:${val}%;background:${getAttrBarColor(val)};"></div></div>
            <span class="profile-attr-val">${val}</span>
        `;
        attrsDiv.appendChild(row);
    }
}

document.getElementById('profileContinueBtn').addEventListener('click', () => {
    showTeamSelection();
});

document.getElementById('profileBackBtn').addEventListener('click', () => {
    showScreen('createPlayer');
});

document.getElementById('modePickerBackBtn').addEventListener('click', () => {
    showSlotScreen();
});

function showSlotScreen() {
    showScreen('slot');
    const list = document.getElementById('slotList');
    list.innerHTML = '';

    for (let i = 0; i < MAX_SEASON_SLOTS; i++) {
        const data = loadSlotPreview(i);
        const card = document.createElement('div');
        card.className = 'slot-card';

        if (data && data.active) {
            const team = collegeTeams[data.myTeam];
            const phaseLabel = data.phase === 'champion' ? 'Champions!' : data.phase === 'marchMadness' ? 'March Madness' : `Game ${data.currentGame} / ${data.schedule.length}`;
            card.innerHTML = `
                <div class="slot-info">
                    <div class="slot-label">Slot #${i + 1}</div>
                    <div class="slot-team" style="color:${team.color1};">${team.name}</div>
                    <div class="slot-detail">${data.record.wins}-${data.record.losses} | ${phaseLabel}</div>
                </div>
                <div class="slot-actions">
                    <button class="btn btn-primary slot-play-btn">Continue</button>
                    <button class="btn btn-small slot-delete-btn">Delete</button>
                </div>
            `;
            card.querySelector('.slot-play-btn').addEventListener('click', () => {
                currentSlot = i;
                loadSeasonState();
                openActiveSlot();
            });
            card.querySelector('.slot-delete-btn').addEventListener('click', () => {
                if (confirm(`Delete Slot #${i + 1}? This cannot be undone.`)) {
                    deleteSlot(i);
                    showSlotScreen();
                }
            });
        } else {
            card.innerHTML = `
                <div class="slot-info">
                    <div class="slot-label">Slot #${i + 1}</div>
                    <div class="slot-empty">Empty</div>
                </div>
                <div class="slot-actions">
                    <button class="btn btn-primary slot-play-btn">New Season</button>
                </div>
            `;
            card.querySelector('.slot-play-btn').addEventListener('click', () => {
                currentSlot = i;
                seasonState = { active: false, myTeam: null, schedule: [], record: { wins: 0, losses: 0 }, currentGame: 0, standings: [], phase: 'regular', bracket: null, bracketRound: 0 };
                showModePicker();
            });
        }

        list.appendChild(card);
    }
}

function openActiveSlot() {
    if (seasonState.phase === 'champion') {
        showChampionScreen();
    } else if (seasonState.phase === 'marchMadness') {
        showBracketScreen();
    } else {
        showSeasonHub();
    }
}

let selectedTeamIndex = null;

function showTeamSelection() {
    selectedTeamIndex = null;
    showScreen('season');
    const grid = document.getElementById('teamGrid');
    const startBtn = document.getElementById('startSeasonBtn');
    startBtn.style.display = 'none';
    grid.innerHTML = '';

    conferenceOrder.forEach(conf => {
        const confTeams = [];
        collegeTeams.forEach((t, i) => { if (t.conference === conf) confTeams.push({ team: t, index: i }); });
        if (confTeams.length === 0) return;

        // Conference header
        const header = document.createElement('div');
        header.className = 'conf-header';
        header.textContent = conf;
        grid.appendChild(header);

        // Teams in this conference
        confTeams.forEach(({ team, index }) => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.style.borderColor = team.color1;
            card.innerHTML = `
                <div class="team-card-swatch" style="background:${team.color1};">
                    <span class="team-card-abbr" style="color:${team.color2};">${team.abbr}</span>
                </div>
                <div class="team-card-name">${team.name}</div>
                <div class="team-card-rating">${team.strength} OVR</div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedTeamIndex = index;
                startBtn.style.display = 'inline-block';
            });
            grid.appendChild(card);
        });
    });
}

document.getElementById('startSeasonBtn').addEventListener('click', () => {
    if (selectedTeamIndex === null) return;
    initSeason(selectedTeamIndex);
    showSeasonHub();
});

function initSeason(teamIndex) {
    seasonState = {
        active: true,
        myTeam: teamIndex,
        schedule: [],
        record: { wins: 0, losses: 0 },
        currentGame: 0,
        standings: [],
        phase: 'regular',
        bracket: null,
        bracketRound: 0,
        careerPlayer: { ...careerPlayer, attributes: { ...careerPlayer.attributes } }
    };

    // Initialize standings for all teams
    for (let i = 0; i < collegeTeams.length; i++) {
        seasonState.standings.push({ teamIndex: i, wins: 0, losses: 0 });
    }

    generateSchedule(teamIndex);
    saveSeasonState();
}

function generateSchedule(teamIndex) {
    const myConference = collegeTeams[teamIndex].conference;
    const confTeams = [];
    const nonConfTeams = [];

    collegeTeams.forEach((t, i) => {
        if (i === teamIndex) return;
        if (t.conference === myConference) confTeams.push(i);
        else nonConfTeams.push(i);
    });

    // Shuffle arrays
    const shuffle = arr => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    shuffle(confTeams);
    shuffle(nonConfTeams);

    const schedule = [];

    // Play each conference opponent at least once
    for (let i = 0; i < confTeams.length; i++) {
        schedule.push({ opponent: confTeams[i], isHome: i % 2 === 0, result: null, played: false, myScore: 0, oppScore: 0 });
    }

    // Add rematches to target ~20 conference games (but not more than 2x opponents)
    const targetConfGames = Math.min(20, confTeams.length * 2);
    const rematches = targetConfGames - confTeams.length;
    for (let i = 0; i < rematches; i++) {
        schedule.push({ opponent: confTeams[i % confTeams.length], isHome: i % 2 === 1, result: null, played: false, myScore: 0, oppScore: 0 });
    }

    // Fill remaining with non-conference games (total 30)
    const nonConfCount = 30 - schedule.length;
    for (let i = 0; i < nonConfCount; i++) {
        schedule.push({ opponent: nonConfTeams[i % nonConfTeams.length], isHome: i % 2 === 0, result: null, played: false, myScore: 0, oppScore: 0 });
    }

    shuffle(schedule);
    seasonState.schedule = schedule;
}

function showSeasonHub() {
    showScreen('seasonHub');
    const myTeam = collegeTeams[seasonState.myTeam];
    document.getElementById('hubTeamName').textContent = myTeam.name;
    document.getElementById('hubTeamName').style.color = myTeam.color1;
    document.getElementById('hubRecord').textContent = `${seasonState.record.wins} - ${seasonState.record.losses}`;

    const nextGameDiv = document.getElementById('hubNextGame');

    if (seasonState.phase === 'marchMadness') {
        nextGameDiv.innerHTML = '<p style="color:#FFD700;font-size:20px;font-weight:bold;">March Madness has begun!</p>';
        document.getElementById('playGameBtn').style.display = 'none';
        document.getElementById('simGameBtn').style.display = 'none';
        // Add a go to bracket button
        const bracketBtn = document.createElement('button');
        bracketBtn.className = 'btn btn-primary';
        bracketBtn.style.marginTop = '10px';
        bracketBtn.textContent = 'Go to Bracket';
        bracketBtn.addEventListener('click', () => showBracketScreen());
        nextGameDiv.appendChild(bracketBtn);
        return;
    }

    if (seasonState.currentGame >= seasonState.schedule.length) {
        nextGameDiv.innerHTML = '<p style="color:#FFD700;font-size:20px;font-weight:bold;">Regular season complete!</p>';
        document.getElementById('playGameBtn').style.display = 'none';
        document.getElementById('simGameBtn').style.display = 'none';
        startMarchMadness();
        return;
    }

    const nextGame = seasonState.schedule[seasonState.currentGame];
    const opp = collegeTeams[nextGame.opponent];
    const homeAway = nextGame.isHome ? 'HOME' : 'AWAY';
    const gameNum = seasonState.currentGame + 1;

    nextGameDiv.innerHTML = `
        <div class="next-game-label">Game ${gameNum} of ${seasonState.schedule.length}</div>
        <div class="next-game-matchup">
            <span class="next-game-ha">${homeAway}</span>
            <span>vs</span>
            <span class="next-game-opp" style="color:${opp.color1};">${opp.name}</span>
        </div>
        <div class="next-game-rating">${opp.strength} OVR</div>
    `;

    document.getElementById('playGameBtn').style.display = 'inline-block';
    document.getElementById('simGameBtn').style.display = 'inline-block';
}

// Hub navigation buttons
document.getElementById('hubScheduleBtn').addEventListener('click', () => showScheduleScreen());
document.getElementById('hubStandingsBtn').addEventListener('click', () => showStandingsScreen());
document.getElementById('hubBackBtn').addEventListener('click', () => {
    showSlotScreen();
});

// Play Game button
document.getElementById('playGameBtn').addEventListener('click', () => {
    if (seasonState.phase === 'regular') {
        const gameData = seasonState.schedule[seasonState.currentGame];
        startSeasonGame(gameData.opponent);
    }
});

// Sim Game button
document.getElementById('simGameBtn').addEventListener('click', () => {
    if (seasonState.phase === 'regular') {
        simSeasonGame();
    }
});

function applyCareerPlayerToGame() {
    const cp = seasonState.careerPlayer || careerPlayer;
    const p = playerTeam[0];
    const attrs = cp.attributes || BASE_ATTRIBUTES;

    // Apply appearance
    p.skinColor = cp.skinColor;
    p.hairColor = cp.hairColor;
    p.hairStyle = cp.hairStyle;
    p.eyebrowStyle = cp.eyebrowStyle || 'normal';
    p.height = cp.height || 1.0;
    p.jerseyNumber = cp.number || 1;

    // Apply speed from attrs (speed 25->2.5, 99->5.5)
    p.speed = 2.5 + (attrs.speed - 25) / (99 - 25) * 3.0;
    p.sprintSpeed = 4.5 + (attrs.speed - 25) / (99 - 25) * 3.5;

    // Store attrs on the player for gameplay use
    p.attrs = { ...attrs };

    // Apply attributes to AI teammates based on team strength
    const teamStrength = collegeTeams[seasonState.myTeam].strength;
    for (let i = 1; i < playerTeam.length; i++) {
        const base = 35 + teamStrength * 0.3;
        playerTeam[i].attrs = {
            midRange: Math.min(99, Math.round(base + Math.random() * 15)),
            threePoint: Math.min(99, Math.round(base - 5 + Math.random() * 15)),
            ballHandling: Math.min(99, Math.round(base + Math.random() * 15)),
            speed: Math.min(99, Math.round(base + Math.random() * 15)),
            defense: Math.min(99, Math.round(base + Math.random() * 15)),
            rebounding: Math.min(99, Math.round(base + Math.random() * 15)),
            finishing: Math.min(99, Math.round(base + Math.random() * 15)),
            passing: Math.min(99, Math.round(base + Math.random() * 15))
        };
    }

    // Apply attributes to opponents based on opponent strength
    const oppStrength = collegeTeams[seasonState.currentOpponent || 0].strength;
    for (const op of opponentTeam) {
        const base = 35 + oppStrength * 0.3;
        op.attrs = {
            midRange: Math.min(99, Math.round(base + Math.random() * 15)),
            threePoint: Math.min(99, Math.round(base - 5 + Math.random() * 15)),
            ballHandling: Math.min(99, Math.round(base + Math.random() * 15)),
            speed: Math.min(99, Math.round(base + Math.random() * 15)),
            defense: Math.min(99, Math.round(base + Math.random() * 15)),
            rebounding: Math.min(99, Math.round(base + Math.random() * 15)),
            finishing: Math.min(99, Math.round(base + Math.random() * 15)),
            passing: Math.min(99, Math.round(base + Math.random() * 15))
        };
    }
}

function startSeasonGame(opponentIndex) {
    const myTeamData = collegeTeams[seasonState.myTeam];
    const oppTeamData = collegeTeams[opponentIndex];
    seasonState.currentOpponent = opponentIndex;

    // Set jersey colors for player team
    for (const p of playerTeam) {
        p.jerseyColor = myTeamData.color1;
        p.jerseyColor2 = myTeamData.color2;
        p.shortsColor = myTeamData.color2;
    }

    // Set jersey colors for opponent team
    for (const p of opponentTeam) {
        p.jerseyColor = oppTeamData.color1;
        p.jerseyColor2 = oppTeamData.color2;
        p.shortsColor = oppTeamData.color2;
    }

    showScreen('game');
    startGame(false);
    applyCareerPlayerToGame();
}

function simSeasonGame() {
    const gameData = seasonState.schedule[seasonState.currentGame];
    const myStrength = collegeTeams[seasonState.myTeam].strength;
    const oppStrength = collegeTeams[gameData.opponent].strength;

    const result = simulateGame(myStrength, oppStrength);
    const won = result.score1 > result.score2;

    gameData.played = true;
    gameData.result = won ? 'W' : 'L';
    gameData.myScore = result.score1;
    gameData.oppScore = result.score2;

    if (won) {
        seasonState.record.wins++;
        seasonState.standings[seasonState.myTeam].wins++;
    } else {
        seasonState.record.losses++;
        seasonState.standings[seasonState.myTeam].losses++;
    }

    seasonState.currentGame++;
    simOtherTeamGames();
    saveSeasonState();

    const opp = collegeTeams[gameData.opponent];
    alert(`${won ? 'WIN' : 'LOSS'}!\n\n${collegeTeams[seasonState.myTeam].abbr} ${result.score1} - ${opp.abbr} ${result.score2}\n\nRecord: ${seasonState.record.wins}-${seasonState.record.losses}`);

    if (seasonState.currentGame >= seasonState.schedule.length) {
        startMarchMadness();
    } else {
        showSeasonHub();
    }
}

function simulateGame(strength1, strength2) {
    // Generate scores based on team strengths
    const baseScore1 = 55 + Math.floor(Math.random() * 30);
    const baseScore2 = 55 + Math.floor(Math.random() * 30);

    // Adjust by relative strength difference
    const diff = (strength1 - strength2) / 100;
    const score1 = Math.max(45, Math.round(baseScore1 + diff * 15 + (Math.random() - 0.5) * 10));
    const score2 = Math.max(45, Math.round(baseScore2 - diff * 15 + (Math.random() - 0.5) * 10));

    // Ensure no ties
    if (score1 === score2) {
        if (strength1 >= strength2) return { score1: score1 + 1, score2 };
        return { score1, score2: score2 + 1 };
    }
    return { score1, score2 };
}

function recordSeasonGameResult(won, myScore, oppScore) {
    const gameData = seasonState.schedule[seasonState.currentGame];
    gameData.played = true;
    gameData.result = won ? 'W' : 'L';
    gameData.myScore = myScore;
    gameData.oppScore = oppScore;

    if (won) {
        seasonState.record.wins++;
        seasonState.standings[seasonState.myTeam].wins++;
    } else {
        seasonState.record.losses++;
        seasonState.standings[seasonState.myTeam].losses++;
    }

    seasonState.currentGame++;
}

function simOtherTeamGames() {
    // Simulate one round of games for all other teams
    for (let i = 0; i < collegeTeams.length; i++) {
        if (i === seasonState.myTeam) continue;

        // Each team plays ~1 game per round
        if (Math.random() < 0.8) {
            // Pick a random opponent from same conference or non-conference
            let oppIdx;
            do {
                oppIdx = Math.floor(Math.random() * collegeTeams.length);
            } while (oppIdx === i);

            const result = simulateGame(collegeTeams[i].strength, collegeTeams[oppIdx].strength);
            if (result.score1 > result.score2) {
                seasonState.standings[i].wins++;
                seasonState.standings[oppIdx].losses++;
            } else {
                seasonState.standings[i].losses++;
                seasonState.standings[oppIdx].wins++;
            }
        }
    }
}

// Schedule Screen
function showScheduleScreen() {
    showScreen('schedule');
    const list = document.getElementById('scheduleList');
    list.innerHTML = '';

    seasonState.schedule.forEach((g, i) => {
        const opp = collegeTeams[g.opponent];
        const row = document.createElement('div');
        row.className = 'schedule-row' + (i === seasonState.currentGame ? ' schedule-current' : '') + (g.played ? (g.result === 'W' ? ' schedule-win' : ' schedule-loss') : '');
        const ha = g.isHome ? 'vs' : '@';
        if (g.played) {
            row.innerHTML = `<span class="schedule-game-num">${i + 1}</span><span class="schedule-ha">${ha}</span><span class="schedule-opp" style="color:${opp.color1};">${opp.abbr}</span><span class="schedule-result ${g.result === 'W' ? 'result-win' : 'result-loss'}">${g.result} ${g.myScore}-${g.oppScore}</span>`;
        } else {
            row.innerHTML = `<span class="schedule-game-num">${i + 1}</span><span class="schedule-ha">${ha}</span><span class="schedule-opp" style="color:${opp.color1};">${opp.abbr}</span><span class="schedule-upcoming">Upcoming</span>`;
        }
        list.appendChild(row);
    });
}

document.getElementById('scheduleBackBtn').addEventListener('click', () => showSeasonHub());

// Standings Screen
let standingsConference = 'SEC';

function showStandingsScreen() {
    showScreen('standings');
    // Default to the player's own conference
    if (seasonState.myTeam !== null) {
        standingsConference = collegeTeams[seasonState.myTeam].conference;
    }
    renderStandingsTabs();
    renderStandings();
}

function renderStandingsTabs() {
    const tabs = document.getElementById('standingsTabs');
    const conferences = conferenceOrder;
    tabs.innerHTML = '';
    conferences.forEach(conf => {
        const btn = document.createElement('button');
        btn.className = 'standings-tab' + (conf === standingsConference ? ' active' : '');
        btn.textContent = conf;
        btn.addEventListener('click', () => {
            standingsConference = conf;
            renderStandingsTabs();
            renderStandings();
        });
        tabs.appendChild(btn);
    });
}

function renderStandings() {
    const table = document.getElementById('standingsTable');
    const confTeams = seasonState.standings
        .filter(s => collegeTeams[s.teamIndex].conference === standingsConference)
        .sort((a, b) => {
            const aWinPct = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
            const bWinPct = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
            return bWinPct - aWinPct || b.wins - a.wins;
        });

    let html = '<div class="standings-header"><span class="standings-rank">#</span><span class="standings-name">Team</span><span class="standings-wl">W</span><span class="standings-wl">L</span></div>';
    confTeams.forEach((s, i) => {
        const team = collegeTeams[s.teamIndex];
        const isMyTeam = s.teamIndex === seasonState.myTeam;
        html += `<div class="standings-row${isMyTeam ? ' standings-my-team' : ''}"><span class="standings-rank">${i + 1}</span><span class="standings-name" style="color:${team.color1};">${team.abbr} ${team.name.split(' ').pop()}</span><span class="standings-wl">${s.wins}</span><span class="standings-wl">${s.losses}</span></div>`;
    });
    table.innerHTML = html;
}

document.getElementById('standingsBackBtn').addEventListener('click', () => showSeasonHub());

// ========================================
// MARCH MADNESS
// ========================================
function startMarchMadness() {
    seasonState.phase = 'marchMadness';
    seasonState.bracketRound = 0;

    // Seed top 64 teams by overall record
    const seeded = [...seasonState.standings].sort((a, b) => {
        const aWinPct = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
        const bWinPct = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
        return bWinPct - aWinPct || b.wins - a.wins;
    });

    // Take top 64 for the bracket
    const bracketTeams = seeded.slice(0, 64);

    // Build bracket: array of rounds, each round is array of matchups
    // Round 0: 32 games (64 teams), Round 1: 16 games, ... Round 5: 1 game (championship)
    const round1 = [];
    for (let i = 0; i < 32; i++) {
        const team1 = bracketTeams[i].teamIndex;
        const team2 = bracketTeams[63 - i].teamIndex;
        round1.push({ team1, team2, winner: null, score1: 0, score2: 0, seed1: i + 1, seed2: 64 - i });
    }

    seasonState.bracket = [round1];
    seasonState.bracketRound = 1;
    saveSeasonState();
    showBracketScreen();
}

function showBracketScreen() {
    showScreen('bracket');
    const roundNames = ['', 'Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship'];
    const currentRound = seasonState.bracketRound;
    document.getElementById('bracketRoundLabel').textContent = roundNames[currentRound] || `Round ${currentRound}`;

    renderBracket();
    renderBracketActions();
}

function renderBracket() {
    const view = document.getElementById('bracketView');
    const rounds = seasonState.bracket;
    const currentRoundIndex = rounds.length - 1;
    const currentMatchups = rounds[currentRoundIndex];

    let html = '';

    // Show current round matchups
    currentMatchups.forEach((m, i) => {
        const t1 = collegeTeams[m.team1];
        const t2 = collegeTeams[m.team2];
        const isMyGame = m.team1 === seasonState.myTeam || m.team2 === seasonState.myTeam;
        const hasWinner = m.winner !== null;

        html += `<div class="bracket-matchup${isMyGame ? ' bracket-my-game' : ''}${hasWinner ? ' bracket-done' : ''}">
            <div class="bracket-seed">(${m.seed1})</div>
            <div class="bracket-team${m.winner === m.team1 ? ' bracket-winner' : ''}" style="border-left:4px solid ${t1.color1};">
                <span class="bracket-team-name">${t1.abbr}</span>
                ${hasWinner ? `<span class="bracket-score">${m.score1}</span>` : ''}
            </div>
            <div class="bracket-vs">vs</div>
            <div class="bracket-team${m.winner === m.team2 ? ' bracket-winner' : ''}" style="border-left:4px solid ${t2.color1};">
                <span class="bracket-team-name">${t2.abbr}</span>
                ${hasWinner ? `<span class="bracket-score">${m.score2}</span>` : ''}
            </div>
            <div class="bracket-seed">(${m.seed2})</div>
        </div>`;
    });

    view.innerHTML = html;
}

function renderBracketActions() {
    const actions = document.getElementById('bracketActions');
    const rounds = seasonState.bracket;
    const currentRoundIndex = rounds.length - 1;
    const currentMatchups = rounds[currentRoundIndex];

    // Check if all games in current round are done
    const allDone = currentMatchups.every(m => m.winner !== null);

    if (allDone) {
        if (currentMatchups.length === 1) {
            // Championship done
            const champ = currentMatchups[0].winner;
            if (champ === seasonState.myTeam) {
                actions.innerHTML = '<button class="btn btn-primary btn-large" id="champCelebrateBtn">Celebrate!</button>';
                document.getElementById('champCelebrateBtn').addEventListener('click', () => {
                    seasonState.phase = 'champion';
                    saveSeasonState();
                    showChampionScreen();
                });
            } else {
                actions.innerHTML = `<p style="color:#fff;font-size:18px;">${collegeTeams[champ].name} wins the championship!</p><button class="btn btn-secondary" id="bracketMenuBtn">Done</button>`;
                document.getElementById('bracketMenuBtn').addEventListener('click', () => {
                    seasonState.active = false;
                    saveSeasonState();
                    showSlotScreen();
                });
            }
        } else {
            // Advance to next round
            actions.innerHTML = '<button class="btn btn-primary btn-large" id="advanceRoundBtn">Next Round</button>';
            document.getElementById('advanceRoundBtn').addEventListener('click', () => {
                advanceBracketRound();
                showBracketScreen();
            });
        }
    } else {
        // Find my game
        const myGame = currentMatchups.find(m => (m.team1 === seasonState.myTeam || m.team2 === seasonState.myTeam) && m.winner === null);
        if (myGame) {
            const oppIndex = myGame.team1 === seasonState.myTeam ? myGame.team2 : myGame.team1;
            actions.innerHTML = `
                <button class="btn btn-primary btn-large" id="bracketPlayBtn">Play Game</button>
                <button class="btn btn-secondary btn-large" id="bracketSimBtn">Sim Game</button>
            `;
            document.getElementById('bracketPlayBtn').addEventListener('click', () => {
                startSeasonGame(oppIndex);
            });
            document.getElementById('bracketSimBtn').addEventListener('click', () => {
                simBracketGame();
            });
        } else {
            // My game is done, sim remaining
            actions.innerHTML = '<button class="btn btn-primary btn-large" id="simRestBtn">Sim Remaining Games</button>';
            document.getElementById('simRestBtn').addEventListener('click', () => {
                simRemainingBracketGames();
                renderBracket();
                renderBracketActions();
            });
        }
    }
}

function advanceBracketRound() {
    const rounds = seasonState.bracket;
    const lastRound = rounds[rounds.length - 1];

    const nextRound = [];
    for (let i = 0; i < lastRound.length; i += 2) {
        const w1 = lastRound[i].winner;
        const w2 = lastRound[i + 1].winner;
        const s1 = lastRound[i].winner === lastRound[i].team1 ? lastRound[i].seed1 : lastRound[i].seed2;
        const s2 = lastRound[i + 1].winner === lastRound[i + 1].team1 ? lastRound[i + 1].seed1 : lastRound[i + 1].seed2;
        nextRound.push({ team1: w1, team2: w2, winner: null, score1: 0, score2: 0, seed1: s1, seed2: s2 });
    }

    rounds.push(nextRound);
    seasonState.bracketRound++;
    saveSeasonState();
}

function recordBracketGameResult(won, myScore, oppScore) {
    const rounds = seasonState.bracket;
    const currentRound = rounds[rounds.length - 1];
    const myGame = currentRound.find(m => (m.team1 === seasonState.myTeam || m.team2 === seasonState.myTeam) && m.winner === null);

    if (myGame) {
        const isTeam1 = myGame.team1 === seasonState.myTeam;
        myGame.score1 = isTeam1 ? myScore : oppScore;
        myGame.score2 = isTeam1 ? oppScore : myScore;
        myGame.winner = won ? seasonState.myTeam : (isTeam1 ? myGame.team2 : myGame.team1);

        if (won) {
            seasonState.record.wins++;
        } else {
            seasonState.record.losses++;
        }
    }
}

function simBracketGame() {
    const rounds = seasonState.bracket;
    const currentRound = rounds[rounds.length - 1];
    const myGame = currentRound.find(m => (m.team1 === seasonState.myTeam || m.team2 === seasonState.myTeam) && m.winner === null);

    if (!myGame) return;

    const myStrength = collegeTeams[seasonState.myTeam].strength;
    const oppIndex = myGame.team1 === seasonState.myTeam ? myGame.team2 : myGame.team1;
    const oppStrength = collegeTeams[oppIndex].strength;
    const isTeam1 = myGame.team1 === seasonState.myTeam;

    const result = simulateGame(myStrength, oppStrength);
    myGame.score1 = isTeam1 ? result.score1 : result.score2;
    myGame.score2 = isTeam1 ? result.score2 : result.score1;
    const won = (isTeam1 && result.score1 > result.score2) || (!isTeam1 && result.score2 > result.score1);
    myGame.winner = won ? seasonState.myTeam : oppIndex;

    if (won) {
        seasonState.record.wins++;
    } else {
        seasonState.record.losses++;
    }

    saveSeasonState();

    const opp = collegeTeams[oppIndex];
    alert(`${won ? 'WIN' : 'LOSS'}!\n\n${collegeTeams[seasonState.myTeam].abbr} ${isTeam1 ? myGame.score1 : myGame.score2} - ${opp.abbr} ${isTeam1 ? myGame.score2 : myGame.score1}`);

    if (!won) {
        alert('Your March Madness run is over! Better luck next year.');
        seasonState.active = false;
        saveSeasonState();
        showSlotScreen();
        return;
    }

    renderBracket();
    renderBracketActions();
}

function simRemainingBracketGames() {
    const rounds = seasonState.bracket;
    const currentRound = rounds[rounds.length - 1];

    currentRound.forEach(m => {
        if (m.winner !== null) return;
        const result = simulateGame(collegeTeams[m.team1].strength, collegeTeams[m.team2].strength);
        m.score1 = result.score1;
        m.score2 = result.score2;
        m.winner = result.score1 > result.score2 ? m.team1 : m.team2;
    });

    saveSeasonState();
}

document.getElementById('bracketBackBtn').addEventListener('click', () => showSeasonHub());

// ========================================
// CHAMPIONSHIP SCREEN
// ========================================
function showChampionScreen() {
    showScreen('champion');
    const team = collegeTeams[seasonState.myTeam];
    document.getElementById('championTeamName').textContent = team.name;
    document.getElementById('championTeamName').style.color = team.color1;
    document.getElementById('championRecord').textContent = `Final Record: ${seasonState.record.wins} - ${seasonState.record.losses}`;
    startConfetti();
}

let confettiId = null;
function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const cCtx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 400;

    const pieces = [];
    const colors = ['#ff6b35', '#FFD700', '#ff4444', '#44ff44', '#4444ff', '#ff44ff', '#ffffff'];
    for (let i = 0; i < 120; i++) {
        pieces.push({
            x: Math.random() * 500,
            y: Math.random() * -400,
            w: 4 + Math.random() * 6,
            h: 4 + Math.random() * 8,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: 1 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }

    function draw() {
        cCtx.clearRect(0, 0, 500, 400);
        pieces.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.rotation += p.rotSpeed;
            if (p.y > 420) { p.y = -10; p.x = Math.random() * 500; }

            cCtx.save();
            cCtx.translate(p.x, p.y);
            cCtx.rotate(p.rotation * Math.PI / 180);
            cCtx.fillStyle = p.color;
            cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            cCtx.restore();
        });
        confettiId = requestAnimationFrame(draw);
    }
    draw();
}

document.getElementById('championMenuBtn').addEventListener('click', () => {
    if (confettiId) cancelAnimationFrame(confettiId);
    seasonState.active = false;
    saveSeasonState();
    showSlotScreen();
});

console.log('Basketball game loaded!');
