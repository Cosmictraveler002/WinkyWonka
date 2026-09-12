/**
 * Step 5: Audio Mastering Chain
 * 
 * Applies broadcast-grade mastering to `04_Assets/audio/soundtrack_raw.wav`:
 * - Stereo Schroeder Reverb (spatial dimension)
 * - Broadcast dynamic compression
 * - DC offset removal
 * - Soft saturation limiter & true peak normalization to -0.5 dB (0.95)
 * 
 * Outputs to `04_Assets/audio/soundtrack.wav` and syncs to `public/projects/<slug>/`.
 * 
 * Usage:
 *   bun scripts/audio/master.ts <project-slug>
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { readWav, writeWav } from './lib/wav';
import {
  applySchroederReverb,
  applyDynamicCompression,
  removeDcOffset,
  applyMastering,
  measurePeak,
  measureRms,
} from './lib/dsp';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/audio/master.ts <project-slug>

Example:
  bun scripts/audio/master.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const audioMapPath = path.join(projectDir, '03_Planner', 'audio_map.yaml');
const rawWavPath = path.join(projectDir, '04_Assets', 'audio', 'soundtrack_raw.wav');
const finalWavPath = path.join(projectDir, '04_Assets', 'audio', 'soundtrack.wav');
const publicDir = path.join(rootDir, 'public', 'projects', projectSlug);
const publicSoundtrackPath = path.join(publicDir, 'soundtrack.wav');
const publicLegacyPath = path.join(publicDir, 'dzinr_motion_soundtrack.wav');

console.log(`\n========================================`);
console.log(`🎛️  [Step 5/6] MASTER AUDIO: "${projectSlug}"`);
console.log(`========================================\n`);

if (!fs.existsSync(rawWavPath)) {
  console.error(`❌ Raw audio not found: ${rawWavPath}`);
  console.error(`   Run step 4 first: bun run audio:compose ${projectSlug}`);
  process.exit(1);
}

// Read mastering config if present in audio_map.yaml
let masteringConfig = {
  reverb_wet: 0.12,
  compression: {
    threshold: 0.45,
    ratio: 3.0,
    attack_ms: 5,
    release_ms: 100,
  },
  target_peak: 0.95,
  limiter_overdrive: 1.1,
  remove_dc: true,
};

if (fs.existsSync(audioMapPath)) {
  const map = YAML.parse(fs.readFileSync(audioMapPath, 'utf8'));
  if (map.mastering) {
    masteringConfig = { ...masteringConfig, ...map.mastering };
  }
}

console.log(`Loading pre-master: ${path.relative(rootDir, rawWavPath)}`);
const wav = readWav(rawWavPath);
const sr = wav.sampleRate;
const left = wav.left;
const right = wav.right;

const initialPeak = measurePeak(left, right);
console.log(`  Initial peak level: ${initialPeak.toFixed(3)}`);

// 1. Stereo Schroeder Reverb
if (masteringConfig.reverb_wet > 0) {
  console.log(`  1. Applying stereo Schroeder reverb (wet: ${masteringConfig.reverb_wet})...`);
  applySchroederReverb(left, right, masteringConfig.reverb_wet);
}

// 2. Dynamic Compression
const comp = masteringConfig.compression;
console.log(`  2. Applying dynamic compression (threshold: ${comp.threshold}, ratio: ${comp.ratio}:1)...`);
applyDynamicCompression(left, right, sr, {
  threshold: comp.threshold,
  ratio: comp.ratio,
  attackMs: comp.attack_ms,
  releaseMs: comp.release_ms,
});

// 3. DC Offset & Infrasonic Rumble Removal
if (masteringConfig.remove_dc) {
  console.log(`  3. Filtering DC offset and infrasonic bias (5Hz high-pass)...`);
  removeDcOffset(left, right, sr);
}

// 4. Soft Saturation Limiter & Peak Normalization
console.log(`  4. Normalizing to target peak (${masteringConfig.target_peak}) with soft limiter...`);
const finalPeak = applyMastering(
  left,
  right,
  masteringConfig.target_peak,
  masteringConfig.limiter_overdrive
);

const finalRmsLeft = measureRms(left);
const finalRmsRight = measureRms(right);
const avgRms = (finalRmsLeft + finalRmsRight) * 0.5;

// Write production soundtrack
console.log(`Writing final mastered track: ${path.relative(rootDir, finalWavPath)}`);
writeWav(finalWavPath, { left, right, sampleRate: sr });

// Sync to public directory for Remotion preview and player
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(finalWavPath, publicSoundtrackPath);
console.log(`Synced to public asset: ${path.relative(rootDir, publicSoundtrackPath)}`);

if (fs.existsSync(publicLegacyPath)) {
  fs.copyFileSync(finalWavPath, publicLegacyPath);
  console.log(`Updated legacy soundtrack path: ${path.relative(rootDir, publicLegacyPath)}`);
}

console.log(`\n✅ Mastering Chain Complete:`);
console.log(`   Final Output:  ${path.relative(rootDir, finalWavPath)}`);
console.log(`   Final Peak:    ${finalPeak.toFixed(3)} (target: ${masteringConfig.target_peak})`);
console.log(`   Average RMS:   ${avgRms.toFixed(3)}`);
console.log(`   Duration:      ${wav.duration.toFixed(3)}s\n`);
