/* Toneday · one color a day, one artwork a week.
   Everything runs in the browser. Colors are saved only in this browser (localStorage). */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const now = () => performance.now() / 1000;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const haptic = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
const hsl = (c, a = 1) => `hsla(${c.h.toFixed(1)},${(c.s * 100).toFixed(1)}%,${(c.l * 100).toFixed(1)}%,${a})`;
const visual = c => ({ h: c.h, s: c.s, l: clamp(c.l, .2, .85), i: c.i });
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < .5) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  return [f(h + 1/3) * 255, f(h) * 255, f(h - 1/3) * 255];
}
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- Analytics (Vercel Web Analytics; custom events need the Pro plan) ---------- */
const track = (name, data) => { try { window.va && window.va('event', data ? { name, data } : { name }); } catch (e) {} };

/* ---------- Language ---------- */
const LANG = (document.documentElement.lang || 'en').slice(0, 2) === 'it' ? 'it' : 'en';
const T = {
  en: {
    question: { today: 'What color is today?', past: 'What color was that day?' },
    hint: 'Move around the circle to change the color. Toward the edge it grows more intense.',
    reveal: 'Reveal your week', preview: 'Preview your week so far',
    captionFull: 'Seven days, one artwork.',
    caption: (n, e) => `${n} ${n === 1 ? 'color' : 'colors'} and ${e === 1 ? 'one day of rest' : e + ' days of rest'}.`,
    captionExample: 'An example week. Yours begins today.',
    tela0: 'Still waiting for its first color', tela: 'Still in motion',
    of7: n => `${n} of 7`,
    todayIs: p => `Today: ${p.charAt(0).toLowerCase() + p.slice(1)}.`,
    todayEmpty: 'Today is a day of rest.',
    pickToday: "Pick today's color", change: 'Change',
    dayLabel: (d, p, kind) => `${d}: ${kind === 'filled' ? p : kind === 'empty' ? 'a day of rest' : kind === 'todo' ? 'not chosen yet' : 'still to come'}`,
    today: 'Today', soundOn: 'Sound on', soundOff: 'Sound off',
    phonesIdle: 'Best with headphones', phonesPlaying: 'Playing an example week',
    saved: 'Saved', save: 'Save wallpaper', share: 'Save to Photos',
    wallTitle: 'Toneday wallpaper',
    timeLocale: 'en-US'
  },
  it: {
    question: { today: 'Di che colore è oggi?', past: 'Di che colore era quel giorno?' },
    hint: 'Intorno al cerchio cambia il colore. Verso il bordo diventa più intenso.',
    reveal: 'Rivela la settimana', preview: 'Guarda la settimana finora',
    captionFull: 'Sette giorni, un’opera sola.',
    caption: (n, e) => `${n} ${n === 1 ? 'colore' : 'colori'} e ${e === 1 ? 'un giorno di respiro' : e + ' giorni di respiro'}.`,
    captionExample: 'Una settimana di esempio. La tua comincia oggi.',
    tela0: 'Aspetta ancora il primo colore', tela: 'Ancora in movimento',
    of7: n => `${n} di 7`,
    todayIs: p => `Oggi: ${p.charAt(0).toLowerCase() + p.slice(1)}.`,
    todayEmpty: 'Oggi è un giorno di respiro.',
    pickToday: 'Scegli il colore di oggi', change: 'Cambia',
    dayLabel: (d, p, kind) => `${d}: ${kind === 'filled' ? p : kind === 'empty' ? 'giorno di respiro' : kind === 'todo' ? 'da scegliere' : 'ancora da venire'}`,
    today: 'Oggi', soundOn: 'Suono attivo', soundOff: 'Suono spento',
    phonesIdle: 'Meglio con le cuffie', phonesPlaying: 'Sta suonando una settimana di esempio',
    saved: 'Salvato', save: 'Salva lo sfondo', share: 'Salva nelle Foto',
    wallTitle: 'Sfondo Toneday',
    timeLocale: 'it-IT'
  }
}[LANG];

const PHRASES = {
  en: {
    red: ['A deep red, like embers still glowing', 'A vivid red, like a heartbeat you can feel', 'A warm pink, like cheeks in the sun'],
    orange: ['A burnt orange, like autumn leaves', 'A warm orange, like sunset over the sea', 'A soft peach, like light at seven in the morning'],
    yellow: ['A deep ochre, like honey in the dark', 'A full yellow, like a summer afternoon', 'A pale yellow, like sun on the curtains'],
    green: ['A deep green, like a forest at dusk', 'A quiet green, like grass after rain', 'A soft green, like the first leaves'],
    teal: ['A dark teal, like a pond in the shade', 'A clear turquoise, like water over rocks', 'A light aquamarine, like sea glass'],
    blue: ['A deep blue, like the sea at night', 'A calm blue, like the sky after rain', 'A light blue, like morning air'],
    violet: ['A night violet, like the hour before sleep', 'A suspended violet, like the sky at dusk', 'A soft lilac, like lavender in the light'],
    pink: ['A dark magenta, like wine in a glass', 'A bright pink, like bougainvillea in bloom', 'A powder pink, like clouds at dawn'],
    grey: ['A deep grey, like wet stone', 'A soft grey, like a foggy morning', 'A pearl grey, like a winter sky'],
    black: ['Almost black, like a moonless night']
  },
  it: {
    red: ['Un rosso scuro, come brace ancora accesa', 'Un rosso vivo, come un battito che si sente', 'Un rosa caldo, come guance al sole'],
    orange: ['Un arancio bruno, come foglie d’autunno', 'Un arancio caldo, come il tramonto sul mare', 'Un pesca tenue, come la luce delle sette'],
    yellow: ['Un ocra profondo, come miele al buio', 'Un giallo pieno, come un pomeriggio d’estate', 'Un giallo chiaro, come sole sulle tende'],
    green: ['Un verde fondo, come un bosco la sera', 'Un verde quieto, come erba dopo la pioggia', 'Un verde tenue, come le prime foglie'],
    teal: ['Un verde acqua scuro, come uno stagno in ombra', 'Un turchese limpido, come acqua sugli scogli', 'Un acquamarina leggero, come vetro di mare'],
    blue: ['Un blu profondo, come il mare di sera', 'Un blu calmo, come il cielo dopo la pioggia', 'Un azzurro leggero, come l’aria del mattino'],
    violet: ['Un viola notturno, come l’ora prima del sonno', 'Un viola sospeso, come il cielo al crepuscolo', 'Un lilla tenue, come lavanda nella luce'],
    pink: ['Un magenta scuro, come vino nel bicchiere', 'Un rosa acceso, come bouganville in fiore', 'Un rosa cipria, come nuvole all’alba'],
    grey: ['Un grigio fondo, come pietra bagnata', 'Un grigio morbido, come una mattina di nebbia', 'Un grigio perla, come un cielo d’inverno'],
    black: ['Quasi nero, come una notte senza luna']
  }
}[LANG];
function family(c) {
  if (c.l < .2) return 'black';
  if (c.s < .18) return 'grey';
  const h = c.h;
  if (h < 15 || h >= 345) return 'red'; if (h < 40) return 'orange'; if (h < 70) return 'yellow';
  if (h < 160) return 'green'; if (h < 195) return 'teal'; if (h < 250) return 'blue'; if (h < 300) return 'violet'; return 'pink';
}
function phrase(c) { const a = PHRASES[family(c)]; return a.length === 1 ? a[0] : a[c.l < .38 ? 0 : c.l < .62 ? 1 : 2]; }

