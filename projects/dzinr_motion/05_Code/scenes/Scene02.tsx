import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const antonFamily = "'Anton', 'Impact', 'Archivo Black', sans-serif";
const spaceMonoFamily = "'Space Mono', 'Courier New', monospace";

export const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy elastic entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 260, mass: 0.7 },
  });

  // Dynamic diagonal chevron velocity
  const chevronSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 220, mass: 0.8 },
  });
  const chevronOffset = interpolate(chevronSpring, [0, 1], [300, 0]) + frame * -1.5;

  // Mid-scene kick impact at frame 22 (transient kick @ 2.52s)
  const beatHit = frame >= 22 ? spring({
    frame: frame - 22,
    fps,
    config: { damping: 12, stiffness: 360, mass: 0.4 },
  }) : 0;
  const beatPunch = interpolate(beatHit, [0, 1], [1.08, 1.0]);

  const textSlide = interpolate(entrance, [0, 1], [100, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transform: `scale(${beatPunch})`,
      }}
    >
      {/* Precision framing grid */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g stroke="#EAEAEA" strokeWidth="1">
          <line x1="120" y1="0" x2="120" y2="1080" />
          <line x1="1800" y1="0" x2="1800" y2="1080" />
        </g>
      </svg>

      {/* Diagonal Chevron Split Background */}
      <svg
        style={{
          position: 'absolute',
          width: '2600px',
          height: '1400px',
          transform: `translate(${chevronOffset}px, ${chevronOffset * 0.4}px) rotate(-25deg)`,
          pointerEvents: 'none',
        }}
        viewBox="0 0 2600 1400"
      >
        <rect x="0" y="0" width="2600" height="1400" fill="#FFFFFF" />
        <polygon points="600,0 1200,0 1800,1400 1200,1400" fill="#0A0A0A" />
        <polygon points="1250,0 1360,0 1960,1400 1850,1400" fill="#FF3B1D" />
      </svg>

      {/* Counter-directional Marquee Background Text */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '36px',
          opacity: 0.14,
          pointerEvents: 'none',
        }}
      >
        {[-1, 0, 1].map((row) => {
          const dir = row % 2 === 0 ? 1 : -1;
          const driftX = frame * 4 * dir;
          return (
            <span
              key={row}
              style={{
                fontFamily: antonFamily,
                fontSize: '110px',
                letterSpacing: '0.04em',
                color: 'transparent',
                WebkitTextStroke: '2px #0A0A0A',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                transform: `translateX(${driftX}px)`,
              }}
            >
              PRODUCT DESIGN • CUSTOM SOFTWARE • DIGITAL FLUIDITY •
            </span>
          );
        })}
      </div>

      {/* Main Foreground Typography */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${textSlide}px)`,
          opacity: entrance,
          zIndex: 10,
        }}
      >
        {/* Bracketed Headline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span
            style={{
              fontFamily: spaceMonoFamily,
              fontWeight: 700,
              fontSize: '84px',
              color: '#FF3B1D',
            }}
          >
            (
          </span>
          <span
            style={{
              fontFamily: antonFamily,
              fontSize: '96px',
              letterSpacing: '0.06em',
              color: '#FAF8F5',
              backgroundColor: '#0A0A0A',
              padding: '14px 42px',
              borderRadius: '8px',
              textTransform: 'uppercase',
              boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
            }}
          >
            PRODUCT DESIGN
          </span>
          <span
            style={{
              fontFamily: spaceMonoFamily,
              fontWeight: 700,
              fontSize: '84px',
              color: '#FF3B1D',
            }}
          >
            )
          </span>
        </div>

        {/* Technical Subtext */}
        <span
          style={{
            fontFamily: spaceMonoFamily,
            fontWeight: 700,
            fontSize: '20px',
            letterSpacing: '0.26em',
            color: '#71717A',
            textTransform: 'uppercase',
            marginTop: '22px',
            backgroundColor: '#FFFFFF',
            padding: '8px 22px',
            border: '2px solid #0A0A0A',
            boxShadow: '4px 4px 0px #FF3B1D',
          }}
        >
          CUSTOM SOFTWARE • DIGITAL FLUIDITY
        </span>
      </div>
    </AbsoluteFill>
  );
};
