import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Use ffmpeg to detect scene changes in dzinr-Old.mp4
const cmd = `& "C:\\Users\\PC\\myapps\\Remotion\\node_modules\\@remotion\\compositor-win32-x64-msvc\\ffmpeg.exe" -i "public/projects/dzinr/dzinr-Old.mp4" -filter:v "select='gt(scene,0.3)',metadata=print:file=-" -f null -`;

try {
  const out = execSync(`powershell -Command "${cmd}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('Scene detect output:');
  const lines = out.split('\n');
  for (const line of lines) {
    if (line.includes('pts_time') || line.includes('scene_score')) {
      console.log(line);
    }
  }
} catch (e: any) {
  console.log('Error / Stderr:', e.stderr || e.stdout);
}