/* ---------- Dates: weeks run Monday to Sunday ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function weekOf(d) {
  const day = startOfDay(d), dow = (day.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => new Date(day.getFullYear(), day.getMonth(), day.getDate() - dow + i));
}
const fmtLong = new Intl.DateTimeFormat(T.timeLocale, { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = new Intl.DateTimeFormat(T.timeLocale, { weekday: 'short' });
const fmtDayMonth = new Intl.DateTimeFormat(T.timeLocale, { day: 'numeric', month: 'long' });
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const longLabel = d => cap1(fmtLong.format(d));
const shortLabel = d => cap1(fmtShort.format(d).replace('.', '')).slice(0, 3);
function rangeLabel(days) {
  const a = days[0], b = days[6];
  try { return new Intl.DateTimeFormat(T.timeLocale, { day: 'numeric', month: 'long' }).formatRange(a, b); } catch (e) {}
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${fmtDayMonth.format(b)}`;
  return `${fmtDayMonth.format(a)} – ${fmtDayMonth.format(b)}`;
}

/* ---------- Storage: only in this browser ---------- */
const KEY = 'toneday.v1';
const Store = {
  data: { days: {}, sound: true, seen: false },
  load() {
    try { const raw = localStorage.getItem(KEY); if (raw) Object.assign(this.data, JSON.parse(raw)); } catch (e) {}
    if (!this.data.days || typeof this.data.days !== 'object') this.data.days = {};
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {} },
  get(key) { return Object.prototype.hasOwnProperty.call(this.data.days, key) ? this.data.days[key] : undefined; },
  set(key, tint) {
    this.data.days[key] = tint ? { h: +tint.h.toFixed(1), s: +tint.s.toFixed(3), l: +tint.l.toFixed(3), i: +tint.i.toFixed(3) } : null;
    this.save();
  },
  hasAny() { return Object.keys(this.data.days).length > 0; }
};
Store.load();

/* ---------- Example week ---------- */
const EXAMPLE = [
  { h: 212, s: .55, l: .42, i: .6 },
  { h: 228, s: .1, l: .36, i: .1 },
  { h: 336, s: .5, l: .62, i: .5 },
  { h: 140, s: .5, l: .44, i: .55 },
  { h: 24, s: .78, l: .55, i: .85 },
  { h: 276, s: .42, l: .38, i: .45 },
  { h: 48, s: .8, l: .66, i: .8 }
];

/* ---------- Sound design ----------
   One harmonic world for the whole week: D major 9 (D A F# C# E), voiced open from D2 upward.
   Every colour plays ONE tone of that chord, so any mix of days is consonant.
   Colour family = timbre and texture. Intensity = presence (filter and level). Light = register. */
const POOL = [73.42, 110, 146.83, 185, 220, 277.18, 329.63, 440, 554.37, 659.26];
function noteSlot(c) {
  const sat = clamp((c.s - .1) / .3, 0, 1);
  const light = clamp((c.l - .12) / .7, 0, 1) * 5.5;
  const warmth = Math.cos((c.h - 40) * Math.PI / 180) * sat;
  const ripple = Math.sin(c.h * Math.PI / 180 * 3) * .7 * sat;
  return clamp(Math.round(1.6 + light + warmth * 1.4 + ripple), 0, POOL.length - 1);
}
function weights(c) {
  const sat = clamp((c.s - .1) / .3, 0, 1);
  const fam = (center, width) => { const d = Math.abs(((c.h - center + 540) % 360) - 180); return d >= width ? 0 : Math.pow(Math.cos(d / width * Math.PI / 2), 2) * sat; };
  return {
    warm: fam(10, 55), yellow: fam(55, 35), green: fam(125, 60), blue: fam(205, 60), purple: fam(280, 50),
    grey: 1 - sat, dark: clamp((.4 - c.l) / .25, 0, 1), air: clamp((c.l - .62) / .2, 0, 1)
  };
}

const Sound = {
  ctx: null, master: null, wet: null, noise: null, on: true, drone: null,
  init() {
    if (this.ctx) { if (this.ctx.state !== 'running') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = this.ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 18; comp.ratio.value = 2.5; comp.attack.value = .02; comp.release.value = .4;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 9000; tone.Q.value = .5;
    this.master = ctx.createGain(); this.master.gain.value = this.on ? .7 : 0;
    this.master.connect(tone); tone.connect(comp); comp.connect(ctx.destination);
    // a large, dark room: pre-delay, long tail, damped highs
    this.wet = ctx.createGain(); this.wet.gain.value = .8;
    const pre = ctx.createDelay(.2); pre.delayTime.value = .035;
    const conv = ctx.createConvolver(); conv.buffer = this.impulse(6.5);
    const damp = ctx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 3800; damp.Q.value = .4;
    this.wet.connect(pre); pre.connect(conv); conv.connect(damp); damp.connect(this.master);
    // soft pink noise, normalised
    const len = ctx.sampleRate * 4, nb = ctx.createBuffer(1, len, ctx.sampleRate), d = nb.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, peak = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913;
      d[i] = b0 + b1 + b2 + w * .1848; peak = Math.max(peak, Math.abs(d[i]));
    }
    for (let i = 0; i < len; i++) d[i] = d[i] / peak * .5;
    this.noise = nb;
  },
  impulse(sec) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) { const x = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - x, 3.2) * Math.min(1, i / (ctx.sampleRate * .02)); }
    }
    return b;
  },
  panner(v) {
    const ctx = this.ctx;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = v; return p; }
    return ctx.createGain();
  },
  // the "home" underneath everything: a quiet D, barely there
  droneStart(level = .08, tc = 2) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    if (!this.drone) {
      const g = ctx.createGain(); g.gain.value = 0;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = .5;
      const dry = ctx.createGain(); dry.gain.value = .75; const snd = ctx.createGain(); snd.gain.value = .6;
      lp.connect(g); g.connect(dry); dry.connect(this.master); g.connect(snd); snd.connect(this.wet);
      [[73.42, 'sine', .55, -3], [73.42, 'sine', .55, 3], [110, 'sine', .28, 0], [146.83, 'triangle', .12, 0]].forEach(([f, type, a, det]) => {
        const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
        const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start();
      });
      const l = ctx.createOscillator(); l.frequency.value = .05; const ld = ctx.createGain(); ld.gain.value = 140;
      l.connect(ld); ld.connect(lp.frequency); l.start();
      this.drone = g;
    }
    this.drone.gain.cancelScheduledValues(t);
    this.drone.gain.setTargetAtTime(level, t, tc);
  },
  droneStop(tc = 1.5) { if (this.drone) { const t = this.ctx.currentTime; this.drone.gain.cancelScheduledValues(t); this.drone.gain.setTargetAtTime(0, t, tc); } },
  // a soft glass drop: same chord tone, higher up, with consonant partials only
  bell(f, panVal = 0, level = .1, decay = 4.5, lo = 520) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    while (f < lo) f *= 2;
    const g = ctx.createGain(); g.gain.value = 0;
    const p = this.panner(panVal); const dry = ctx.createGain(); dry.gain.value = .45; const snd = ctx.createGain(); snd.gain.value = .9;
    g.connect(p); p.connect(dry); dry.connect(this.master); p.connect(snd); snd.connect(this.wet);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
    [[1, 1], [2, .28], [3, .08]].forEach(([m, a]) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
      const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + decay + .2);
    });
    setTimeout(() => { try { g.disconnect(); p.disconnect(); } catch (e) {} }, (decay + .7) * 1000);
  },
  setOn(v) {
    this.on = v;
    document.querySelectorAll('.sound-toggle').forEach(b => { b.setAttribute('aria-pressed', String(v)); b.setAttribute('aria-label', v ? T.soundOn : T.soundOff); });
    if (this.master) this.master.gain.setTargetAtTime(v ? .7 : 0, this.ctx.currentTime, .3);
  }
};

