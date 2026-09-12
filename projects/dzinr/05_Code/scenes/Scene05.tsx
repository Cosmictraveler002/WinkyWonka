import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth cinematic ease-out curve (Apple standard cubic-bezier)
  // Eliminates sudden hard stops and jitter
  const smoothEase = Easing.bezier(0.16, 1, 0.3, 1);

  // Decisive, fluid diagonal slide-in over the first 24 frames
  const slideProgress = interpolate(frame, [0, 24], [1, 0], {
    extrapolateRight: 'clamp',
    easing: smoothEase,
  });

  const slideX = slideProgress * 180;
  const slideY = slideProgress * -100;

  // Continuous subtle cinematic drift across all 48 frames so the shot never abruptly freezes
  const driftX = interpolate(frame, [0, 48], [0, -20]);
  const driftY = interpolate(frame, [0, 48], [0, 11]);
  const cameraScale = interpolate(frame, [0, 48], [0.97, 1.025], {
    easing: Easing.out(Easing.quad),
  });

  // Total smooth position
  const totalX = slideX + driftX;
  const totalY = slideY + driftY;

  // Fluid entrance for 'design' with slight graceful stagger
  const designSlideProgress = interpolate(frame, [2, 26], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: smoothEase,
  });
  const designX = designSlideProgress * 60;
  const designOpacity = interpolate(frame, [2, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Continuous kinetic flow for the diagonal dashed grid line
  const dashOffset = frame * 3.5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Dark mode architectural vector grid */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <g stroke="#1C1C1C" strokeWidth="1">
          <line x1="0" y1="270" x2="1920" y2="270" />
          <line x1="0" y1="810" x2="1920" y2="810" />
          <line x1="480" y1="0" x2="480" y2="1080" />
          <line x1="1440" y1="0" x2="1440" y2="1080" />
        </g>

        {/* Streaming kinetic diagonal guideline */}
        <line
          x1="0"
          y1="1080"
          x2="1920"
          y2="0"
          stroke="#262626"
          strokeWidth="1.5"
          strokeDasharray="10 10"
          strokeDashoffset={dashOffset}
        />

        {/* Precision corner crosshairs */}
        <g stroke="#FF3B1D" strokeWidth="1.5">
          <path d="M 470 270 H 490 M 480 260 V 280" />
          <path d="M 1430 810 H 1450 M 1440 800 V 820" />
        </g>
      </svg>

      {/* Main typographic container with hardware acceleration */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '28px',
          transform: `translate3d(${totalX}px, ${totalY}px, 0) scale(${cameraScale})`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          zIndex: 10,
        }}
      >
        {/* 'WEBSITE' in crisp condensed white */}
        <div
          style={{
            fontFamily: 'Oswald, Archivo Black, Impact, sans-serif',
            fontSize: '9.2rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#FAF8F5',
            lineHeight: 1,
            display: 'flex',
            userSelect: 'none',
          }}
        >
          <span>WEBSIT</span>
          <span style={{ color: '#FF3B1D' }}>E</span>
        </div>

        {/* 'design' in electric vermilion italic with graceful slide and glow */}
        <div
          style={{
            fontFamily: 'Syne, Inter, sans-serif',
            fontSize: '7.8rem',
            fontStyle: 'italic',
            fontWeight: 700,
            color: '#FF3B1D',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            transform: `translate3d(${designX}px, 0, 0)`,
            opacity: designOpacity,
            willChange: 'transform, opacity',
            textShadow: '0 0 35px rgba(255, 59, 29, 0.42)',
            userSelect: 'none',
          }}
        >
          design
        </div>
      </div>

      {/* Floating technical label */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '480px',
          fontFamily: 'monospace',
          fontSize: '1rem',
          color: '#737373',
          letterSpacing: '0.2em',
          opacity: interpolate(frame, [4, 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        [ 05 // DIGITAL EXPERIENCES & WEB ENGINEERING ]
      </div>
    </AbsoluteFill>
  );
};
