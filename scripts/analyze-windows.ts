import fs from 'node:fs';

const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 48000;

console.log('Analyzing ref audio structure...');

// Let's find zero-crossing or transient points
const transients: { time: number; frame: number; type: string }[] = [];

// Check peak frequency and energy in 40ms blocks
for (let t = 0; t < 10.5; t += 0.05) {
  const start = Math.floor(t * sampleRate);
  const end = Math.floor((t + 0.05) * sampleRate);
  let maxAmp = 0;
  for (let i = start; i < end; i++) {
    const amp = Math.abs(pcm[i * 2] / 32768);
    if (amp > maxAmp) maxAmp = amp;
  }
  if (maxAmp > 0.45) {
    transients.push({ time: t, frame: Math.round(t * 30), type: `amp_${maxAmp.toFixed(2)}` });
  }
}

console.log('High energy windows:', transients.length);
