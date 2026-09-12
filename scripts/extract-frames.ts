import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectSlug = process.argv[2];
const videoFileName = process.argv[3];
const mode = process.argv[4] || 'interval'; // 'interval' | 'scene_cuts'

if (!projectSlug) {
  console.error('Usage: bun scripts/extract-frames.ts <project-slug> [video-filename] [mode: interval | scene_cuts]');
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const videoDir = path.join(projectDir, '01_Reference', 'videos');
const framesDir = path.join(projectDir, '02_Analyzer', 'frames');

if (!fs.existsSync(projectDir)) {
  console.error(`Project directory does not exist: ${projectDir}`);
  process.exit(1);
}

fs.mkdirSync(framesDir, { recursive: true });

// Find video file
let videoPath = '';
if (videoFileName) {
  videoPath = path.join(videoDir, videoFileName);
} else {
  const files = fs.readdirSync(videoDir).filter(f => /\.(mp4|mov|webm|mkv)$/i.test(f));
  if (files.length === 0) {
    console.error(`No video files found in ${videoDir}. Please place a reference video there.`);
    process.exit(1);
  }
  videoPath = path.join(videoDir, files[0]);
}

if (!fs.existsSync(videoPath)) {
  console.error(`Video file does not exist: ${videoPath}`);
  process.exit(1);
}

console.log(`🎬 Extracting frame snapshots from: ${videoPath}`);
console.log(`📂 Destination: ${framesDir}`);
console.log(`⚙️ Mode: ${mode}`);

try {
  // Clear older extracted frames
  const existing = fs.readdirSync(framesDir);
  for (const f of existing) {
    if (/\.(jpg|png|webp)$/i.test(f)) {
      fs.unlinkSync(path.join(framesDir, f));
    }
  }

  let filter = 'fps=1'; // default: 1 frame per second
  if (mode === 'scene_cuts') {
    filter = "select='gt(scene,0.25)',showinfo";
  } else if (mode === 'high_density') {
    filter = 'fps=2';
  }

  const outputPattern = path.join(framesDir, 'frame_%04d.jpg');
  const cmd = `ffmpeg -y -i "${videoPath}" -vf "${filter}" -vsync vfr -q:v 2 "${outputPattern}"`;

  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });

  const extracted = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
  console.log(`✅ Extracted ${extracted.length} frame snapshots successfully!`);
} catch (error: any) {
  console.error('❌ Extraction failed. Please ensure ffmpeg is installed in PATH or specify valid arguments.');
  console.error(error.message);
  process.exit(1);
}
