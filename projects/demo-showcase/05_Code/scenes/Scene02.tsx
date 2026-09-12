import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ParticleField, GlassCard, WordReveal, Caption, Zoom } from '@/shared';

export const Scene02: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070a12',
      }}
    >
      <Zoom fromScale={1.0} toScale={1.08} durationInFrames={90}>
        <ParticleField count={180} color="#a5b4fc" />

        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GlassCard delay={8} width={780} padding="3rem 3.5rem">
            <WordReveal
              text="PRECISION MOTION GRAPHICS"
              delay={14}
              stagger={4}
              animation="rise"
              fontSize="3.2rem"
              gradient="linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)"
            />

            <Caption
              text="Declarative React components evaluated at 60fps with spring physics and zero hardcoded widgets."
              delay={28}
              fontSize="1.35rem"
              color="#94a3b8"
              style={{ marginTop: '1.5rem' }}
            />
          </GlassCard>
        </AbsoluteFill>
      </Zoom>
    </AbsoluteFill>
  );
};
