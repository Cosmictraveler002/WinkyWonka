import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { SpringPresets } from '../motion/springs';

export const Transitions = {
  // Smooth directional slide
  slideLeft: (durationInFrames = 20) => ({
    presentation: slide({ direction: 'from-right' }),
    timing: springTiming({ config: SpringPresets.snappy, durationInFrames }),
  }),

  slideRight: (durationInFrames = 20) => ({
    presentation: slide({ direction: 'from-left' }),
    timing: springTiming({ config: SpringPresets.snappy, durationInFrames }),
  }),

  slideUp: (durationInFrames = 20) => ({
    presentation: slide({ direction: 'from-bottom' }),
    timing: springTiming({ config: SpringPresets.snappy, durationInFrames }),
  }),

  // Elegant cross-fade
  crossFade: (durationInFrames = 15) => ({
    presentation: fade(),
    timing: linearTiming({ durationInFrames }),
  }),

  // Geometric wipes
  wipeLeft: (durationInFrames = 18) => ({
    presentation: wipe({ direction: 'from-left' }),
    timing: springTiming({ config: SpringPresets.gentle, durationInFrames }),
  }),

  wipeCircular: (durationInFrames = 22) => ({
    presentation: wipe({ direction: 'from-top' }),
    timing: springTiming({ config: SpringPresets.cinematic, durationInFrames }),
  }),

  // 3D Flip
  flipHorizontal: (durationInFrames = 25) => ({
    presentation: flip({ direction: 'from-left' }),
    timing: springTiming({ config: SpringPresets.snappy, durationInFrames }),
  }),
};

export { TransitionSeries };
