import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GradientBackground, GlowBadge, Headline, Noise } from '@/shared';

export const Scene01: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080c14',
      }}
    >
      {/* Dynamic token-driven background */}
      <GradientBackground
        type="mesh"
        stops={['#6366f1', '#ec4899', '#06b6d4']}
        speed={0.6}
      />

      {/* Tactile noise texture */}
      <Noise opacity={0.04} />

      {/* Foreground kinetic content */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
        }}
      >
        <GlowBadge label="NEXT-GEN MOTION HARNESS" delay={8} glowColor="#6366f1" />

        <Headline
          text="REMOTION ORCHESTRATION"
          delay={18}
          animation="slideUp"
          fontSize="5.2rem"
          gradient="linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)"
        />
      </div>
    </AbsoluteFill>
  );
};
