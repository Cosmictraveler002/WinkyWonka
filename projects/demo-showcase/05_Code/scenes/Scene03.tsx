import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GradientBackground, FilmGrain, CTA } from '@/shared';

export const Scene03: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080c14',
      }}
    >
      <GradientBackground
        type="mesh"
        stops={['#06b6d4', '#6366f1', '#3b82f6']}
        speed={0.7}
      />

      <FilmGrain intensity={0.06} />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <CTA
          title="READY FOR PRODUCTION"
          subtitle="From video reference deconstruction to frame-accurate Remotion compositions in minutes."
          buttonText="Start Your Next Cut"
          delay={8}
          glowColor="#06b6d4"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
