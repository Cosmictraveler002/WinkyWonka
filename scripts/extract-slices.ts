import fs from 'node:fs';

const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 48000;

// Let's write a small function to save a WAV slice
function saveSlice(filename: string, startSec: number, durationSec: number) {
  const startSample = Math.floor(startSec * sampleRate);
  const numSamples = Math.floor(durationSec * sampleRate);
  const pcmSlice = new Int16Array(numSamples * 2);
  
  for (let i = 0; i < numSamples * 2; i++) {
    const srcIdx = startSample * 2 + i;
    pcmSlice[i] = (srcIdx < pcm.length) ? pcm[srcIdx] : 0;
  }

  // Smooth 5ms fade in and 20ms fade out to avoid clicks
  const fadeInSamples = Math.floor(0.005 * sampleRate);
  const fadeOutSamples = Math.floor(0.030 * sampleRate);
  for (let i = 0; i < numSamples; i++) {
    let env = 1.0;
    if (i < fadeInSamples) env = i / fadeInSamples;
    else if (i > numSamples - fadeOutSamples) env = (numSamples - i) / fadeOutSamples;
    pcmSlice[i * 2] = Math.round(pcmSlice[i * 2] * env);
    pcmSlice[i * 2 + 1] = Math.round(pcmSlice[i * 2 + 1] * env);
  }

  const wavBuffer = Buffer.alloc(44 + pcmSlice.byteLength);
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + pcmSlice.byteLength, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(2, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(sampleRate * 4, 28);
  wavBuffer.writeUInt16LE(4, 32);
  wavBuffer.writeUInt16LE(16, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(pcmSlice.byteLength, 40);
  Buffer.from(pcmSlice.buffer).copy(wavBuffer, 44);

  fs.writeFileSync(filename, wavBuffer);
  console.log(`Saved slice ${filename}: ${durationSec}s`);
}

saveSlice('public/projects/dzinr/slice_kick1.wav', 0.18, 0.25);
saveSlice('public/projects/dzinr/slice_snare1.wav', 0.32, 0.30);
saveSlice('public/projects/dzinr/slice_hat1.wav', 0.80, 0.15);
saveSlice('public/projects/dzinr/slice_impact.wav', 2.48, 0.60);
saveSlice('public/projects/dzinr/slice_drop.wav', 8.00, 0.80);
