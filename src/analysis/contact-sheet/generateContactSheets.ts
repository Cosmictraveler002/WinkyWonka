import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { sampleFrames } from './frameSampler';
import { writeManifest } from './metadata';
import { renderContactSheets } from './sheetRenderer';
import { ContactSheetManifest, ContactSheetOptions, ContactSheetResult } from './types';

export async function generateContactSheets(options: ContactSheetOptions): Promise<ContactSheetResult> {
  const {
    projectSlug,
    mode = 'storyboard',
    sourceType = 'composition',
    sourcePath,
    maxFramesPerSheet = 16,
    columns = 4,
    thumbnailWidth = 400,
    thumbnailHeight = 225,
    metadataHeight = 32,
    format = 'jpeg',
    quality = 88,
    motionIntervalFrames = 6,
  } = options;

  let compositionId = options.compositionId;
  if (!compositionId) {
    if (projectSlug === 'demo-showcase') compositionId = 'DemoShowcase';
    else if (projectSlug === 'dzinr') compositionId = 'DzinrShowcase';
    else compositionId = projectSlug;
  }

  const rootDir = process.cwd();
  const projectDir = path.join(rootDir, 'projects', projectSlug);
  const timelinePath = path.join(projectDir, '03_Planner', 'timeline.yaml');

  if (!fs.existsSync(timelinePath)) {
    throw new Error(`timeline.yaml not found at ${timelinePath}`);
  }

  const timeline = YAML.parse(fs.readFileSync(timelinePath, 'utf8'));
  const fps = timeline.fps || 30;
  const totalFrames =
    timeline.total_duration_in_frames ||
    timeline.total_duration_frames ||
    (timeline.scenes ? timeline.scenes.reduce((acc: number, s: any) => acc + (s.duration_in_frames || 0), 0) : 0);
  timeline.total_duration_in_frames = totalFrames;

  const outputDir =
    options.outputDir || path.join(projectDir, '02_Analyzer', `contact_sheets_${mode}`);
  const tempFramesDir = path.join(outputDir, '.temp_frames');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(tempFramesDir, { recursive: true });

  console.log(`\n========================================`);
  console.log(`AI CONTACT SHEET GENERATOR: "${projectSlug}"`);
  console.log(`Mode: [${mode.toUpperCase()}] | Frames: ${totalFrames} (${(totalFrames / fps).toFixed(1)}s)`);
  console.log(`========================================\n`);

  // 1. Sample frames deterministically
  const sampledFrames = sampleFrames(timeline, mode, motionIntervalFrames);
  console.log(`🎯 Sampled ${sampledFrames.length} keyframes (Strategy: ${mode === 'storyboard' ? 'scene_aware' : 'fixed_interval'}).`);

  // 2. Extract/render raw snapshot frames
  console.log(`⚡ Rendering raw snapshots...`);
  for (let i = 0; i < sampledFrames.length; i++) {
    const meta = sampledFrames[i];
    const tempFile = path.join(tempFramesDir, `frame_${meta.frame.toString().padStart(4, '0')}.jpg`);
    meta.filePath = tempFile;

    if (!fs.existsSync(tempFile)) {
      if (sourceType === 'video' && sourcePath && fs.existsSync(sourcePath)) {
        // Extract via ffmpeg from rendered video
        const cmd = `ffmpeg -y -ss ${meta.time} -i "${sourcePath}" -vframes 1 -q:v 2 "${tempFile}"`;
        execSync(cmd, { stdio: 'pipe' });
      } else {
        // Render directly from Remotion composition
        const cmd = `bun run remotion still src/index.ts ${compositionId} "${tempFile}" --frame=${meta.frame}`;
        execSync(cmd, { stdio: 'pipe' });
      }
    }
  }

  // 3. Assemble Grid Sheets via Sharp
  console.log(`🖼️  Compositing multi-sheet grid images (Max ${maxFramesPerSheet} frames/sheet)...`);
  const { sheets, dimensions } = await renderContactSheets({
    frames: sampledFrames,
    outputDir,
    maxFramesPerSheet,
    columns,
    thumbnailWidth,
    thumbnailHeight,
    metadataHeight,
    format,
    quality,
  });

  // 4. Construct & write Machine-Readable Manifest
  const manifest: ContactSheetManifest = {
    source: sourceType === 'video' && sourcePath ? sourcePath : `${compositionId} (Remotion)`,
    fps,
    duration: parseFloat((totalFrames / fps).toFixed(2)),
    totalFrameCount: totalFrames,
    mode,
    samplingStrategy: mode === 'storyboard' ? 'scene_aware' : 'fixed_interval',
    sheetDimensions: dimensions,
    sheets: sheets.map(s => ({
      file: s.file,
      frames: s.frames,
    })),
  };

  const manifestPath = path.join(outputDir, 'contact-sheet-manifest.json');
  writeManifest(manifest, manifestPath);

  // 5. Sync to public directory for studio previewing
  const publicOutputDir = path.join(rootDir, 'public', 'projects', projectSlug, `contact_sheets_${mode}`);
  fs.mkdirSync(publicOutputDir, { recursive: true });

  for (const sheet of sheets) {
    fs.copyFileSync(sheet.filePath, path.join(publicOutputDir, sheet.file));
  }
  fs.copyFileSync(manifestPath, path.join(publicOutputDir, 'contact-sheet-manifest.json'));

  // 6. Clean up temp frames
  for (const meta of sampledFrames) {
    if (meta.filePath && fs.existsSync(meta.filePath)) {
      try {
        fs.unlinkSync(meta.filePath);
      } catch {}
    }
  }
  try {
    fs.rmdirSync(tempFramesDir);
  } catch {}

  console.log(`\n✅ Generated ${sheets.length} contact sheet(s):`);
  for (const s of sheets) {
    console.log(`   📄 ${s.file} (${s.frames.length} frames, ${s.width}x${s.height}px)`);
  }
  console.log(`💾 Manifest: ${manifestPath}\n`);

  return {
    manifest,
    manifestPath,
    sheets,
    totalFramesSampled: sampledFrames.length,
  };
}
