import fs from 'node:fs';

const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 48000;
const totalSamples = pcm.length / 2;

// Compute energy envelope
const hopSize = 480; // 10ms (100 Hz frame rate)
const numFrames = Math.floor(totalSamples / hopSize);
const energy = new Float32Array(numFrames);

for (let i = 0; i < numFrames; i++) {
  let sum = 0;
  for (let j = 0; j < hopSize; j++) {
    const sIdx = (i * hopSize + j) * 2;
    const l = pcm[sIdx] / 32768;
    const r = pcm[sIdx + 1] / 32768;
    sum += (l * l + r * r) * 0.5;
  }
  energy[i] = Math.sqrt(sum / hopSize);
}

// Autocorrelation of energy envelope to find BPM
const minBpm = 80;
const maxBpm = 160;
const minLag = Math.floor((60 / maxBpm) * 100); // 100 frames per sec
const maxLag = Math.floor((60 / minBpm) * 100);

let bestLag = 0;
let maxCorr = -1;

for (let lag = minLag; lag <= maxLag; lag++) {
  let corr = 0;
  for (let i = 0; i < numFrames - lag; i++) {
    corr += energy[i] * energy[i + lag];
  }
  if (corr > maxCorr) {
    maxCorr = corr;
    bestLag = lag;
  }
}

const detectedBpm = (60 * 100) / bestLag;
console.log(`Detected BPM of ref_audio.wav: ${detectedBpm.toFixed(1)} BPM (Lag: ${bestLag}0 ms)`);

// Check peaks in energy
const peaks: { time: number; frame30: number; energy: number }[] = [];
for (let i = 2; i < numFrames - 2; i++) {
  if (energy[i] > 0.15 &&
      energy[i] > energy[i - 1] && energy[i] > energy[i - 2] &&
      energy[i] >= energy[i + 1] && energy[i] >= energy[i + 2]) {
    const time = i / 100;
    peaks.push({ time, frame30: Math.round(time * 30), energy: energy[i] });
  }
}

console.log('Top Energy Peaks in ref_audio.wav:');
peaks.sort((a, b) => b.energy - a.energy).slice(0, 20).sort((a, b) => a.time - b.time).forEach(p => {
  console.log(`Time: ${p.time.toFixed(2)}s | Video Frame @30fps: ${p.frame30} | Energy: ${p.energy.toFixed(3)}`);
});