class Voice {
  constructor(level = 1, panVal = 0) {
    const ctx = Sound.ctx; this.ctx = ctx; this.level = level; this.nodes = []; this.target = 0;
    this.layers = new Map(); this.slot = -1; this.timbre = { saw: 0, tri: 1, sin: 0, det: 4 };
    const N = n => { this.nodes.push(n); return n; };
    const G = v => { const g = N(ctx.createGain()); g.gain.value = v; return g; };
    const O = (type, f) => { const o = N(ctx.createOscillator()); o.type = type; o.frequency.value = f; return o; };
    const F = (type, f, q) => { const b = N(ctx.createBiquadFilter()); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    this.N = N; this.G = G; this.O = O;
    this.out = G(0); this.pan = N(Sound.panner(panVal)); this.dry = G(.6); this.send = G(.5);
    this.out.connect(this.pan); this.pan.connect(this.dry); this.dry.connect(Sound.master);
    this.pan.connect(this.send); this.send.connect(Sound.wet);
    // tone bus: note layers -> lowpass -> very slow pulse -> out
    this.bus = G(.2); this.filter = F('lowpass', 800, .6); this.trem = G(1);
    this.bus.connect(this.filter); this.filter.connect(this.trem); this.trem.connect(this.out);
    // textures from one noise source: wind, water, air
    const src = N(ctx.createBufferSource()); src.buffer = Sound.noise; src.loop = true;
    this.windF = F('bandpass', 650, 1.1); this.windG = G(0); src.connect(this.windF); this.windF.connect(this.windG); this.windG.connect(this.out);
    this.waterF = F('lowpass', 380, .4); this.waterG = G(0); src.connect(this.waterF); this.waterF.connect(this.waterG); this.waterG.connect(this.out);
    this.airF = F('highpass', 6000, .4); this.airG = G(0); src.connect(this.airF); this.airF.connect(this.airG); this.airG.connect(this.out);
    const lfo = (rate, depth, param) => { const o = O('sine', rate); const g = G(depth); o.connect(g); g.connect(param); return g; };
    lfo(.04 + Math.random() * .02, 160, this.filter.frequency);
    this.tremD = lfo(.22, 0, this.trem.gain);
    lfo(.09 + Math.random() * .05, 300, this.windF.frequency);
    this.waterD = lfo(.07 + Math.random() * .03, 0, this.waterG.gain);
    const t = ctx.currentTime;
    this.nodes.forEach(n => { if (n === src) n.start(t, Math.random() * 3); else if (n.start) n.start(t); });
  }
  setPan(v) { if (this.pan.pan) this.pan.pan.setTargetAtTime(v, this.ctx.currentTime, .3); }
  layer(slot) {
    if (this.layers.has(slot)) return this.layers.get(slot);
    const { G, O } = this, f = POOL[slot], t = this.ctx.currentTime, T = this.timbre;
    const g = G(0), sawG = G(T.saw), triG = G(T.tri), sinG = G(T.sin);
    sawG.connect(g); triG.connect(g); sinG.connect(g); g.connect(this.bus);
    const sa = O('sawtooth', f), sb = O('sawtooth', f), tr = O('triangle', f), si = O('sine', f);
    sa.detune.value = -T.det; sb.detune.value = T.det;
    sa.connect(sawG); sb.connect(sawG); tr.connect(triG); si.connect(sinG);
    [sa, sb, tr, si].forEach(o => o.start(t));
    const L = { g, sawG, triG, sinG, sa, sb };
    this.layers.set(slot, L); return L;
  }
  set(c, tc = .25) {
    const t = this.ctx.currentTime, w = weights(c), I = c.i, S = (p, v, k = tc) => p.setTargetAtTime(v, t, k);
    // timbre by colour family
    const saw = clamp(w.warm + w.purple * .9, 0, 1) * (1 - w.air * .8);
    const tri = clamp(w.yellow + w.green + w.blue * .5, 0, 1);
    const sin = clamp(w.blue * .6 + w.grey + w.dark * .6 + w.air, 0, 1);
    const n = saw + tri + sin || 1;
    this.timbre = { saw: saw / n * .42, tri: tri / n * .9, sin: sin / n * 1.1, det: 4 + w.purple * 6 };
    // register by light and hue: one chord tone, crossfaded, never glided
    const slot = noteSlot(c);
    if (slot !== this.slot) {
      this.layers.forEach((L, k) => { if (k !== slot) S(L.g.gain, 0, tc * 1.8); });
      this.slot = slot;
    }
    const cur = this.layer(slot);
    this.layers.forEach(L => {
      S(L.sawG.gain, this.timbre.saw); S(L.triG.gain, this.timbre.tri); S(L.sinG.gain, this.timbre.sin);
      S(L.sa.detune, -this.timbre.det); S(L.sb.detune, this.timbre.det);
    });
    S(cur.g.gain, 1, tc * 1.2);
    // presence by intensity
    S(this.filter.frequency, 320 + I * I * 2600 + w.yellow * 800 + w.air * 600);
    S(this.bus.gain, .2 + .14 * I);
    S(this.tremD.gain, w.warm * .08 * (.5 + I));
    S(this.windG.gain, w.green * (.04 + .14 * I));
    const wb = w.blue * (.05 + .14 * I); S(this.waterG.gain, wb); S(this.waterD.gain, wb * .8);
    S(this.airG.gain, w.air * .05 + w.yellow * .02 * I);
    S(this.send.gain, .5 + w.purple * .5 + w.blue * .25 + w.air * .25);
    this.target = (.45 + .55 * I) * this.level;
  }
  fade(mult = 1, tc = .2) { this.out.gain.setTargetAtTime(this.target * mult, this.ctx.currentTime, tc); }
  stop(tc = .8) {
    const t = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(t); this.out.gain.setTargetAtTime(0, t, tc);
    setTimeout(() => this.nodes.forEach(n => { try { n.stop && n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }), tc * 7000 + 200);
  }
}


/* ---------- Colour surface (daily check-in) ---------- */
const Ink = {
  cv: $('#ink'), ctx: null, parts: [], w: 0, h: 0, dpr: 1, cx: 0, cy: 0, R: 0,
  guide: .32, active: false, hasColor: false, color: null, vc: null, px: 0, py: 0, acc: 0, idle: 0, voice: null, lastFam: null,
  init() {
    this.ctx = this.cv.getContext('2d');
    const pos = e => { const r = this.cv.getBoundingClientRect(); return [(e.clientX - r.left) * this.dpr, (e.clientY - r.top) * this.dpr]; };
    this.cv.addEventListener('pointerdown', e => {
      Sound.init(); this.active = true;
      try { this.cv.setPointerCapture(e.pointerId); } catch (_) {}
      this.touch(...pos(e));
    });
    this.cv.addEventListener('pointermove', e => { if (this.active) this.touch(...pos(e)); });
    const up = () => { if (!this.active) return; this.active = false; if (this.voice) this.voice.fade(.4, .9); };
    this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', up);
    this.cv.addEventListener('keydown', e => {
      if (e.key === 'Enter') { if (this.hasColor) keepColor(); return; }
      const c = this.color || { h: 200, i: .5 }; let h = c.h, i = c.i;
      if (e.key === 'ArrowLeft') h -= 6; else if (e.key === 'ArrowRight') h += 6;
      else if (e.key === 'ArrowUp') i += .06; else if (e.key === 'ArrowDown') i -= .06; else return;
      e.preventDefault(); Sound.init();
      h = (h + 360) % 360; i = clamp(i, .02, 1);
      const rad = h * Math.PI / 180;
      this.touch(this.cx + Math.sin(rad) * this.R * i, this.cy - Math.cos(rad) * this.R * i);
    });
    $('#lightRange').addEventListener('input', () => {
      if (!this.hasColor) return;
      this.setColor({ ...this.color, l: +$('#lightRange').value / 100 });
      this.emit(this.px, this.py, 2);
    });
  },
  resize() {
    const r = this.cv.getBoundingClientRect(); if (!r.width) return;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = this.cv.width = Math.round(r.width * this.dpr); this.h = this.cv.height = Math.round(r.height * this.dpr);
    this.cx = this.w / 2; this.cy = this.h * .5; this.R = Math.min(this.w, this.h * .58) * .37;
  },
  reset(initial) {
    this.parts = []; this.hasColor = false; this.color = null; this.vc = null; this.guide = .32; this.active = false; this.lastFam = null;
    $('#lightRange').style.background = '';
    if (initial) {
      this.resize();
      const rad = initial.h * Math.PI / 180;
      this.px = this.cx + Math.sin(rad) * this.R * initial.i; this.py = this.cy - Math.cos(rad) * this.R * initial.i;
      this.setColor({ ...initial }, true);
      this.emit(this.px, this.py, 6);
    }
  },
  colorAt(x, y) {
    const dx = x - this.cx, dy = y - this.cy;
    let a = Math.atan2(dx, -dy) * 180 / Math.PI; if (a < 0) a += 360;
    const i = clamp(Math.hypot(dx, dy) / this.R, 0, 1);
    return { h: a, s: .06 + i * .84, l: +$('#lightRange').value / 100, i };
  },
  touch(x, y) { this.px = x; this.py = y; this.setColor(this.colorAt(x, y)); this.emit(x, y, 3); },
  setColor(c, silent) {
    this.color = c; this.hasColor = true; this.vc = visual(c);
    document.documentElement.style.setProperty('--chosen', hsl(this.vc));
    $('#ciSw').hidden = false;
    const p = phrase(c); if ($('#ciPhrase').textContent !== p) $('#ciPhrase').textContent = p;
    $('#keepBtn').disabled = false;
    $('#lightRange').style.background = `linear-gradient(90deg, hsl(${c.h},${c.s * 100}%,12%), hsl(${c.h},${c.s * 100}%,47%), hsl(${c.h},${c.s * 100}%,84%))`;
    if (silent) return;
    if (Sound.ctx && !this.voice) { this.voice = new Voice(1); Sound.droneStart(.09); }
    if (this.voice) {
      this.voice.setPan(Math.sin(c.h * Math.PI / 180) * .35);
      this.voice.set(c);
      if (this.active) this.voice.fade(1, .12);
      else { this.voice.fade(.85, .15); clearTimeout(this._lt); this._lt = setTimeout(() => this.voice && !this.active && this.voice.fade(.4, .9), 700); }
    }
    const fam = family(c); if (fam !== this.lastFam) { this.lastFam = fam; haptic(6); }
  },
  stopSound() { if (this.voice) { this.voice.stop(1); this.voice = null; } Sound.droneStop(); },
  emit(x, y, n) {
    if (!this.vc) return;
    const d = this.dpr, I = this.color.i, vc = this.vc;
    for (let k = 0; k < n; k++) this.parts.push({
      x: x + (Math.random() - .5) * 8 * d, y: y + (Math.random() - .5) * 8 * d,
      vx: (Math.random() - .5) * 34 * d, vy: (Math.random() - .5) * 34 * d,
      age: 0, life: 3 + Math.random() * 3.5,
      r0: (3 + Math.random() * 6) * d, r1: (30 + Math.random() * 70) * (.55 + I * .8) * d,
      a: .1 + .14 * I, h: vc.h + (Math.random() - .5) * 9, s: vc.s, l: clamp(vc.l + (Math.random() - .5) * .07, .18, .9)
    });
    if (this.parts.length > 280) this.parts.splice(0, this.parts.length - 280);
  },
  frame(t, dt) {
    const { ctx, w, h, cx, cy, R } = this, d = this.dpr;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0d14'; ctx.fillRect(0, 0, w, h);
    if (this.hasColor) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .7);
      g.addColorStop(0, hsl(this.vc, .16)); g.addColorStop(1, hsl(this.vc, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    this.guide = lerp(this.guide, this.active ? .1 : .3, .04);
    const segs = 96; ctx.lineWidth = 1.4 * d;
    for (let k = 0; k < segs; k++) {
      ctx.strokeStyle = `hsla(${k / segs * 360},68%,62%,${this.guide})`;
      ctx.beginPath(); ctx.arc(cx, cy, R, k / segs * TAU - Math.PI / 2, (k + 1) / segs * TAU - Math.PI / 2 + .01); ctx.stroke();
    }
    ctx.strokeStyle = `rgba(165,163,184,${this.guide * .35})`; ctx.lineWidth = d;
    ctx.beginPath(); ctx.arc(cx, cy, R * .33, 0, TAU); ctx.stroke();
    ctx.fillStyle = `rgba(235,232,242,${this.guide * 1.2})`; ctx.beginPath(); ctx.arc(cx, cy, 2.5 * d, 0, TAU); ctx.fill();

    if (this.active) { this.acc += dt; while (this.acc > .03) { this.acc -= .03; this.emit(this.px, this.py, 1); } }
    else if (this.hasColor) { this.idle += dt; if (this.idle > .22) { this.idle = 0; this.emit(this.px, this.py, 1); } }

    const flowK = reduceMotion ? .3 : 1, keep = [];
    for (const p of this.parts) {
      p.age += dt; const q = p.age / p.life; if (q >= 1) continue; keep.push(p);
      const ang = (Math.sin(p.x * .0035 / d + t * .13) + Math.cos(p.y * .004 / d - t * .11)) * Math.PI;
      p.vx += Math.cos(ang) * 16 * d * dt * flowK; p.vy += Math.sin(ang) * 16 * d * dt * flowK;
      p.vx *= .985; p.vy *= .985; p.x += p.vx * dt * flowK; p.y += p.vy * dt * flowK;
      const r = p.r0 + (p.r1 - p.r0) * (1 - Math.pow(1 - q, 3));
      const a = p.a * Math.pow(1 - q, 1.4) * Math.min(1, p.age / .25);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `hsla(${p.h},${p.s * 100}%,${p.l * 100}%,${a})`);
      g.addColorStop(.6, `hsla(${p.h},${p.s * 100}%,${p.l * 100}%,${a * .4})`);
      g.addColorStop(1, `hsla(${p.h},${p.s * 100}%,${p.l * 100}%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    }
    this.parts = keep;
    if (this.active) {
      ctx.strokeStyle = 'rgba(235,232,242,.55)'; ctx.lineWidth = 1.2 * d;
      ctx.beginPath(); ctx.arc(this.px, this.py, 15 * d, 0, TAU); ctx.stroke();
    }
  }
};

/* ---------- The weekly artwork ---------- */
class ArtRenderer {
  constructor(canvas, opts = {}) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.low = document.createElement('canvas'); this.lctx = this.low.getContext('2d');
    this.blurK = opts.blurK || .013; this.dpr = 1; this.w = 0; this.h = 0;
    this.blobs = []; this.drops = []; this.dropXY = []; this.mode = 'still';
    this.mergeE = 1; this.mergeStart = 0; this.mergeDur = 5; this.seed = opts.seed || 7; this.mixStart = -99; this.baseFill = '#0b0d14';
    const g = document.createElement('canvas'); g.width = g.height = 128;
    const gx = g.getContext('2d'), id = gx.createImageData(128, 128);
    for (let i = 0; i < 128 * 128; i++) { const v = Math.random() * 255 | 0; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    gx.putImageData(id, 0, 0); this.grain = this.ctx.createPattern(g, 'repeat');
  }
  resize(pxW, pxH) {
    if (pxW) { this.w = this.cv.width = pxW; this.h = this.cv.height = pxH; this.dpr = 1; }
    else {
      const r = this.cv.getBoundingClientRect(); if (!r.width) return;
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.w = this.cv.width = Math.round(r.width * this.dpr); this.h = this.cv.height = Math.round(r.height * this.dpr);
    }
    this.low.width = clamp(Math.round(this.w / 14), 40, 200); this.low.height = Math.max(40, Math.round(this.low.width * this.h / this.w));
  }
  newPath(rng) {
    return { cx: .2 + rng() * .6, cy: .15 + rng() * .7, ax: .1 + rng() * .22, ay: .1 + rng() * .22,
      fx: (.008 + rng() * .02) * (rng() < .5 ? -1 : 1), fy: .006 + rng() * .018, px: rng() * TAU, py: rng() * TAU, r: .26 + rng() * .2 };
  }
  setWeek(days) {
    const rng = mulberry32(this.seed);
    this.drops = days.map((c, i) => ({ i, c, appear: 1, appearAt: 0, voiced: false }));
    const pr = mulberry32(this.seed * 31 + 5), asp = (this.w || 1) / (this.h || 1);
    this.dropXY = [];
    for (let i = 0; i < 7; i++) {
      let best = null, bestD = -1;
      for (let k = 0; k < 40; k++) {
        const x = .16 + pr() * .68, y = .26 + pr() * .46;
        let dmin = 9; this.dropXY.forEach(([qx, qy]) => { dmin = Math.min(dmin, Math.hypot((x - qx) * asp, y - qy)); });
        if (dmin > bestD) { bestD = dmin; best = [x, y]; }
        if (dmin > .2) break;
      }
      this.dropXY.push(best);
    }
    this.blobs = [];
    days.forEach((c, i) => { if (c) this.blobs.push({ i, c, vc: { h: c.h, s: c.s, l: clamp(c.l, .16, .86) }, path: this.newPath(rng), prev: null, appear: 1, pulseAt: -99 }); });
    let r = 0, g = 0, b = 0; this.blobs.forEach(o => { const [R, G, B] = hslToRgb(o.vc.h, o.vc.s, o.vc.l); r += R; g += G; b += B; });
    const n = Math.max(1, this.blobs.length);
    this.baseFill = this.blobs.length ? `rgb(${11 * .6 + r / n * .28 | 0},${13 * .6 + g / n * .28 | 0},${20 * .6 + b / n * .28 | 0})` : '#141724';
  }
  pulse(i, t) { const b = this.blobs.find(o => o.i === i); if (b) b.pulseAt = t; }
  reseed(t) {
    this.seed = (this.seed * 9301 + 49297) % 233280 + 1;
    const rng = mulberry32(this.seed), k = this.mixE(t);
    this.blobs.forEach(b => { const [x, y, r] = this.flowPos(b, t, k); b.prev = { x, y, r }; b.path = this.newPath(rng); });
    this.mixStart = t;
  }
  mixE(t) { return ease(clamp((t - this.mixStart) / 3.5, 0, 1)); }
  pathPos(p, t) { const tt = reduceMotion ? t * .3 : t; return [p.cx + p.ax * Math.sin(tt * p.fx * TAU + p.px), p.cy + p.ay * Math.sin(tt * p.fy * TAU + p.py), p.r]; }
  flowPos(b, t, k) {
    const [x, y, r] = this.pathPos(b.path, t);
    if (!b.prev || k >= 1) return [x, y, r];
    return [lerp(b.prev.x, x, k), lerp(b.prev.y, y, k), lerp(b.prev.r, r, k)];
  }
  dropPos(i) { return this.dropXY[i] || [.5, .5]; }
  render(t) {
    const { ctx, w, h } = this, L = this.lctx, lw = this.low.width, lh = this.low.height, m = this.mergeE;
    if (!w) return;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
    ctx.fillStyle = '#0b0d14'; ctx.fillRect(0, 0, w, h);
    if (m > .001 && this.blobs.length) {
      L.fillStyle = this.baseFill; L.fillRect(0, 0, lw, lh);
      const mx = Math.sqrt(lw * lh) * 1.1, k = this.mixE(t);
      for (const b of this.blobs) {
        if (b.appear <= 0) continue;
        const [fx, fy, fr] = this.flowPos(b, t, k), [dx, dy] = this.dropPos(b.i);
        const x = lerp(dx, fx, m) * lw, y = lerp(dy, fy, m) * lh;
        const pu = Math.exp(-(t - b.pulseAt) * 1.3);
        const r = Math.max(1, lerp(.03, fr * (1 + .05 * Math.sin(t * .22 + b.i * 1.7) + .07 * pu), m) * mx);
        const vc = { h: b.vc.h, s: b.vc.s, l: Math.min(.92, b.vc.l + .1 * pu) };
        const g = L.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, hsl(vc, .9 * b.appear)); g.addColorStop(.45, hsl(vc, .5 * b.appear)); g.addColorStop(1, hsl(vc, 0));
        L.fillStyle = g; L.beginPath(); L.arc(x, y, r, 0, TAU); L.fill();
      }
      ctx.globalAlpha = m; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.filter = `blur(${Math.round(Math.max(w, h) * this.blurK)}px)`;
      const pad = Math.max(w, h) * .04; ctx.drawImage(this.low, -pad, -pad, w + pad * 2, h + pad * 2);
      ctx.filter = 'none'; ctx.globalAlpha = 1;
    } else if (!this.blobs.length) {
      ctx.fillStyle = this.baseFill; ctx.fillRect(0, 0, w, h);
    }
    if (m < .999) {
      const dpr = this.dpr, R = Math.min(26, (w / dpr) * .045) * dpr;
      for (const d of this.drops) {
        const [px, py] = this.dropPos(d.i), x = px * w, y = py * h, fade = 1 - m;
        if (d.appear <= 0) {
          const FALL = reduceMotion ? .01 : .6, ft = (t - (d.appearAt - FALL)) / FALL;
          if (d.c && ft > 0 && ft < 1) {
            const fy = lerp(y - h * .32, y, ft * ft), vc = visual(d.c);
            ctx.fillStyle = hsl(vc, Math.min(1, ft * 2));
            ctx.beginPath(); ctx.ellipse(x, fy, 3.2 * dpr, (5 + ft * 7) * dpr, 0, 0, TAU); ctx.fill();
          }
          continue;
        }
        if (d.c) {
          const vc = visual(d.c), r = R * easeOutBack(d.appear) * (1 + m * 1.5), age = t - d.appearAt;
          for (let k = 0; k < 3; k++) {
            const a = age - k * .35; if (a <= 0 || a > 2.6) continue;
            ctx.strokeStyle = hsl(vc, (1 - a / 2.6) * .45 * fade); ctx.lineWidth = 1.2 * dpr;
            ctx.beginPath(); ctx.arc(x, y, R + a * 46 * dpr, 0, TAU); ctx.stroke();
          }
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
          g.addColorStop(0, hsl(vc, fade)); g.addColorStop(.62, hsl(vc, .9 * fade)); g.addColorStop(1, hsl(vc, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
        } else {
          ctx.setLineDash([4 * dpr, 5 * dpr]); ctx.strokeStyle = `rgba(165,163,184,${.6 * d.appear * fade})`; ctx.lineWidth = 1.4 * dpr;
          ctx.beginPath(); ctx.arc(x, y, R * .9, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07;
    ctx.fillStyle = this.grain; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
}

/* ---------- The melody of the week ----------
   After the full chord, the days sing in order, Monday to Sunday. Then the phrase returns varied.
   Empty days are rests. Every note makes its colour glow. */
const Melody = {
  active: false, queue: [], phrase: 0, next: 0, days: [],
  start(days, t0) { this.days = days; this.active = true; this.queue = []; this.phrase = 0; this.next = t0; this.fill(); },
  stop() { this.active = false; this.queue = []; $$('.melody span').forEach(s => s.classList.remove('on')); },
  fill() {
    const beat = .62, p = this.phrase;
    let order = this.days.map((c, i) => ({ c, i }));
    if (p % 4 === 1) order = order.slice().reverse();
    if (p % 4 === 3) order = order.filter((_, k) => k % 2 === 0).concat(order.filter((_, k) => k % 2 === 1));
    const rhythms = [[1, 1, 2, 1, 1, 1, 3], [1.5, .5, 1, 1, 2, 1, 3], [2, 1, 1, 2, 1, 1, 4], [1, 1, 1, 1, 2, 2, 4]];
    const rh = rhythms[p % rhythms.length];
    let tt = this.next;
    order.forEach((d, k) => {
      if (d.c && !(p > 3 && Math.random() < .12)) {
        let f = POOL[noteSlot(d.c)]; while (f < 330) f *= 2; while (f >= 660) f /= 2;
        if (p % 4 === 2 && k % 3 === 1) f *= 2;
        this.queue.push({ time: tt, i: d.i, c: d.c, f, last: k === order.length - 1 });
      }
      tt += rh[k] * beat;
    });
    this.next = tt + beat * (p % 2 ? 4 : 2);
    this.phrase++;
  },
  update(t) {
    if (!this.active) return;
    while (this.queue.length && this.queue[0].time <= t) {
      const n = this.queue.shift(), pn = (n.i - 3) / 3 * .6;
      Sound.bell(n.f, pn, (.05 + .05 * n.c.i) * (n.last ? 1.2 : 1), n.last ? 5 : 3.4, 0);
      stageArt.pulse(n.i, t);
      const dots = $$('.melody span'); dots.forEach((s, k) => s.classList.toggle('on', k === n.i));
      if (dots[n.i]) FX.note(dots[n.i]);
    }
    if (!this.queue.length && t >= this.next - .05) this.fill();
  }
};


/* ---------- Motion layer (motion.dev). Off for "reduce motion" or if the library is missing. ---------- */
const M = window.Motion;
const FX = {
  on: !!(M && M.animate) && !reduceMotion,
  ease: [.22, 1, .36, 1],
  heroPrepared: false,
  init() {
    if (!this.on) return;
    document.documentElement.classList.add('fx');
    // split the hero title into letters and the lede into words
    const h1 = $('.hero h1');
    if (h1 && !h1.dataset.split) {
      const txt = h1.textContent; h1.dataset.split = '1'; h1.setAttribute('aria-label', txt);
      h1.innerHTML = Array.from(txt).map(ch => `<span class="ch" aria-hidden="true">${ch}</span>`).join('');
    }
    const lede = $('.hero .lede');
    if (lede && !lede.dataset.split) {
      lede.dataset.split = '1';
      lede.innerHTML = lede.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
    }
    // scroll: the hero settles and dims as you leave it
    const hero = $('.hero');
    const dim = document.createElement('div');
    dim.setAttribute('aria-hidden', 'true');
    dim.style.cssText = 'position:absolute;inset:0;background:#0b0d14;opacity:0;pointer-events:none';
    hero.prepend(dim);
    try {
      M.scroll(M.animate(dim, { opacity: [0, .8] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
      M.scroll(M.animate('.hero-copy', { y: [0, -70], opacity: [1, .2] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
    } catch (e) {}
    // sections of "how it works" rise gently into view
    $$('.about-inner > section').forEach(sec => {
      const items = sec.querySelectorAll('h2, .intro p, .steps li, .principles > div, .faq details, .cta-band .hero-actions');
      const dots = sec.querySelectorAll('.swatch-row span');
      M.animate(items, { opacity: 0, y: 26 }, { duration: 0 });
      if (dots.length) M.animate(dots, { opacity: 0, scale: .3 }, { duration: 0 });
      M.inView(sec, () => {
        M.animate(items, { opacity: 1, y: 0 }, { duration: .9, ease: this.ease, delay: M.stagger(.07) });
        if (dots.length) M.animate(dots, { opacity: 1, scale: 1 }, { type: 'spring', stiffness: 260, damping: 14, delay: M.stagger(.06, { startDelay: .5 }) });
      }, { amount: .15 });
    });
    // buttons answer the touch with a small spring
    try {
      M.press('.btn, .icon-btn, .drop', el => {
        M.animate(el, { scale: .95 }, { type: 'spring', stiffness: 600, damping: 30 });
        return () => M.animate(el, { scale: 1 }, { type: 'spring', stiffness: 380, damping: 14 });
      });
    } catch (e) {}
  },
  prepHero() {
    if (!this.on) return;
    M.animate('.hero .ch', { opacity: 0, y: 22, filter: 'blur(14px)' }, { duration: 0 });
    M.animate('.hero .w, .hero .eyebrow, .hero .hero-actions, .topbar', { opacity: 0, y: 12 }, { duration: 0 });
    this.heroPrepared = true;
  },
  heroIn(delay = 0) {
    if (!this.on) return;
    if (!this.heroPrepared) this.prepHero();
    this.heroPrepared = false;
    M.animate('.hero .eyebrow', { opacity: 1, y: 0 }, { duration: .9, ease: this.ease, delay });
    M.animate('.hero .ch', { opacity: 1, y: 0, filter: 'blur(0px)' }, { duration: 1.3, ease: this.ease, delay: M.stagger(.07, { startDelay: delay + .15 }) });
    M.animate('.hero .w', { opacity: 1, y: 0 }, { duration: .8, ease: this.ease, delay: M.stagger(.03, { startDelay: delay + .75 }) });
    M.animate('.hero .hero-actions', { opacity: 1, y: 0 }, { duration: .8, ease: this.ease, delay: M.stagger(.12, { startDelay: delay + 1.25 }) });
    M.animate('.topbar', { opacity: 1, y: 0 }, { duration: 1, ease: this.ease, delay: delay + 1.5 });
  },
  screenIn(el) {
    return M.animate(el, { opacity: [0, 1], filter: ['blur(16px)', 'blur(0px)'], scale: [1.02, 1] }, { duration: .8, ease: this.ease })
      .then(() => { el.style.filter = ''; el.style.transform = ''; });
  },
  screenOut(els) {
    return M.animate(els, { opacity: [1, 0], filter: ['blur(0px)', 'blur(10px)'] }, { duration: .5, ease: [.4, 0, 1, 1] });
  },
  checkinIn() {
    if (!this.on) return;
    M.animate('#checkin .top > div:first-child > *', { opacity: [0, 1], y: [14, 0] }, { duration: .8, ease: this.ease, delay: M.stagger(.09, { startDelay: .25 }) });
    M.animate('#checkin .bottom > *', { opacity: [0, 1], y: [18, 0] }, { duration: .8, ease: this.ease, delay: M.stagger(.09, { startDelay: .45 }) });
  },
  weekIn(skip) {
    if (!this.on) return;
    M.animate('.week-inner > *:not(.drops)', { opacity: [0, 1], y: [16, 0] }, { duration: .8, ease: this.ease, delay: M.stagger(.06, { startDelay: .1 }) });
    const dots = $$('#drops .dot').filter(d => d !== skip);
    M.animate(dots, { scale: [.4, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 260, damping: 16, delay: M.stagger(.05, { startDelay: .25 }) });
  },
  revealUi() {
    if (!this.on) return;
    M.animate('#revActions .btn', { opacity: [0, 1], y: [14, 0] }, { duration: .8, ease: this.ease, delay: M.stagger(.1) });
    M.animate('#melodyRow', { opacity: [0, 1] }, { duration: 1.2, ease: this.ease });
  },
  note(span) {
    if (!this.on) return;
    M.animate(span, { scale: [1, 2.1, 1.25] }, { duration: .9, ease: this.ease });
  },
  /* the chosen colour lifts off the surface and lands in its day */
  fly(tint, fromX, fromY, key, onLand) {
    const dot = document.querySelector(`.drop[data-key="${key}"] .dot`);
    if (!this.on || !dot) { onLand(); return null; }
    dot.style.opacity = '0';
    const vc = hsl(visual(tint)), S = 72;
    const fl = document.createElement('div');
    fl.setAttribute('aria-hidden', 'true');
    fl.style.cssText = `position:fixed;left:0;top:0;width:${S}px;height:${S}px;border-radius:50%;z-index:40;pointer-events:none;background:radial-gradient(circle at 40% 38%, ${hsl({ ...visual(tint), l: Math.min(.9, visual(tint).l + .12) })}, ${vc} 62%);box-shadow:0 0 40px ${vc}, 0 0 90px -10px ${vc};`;
    document.body.append(fl);
    M.animate(fl, { x: fromX - S / 2, y: fromY - S / 2, scale: .2, opacity: 0 }, { duration: 0 });
    // let the week settle in for a moment, then fly
    setTimeout(() => {
      const r = dot.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;
      const mx = (fromX + tx) / 2 + (tx > fromX ? -40 : 40), my = Math.min(fromY, ty) - 90;
      M.animate(fl, {
        x: [fromX - S / 2, mx - S / 2, tx - S / 2],
        y: [fromY - S / 2, my - S / 2, ty - S / 2],
        scale: [.3, 1.1, r.width / S],
        opacity: [1, 1, 1]
      }, { duration: 1.15, ease: [.45, 0, .2, 1], times: [0, .45, 1] }).then(() => {
        fl.remove();
        dot.style.opacity = '';
        M.animate(dot, { scale: [1.45, 1] }, { type: 'spring', stiffness: 320, damping: 11 });
        const ring = document.createElement('div');
        ring.setAttribute('aria-hidden', 'true');
        ring.style.cssText = `position:fixed;left:${tx - r.width / 2}px;top:${ty - r.height / 2}px;width:${r.width}px;height:${r.height}px;border-radius:50%;border:1.5px solid ${vc};pointer-events:none;z-index:40`;
        document.body.append(ring);
        M.animate(ring, { scale: [1, 2.6], opacity: [.8, 0] }, { duration: 1.4, ease: this.ease }).then(() => ring.remove());
        onLand();
      });
    }, 380);
    return fl;
  }
};

/* ---------- Screens and flow ---------- */
const stageArt = new ArtRenderer($('#stage'));
const telaArt = new ArtRenderer($('#telaCv'), { blurK: .02 });
let current = 'landing', ciKey = null, revealVoices = [], revealDone = false, revealSource = 'mine', revealTints = [];
let introVoices = [], introTimers = [], heroVisible = true;
const today = () => startOfDay(new Date());
const thisWeek = () => weekOf(new Date());
const weekTints = () => thisWeek().map(d => { const v = Store.get(ymd(d)); return v ? v : null; });

const SCREENS = { landing: '#landing', checkin: '#checkin', week: '#week', reveal: '#reveal' };
const needsStage = n => n === 'landing' || n === 'reveal';
let pendingOuts = [], flyKey = null;
function go(name, push = true) {
  if (name === current) return;
  if (current === 'landing') stopIntroSound();
  if (current === 'checkin') Ink.stopSound();
  if (current === 'reveal') { revealVoices.forEach(v => v.stop(1.2)); revealVoices = []; Sound.droneStop(); Melody.stop(); $('#wall').hidden = true; }
  pendingOuts.forEach(f => f()); pendingOuts = [];
  const from = current; current = name;
  const fromEl = $(SCREENS[from]), toEl = $(SCREENS[name]), stage = $('#stage');
  toEl.hidden = false; toEl.style.opacity = ''; toEl.style.filter = '';
  if (needsStage(name)) { stage.hidden = false; stage.style.opacity = ''; stage.style.filter = ''; }
  if (name === 'landing') { document.body.classList.remove('locked'); stageArt.mode = 'still'; stageArt.mergeE = 1; stageArt.setWeek(EXAMPLE); window.scrollTo(0, 0); }
  const outs = [fromEl];
  if (needsStage(from) && !needsStage(name)) outs.push(stage);
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    outs.forEach(el => {
      el.style.opacity = ''; el.style.filter = ''; el.style.transform = '';
      if (el === stage) { if (!needsStage(current)) el.hidden = true; }
      else if (el !== $(SCREENS[current])) el.hidden = true;
    });
    if (current !== 'landing') document.body.classList.add('locked');
  };
  if (FX.on) {
    FX.screenIn(toEl);
    if (needsStage(name) && !needsStage(from)) M.animate(stage, { opacity: [0, 1] }, { duration: .8 });
    const out = FX.screenOut(outs);
    out.then(finish);
    pendingOuts.push(() => { try { out.stop(); } catch (e) {} finish(); });
    if (name === 'landing') FX.heroIn(.25);
    if (name === 'checkin') FX.checkinIn();
    if (name === 'week') FX.weekIn(flyKey ? document.querySelector(`.drop[data-key="${flyKey}"] .dot`) : null);
  } else finish();
  if (push) { try { history.pushState({ screen: name }, ''); } catch (e) {} }
  requestAnimationFrame(() => { stageArt.resize(); Ink.resize(); telaArt.resize(); if (name === 'landing') stageArt.setWeek(EXAMPLE); });
}
addEventListener('popstate', e => {
  const s = (e.state && e.state.screen) || (Store.hasAny() ? 'week' : 'landing');
  if (s === 'week') renderWeek();
  go(s, false);
});

/* Welcome sound: the example week sings, one drop at a time */
function startIntroSound() {
  Sound.init(); if (!Sound.ctx || introVoices.length || !Sound.on) return;
  Sound.droneStart(.07, 2.5);
  $('#phones').classList.remove('muted'); $('#phonesText').textContent = T.phonesPlaying;
  EXAMPLE.forEach((c, i) => {
    const pn = (i - 3) / 3 * .6;
    introTimers.push(setTimeout(() => {
      if (current !== 'landing') return;
      const v = new Voice(.2, pn); v.set(c, .01); v.fade(1, 1.4); introVoices.push(v);
      Sound.bell(POOL[noteSlot(c)], pn, .06);
      stageArt.pulse(i, now());
    }, 600 + i * 750));
  });
}
function stopIntroSound() {
  introTimers.forEach(clearTimeout); introTimers = [];
  introVoices.forEach(v => v.stop(1)); introVoices = []; Sound.droneStop();
  $('#phones').classList.add('muted'); $('#phonesText').textContent = T.phonesIdle;
}

/* Check-in */
function openCheckin(date) {
  Sound.init();
  ciKey = ymd(date);
  const isToday = ciKey === ymd(today());
  $('#ciDay').textContent = longLabel(date);
  $('#ciQuestion').textContent = isToday ? T.question.today : T.question.past;
  $('#ciPhrase').textContent = T.hint;
  $('#ciSw').hidden = true; $('#keepBtn').disabled = true;
  const prev = Store.get(ciKey);
  $('#lightRange').value = prev ? Math.round(prev.l * 100) : 50;
  go('checkin');
  requestAnimationFrame(() => { Ink.resize(); Ink.reset(prev || null); });
  setTimeout(() => Ink.cv.focus({ preventScroll: true }), 80);
}
function keepColor() {
  if (!Ink.hasColor || !ciKey) return;
  const tint = { ...Ink.color }, key = ciKey;
  Store.set(key, tint);
  haptic(12); track('color_kept');
  const fx = Ink.px / Ink.dpr, fy = Ink.py / Ink.dpr;
  renderWeek();
  flyKey = FX.on ? key : null;
  go('week');
  flyKey = null;
  FX.fly(tint, fx, fy, key, () => { Sound.bell(POOL[noteSlot(tint)], 0, .09); haptic(10); });
}
function leaveEmpty() {
  if (!ciKey) return;
  Store.set(ciKey, null); track('day_left_empty');
  renderWeek(); go('week');
}

/* Week */
function renderWeek() {
  const days = thisWeek(), t0 = ymd(today()), tints = weekTints();
  $('#weekRange').textContent = rangeLabel(days);
  const ol = $('#drops'); ol.innerHTML = '';
  days.forEach((d, i) => {
    const key = ymd(d), v = Store.get(key), isToday = key === t0, future = key > t0;
    const kind = future ? 'future' : v ? 'filled' : v === null ? 'empty' : 'todo';
    const li = document.createElement('li'), b = document.createElement('button');
    b.className = `drop ${kind}${isToday ? ' today' : ''}`;
    b.dataset.key = key;
    b.disabled = future;
    if (v) b.style.setProperty('--c', hsl(visual(v)));
    b.setAttribute('aria-label', T.dayLabel(longLabel(d), v ? phrase(v) : '', kind));
    const dot = document.createElement('span'); dot.className = 'dot'; dot.setAttribute('aria-hidden', 'true');
    const lab = document.createElement('span'); lab.textContent = isToday ? T.today : shortLabel(d);
    b.append(dot, lab);
    b.addEventListener('click', () => openCheckin(d));
    li.append(b); ol.append(li);
  });
  const n = tints.filter(Boolean).length;
  $('#telaText').textContent = n ? T.tela : T.tela0;
  $('#telaCount').textContent = T.of7(n);
  telaArt.setWeek(tints);
  const tv = Store.get(t0);
  $('#todayText').textContent = tv ? T.todayIs(phrase(tv)) : tv === null ? T.todayEmpty : '';
  $('#todayBtn').textContent = tv === undefined ? T.pickToday : T.change;
  $('#todayBtn').classList.toggle('primary', tv === undefined);
  const sunday = new Date().getDay() === 0;
  $('#revealBtn').textContent = sunday || n === 7 ? T.reveal : T.preview;
  $('#revealBtn').disabled = n === 0;
  $('#revealBtn').classList.toggle('primary', tv !== undefined);
}

/* Reveal */
function startReveal(source) {
  Sound.init();
  revealSource = source;
  revealTints = source === 'example' ? EXAMPLE.slice() : weekTints();
  go('reveal');
  stageArt.resize();
  const t = now(), step = reduceMotion ? .5 : 1.25;
  stageArt.setWeek(revealTints); stageArt.mode = 'reveal'; stageArt.mergeE = 0; stageArt.mixStart = -99;
  stageArt.drops.forEach((d, i) => { d.appear = 0; d.voiced = false; d.appearAt = t + .7 + i * step; });
  stageArt.blobs.forEach(b => b.appear = 0);
  stageArt.mergeStart = t + .7 + 7 * step + .4; stageArt.mergeDur = reduceMotion ? 1.5 : 5;
  Sound.droneStart(.07, 2.5); Melody.stop();
  revealDone = false;
  $('#revRange').textContent = rangeLabel(thisWeek());
  $('#revCaption').classList.remove('on'); $('#revCaption').textContent = '';
  const mel = $('#melody'); mel.innerHTML = '';
  revealTints.forEach(c => { const s = document.createElement('span'); if (c) s.style.setProperty('--c', hsl(visual(c))); mel.append(s); });
  $('#melodyRow').hidden = true;
  $('#revActions').hidden = true; $('#skipReveal').hidden = false; $('#reveal').classList.remove('ui-off');
  $('#wallBtn').hidden = source === 'example';
  track(source === 'example' ? 'example_week' : 'reveal_started');
}
function updateReveal(t) {
  stageArt.drops.forEach(d => {
    d.appear = clamp((t - d.appearAt) / .9, 0, 1);
    if (d.appear > 0 && !d.voiced) {
      d.voiced = true;
      if (d.c) {
        haptic(8);
        if (Sound.ctx) { const pn = (d.i - 3) / 3 * .6, v = new Voice(.3, pn); v.set(d.c, .01); v.fade(1, .9); revealVoices.push(v); Sound.bell(POOL[noteSlot(d.c)], pn, .09); }
      }
    }
  });
  stageArt.blobs.forEach(b => b.appear = stageArt.drops[b.i].appear);
  stageArt.mergeE = ease(clamp((t - stageArt.mergeStart) / stageArt.mergeDur, 0, 1));
  if (!revealDone && stageArt.mergeE >= 1) {
    revealDone = true;
    const n = revealTints.filter(Boolean).length, e = 7 - n;
    $('#revCaption').textContent = revealSource === 'example' ? T.captionExample : e === 0 ? T.captionFull : T.caption(n, e);
    $('#revCaption').classList.add('on');
    $('#skipReveal').hidden = true; $('#revActions').hidden = false; $('#melodyRow').hidden = false;
    FX.revealUi();
    Melody.start(revealTints, t + 1.6); revealVoices.forEach(v => v.fade(.72, 3));
  }
}

/* Wallpaper: rendered at the screen's real resolution */
function openWall() {
  $('#wall').hidden = false;
  { const d = new Date(), h = LANG === 'en' ? (d.getHours() % 12 || 12) : d.getHours(); $('#lockTime').textContent = `${h}:${pad(d.getMinutes())}`; }
  try { $('#lockDate').textContent = longLabel(new Date()); } catch (e) {}
  const pc = $('#phoneCv'), r = pc.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  pc.width = Math.round(r.width * d); pc.height = Math.round(r.height * d);
  $('#saveWall').textContent = navigator.canShare ? T.share : T.save;
  $('#saveWall').focus();
}
function drawPhone() {
  const pc = $('#phoneCv'), px = pc.getContext('2d');
  const sw = stageArt.cv.width, sh = stageArt.cv.height, a = pc.width / pc.height;
  let cw = sh * a, ch = sh; if (cw > sw) { cw = sw; ch = sw / a; }
  px.drawImage(stageArt.cv, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, pc.width, pc.height);
}
async function saveWall() {
  const dpr = Math.min(devicePixelRatio || 1, 3);
  let W = Math.round(screen.width * dpr), H = Math.round(screen.height * dpr);
  if (W > H) [W, H] = [H, W];
  if (W < 1080) { H = Math.round(H * 1080 / W); W = 1080; }
  if (H > 3200) { W = Math.round(W * 3200 / H); H = 3200; }
  const cv = document.createElement('canvas');
  const art = new ArtRenderer(cv, { seed: stageArt.seed });
  art.resize(W, H); art.setWeek(revealTints); art.mergeE = 1;
  art.blobs.forEach(b => { const s = stageArt.blobs.find(o => o.i === b.i); if (s) { b.path = s.path; b.prev = s.prev; } });
  art.mixStart = stageArt.mixStart;
  art.render(now());
  const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
  if (!blob) return;
  const name = `toneday-${ymd(thisWeek()[0])}.png`;
  const file = new File([blob], name, { type: 'image/png' });
  track('wallpaper_saved');
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: T.wallTitle }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  $('#saveWall').textContent = T.saved;
}

/* ---------- Wiring ---------- */
Ink.init();
Sound.on = Store.data.sound !== false;
document.querySelectorAll('.sound-toggle').forEach(b => {
  b.setAttribute('aria-pressed', String(Sound.on));
  b.setAttribute('aria-label', Sound.on ? T.soundOn : T.soundOff);
  b.addEventListener('click', () => {
    Sound.init(); Sound.setOn(!Sound.on); Store.data.sound = Sound.on; Store.save();
    if (current === 'landing') { if (Sound.on) startIntroSound(); else stopIntroSound(); }
  });
});
$$('[data-start]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openCheckin(today()); }));
$$('[data-example]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); startReveal('example'); }));
$$('[data-home]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); go('landing'); }));
$('#keepBtn').addEventListener('click', keepColor);
$('#skipBtn').addEventListener('click', leaveEmpty);
$('#closeCheckin').addEventListener('click', () => { renderWeek(); go(Store.hasAny() ? 'week' : 'landing'); });
$('#todayBtn').addEventListener('click', () => openCheckin(today()));
$('#revealBtn').addEventListener('click', () => startReveal('mine'));
$('#skipReveal').addEventListener('click', () => {
  const t = now(); stageArt.drops.forEach((d, i) => { if (t < d.appearAt) d.appearAt = t - .9 + i * .04; });
  stageArt.mergeStart = Math.min(stageArt.mergeStart, t); stageArt.mergeDur = 1.4;
});
$('#reshapeBtn').addEventListener('click', () => {
  stageArt.reseed(now());
  revealTints.forEach((c, i) => { if (c) setTimeout(() => Sound.bell(POOL[noteSlot(c)], (i - 3) / 3 * .6, .045), i * 140); });
});
$('#backBtn').addEventListener('click', () => { if (revealSource === 'example' && !Store.hasAny()) go('landing'); else { renderWeek(); go('week'); } });
$('#tapzone').addEventListener('click', () => { if (revealDone) $('#reveal').classList.toggle('ui-off'); });
$('#wallBtn').addEventListener('click', openWall);
$('#saveWall').addEventListener('click', saveWall);
$('#wallClose').addEventListener('click', () => { $('#wall').hidden = true; $('#wallBtn').focus(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#wall').hidden) { $('#wall').hidden = true; } });
addEventListener('resize', () => { stageArt.resize(); Ink.resize(); telaArt.resize(); });

/* First visit: the listening veil. Returning with colors: straight to the week. */
const listen = $('#listen');
function closeVeil(withSound) {
  Store.data.seen = true; Store.save();
  if (withSound) { Sound.init(); startIntroSound(); track('listen'); }
  else { Sound.setOn(false); Store.data.sound = false; Store.save(); $$('.sound-toggle').forEach(b => b.setAttribute('aria-pressed', 'false')); }
  FX.heroIn(.5);
  listen.classList.add('gone');
  setTimeout(() => { listen.hidden = true; }, reduceMotion ? 0 : 1700);
}
listen.addEventListener('click', e => { if (e.target.closest('#listenSkip')) return; closeVeil(true); });
$('#listenSkip').addEventListener('click', e => { e.stopPropagation(); closeVeil(false); });
// any first tap on the landing wakes the sound for visitors who skipped the veil this session
$('#landing').addEventListener('pointerdown', () => { if (current === 'landing' && Sound.on && !introVoices.length && listen.hidden) startIntroSound(); }, { once: true });

stageArt.resize(); Ink.resize(); telaArt.resize();
stageArt.setWeek(EXAMPLE);
renderWeek();
FX.init();
try { history.replaceState({ screen: 'landing' }, ''); } catch (e) {}
if (Store.hasAny() && location.hash !== '#about') { go('week'); }
else if (!Store.data.seen) { FX.prepHero(); listen.hidden = false; setTimeout(() => $('#listenGo').focus({ preventScroll: true }), 50); }
else FX.heroIn(.1);

// pause the hero animation when it scrolls away
try { new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }).observe($('.hero')); } catch (e) {}

let last = performance.now();
function loop(ms) {
  const dt = Math.min(.05, (ms - last) / 1000); last = ms; const t = ms / 1000;
  if (current === 'landing') { if (heroVisible) stageArt.render(t); }
  else if (current === 'reveal') { updateReveal(t); Melody.update(t); stageArt.render(t); if (!$('#wall').hidden) drawPhone(); }
  else if (current === 'checkin') Ink.frame(t, dt);
  else if (current === 'week') telaArt.render(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
})();
