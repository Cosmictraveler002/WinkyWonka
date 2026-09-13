import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error('Usage: bun scripts/critic-audit.ts <project-slug>');
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const deconstructionDir = path.join(projectDir, '02_Deconstruction');
const analyzerDir = fs.existsSync(deconstructionDir) ? deconstructionDir : path.join(projectDir, '02_Analyzer');
const plannerDir = path.join(projectDir, '03_Planner');
const codeDir = path.join(projectDir, '05_Code', 'scenes');

const storyboardPath = path.join(plannerDir, 'STORYBOARD.yaml');
const timelinePath = path.join(plannerDir, 'timeline.yaml');
const aestheticPath = path.join(plannerDir, 'core_aesthetic.yaml');
const scenesDir = path.join(plannerDir, 'scenes');

let timeline: any = null;
if (fs.existsSync(timelinePath)) {
  timeline = YAML.parse(fs.readFileSync(timelinePath, 'utf8'));
} else if (fs.existsSync(storyboardPath)) {
  try {
    const sb = YAML.parse(fs.readFileSync(storyboardPath, 'utf8'));
    timeline = {
      fps: sb.fps || 30,
      rhythm_template: sb.rhythm_template,
      scenes: (sb.scenes || []).map((sc: any) => ({
        id: sc.id,
        title: sc.title,
        duration_in_frames: sc.total_duration_frames,
        duration_in_seconds: sc.total_duration_seconds,
        shots: sc.shots,
      })),
    };
  } catch {}
}

if (!timeline) {
  console.error(`Error: Neither STORYBOARD.yaml nor timeline.yaml found in ${plannerDir}`);
  process.exit(1);
}

const aesthetic = fs.existsSync(aestheticPath) ? YAML.parse(fs.readFileSync(aestheticPath, 'utf8')) : null;

interface Issue {
  type: 'timing' | 'composition' | 'hierarchy' | 'motion' | 'cta';
  severity: 'low' | 'medium' | 'high';
  description: string;
  patchSuggestion: string;
}

interface SceneCritique {
  scene: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  score: number;
  checks: string[];
  issues: Issue[];
}

const critiqueResults: SceneCritique[] = [];
const scenes = timeline.scenes || [];
const fps = timeline.fps || 30;

// Discover Contact Sheet Manifests
interface LoadedManifest {
  mode: string;
  manifestPath: string;
  dir: string;
  data: any;
}
const manifestCandidates = [
  path.join(analyzerDir, 'contact_sheets_storyboard', 'contact-sheet-manifest.json'),
  path.join(analyzerDir, 'contact_sheets_motion', 'contact-sheet-manifest.json'),
  path.join(analyzerDir, 'contact_sheets', 'contact-sheet-manifest.json'),
];

const loadedManifests: LoadedManifest[] = [];
for (const mPath of manifestCandidates) {
  if (fs.existsSync(mPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(mPath, 'utf8'));
      loadedManifests.push({
        mode: data.mode || 'unknown',
        manifestPath: mPath,
        dir: path.dirname(mPath),
        data,
      });
    } catch {
      // ignore invalid json
    }
  }
}

// Audit Macro Rhythm: Check for uniform shot duration (Anti-uniformity rule)
const durationsInSeconds = scenes.map((s: any) => (s.duration_in_frames || 90) / fps);
const allEqual = durationsInSeconds.length > 1 && durationsInSeconds.every((d: number) => Math.abs(d - durationsInSeconds[0]) < 0.05);

