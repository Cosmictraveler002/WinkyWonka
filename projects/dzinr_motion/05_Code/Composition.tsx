import React from 'react';
import { TransitionSeries } from '@remotion/transitions';
import { Audio, staticFile } from 'remotion';
import { Scene01 } from './scenes/Scene01';
import { Scene02 } from './scenes/Scene02';
import { Scene03 } from './scenes/Scene03';
import { Scene04 } from './scenes/Scene04';
import { Scene05 } from './scenes/Scene05';
import { Scene06 } from './scenes/Scene06';

export interface DzinrMotionProps {
  disableAudio?: boolean;
}

export const DzinrMotionComposition: React.FC<DzinrMotionProps> = ({ disableAudio = false }) => {
  return (
    <>
      {/* Foundational Mastered Audio Track */}
      {!disableAudio && <Audio src={staticFile('projects/dzinr_motion/soundtrack.wav')} />}

      <TransitionSeries>
        {/* Scene 01: Kinetic Geometric Hook (54 frames | 1.80s) */}
        <TransitionSeries.Sequence durationInFrames={54}>
          <Scene01 />
        </TransitionSeries.Sequence>

        {/* Scene 02: Logo Design Service (42 frames | 1.40s) */}
        <TransitionSeries.Sequence durationInFrames={42}>
          <Scene02 />
        </TransitionSeries.Sequence>

        {/* Scene 03: Brand Systems Escalation (36 frames | 1.20s) */}
        <TransitionSeries.Sequence durationInFrames={36}>
          <Scene03 />
        </TransitionSeries.Sequence>

        {/* Scene 04: Digital & Web Experiences (42 frames | 1.40s) */}
        <TransitionSeries.Sequence durationInFrames={42}>
          <Scene04 />
        </TransitionSeries.Sequence>

        {/* Scene 05: Human Connection & Tonal Inversion (51 frames | 1.70s) */}
        <TransitionSeries.Sequence durationInFrames={51}>
          <Scene05 />
        </TransitionSeries.Sequence>

        {/* Scene 06: Decisive Brand Payoff (106 frames | 3.53s) */}
        <TransitionSeries.Sequence durationInFrames={106}>
          <Scene06 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
