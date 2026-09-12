/**
 * Beat-Aligned Soundtrack Remixer for Dzinr / Kalaकृति
 * 
 * Strategy: Take the REAL professional audio from the reference video,
 * and remap its musical segments so that transient impacts land on our
 * exact cut frames. This preserves the organic, professional quality
 * while fixing the timing.
 * 
 * The ref audio has these major beat/hit sections:
 *   Hit A: 0.20-0.40s (opening impact, RMS 0.36)
 *   Hit B: 1.0-1.3s   (secondary impact, RMS 0.35-0.41)  
 *   Hit C: 1.6-1.9s   (build phrase, RMS 0.22-0.39)
 *   Hit D: 2.5-2.7s   (LOUDEST section, RMS 0.60-0.68!)
 *   Hit E: 3.3-3.5s   (syncopated accent, RMS 0.25-0.42)
 *   Hit F: 3.9-4.1s   (build hit, RMS 0.31-0.42)
 *   Hit G: 4.7-4.9s   (driving hit, RMS 0.18-0.45)
 *   Hit H: 5.6-5.8s   (late build, RMS 0.24-0.45)
 *   Hit I: 6.2-6.5s   (penultimate, RMS 0.27-0.38)
 *   Hit J: 7.0-7.4s   (final statement, RMS 0.17-0.23)
 *   Tail:  8.0-8.4s   (resolution, then silence)
 * 
 * Our cuts land at: 0, 1.0, 2.0, 3.0, 4.2, 5.8, 7.2, 8.0
 * 
 * Remixing plan:
 *   Segment 1 (Scene 01): ref 0.0-1.0s  → output 0.0-1.0s  (direct copy, opening energy)
 *   Segment 2 (Scene 02): ref 1.0-2.0s  → output 1.0-2.0s  (direct copy, driving energy)
 *   Segment 3 (Scene 03): ref 2.0-3.0s  → output 2.0-3.0s  (direct, contains the LOUDEST hit at 2.5s)
 *   Segment 4 (Scene 04): ref 3.0-4.2s  → output 3.0-4.2s  (direct, good energy)
 *   Segment 5 (Scene 05): ref 4.2-5.8s  → output 4.2-5.8s  (direct, sustained driving)
 *   Segment 6 (Scene 06): ref 5.8-7.2s  → output 5.8-7.2s  (direct, building energy)
 *   Segment 7 (Tension):  ref 7.5-8.0s  → output 7.2-8.0s  (STRETCH: 0.5s → 0.8s, breakdown/vacuum)
 *   Segment 8 (LOGO):     ref 2.5-3.3s  → output 8.0-8.8s  (RE-USE the LOUDEST hit as logo impact!)
 *   Segment 9 (Outro):    ref 7.8-11.0s → output 8.8-11.07s (fade with reverb tail)
 * 
 * Additional processing:
 * - 15ms cosine crossfade at every segment boundary to eliminate clicks
 * - Stereo Schroeder reverb for spatial depth
 * - Dynamic compression and mastering
 * - Sub-bass reinforcement at logo drop (frame 240)
 */

import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 48000;
const FPS = 30;
const TOTAL_FRAMES = 332;
const TOTAL_SAMPLES = Math.floor((TOTAL_FRAMES / FPS) * SAMPLE_RATE);

// ─────────────────────────────────────────────────────────
// 1. PROPER WAV READER (handles LIST chunks correctly)
// ─────────────────────────────────────────────────────────
function readWavPCM(filePath: string): { left: Float32Array; right: Float32Array } {
  const buf = fs.readFileSync(filePath);
  let offset = 12;
  let dataOffset = -1;
  let dataSize = -1;

  while (offset < buf.byteLength - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset += 1;
  }

  if (dataOffset < 0) throw new Error(`No data chunk in ${filePath}`);

  const numSamples = Math.floor(dataSize / 4);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    left[i] = buf.readInt16LE(dataOffset + i * 4) / 32768;
    right[i] = buf.readInt16LE(dataOffset + i * 4 + 2) / 32768;
  }
  return { left, right };
}

console.log('Loading reference audio (correct offset)...');
const ref = readWavPCM('public/projects/dzinr/ref_audio.wav');
console.log(`  ${ref.left.length} samples (${(ref.left.length / SAMPLE_RATE).toFixed(3)}s)`);

// Output buffers
const leftOut = new Float32Array(TOTAL_SAMPLES);
const rightOut = new Float32Array(TOTAL_SAMPLES);

// ─────────────────────────────────────────────────────────
// 2. SEGMENT COPY WITH CROSSFADE
// ─────────────────────────────────────────────────────────
const CROSSFADE_SAMPLES = Math.floor(0.015 * SAMPLE_RATE); // 15ms crossfade

