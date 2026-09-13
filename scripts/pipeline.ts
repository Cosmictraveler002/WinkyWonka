import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

const command = process.argv[2];
const projectSlug = process.argv[3];

if (!command || !projectSlug) {
  console.log(`
Usage:
  bun scripts/pipeline.ts init <project-slug>   # Scaffold a new audio-first, scene-deconstruction video project
  bun scripts/pipeline.ts run <project-slug>    # Run automated pipeline (Audio -> Sync -> Refine -> Sheets -> Critic)
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

  // 1. Create standard audio-first directory tree
  const dirs = [
    path.join(projectDir, '00_Audio'),
    path.join(projectDir, '01_Reference', 'video'),
    path.join(projectDir, '01_Reference', 'images'),
    path.join(projectDir, '02_Deconstruction', 'frames'),
    path.join(projectDir, '03_Planner', 'scenes'),
    path.join(projectDir, '04_Assets', 'scene_01'),
    path.join(projectDir, '05_Code', 'scenes'),
  ];

  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // 2. Create SCRIPT_INTAKE.yaml template (Phase 2 user creative intake)
  const scriptIntakeContent = {
    script_intake: {
      project: projectSlug,
      format: '', // 'product_launch' | 'social_ad' | 'explainer' | 'brand_film' | 'other'
      audience: '',
      emotional_goal: '', // 'excitement' | 'trust' | 'curiosity' | 'urgency'
      primary_cta: '',
      core_message: '', // single sentence viewer should remember
      duration_target_seconds: null,
      brand: {
        logo_path: '',
        tagline: '',
        tone_of_voice: '',
        mandatory_colors: [],
      },
      restrictions: [], // anything the video must NOT include
    },
  };
  fs.writeFileSync(
    path.join(projectDir, '03_Planner', 'SCRIPT_INTAKE.yaml'),
    YAML.stringify(scriptIntakeContent, { indent: 2 })
  );

  // Initialize Phase Tracker & Progress Manifest
  spawnSync(process.execPath, ['scripts/phase-tracker.ts', 'sync', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });

  console.log(`✅ Project scaffolded successfully in: ${projectDir}`);
  console.log(`\n📂 New Audio-First Directory Architecture:`);
  console.log(`   00_Audio/              -> Foundational soundtrack, beat analysis & temporal skeleton`);
  console.log(`   01_Reference/          -> Reference videos & moodboard images`);
  console.log(`   02_Deconstruction/     -> Scene snapshots, temporal & visual deconstruction`);
  console.log(`   03_Planner/            -> User creative intake, script, rhythm audit & storyboard`);
  console.log(`   04_Assets/             -> Co-designed production assets`);
  console.log(`   05_Code/               -> Remotion composition & scene components`);
  console.log(`\nNext Steps (Chat Protocol):`);
  console.log(`  1. Place reference video in: projects/${projectSlug}/01_Reference/video/`);
  console.log(`  2. Phase 1A: Agent watches reference video and drafts TEMPORAL_ANALYSIS.yaml`);
  console.log(`  3. Phase 1B: Run bun run deconstruct:frames ${projectSlug} scene_deconstruct`);
  console.log(`  4. Phase 1C: Place soundtrack in 00_Audio/ or let agent find royalty-free match, then run bun run audio:skeleton ${projectSlug}`);
  console.log(`  5. Phase 2: Agent conducts structured user intake and drafts SCRIPT.md`);
  console.log(`  6. Phase 3.7: Lock STORYBOARD.yaml with user approval before build!\n`);
} else if (command === 'run') {
  console.log(`\n========================================`);
  console.log(`⚡ RUNNING PIPELINE: "${projectSlug}"`);
  console.log(`========================================\n`);

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: Project directory "${projectSlug}" not found at ${projectDir}`);
    process.exit(1);
  }

  const bunExe = process.execPath;
  const deconstructDir = path.join(projectDir, '02_Deconstruction');
  const legacyAnalyzerDir = path.join(projectDir, '02_Analyzer');
  const analysisDir = fs.existsSync(deconstructDir) ? deconstructDir : legacyAnalyzerDir;

  // Sync and display Phase & Progress Tracker
  spawnSync(bunExe, ['scripts/phase-tracker.ts', 'sync', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });

  // Step 0: Check Audio & Skeleton Foundation
  const skeletonPath00 = path.join(projectDir, '00_Audio', 'temporal_skeleton.yaml');
  const skeletonPath02 = path.join(projectDir, '02_Analyzer', 'audio', 'temporal_skeleton.yaml');
  const hasSkeleton = fs.existsSync(skeletonPath00) || fs.existsSync(skeletonPath02);

  if (!hasSkeleton) {
    console.log(`[0/6] 🦴 Temporal skeleton not found. Attempting audio pipeline extraction & analysis...`);
    const audioRes = spawnSync(bunExe, ['scripts/audio/pipeline.ts', projectSlug], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    if (audioRes.status === 0) {
      spawnSync(bunExe, ['scripts/audio/skeleton.ts', projectSlug], {
        stdio: 'inherit',
        cwd: rootDir,
      });
    } else {
      console.warn(`⚠️ Could not complete automated audio pipeline. Proceeding with existing assets.`);
    }
  }

  // Step 1: Check Asset Readiness
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

  // Step 2: Sync Assets
  console.log(`[1/5] 📦 Synchronizing assets to public directory...`);
  const syncResult = spawnSync(bunExe, ['scripts/sync-assets.ts', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (syncResult.status !== 0) {
    console.error(`❌ Asset sync failed.`);
    process.exit(syncResult.status || 1);
  }

  // Step 3: Audio Production Pipeline (Cached if already mastered)
  const masterAudio00 = path.join(projectDir, '00_Audio', 'soundtrack.wav');
  const masterAudio02 = path.join(projectDir, '02_Analyzer', 'audio', 'soundtrack.wav');
  const isAudioMastered = hasSkeleton && (fs.existsSync(masterAudio00) || fs.existsSync(masterAudio02));

  if (!isAudioMastered) {
    console.log(`\n[2/5] 🎵 Running Audio Pipeline (Extract → Analyze → Map → Compose → Master → Verify)...`);
    const audioResult = spawnSync(bunExe, ['scripts/audio/pipeline.ts', projectSlug], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    if (audioResult.status !== 0) {
      console.error(`❌ Audio pipeline failed.`);
      process.exit(audioResult.status || 1);
    }
  } else {
    console.log(`\n[2/5] 🎵 Audio Foundation & Beat Grid already mastered. Using cached soundtrack.wav & temporal_skeleton.yaml.`);
  }

  // ---------------------------------------------------------------------------
  // MANDATORY HUMAN GATE: PHASE 3.7 STORYBOARD & SCRIPT APPROVAL CHECK
  // ---------------------------------------------------------------------------
  const storyboardPath = path.join(projectDir, '03_Planner', 'STORYBOARD.yaml');
  let isStoryboardApproved = false;
  let approverName = '';

  if (fs.existsSync(storyboardPath)) {
    try {
      const sbData = YAML.parse(fs.readFileSync(storyboardPath, 'utf8'));
      if (sbData?.human_approval?.status === 'approved') {
        isStoryboardApproved = true;
        approverName = sbData.human_approval.approved_by || 'user';
      }
    } catch {}
  }

  if (!isStoryboardApproved) {
    console.log(`\n================================================================================`);
    console.log(`⛔ MANDATORY HUMAN GATE BLOCKED: PHASE 3.7 APPROVAL REQUIRED`);
    console.log(`================================================================================`);
    console.log(`The storyboard for "${projectSlug}" has NOT been approved by the user.`);
    console.log(`Per SKILL.md and Motion Rulebook invariants:`);
    console.log(`  • The agent MUST present the storyboard / script to the user in chat.`);
    console.log(`  • Automated code generation, contact sheets, and refinement CANNOT proceed`);
    console.log(`    without explicit user sign-off.`);
    console.log(`\n👉 NEXT ACTION:`);
    console.log(`   1. Present the storyboard in chat to the user.`);
    console.log(`   2. Once confirmed, run:`);
    console.log(`      bun scripts/storyboard-director.ts approve ${projectSlug}`);
    console.log(`   3. Then re-run the pipeline.`);
    console.log(`================================================================================\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ Phase 3.7 Human Gate Verified: Storyboard approved by "${approverName}". Proceeding.`);
  }

  // Step 4: Generate Storyboard Contact Sheets (Fast Structural Audit)
  console.log(`\n[3/6] 🖼️  Generating Storyboard Contact Sheets (Sparse structural frames)...`);
  const sbResult = spawnSync(bunExe, ['scripts/generate-contact-sheets.ts', projectSlug, 'storyboard'], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (sbResult.status !== 0) {
    console.error(`❌ Storyboard contact sheet generation failed.`);
    process.exit(sbResult.status || 1);
  }

  // Step 5: Visual Refinement Loop Check / Render
  console.log(`\n[4/6] 🔄 Checking Visual Refinement Loop Status...`);
  const refinementStatePath = path.join(analysisDir, 'REFINEMENT_STATE.yaml');
  let refinementStatus = 'not_started';
  if (fs.existsSync(refinementStatePath)) {
    try {
      const rState = YAML.parse(fs.readFileSync(refinementStatePath, 'utf8'));
      refinementStatus = rState?.status || 'not_started';
    } catch {}
  }

  if (refinementStatus !== 'converged') {
    console.log(`⚡ Running Visual Refinement Render (Iteration render & frame extraction)...`);
    const refineResult = spawnSync(bunExe, ['scripts/refine-loop.ts', 'render', projectSlug], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    if (refineResult.status !== 0) {
      console.warn(`⚠️ Visual refinement render reported non-zero status.`);
    }
  } else {
    console.log(`✅ Visual Refinement Loop already CONVERGED. Skipping draft re-render.`);
  }

  // Step 6: Run Critic Agent Audit
  console.log(`\n[5/6] 🤖 Running Critic Agent Vision & Rhythm Audit...`);
  const criticResult = spawnSync(bunExe, ['scripts/critic-audit.ts', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  if (criticResult.status !== 0) {
    console.error(`❌ Critic audit failed.`);
    process.exit(criticResult.status || 1);
  }

  // Check audit score from critique.json
  const critiqueJsonPath = path.join(analysisDir, 'critique.json');
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
    console.log(`      projects/${projectSlug}/02_Deconstruction/contact_sheets_storyboard/`);
    console.log(`      projects/${projectSlug}/02_Deconstruction/contact_sheets_motion/`);
    console.log(`\n⚠️  CRITICAL: Production render requires explicit human approval in chat!`);
  } else {
    console.log(`⚠️  QUALITY GATE WARNING (Score < 90).`);
    console.log(`   Review patch suggestions in:`);
    console.log(`   projects/${projectSlug}/${path.basename(analysisDir)}/critique.md\n`);
  }

  // Final Phase Tracker Sync & Summary
  spawnSync(bunExe, ['scripts/phase-tracker.ts', 'sync', projectSlug], {
    stdio: 'inherit',
    cwd: rootDir,
  });
} else {
  console.error(`Unknown command: "${command}". Use "init" or "run".`);
  process.exit(1);
}
