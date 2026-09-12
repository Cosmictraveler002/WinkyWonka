import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy convergence spring with heavy damping - locks firmly at frame 10
  const laptopEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 260, mass: 0.7 },
  });

  // Digital cursor blink (discrete step, not floaty sine wave)
  const cursorVisible = Math.floor(frame / 6) % 2 === 0;

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
      {/* Precision technical grid */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <g stroke="#F0F0F0" strokeWidth="1">
          <line x1="960" y1="0" x2="960" y2="1080" />
          <line x1="0" y1="540" x2="1920" y2="540" />
        </g>
        <text x="140" y="160" fill="#737373" fontSize="14" fontFamily="monospace" letterSpacing="2">
          SYS.02 // DIGITAL CRAFT
        </text>
      </svg>

      {/* Laptop assembly container - solidly locked */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${laptopEntrance})`,
        }}
      >
        {/* Screen section */}
        <div
          style={{
            position: 'relative',
            width: '460px',
            height: '290px',
            backgroundColor: '#0A0A0A',
            borderRadius: '16px 16px 4px 4px',
            border: '3px solid #0A0A0A',
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: `translateY(${interpolate(laptopEntrance, [0, 1], [-50, 0])}px)`,
          }}
        >
          {/* Top camera dot */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#333333',
            }}
          />

          {/* Screen display active area */}
          <div
            style={{
              width: '420px',
              height: '240px',
              backgroundColor: '#141414',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '1px solid #262626',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '5.2rem',
                  fontWeight: 900,
                  color: '#FF3B1D',
                  fontFamily: 'Oswald, Impact, sans-serif',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                02
              </div>

              {/* Status indicator bar with digital blink */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#FF3B1D',
                    opacity: cursorVisible ? 1 : 0.2,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#FAF8F5',
                    letterSpacing: '0.15em',
                  }}
                >
                  SYSTEM.ACTIVE
                </span>
              </div>
            </div>

            {/* Corner wireframe brackets */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                width: '12px',
                height: '12px',
                borderTop: '2px solid #FF3B1D',
                borderLeft: '2px solid #FF3B1D',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '12px',
                height: '12px',
                borderBottom: '2px solid #FF3B1D',
                borderRight: '2px solid #FF3B1D',
              }}
            />
          </div>
        </div>

        {/* Laptop keyboard base */}
        <div
          style={{
            position: 'relative',
            width: '560px',
            height: '24px',
            backgroundColor: '#E5E5E5',
            borderRadius: '2px 2px 14px 14px',
            border: '2px solid #0A0A0A',
            borderTop: '4px solid #0A0A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            transform: `translateY(${interpolate(laptopEntrance, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#0A0A0A',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Flanking geometric accent brackets */}
        <div
          style={{
            position: 'absolute',
            left: '-140px',
            top: '45%',
            opacity: laptopEntrance,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path d="M 30 5 L 10 20 L 30 35" fill="none" stroke="#FF3B1D" strokeWidth="4" />
          </svg>
        </div>

        <div
          style={{
            position: 'absolute',
            right: '-140px',
            top: '45%',
            opacity: laptopEntrance,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path d="M 10 5 L 30 20 L 10 35" fill="none" stroke="#0A0A0A" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
