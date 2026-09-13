import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const projectSlug = process.argv[2];
const videoFileName = process.argv[3];
const mode = process.argv[4] || 'scene_deconstruct'; // 'scene_deconstruct' | 'interval' | 'scene_cuts' | 'high_density'

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/extract-frames.ts <project-slug> [video-filename] [mode]

Modes:
  scene_deconstruct (default): Extracts entry (~15%), apex (~50%), and exit (~85%) keyframes per scene
  interval:                    Extracts 1 frame per second (frame_%04d.jpg)
  scene_cuts:                  Extracts on shot change threshold > 0.25
  high_density:                Extracts 2 frames per second
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);

// Check destination directory: prefer 02_Deconstruction, fallback to 02_Analyzer
const deconstructDir = path.join(projectDir, '02_Deconstruction');
const legacyAnalyzerDir = path.join(projectDir, '02_Analyzer');
const baseOutputDir = fs.existsSync(legacyAnalyzerDir) && !fs.existsSync(deconstructDir)
  ? legacyAnalyzerDir
  : deconstructDir;

const framesDir = path.join(baseOutputDir, 'frames');

// Reference video directory candidate locations
const candidateVideoDirs = [
  path.join(projectDir, '01_Reference', 'video'),
  path.join(projectDir, '01_Reference', 'videos'),
  path.join(rootDir, 'public', 'projects', projectSlug),
];

if (!fs.existsSync(projectDir)) {
  console.error(`Project directory does not exist: ${projectDir}`);
  process.exit(1);
}

fs.mkdirSync(framesDir, { recursive: true });

// Find video file
let videoPath = '';
if (videoFileName && !videoFileName.startsWith('--')) {
  for (const dir of candidateVideoDirs) {
    const candidate = path.join(dir, videoFileName);
    if (fs.existsSync(candidate)) {
      videoPath = candidate;
      break;
    }
  }
}

if (!videoPath) {
  for (const dir of candidateVideoDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => /\.(mp4|mov|webm|mkv)$/i.test(f));
      if (files.length > 0) {
        videoPath = path.join(dir, files[0]);
        break;
      }
    }
  }
}

if (!videoPath || !fs.existsSync(videoPath)) {
  console.error(`❌ Video file not found. Place a reference video in projects/${projectSlug}/01_Reference/video/`);
  process.exit(1);
}

console.log(`🎬 Target reference video: ${path.relative(rootDir, videoPath)}`);
console.log(`📂 Destination frames:     ${path.relative(rootDir, framesDir)}`);
console.log(`⚙️ Mode:                   ${mode}`);

// Locate ffmpeg binary
function findFfmpeg(): string {
  // 1. System PATH
  try {
    const res = spawnSync('ffmpeg', ['-version'], { stdio: 'pipe' });
    if (res.status === 0) return 'ffmpeg';
  } catch {}

  // 2. Remotion bundled binaries
  const remotionBinary = path.join(rootDir, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
  if (fs.existsSync(remotionBinary)) {
    return remotionBinary;
  }

  return 'ffmpeg';
}

const ffmpegBin = findFfmpeg();

// Helper to parse timestamp format "00:01.80" or "01:23.45" or raw seconds
function parseTimeSeconds(ts: string | number): number {
  if (typeof ts === 'number') return ts;
  if (!ts) return 0;
  const parts = ts.trim().split(':');
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  } else if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return parseFloat(ts) || 0;
}

// Clear older frames
try {
  const existing = fs.readdirSync(framesDir);
  for (const f of existing) {
    if (/\.(jpg|png|webp)$/i.test(f)) {
      fs.unlinkSync(path.join(framesDir, f));
    }
  }
} catch {}

