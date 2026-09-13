/**
 * End-to-End Audio Pipeline Orchestrator
 * 
 * Runs all 6 audio stages in sequence:
 * [1/6] Extract -> [2/6] Analyze -> [3/6] Map -> [4/6] Compose -> [5/6] Master -> [6/6] Verify
 * 
 * Usage:
 *   bun scripts/audio/pipeline.ts <project-slug> [--force-map]
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const projectSlug = process.argv[2];
const forceMap = process.argv.includes('--force-map');

if (!projectSlug || projectSlug.startsWith('--')) {
  console.error(`
Usage:
  bun scripts/audio/pipeline.ts <project-slug> [--force-map]

Example:
  bun scripts/audio/pipeline.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const bunExe = process.execPath;

console.log(`\n╔════════════════════════════════════════════════════╗`);
console.log(`║      6-STEP AUDIO PRODUCTION PIPELINE              ║`);
console.log(`║      Project: ${projectSlug.padEnd(36)} ║`);
console.log(`╚════════════════════════════════════════════════════╝\n`);

const steps = [
  {
    name: 'Step 1: Extract Audio from Reference',
    script: 'scripts/audio/extract.ts',
    args: [projectSlug],
  },
  {
    name: 'Step 2: Structural & Spectral Analysis',
    script: 'scripts/audio/analyze.ts',
    args: [projectSlug],
  },
  {
    name: 'Step 2.5: Build Temporal Skeleton (Beat Grid & Cut Windows)',
    script: 'scripts/audio/skeleton.ts',
    args: [projectSlug],
  },
  {
    name: 'Step 3: Map Audio Timeline',
    script: 'scripts/audio/map.ts',
    args: forceMap ? [projectSlug, '--force'] : [projectSlug],
  },
  {
    name: 'Step 4: Compose & Assemble Segments',
    script: 'scripts/audio/compose.ts',
    args: [projectSlug],
  },
  {
    name: 'Step 5: Master Audio (Reverb, Dynamics, Limiter)',
    script: 'scripts/audio/master.ts',
    args: [projectSlug],
  },
  {
    name: 'Step 6: Verify Quality & Generate Energy Chart',
    script: 'scripts/audio/verify.ts',
    args: [projectSlug],
  },
];

const startTime = Date.now();

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  console.log(`\n▶ [${i + 1}/${steps.length}] ${step.name}`);

  const res = spawnSync(bunExe, [path.join(rootDir, step.script), ...step.args], {
    stdio: 'inherit',
    cwd: rootDir,
  });

  if (res.status !== 0) {
    console.error(`\n❌ Pipeline halted: ${step.name} failed with exit code ${res.status}.`);
    process.exit(res.status || 1);
  }
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\n════════════════════════════════════════════════════`);
console.log(`🎉 Audio Pipeline completed successfully in ${elapsedSec}s!`);
console.log(`   Mastered Track:  projects/${projectSlug}/04_Assets/audio/soundtrack.wav`);
console.log(`   Public Asset:    public/projects/${projectSlug}/soundtrack.wav`);
console.log(`   Energy Chart:    projects/${projectSlug}/02_Analyzer/audio/energy_chart.svg`);
console.log(`════════════════════════════════════════════════════\n`);
