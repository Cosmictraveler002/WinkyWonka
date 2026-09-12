import fs from 'node:fs';

// Let's inspect ref_audio.wav spectral features
// Check high frequency energy (whooshes/clicks) vs low frequency energy (kicks/bass)
const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 48000;
const fps = 30;

console.log('Analyzing frequency bands in ref_audio.wav around transitions:');

function analyzeWindow(startSec: number, endSec: number) {
  const start = Math.floor(startSec * sampleRate);
  const end = Math.floor(endSec * sampleRate);
  let low = 0;
  let mid = 0;
  let high = 0;
  for (let i = start; i < end - 1; i++) {
    const s = pcm[i * 2] / 32768;
    const diff = Math.abs(pcm[(i + 1) * 2] - pcm[i * 2]) / 32768;
    high += diff * diff;
    low += s * s;
  }
  return {
    lowRms: Math.sqrt(low / (end - start)),
    highRms: Math.sqrt(high / (end - start))
  };
}

const keyMoments = [
  { label: 'Scene 01 Intro', t: 0.0 },
  { label: 'Scene 02 Laptop Cut', t: 1.0 },
  { label: 'Scene 03 Logo Cut', t: 2.0 },
  { label: 'Scene 04 Branding Cut', t: 3.0 },
  { label: 'Scene 05 Inversion Cut', t: 4.2 },
  { label: 'Scene 06 Crest Cut', t: 5.8 },
  { label: 'Scene 07 Riser Pre-drop', t: 7.2 },
  { label: 'Scene 07 Hero Drop', t: 8.0 },
];

for (const m of keyMoments) {
  const data = analyzeWindow(m.t, m.t + 0.3);
  console.log(`${m.label.padEnd(25, ' ')} (${m.t.toFixed(1)}s): Low: ${data.lowRms.toFixed(3)}, High: ${data.highRms.toFixed(3)}`);
}
