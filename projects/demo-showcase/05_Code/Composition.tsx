import React from 'react';
import { TransitionSeries, Transitions } from '@/shared/transitions';
import { Scene01 } from './scenes/Scene01';
import { Scene02 } from './scenes/Scene02';
import { Scene03 } from './scenes/Scene03';

export const DemoShowcaseComposition: React.FC = () => {
  return (
    <TransitionSeries>
      {/* Scene 01: Kinetic Intro Hook (2.5s) */}
      <TransitionSeries.Sequence durationInFrames={75}>
        <Scene01 />
      </TransitionSeries.Sequence>

      {/* Transition: Slide Left (15 frames) */}
      <TransitionSeries.Transition {...Transitions.slideLeft(15)} />

      {/* Scene 02: 3D Particle Acceleration (1.8s) */}
      <TransitionSeries.Sequence durationInFrames={55}>
        <Scene02 />
      </TransitionSeries.Sequence>

      {/* Transition: Cross Fade (15 frames) */}
      <TransitionSeries.Transition {...Transitions.crossFade(15)} />

      {/* Scene 03: Outro Hold & Payoff (3.0s) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene03 />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
