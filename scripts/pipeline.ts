import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

const command = process.argv[2];
const projectSlug = process.argv[3];

if (!command || !projectSlug) {
  console.log(`
Usage:
  bun scripts/pipeline.ts init <project-slug>   # Scaffold a new 5-stage video project
  bun scripts/pipeline.ts run <project-slug>    # Run automated pipeline (Sync -> Sheets -> Critic)
  `);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);

if (command === 'init') {
  console.log(`\n========================================`);
  console.log(`🚀 INITIALIZING PROJECT: "${projectSlug}"`);
  console.log(`========================================\n`);

  if (fs.existsSync(projectDir)) {
    console.error(`Error: Project directory "${projectSlug}" already exists at ${projectDir}`);
    process.exit(1);
  }

  // 1. Create standard 5-stage directory tree
  const dirs = [
    path.join(projectDir, '01_Reference', 'video'),
    path.join(projectDir, '01_Reference', 'images'),
    path.join(projectDir, '02_Analyzer', 'frames'),
    path.join(projectDir, '03_Planner', 'scenes'),
    path.join(projectDir, '04_Assets', 'scene_01'),
    path.join(projectDir, '05_Code', 'scenes'),
  ];

  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // 2. Create core_aesthetic.yaml template
  const aestheticContent = {
    project: projectSlug,
    aesthetic: {
      style: 'editorial-dark',
      colors: {
        background: '#0a0e17',
        surface: '#111827',
        accent: '#06b6d4',
        accent_secondary: '#ec4899',
        text_primary: '#ffffff',
        text_muted: '#94a3b8',
      },
      typography: {
        primary: 'Inter, sans-serif',
        display: 'Outfit, sans-serif',
        mono: 'JetBrains Mono, monospace',
      },
      springs: {
        snappy: { damping: 15, stiffness: 220, mass: 0.8 },
        smooth: { damping: 20, stiffness: 120, mass: 1.0 },
        bouncy: { damping: 10, stiffness: 180, mass: 0.9 },
      },
    },
  };
  fs.writeFileSync(path.join(projectDir, '03_Planner', 'core_aesthetic.yaml'), YAML.stringify(aestheticContent));

  // 3. Create timeline.yaml template adhering to rhythm_system.md Template D (3:2:1)
  const timelineContent = {
    project: projectSlug,
    fps: 30,
    width: 1920,
    height: 1080,
    rhythm_template: 'Template D (3:2:1)',
    pacing_curve: 'FAST_HOOK -> ACCELERATE -> IMPACT_PAYOFF',
    scenes: [
      {
        id: 'scene_01',
        title: 'Opening Hook',
        duration_in_frames: 75,
        duration_in_seconds: 2.5,
        transition_to_next: 'slideLeft',
        transition_duration: 15,
      },
      {
        id: 'scene_02',
        title: 'Feature Showcase',
        duration_in_frames: 55,
        duration_in_seconds: 1.83,
        transition_to_next: 'crossFade',
        transition_duration: 15,
      },
      {
        id: 'scene_03',
        title: 'Decisive Payoff & CTA',
        duration_in_frames: 90,
        duration_in_seconds: 3.0,
      },
    ],
  };
  fs.writeFileSync(path.join(projectDir, '03_Planner', 'timeline.yaml'), YAML.stringify(timelineContent));

  // 4. Create scene_01.yaml template
  const scene01Content = {
    scene_id: 'scene_01',
    title: 'Opening Hook',
    duration_frames: 75,
    camera: {
      movement: 'subtle-zoom-in',
      start_scale: 1.0,
      end_scale: 1.05,
    },
    layers: [
      {
        type: 'Background',
        component: 'GradientBackground',
        params: {
          colorStart: '#0a0e17',
          colorEnd: '#1e1b4b',
          angle: 135,
        },
      },
      {
        type: 'Typography',
        component: 'Headline',
        params: {
          text: 'PRECISION MOTION',
          preset: 'kinetic',
          delay: 0,
        },
      },
      {
        type: 'Typography',
        component: 'Caption',
        params: {
          text: 'Declarative animation at 60fps',
          delay: 15,
        },
      },
    ],
  };
  fs.writeFileSync(path.join(projectDir, '03_Planner', 'scenes', 'scene_01.yaml'), YAML.stringify(scene01Content));

  console.log(`✅ Project scaffolded successfully in: ${projectDir}`);
  console.log(`\nNext Steps:`);
  console.log(`  1. Place reference videos/images into: projects/${projectSlug}/01_Reference/`);
  console.log(`  2. Refine storyboards in: projects/${projectSlug}/03_Planner/`);
  console.log(`  3. Build components in: projects/${projectSlug}/05_Code/scenes/`);
  console.log(`  4. Run automated pipeline: bun run pipeline:run ${projectSlug}\n`);
} else if (command === 'run') {
  console.log(`\n========================================`);
  console.log(`⚡ RUNNING PIPELINE: "${projectSlug}"`);
  console.log(`========================================\n`);

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: Project directory "${projectSlug}" not found at ${projectDir}`);
    process.exit(1);
  }

  const bunExe = process.execPath;

  // Step 0: Check Asset Readiness
  const reqPath = path.join(projectDir, '04_Assets', 'ASSET_REQUIREMENTS.yaml');
  const manifestPath = path.join(projectDir, '04_Assets', 'ASSET_MANIFEST.yaml');
  if (fs.existsSync(reqPath)) {
    try {
      const reqData = YAML.parse(fs.readFileSync(reqPath, 'utf8'));
      const manifestData = fs.existsSync(manifestPath) ? YAML.parse(fs.readFileSync(manifestPath, 'utf8')) : { assets: [] };
      const registeredIds = new Set((manifestData.assets || []).map((a: any) => a.id));
      const unresolved = (reqData.asset_requirements || []).filter((r: any) => r.required && !registeredIds.has(r.id));

      if (unresolved.length > 0) {
        console.log(`⚠️  ASSET READINESS WARNING: ${unresolved.length} required asset(s) unresolved:`);
        for (const u of unresolved) {
          console.log(`   • ${u.id}: "${u.name}" (Scenes: ${u.targetScenes.join(', ')})`);
        }
        console.log(`   💡 Ask the user in chat or run: bun run assets:next ${projectSlug}\n`);
      }
    } catch {}
  }

  // Step 1: Sync Assets
  console.log(`[1/5] 📦 Synchronizing assets to public directory...`);
  const syncResult = spawnSync(bunExe, ['scripts/sync-assets.ts', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (syncResult.status !== 0) {
    console.error(`❌ Asset sync failed.`);
    process.exit(syncResult.status || 1);
  }

  // Step 2: Audio Production Pipeline
  console.log(`\n[2/5] 🎵 Running Audio Pipeline (Extract → Analyze → Map → Compose → Master → Verify)...`);
  const audioResult = spawnSync(bunExe, ['scripts/audio/pipeline.ts', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (audioResult.status !== 0) {
    console.error(`❌ Audio pipeline failed.`);
    process.exit(audioResult.status || 1);
  }

  // Step 3: Generate Storyboard Contact Sheets (Fast Structural Audit)
  console.log(`\n[3/5] 🖼️  Generating Storyboard Contact Sheets (Sparse structural frames)...`);
  const sbResult = spawnSync(bunExe, ['scripts/generate-contact-sheets.ts', projectSlug, 'storyboard'], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (sbResult.status !== 0) {
    console.error(`❌ Storyboard contact sheet generation failed.`);
    process.exit(sbResult.status || 1);
  }

  // Step 4: Run Critic Agent Audit
  console.log(`\n[4/5] 🤖 Running Critic Agent Vision & Rhythm Audit...`);
  const criticResult = spawnSync(bunExe, ['scripts/critic-audit.ts', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (criticResult.status !== 0) {
    console.error(`❌ Critic audit failed.`);
    process.exit(criticResult.status || 1);
  }

  // Check audit score from critique.json
  const critiqueJsonPath = path.join(projectDir, '02_Analyzer', 'critique.json');
  let score = 100;
  if (fs.existsSync(critiqueJsonPath)) {
    try {
      const critique = JSON.parse(fs.readFileSync(critiqueJsonPath, 'utf8'));
      score = critique.overallScore ?? 100;
    } catch {
      // ignore
    }
  }

  console.log(`\n========================================`);
  console.log(`🏁 PIPELINE AUDIT COMPLETED (Score: ${score}/100)`);
  console.log(`========================================\n`);

  if (score >= 90) {
    console.log(`🎉 QUALITY GATE PASSED!`);
    console.log(`⚡ Generating Motion Contact Sheets for Pre-Signoff Review...`);
    spawnSync(bunExe, ['scripts/generate-contact-sheets.ts', projectSlug, 'motion'], {
      stdio: 'inherit',
      cwd: rootDir,
    });

    console.log(`\n👉 PHASE 8: REMOTION STUDIO PREVIEW & HUMAN APPROVAL`);
    console.log(`   1. Launch Remotion Studio:`);
    console.log(`      bun run dev`);
    console.log(`   2. Open http://localhost:3000 to preview the video timeline.`);
    console.log(`   3. Review visual contact sheets in:`);
    console.log(`      projects/${projectSlug}/02_Analyzer/contact_sheets_storyboard/`);
    console.log(`      projects/${projectSlug}/02_Analyzer/contact_sheets_motion/`);
    console.log(`\n⚠️  CRITICAL: Production render requires explicit human approval in chat!`);
  } else {
    console.log(`⚠️  QUALITY GATE WARNING (Score < 90).`);
    console.log(`   Review patch suggestions in:`);
    console.log(`   projects/${projectSlug}/02_Analyzer/critique.md\n`);
  }
} else {
  console.error(`Unknown command: "${command}". Use "init" or "run".`);
  process.exit(1);
}
