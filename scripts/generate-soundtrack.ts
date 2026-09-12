/**
 * Custom Motion Ad Soundtrack & SFX Generator (Unbroken 120 BPM Groove)
 * Synthesizes a broadcast-quality 48kHz Stereo WAV file with an unrelenting,
 * infectious 120 BPM drum & bass groove, driving melodic synth plucks, and
 * tailored sound design locked to every cut.
 */
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 48000;
const FPS = 30;
const TOTAL_FRAMES = 332;
const TOTAL_SAMPLES = Math.floor((TOTAL_FRAMES / FPS) * SAMPLE_RATE); // 531,200 samples (~11.067s)

// 120 BPM timing constants
// 1 beat = 0.500s = 24,000 samples = exactly 15 frames @ 30fps
const SAMPLES_PER_BEAT = 24000;
const SAMPLES_PER_8TH = 12000;
const SAMPLES_PER_16TH = 6000;
const SAMPLES_PER_32ND = 3000;

// Stereo audio buffers
const leftChannel = new Float32Array(TOTAL_SAMPLES);
const rightChannel = new Float32Array(TOTAL_SAMPLES);

// Frame to sample converter
const frameToSample = (frame: number) => Math.floor((frame / FPS) * SAMPLE_RATE);
const secToSamples = (sec: number) => Math.floor(sec * SAMPLE_RATE);

// Safe mix into stereo buffer
function mixSample(index: number, left: number, right: number) {
  if (index >= 0 && index < TOTAL_SAMPLES) {
    leftChannel[index] += left;
    rightChannel[index] += right;
  }
}

// ---------------------------------------------------------
// SYNTHESIS INSTRUMENTS
// ---------------------------------------------------------

/** Tight, Punchy Electro Kick with Deep Chest Thud */
function addKick(startSample: number, pitchStart = 165, pitchEnd = 45, durationSec = 0.28, gain = 0.9) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const freq = pitchEnd + (pitchStart - pitchEnd) * Math.exp(-progress * 24);
    const env = Math.exp(-progress * 8.0);
    const click = i < 180 ? Math.sin(i * 0.48) * Math.exp(-i / 35) * 0.65 : 0;
    const sine = Math.sin(2 * Math.PI * freq * t);
    const val = Math.tanh((sine + click) * 1.6) * env * gain;
    mixSample(startSample + i, val, val);
  }
}

/** Crisp Modern Studio Snare & Layered Clack */
function addSnare(startSample: number, gain = 0.7, pan = 0) {
  const numSamples = secToSamples(0.19);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const tone = Math.sin(2 * Math.PI * (220 * Math.exp(-progress * 26)) * t) * 0.45;
    const noise = (Math.random() * 2 - 1) * 0.65;
    const env = Math.exp(-progress * 13.5);
    const val = (tone + noise) * env * gain;
    const leftGain = (1 - pan) * 0.5;
    const rightGain = (1 + pan) * 0.5;
    mixSample(startSample + i, val * leftGain, val * rightGain);
  }
}

/** Sizzling 16th Hi-Hat with Velocity & Stereo Width */
function addHiHat(startSample: number, isOpen = false, gain = 0.35, pan = 0.2) {
  const dur = isOpen ? 0.15 : 0.045;
  const numSamples = secToSamples(dur);
  for (let i = 0; i < numSamples; i++) {
    const progress = i / numSamples;
    const n = (Math.random() * 2 - 1) * 0.65;
    const m = (Math.sin(i * 0.82) + Math.sin(i * 1.34) + Math.sin(i * 1.95)) * 0.25;
    const env = Math.exp(-progress * (isOpen ? 11 : 38));
    const val = (n + m) * env * gain;
    mixSample(startSample + i, val * (1 - pan), val * (1 + pan));
  }
}

/** Driving Analog Synth Bass Note */
function addBassNote(startSample: number, freq: number, durationSec: number, gain = 0.45) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const f1 = Math.sin(2 * Math.PI * freq * t);
    const f2 = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.4;
    const f3 = Math.sin(2 * Math.PI * (freq * 3) * t) * 0.18;
    const raw = f1 + f2 + f3;
    const env = Math.exp(-progress * 4.5);
    const val = Math.tanh(raw * 1.8) * env * gain;
    mixSample(startSample + i, val, val);
  }
}

