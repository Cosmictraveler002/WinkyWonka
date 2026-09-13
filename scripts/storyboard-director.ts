import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  loadProjectContext,
  formulateStoryDirection,
  compileStoryboard,
  saveStoryboard,
  recordHumanDecision,
  validateCreativeRulebook,
  type StoryboardManifest,
} from '../src/storyboard/index.js';

const command = process.argv[2];
const projectSlug = process.argv[3];

if (!command || !projectSlug) {
  console.log(`
Usage:
  bun scripts/storyboard-director.ts direction <project-slug>                        # Checkpoint 1: Story Direction proposal
  bun scripts/storyboard-director.ts build <project-slug>                            # Checkpoint 2: Compile shot storyboard
  bun scripts/storyboard-director.ts decide <project-slug> <decision-id> "<choice>"  # Record human creative decision
  bun scripts/storyboard-director.ts approve <project-slug> [user] [notes]           # Checkpoint 3: Record human storyboard approval (Phase 3.7)
  bun scripts/storyboard-director.ts status <project-slug>                           # View storyboard status & checkpoints
  `);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);

if (!fs.existsSync(projectDir)) {
  console.error(`Error: Project "${projectSlug}" not found at ${projectDir}`);
  process.exit(1);
}

const ctx = loadProjectContext(projectDir);

