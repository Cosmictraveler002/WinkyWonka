/**
 * Properly parse WAV file chunks to find the actual PCM data location
 */
import fs from 'node:fs';

function inspectWav(filePath: string) {
  const buf = fs.readFileSync(filePath);
  console.log(`\n=== ${filePath} (${buf.byteLength} bytes) ===`);
  
  // RIFF header
  const riff = buf.toString('ascii', 0, 4);
  const fileSize = buf.readUInt32LE(4);
  const wave = buf.toString('ascii', 8, 12);
  console.log(`RIFF: ${riff}, Size: ${fileSize}, Format: ${wave}`);
  
  // Parse chunks
  let offset = 12;
  let dataOffset = -1;
  let dataSize = -1;
  let sampleRate = 0;
  let channels = 0;
  let bitsPerSample = 0;
  
  while (offset < buf.byteLength - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    console.log(`  Chunk: "${chunkId}" at offset ${offset}, size: ${chunkSize}`);
    
    if (chunkId === 'fmt ') {
      const audioFormat = buf.readUInt16LE(offset + 8);
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      const byteRate = buf.readUInt32LE(offset + 16);
      const blockAlign = buf.readUInt16LE(offset + 20);
      bitsPerSample = buf.readUInt16LE(offset + 22);
      console.log(`    Format: ${audioFormat}, Channels: ${channels}, SampleRate: ${sampleRate}`);
      console.log(`    ByteRate: ${byteRate}, BlockAlign: ${blockAlign}, BitsPerSample: ${bitsPerSample}`);
    }
    
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      console.log(`    DATA starts at byte ${dataOffset}, PCM size: ${dataSize}`);
      const numSamples = dataSize / (channels * (bitsPerSample / 8));
      const durationSec = numSamples / sampleRate;
      console.log(`    Samples: ${numSamples}, Duration: ${durationSec.toFixed(3)}s`);
    }
    
    if (chunkId === 'LIST') {
      const listType = buf.toString('ascii', offset + 8, offset + 12);
      console.log(`    LIST type: ${listType}`);
    }
    
    offset += 8 + chunkSize;
    // Chunks must be word-aligned
    if (chunkSize % 2 !== 0) offset += 1;
  }
  
  return { dataOffset, dataSize, sampleRate, channels, bitsPerSample };
}

// Inspect all WAV files
const files = [
  'public/projects/dzinr/ref_audio.wav',
  'public/projects/dzinr/dzinr_motion_soundtrack.wav',
  'public/projects/dzinr/slice_kick1.wav',
  'public/projects/dzinr/slice_snare1.wav',
  'public/projects/dzinr/slice_hat1.wav',
  'public/projects/dzinr/slice_impact.wav',
  'public/projects/dzinr/slice_drop.wav',
];

for (const f of files) {
  try {
    inspectWav(f);
  } catch (e: any) {
    console.log(`  ERROR: ${e.message}`);
  }
}
