/**
 * Audio Temporal Skeleton Generator
 * 
 * Reads `analysis.yaml` (from 00_Audio or 02_Analyzer/audio)
 * and generates `00_Audio/temporal_skeleton.yaml` with:
 * - beat_grid (BPM, bar numbers, beat numbers, downbeats)
 * - phrase_boundaries (musical section shifts)
 * - cut_windows (strongest, strong, medium cut opportunities)
 * - hold_zones (energy dips for cognitive recovery)
 * - energy_curve (macro progression from intro to payoff)
 * 
 * Usage:
 *   bun scripts/audio/skeleton.ts <project-slug>
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/audio/skeleton.ts <project-slug>

Example:
  bun scripts/audio/skeleton.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);

if (!fs.existsSync(projectDir)) {
  console.error(`❌ Project directory not found: ${projectDir}`);
  process.exit(1);
}

// Locate analysis.yaml (prefer 00_Audio, fallback to 02_Analyzer/audio)
const candidateAnalysisPaths = [
  path.join(projectDir, '00_Audio', 'analysis.yaml'),
  path.join(projectDir, '02_Analyzer', 'audio', 'analysis.yaml'),
];

let analysisPath: string | null = null;
for (const p of candidateAnalysisPaths) {
  if (fs.existsSync(p)) {
    analysisPath = p;
    break;
  }
}

if (!analysisPath) {
  console.error(`❌ Audio analysis not found in 00_Audio/ or 02_Analyzer/audio/.`);
  console.error(`   Run audio analysis first: bun run audio:analyze ${projectSlug}`);
  process.exit(1);
}

console.log(`\n========================================`);
console.log(`🦴 GENERATE TEMPORAL SKELETON: "${projectSlug}"`);
console.log(`========================================\n`);
console.log(`Reading analysis: ${path.relative(rootDir, analysisPath)}`);

const rawAnalysis = fs.readFileSync(analysisPath, 'utf8');
const analysis = YAML.parse(rawAnalysis);

const duration = Number(analysis.duration_seconds || 0);
const bpm = Number(analysis.bpm?.detected || 120);
const secPerBeat = 60 / bpm;
const secPerBar = secPerBeat * 4;

console.log(`Track duration: ${duration.toFixed(2)}s | BPM: ${bpm} | Beat interval: ${secPerBeat.toFixed(3)}s`);

// 1. Build Beat Grid (4/4 time signature)
const beatGrid: Array<{
  time: number;
  type: 'downbeat' | 'snare' | 'pulse';
  bar_number: number;
  beat_number: number;
}> = [];

const totalBeats = Math.floor(duration / secPerBeat);
for (let b = 0; b < totalBeats; b++) {
  const time = Number((b * secPerBeat).toFixed(3));
  const beatInBar = (b % 4) + 1;
  const barNumber = Math.floor(b / 4) + 1;

  let type: 'downbeat' | 'snare' | 'pulse' = 'pulse';
  if (beatInBar === 1) {
    type = 'downbeat';
  } else if (beatInBar === 3) {
    type = 'snare';
  }

  beatGrid.push({
    time,
    type,
    bar_number: barNumber,
    beat_number: beatInBar,
  });
}

// 2. Identify Phrase Boundaries (combining musical sections and 2/4-bar boundaries)
const rawSections = analysis.sections || [];
const phraseBoundarySet = new Set<number>([0.0]);

// Add section start/ends from analysis
for (const s of rawSections) {
  if (typeof s.start === 'number') phraseBoundarySet.add(Number(s.start.toFixed(2)));
  if (typeof s.end === 'number' && s.end < duration) phraseBoundarySet.add(Number(s.end.toFixed(2)));
}

// Also snap to musical 2-bar boundaries if not already covered
for (let bar = 1; bar * secPerBar < duration; bar += 2) {
  const barTime = Number((bar * secPerBar).toFixed(2));
  phraseBoundarySet.add(barTime);
}

phraseBoundarySet.add(Number(duration.toFixed(2)));
const phraseBoundaries = Array.from(phraseBoundarySet).sort((a, b) => a - b);

// 3. Compute Macro Energy Curve
const rawBins = analysis.energy_profile?.bins || [];
const energyCurve: Array<{
  time: number;
  energy: number;
  phase: string;
}> = [];

if (rawSections.length > 0) {
  // Normalize rms values across sections
  const maxRms = Math.max(...rawSections.map((s: any) => s.avg_rms || 0.1), 0.1);
  for (const sec of rawSections) {
    const normEnergy = Number(Math.min(1.0, (sec.avg_rms || 0.1) / maxRms).toFixed(2));
    let phase = 'driving_phrase';
    if (sec.start === 0) phase = 'intro_buildup';
    else if (normEnergy >= 0.85) phase = 'main_drop';
    else if (normEnergy >= 0.65) phase = 'first_drop';
    else if (normEnergy <= 0.35) phase = 'breakdown';
    else if (sec.end >= duration - 1.5) phase = 'outro_resolve';

    energyCurve.push({
      time: Number(sec.start.toFixed(2)),
      energy: normEnergy,
      phase,
    });
  }
} else {
  // Fallback if sections not present: sample every 2 seconds
  for (let t = 0; t < duration; t += 2.0) {
    const timeSec = Number(t.toFixed(2));
    const matchingBin = rawBins.find((b: any) => Math.abs(b.time - timeSec) < 0.1);
    const rms = matchingBin ? matchingBin.rms : 0.2;
    energyCurve.push({
      time: timeSec,
      energy: Number(Math.min(1.0, rms * 3.5).toFixed(2)),
      phase: t === 0 ? 'intro_buildup' : t >= duration - 2.0 ? 'outro_resolve' : 'driving_phrase',
    });
  }
}

// 4. Identify Cut Windows
interface CutWindow {
  time: number;
  strength: 'strongest' | 'strong' | 'medium' | 'weak';
  reason: string;
}
const cutWindows: CutWindow[] = [];
const transients = analysis.transients || [];

// Phrase boundaries are strong cut opportunities
for (const pb of phraseBoundaries) {
  if (pb === 0 || pb >= duration - 0.3) continue;

  const nearbySec = rawSections.find((s: any) => Math.abs(s.start - pb) < 0.3);
  const isHighEnergy = nearbySec && (nearbySec.label === 'peak_energy' || nearbySec.avg_rms > 0.25);

  cutWindows.push({
    time: pb,
    strength: isHighEnergy ? 'strongest' : 'strong',
    reason: isHighEnergy ? 'phrase_boundary + energy_jump' : 'phrase_boundary',
  });
}

// Transients that are strong impacts
for (const tr of transients) {
  if (tr.strength > 0.22 && tr.time > 0.3 && tr.time < duration - 0.5) {
    const alreadyPresent = cutWindows.some(cw => Math.abs(cw.time - tr.time) < 0.15);
    if (!alreadyPresent) {
      cutWindows.push({
        time: tr.time,
        strength: tr.strength > 0.35 ? 'strongest' : 'strong',
        reason: `transient_${tr.type || 'impact'} (strength: ${tr.strength})`,
      });
    }
  }
}

// Downbeats that aren't already included
for (const bg of beatGrid) {
  if (bg.type === 'downbeat' && bg.time > 0.5 && bg.time < duration - 0.5) {
    const alreadyPresent = cutWindows.some(cw => Math.abs(cw.time - bg.time) < 0.2);
    if (!alreadyPresent) {
      cutWindows.push({
        time: bg.time,
        strength: 'medium',
        reason: `bar_${bg.bar_number}_downbeat`,
      });
    }
  }
}

// Sort cut windows chronologically
cutWindows.sort((a, b) => a.time - b.time);

// 5. Identify Hold Zones (sections with low energy or breakdown)
const holdZones: Array<{ start: number; end: number; reason: string }> = [];

for (const sec of rawSections) {
  if (sec.label === 'breakdown_silence' || (sec.avg_rms < 0.12 && (sec.end - sec.start) >= 0.8)) {
    holdZones.push({
      start: Number(sec.start.toFixed(2)),
      end: Number(sec.end.toFixed(2)),
      reason: 'musical_breakdown — visual hold allows viewer absorption',
    });
  }
}

// 6. Build Temporal Skeleton
const temporalSkeleton = {
  temporal_skeleton: {
    project: projectSlug,
    source: analysis.source || 'ref_audio.wav',
    bpm,
    time_signature: '4/4',
    total_duration: Number(duration.toFixed(2)),
    energy_curve: energyCurve,
    phrase_boundaries: phraseBoundaries,
    cut_windows: cutWindows,
    hold_zones: holdZones,
    beat_grid: beatGrid,
  },
};

// Target output path (00_Audio primary, mirror to 02_Analyzer/audio if present)
const targetDir00 = path.join(projectDir, '00_Audio');
fs.mkdirSync(targetDir00, { recursive: true });
const targetFile00 = path.join(targetDir00, 'temporal_skeleton.yaml');

fs.writeFileSync(targetFile00, YAML.stringify(temporalSkeleton, { indent: 2 }), 'utf8');
console.log(`Saved skeleton to: ${path.relative(rootDir, targetFile00)}`);

const targetDir02 = path.join(projectDir, '02_Analyzer', 'audio');
if (fs.existsSync(targetDir02)) {
  const targetFile02 = path.join(targetDir02, 'temporal_skeleton.yaml');
  fs.writeFileSync(targetFile02, YAML.stringify(temporalSkeleton, { indent: 2 }), 'utf8');
  console.log(`Mirrored skeleton to: ${path.relative(rootDir, targetFile02)}`);
}

console.log(`\n✅ Temporal Skeleton Built:`);
console.log(`   Phrase boundaries: ${phraseBoundaries.length} points`);
console.log(`   Cut windows:       ${cutWindows.length} opportunities (${cutWindows.filter(c => c.strength === 'strongest' || c.strength === 'strong').length} strong/strongest)`);
console.log(`   Hold zones:        ${holdZones.length} cognitive breathing spaces`);
console.log(`   Beat grid:         ${beatGrid.length} beats mapped in 4/4\n`);
