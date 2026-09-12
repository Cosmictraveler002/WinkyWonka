import fs from 'node:fs';

function inspectHeader(name: string, path: string) {
  const buf = fs.readFileSync(path);
  console.log(`=== ${name} (${buf.byteLength} bytes) ===`);
  console.log('RIFF:', buf.toString('ascii', 0, 4));
  console.log('FileSize:', buf.readUInt32LE(4));
  console.log('WAVE:', buf.toString('ascii', 8, 12));
  console.log('fmt :', buf.toString('ascii', 12, 16));
  console.log('fmtSize:', buf.readUInt32LE(16));
  console.log('format:', buf.readUInt16LE(20));
  console.log('channels:', buf.readUInt16LE(22));
  console.log('sampleRate:', buf.readUInt32LE(24));
  console.log('byteRate:', buf.readUInt32LE(28));
  console.log('blockAlign:', buf.readUInt16LE(32));
  console.log('bitsPerSample:', buf.readUInt16LE(34));
  console.log('dataTag:', buf.toString('ascii', 36, 40));
  console.log('dataSize:', buf.readUInt32LE(40));
  console.log('total expected file size:', 44 + buf.readUInt32LE(40));
}

inspectHeader('ref_audio.wav', 'public/projects/dzinr/ref_audio.wav');
inspectHeader('dzinr_motion_soundtrack.wav', 'public/projects/dzinr/dzinr_motion_soundtrack.wav');
