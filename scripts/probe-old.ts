import { spawnSync } from 'child_process';
import path from 'path';

const ffmpegDir = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc');
const ffmpeg = path.join(ffmpegDir, 'ffmpeg.exe');

const res = spawnSync(ffmpeg, ['-i', 'public/projects/dzinr/dzinr-Old.mp4'], {
  env: { ...process.env, PATH: `${ffmpegDir};${process.env.PATH}` },
  encoding: 'utf-8'
});

console.log('FFMPEG Output on dzinr-Old.mp4:\n', res.stderr);
