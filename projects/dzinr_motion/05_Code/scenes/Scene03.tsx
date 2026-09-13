import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const antonFamily = "'Anton', 'Impact', 'Archivo Black', sans-serif";
const spaceMonoFamily = "'Space Mono', 'Courier New', monospace";

export const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy elastic entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 280, mass: 0.65 },
  });

  // Mid-scene kick pulse at frame 21 (transient kick @ 3.91s)
  const beatHit = frame >= 21 ? spring({
    frame: frame - 21,
    fps,
    config: { damping: 13, stiffness: 360, mass: 0.4 },
  }) : 0;
  const beatPunch = interpolate(beatHit, [0, 1], [1.07, 1.0]);

  // Dynamic continuous push-in
  const pushIn = interpolate(frame, [0, 36], [0.96, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const letterTracking = interpolate(entrance, [0, 1], [0.18, 0.06]) + (beatHit * 0.03);

  // Animated wireframe stroke dash
  const wireOffset = interpolate(frame, [0, 36], [120, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transform: `scale(${pushIn * beatPunch})`,
      }}
    >
      {/* Architectural Wireframe Geometry */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 1920 1080"
      >
        <g stroke="#E4E4E7" strokeWidth="2" fill="none">
          {/* Wireframe dynamic drafting lines */}
          <path
            d="M 280 180 L 720 180 L 420 820 L 820 820"
            strokeWidth="3"
            strokeDasharray="16 8"
            strokeDashoffset={wireOffset}
          />
          <path
            d="M 1080 860 L 1080 200 L 1520 860 L 1520 200"
            strokeWidth="3"
            strokeDasharray="16 8"
            strokeDashoffset={-wireOffset}
          />
          {/* Accent framing markers */}
          <path
            d="M 200 140 L 140 140 L 140 940 L 200 940"
            stroke="#FF3B1D"
            strokeWidth={beatHit > 0.1 ? 4 : 2}
          />
          <path
            d="M 1720 140 L 1780 140 L 1780 940 L 1720 940"
            stroke="#FF3B1D"
            strokeWidth={beatHit > 0.1 ? 4 : 2}
          />
        </g>
      </svg>

      {/* Persistent Technical Metatags */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '120px',
          fontFamily: spaceMonoFamily,
          fontSize: '13px',
          letterSpacing: '0.28em',
          color: '#71717A',
          textTransform: 'uppercase',
        }}
      >
        [ kalaकृति // IDENTITY MATRIX ]
      </div>

      {/* Foreground Kinetic Headline */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: entrance,
          transform: `scale(${entrance})`,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span
            style={{
              fontFamily: spaceMonoFamily,
              fontWeight: 700,
              fontSize: '76px',
              color: '#FF3B1D',
            }}
          >
            (
          </span>
          <span
            style={{
              fontFamily: antonFamily,
              fontSize: '96px',
              letterSpacing: `${letterTracking}em`,
              color: '#0A0A0A',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            LOGO DESIGN
          </span>
          <span
            style={{
              fontFamily: spaceMonoFamily,
              fontWeight: 700,
              fontSize: '76px',
              color: '#FF3B1D',
            }}
          >
            )
          </span>
        </div>

        {/* Supporting System Tag */}
        <span
          style={{
            fontFamily: spaceMonoFamily,
            fontWeight: 700,
            fontSize: '20px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            marginTop: '22px',
            backgroundColor: '#0A0A0A',
            color: '#FAF8F5',
            padding: '8px 24px',
            borderRadius: '4px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.14)',
          }}
        >
          BRAND IDENTITIES • MATHEMATICAL ACCURACY
        </span>
      </div>
    </AbsoluteFill>
  );
};
