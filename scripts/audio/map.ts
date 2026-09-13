/**
 * Step 3: Audio Timeline Mapper
 * 
 * Maps video timeline cuts to reference audio segments to generate `03_Planner/audio_map.yaml`.
 * This YAML document is human-editable and defines the creative assembly for Step 4.
 * 
 * Usage:
 *   bun scripts/audio/map.ts <project-slug> [--force]
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const projectSlug = process.argv[2];
const force = process.argv.includes('--force');

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/audio/map.ts <project-slug> [--force]

Example:
  bun scripts/audio/map.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const timelinePath = path.join(projectDir, '03_Planner', 'timeline.yaml');
const analysisCandidates = [
  path.join(projectDir, '00_Audio', 'analysis.yaml'),
  path.join(projectDir, '02_Analyzer', 'audio', 'analysis.yaml'),
];
const analysisPath = analysisCandidates.find(p => fs.existsSync(p)) || analysisCandidates[0];
const audioMapPath = path.join(projectDir, '03_Planner', 'audio_map.yaml');

console.log(`\n========================================`);
console.log(`🗺️  [Step 3/6] MAP AUDIO TIMELINE: "${projectSlug}"`);
console.log(`========================================\n`);

if (!fs.existsSync(timelinePath)) {
  console.error(`❌ Timeline file not found: ${timelinePath}`);
  process.exit(1);
}

if (!fs.existsSync(analysisPath)) {
  console.error(`❌ Audio analysis not found in 00_Audio/ or 02_Analyzer/audio/.`);
  console.error(`   Run step 2 first: bun run audio:analyze ${projectSlug}`);
  process.exit(1);
}

if (fs.existsSync(audioMapPath) && !force) {
  console.log(`ℹ  Existing "audio_map.yaml" found at: ${path.relative(rootDir, audioMapPath)}`);
  console.log(`   Preserving your custom edits. (Pass --force to regenerate default mapping)\n`);
  process.exit(0);
}

const timeline = YAML.parse(fs.readFileSync(timelinePath, 'utf8'));
const analysis = YAML.parse(fs.readFileSync(analysisPath, 'utf8'));

const fps = timeline.fps || 30;
const scenes = timeline.scenes || [];
const transients: Array<{ time: number; strength: number; type: string }> = analysis.transients || [];

// Calculate cumulative scene cuts
interface CutInfo {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  startTime: number;
  endTime: number;
  durationSec: number;
}

const cuts: CutInfo[] = [];
let currentFrame = 0;

for (const s of scenes) {
  const durationFrames = s.duration_in_frames || Math.round((s.duration_in_seconds || 1.0) * fps);
  const startFrame = currentFrame;
  const endFrame = currentFrame + durationFrames;
  cuts.push({
    sceneId: s.id,
    startFrame,
    endFrame,
    startTime: Number((startFrame / fps).toFixed(3)),
    endTime: Number((endFrame / fps).toFixed(3)),
    durationSec: Number((durationFrames / fps).toFixed(3)),
  });
  currentFrame = endFrame;
}

const totalVideoDuration = Number((currentFrame / fps).toFixed(3));

// Compute alignment report: nearest transient to each scene start
const alignmentReport = cuts.map((c) => {
  let nearestT = 0;
  let minDiff = Infinity;

  for (const t of transients) {
    const diff = Math.abs(t.time - c.startTime);
    if (diff < minDiff) {
      minDiff = diff;
      nearestT = t.time;
    }
  }

  const offsetMs = Math.round(minDiff * 1000);
  let quality = 'acceptable';
  if (offsetMs <= 40) quality = 'perfect';
  else if (offsetMs <= 100) quality = 'close';

  return {
    scene: c.sceneId,
    cut_frame: c.startFrame,
    cut_time: c.startTime,
    nearest_transient: nearestT,
    offset_ms: offsetMs,
    quality,
  };
});

// Find the loudest 1-second segment in the reference audio for the hero payoff / logo drop
let loudestStart = 2.4;
let maxRms = 0;
const bins = analysis.energy_profile?.bins || [];
for (let i = 0; i < bins.length - 10; i++) {
  let windowRms = 0;
  for (let k = 0; k < 10; k++) {
    windowRms += bins[i + k].rms;
  }
  if (windowRms > maxRms) {
    maxRms = windowRms;
    loudestStart = bins[i].time;
  }
}

// Generate segments based on project scenes and known rhythm beats
const segments: any[] = [];

for (let i = 0; i < cuts.length; i++) {
  const c = cuts[i];
  const isLastScene = i === cuts.length - 1;

  if (c.sceneId === 'scene_01') {
    segments.push({
      scene: c.sceneId,
      video: { start: c.startTime, end: c.endTime },
      source: { start: 0.0, end: c.durationSec },
      gain: 1.05,
      notes: 'Opening punch - direct from ref beginning',
    });
  } else if (isLastScene || c.sceneId === 'scene_07') {
    // Final scene contains tension vacuum (7.2-8.0s), logo drop (8.0-9.0s), and outro (9.0-11.07s)
    // 1. Tension vacuum
    segments.push({
      scene: `${c.sceneId}_tension`,
      video: { start: c.startTime, end: 8.0 },
      source: { start: c.startTime, end: 8.0 },
      gain: 0.7,
      notes: 'Tension vacuum breakdown before logo drop',
    });

    // 2. Logo Drop (Hero Slam using loudest reference hit at 2.4-3.4s)
    segments.push({
      scene: `${c.sceneId}_logo_drop`,
      video: { start: 8.0, end: 9.0 },
      source: { start: 2.4, end: 3.4 },
      gain: 1.15,
      notes: 'Hero logo drop using remapped peak reference hit',
    });

    // 3. Outro resolution
    segments.push({
      scene: `${c.sceneId}_outro`,
      video: { start: 9.0, end: totalVideoDuration },
      source: { start: 3.4, end: Number((3.4 + (totalVideoDuration - 9.0)).toFixed(3)) },
      gain: 0.6,
      notes: 'Resolution outro fading to black',
    });

    // 4. Synthetic Sub-Bass reinforcement under the logo slam
    segments.push({
      scene: `${c.sceneId}_sub_bass`,
      video: { start: 8.0, end: 10.5 },
      type: 'synthetic_sub_bass',
      params: {
        frequency: 36.71, // D1
        duration: 2.5,
        pitch_bend: true,
        gain: 0.45,
      },
      notes: 'Sub-bass reinforcement under logo slam',
    });
  } else {
    // Standard direct segment mapped from ref audio
    segments.push({
      scene: c.sceneId,
      video: { start: c.startTime, end: c.endTime },
      source: { start: c.startTime, end: c.endTime },
      gain: 1.0,
      notes: `Direct energy mapping for ${c.sceneId}`,
    });
  }
}

const audioMap = {
  project: projectSlug,
  strategy: 'beat_align_remix',
  video_duration_seconds: totalVideoDuration,
  video_total_frames: currentFrame,
  crossfade_ms: 15,
  fade_out: {
    start: Number((totalVideoDuration - 1.5).toFixed(2)),
    curve: 'exponential',
    power: 1.5,
  },
  mastering: {
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
  },
  alignment_report: alignmentReport,
  segments,
};

fs.writeFileSync(audioMapPath, YAML.stringify(audioMap, { indent: 2 }), 'utf8');

console.log(`✅ Audio Map Generated:`);
console.log(`   Output:       ${path.relative(rootDir, audioMapPath)}`);
console.log(`   Strategy:     ${audioMap.strategy}`);
console.log(`   Video Length: ${totalVideoDuration}s (${currentFrame} frames)`);
console.log(`   Segments:     ${segments.length} audio blocks mapped`);
console.log(`\n💡 You can edit "03_Planner/audio_map.yaml" to customize gains, timings, or elements before running Step 4.\n`);