if (mode === 'scene_deconstruct') {
  console.log(`\n🔍 Performing Scene-Level Visual Deconstruction...`);

  // Check if Phase 1A TEMPORAL_ANALYSIS.yaml exists
  const candidateAnalysis = [
    path.join(projectDir, '02_Deconstruction', 'TEMPORAL_ANALYSIS.yaml'),
    path.join(projectDir, '02_Analyzer', 'TEMPORAL_ANALYSIS.yaml'),
  ];
  let temporalYamlPath: string | null = null;
  for (const p of candidateAnalysis) {
    if (fs.existsSync(p)) {
      temporalYamlPath = p;
      break;
    }
  }

  interface SceneCut {
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    frames?: {
      entry: { time: number; file: string };
      apex: { time: number; file: string };
      exit: { time: number; file: string };
    };
  }

  const scenes: SceneCut[] = [];

  if (temporalYamlPath) {
    console.log(`📖 Loading detected scenes from Phase 1A temporal analysis: ${path.relative(rootDir, temporalYamlPath)}`);
    try {
      const data = YAML.parse(fs.readFileSync(temporalYamlPath, 'utf8'));
      const rawScenes = data.temporal_analysis?.scenes || data.scenes || [];

      for (let i = 0; i < rawScenes.length; i++) {
        const s = rawScenes[i];
        let start = 0;
        let end = 0;

        if (s.timestamp && typeof s.timestamp === 'string') {
          const split = s.timestamp.split('-').map((t: string) => t.trim());
          if (split.length === 2) {
            start = parseTimeSeconds(split[0]);
            end = parseTimeSeconds(split[1]);
          }
        } else if (typeof s.start === 'number' && typeof s.end === 'number') {
          start = s.start;
          end = s.end;
        } else if (typeof s.duration === 'number') {
          const prevEnd = scenes.length > 0 ? scenes[scenes.length - 1].end_time : 0;
          start = prevEnd;
          end = prevEnd + s.duration;
        }

        const duration = Math.max(0.1, end - start);
        scenes.push({
          id: s.id || `scene_${String(i + 1).padStart(2, '0')}`,
          start_time: Number(start.toFixed(2)),
          end_time: Number(end.toFixed(2)),
          duration: Number(duration.toFixed(2)),
        });
      }
    } catch (e: any) {
      console.warn(`⚠️ Could not parse TEMPORAL_ANALYSIS.yaml: ${e.message}`);
    }
  }

  // If no scenes from YAML, try running FFmpeg scene detection or use default 3-scene distribution
  if (scenes.length === 0) {
    console.log(`Attempting FFmpeg scene cut detection (threshold 0.25)...`);
    try {
      const showInfo = spawnSync(ffmpegBin, [
        '-i', videoPath,
        '-filter:v', "select='gt(scene,0.25)',showinfo",
        '-f', 'null',
        '-',
      ], { stdio: 'pipe' });

      const stderr = showInfo.stderr ? showInfo.stderr.toString() : '';
      const ptsMatches = Array.from(stderr.matchAll(/pts_time:([0-9.]+)/g)).map(m => parseFloat(m[1]));

      if (ptsMatches.length > 0) {
        const cuts = [0.0, ...ptsMatches];
        for (let i = 0; i < cuts.length - 1; i++) {
          const start = cuts[i];
          const end = cuts[i + 1];
          scenes.push({
            id: `scene_${String(i + 1).padStart(2, '0')}`,
            start_time: Number(start.toFixed(2)),
            end_time: Number(end.toFixed(2)),
            duration: Number((end - start).toFixed(2)),
          });
        }
      }
    } catch {}
  }

  // Fallback if still no scenes: default 3-shot pacing
  if (scenes.length === 0) {
    console.log(`ℹ️ Defaulting to standard 3-shot structure for scene deconstruction.`);
    scenes.push(
      { id: 'scene_01', start_time: 0.0, end_time: 2.5, duration: 2.5 },
      { id: 'scene_02', start_time: 2.5, end_time: 5.5, duration: 3.0 },
      { id: 'scene_03', start_time: 5.5, end_time: 8.5, duration: 3.0 }
    );
  }

  console.log(`📸 Extracting Entry (15%), Apex (50%), Exit (85%) snapshots for ${scenes.length} scene(s)...`);

  for (const scene of scenes) {
    const entryTime = Number((scene.start_time + scene.duration * 0.15).toFixed(2));
    const apexTime = Number((scene.start_time + scene.duration * 0.50).toFixed(2));
    const exitTime = Number((scene.start_time + scene.duration * 0.85).toFixed(2));

    const entryFile = `${scene.id}_entry.jpg`;
    const apexFile = `${scene.id}_apex.jpg`;
    const exitFile = `${scene.id}_exit.jpg`;

    scene.frames = {
      entry: { time: entryTime, file: entryFile },
      apex: { time: apexTime, file: apexFile },
      exit: { time: exitTime, file: exitFile },
    };

    const targets = [
      { time: entryTime, file: entryFile, label: 'Entry' },
      { time: apexTime, file: apexFile, label: 'Apex' },
      { time: exitTime, file: exitFile, label: 'Exit' },
    ];

    for (const t of targets) {
      const outPath = path.join(framesDir, t.file);
      try {
        const res = spawnSync(ffmpegBin, [
          '-y',
          '-ss', String(t.time),
          '-i', videoPath,
          '-vframes', '1',
          '-q:v', '2',
          outPath,
        ], { stdio: 'pipe' });

        if (res.status === 0 && fs.existsSync(outPath)) {
          console.log(`  ✓ [${scene.id}] ${t.label} @ ${t.time}s -> ${t.file}`);
        } else {
          // If ffmpeg execution failed (e.g. system permissions), create placeholder or warn
          console.warn(`  ⚠️ Could not extract ${t.file} @ ${t.time}s via ffmpeg.`);
        }
      } catch (err: any) {
        console.warn(`  ⚠️ Extraction error for ${t.file}: ${err.message}`);
      }
    }
  }

  // Write scene_cuts.yaml
  const cutsManifest = {
    scene_cuts: {
      project: projectSlug,
      video: path.relative(rootDir, videoPath),
      total_scenes: scenes.length,
      scenes,
    },
  };

  const cutsPath = path.join(baseOutputDir, 'scene_cuts.yaml');
  fs.writeFileSync(cutsPath, YAML.stringify(cutsManifest, { indent: 2 }), 'utf8');
  console.log(`\n✅ Scene cuts manifest saved: ${path.relative(rootDir, cutsPath)}`);

  const extracted = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
  console.log(`🎉 Scene deconstruction complete! ${extracted.length} keyframes extracted.`);
} else {
  // Interval, scene_cuts, or high_density modes
  try {
    let filter = 'fps=1';
    if (mode === 'scene_cuts') {
      filter = "select='gt(scene,0.25)',showinfo";
    } else if (mode === 'high_density') {
      filter = 'fps=2';
    }

    const outputPattern = path.join(framesDir, 'frame_%04d.jpg');
    const cmd = `${ffmpegBin} -y -i "${videoPath}" -vf "${filter}" -vsync vfr -q:v 2 "${outputPattern}"`;

    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });

    const extracted = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
    console.log(`✅ Extracted ${extracted.length} frame snapshots successfully!`);
  } catch (error: any) {
    console.error('❌ Extraction failed. Please ensure ffmpeg is installed in PATH or specify valid arguments.');
    console.error(error.message);
    process.exit(1);
  }
}
