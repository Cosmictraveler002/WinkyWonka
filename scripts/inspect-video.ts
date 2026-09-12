import { execSync } from 'child_process';

const ffprobe = 'C:\\Users\\PC\\myapps\\Remotion\\node_modules\\@remotion\\compositor-win32-x64-msvc\\ffprobe.exe';
const out = execSync(`"${ffprobe}" -v error -select_streams v:0 -show_entries stream=r_frame_rate,nb_frames,duration -of json "public/projects/dzinr/dzinr-Old.mp4"`, { encoding: 'utf-8' });
console.log('Stream info:', out);

const scenesCmd = `"${ffprobe}" -show_frames -select_streams v:0 -show_entries frame=pkt_pts_time,pict_type -of csv "public/projects/dzinr/dzinr-Old.mp4"`;
