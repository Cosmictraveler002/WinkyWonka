import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
const antonFamily = "'Anton', 'Impact', 'Archivo Black', sans-serif";
const spaceMonoFamily = "'Space Mono', 'Courier New', monospace";

export const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy explosive spring entrance
  const burstSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 240, mass: 0.8 },
  });

  // Zoom punch towards end of scene (frame 42 to 54)
  const zoomPunch = interpolate(frame, [42, 54], [1.0, 1.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle organic breathing
  const breathe = 1 + Math.sin((frame / 30) * Math.PI * 2) * 0.03;
  const elementRot = (frame / 30) * 45;

  // Geometric particle cluster
  const particles = useMemo(() => [
    { angle: 30, dist: 340, scale: 1.1, rot: 45, type: 'cube' },
    { angle: 75, dist: 420, scale: 0.9, rot: -25, type: 'cross' },
    { angle: 125, dist: 310, scale: 1.2, rot: 15, type: 'triangle' },
    { angle: 165, dist: 450, scale: 0.8, rot: 80, type: 'arc' },
    { angle: 215, dist: 380, scale: 1.15, rot: -40, type: 'cube' },
    { angle: 255, dist: 320, scale: 0.95, rot: 60, type: 'cross' },
    { angle: 300, dist: 430, scale: 1.0, rot: -10, type: 'triangle' },
    { angle: 345, dist: 360, scale: 0.9, rot: 35, type: 'arc' },
  ], []);

  const headlineSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 220 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transform: `scale(${zoomPunch})`,
      }}
    >
      {/* Precision architectural registration frame */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g stroke="#E5E5E5" strokeWidth="1">
          <line x1="120" y1="0" x2="120" y2="1080" />
          <line x1="1800" y1="0" x2="1800" y2="1080" />
          <line x1="0" y1="120" x2="1920" y2="120" />
          <line x1="0" y1="960" x2="1920" y2="960" />
        </g>
        <g stroke="#FF3B1D" strokeWidth="2">
          <path d="M 110 120 H 130 M 120 110 V 130" />
          <path d="M 1790 120 H 1810 M 1800 110 V 130" />
        </g>
      </svg>

      {/* Subtle Background Terminal Watermark (User requested very low opacity) */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '120px',
          fontFamily: spaceMonoFamily,
          fontSize: '15px',
          letterSpacing: '0.2em',
          color: '#0A0A0A',
          opacity: 0.14,
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        [ SYS_INIT // 01 ] • 28°38'N 77°13'E • KALA_ENGINE
      </div>

      {/* Central Geometric & Particle Burst */}
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
        {/* Radiating Particles */}
        {particles.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const currentDist = p.dist * burstSpring;
          const x = Math.cos(rad) * currentDist;
          const y = Math.sin(rad) * currentDist;
          const currentRot = p.rot + (frame / 30) * 30;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${y}px) rotate(${currentRot}deg) scale(${burstSpring * p.scale})`,
                opacity: burstSpring,
              }}
            >
              {p.type === 'cube' && (
                <div style={{ width: 24, height: 24, backgroundColor: '#0A0A0A', border: '3px solid #FF3B1D' }} />
              )}
              {p.type === 'cross' && (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 4v16m-8-8h16" stroke="#FF3B1D" strokeWidth="4" strokeLinecap="square" />
                </svg>
              )}
              {p.type === 'triangle' && (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <polygon points="12,2 22,22 2,22" fill="#0A0A0A" />
                </svg>
              )}
              {p.type === 'arc' && (
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <path d="M6 30 A18 18 0 0 1 30 6" fill="none" stroke="#0A0A0A" strokeWidth="5" strokeLinecap="round" />
                </svg>
              )}
            </div>
          );
        })}

        {/* Center Minimalist Isometric Frame */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '200px',
            backgroundColor: '#0A0A0A',
            borderRadius: '16px',
            border: '4px solid #FF3B1D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${elementRot * 0.25}deg) scale(${burstSpring * breathe})`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <span
            style={{
              fontFamily: antonFamily,
              fontSize: '84px',
              color: '#FAF8F5',
              letterSpacing: '0.04em',
            }}
          >
            01
          </span>
        </div>
      </div>

      {/* Kinetic Primary Headline with Orange Brackets Motif */}
      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: headlineSpring,
          transform: `translateY(${(1 - headlineSpring) * 30}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontFamily: spaceMonoFamily,
              fontWeight: 700,
              fontSize: '52px',
              color: '#FF3B1D',
            }}
          >
            (
          </span>
          <span
            style={{
              fontFamily: antonFamily,
              fontSize: '58px',
              letterSpacing: '0.08em',
              color: '#0A0A0A',
              textTransform: 'uppercase',
            }}
          >
            CREATIVE ENGINEERING
          </span>
          <span
            style={{
              fontFamily: spaceMonoFamily,
              fontWeight: 700,
              fontSize: '52px',
              color: '#FF3B1D',
            }}
          >
            )
          </span>
        </div>

        {/* Process Subtext with Dot Separators */}
        <span
          style={{
            fontFamily: spaceMonoFamily,
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#737373',
            textTransform: 'uppercase',
            marginTop: '12px',
          }}
        >
          DESIGN • CODE • ITERATE
        </span>
      </div>
    </AbsoluteFill>
  );
};