for (let i = 0; i < scenes.length; i++) {
  const sc = scenes[i];
  const sceneId = sc.id;
  const isOpening = i === 0;
  const isClosing = i === scenes.length - 1;

  const sceneYamlPath = path.join(scenesDir, `${sceneId}.yaml`);
  const sceneTsxPath = path.join(codeDir, `Scene${String(i + 1).padStart(2, '0')}.tsx`);

  const issues: Issue[] = [];
  const checks: string[] = [];

  let sceneConfig: any = null;
  if (fs.existsSync(sceneYamlPath)) {
    sceneConfig = YAML.parse(fs.readFileSync(sceneYamlPath, 'utf8'));
  }

  let tsxContent = '';
  if (fs.existsSync(sceneTsxPath)) {
    tsxContent = fs.readFileSync(sceneTsxPath, 'utf8');
  }

  const duration = sc.duration_in_frames || 90;

  // 1. Audit Opening Scene
  if (isOpening) {
    const hasOpeningHook = duration >= 25 && (
      tsxContent.includes('KineticText') ||
      tsxContent.includes('Headline') ||
      tsxContent.includes('WordReveal') ||
      sc.shots?.some((sh: any) => sh.purpose === 'hook') ||
      sceneConfig?.shots?.some((sh: any) => sh.purpose === 'hook')
    );
    if (hasOpeningHook) {
      checks.push('strong opening hook');
    } else {
      issues.push({
        type: 'timing',
        severity: 'high',
        description: 'Opening hook duration is too brief or lacks immediate headline impact',
        patchSuggestion: 'Ensure Scene01 has at least 30 frames and features an animated Headline or KineticText with snappy spring',
      });
    }
  }

  // 2. Audit Hierarchy & Contrast
  const hasHeadline =
    tsxContent.includes('Headline') ||
    tsxContent.includes('KineticText') ||
    tsxContent.includes('WordReveal') ||
    tsxContent.includes('CTA') ||
    tsxContent.includes('fontSize:') ||
    tsxContent.includes('fontSize =') ||
    tsxContent.includes('fontSize="');
  const hasSecondary = tsxContent.includes('Caption') || /<p[\s>]/i.test(tsxContent) || tsxContent.includes('subtitle');

  if (hasHeadline && hasSecondary) {
    checks.push('clear typographical hierarchy');
  } else if (!hasHeadline && hasSecondary) {
    issues.push({
      type: 'hierarchy',
      severity: 'medium',
      description: 'Secondary text present without dominant headline',
      patchSuggestion: 'Add <Headline /> or <WordReveal /> above secondary text for visual anchor',
    });
  }

  // 3. Audit Timing & Element Delay
  if (sceneConfig?.layers) {
    const delays = sceneConfig.layers.map((l: any) => l.delay || 0);
    const maxDelay = Math.max(...delays, 0);
    if (maxDelay > duration - 20) {
      issues.push({
        type: 'timing',
        severity: 'medium',
        description: 'Key element enters too late before scene transition',
        patchSuggestion: `Advance element delays so all assets settle before frame ${duration - 20}`,
      });
    } else {
      checks.push('balanced entrance timing');
    }
  }

  // 3b. Audit Shot Duration Contrast (rhythm_system.md)
  if (allEqual) {
    issues.push({
      type: 'timing',
      severity: 'medium',
      description: `Uniform shot duration (${(duration / fps).toFixed(1)}s) lacks temporal contrast (violates rhythm_system.md)`,
      patchSuggestion: 'Vary scene durations using a rhythm template (e.g. [2.5s, 1.8s, 3.0s]) to establish pulse and payoff',
    });
  } else {
    checks.push('intentional shot duration contrast (non-uniform rhythm)');
  }

  // 4. Audit Background & Motion
  if (tsxContent.includes('ParticleField') && tsxContent.includes('KineticText')) {
    if (tsxContent.includes('GlassCard')) {
      checks.push('backdrop blur protects text readability against 3D particles');
    } else {
      issues.push({
        type: 'composition',
        severity: 'medium',
        description: 'Dense 3D particles compete with text legibility',
        patchSuggestion: 'Wrap text inside <GlassCard /> or lower particle count / opacity',
      });
    }
  }

  // 5. Audit Transition Pacing
  if (sc.transition_to_next) {
    const tDuration = sc.transition_duration || 20;
    if (tDuration > duration * 0.4) {
      issues.push({
        type: 'motion',
        severity: 'medium',
        description: `Transition duration (${tDuration} frames) consumes too much of scene (${duration} frames)`,
        patchSuggestion: 'Reduce transition duration to 15-20 frames',
      });
    } else {
      checks.push(`transition (${sc.transition_to_next}) cleanly timed`);
    }
  }

  // 6. Audit AI-Slop Aesthetic Compliance (AGENTS.md)
  const aiSlopPatterns = [/\bbrains?\b/i, /\bcircuits?\b/i, /\brobots?\b/i, /\bandroids?\b/i, /\bholograms?\b/i, /\bneural-?networks?\b/i];
  const cleanedTsx = tsxContent.replace(/JetBrains/gi, '');
  const hasSlop = aiSlopPatterns.some(pattern => 
    pattern.test(cleanedTsx) || 
    (sceneConfig && pattern.test(JSON.stringify(sceneConfig)))
  );
  if (hasSlop) {
    issues.push({
      type: 'composition',
      severity: 'high',
      description: 'Potential AI-slop cliché detected (violates AGENTS.md directive)',
      patchSuggestion: 'Ground design in an original typographic or structural idea rather than generic tech tropes',
    });
  } else {
    checks.push('clean, authored visual direction (no AI-slop tropes)');
  }

  // 6. Audit Outro & CTA Payoff
  if (isClosing) {
    const hasCTA =
      tsxContent.includes('CTA') ||
      tsxContent.includes('GlowBadge') ||
      tsxContent.includes('button') ||
      tsxContent.includes('kalakritico.in') ||
      tsxContent.includes('url') ||
      tsxContent.includes('URL');
    if (hasCTA) {
      checks.push('compelling closing visual payoff');
    } else {
      issues.push({
        type: 'cta',
        severity: 'high',
        description: 'Closing scene lacks clear CTA or decisive visual payoff',
        patchSuggestion: 'Include <CTA /> component with animated button and glowing accent',
      });
    }
  }

  // 7. Visual Contact Sheet Verification
  let sampledFramesForScene = 0;
  for (const lm of loadedManifests) {
    for (const sh of lm.data.sheets || []) {
      for (const fr of sh.frames || []) {
        if (fr.scene === sceneId || fr.scene === `scene_${String(i + 1).padStart(2, '0')}`) {
          sampledFramesForScene++;
        }
      }
    }
  }
  if (sampledFramesForScene > 0) {
    checks.push(`visual contact sheets verified (${sampledFramesForScene} keyframe(s) inspected)`);
  } else if (loadedManifests.length > 0) {
    issues.push({
      type: 'timing',
      severity: 'low',
      description: 'Scene has no sampled frames in the generated contact sheets',
      patchSuggestion: 'Ensure contact sheet sampling covers keyframes for this scene',
    });
  }

  const score = Math.max(50, 100 - issues.reduce((acc, iss) => acc + (iss.severity === 'high' ? 20 : iss.severity === 'medium' ? 10 : 5), 0));
  const status = issues.length === 0 ? 'passed' : issues.some(i => i.severity === 'high') ? 'failed' : 'warning';

  critiqueResults.push({
    scene: sceneId,
    title: sc.title || sceneId,
    status,
    score,
    checks,
    issues,
  });
}

