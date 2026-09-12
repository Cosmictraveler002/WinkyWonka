import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy punch-in entrance spring locking onto the musical beat at 2.0s
  const punchProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 260, mass: 0.55 },
  });

  const scale = interpolate(punchProgress, [0, 1], [0.93, 1.0]);

  // Parallax Marquee Velocities:
  // Foreground moves left (faster velocity, seamless infinite coverage across entire frame)
  const fgX = interpolate(frame, [0, 30], [-300, -780]);

  // Background moves right (slower velocity to simulate parallax depth)
  const bgX = interpolate(frame, [0, 30], [-720, -320]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f4f4f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Anton', 'Impact', sans-serif",
      }}
    >
      {/* Import Anton font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>

      {/* Scaled Scene Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          overflow: 'hidden',
        }}
      >
        {/* Top structural label from reference HTML */}
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.9rem',
            color: '#333333',
            letterSpacing: '2px',
            zIndex: 10,
          }}
        >
          [ 03 // DIGITAL CRAFT ]
        </div>

        {/* ========================================================= */}
        {/* 1. BACKGROUND MARQUEE (Outline, Slower, Moving Right)    */}
        {/* ========================================================= */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100%',
            display: 'flex',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <div
            style={{
              transform: `translateX(${bgX}px)`,
              fontSize: '12vw',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: 'transparent',
              WebkitTextStroke: '2.5px #cfcfcf',
              letterSpacing: '0.01em',
              userSelect: 'none',
            }}
          >
            KALAKRITI ✦ STUDIO ✦ KALAKRITI ✦ STUDIO ✦ KALAKRITI ✦ STUDIO ✦ KALAKRITI ✦ STUDIO ✦ KALAKRITI ✦ STUDIO ✦ KALAKRITI ✦ STUDIO ✦
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FOREGROUND MARQUEE (Solid Vermilion, Faster, Moving Left) */}
        {/* ========================================================= */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100%',
            display: 'flex',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          <div
            style={{
              transform: `translateX(${fgX}px)`,
              fontSize: '8vw',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: '#FF4500',
              textShadow: '0 6px 20px rgba(255, 69, 0, 0.22)',
              letterSpacing: '0.01em',
              userSelect: 'none',
            }}
          >
            ● 3D WEBSITES ● BRAND IDENTITIES ● LOGO DESIGN ● 3D WEBSITES ● BRAND IDENTITIES ● LOGO DESIGN ● 3D WEBSITES ● BRAND IDENTITIES ● LOGO DESIGN ● 3D WEBSITES ●
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
