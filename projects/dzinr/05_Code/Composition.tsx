import React from 'react';
import { TransitionSeries } from '@remotion/transitions';
import { Audio, staticFile } from 'remotion';
import { Scene01 } from './scenes/Scene01';
import { Scene02 } from './scenes/Scene02';
import { Scene03 } from './scenes/Scene03';
import { Scene04 } from './scenes/Scene04';
import { Scene05 } from './scenes/Scene05';
import { Scene06 } from './scenes/Scene06';
import { Scene07 } from './scenes/Scene07';

export const DzinrComposition: React.FC = () => {
  return (
    <>
      {/* Mastered soundtrack with frame-accurate beats and bespoke SFX */}
      <Audio src={staticFile('projects/dzinr/soundtrack.wav')} />

      <TransitionSeries>
        {/* Scene 01: Abstract Geometric Cluster (1.0s / 30 frames) - Crystalline pop & groove */}
        <TransitionSeries.Sequence durationInFrames={30}>
          <Scene01 />
        </TransitionSeries.Sequence>

        {/* Scene 02: Minimalist Laptop Formation (1.0s / 30 frames) - Magnetic clamp & cursor tick */}
        <TransitionSeries.Sequence durationInFrames={30}>
          <Scene02 />
        </TransitionSeries.Sequence>

        {/* Scene 03: Kinetic Logo Designing Zoom (1.0s / 30 frames) - Stereo whip whoosh & bass punch */}
        <TransitionSeries.Sequence durationInFrames={30}>
          <Scene03 />
        </TransitionSeries.Sequence>

        {/* Scene 04: Variable Typographic Branding (1.2s / 36 frames | 3.0s-4.2s) */}
        <TransitionSeries.Sequence durationInFrames={36}>
          <Scene04 />
        </TransitionSeries.Sequence>

        {/* Scene 05: Website Design Inversion Slide (1.6s / 48 frames | 4.2s-5.8s) */}
        <TransitionSeries.Sequence durationInFrames={48}>
          <Scene05 />
        </TransitionSeries.Sequence>

        {/* Scene 06: Rotating Wireframe Crest (1.4s / 42 frames | 5.8s-7.2s) */}
        <TransitionSeries.Sequence durationInFrames={42}>
          <Scene06 />
        </TransitionSeries.Sequence>

        {/* Scene 07: Kalaकृति Brand Payoff & URL (3.87s / 116 frames | 7.2s-11.07s) */}
        <TransitionSeries.Sequence durationInFrames={116}>
          <Scene07 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
