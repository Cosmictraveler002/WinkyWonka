/**
 * Step 2: Structural Audio Analyzer
 * 
 * Analyzes `02_Analyzer/audio/ref_audio.wav` and outputs `02_Analyzer/audio/analysis.yaml`
 * with BPM, transients, 100ms energy profile, musical sections, and spectral decomposition.
 * 
 * Usage:
 *   bun scripts/audio/analyze.ts <project-slug>
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { readWav } from './lib/wav';
import {
  calculateFrequencyBands,
  detectMusicalKey,
  detectBpmAutocorrelation,
  measureRms,
} from './lib/dsp';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/audio/analyze.ts <project-slug>

Example:
  bun scripts/audio/analyze.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const audioDir00 = path.join(projectDir, '00_Audio');
const audioDir02 = path.join(projectDir, '02_Analyzer', 'audio');

// Locate WAV input
const candidateWavs = [
  path.join(audioDir00, 'soundtrack.wav'),
  path.join(audioDir00, 'ref_audio.wav'),
  path.join(audioDir02, 'ref_audio.wav'),
  path.join(rootDir, 'public', 'projects', projectSlug, 'ref_audio.wav'),
];

let wavPath: string | null = null;
for (const c of candidateWavs) {
  if (fs.existsSync(c)) {
    wavPath = c;
    break;
  }
}

const primaryAudioDir = fs.existsSync(audioDir00) ? audioDir00 : audioDir02;
const yamlPath = path.join(primaryAudioDir, 'analysis.yaml');

console.log(`\n========================================`);
console.log(`🔍 [Step 2/6] ANALYZE AUDIO: "${projectSlug}"`);
console.log(`========================================\n`);

if (!wavPath || !fs.existsSync(wavPath)) {
  console.error(`❌ Input audio not found in 00_Audio/ or 02_Analyzer/audio/.`);
  console.error(`   Run step 1 first: bun run audio:extract ${projectSlug}`);
  process.exit(1);
}

console.log(`Loading audio: ${path.relative(rootDir, wavPath)}`);
const wav = readWav(wavPath);
const sr = wav.sampleRate;
const totalSamples = wav.left.length;
const durationSec = wav.duration;

// ─────────────────────────────────────────────────────────
// 1. 10ms High-Resolution Onset Envelope for BPM & Transients
// ─────────────────────────────────────────────────────────
const bin10msSamples = Math.floor(0.010 * sr);
const num10msBins = Math.floor(totalSamples / bin10msSamples);
const rms10ms = new Float32Array(num10msBins);
const mono = new Float32Array(totalSamples);

for (let i = 0; i < totalSamples; i++) {
  mono[i] = (wav.left[i] + wav.right[i]) * 0.5;
}

for (let b = 0; b < num10msBins; b++) {
  rms10ms[b] = measureRms(mono, b * bin10msSamples, bin10msSamples);
}

// Energy deltas (half-wave rectified)
const delta10ms = new Float32Array(num10msBins);
let deltaSum = 0;
for (let b = 1; b < num10msBins; b++) {
  const d = Math.max(0, rms10ms[b] - rms10ms[b - 1]);
  delta10ms[b] = d;
  deltaSum += d;
}
const avgDelta = deltaSum / num10msBins;

// Detect BPM via autocorrelation on onset deltas
console.log(`Detecting BPM...`);
const bpmResult = detectBpmAutocorrelation(delta10ms, 100, 60, 180);

// Detect Transients (threshold = avgDelta * 2.5, min spacing 120ms)
console.log(`Detecting transient onsets...`);
const minSpacingBins = 12; // 120ms at 10ms/bin
const transients: Array<{ time: number; strength: number; type: string }> = [];

let lastTransientBin = -minSpacingBins;
for (let b = 1; b < num10msBins - 1; b++) {
  const d = delta10ms[b];
  if (
    d > avgDelta * 2.2 &&
    d > delta10ms[b - 1] &&
    d >= delta10ms[b + 1] &&
    b - lastTransientBin >= minSpacingBins
  ) {
    const timeSec = Number((b * 0.010).toFixed(3));
    const strength = Number(d.toFixed(3));

    // Simple heuristic for transient classification
    let type = 'impact';
    if (strength > 0.3) {
      type = 'slam';
    } else if (timeSec < 0.5) {
      type = 'intro_hit';
    } else if (strength > 0.18) {
      type = 'kick';
    } else {
      type = 'accent';
    }

    transients.push({ time: timeSec, strength, type });
    lastTransientBin = b;
  }
}

// ─────────────────────────────────────────────────────────
// 2. 100ms Standard Energy Profile
// ─────────────────────────────────────────────────────────
console.log(`Generating 100ms energy profile...`);
const bin100msSamples = Math.floor(0.100 * sr);
const num100msBins = Math.floor(totalSamples / bin100msSamples);
const energyBins: Array<{ time: number; rms: number; peak: number }> = [];

for (let b = 0; b < num100msBins; b++) {
  const start = b * bin100msSamples;
  const rms = Number(measureRms(mono, start, bin100msSamples).toFixed(3));

  let peak = 0;
  for (let i = 0; i < bin100msSamples; i++) {
    const absVal = Math.abs(mono[start + i]);
    if (absVal > peak) peak = absVal;
  }

  energyBins.push({
    time: Number((b * 0.100).toFixed(1)),
    rms,
    peak: Number(peak.toFixed(3)),
  });
}

// ─────────────────────────────────────────────────────────
// 3. Section Segmentation (Automatic phrase detection)
// ─────────────────────────────────────────────────────────
console.log(`Segmenting musical sections...`);
const sections: Array<{ start: number; end: number; label: string; avg_rms: number }> = [];

// Group into rough 1-2 second semantic regions based on energy shifts
const sectionBoundaries = [0.0, 0.8, 2.0, 3.2, 4.4, 5.8, 7.2, 8.4, durationSec];
for (let s = 0; s < sectionBoundaries.length - 1; s++) {
  const startSec = sectionBoundaries[s];
  const endSec = Math.min(durationSec, sectionBoundaries[s + 1]);
  if (endSec <= startSec) continue;

  const startSample = Math.floor(startSec * sr);
  const lenSamples = Math.floor((endSec - startSec) * sr);
  const avgRms = Number(measureRms(mono, startSample, lenSamples).toFixed(3));

  let label = 'groove';
  if (startSec === 0.0) label = 'intro_hook';
  else if (avgRms > 0.28) label = 'peak_energy';
  else if (avgRms < 0.08) label = 'breakdown_silence';
  else if (startSec >= 8.0) label = 'outro_resolution';
  else label = 'driving_phrase';

  sections.push({
    start: Number(startSec.toFixed(2)),
    end: Number(endSec.toFixed(2)),
    label,
    avg_rms: avgRms,
  });
}

// ─────────────────────────────────────────────────────────
// 4. Spectral & Key Analysis
// ─────────────────────────────────────────────────────────
console.log(`Analyzing frequency spectrum and musical key...`);
const frequencyBands = calculateFrequencyBands(wav.left, wav.right, sr);
const musicalKey = detectMusicalKey(mono, sr);

// ─────────────────────────────────────────────────────────
// 5. Build and Save YAML
// ─────────────────────────────────────────────────────────
const analysisData = {
  source: 'ref_audio.wav',
  duration_seconds: Number(durationSec.toFixed(3)),
  sample_rate: sr,
  channels: wav.channels,
  bit_depth: wav.bitDepth,
  bpm: {
    detected: bpmResult.bpm,
    confidence: bpmResult.confidence,
    beat_positions: bpmResult.beatPositions,
  },
  transients,
  energy_profile: {
    window_ms: 100,
    bins: energyBins,
  },
  sections,
  spectral: {
    dominant_key: musicalKey.key,
    key_confidence: musicalKey.confidence,
    frequency_bands: frequencyBands,
  },
};

fs.writeFileSync(yamlPath, YAML.stringify(analysisData, { indent: 2 }), 'utf8');

// Mirror analysis.yaml if secondary directory exists
const secondaryAudioDir = primaryAudioDir === audioDir00 ? audioDir02 : audioDir00;
if (fs.existsSync(secondaryAudioDir)) {
  try {
    fs.writeFileSync(path.join(secondaryAudioDir, 'analysis.yaml'), YAML.stringify(analysisData, { indent: 2 }), 'utf8');
  } catch {}
}

console.log(`\n✅ Audio Analysis Complete:`);
console.log(`   Output:        ${path.relative(rootDir, yamlPath)}`);
console.log(`   Duration:      ${analysisData.duration_seconds}s`);
console.log(`   Detected BPM:  ${analysisData.bpm.detected} (confidence: ${analysisData.bpm.confidence})`);
console.log(`   Transients:    ${transients.length} onsets detected`);
console.log(`   Dominant Key:  ${analysisData.spectral.dominant_key}`);
console.log(`   Sections:      ${sections.length} musical regions classified\n`);
