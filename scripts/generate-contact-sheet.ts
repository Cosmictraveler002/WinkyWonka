import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error('Usage: bun scripts/generate-contact-sheet.ts <project-slug>');
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const plannerDir = path.join(projectDir, '03_Planner');
const timelineFile = path.join(plannerDir, 'timeline.yaml');
const outputDir = path.join(projectDir, '02_Analyzer', 'contact_sheet');
const publicOutputDir = path.join(rootDir, 'public', 'projects', projectSlug, 'contact_sheet');

if (!fs.existsSync(timelineFile)) {
  console.error(`Error: timeline.yaml not found at ${timelineFile}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publicOutputDir, { recursive: true });

const timelineContent = fs.readFileSync(timelineFile, 'utf8');
const timeline = YAML.parse(timelineContent);

console.log(`\n📸 Generating Contact Sheet for Project: "${projectSlug}"`);
console.log(`🎬 Total Duration: ${timeline.total_duration_in_frames} frames (${(timeline.total_duration_in_frames / (timeline.fps || 30)).toFixed(1)}s)`);

const scenes = timeline.scenes || [];
const fps = timeline.fps || 30;

interface SnapshotMeta {
  sceneId: string;
  sceneTitle: string;
  phase: 'entry' | 'apex' | 'settled';
  localFrame: number;
  globalFrame: number;
  timestamp: string;
  filename: string;
}

const snapshots: SnapshotMeta[] = [];

// Calculate global offsets
let currentGlobalFrame = 0;

for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  const duration = scene.duration_in_frames || 90;
  const transitionDuration = scene.transition_duration || 20;

  const entryFrame = Math.round(duration * 0.2);
  const apexFrame = Math.round(duration * 0.5);
  const settledFrame = Math.round(duration * 0.8);

  const points: Array<{ phase: 'entry' | 'apex' | 'settled'; local: number }> = [
    { phase: 'entry', local: entryFrame },
    { phase: 'apex', local: apexFrame },
    { phase: 'settled', local: settledFrame },
  ];

  for (const pt of points) {
    const globalFrame = currentGlobalFrame + pt.local;
    const totalSeconds = globalFrame / fps;
    const mins = Math.floor(totalSeconds / 60);
    const secs = (totalSeconds % 60).toFixed(2);
    const timestamp = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
    const filename = `${scene.id}_${pt.phase}.jpg`;

    snapshots.push({
      sceneId: scene.id,
      sceneTitle: scene.title || scene.id,
      phase: pt.phase,
      localFrame: pt.local,
      globalFrame,
      timestamp,
      filename,
    });
  }

  // Next scene start accounts for transition overlap
  currentGlobalFrame += duration - (i < scenes.length - 1 ? transitionDuration : 0);
}

// Composition ID in Root.tsx
const compositionId = projectSlug === 'demo-showcase' ? 'DemoShowcase' : projectSlug;

console.log(`⚡ Capturing ${snapshots.length} snapshot frames via Remotion CLI...`);

for (const snap of snapshots) {
  const targetPath = path.join(outputDir, snap.filename);
  const publicPath = path.join(publicOutputDir, snap.filename);

  console.log(`  [Frame ${snap.globalFrame}] Capturing ${snap.sceneId} (${snap.phase})...`);

  try {
    const cmd = `bun run remotion still src/index.ts ${compositionId} "${targetPath}" --frame=${snap.globalFrame}`;
    execSync(cmd, { stdio: 'pipe' });
    fs.copyFileSync(targetPath, publicPath);
  } catch (err: any) {
    console.warn(`  ⚠️ Warning: Failed to capture frame ${snap.globalFrame}: ${err.message}`);
  }
}

// Group snapshots by scene
const sceneGroups: Record<string, { title: string; items: SnapshotMeta[] }> = {};
for (const s of snapshots) {
  if (!sceneGroups[s.sceneId]) {
    sceneGroups[s.sceneId] = { title: s.sceneTitle, items: [] };
  }
  sceneGroups[s.sceneId].items.push(s);
}

// Generate interactive HTML Contact Sheet
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectSlug} - Motion Storyboard Contact Sheet</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(255, 255, 255, 0.03);
      --border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --accent: #06b6d4;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2.5rem;
      min-height: 100vh;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2.5rem;
    }
    h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; }
    .meta-bar {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.5rem;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .scene-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 1.75rem;
      margin-bottom: 2rem;
    }
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .scene-title { font-size: 1.4rem; font-weight: 700; color: #ffffff; }
    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .snapshot-item {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
    }
    .snapshot-item:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
    }
    .snapshot-item img {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }
    .snapshot-meta {
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .phase-tag {
      font-weight: 600;
      color: var(--accent);
      text-transform: capitalize;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <span class="badge">Visual Contact Sheet</span>
      <h1>${projectSlug}</h1>
      <div class="meta-bar">
        <span>🎬 Total Frames: ${timeline.total_duration_in_frames}</span>
        <span>⏱️ Duration: ${(timeline.total_duration_in_frames / fps).toFixed(1)}s</span>
        <span>🎯 FPS: ${fps}</span>
        <span>📐 Resolution: ${timeline.width || 1920}x${timeline.height || 1080}</span>
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge" style="background: rgba(6, 182, 212, 0.15); color: #67e8f9; border-color: rgba(6, 182, 212, 0.3);">
        Ready for Critic Audit
      </span>
    </div>
  </header>

  <main>
    ${Object.entries(sceneGroups).map(([id, group], idx) => `
      <section class="scene-card">
        <div class="scene-header">
          <div>
            <span style="color: var(--primary); font-weight: 700; font-size: 0.9rem;">SCENE ${String(idx + 1).padStart(2, '0')}</span>
            <div class="scene-title">${group.title} (${id})</div>
          </div>
        </div>
        <div class="snapshot-grid">
          ${group.items.map(snap => `
            <div class="snapshot-item">
              <img src="${snap.filename}" alt="${snap.sceneTitle} - ${snap.phase}" onclick="window.open('${snap.filename}', '_blank')">
              <div class="snapshot-meta">
                <span class="phase-tag">${snap.phase}</span>
                <span>Frame ${snap.globalFrame}</span>
                <span>${snap.timestamp}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `).join('')}
  </main>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);
fs.writeFileSync(path.join(publicOutputDir, 'index.html'), htmlContent);

console.log(`\n✅ Visual Contact Sheet successfully generated!`);
console.log(`📂 Output folder: ${outputDir}`);
console.log(`🌐 Inspection HTML: ${path.join(outputDir, 'index.html')}`);
