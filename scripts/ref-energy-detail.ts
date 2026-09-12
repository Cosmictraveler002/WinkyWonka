import fs from 'node:fs';

const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 48000;
const fps = 30;

// Let's examine every frame between frame 60 (2.0s) and frame 245 (8.16s)
console.log('Frame-by-frame RMS and Peak Energy in ref_audio.wav:');
for (let f = 60; f <= 245; f++) {
  const startSample = Math.floor((f / fps) * sampleRate);
  const endSample = Math.floor(((f + 1) / fps) * sampleRate);
  let sumSq = 0;
  let peak = 0;
  for (let s = startSample; s < endSample; s++) {
    const l = pcm[s * 2] / 32768;
    const r = pcm[s * 2 + 1] / 32768;
    const val = (l + r) / 2;
    sumSq += val * val;
    const abs = Math.abs(val);
    if (abs > peak) peak = abs;
  }
  const rms = Math.sqrt(sumSq / (endSample - startSample));
  const isCut = [90, 126, 174, 216, 240].includes(f);
  const mark = isCut ? ' <--- CUT / DROP TARGET' : '';
  const bar = '■'.repeat(Math.round(rms * 40));
  if (peak > 0.4 || isCut) {
    console.log(`Frame ${f.toString().padStart(3, ' ')} (${(f / fps).toFixed(2)}s): ${bar.padEnd(20, ' ')} RMS: ${rms.toFixed(3)} Peak: ${peak.toFixed(3)}${mark}`);
  }
}