/** Melodic Tech Synth Pluck (creates the infectious melodic groove from 3s to 7s) */
function addSynthPluck(startSample: number, freq: number, gain = 0.32, pan = 0) {
  const numSamples = secToSamples(0.22);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    // Harmonic pluck: fundamental + slight detuned 2nd harmonic + square edge
    const o1 = Math.sin(2 * Math.PI * freq * t);
    const o2 = Math.sin(2 * Math.PI * (freq * 2.01) * t) * 0.35;
    const o3 = Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.12;
    const env = Math.exp(-progress * 14.0); // fast crisp decay
    const val = (o1 + o2 + o3) * env * gain;
    const l = val * (1 - pan) * 0.5;
    const r = val * (1 + pan) * 0.5;
    mixSample(startSample + i, l, r);
  }
}

/** Massive Hero Drop 808 Sub-Boom (Frame 240 | 8.0s) */
function addHeroDrop(startSample: number, gain = 1.35) {
  const numSamples = secToSamples(3.0);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    // Sub-bass glide from 90Hz down to 35Hz
    const freq = 35 + (90 - 35) * Math.exp(-progress * 7.5);
    const env = Math.exp(-progress * 2.0);
    // Transient punch in first 60ms
    const slamNoise = i < 3000 ? (Math.random() * 2 - 1) * Math.exp(-i / 500) * 0.7 : 0;
    const punchSine = i < 5000 ? Math.sin(2 * Math.PI * 125 * t) * Math.exp(-i / 1000) * 0.8 : 0;
    const subSine = Math.sin(2 * Math.PI * freq * t);
    const subHarmonic = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.35;

    const raw = (subSine + subHarmonic + punchSine + slamNoise) * 2.0;
    const val = Math.tanh(raw) * env * gain;

    const l = val * (1 + 0.08 * Math.sin(t * 8));
    const r = val * (1 - 0.08 * Math.sin(t * 8));
    mixSample(startSample + i, l, r);
  }
}

/** Stereo Whip Whoosh (Scenes 03 & 05) */
function addWhoosh(
  startSample: number,
  durationSec = 0.42,
  panFrom = -0.85,
  panTo = 0.85,
  gain = 0.55,
  centerFreq = 2400
) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const progress = i / numSamples;
    const noise = Math.random() * 2 - 1;
    const mod = Math.sin(progress * Math.PI * (centerFreq / 200));
    const env = Math.pow(Math.sin(progress * Math.PI), 1.6);
    const val = noise * mod * env * gain;
    const currentPan = panFrom + (panTo - panFrom) * progress;
    const l = val * Math.cos(((currentPan + 1) * Math.PI) / 4);
    const r = val * Math.sin(((currentPan + 1) * Math.PI) / 4);
    mixSample(startSample + i, l, r);
  }
}

/** Magnetic Laptop Clamp (Scene 02) */
function addTechClamp(startSample: number, gain = 0.75) {
  const numSamples = secToSamples(0.12);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const highClick = Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-progress * 65) * 0.6;
    const midChirp = Math.sin(2 * Math.PI * (1400 * Math.exp(-progress * 28)) * t) * 0.35;
    const lowThud = Math.sin(2 * Math.PI * 90 * t) * Math.exp(-progress * 20) * 0.5;
    const val = (highClick + midChirp + lowThud) * gain;
    mixSample(startSample + i, val, val);
  }
}

/** Sharp Micro Tech Click */
function addTechClick(startSample: number, freq = 2800, durationSec = 0.02, pan = 0, gain = 0.45) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const sine = Math.sin(2 * Math.PI * freq * t);
    const env = Math.exp(-progress * 42);
    const val = sine * env * gain;
    mixSample(startSample + i, val * (1 - pan), val * (1 + pan));
  }
}

/** Double Bracket Typewriter Clamp (Scene 04 | Frame 90) */
function addBracketClamp(startSample: number, gain = 0.8) {
  addTechClick(startSample, 3000, 0.025, -0.4, gain * 0.8);
  const secondHit = startSample + Math.floor((2 / FPS) * SAMPLE_RATE);
  addTechClick(secondHit, 2600, 0.035, 0.4, gain * 0.9);
}

/** Accelerating Shepard Riser (Scene 06: Frames 180 to 225) */
function addCrescendoRiser(startSample: number, durationSec = 1.5, gain = 0.7) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const freq = 180 * Math.exp(progress * 2.0);
    const osc = Math.sin(2 * Math.PI * freq * t) * 0.5 + Math.sin(2 * Math.PI * (freq * 2) * t) * 0.3;
    const env = Math.pow(progress, 1.9);
    const val = osc * env * gain;
    const panAngle = progress * Math.PI * 4;
    mixSample(startSample + i, val * (0.5 + 0.4 * Math.cos(panAngle)), val * (0.5 + 0.4 * Math.sin(panAngle)));
  }
}