function timeToSample(sec: number): number {
  return Math.floor(sec * SAMPLE_RATE);
}

/**
 * Copy a segment from the ref audio to the output with gain and crossfading.
 * Supports time-stretching via simple linear interpolation.
 */
function copySegment(
  srcStart: number, srcEnd: number,
  dstStart: number, dstEnd: number,
  gain = 1.0
) {
  const srcLen = srcEnd - srcStart;
  const dstLen = dstEnd - dstStart;
  const stretchRatio = srcLen / dstLen; // >1 = compress, <1 = stretch

  for (let i = 0; i < dstLen; i++) {
    // Linear interpolation for time-stretching
    const srcPos = srcStart + i * stretchRatio;
    const idx0 = Math.floor(srcPos);
    const idx1 = Math.min(idx0 + 1, ref.left.length - 1);
    const frac = srcPos - idx0;

    const l = ref.left[idx0] * (1 - frac) + ref.left[idx1] * frac;
    const r = ref.right[idx0] * (1 - frac) + ref.right[idx1] * frac;

    // Crossfade envelope at boundaries
    let env = 1.0;
    if (i < CROSSFADE_SAMPLES) {
      env = 0.5 * (1 - Math.cos(Math.PI * i / CROSSFADE_SAMPLES));
    }
    if (i > dstLen - CROSSFADE_SAMPLES) {
      env = 0.5 * (1 + Math.cos(Math.PI * (i - (dstLen - CROSSFADE_SAMPLES)) / CROSSFADE_SAMPLES));
    }

    const outIdx = dstStart + i;
    if (outIdx >= 0 && outIdx < TOTAL_SAMPLES) {
      leftOut[outIdx] += l * gain * env;
      rightOut[outIdx] += r * gain * env;
    }
  }
}

// ─────────────────────────────────────────────────────────
// 3. ASSEMBLE THE REMIXED TIMELINE
// ─────────────────────────────────────────────────────────
console.log('Assembling beat-aligned timeline...');

// Segment 1: Scene 01 (0-1s) ← ref 0-1s (direct)
copySegment(
  timeToSample(0.0), timeToSample(1.0),
  timeToSample(0.0), timeToSample(1.0),
  1.05 // slight boost for opening punch
);
console.log('  ✓ Scene 01: Opening energy (0-1s)');

// Segment 2: Scene 02 (1-2s) ← ref 1-2s (direct)
copySegment(
  timeToSample(1.0), timeToSample(2.0),
  timeToSample(1.0), timeToSample(2.0),
  1.0
);
console.log('  ✓ Scene 02: Driving phase (1-2s)');

// Segment 3: Scene 03 (2-3s) ← ref 2-3s (direct, contains loudest hit at 2.5s)
copySegment(
  timeToSample(2.0), timeToSample(3.0),
  timeToSample(2.0), timeToSample(3.0),
  1.0
);
console.log('  ✓ Scene 03: Peak energy with big hit at 2.5s (2-3s)');

// Segment 4: Scene 04 (3-4.2s) ← ref 3-4.2s (direct)
copySegment(
  timeToSample(3.0), timeToSample(4.2),
  timeToSample(3.0), timeToSample(4.2),
  1.0
);
console.log('  ✓ Scene 04: Creative Engineering branding (3-4.2s)');

// Segment 5: Scene 05 (4.2-5.8s) ← ref 4.2-5.8s (direct)
copySegment(
  timeToSample(4.2), timeToSample(5.8),
  timeToSample(4.2), timeToSample(5.8),
  1.0
);
console.log('  ✓ Scene 05: Website showcase (4.2-5.8s)');

// Segment 6: Scene 06 (5.8-7.2s) ← ref 5.8-7.2s (direct)
copySegment(
  timeToSample(5.8), timeToSample(7.2),
  timeToSample(5.8), timeToSample(7.2),
  1.0
);
console.log('  ✓ Scene 06: Wireframe build (5.8-7.2s)');

// Segment 7: Tension Vacuum (7.2-8.0s) ← ref 7.2-8.0s
// The ref audio naturally drops energy here (RMS 0.167 → 0.065)
// Use it directly — it already serves as a natural breakdown
copySegment(
  timeToSample(7.2), timeToSample(8.0),
  timeToSample(7.2), timeToSample(8.0),
  0.7 // reduce further for more dramatic contrast with logo drop
);
console.log('  ✓ Scene 07a: Tension vacuum with natural breakdown (7.2-8.0s)');

// Segment 8: LOGO DROP (8.0-9.0s) ← ref 2.4-3.4s (THE LOUDEST SECTION)
// We're re-using the most impactful moment from the ref as our logo slam
copySegment(
  timeToSample(2.4), timeToSample(3.4),
  timeToSample(8.0), timeToSample(9.0),
  1.15 // boost for maximum impact
);
console.log('  ✓ Scene 07b: LOGO DROP using remapped peak hit (8.0-9.0s)');

