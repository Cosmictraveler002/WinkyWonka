import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy explosive spring entrance
  const burstProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 260, mass: 0.6 },
  });

  // Light, organic breathing scale (smooth harmonic breath cycle)
  const breathe = 1 + Math.sin((frame / 30) * Math.PI * 2) * 0.035;
  const innerBreathe = 1 + Math.sin((frame / 30) * Math.PI * 2 + 0.4) * 0.05;

  // Unified central element rotation: 45° smooth turn over the shot
  const elementRot = (frame / 30) * 45;

  // Procedural geometric debris particles with orbital drift and rotational spin
  const particles = useMemo(() => [
    { angle: 25, dist: 380, scale: 1.1, rot: 45, spin: 30, orbit: 12, type: 'cube', delay: 0 },
    { angle: 75, dist: 460, scale: 0.8, rot: -30, spin: -25, orbit: 10, type: 'cross', delay: 1 },
    { angle: 120, dist: 340, scale: 1.2, rot: 15, spin: 40, orbit: 14, type: 'triangle', delay: 0 },
    { angle: 165, dist: 490, scale: 0.9, rot: 90, spin: -30, orbit: 8, type: 'chevron', delay: 2 },
    { angle: 215, dist: 410, scale: 1.15, rot: -45, spin: 25, orbit: 11, type: 'cube', delay: 0 },
    { angle: 255, dist: 330, scale: 0.85, rot: 60, spin: -35, orbit: 15, type: 'arc', delay: 1 },
    { angle: 295, dist: 480, scale: 1.0, rot: -15, spin: 30, orbit: 9, type: 'cross', delay: 1 },
    { angle: 340, dist: 390, scale: 0.95, rot: 30, spin: -25, orbit: 12, type: 'triangle', delay: 2 },
    { angle: 45, dist: 220, scale: 0.6, rot: 10, spin: 20, orbit: 16, type: 'dot', delay: 2 },
    { angle: 190, dist: 240, scale: 0.7, rot: -20, spin: -15, orbit: 14, type: 'dot', delay: 1 },
  ], []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Precision architectural registration lines */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <g stroke="#E5E5E5" strokeWidth="1">
          <line x1="120" y1="0" x2="120" y2="1080" />
          <line x1="1800" y1="0" x2="1800" y2="1080" />
          <line x1="0" y1="120" x2="1920" y2="120" />
          <line x1="0" y1="960" x2="1920" y2="960" />
        </g>
        <g stroke="#737373" strokeWidth="2">
          <path d="M 110 120 H 130 M 120 110 V 130" />
          <path d="M 1790 120 H 1810 M 1800 110 V 130" />
          <path d="M 110 960 H 130 M 120 950 V 970" />
          <path d="M 1790 960 H 1810 M 1800 950 V 970" />
        </g>
      </svg>

      {/* Main kinetic cluster container */}
      <div
        style={{
          position: 'relative',
          width: '600px',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* The Central Geometric Element: rotating smoothly while breathing lightly */}
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${elementRot}deg) scale(${burstProgress * breathe})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Outer black diamond wireframe (base 45° within element) */}
          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              border: '4px solid #0A0A0A',
              transform: 'rotate(45deg)',
              opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' }),
              boxSizing: 'border-box',
            }}
          />

          {/* Inner electric vermilion diamond with harmonic aperture breathing */}
          <div
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              border: '3px solid #FF3B1D',
              transform: `rotate(45deg) scale(${innerBreathe})`,
              opacity: interpolate(frame, [1, 5], [0, 1], { extrapolateRight: 'clamp' }),
              boxSizing: 'border-box',
            }}
          />

          {/* Center solid black square block (upright 0° within 45° diamond) */}
          <div
            style={{
              position: 'absolute',
              width: '64px',
              height: '64px',
              backgroundColor: '#0A0A0A',
              transform: 'rotate(0deg)',
              boxShadow: '0 16px 36px rgba(0,0,0,0.12)',
            }}
          />
        </div>

        {/* Radial burst elements with dynamic spin, subtle orbit, and spring expansion */}
        {particles.map((p, idx) => {
          const itemSpring = spring({
            frame: frame - p.delay,
            fps,
            config: { damping: 15, stiffness: 240, mass: 0.5 },
          });

          // Distance expands with spring and breathes subtly with the scene
          const currentDist = p.dist * itemSpring * (1 + (breathe - 1) * 0.4);
          const currentAngle = p.angle + (frame / 30) * p.orbit;
          const rad = (currentAngle * Math.PI) / 180;
          const x = Math.cos(rad) * currentDist;
          const y = Math.sin(rad) * currentDist;
          
          // Local spin
          const rotation = p.rot + (frame / 30) * p.spin;
          const scale = p.scale * itemSpring;
          const opacity = interpolate(itemSpring, [0, 0.2], [0, 1], {
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg) scale(${scale})`,
                opacity,
              }}
            >
              {p.type === 'cube' && (
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <polygon points="30,5 55,19 30,33 5,19" fill="#FAF8F5" stroke="#0A0A0A" strokeWidth="2.5" />
                  <polygon points="5,19 30,33 30,58 5,44" fill="#0A0A0A" stroke="#0A0A0A" strokeWidth="2.5" />
                  <polygon points="30,33 55,19 55,44 30,58" fill="#FF3B1D" stroke="#0A0A0A" strokeWidth="2.5" />
                </svg>
              )}

              {p.type === 'chevron' && (
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <path d="M 10 10 L 25 20 L 10 30" fill="none" stroke="#FF3B1D" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
                  <path d="M 20 10 L 35 20 L 20 30" fill="none" stroke="#0A0A0A" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              )}

              {p.type === 'cross' && (
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <path d="M 16 4 V 28 M 4 16 H 28" stroke="#0A0A0A" strokeWidth="4.5" strokeLinecap="square" />
                </svg>
              )}

              {p.type === 'triangle' && (
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <polygon points="18,4 34,32 2,32" fill="#FF3B1D" />
                </svg>
              )}

              {p.type === 'arc' && (
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <path d="M 10 40 A 30 30 0 0 1 40 10" fill="none" stroke="#0A0A0A" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              )}

              {p.type === 'dot' && (
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: idx % 2 === 0 ? '#FF3B1D' : '#0A0A0A',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
