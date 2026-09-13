/**
 * Step 1: Audio Extractor
 * 
 * Extracts clean 48kHz stereo PCM WAV from the reference video
 * and places it into `projects/<slug>/02_Analyzer/audio/ref_audio.wav`.
 * 
 * Usage:
 *   bun scripts/audio/extract.ts <project-slug>
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readWav, writeWav, inspectWavChunks } from './lib/wav';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error(`
Usage:
  bun scripts/audio/extract.ts <project-slug>

Example:
  bun scripts/audio/extract.ts dzinr
`);
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);
const audioDir00 = path.join(projectDir, '00_Audio');
const audioDir02 = path.join(projectDir, '02_Analyzer', 'audio');
const outputAudioDir = fs.existsSync(audioDir00) ? audioDir00 : audioDir02;
const targetWavPath = path.join(outputAudioDir, 'ref_audio.wav');

console.log(`\n========================================`);
console.log(`🎵 [Step 1/6] EXTRACT AUDIO: "${projectSlug}"`);
console.log(`========================================\n`);

if (!fs.existsSync(projectDir)) {
  console.error(`❌ Project directory not found: ${projectDir}`);
  process.exit(1);
}

fs.mkdirSync(outputAudioDir, { recursive: true });

// 1. Locate reference video or existing audio
const candidateVideoPaths = [
  path.join(projectDir, '01_Reference', 'video'),
  path.join(projectDir, '01_Reference', 'videos'),
  path.join(rootDir, 'public', 'projects', projectSlug),
];

let refVideoPath: string | null = null;
for (const dir of candidateVideoPaths) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const mp4 = files.find(f => f.toLowerCase().endsWith('.mp4'));
    if (mp4) {
      refVideoPath = path.join(dir, mp4);
      break;
    }
  }
}

// Check for existing raw reference audio or user-provided soundtrack
const candidateAudioPaths = [
  path.join(audioDir00, 'soundtrack.wav'),
  path.join(audioDir00, 'ref_audio.wav'),
  path.join(audioDir02, 'ref_audio.wav'),
  targetWavPath,
  path.join(rootDir, 'public', 'projects', projectSlug, 'ref_audio.wav'),
  path.join(projectDir, '01_Reference', 'audio', 'ref_audio.wav'),
];

let existingAudioPath: string | null = null;
for (const p of candidateAudioPaths) {
  if (fs.existsSync(p)) {
    existingAudioPath = p;
    break;
  }
}

let extractionSuccess = false;

// 2. Attempt ffmpeg extraction if video is found
if (refVideoPath) {
  console.log(`Found reference video: ${path.relative(rootDir, refVideoPath)}`);
  console.log(`Extracting audio stream using ffmpeg...`);

  const ffmpegRes = spawnSync('ffmpeg', [
    '-y',
    '-i', refVideoPath,
    '-vn',
    '-acodec', 'pcm_s16le',
    '-ar', '48000',
    '-ac', '2',
    targetWavPath,
  ], { stdio: 'pipe' });

  if (ffmpegRes.status === 0 && fs.existsSync(targetWavPath)) {
    console.log(`  ✓ ffmpeg extraction successful.`);
    extractionSuccess = true;
  } else {
    console.log(`  ℹ ffmpeg not available or failed. Falling back to existing WAV if present.`);
  }
}

// 3. Fallback: normalize existing WAV through readWav -> writeWav
if (!extractionSuccess && existingAudioPath) {
  console.log(`Found existing reference audio: ${path.relative(rootDir, existingAudioPath)}`);
  console.log(`Normalizing and sanitizing WAV chunks...`);

  const wav = readWav(existingAudioPath);
  writeWav(targetWavPath, {
    left: wav.left,
    right: wav.right,
    sampleRate: 48000,
  });
  console.log(`  ✓ Normalized WAV written to: ${path.relative(rootDir, targetWavPath)}`);
  extractionSuccess = true;
}

if (!extractionSuccess) {
  console.error(`❌ Could not extract audio: no reference video or WAV found for "${projectSlug}".`);
  console.error(`   Place an .mp4 in projects/${projectSlug}/01_Reference/video/ or ref_audio.wav in public/projects/${projectSlug}/`);
  process.exit(1);
}

// Mirror audio to secondary directory if both exist
const secondaryDir = outputAudioDir === audioDir00 ? audioDir02 : audioDir00;
if (fs.existsSync(secondaryDir)) {
  try {
    fs.copyFileSync(targetWavPath, path.join(secondaryDir, 'ref_audio.wav'));
  } catch {}
}

// 4. Validate output WAV
const inspected = inspectWavChunks(fs.readFileSync(targetWavPath));
const verified = readWav(targetWavPath);

console.log(`\n✅ Audio Extraction Complete:`);
console.log(`   Output:      ${path.relative(rootDir, targetWavPath)}`);
console.log(`   Duration:    ${verified.duration.toFixed(3)}s`);
console.log(`   Sample Rate: ${inspected.sampleRate} Hz`);
console.log(`   Channels:    ${inspected.numChannels}`);
console.log(`   Bit Depth:   ${inspected.bitsPerSample}-bit`);
console.log(`   Data Offset: byte ${inspected.dataOffset} (clean standard header)`);
console.log(`   Total Samples: ${verified.left.length}\n`);
