/**
 * Quick verification of the new beat-aligned soundtrack
 */
import fs from 'node:fs';

const SAMPLE_RATE = 48000;

function readWavPCM(filePath: string) {
  const buf = fs.readFileSync(filePath);
  let offset = 12;
  let dataOffset = -1;
  let dataSize = -1;
  while (offset < buf.byteLength - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'data') { dataOffset = offset + 8; dataSize = chunkSize; break; }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset += 1;
  }
  const numSamples = Math.floor(dataSize / 4);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    left[i] = buf.readInt16LE(dataOffset + i * 4) / 32768;
    right[i] = buf.readInt16LE(dataOffset + i * 4 + 2) / 32768;
  }
  return { left, right };
}

const audio = readWavPCM('public/projects/dzinr/dzinr_motion_soundtrack.wav');

// Energy per 200ms with scene labels
const CUTS = [
  { time: 0,   label: 'SC01' },
  { time: 1.0, label: 'SC02' },
  { time: 2.0, label: 'SC03' },
  { time: 3.0, label: 'SC04' },
  { time: 4.2, label: 'SC05' },
  { time: 5.8, label: 'SC06' },
  { time: 7.2, label: 'SC07a' },
  { time: 8.0, label: 'LOGO' },
  { time: 11.07, label: 'END' },
];

function getSceneLabel(t: number): string {
  for (let i = CUTS.length - 1; i >= 0; i--) {
    if (t >= CUTS[i].time) return CUTS[i].label;
  }
  return '';
}

console.log('=== NEW SOUNDTRACK ENERGY PROFILE (200ms bins) ===');
const binSize = Math.floor(0.2 * SAMPLE_RATE);
for (let t = 0; t < audio.left.length; t += binSize) {
  const end = Math.min(t + binSize, audio.left.length);
  let rms = 0, peak = 0;
  for (let i = t; i < end; i++) {
    const mono = (audio.left[i] + audio.right[i]) * 0.5;
    rms += mono * mono;
    const abs = Math.abs(mono);
    if (abs > peak) peak = abs;
  }
  rms = Math.sqrt(rms / (end - t));
  const timeSec = t / SAMPLE_RATE;
  const scene = getSceneLabel(timeSec);
  const bar = '█'.repeat(Math.round(rms * 80));
  const isCut = CUTS.some(c => Math.abs(c.time - timeSec) < 0.1 && c.label !== 'END');
  console.log(`${timeSec.toFixed(1).padStart(5)}s [${scene.padEnd(5)}]${isCut ? ' ►' : '  '} ${bar} (${rms.toFixed(3)})`);
}