/** Pre-Drop Laser Beam Sweep (Scene 07: Frames 225 to 237) */
function addLaserSweep(startSample: number, durationSec = 0.40, gain = 0.65) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const freq = 500 + Math.pow(progress, 2.5) * 2400;
    const tone = Math.sin(2 * Math.PI * freq * t) * 0.65;
    const env = Math.pow(progress, 1.4);
    const val = tone * env * gain;
    mixSample(startSample + i, val, val);
  }
}

/** Glass / Confirmation Chime (Scene 07 URL | Frame 252) */
function addChime(startSample: number, freq = 1760, durationSec = 0.7, gain = 0.4) {
  const numSamples = secToSamples(durationSec);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const tone1 = Math.sin(2 * Math.PI * freq * t) * 0.6;
    const tone2 = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.3;
    const tone3 = Math.sin(2 * Math.PI * (freq * 2.76) * t) * 0.15;
    const env = Math.exp(-progress * 5.5);
    const val = (tone1 + tone2 + tone3) * env * gain;
    mixSample(startSample + i, val * 0.9, val * 1.1);
  }
}

// ---------------------------------------------------------
// UNBROKEN 120 BPM GROOVE ENGINE (0.0s to 8.0s & OUTRO)
// ---------------------------------------------------------
console.log('🎵 Generating continuous 120 BPM driving groove & synchronized SFX...');

// Musical Bass & Pluck Notes (Root D minor / F / C):
const D1 = 36.71;
const D2 = 73.42;
const F2 = 87.31;
const G2 = 98.00;
const A1 = 55.00;
const C2 = 65.41;

const D3 = 146.83;
const F3 = 174.61;
const G3 = 196.00;
const A3 = 220.00;
const C4 = 261.63;
const D4 = 293.66;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;

// 1. DRIVING 120 BPM DRUM & BASS FOUNDATION (Beats 0 to 14 | 0.0s to 7.0s)
for (let beat = 0; beat < 15; beat++) {
  const bStart = beat * SAMPLES_PER_BEAT;

  // FOUR-ON-THE-FLOOR KICK PULSE:
  // Primary downbeat kicks (Beats 0, 2, 4, 6, 8, 10, 12, 14)
  if (beat % 2 === 0) {
    addKick(bStart, 165, 46, 0.28, 0.92);
  } else {
    // Secondary kick driving under the snare for solid chest punch
    addKick(bStart, 130, 48, 0.18, 0.55);
  }

  // SNARE ON EVERY BACKBEAT (Beats 1, 3, 5, 7, 9, 11, 13)
  if (beat % 2 === 1 && beat < 14) {
    addSnare(bStart, 0.72, 0);
  }

  // HI-HAT GROOVE: Relentless 16th-note pattern driving the motion
  for (let sixteenth = 0; sixteenth < 4; sixteenth++) {
    const hStart = bStart + sixteenth * SAMPLES_PER_16TH;
    const isOpen = sixteenth === 2; // Open hat on the upbeat ('&')
    const vel = sixteenth === 0 ? 0.38 : (sixteenth === 2 ? 0.46 : 0.25);
    addHiHat(hStart, isOpen, vel, sixteenth % 2 === 0 ? -0.15 : 0.15);
  }

  // BASSLINE GROOVE: Unbroken melodic movement
  let note = D2;
  if (beat === 2 || beat === 3) note = C2;
  if (beat === 4 || beat === 5) note = F2;
  if (beat === 6 || beat === 7) note = G2;
  if (beat >= 8 && beat <= 11) note = (beat % 2 === 0) ? A1 : D2; // Dark inversion octave pump
  if (beat >= 12 && beat <= 14) note = D1; // Low resonant pedal before drop

  addBassNote(bStart, note, 0.42, 0.5);
  // Syncopated 8th-note bounce
  if (beat % 2 === 0 && beat < 14) {
    addBassNote(bStart + SAMPLES_PER_8TH, note * 1.5, 0.22, 0.35);
  }
}

