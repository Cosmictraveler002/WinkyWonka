/**
 * Step 4: Audio Composer / Segment Assembler
 * 
 * Assembles audio segments according to `03_Planner/audio_map.yaml`
 * and generates `04_Assets/audio/soundtrack_raw.wav`.
 * 
 * Usage:
 *   bun scripts/audio/compose.ts <project-slug>
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { readWav, writeWav } from './lib/wav';
import {
  copySegmentWithCrossfade,
  generateSubBass,
  applyFadeOut,
  measurePeak,
} from './lib/dsp';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/audio/compose.ts <project-slug>

Example:
  bun scripts/audio/compose.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const audioMapPath = path.join(projectDir, '03_Planner', 'audio_map.yaml');
const refAudioCandidates = [
  path.join(projectDir, '00_Audio', 'ref_audio.wav'),
  path.join(projectDir, '00_Audio', 'soundtrack.wav'),
  path.join(projectDir, '02_Analyzer', 'audio', 'ref_audio.wav'),
];
const refAudioPath = refAudioCandidates.find(p => fs.existsSync(p)) || refAudioCandidates[0];
const outputDir = path.join(projectDir, '04_Assets', 'audio');
const rawOutputPath = path.join(outputDir, 'soundtrack_raw.wav');

console.log(`\n========================================`);
console.log(`🎹 [Step 4/6] COMPOSE AUDIO: "${projectSlug}"`);
console.log(`========================================\n`);

if (!fs.existsSync(audioMapPath)) {
  console.error(`❌ Audio map not found: ${audioMapPath}`);
  console.error(`   Run step 3 first: bun run audio:map ${projectSlug}`);
  process.exit(1);
}

if (!fs.existsSync(refAudioPath)) {
  console.error(`❌ Reference audio not found in 00_Audio/ or 02_Analyzer/audio/.`);
  console.error(`   Run step 1 first: bun run audio:extract ${projectSlug}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

console.log(`Loading audio map: ${path.relative(rootDir, audioMapPath)}`);
const audioMap = YAML.parse(fs.readFileSync(audioMapPath, 'utf8'));

console.log(`Loading reference audio: ${path.relative(rootDir, refAudioPath)}`);
const refAudio = readWav(refAudioPath);
const sr = refAudio.sampleRate;

const totalDurationSec = Number(audioMap.video_duration_seconds || 11.0);
const totalSamples = Math.floor(totalDurationSec * sr);
const crossfadeMs = audioMap.crossfade_ms ?? 15;
const crossfadeSamples = Math.floor((crossfadeMs / 1000) * sr);

const leftOut = new Float32Array(totalSamples);
const rightOut = new Float32Array(totalSamples);

console.log(`Assembling ${audioMap.segments?.length || 0} audio segments...`);

for (const seg of audioMap.segments || []) {
  const vStart = seg.video?.start ?? 0;
  const vEnd = seg.video?.end ?? totalDurationSec;
  const dstStart = Math.floor(vStart * sr);
  const dstEnd = Math.min(totalSamples, Math.floor(vEnd * sr));

  if (seg.type === 'synthetic_sub_bass') {
    const params = seg.params || {};
    const subDuration = params.duration ?? (vEnd - vStart);
    const baseFreq = params.frequency ?? 36.71;
    const pitchBend = params.pitch_bend ?? true;
    const gain = params.gain ?? 0.45;

    console.log(`  + Synthetic Sub-Bass at ${vStart}s (${baseFreq}Hz, ${subDuration}s, gain: ${gain})`);
    const sub = generateSubBass({
      durationSec: subDuration,
      sampleRate: sr,
      baseFreq,
      pitchBend,
      gain,
    });

    const subSamples = Math.min(sub.left.length, totalSamples - dstStart);
    for (let i = 0; i < subSamples; i++) {
      const idx = dstStart + i;
      leftOut[idx] += sub.left[i];
      rightOut[idx] += sub.right[i];
    }
  } else if (seg.source) {
    const sStart = seg.source.start ?? 0;
    const sEnd = seg.source.end ?? (sStart + (vEnd - vStart));
    const srcStart = Math.floor(sStart * sr);
    const srcEnd = Math.floor(sEnd * sr);
    const gain = seg.gain ?? 1.0;

    console.log(`  • Segment "${seg.scene || 'unnamed'}": video [${vStart}s - ${vEnd}s] ← ref [${sStart}s - ${sEnd}s] (gain: ${gain})`);
    copySegmentWithCrossfade(
      leftOut,
      rightOut,
      refAudio.left,
      refAudio.right,
      srcStart,
      srcEnd,
      dstStart,
      dstEnd,
      crossfadeSamples,
      gain
    );
  }
}

// Apply Fade Out if configured
if (audioMap.fade_out?.start) {
  const fadeStartSec = audioMap.fade_out.start;
  const fadeStartSample = Math.floor(fadeStartSec * sr);
  const power = audioMap.fade_out.power ?? 1.5;
  console.log(`Applying fade-out envelope from ${fadeStartSec}s (power: ${power})...`);
  applyFadeOut(leftOut, rightOut, fadeStartSample, power);
}

// Write raw soundtrack
console.log(`Writing raw assembled audio to: ${path.relative(rootDir, rawOutputPath)}`);
writeWav(rawOutputPath, {
  left: leftOut,
  right: rightOut,
  sampleRate: sr,
});

const rawPeak = measurePeak(leftOut, rightOut);

console.log(`\n✅ Audio Composition Complete:`);
console.log(`   Output:        ${path.relative(rootDir, rawOutputPath)}`);
console.log(`   Duration:      ${(totalSamples / sr).toFixed(3)}s`);
console.log(`   Pre-master Peak: ${rawPeak.toFixed(3)}`);
console.log(`   Sample Rate:   ${sr} Hz\n`);