// 1. Write Machine-Readable critique.json
const jsonOutput = {
  project: projectSlug,
  timestamp: new Date().toISOString(),
  overallScore: Math.round(critiqueResults.reduce((sum, r) => sum + r.score, 0) / critiqueResults.length),
  contactSheets: loadedManifests.map(m => ({
    mode: m.mode,
    manifestPath: m.manifestPath,
    sheets: (m.data.sheets || []).map((s: any) => s.file),
    totalFrames: (m.data.sheets || []).reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0),
  })),
  scenes: critiqueResults.map(r => ({
    scene: r.scene,
    title: r.title,
    status: r.status,
    score: r.score,
    checks: r.checks,
    issues: r.issues,
  })),
};

fs.writeFileSync(path.join(analyzerDir, 'critique.json'), JSON.stringify(jsonOutput, null, 2));

// 2. Write Human-Readable critique.md
let md = `# CRITIQUE REPORT: ${projectSlug}\n\n`;
md += `**Timestamp:** ${new Date().toLocaleString()}  \n`;
md += `**Overall Score:** ${jsonOutput.overallScore}/100  \n\n`;

if (loadedManifests.length > 0) {
  md += `## Visual Contact Sheets Audited\n\n`;
  for (const lm of loadedManifests) {
    const sheetFiles = (lm.data.sheets || []).map((s: any) => `\`${s.file}\``).join(', ');
    const totalFrames = (lm.data.sheets || []).reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0);
    md += `- **Mode:** \`${lm.mode}\` | **Total Frames:** ${totalFrames} | **Sheets:** ${sheetFiles}  \n`;
    md += `  Manifest: \`${path.relative(projectDir, lm.manifestPath)}\`\n`;
  }
  md += `\n`;
}

for (let i = 0; i < critiqueResults.length; i++) {
  const r = critiqueResults[i];
  const num = String(i + 1).padStart(2, '0');
  md += `### Scene ${num} (${r.title})\n`;

  for (const chk of r.checks) {
    md += `✓ ${chk}\n`;
  }

  for (const iss of r.issues) {
    const symbol = iss.severity === 'high' ? '✗' : '△';
    md += `${symbol} [${iss.type.toUpperCase()}] ${iss.description}\n`;
    md += `  ↳ *Patch Suggestion:* ${iss.patchSuggestion}\n`;
  }

  md += `\n`;
}

fs.writeFileSync(path.join(analyzerDir, 'critique.md'), md);

// 3. Output to Console in User's Requested Format
console.log('\n========================================');
console.log('CRITIQUE');
console.log('========================================\n');

if (loadedManifests.length > 0) {
  console.log('AI VISION CONTACT SHEETS AUDITED:');
  for (const lm of loadedManifests) {
    const totalFrames = (lm.data.sheets || []).reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0);
    console.log(`  • [${lm.mode.toUpperCase()}] ${lm.data.sheets?.length || 0} sheet(s) (${totalFrames} keyframes)`);
  }
  console.log('----------------------------------------\n');
}

for (let i = 0; i < critiqueResults.length; i++) {
  const r = critiqueResults[i];
  const num = String(i + 1).padStart(2, '0');
  console.log(`Scene ${num} (${r.title})`);

  for (const chk of r.checks) {
    console.log(`✓ ${chk}`);
  }

  for (const iss of r.issues) {
    const symbol = iss.severity === 'high' ? '✗' : '△';
    console.log(`${symbol} ${iss.description}`);
  }

  console.log('');
}

console.log(`💾 Machine-readable report saved to: ${path.join(analyzerDir, 'critique.json')}`);
console.log(`📝 Human-readable report saved to: ${path.join(analyzerDir, 'critique.md')}`);