// 2. MELODIC TECH SYNTH PLUCK ARPEGGIO (Beats 6 to 12 | 3.0s to 6.0s)
// Bridges Scene 04 and Scene 05 with fluid melodic movement and undeniable swagger!
const melodyPattern: { beat: number; sub: number; note: number; pan: number }[] = [
  // Scene 04: Editorial Typographic branding (3.0s - 4.0s | Beats 6 & 7)
  { beat: 6, sub: 0, note: D4, pan: -0.3 },
  { beat: 6, sub: 1, note: F4, pan: 0.3 },
  { beat: 6, sub: 2, note: A4, pan: -0.2 },
  { beat: 6, sub: 3, note: D4, pan: 0.2 },
  { beat: 7, sub: 0, note: C4, pan: -0.3 },
  { beat: 7, sub: 1, note: G4, pan: 0.3 },
  { beat: 7, sub: 2, note: F4, pan: -0.2 },
  { beat: 7, sub: 3, note: E4_calc(D4, C4), pan: 0.2 },

  // Scene 05: Dark Mode Inversion Slide (4.0s - 6.0s | Beats 8, 9, 10, 11)
  { beat: 8, sub: 0, note: D4, pan: -0.35 },
  { beat: 8, sub: 1, note: A4, pan: 0.35 },
  { beat: 8, sub: 2, note: D4 * 1.5, pan: -0.25 },
  { beat: 8, sub: 3, note: A4, pan: 0.25 },

  { beat: 9, sub: 0, note: F4, pan: -0.35 },
  { beat: 9, sub: 1, note: D4, pan: 0.35 },
  { beat: 9, sub: 2, note: C4, pan: -0.25 },
  { beat: 9, sub: 3, note: D4, pan: 0.25 },

  { beat: 10, sub: 0, note: G4, pan: -0.35 },
  { beat: 10, sub: 1, note: D4, pan: 0.35 },
  { beat: 10, sub: 2, note: F4, pan: -0.25 },
  { beat: 10, sub: 3, note: G4, pan: 0.25 },

  { beat: 11, sub: 0, note: A4, pan: -0.4 },
  { beat: 11, sub: 1, note: F4, pan: 0.4 },
  { beat: 11, sub: 2, note: D4, pan: -0.3 },
  { beat: 11, sub: 3, note: C4, pan: 0.3 },
];

function E4_calc(d: number, c: number) {
  return 329.63;
}

for (const m of melodyPattern) {
  const mStart = m.beat * SAMPLES_PER_BEAT + m.sub * SAMPLES_PER_8TH;
  addSynthPluck(mStart, m.note, 0.28, m.pan);
}

// 3. MATHEMATICALLY QUANTIZED BUILD-UP SNARE ROLL (Beats 12 to 15.75 | 6.0s - 7.90s)
// Progressive subdivision: 8th notes -> 16th notes -> 32nd notes with rising velocity!

// Beat 12 (6.0s - 6.5s): 8th note snares (2 hits)
addSnare(12 * SAMPLES_PER_BEAT, 0.45, -0.2);
addSnare(12 * SAMPLES_PER_BEAT + SAMPLES_PER_8TH, 0.5, 0.2);

// Beat 13 (6.5s - 7.0s): 16th note snares (4 hits)
for (let s = 0; s < 4; s++) {
  const t = 13 * SAMPLES_PER_BEAT + s * SAMPLES_PER_16TH;
  addSnare(t, 0.52 + s * 0.03, s % 2 === 0 ? -0.25 : 0.25);
}

// Beat 14 (7.0s - 7.5s): 16th note snares accelerating in volume (4 hits)
for (let s = 0; s < 4; s++) {
  const t = 14 * SAMPLES_PER_BEAT + s * SAMPLES_PER_16TH;
  addSnare(t, 0.65 + s * 0.04, s % 2 === 0 ? -0.3 : 0.3);
}

// Beat 15 (7.5s - 7.90s | Frames 225 to 237): Rapid 32nd-note snare crescendo!
// Stops exactly at frame 237 to create the 2-frame breath of silence before the drop!
const cutoffSample = frameToSample(237);
for (let s = 0; s < 8; s++) {
  const t = 15 * SAMPLES_PER_BEAT + s * SAMPLES_PER_32ND;
  if (t + secToSamples(0.04) <= cutoffSample) {
    addSnare(t, 0.75 + s * 0.03, s % 2 === 0 ? -0.35 : 0.35);
  }
}

// ---------------------------------------------------------
// BESPOKE SCENE-SYNCHRONIZED SFX
// ---------------------------------------------------------

// --- SCENE 01 (Frame 0 | 0.0s): Geometric Pop & Burst ---
addTechClick(frameToSample(0), 3200, 0.035, 0.25, 0.7);

// --- SCENE 02 (Frame 30 | 1.0s): Laptop Magnetic Clamp & UI Tick ---
addTechClamp(frameToSample(30), 0.85);
addTechClick(frameToSample(36), 2200, 0.02, -0.2, 0.4); // Cursor blink tick

// --- SCENE 03 (Frame 60 | 2.0s): Logo Designing Whip Whoosh ---
addWhoosh(frameToSample(58), 0.38, -0.85, 0.85, 0.65, 2600);

