import fs from 'node:fs';

const buf = fs.readFileSync('public/projects/dzinr/ref_audio.wav');
// 44-byte WAV header, 16-bit stereo 48kHz
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const numSamples = pcm.length / 2;
const sampleRate = 48000;
const duration = numSamples / sampleRate;

console.log(`Audio Duration: ${duration.toFixed(3)}s, Samples: ${numSamples}`);

// Analyze energy in 50ms windows (2400 samples)
const windowSize = 2400; // 50ms
const windows = Math.floor(numSamples / windowSize);

interface EnergyWindow {
  timeSec: number;
  frame: number;
  rms: number;
  peak: number;
}

const timeline: EnergyWindow[] = [];

for (let w = 0; w < windows; w++) {
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < windowSize; i++) {
    const idx = (w * windowSize + i) * 2;
    const l = pcm[idx] / 32768;
    const r = pcm[idx + 1] / 32768;
    const mono = (l + r) / 2;
    sumSq += mono * mono;
    const abs = Math.abs(mono);
    if (abs > peak) peak = abs;
  }
  const rms = Math.sqrt(sumSq / windowSize);
  const timeSec = (w * windowSize) / sampleRate;
  const frame = Math.round(timeSec * 30);
  timeline.push({ timeSec, frame, rms, peak });
}

// Find transients/peaks (onset detection)
const onsets: { timeSec: number; frame: number; peak: number }[] = [];
for (let i = 1; i < timeline.length - 1; i++) {
  const prev = timeline[i - 1];
  const curr = timeline[i];
  const next = timeline[i + 1];
  if (curr.peak > 0.25 && curr.peak > prev.peak && curr.peak >= next.peak) {
    onsets.push({ timeSec: curr.timeSec, frame: curr.frame, peak: curr.peak });
  }
}

console.log('\n--- Significant Onsets / Beat Hits in Reference Audio ---');
for (const o of onsets) {
  console.log(`Time: ${o.timeSec.toFixed(2)}s | Frame: ${o.frame.toString().padStart(3, ' ')} | Peak: ${o.peak.toFixed(2)}`);
}

// Print 0.5s summary chunks
console.log('\n--- Energy profile per 0.5s ---');
for (let sec = 0; sec < Math.floor(duration * 2) / 2; sec += 0.5) {
  const sub = timeline.filter(t => t.timeSec >= sec && t.timeSec < sec + 0.5);
  const avgRms = sub.reduce((acc, s) => acc + s.rms, 0) / (sub.length || 1);
  const maxP = Math.max(...sub.map(s => s.peak));
  const bar = '█'.repeat(Math.round(avgRms * 40));
  console.log(`${sec.toFixed(1).padStart(4, ' ')}s (f${Math.round(sec * 30).toString().padStart(3, ' ')}): ${bar} (RMS: ${avgRms.toFixed(3)}, Peak: ${maxP.toFixed(2)})`);
}