// Segment 9: Outro resolution (9.0-11.07s) ← ref 3.4-5.4s fading out
copySegment(
  timeToSample(3.4), timeToSample(5.4),
  timeToSample(9.0), timeToSample(11.07),
  0.6 // reduced for gentle outro
);
console.log('  ✓ Outro: Gentle resolution with fading energy (9.0-11.07s)');

// ─────────────────────────────────────────────────────────
// 4. ADD SUB-BASS REINFORCEMENT AT LOGO DROP
// ─────────────────────────────────────────────────────────
console.log('Adding sub-bass reinforcement at logo drop (frame 240)...');
const logoSample = Math.floor((240 / FPS) * SAMPLE_RATE);
const subDuration = Math.floor(2.5 * SAMPLE_RATE); // 2.5s sub tail

for (let i = 0; i < subDuration; i++) {
  const t = i / SAMPLE_RATE;
  const progress = i / subDuration;

  // Sub bass at D1 (36.71 Hz) with pitch bend on attack
  const freq = 36.71 * (1 + 1.5 * Math.exp(-progress * 25));
  const phase = 2 * Math.PI * freq * t;
  const tone = Math.sin(phase) + 0.15 * Math.sin(2 * phase);

  // Envelope: fast attack, slow exponential decay
  const attackLen = Math.floor(0.005 * SAMPLE_RATE);
  let env = Math.exp(-progress * 2.0);
  if (i < attackLen) {
    env *= 0.5 * (1 - Math.cos(Math.PI * i / attackLen));
  }

  const sub = Math.tanh(tone * 1.8) * env * 0.45;
  const outIdx = logoSample + i;
  if (outIdx < TOTAL_SAMPLES) {
    leftOut[outIdx] += sub;
    rightOut[outIdx] += sub;
  }
}

// ─────────────────────────────────────────────────────────
// 5. SMOOTH OUTRO FADE
// ─────────────────────────────────────────────────────────
console.log('Applying outro fade (9.5s → 11.07s)...');
const fadeStart = timeToSample(9.5);
for (let i = fadeStart; i < TOTAL_SAMPLES; i++) {
  const fade = Math.pow((TOTAL_SAMPLES - i) / (TOTAL_SAMPLES - fadeStart), 1.5);
  leftOut[i] *= fade;
  rightOut[i] *= fade;
}

// ─────────────────────────────────────────────────────────
// 6. SCHROEDER STEREO REVERB
// ─────────────────────────────────────────────────────────
console.log('Applying stereo reverb...');

class CombFilter {
  private buffer: Float32Array;
  private idx = 0;
  constructor(private delaySamples: number, private feedback: number) {
    this.buffer = new Float32Array(delaySamples);
  }
  process(input: number): number {
    const out = this.buffer[this.idx];
    this.buffer[this.idx] = input + out * this.feedback;
    this.idx = (this.idx + 1) % this.buffer.length;
    return out;
  }
}

class AllPassFilter {
  private buffer: Float32Array;
  private idx = 0;
  private feedback = 0.5;
  constructor(delaySamples: number) {
    this.buffer = new Float32Array(delaySamples);
  }
  process(input: number): number {
    const bufOut = this.buffer[this.idx];
    const out = -input + bufOut;
    this.buffer[this.idx] = input + bufOut * this.feedback;
    this.idx = (this.idx + 1) % this.buffer.length;
    return out;
  }
}

const combsL = [
  new CombFilter(1557, 0.72),
  new CombFilter(1617, 0.70),
  new CombFilter(1491, 0.74),
  new CombFilter(1422, 0.76),
];
const combsR = [
  new CombFilter(1567, 0.72),
  new CombFilter(1627, 0.70),
  new CombFilter(1501, 0.74),
  new CombFilter(1432, 0.76),
];
const allpassL = [new AllPassFilter(225), new AllPassFilter(556)];
const allpassR = [new AllPassFilter(235), new AllPassFilter(566)];

const wetGain = 0.12; // subtle room ambience, not washy

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const inL = leftOut[i];
  const inR = rightOut[i];

  let cL = 0, cR = 0;
  for (let c = 0; c < 4; c++) {
    cL += combsL[c].process(inL);
    cR += combsR[c].process(inR);
  }

  let aL = cL, aR = cR;
  for (let a = 0; a < 2; a++) {
    aL = allpassL[a].process(aL);
    aR = allpassR[a].process(aR);
  }

  leftOut[i] += aL * wetGain;
  rightOut[i] += aR * wetGain;
}

