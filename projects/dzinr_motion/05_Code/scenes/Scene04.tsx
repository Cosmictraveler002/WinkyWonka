import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const antonFamily = "'Anton', 'Impact', 'Archivo Black', sans-serif";
const spaceMonoFamily = "'Space Mono', 'Courier New', monospace";

export const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 220, mass: 0.8 },
  });

  // Dynamic stepped rotation with kick at frame 21
  const stepSpring = frame >= 21 ? spring({
    frame: frame - 21,
    fps,
    config: { damping: 13, stiffness: 320, mass: 0.5 },
  }) : 0;

  const rotation = interpolate(frame, [0, 42], [-20, 20]) + interpolate(stepSpring, [0, 1], [0, 45]);
  const panX = interpolate(frame, [0, 42], [-30, 30]);

  // 3D perspective tilt
  const tiltX = Math.sin((frame / 30) * Math.PI) * 6;
  const tiltY = Math.cos((frame / 30) * Math.PI) * 8;

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
      {/* Precision framing grid */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g stroke="#EAEAEA" strokeWidth="1">
          <line x1="120" y1="0" x2="120" y2="1080" />
          <line x1="1800" y1="0" x2="1800" y2="1080" />
        </g>
      </svg>

      {/* Dynamic Stepped Rotating Rhombus Wireframe Cluster */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${panX}px, 0px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '560px',
            height: '560px',
            border: '8px solid #0A0A0A',
            transform: `rotate(${rotation + 45}deg) scale(${entrance})`,
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
            transition: 'border-color 0.2s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '480px',
            height: '480px',
            border: '4px solid #FF3B1D',
            transform: `rotate(${rotation + 45}deg) scale(${entrance * 0.94})`,
          }}
        />
      </div>

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
        [ kalaकृति // SPATIAL WEB ]
      </div>

      {/* Kinetic 3D Foreground Card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: entrance,
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${-panX * 0.4}px)`,
          zIndex: 10,
          backgroundColor: '#FFFFFF',
          padding: '32px 56px',
          borderRadius: '8px',
          border: '2px solid #0A0A0A',
          boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
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
              letterSpacing: '0.04em',
              color: '#0A0A0A',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            3D WEBSITES
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
          }}
        >
          WEBSITE DEVELOPMENT • LIVE INTERACTIVE
        </span>
      </div>
    </AbsoluteFill>
  );
};
