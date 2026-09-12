/**
 * Master Motion Reel Soundtrack Engine (Clean Studio Master)
 * Uses the authentic, professional studio-grade music bed from ref_audio.wav
 * without ANY artificial clicking noises or synthetic sine-wave clicks.
 * Pure, pristine commercial audio with natural drums, sub-bass, and cinematic atmosphere.
 */
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 48000;
const FPS = 30;
const TOTAL_FRAMES = 332;
const TOTAL_SAMPLES = Math.floor((TOTAL_FRAMES / FPS) * SAMPLE_RATE); // 531,200 samples (~11.067s)

// Load authentic reference audio bed
const refBuffer = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
// 44-byte WAV header, 16-bit stereo PCM
const pcmBytes = refBuffer.byteLength - 44;
const totalPcmSamples = Math.floor(pcmBytes / 4);

console.log(`Loaded authentic studio audio bed: ${totalPcmSamples} stereo sample frames (${(totalPcmSamples / SAMPLE_RATE).toFixed(3)}s)`);

const masterLeft = new Float32Array(TOTAL_SAMPLES);
const masterRight = new Float32Array(TOTAL_SAMPLES);

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  if (i < totalPcmSamples) {
    const offset = 44 + i * 4;
    masterLeft[i] = refBuffer.readInt16LE(offset) / 32768;
    masterRight[i] = refBuffer.readInt16LE(offset + 2) / 32768;
  } else {
    masterLeft[i] = 0;
    masterRight[i] = 0;
  }
}

// Transparent mastering with soft-clip analog tape limiter (zero clicks added!)
console.log('Mastering clean studio audio (ZERO artificial clicks added)...');

let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const l = Math.abs(masterLeft[i]);
  const r = Math.abs(masterRight[i]);
  if (l > maxPeak) maxPeak = l;
  if (r > maxPeak) maxPeak = r;
}
console.log(`Peak pre-master level: ${maxPeak.toFixed(3)}`);

const targetPeak = 0.98;
const normGain = maxPeak > 0 ? targetPeak / Math.max(maxPeak, 1.0) : 1.0;

const pcmData = new Int16Array(TOTAL_SAMPLES * 2);
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const l = Math.tanh(masterLeft[i] * normGain);
  const r = Math.tanh(masterRight[i] * normGain);
  pcmData[i * 2] = Math.max(-32768, Math.min(32767, Math.floor(l * 32767)));
  pcmData[i * 2 + 1] = Math.max(-32768, Math.min(32767, Math.floor(r * 32767)));
}

const wavBuffer = Buffer.alloc(44 + pcmData.byteLength);
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + pcmData.byteLength, 4);
wavBuffer.write('WAVE', 8);

wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16);
wavBuffer.writeUInt16LE(1, 20);
wavBuffer.writeUInt16LE(2, 22);
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24);
wavBuffer.writeUInt32LE(SAMPLE_RATE * 2 * 2, 28);
wavBuffer.writeUInt16LE(4, 32);
wavBuffer.writeUInt16LE(16, 34);

wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(pcmData.byteLength, 40);

Buffer.from(pcmData.buffer).copy(wavBuffer, 44);

const outPath = path.resolve('public/projects/dzinr/dzinr_motion_soundtrack.wav');
fs.writeFileSync(outPath, wavBuffer);

console.log(`✅ Clean studio soundtrack written to: ${outPath} (${(wavBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
