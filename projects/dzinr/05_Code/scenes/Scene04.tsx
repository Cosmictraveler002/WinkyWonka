import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const antonFamily = "'Anton', 'Impact', 'Arial Black', sans-serif";
const spaceMonoFamily = "'Space Mono', 'Consolas', 'Courier New', monospace";

export const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy spring entrance - locks firmly onto the musical beat
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 260, mass: 0.55 },
  });

  // Clamp animation: brackets clamp in smoothly from the sides and lock
  const bracketSpread = interpolate(entrance, [0, 1], [36, 0]);
  const textScale = interpolate(entrance, [0, 1], [0.94, 1.0]);

  // Subtle continuous camera drift across the 36 frames
  const cameraScale = interpolate(frame, [0, 36], [0.99, 1.015]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: spaceMonoFamily,
      }}
    >
      {/* Static Precision Grid Lines */}
      {/* Vertical center grid line */}
      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: '100%',
          left: '50%',
          top: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          pointerEvents: 'none',
        }}
      />
      {/* Horizontal center grid line */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '1px',
          top: '50%',
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* Typography Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          transform: `scale(${cameraScale})`,
          willChange: 'transform',
        }}
      >
        {/* Native Flexbox ensures brackets never collapse */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2vw',
            fontFamily: antonFamily,
            fontSize: '6.5vw',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: '#111111',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            transform: `scale(${textScale})`,
            willChange: 'transform',
            userSelect: 'none',
          }}
        >
          {/* Left Bracket */}
          <span
            style={{
              color: '#FF4500',
              display: 'inline-block',
              transform: `translateX(${-bracketSpread}px)`,
              willChange: 'transform',
            }}
          >
            (
          </span>

          {/* Word */}
          <span className="word">
            CREATIVE ENGINEERING
          </span>

          {/* Right Bracket */}
          <span
            style={{
              color: '#FF4500',
              display: 'inline-block',
              transform: `translateX(${bracketSpread}px)`,
              willChange: 'transform',
            }}
          >
            )
          </span>
        </div>

        {/* Subtext: DESIGN • CODE • ITERATE */}
        <div
          style={{
            marginTop: '1.5rem',
            fontFamily: spaceMonoFamily,
            fontSize: '0.85rem',
            color: '#666666',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: interpolate(entrance, [0.3, 1], [0, 1]),
            userSelect: 'none',
          }}
        >
          DESIGN • CODE • ITERATE
        </div>
      </div>
    </AbsoluteFill>
  );
};
