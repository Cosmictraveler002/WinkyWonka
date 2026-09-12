import { getAudioData } from '@remotion/media-utils';

async function main() {
  try {
    const audioData = await getAudioData('http://localhost:3000/projects/dzinr/dzinr-Old.mp4');
    console.log('Got audioData successfully!');
    console.log('Sample rate:', audioData.sampleRate);
    console.log('Channel count:', audioData.channelWaveforms.length);
    console.log('Channel 0 length:', audioData.channelWaveforms[0].length);
  } catch (err: any) {
    console.error('getAudioData error:', err.message);
  }
}

main();