if (command === 'direction') {
  console.log(`\n========================================`);
  console.log(`🎬 STORYBOARD DIRECTOR: CHECKPOINT 1`);
  console.log(`Project: "${projectSlug}"`);
  console.log(`========================================\n`);

  const dir = formulateStoryDirection(ctx);

  console.log(`STORY DIRECTION`);
  console.log(`Core Visual Idea:`);
  console.log(`  ${dir.core_idea}\n`);

  console.log(`Visual Language:`);
  console.log(`  ${dir.visual_language}\n`);

  console.log(`Camera Language:`);
  console.log(`  ${dir.camera_language}\n`);

  console.log(`Editing Language:`);
  console.log(`  ${dir.editing_language}\n`);

  console.log(`Performance Language:`);
  console.log(`  ${dir.performance_language}\n`);

  console.log(`Ending / Reveal Strategy:`);
  console.log(`  ${dir.ending_strategy}\n`);

  console.log(`----------------------------------------`);
  console.log(`MAJOR CREATIVE DECISIONS (Human Input Needed):`);
  console.log(`----------------------------------------\n`);

  for (const dec of dir.major_creative_decisions) {
    const mark = dec.requires_human_choice ? '⏳ [NEEDS HUMAN DECISION]' : '✓ [AUTONOMOUS PROPOSAL]';
    console.log(`[${dec.id}] ${dec.topic} — ${mark}`);
    console.log(`  Proposed: "${dec.proposed_direction}"`);
    if (dec.alternatives.length > 0) {
      console.log(`  Viable Alternatives:`);
      for (const alt of dec.alternatives) {
        console.log(`    • "${alt}"`);
      }
    }
    console.log('');
  }

  console.log(`👉 Next Action:`);
  console.log(`   Approve or choose an alternative for decisions using:`);
  console.log(`   bun scripts/storyboard-director.ts decide ${projectSlug} <decision-id> "<your choice>"`);
  console.log(`   Or compile storyboard directly:`);
  console.log(`   bun scripts/storyboard-director.ts build ${projectSlug}\n`);
} else if (command === 'build') {
  console.log(`\n========================================`);
  console.log(`🎞️  STORYBOARD DIRECTOR: COMPILING SHOT PLAN`);
  console.log(`Project: "${projectSlug}"`);
  console.log(`========================================\n`);

  const manifest = compileStoryboard(ctx);
  const paths = saveStoryboard(projectDir, manifest);

  console.log(`✅ Storyboard compiled successfully!`);
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Total Duration: ${manifest.total_duration_seconds}s (${manifest.total_duration_frames} frames)`);
  console.log(`   Scenes: ${manifest.scenes.length}`);
  const totalShots = manifest.scenes.reduce((acc, sc) => acc + sc.shots.length, 0);
  console.log(`   Total Shots: ${totalShots}`);
  console.log(`   Asset Requirements: ${manifest.asset_requirements.length} item(s)\n`);

  console.log(`📜 Creative Rulebook Audit (creative_rulebook.md):`);
  console.log(`   Status: ${paths.auditResult.passed ? '✓ PASSED' : '⚠️ ISSUES DETECTED'}`);
  console.log(`   Score: ${paths.auditResult.score} / 100 (${paths.auditResult.total_checks} core checks)`);
  if (paths.auditResult.issues.length > 0) {
    for (const issue of paths.auditResult.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`   ${icon} [Rule ${issue.rule_id} ${issue.rule_name}]: ${issue.message}`);
    }
  } else {
    console.log(`   ✓ All 105 principles checked: 1 Primary Target, Cognitive Budget, Holds, Valid Jobs & Payoff Verified.`);
  }
  console.log('');

  console.log(`📁 Generated Artifacts:`);
  console.log(`   • Shot Plan: ${paths.storyboardPath}`);
  console.log(`   • Creative Notes: ${paths.notesPath}`);
  console.log(`   • Rulebook Audit: ${paths.auditPath}`);
  console.log(`   • Asset Requirements: ${paths.assetReqsPath}`);
  if (paths.feedbackPath) {
    console.log(`   • Script Feedback: ${paths.feedbackPath}`);
  }
  console.log('');
} else if (command === 'decide') {
  const decisionId = process.argv[4];
  const choice = process.argv[5];
  const reason = process.argv[6];

  if (!decisionId || !choice) {
    console.error('Usage: bun scripts/storyboard-director.ts decide <project-slug> <decision-id> "<choice>" [reason]');
    process.exit(1);
  }

  console.log(`\n📝 Recording human creative decision: [${decisionId}]`);
  const dec = recordHumanDecision(projectDir, decisionId, choice, reason);
  console.log(`✅ Decision saved: "${dec.human_decision}"`);

  // Recompile storyboard with the updated decision
  const updatedCtx = loadProjectContext(projectDir);
  const manifest = compileStoryboard(updatedCtx);
  saveStoryboard(projectDir, manifest);

  console.log(`💾 Storyboard re-compiled with decision ${decisionId}.\n`);
} else if (command === 'approve') {
  const storyboardPath = path.join(projectDir, '03_Planner', 'STORYBOARD.yaml');
  if (!fs.existsSync(storyboardPath)) {
    console.error(`❌ Error: STORYBOARD.yaml not found at ${storyboardPath}`);
    process.exit(1);
  }

  const manifest = YAML.parse(fs.readFileSync(storyboardPath, 'utf8'));
  const approvedBy = process.argv[4] || 'user';
  const notes = process.argv[5] || 'Explicitly approved by user in chat';

  manifest.human_approval = {
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
    notes,
  };

  fs.writeFileSync(storyboardPath, YAML.stringify(manifest, { indent: 2 }));

  console.log(`\n========================================`);
  console.log(`🎉 STORYBOARD APPROVED (PHASE 3.7 HUMAN GATE PASSED)`);
  console.log(`Project: "${projectSlug}"`);
  console.log(`Approved by: ${approvedBy}`);
  console.log(`Timestamp: ${manifest.human_approval.approved_at}`);
  console.log(`========================================`);
  console.log(`Phase 4 Builder Agent and automated pipelines are now UNLOCKED.\n`);
} else if (command === 'status') {
  const storyboardPath = path.join(projectDir, '03_Planner', 'STORYBOARD.yaml');
  const decisionsPath = path.join(projectDir, '03_Planner', 'STORYBOARD_DECISIONS.yaml');
  const auditPath = path.join(projectDir, '03_Planner', 'RULEBOOK_AUDIT.yaml');

  console.log(`\n========================================`);
  console.log(`📊 STORYBOARD STATUS: "${projectSlug}"`);
  console.log(`========================================\n`);

  if (!fs.existsSync(storyboardPath)) {
    console.log(`No active storyboard found. Run "bun scripts/storyboard-director.ts build ${projectSlug}" to generate one.`);
    process.exit(0);
  }

  const manifest: StoryboardManifest = YAML.parse(fs.readFileSync(storyboardPath, 'utf8'));
  console.log(`Version: ${manifest.version}`);
  const approvalStatus = manifest.human_approval?.status === 'approved'
    ? `✓ APPROVED (by ${manifest.human_approval.approved_by} on ${manifest.human_approval.approved_at})`
    : '⏳ PENDING (Phase 3.7 Human Gate requires user sign-off)';
  console.log(`Human Approval: ${approvalStatus}`);
  console.log(`Duration: ${manifest.total_duration_seconds}s (${manifest.total_duration_frames} frames)`);
  console.log(`Scenes: ${manifest.scenes.length}`);

  let totalShots = 0;
  for (const sc of manifest.scenes) {
    const shotCount = (sc.shots || []).length;
    totalShots += shotCount;
    console.log(`  • ${sc.id} ("${sc.title}"): ${shotCount} shots (${sc.total_duration_seconds}s)`);
  }
  console.log(`\nTotal Shots: ${totalShots}`);
  console.log(`Required External Assets: ${(manifest.asset_requirements || []).length}`);

  // Rulebook status
  const auditResult = fs.existsSync(auditPath)
    ? YAML.parse(fs.readFileSync(auditPath, 'utf8'))
    : validateCreativeRulebook(manifest);

  console.log(`\n📜 Creative Rulebook Audit:`);
  console.log(`  Status: ${auditResult.passed ? '✓ PASSED' : '⚠️ ISSUES DETECTED'} (Score: ${auditResult.score}/100)`);
  if (auditResult.issues && auditResult.issues.length > 0) {
    for (const is of auditResult.issues) {
      console.log(`  - [Rule ${is.rule_id}]: ${is.message}`);
    }
  }

  if (fs.existsSync(decisionsPath)) {
    const decData = YAML.parse(fs.readFileSync(decisionsPath, 'utf8'));
    console.log(`\nRecorded Human Decisions: ${(decData.decisions || []).length}`);
    for (const d of decData.decisions || []) {
      console.log(`  ✓ [${d.id}]: "${d.human_decision}"`);
    }
  }

  if (manifest.script_notes && manifest.script_notes.length > 0) {
    console.log(`\n⚠️  Script Notes (${manifest.script_notes.length}):`);
    for (const sn of manifest.script_notes) {
      console.log(`  - [${sn.id}] ${sn.location}: ${sn.issue}`);
    }
  }

  console.log('\n');
} else {
  console.error(`Unknown command: "${command}".`);
  process.exit(1);
}
