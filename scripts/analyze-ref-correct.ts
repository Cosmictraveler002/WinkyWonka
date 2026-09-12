/**
 * Analyze the reference audio from dzinr-Old.mp4 with the CORRECT data offset.
 * The ref_audio.wav has a LIST chunk so data starts at byte 78, NOT 44.
 * 
 * This script:
 * 1. Reads the PCM from the correct offset
 * 2. Finds transient peaks (where the beats actually land)
 * 3. Measures energy per scene to understand the dynamic arc
 * 4. Outputs a beat map we can use for re-alignment
 */
import fs from 'node:fs';

const SAMPLE_RATE = 48000;
const FPS = 30;

// Correct WAV parsing
function readWavPCM(filePath: string): { left: Float32Array; right: Float32Array; sampleRate: number } {
  const buf = fs.readFileSync(filePath);
  
  // Find actual data chunk
  let offset = 12;
  let dataOffset = -1;
  let dataSize = -1;
  let sampleRate = 48000;
  
  while (offset < buf.byteLength - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    
    if (chunkId === 'fmt ') {
      sampleRate = buf.readUInt32LE(offset + 12);
    }
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset += 1;
  }
  
  if (dataOffset < 0) throw new Error('No data chunk found');
  
  const numSamples = Math.floor(dataSize / 4); // stereo 16-bit = 4 bytes per sample
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    left[i] = buf.readInt16LE(dataOffset + i * 4) / 32768;
    right[i] = buf.readInt16LE(dataOffset + i * 4 + 2) / 32768;
  }
  
  return { left, right, sampleRate };
}

const audio = readWavPCM('public/projects/dzinr/ref_audio.wav');
console.log(`Loaded ref_audio: ${audio.left.length} samples, ${(audio.left.length / SAMPLE_RATE).toFixed(3)}s`);

// Scene cut timestamps in our composition
const CUTS = [
  { frame: 0,   time: 0.000, label: 'Scene 01 start' },
  { frame: 30,  time: 1.000, label: 'Scene 02 start (Cut 1)' },
  { frame: 60,  time: 2.000, label: 'Scene 03 start (Cut 2)' },
  { frame: 90,  time: 3.000, label: 'Scene 04 start (Cut 3)' },
  { frame: 126, time: 4.200, label: 'Scene 05 start (Cut 4)' },
  { frame: 174, time: 5.800, label: 'Scene 06 start (Cut 5)' },
  { frame: 216, time: 7.200, label: 'Scene 07a start (Cut 6 - tension)' },
  { frame: 240, time: 8.000, label: 'Scene 07b start (LOGO DROP)' },
];

// 1. Energy per scene
console.log('\n=== ENERGY PER SCENE (ref_audio, correct offset) ===');
for (let s = 0; s < CUTS.length; s++) {
  const startSample = Math.floor(CUTS[s].time * SAMPLE_RATE);
  const endSample = s < CUTS.length - 1 
    ? Math.floor(CUTS[s + 1].time * SAMPLE_RATE)
    : Math.min(audio.left.length, Math.floor(11.07 * SAMPLE_RATE));
  
  let rms = 0;
  let peak = 0;
  const count = endSample - startSample;
  for (let i = startSample; i < endSample && i < audio.left.length; i++) {
    const mono = (audio.left[i] + audio.right[i]) * 0.5;
    rms += mono * mono;
    const abs = Math.abs(mono);
    if (abs > peak) peak = abs;
  }
  rms = Math.sqrt(rms / count);
  
  const bar = '█'.repeat(Math.round(rms * 50));
  console.log(`  ${CUTS[s].label.padEnd(40)} RMS: ${rms.toFixed(3)} Peak: ${peak.toFixed(2)} ${bar}`);
}

// 2. Find transient peaks (onset detection)
console.log('\n=== TRANSIENT DETECTION (energy delta method) ===');
const windowSize = Math.floor(0.01 * SAMPLE_RATE); // 10ms windows
const hopSize = Math.floor(0.005 * SAMPLE_RATE);   // 5ms hop
const numWindows = Math.floor((audio.left.length - windowSize) / hopSize);
const energyProfile: number[] = [];

for (let w = 0; w < numWindows; w++) {
  const start = w * hopSize;
  let e = 0;
  for (let i = 0; i < windowSize; i++) {
    const mono = (audio.left[start + i] + audio.right[start + i]) * 0.5;
    e += mono * mono;
  }
  energyProfile.push(Math.sqrt(e / windowSize));
}

// Find peaks in energy delta
const transients: { time: number; strength: number }[] = [];
const minGap = Math.floor(0.08 * SAMPLE_RATE / hopSize); // min 80ms between transients

for (let w = 2; w < energyProfile.length - 1; w++) {
  const delta = energyProfile[w] - energyProfile[w - 2];
  if (delta > 0.05 && energyProfile[w] > energyProfile[w - 1] && energyProfile[w] > energyProfile[w + 1]) {
    const time = (w * hopSize) / SAMPLE_RATE;
    if (transients.length === 0 || time - transients[transients.length - 1].time > 0.08) {
      transients.push({ time, strength: delta });
    }
  }
}

console.log(`Found ${transients.length} transients:`);
for (const t of transients) {
  // Find nearest cut
  let nearestCut = '';
  let nearestDist = Infinity;
  for (const cut of CUTS) {
    const dist = Math.abs(t.time - cut.time);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestCut = cut.label;
    }
  }
  const alignment = nearestDist < 0.05 ? '✅ ALIGNED' : nearestDist < 0.15 ? '⚠️ CLOSE' : '';
  console.log(`  ${t.time.toFixed(3)}s (Δ=${t.strength.toFixed(3)}) ${alignment} ${alignment ? `to ${nearestCut} (${(nearestDist * 1000).toFixed(0)}ms off)` : ''}`);
}

// 3. Fine-grained energy profile per 100ms
console.log('\n=== 100ms ENERGY PROFILE ===');
const binSize = Math.floor(0.1 * SAMPLE_RATE);
for (let t = 0; t < audio.left.length; t += binSize) {
  const end = Math.min(t + binSize, audio.left.length);
  let rms = 0;
  let peak = 0;
  for (let i = t; i < end; i++) {
    const mono = (audio.left[i] + audio.right[i]) * 0.5;
    rms += mono * mono;
    const abs = Math.abs(mono);
    if (abs > peak) peak = abs;
  }
  rms = Math.sqrt(rms / (end - t));
  const timeS = (t / SAMPLE_RATE).toFixed(1);
  const bar = '█'.repeat(Math.round(rms * 60));
  console.log(`  ${timeS.padStart(5)}s: ${bar} (${rms.toFixed(3)})`);
}
