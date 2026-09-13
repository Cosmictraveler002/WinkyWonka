import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const antonFamily = "'Anton', 'Impact', 'Archivo Black', sans-serif";
const spaceMonoFamily = "'Space Mono', 'Courier New', monospace";

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===========================================================================
  // CONTINUOUS KINETIC FLOW & RHYTHMIC PROGRESSION (51 frames total @ 30fps)
  // Beat 1 (f0–16):  "DESIGN" flows in from left -> glides -> flows up-left
  // Beat 2 (f14–31): "CODE" catches momentum from right -> vermilion pulse -> flows up
  // Beat 3 (f29–42): "ITERATE" rises from bottom -> mathematical flow -> condenses
  // Beat 4 (f41–50): UNIFIED STREAM: "DESIGN • CODE • ITERATE" + accelerating push
  // ===========================================================================

  // Global continuous streaming datum line animation
  const streamOffset = (frame * 18) % 400;

  // ---------------------------------------------------------------------------
  // 1. DESIGN FLOW (Active f0 to f16)
  // ---------------------------------------------------------------------------
  const designEntrySpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 280, mass: 0.6 },
  });
  // Sweeps in from left, drifts through center
  const designInX = interpolate(designEntrySpring, [0, 1], [-180, 0]);
  // Handoff exit: as frame passes 13, sweeps up-left with velocity
  const designOutX = interpolate(frame, [12, 16], [0, -220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const designOutY = interpolate(frame, [12, 16], [0, -60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const designOpacity = interpolate(frame, [0, 3, 13, 16], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const designScale = interpolate(frame, [0, 12, 16], [1.12, 1.0, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------------------------------------------------------------------
  // 2. CODE FLOW (Active f14 to f31)
  // ---------------------------------------------------------------------------
  const codeEntrySpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 13, stiffness: 300, mass: 0.5 },
  });
  // Catches momentum from right
  const codeInX = interpolate(codeEntrySpring, [0, 1], [220, 0]);
  // Drifts slightly left
  const codeDriftX = interpolate(frame - 14, [0, 14], [0, -30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Handoff exit: sweeps upward
  const codeOutY = interpolate(frame, [27, 31], [0, -90], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const codeOpacity = interpolate(frame, [14, 16, 27, 31], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const codeScale = interpolate(frame, [14, 20, 27, 31], [1.18, 1.0, 1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------------------------------------------------------------------
  // 3. ITERATE FLOW (Active f29 to f42)
  // ---------------------------------------------------------------------------
  const iterateEntrySpring = spring({
    frame: frame - 29,
    fps,
    config: { damping: 14, stiffness: 320, mass: 0.5 },
  });
  // Rises up from below
  const iterateInY = interpolate(iterateEntrySpring, [0, 1], [120, 0]);
  // Condenses inward before grand lockup
  const iterateTracking = interpolate(frame, [29, 38, 42], [0.08, 0.04, 0.01], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const iterateOpacity = interpolate(frame, [29, 31, 39, 42], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const iterateScale = interpolate(frame, [29, 35, 39, 42], [1.15, 1.0, 1.0, 0.94], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------------------------------------------------------------------
  // 4. GRAND UNIFIED LOCKUP STREAM (Active f41 to f50)
  // ---------------------------------------------------------------------------
  const lockupEntrySpring = spring({
    frame: frame - 41,
    fps,
    config: { damping: 12, stiffness: 360, mass: 0.45 },
  });
  const lockupSnapScale = interpolate(lockupEntrySpring, [0, 1], [1.32, 1.0]);
  // Accelerating push-in as music risers build toward Scene 06 drop
  const lockupRiserScale = interpolate(frame, [45, 50], [1.0, 1.14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lockupOpacity = interpolate(frame, [41, 43], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic Background Pulse on beats
  const isKickFrame = (frame >= 0 && frame <= 2) || (frame >= 14 && frame <= 16) || (frame >= 29 && frame <= 31) || frame >= 41;
  const bgPulseAlpha = isKickFrame ? 0.28 : 0.08;

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
      {/* Dynamic Background Ember Pulse */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at center, rgba(255, 59, 29, ${bgPulseAlpha}) 0%, rgba(10, 10, 10, 0) 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Kinetic Fluid Streamline Ribbon */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <g stroke="#1F1F24" strokeWidth="1">
          <line x1="120" y1="0" x2="120" y2="1080" />
          <line x1="1800" y1="0" x2="1800" y2="1080" />
          <line x1="0" y1="120" x2="1920" y2="120" />
          <line x1="0" y1="960" x2="1920" y2="960" />
        </g>

        {/* Dynamic Continuous Horizontal Flow Datum */}
        <line
          x1="0"
          y1="540"
          x2="1920"
          y2="540"
          stroke="#27272A"
          strokeWidth="2"
          strokeDasharray="16 12"
          strokeDashoffset={-streamOffset}
        />
        <line
          x1="120"
          y1="540"
          x2="1800"
          y2="540"
          stroke="#FF3B1D"
          strokeWidth="2"
          strokeDasharray="8 64"
          strokeDashoffset={-streamOffset * 1.8}
        />

        {/* Corner registration reticles */}
        <g stroke="#FF3B1D" strokeWidth="2">
          <path d="M 110 120 H 130 M 120 110 V 130" />
          <path d="M 1790 120 H 1810 M 1800 110 V 130" />
          <path d="M 110 960 H 130 M 120 950 V 970" />
          <path d="M 1790 960 H 1810 M 1800 950 V 970" />
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
        [ kalaकृति // WORKFLOW STREAM ]
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          right: '120px',
          fontFamily: spaceMonoFamily,
          fontSize: '13px',
          letterSpacing: '0.28em',
          color: '#71717A',
          textTransform: 'uppercase',
        }}
      >
        FLOW VELOCITY: 69 BPM // SYNC 4/4
      </div>

      {/* ===================================================================== */}
      {/* 1. DESIGN FLOW (f0 to f16)                                            */}
      {/* ===================================================================== */}
      {frame <= 16 && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translate(${designInX + designOutX}px, ${designOutY}px) scale(${designScale})`,
            opacity: designOpacity,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '160px',
                color: '#FF3B1D',
                lineHeight: 1,
              }}
            >
              (
            </span>
            <span
              style={{
                fontFamily: antonFamily,
                fontSize: '240px',
                letterSpacing: '0.04em',
                color: '#FAF8F5',
                textTransform: 'uppercase',
                lineHeight: 0.9,
                fontWeight: 900,
              }}
            >
              DESIGN
            </span>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '160px',
                color: '#FF3B1D',
                lineHeight: 1,
              }}
            >
              )
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '28px',
            }}
          >
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '17px',
                letterSpacing: '0.36em',
                color: '#A1A1AA',
                textTransform: 'uppercase',
              }}
            >
              01 • ARCHITECTURE • PRECISION FORM
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CODE FLOW (f14 to f31)                                             */}
      {/* ===================================================================== */}
      {frame >= 14 && frame <= 31 && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translate(${codeInX + codeDriftX}px, ${codeOutY}px) scale(${codeScale})`,
            opacity: codeOpacity,
            zIndex: 11,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '160px',
                color: '#FF3B1D',
                lineHeight: 1,
              }}
            >
              (
            </span>
            <span
              style={{
                fontFamily: antonFamily,
                fontSize: '260px',
                letterSpacing: '0.04em',
                color: '#FF3B1D',
                textTransform: 'uppercase',
                lineHeight: 0.9,
                fontWeight: 900,
              }}
            >
              CODE
            </span>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '160px',
                color: '#FF3B1D',
                lineHeight: 1,
              }}
            >
              )
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '28px',
            }}
          >
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '17px',
                letterSpacing: '0.36em',
                color: '#FAF8F5',
                textTransform: 'uppercase',
              }}
            >
              02 • EXECUTION • 3D SHADERS • LOGIC
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. ITERATE FLOW (f29 to f42)                                          */}
      {/* ===================================================================== */}
      {frame >= 29 && frame <= 42 && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateY(${iterateInY}px) scale(${iterateScale})`,
            opacity: iterateOpacity,
            zIndex: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '160px',
                color: '#FF3B1D',
                lineHeight: 1,
              }}
            >
              (
            </span>
            <span
              style={{
                fontFamily: antonFamily,
                fontSize: '230px',
                letterSpacing: `${iterateTracking}em`,
                color: '#FAF8F5',
                textTransform: 'uppercase',
                lineHeight: 0.9,
                fontWeight: 900,
              }}
            >
              ITERATE
            </span>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '160px',
                color: '#FF3B1D',
                lineHeight: 1,
              }}
            >
              )
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '28px',
            }}
          >
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '17px',
                letterSpacing: '0.36em',
                color: '#A1A1AA',
                textTransform: 'uppercase',
              }}
            >
              03 • REFINEMENT • MATHEMATICAL ACCURACY
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. GRAND UNIFIED LOCKUP STREAM (f41 to f50)                           */}
      {/* ===================================================================== */}
      {frame >= 41 && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${lockupSnapScale * lockupRiserScale})`,
            opacity: lockupOpacity,
            zIndex: 15,
          }}
        >
          <span
            style={{
              fontFamily: antonFamily,
              fontSize: '116px',
              letterSpacing: '0.05em',
              color: '#FAF8F5',
              textTransform: 'uppercase',
              lineHeight: 1,
              textAlign: 'center',
              fontWeight: 900,
            }}
          >
            DESIGN <span style={{ color: '#FF3B1D' }}>•</span> CODE <span style={{ color: '#FF3B1D' }}>•</span> ITERATE
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '24px' }}>
            <span style={{ fontFamily: spaceMonoFamily, fontWeight: 700, fontSize: '26px', color: '#FF3B1D' }}>
              (
            </span>
            <span
              style={{
                fontFamily: spaceMonoFamily,
                fontWeight: 700,
                fontSize: '22px',
                letterSpacing: '0.3em',
                color: '#FAF8F5',
                textTransform: 'uppercase',
              }}
            >
              CREATIVE ENGINEERING
            </span>
            <span style={{ fontFamily: spaceMonoFamily, fontWeight: 700, fontSize: '26px', color: '#FF3B1D' }}>
              )
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
