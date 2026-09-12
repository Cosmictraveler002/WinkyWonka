import fs from 'node:fs';

// Let's inspect ref_audio.wav
const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 48000;
const totalSamples = pcm.length / 2;

console.log(`Ref audio total duration: ${(totalSamples / sampleRate).toFixed(3)}s`);

// Let's check max peak and average RMS
let peak = 0;
let sumSq = 0;
for (let i = 0; i < pcm.length; i++) {
  const val = pcm[i] / 32768;
  const abs = Math.abs(val);
  if (abs > peak) peak = abs;
  sumSq += val * val;
}
const rms = Math.sqrt(sumSq / pcm.length);
console.log(`Peak: ${peak.toFixed(3)}, Overall RMS: ${rms.toFixed(3)}`);