// ─────────────────────────────────────────────────────────
// 7. DYNAMIC COMPRESSION (gentle, broadcast-style)
// ─────────────────────────────────────────────────────────
console.log('Applying dynamic compression...');
const threshold = 0.45;
const ratio = 3.0;
const attackMs = 5;
const releaseMs = 100;
const attackCoeff = Math.exp(-1 / (attackMs * SAMPLE_RATE / 1000));
const releaseCoeff = Math.exp(-1 / (releaseMs * SAMPLE_RATE / 1000));

let compEnvL = 0;
let compEnvR = 0;

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const absL = Math.abs(leftOut[i]);
  const absR = Math.abs(rightOut[i]);

  compEnvL = absL > compEnvL
    ? attackCoeff * compEnvL + (1 - attackCoeff) * absL
    : releaseCoeff * compEnvL + (1 - releaseCoeff) * absL;
  compEnvR = absR > compEnvR
    ? attackCoeff * compEnvR + (1 - attackCoeff) * absR
    : releaseCoeff * compEnvR + (1 - releaseCoeff) * absR;

  let gainL = 1.0;
  if (compEnvL > threshold) {
    const overDb = 20 * Math.log10(compEnvL / threshold);
    const reducedDb = overDb / ratio;
    gainL = Math.pow(10, (reducedDb - overDb) / 20) * (threshold / compEnvL) + (1 - threshold / compEnvL);
    gainL = threshold / compEnvL + (compEnvL - threshold) / (compEnvL * ratio);
  }

  let gainR = 1.0;
  if (compEnvR > threshold) {
    gainR = threshold / compEnvR + (compEnvR - threshold) / (compEnvR * ratio);
  }

  leftOut[i] *= gainL;
  rightOut[i] *= gainR;
}

// ─────────────────────────────────────────────────────────
// 8. MASTERING (normalize + soft limit)
// ─────────────────────────────────────────────────────────
console.log('Mastering...');
let peak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  if (Math.abs(leftOut[i]) > peak) peak = Math.abs(leftOut[i]);
  if (Math.abs(rightOut[i]) > peak) peak = Math.abs(rightOut[i]);
}
console.log(`  Pre-master peak: ${peak.toFixed(4)}`);

const targetPeak = 0.95;
const masterGain = peak > 0 ? targetPeak / peak : 1.0;

const pcmData = new Int16Array(TOTAL_SAMPLES * 2);
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const l = Math.tanh(leftOut[i] * masterGain * 1.1); // slight overdrive into limiter
  const r = Math.tanh(rightOut[i] * masterGain * 1.1);
  pcmData[i * 2] = Math.max(-32768, Math.min(32767, Math.floor(l * 32767)));
  pcmData[i * 2 + 1] = Math.max(-32768, Math.min(32767, Math.floor(r * 32767)));
}

// ─────────────────────────────────────────────────────────
// 9. WRITE CLEAN WAV (no LIST chunk, standard header)
// ─────────────────────────────────────────────────────────
const wavBuffer = Buffer.alloc(44 + pcmData.byteLength);
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + pcmData.byteLength, 4);
wavBuffer.write('WAVE', 8);
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16);
wavBuffer.writeUInt16LE(1, 20);  // PCM
wavBuffer.writeUInt16LE(2, 22);  // stereo
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24);
wavBuffer.writeUInt32LE(SAMPLE_RATE * 4, 28);
wavBuffer.writeUInt16LE(4, 32);
wavBuffer.writeUInt16LE(16, 34);
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(pcmData.byteLength, 40);
Buffer.from(pcmData.buffer).copy(wavBuffer, 44);

const outputPath = path.resolve('public/projects/dzinr/dzinr_motion_soundtrack.wav');
fs.writeFileSync(outputPath, wavBuffer);

console.log(`\n✅ Beat-aligned soundtrack generated: ${outputPath}`);
console.log(`   Size: ${(wavBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`);
console.log(`   Duration: ${(TOTAL_SAMPLES / SAMPLE_RATE).toFixed(3)}s`);
console.log(`   Peak level: ${targetPeak.toFixed(2)}`);
console.log(`\n   Timeline:`);
console.log(`   0.0-1.0s  → Opening energy (ref direct)`);
console.log(`   1.0-2.0s  → Driving phase (ref direct)`);
console.log(`   2.0-3.0s  → Peak hit at 2.5s (ref direct)`);
console.log(`   3.0-4.2s  → Creative Engineering (ref direct)`);
console.log(`   4.2-5.8s  → Website showcase (ref direct)`);
console.log(`   5.8-7.2s  → Wireframe build (ref direct)`);
console.log(`   7.2-8.0s  → Tension vacuum (ref breakdown, reduced)`);
console.log(`   8.0-9.0s  → LOGO DROP (remapped loudest hit + sub bass)`);
console.log(`   9.0-11.07s → Resolution outro (fading)`);