// --- SCENE 04 (Frame 90 | 3.0s): Branding Bracket Clamp ---
addBracketClamp(frameToSample(90), 0.85);

// --- SCENE 05 (Frame 120 | 4.0s): Dark Mode Inversion 45° Slide Whoosh ---
addWhoosh(frameToSample(118), 0.42, 0.85, -0.85, 0.75, 3200);

// --- SCENE 06 (Frame 180 | 6.0s): Gyroscopic 3D Riser ---
addCrescendoRiser(frameToSample(180), 1.5, 0.75);

// --- SCENE 07 (Frame 225 | 7.5s): Laser Bar Sweep ---
addLaserSweep(frameToSample(225), 0.40, 0.65);

// Note: Frames 237-239 (7.90s - 7.99s) is the dramatic micro-silence breath!

// --- SCENE 07 (Frame 240 | 8.00s EXACTLY): CLIMACTIC HERO BASS DROP! ---
const sDrop = frameToSample(240);
addHeroDrop(sDrop, 1.4); // Giant 808 sub-boom
addTechClick(sDrop, 3600, 0.045, 0, 0.85); // Crisp vector lockup snap
addWhoosh(sDrop, 0.5, -0.9, 0.9, 0.6, 1600); // Wide impact stereo whoosh

// Frame 252 (8.40s): URL lockup confirmation chime
addChime(frameToSample(252), 1760, 0.85, 0.45);
addTechClick(frameToSample(252), 2600, 0.02, 0, 0.38);

// OUTRO GROOVE (Frames 240 to 332 | 8.0s - 11.07s)
// Satisfying post-drop half-time rhythm letting the brand hold breathe with swagger
for (let outroBeat = 0; outroBeat < 6; outroBeat++) {
  const oStart = sDrop + outroBeat * SAMPLES_PER_BEAT;
  if (oStart < TOTAL_SAMPLES - secToSamples(0.8)) {
    if (outroBeat % 2 === 1) {
      addSnare(oStart, 0.45, 0); // relaxed laid-back snare
    }
    // Sub-bass pulse
    addBassNote(oStart, D1, 0.5, 0.38);
    // Subtle hi-hat tick
    addHiHat(oStart + SAMPLES_PER_8TH, false, 0.22, 0.1);
  }
}

// ---------------------------------------------------------
// MASTER LIMITER & 16-BIT PCM WAV EXPORTER
// ---------------------------------------------------------
console.log('🎛️ Mastering audio: applying soft-clip limiter & normalizer...');

let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  maxPeak = Math.max(maxPeak, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
}

console.log(`Peak pre-master level: ${maxPeak.toFixed(3)}`);

// Soft-knee analog tape limiter
const targetPeak = 0.96;
const normGain = maxPeak > 0 ? targetPeak / Math.max(maxPeak, 1.0) : 1.0;

const pcmData = new Int16Array(TOTAL_SAMPLES * 2);

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  // Apply master gain with soft saturation limiter
  const l = Math.tanh(leftChannel[i] * normGain * 0.95);
  const r = Math.tanh(rightChannel[i] * normGain * 0.95);

  pcmData[i * 2] = Math.max(-32768, Math.min(32767, Math.floor(l * 32767)));
  pcmData[i * 2 + 1] = Math.max(-32768, Math.min(32767, Math.floor(r * 32767)));
}

// Build standard 44-byte WAV header
const wavBuffer = Buffer.alloc(44 + pcmData.byteLength);

// RIFF header
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + pcmData.byteLength, 4);
wavBuffer.write('WAVE', 8);

// fmt subchunk
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
wavBuffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
wavBuffer.writeUInt16LE(2, 22); // NumChannels (2 for stereo)
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate (48000)
wavBuffer.writeUInt32LE(SAMPLE_RATE * 2 * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
wavBuffer.writeUInt16LE(4, 32); // BlockAlign (NumChannels * BitsPerSample/8)
wavBuffer.writeUInt16LE(16, 34); // BitsPerSample (16)

// data subchunk
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(pcmData.byteLength, 40);

// Copy PCM audio samples
Buffer.from(pcmData.buffer).copy(wavBuffer, 44);

// Write to public/projects/dzinr/dzinr_motion_soundtrack.wav
const outDir = path.resolve('public/projects/dzinr');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'dzinr_motion_soundtrack.wav');
fs.writeFileSync(outPath, wavBuffer);

console.log(`✅ Perfectly mastered soundtrack written to: ${outPath} (${(wavBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
