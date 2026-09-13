import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import YAML from 'yaml';

const command = process.argv[2];
const projectSlug = process.argv[3];

if (!command || !projectSlug || !['render', 'report', 'status', 'reset'].includes(command)) {
  console.log(`
================================================================================
🎥 REMOTION VISUAL REFINEMENT LOOP (AGENT-IN-THE-LOOP FEEDBACK HARNESS)
================================================================================

Usage:
  bun scripts/refine-loop.ts render <project-slug> [--scale=0.5|1] [--full-res] [--fast-still-only]
      • Renders draft video (MP4) and extracts strategic keyframes (entry/apex/settled/exit)
      • Updates iteration counter in REFINEMENT_STATE.yaml
      • Generates refinement manifest and HTML comparison viewer
      • Returns frame list for the agent in chat to inspect

  bun scripts/refine-loop.ts report <project-slug> [--verdict=converged|needs_refinement] [--score=0-100] [--notes="..."]
      • Archives REFINEMENT_REPORT.yaml for current iteration
      • Updates REFINEMENT_STATE.yaml with score, issue counts, and status
      • Checks if loop converged or requires next iteration

  bun scripts/refine-loop.ts status <project-slug>
      • Shows current iteration, status, score history, and active issues

  bun scripts/refine-loop.ts reset <project-slug>
      • Resets refinement loop back to iteration 0
  `);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const deconstructionDir = path.join(projectDir, '02_Deconstruction');
const analyzerDir = fs.existsSync(deconstructionDir) ? deconstructionDir : path.join(projectDir, '02_Analyzer');
const plannerDir = path.join(projectDir, '03_Planner');
const publicDir = path.join(rootDir, 'public', 'projects', projectSlug);

if (!fs.existsSync(projectDir)) {
  console.error(`❌ Error: Project directory "${projectSlug}" not found at ${projectDir}`);
  process.exit(1);
}

fs.mkdirSync(analyzerDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const stateFile = path.join(analyzerDir, 'REFINEMENT_STATE.yaml');
const reportFile = path.join(analyzerDir, 'REFINEMENT_REPORT.yaml');
const reportArchiveDir = path.join(analyzerDir, 'refinement_reports');
const framesBaseDir = path.join(analyzerDir, 'refinement_frames');

fs.mkdirSync(reportArchiveDir, { recursive: true });
fs.mkdirSync(framesBaseDir, { recursive: true });

interface RefinementHistoryItem {
  iteration: number;
  timestamp: string;
  video_file: string;
  frames_count: number;
  score?: number;
  verdict?: 'converged' | 'needs_refinement' | 'pending';
  issues_count?: number;
  fixed_count?: number;
  summary?: string;
}

interface RefinementState {
  project: string;
  current_iteration: number;
  max_iterations: number;
  status: 'pending_agent_review' | 'in_refinement' | 'converged' | 'escalated';
  created_at: string;
  updated_at: string;
  history: RefinementHistoryItem[];
}

function loadOrCreateState(): RefinementState {
  if (fs.existsSync(stateFile)) {
    try {
      const parsed = YAML.parse(fs.readFileSync(stateFile, 'utf8'));
      if (parsed && typeof parsed.current_iteration === 'number') {
        return parsed;
      }
    } catch {}
  }
  const defaultState: RefinementState = {
    project: projectSlug,
    current_iteration: 0,
    max_iterations: 5,
    status: 'pending_agent_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    history: [],
  };
  saveState(defaultState);
  return defaultState;
}

function saveState(state: RefinementState) {
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(stateFile, YAML.stringify(state));
}

// -----------------------------------------------------------------------------
// Helper: Resolve Composition Details & Storyboard
// -----------------------------------------------------------------------------
function resolveProjectSpec() {
  const storyboardPath = path.join(plannerDir, 'STORYBOARD.yaml');
  const timelinePath = path.join(plannerDir, 'timeline.yaml');
  const aestheticPath = path.join(plannerDir, 'core_aesthetic.yaml');
  const scenesDir = path.join(plannerDir, 'scenes');

  let storyboard: any = null;
  if (fs.existsSync(storyboardPath)) {
    try {
      storyboard = YAML.parse(fs.readFileSync(storyboardPath, 'utf8'));
    } catch {}
  }

  let timeline: any = null;
  if (fs.existsSync(timelinePath)) {
    try {
      timeline = YAML.parse(fs.readFileSync(timelinePath, 'utf8'));
    } catch {}
  }

  let aesthetic: any = null;
  if (fs.existsSync(aestheticPath)) {
    try {
      aesthetic = YAML.parse(fs.readFileSync(aestheticPath, 'utf8'));
    } catch {}
  }

  const fps = storyboard?.fps || timeline?.fps || 30;
  const width = storyboard?.width || timeline?.width || 1920;
  const height = storyboard?.height || timeline?.height || 1080;

  // Resolve scenes (prefer explicit timeline.yaml if present)
  let scenes: any[] = [];
  if (timeline?.scenes && Array.isArray(timeline.scenes)) {
    scenes = timeline.scenes;
  } else if (storyboard?.scenes && Array.isArray(storyboard.scenes)) {
    scenes = storyboard.scenes;
  } else if (fs.existsSync(scenesDir)) {
    const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml')).sort();
    for (const f of files) {
      try {
        const sc = YAML.parse(fs.readFileSync(path.join(scenesDir, f), 'utf8'));
        scenes.push(sc);
      } catch {}
    }
  }

  let compositionId = projectSlug.replace(/_/g, '-');
  if (projectSlug === 'demo-showcase') compositionId = 'DemoShowcase';
  else if (projectSlug === 'dzinr') compositionId = 'DzinrShowcase';

  // Calculate global frame ranges for each scene
  let runningFrame = 0;
  const normalizedScenes = scenes.map((sc, idx) => {
    const sceneId = sc.id || sc.scene_id || `scene_${String(idx + 1).padStart(2, '0')}`;
    const duration = sc.total_duration_frames || sc.duration_in_frames || sc.duration_frames || 90;
    const matchingTimelineScene = timeline?.scenes?.find((ts: any) => ts.id === sceneId || ts.scene_id === sceneId) || timeline?.scenes?.[idx];
    const transitionDuration = sc.transition_duration || matchingTimelineScene?.transition_duration || 0;
    
    const startFrame = runningFrame;
    const endFrame = startFrame + duration;
    runningFrame += duration - (idx < scenes.length - 1 ? transitionDuration : 0);

    return {
      id: sceneId,
      title: sc.title || sceneId,
      duration,
      transitionDuration,
      startFrame,
      endFrame,
      shots: sc.shots || [],
      raw: sc,
    };
  });

  const totalFrames = timeline?.total_duration_in_frames || storyboard?.total_duration_frames || runningFrame;

  return {
    compositionId,
    fps,
    width,
    height,
    totalFrames,
    scenes: normalizedScenes,
    storyboard,
    aesthetic,
  };
}

// -----------------------------------------------------------------------------
// SUBCOMMAND: RENDER
// -----------------------------------------------------------------------------
if (command === 'render') {
  const isFullRes = process.argv.includes('--full-res');
  const scaleArg = process.argv.find(a => a.startsWith('--scale='));
  const scale = isFullRes ? 1.0 : (scaleArg ? parseFloat(scaleArg.split('=')[1]) : 0.5);
  const isFastStillOnly = process.argv.includes('--fast-still-only');

  const state = loadOrCreateState();
  const nextIteration = state.current_iteration + 1;

  console.log(`\n================================================================================`);
  console.log(`🎬 REMOTION REFINEMENT LOOP: ITERATION ${nextIteration} OF ${state.max_iterations}`);
  console.log(`Project: "${projectSlug}" | Resolution Scale: ${scale}x (${Math.round(1920 * scale)}x${Math.round(1080 * scale)})`);
  console.log(`================================================================================\n`);

  if (nextIteration > state.max_iterations) {
    console.log(`⚠️  MAX ITERATIONS REACHED (${state.max_iterations}).`);
    console.log(`   The video has undergone ${state.max_iterations} refinement rounds without full convergence.`);
    console.log(`   Proceeding with iteration ${nextIteration}, but will flag as escalated for human review.\n`);
    state.status = 'escalated';
  } else {
    state.status = 'pending_agent_review';
  }

  const iterName = `iter_${String(nextIteration).padStart(3, '0')}`;
  const iterDir = path.join(framesBaseDir, iterName);
  const publicIterDir = path.join(publicDir, 'refinement_frames', iterName);
  fs.mkdirSync(iterDir, { recursive: true });
  fs.mkdirSync(publicIterDir, { recursive: true });

  const spec = resolveProjectSpec();
  const draftVideoName = `${projectSlug}_draft_${iterName}.mp4`;
  const draftVideoPath = path.join(rootDir, 'out', draftVideoName);
  const localVideoCopy = path.join(analyzerDir, 'draft_render.mp4');
  const publicVideoCopy = path.join(publicDir, 'draft_render.mp4');

  fs.mkdirSync(path.join(rootDir, 'out'), { recursive: true });

  // 1. Render Video (Draft MP4)
  let videoRenderSuccess = false;
  if (!isFastStillOnly) {
    console.log(`[1/3] 🎥 Rendering draft video with Remotion CLI (Scale: ${scale})...`);
    console.log(`      Target: ${draftVideoPath}`);
    const renderArgs = [
      'run',
      'remotion',
      'render',
      'src/index.ts',
      spec.compositionId,
      draftVideoPath,
      `--scale=${scale}`,
      '--jpeg-quality=85',
      '--gl=angle',
    ];

    try {
      const bunPath = process.execPath;
      const renderProc = spawnSync(bunPath, renderArgs, {
        stdio: 'inherit',
        cwd: rootDir,
      });

      if (renderProc.status === 0 && fs.existsSync(draftVideoPath)) {
        videoRenderSuccess = true;
        fs.copyFileSync(draftVideoPath, localVideoCopy);
        fs.copyFileSync(draftVideoPath, publicVideoCopy);
        console.log(`      ✅ Draft video rendered successfully!`);
      } else {
        console.warn(`      ⚠️ Draft video render encountered warnings/non-zero exit (Status: ${renderProc.status}). Falling back to keyframe stills.`);
      }
    } catch (e: any) {
      console.warn(`      ⚠️ Remotion video render skipped/failed: ${e.message}. Using direct keyframe extraction.`);
    }
  } else {
    console.log(`[1/3] ⏩ Skipping video render (--fast-still-only specified). Rendering keyframe stills directly...`);
  }

  // 2. Extract Strategic Keyframes per Scene / Shot
  console.log(`\n[2/3] 📸 Extracting strategic keyframe snapshots (entry, apex, settled, exit)...`);

  interface SampledRefinementFrame {
    id: string;
    sceneId: string;
    sceneTitle: string;
    shotId?: string;
    phase: 'entry' | 'apex' | 'settled' | 'exit';
    globalFrame: number;
    localFrame: number;
    timestamp: string;
    filename: string;
    filePath: string;
    publicUrl: string;
    attentionTarget?: string;
    viewerNotice?: string;
    viewerUnderstand?: string;
    viewerFeel?: string;
    headlineText?: string;
  }

  const sampledFrames: SampledRefinementFrame[] = [];

  for (let sIdx = 0; sIdx < spec.scenes.length; sIdx++) {
    const sc = spec.scenes[sIdx];
    const duration = sc.duration;
    const startF = sc.startFrame;

    // Determine sampling points for this scene
    const phaseOffsets: Array<{ phase: 'entry' | 'apex' | 'settled' | 'exit'; offset: number }> = [
      { phase: 'entry', offset: Math.max(2, Math.round(duration * 0.15)) },
      { phase: 'apex', offset: Math.round(duration * 0.50) },
      { phase: 'settled', offset: Math.max(duration - 6, Math.round(duration * 0.85)) },
      { phase: 'exit', offset: Math.max(1, duration - 2) },
    ];

    for (const p of phaseOffsets) {
      const globalFrame = Math.min(spec.totalFrames - 1, startF + p.offset);
      const totalSec = globalFrame / spec.fps;
      const mins = Math.floor(totalSec / 60);
      const secs = (totalSec % 60).toFixed(2);
      const timestamp = `${String(mins).padStart(2, '0')}:${secs.padStart(5, '0')}`;
      const filename = `${sc.id}_${p.phase}_f${String(globalFrame).padStart(4, '0')}.jpg`;
      const filePath = path.join(iterDir, filename);
      const publicPath = path.join(publicIterDir, filename);

      // Extract metadata from shots if available
      let matchedShot: any = null;
      if (sc.shots && sc.shots.length > 0) {
        matchedShot = sc.shots[Math.min(sc.shots.length - 1, Math.floor((p.offset / duration) * sc.shots.length))];
      }

      sampledFrames.push({
        id: `${sc.id}_${p.phase}`,
        sceneId: sc.id,
        sceneTitle: sc.title,
        shotId: matchedShot?.id,
        phase: p.phase,
        globalFrame,
        localFrame: p.offset,
        timestamp,
        filename,
        filePath,
        publicUrl: `/projects/${projectSlug}/refinement_frames/${iterName}/${filename}`,
        attentionTarget: matchedShot?.attention_target || sc.raw?.attention_target || 'Subject focus',
        viewerNotice: matchedShot?.viewer_should_notice || sc.raw?.viewer_should_notice,
        viewerUnderstand: matchedShot?.viewer_should_understand || sc.raw?.viewer_should_understand,
        viewerFeel: matchedShot?.viewer_should_feel || sc.raw?.viewer_should_feel,
        headlineText: matchedShot?.text || sc.raw?.layers?.find((l: any) => l.component === 'Headline')?.params?.text,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // FAST BATCH FRAME EXTRACTION: Single Remotion sequence pass instead of N cold starts
  // ---------------------------------------------------------------------------
  const bunPath = process.execPath;
  const uniqueFrames = Array.from(new Set(sampledFrames.map(f => f.globalFrame))).sort((a, b) => a - b);
  const tempBatchDir = path.join(iterDir, 'temp_batch_frames');
  fs.mkdirSync(tempBatchDir, { recursive: true });

  console.log(`⚡ Batch-rendering ${uniqueFrames.length} keyframes in a single high-speed pass...`);
  const batchArgs = [
    'run',
    'remotion',
    'render',
    'src/index.ts',
    spec.compositionId,
    path.resolve(tempBatchDir).replace(/\\/g, '/'),
    '--sequence',
    '--image-format=jpeg',
    `--frames=${uniqueFrames.join(',')}`,
    '--scale=' + scale,
    '--jpeg-quality=90',
    '--gl=angle',
    '--muted',
    '--props={"disableAudio":true}',
    '--overwrite',
  ];

  try {
    const batchProc = spawnSync(bunPath, batchArgs, { stdio: 'pipe', cwd: rootDir });
    if (batchProc.status !== 0) {
      console.warn(`   ⚠️ Batch render warning (Status ${batchProc.status}): ${batchProc.stderr?.toString() || batchProc.stdout?.toString()}`);
    }
    if (batchProc.status === 0 && fs.existsSync(tempBatchDir)) {
      const generatedFiles = fs.readdirSync(tempBatchDir);
      const fileMap = new Map<number, string>();
      for (const f of generatedFiles) {
        const match = f.match(/element-(\d+)\.(jpeg|jpg)/i);
        if (match) {
          const fNum = parseInt(match[1], 10);
          fileMap.set(fNum, path.join(tempBatchDir, f));
        }
      }

      for (let i = 0; i < sampledFrames.length; i++) {
        const frame = sampledFrames[i];
        if (fileMap.has(frame.globalFrame)) {
          fs.copyFileSync(fileMap.get(frame.globalFrame)!, frame.filePath);
          fs.copyFileSync(frame.filePath, path.join(publicIterDir, frame.filename));
        }
      }
    }
  } catch (err: any) {
    console.warn(`   ⚠️ Batch render encountered error: ${err.message}. Falling back to sequential capture.`);
  } finally {
    try {
      fs.rmSync(tempBatchDir, { recursive: true, force: true });
    } catch {}
  }

  // Fallback for any missing frames
  for (let i = 0; i < sampledFrames.length; i++) {
    const frame = sampledFrames[i];
    if (fs.existsSync(frame.filePath)) {
      console.log(`   [${i + 1}/${sampledFrames.length}] Captured ${frame.sceneId} (${frame.phase} @ f${frame.globalFrame}) ✓`);
      continue;
    }

    process.stdout.write(`   [${i + 1}/${sampledFrames.length}] Fallback capturing ${frame.sceneId} (${frame.phase} @ f${frame.globalFrame})... `);
    try {
      const stillCmd = [
        'run',
        'remotion',
        'still',
        'src/index.ts',
        spec.compositionId,
        frame.filePath,
        `--frame=${frame.globalFrame}`,
        `--scale=${scale}`,
        '--jpeg-quality=90',
        '--gl=angle',
      ];
      const res = spawnSync(bunPath, stillCmd, { stdio: 'pipe', cwd: rootDir });
      if (res.status === 0 && fs.existsSync(frame.filePath)) {
        fs.copyFileSync(frame.filePath, path.join(publicIterDir, frame.filename));
        console.log(`✓`);
      } else {
        console.log(`⚠️ (Render fallback)`);
      }
    } catch (err: any) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  // 3. Write Refinement Manifest and HTML Comparison Viewer
  console.log(`\n[3/3] 📑 Compiling Refinement Manifest and Visual Reviewer...`);

  const manifestData = {
    project: projectSlug,
    iteration: nextIteration,
    timestamp: new Date().toISOString(),
    compositionId: spec.compositionId,
    fps: spec.fps,
    totalFrames: spec.totalFrames,
    durationSeconds: parseFloat((spec.totalFrames / spec.fps).toFixed(2)),
    scale,
    renderedVideo: videoRenderSuccess ? draftVideoPath : null,
    totalFramesSampled: sampledFrames.length,
    frames: sampledFrames,
  };

  const manifestPath = path.join(iterDir, 'refinement_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
  fs.writeFileSync(path.join(analyzerDir, 'REFINEMENT_MANIFEST.json'), JSON.stringify(manifestData, null, 2));

  // Generate HTML review file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectSlug} - Refinement Loop (Iteration ${nextIteration})</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.1);
      --primary: #38bdf8;
      --accent: #f43f5e;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2.5rem;
      min-height: 100vh;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    h1 { font-size: 2rem; font-weight: 800; }
    .badge {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(56, 189, 248, 0.15);
      color: var(--primary);
      border: 1px solid rgba(56, 189, 248, 0.3);
      margin-bottom: 0.5rem;
    }
    .video-section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2.5rem;
    }
    video {
      width: 100%;
      max-height: 540px;
      border-radius: 8px;
      background: #000;
    }
    .scene-block {
      margin-bottom: 2.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
    }
    .scene-header {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      color: var(--primary);
      display: flex;
      justify-content: space-between;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .frame-card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .frame-card img {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }
    .frame-meta {
      padding: 1rem;
      font-size: 0.85rem;
    }
    .tag {
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary);
    }
    .obj {
      margin-top: 0.5rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .obj strong { color: #e2e8f0; }
  </style>
</head>
<body>
  <header>
    <div>
      <span class="badge">Visual Refinement Loop • Iteration ${nextIteration} of ${state.max_iterations}</span>
      <h1>${projectSlug}</h1>
      <div style="color: var(--text-muted); margin-top: 0.4rem;">
        Total Duration: ${spec.totalFrames} frames (${(spec.totalFrames / spec.fps).toFixed(1)}s) | FPS: ${spec.fps} | Scale: ${scale}x
      </div>
    </div>
  </header>

  ${videoRenderSuccess ? `
  <section class="video-section">
    <h2 style="margin-bottom: 1rem; font-size: 1.2rem;">🎬 Rendered Draft Video</h2>
    <video controls src="/projects/${projectSlug}/draft_render.mp4"></video>
  </section>
  ` : ''}

  <main>
    ${spec.scenes.map(sc => {
      const sceneFrames = sampledFrames.filter(f => f.sceneId === sc.id);
      return `
      <section class="scene-block">
        <div class="scene-header">
          <span>${sc.title} (${sc.id})</span>
          <span style="font-size: 0.9rem; color: var(--text-muted);">${sc.duration} frames</span>
        </div>
        <div class="grid">
          ${sceneFrames.map(fr => `
            <div class="frame-card">
              <img src="${fr.filename}" alt="${fr.id}" onclick="window.open('${fr.filename}', '_blank')">
              <div class="frame-meta">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                  <span class="tag">${fr.phase}</span>
                  <span style="color: var(--text-muted);">Frame ${fr.globalFrame} (${fr.timestamp})</span>
                </div>
                ${fr.attentionTarget ? `<div class="obj"><strong>🎯 Target:</strong> ${fr.attentionTarget}</div>` : ''}
                ${fr.viewerNotice ? `<div class="obj"><strong>👀 Notice:</strong> ${fr.viewerNotice}</div>` : ''}
                ${fr.viewerUnderstand ? `<div class="obj"><strong>💡 Understand:</strong> ${fr.viewerUnderstand}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      `;
    }).join('')}
  </main>
</body>
</html>`;

  fs.writeFileSync(path.join(iterDir, 'index.html'), htmlContent);
  fs.writeFileSync(path.join(publicIterDir, 'index.html'), htmlContent);

  // 4. Update State
  state.current_iteration = nextIteration;
  state.history.push({
    iteration: nextIteration,
    timestamp: new Date().toISOString(),
    video_file: videoRenderSuccess ? draftVideoPath : 'stills_only',
    frames_count: sampledFrames.length,
    verdict: 'pending',
  });
  saveState(state);

  // 5. Output Rich Agent Instruction Box
  console.log(`\n================================================================================`);
  console.log(`📋 REFINEMENT RENDER READY (Iteration ${nextIteration}/${state.max_iterations})`);
  console.log(`================================================================================`);
  console.log(`\n📁 Extracted Keyframe Snapshots:`);
  console.log(`   Directory: ${iterDir}\n`);

  for (const fr of sampledFrames) {
    console.log(`   • [${fr.phase.toUpperCase().padEnd(7)}] Frame ${String(fr.globalFrame).padStart(4)} (${fr.timestamp}) -> ${fr.filePath}`);
    if (fr.attentionTarget) console.log(`     ↳ Target: "${fr.attentionTarget}" | Notice: "${fr.viewerNotice || 'N/A'}"`);
  }

  if (videoRenderSuccess) {
    console.log(`\n🎥 Draft Video: file:///${draftVideoPath.replace(/\\/g, '/')}`);
  }
  console.log(`🌐 Inspection Viewer: file:///${path.join(iterDir, 'index.html').replace(/\\/g, '/')}`);

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`🤖 AGENT IN-CHAT PROTOCOL:`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`1. Inspect keyframe images using 'view_file' on the paths above.`);
  console.log(`2. Audit against the objectives:`);
  console.log(`   - Legibility & text overlap`);
  console.log(`   - Color contrast against core_aesthetic.yaml`);
  console.log(`   - Element positioning, scaling, and spring settle at apex`);
  console.log(`   - Hook punchiness (scene_01) and CTA payoff (closing scene)`);
  console.log(`3. Record your findings in 02_Analyzer/REFINEMENT_REPORT.yaml`);
  console.log(`4. If issues exist: Apply surgical fixes in 05_Code/scenes/SceneXX.tsx and re-run:`);
  console.log(`   bun run refine:render ${projectSlug}`);
  console.log(`5. If video is visually refined and objectives met:`);
  console.log(`   bun run refine:report ${projectSlug} --verdict=converged --score=95 --notes="All visual objectives verified"\n`);
}

// -----------------------------------------------------------------------------
// SUBCOMMAND: REPORT
// -----------------------------------------------------------------------------
else if (command === 'report') {
  const state = loadOrCreateState();
  const verdictArg = process.argv.find(a => a.startsWith('--verdict='));
  const scoreArg = process.argv.find(a => a.startsWith('--score='));
  const notesArg = process.argv.find(a => a.startsWith('--notes='));

  let reportData: any = null;
  if (fs.existsSync(reportFile)) {
    try {
      reportData = YAML.parse(fs.readFileSync(reportFile, 'utf8'));
    } catch {}
  }

  const currentIter = state.current_iteration || 1;
  const verdict = (verdictArg ? verdictArg.split('=')[1] : reportData?.verdict || 'needs_refinement') as 'converged' | 'needs_refinement';
  const score = scoreArg ? parseInt(scoreArg.split('=')[1], 10) : (reportData?.score ?? (verdict === 'converged' ? 95 : 75));
  const notes = notesArg ? notesArg.split('=')[1] : reportData?.summary || reportData?.notes || 'Refinement review recorded';

  // Build standard report structure if missing
  const fullReport = {
    project: projectSlug,
    iteration: currentIter,
    timestamp: new Date().toISOString(),
    verdict,
    score,
    summary: notes,
    frames_inspected: reportData?.frames_inspected || 0,
    issues: reportData?.issues || [],
    patches_applied: reportData?.patches_applied || [],
  };

  fs.writeFileSync(reportFile, YAML.stringify(fullReport));

  // Archive report
  const archivePath = path.join(reportArchiveDir, `report_iter_${String(currentIter).padStart(3, '0')}.yaml`);
  fs.writeFileSync(archivePath, YAML.stringify(fullReport));

  // Update State History
  const histItem = state.history.find(h => h.iteration === currentIter);
  if (histItem) {
    histItem.score = score;
    histItem.verdict = verdict;
    histItem.issues_count = fullReport.issues.length;
    histItem.summary = notes;
  } else {
    state.history.push({
      iteration: currentIter,
      timestamp: new Date().toISOString(),
      video_file: 'unknown',
      frames_count: 0,
      score,
      verdict,
      issues_count: fullReport.issues.length,
      summary: notes,
    });
  }

  if (verdict === 'converged' || (score >= 90 && fullReport.issues.filter((i: any) => i.severity === 'high').length === 0)) {
    state.status = 'converged';
    console.log(`\n🎉 REFINEMENT LOOP CONVERGED! (Score: ${score}/100)`);
    console.log(`   All visual objectives, typography, positioning, and animations are verified.`);
    console.log(`   Status updated to: "converged". Ready for Phase 7 Critic Audit.\n`);
  } else if (currentIter >= state.max_iterations) {
    state.status = 'escalated';
    console.log(`\n⚠️  REFINEMENT LOOP ESCALATED (Iteration ${currentIter}/${state.max_iterations} reached).`);
    console.log(`   Score: ${score}/100 with ${fullReport.issues.length} remaining issue(s).`);
    console.log(`   Please inspect 02_Analyzer/REFINEMENT_REPORT.yaml and consult the Human Director.\n`);
  } else {
    state.status = 'in_refinement';
    console.log(`\n🔄 REFINEMENT REPORT LOGGED (Iteration ${currentIter}, Score: ${score}/100)`);
    console.log(`   Status: "in_refinement". Issues to fix: ${fullReport.issues.length}`);
    console.log(`   Apply fixes to 05_Code/scenes/ and run: bun run refine:render ${projectSlug}\n`);
  }

  saveState(state);
}

// -----------------------------------------------------------------------------
// SUBCOMMAND: STATUS
// -----------------------------------------------------------------------------
else if (command === 'status') {
  const state = loadOrCreateState();
  console.log(`\n================================================================================`);
  console.log(`📊 REFINEMENT LOOP STATUS: "${projectSlug}"`);
  console.log(`================================================================================`);
  console.log(`Current Iteration : ${state.current_iteration} of ${state.max_iterations}`);
  console.log(`Status            : ${state.status.toUpperCase()}`);
  console.log(`Last Updated      : ${state.updated_at}`);

  if (state.history.length > 0) {
    console.log(`\nIteration History:`);
    for (const h of state.history) {
      console.log(`  • Iter ${h.iteration}: Score ${h.score ?? 'N/A'}/100 | Verdict: ${(h.verdict || 'pending').toUpperCase()} | Issues: ${h.issues_count ?? 0} | ${h.summary || ''}`);
    }
  }

  if (fs.existsSync(reportFile)) {
    try {
      const rep = YAML.parse(fs.readFileSync(reportFile, 'utf8'));
      if (rep.issues && rep.issues.length > 0) {
        console.log(`\nActive Issues (${rep.issues.length}):`);
        for (const iss of rep.issues) {
          console.log(`  [${(iss.severity || 'medium').toUpperCase()}] ${iss.scene || 'general'}: ${iss.description || iss.observation}`);
          if (iss.patch_suggestion || iss.patch_instruction) {
            console.log(`    ↳ Fix: ${iss.patch_suggestion || iss.patch_instruction}`);
          }
        }
      }
    } catch {}
  }
  console.log('');
}

// -----------------------------------------------------------------------------
// SUBCOMMAND: RESET
// -----------------------------------------------------------------------------
else if (command === 'reset') {
  const defaultState: RefinementState = {
    project: projectSlug,
    current_iteration: 0,
    max_iterations: 5,
    status: 'pending_agent_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    history: [],
  };
  saveState(defaultState);
  console.log(`\n✅ Refinement loop state reset for project "${projectSlug}". Iteration reset to 0.\n`);
}
