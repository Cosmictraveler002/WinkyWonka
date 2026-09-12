import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy entrance scaling - settles firmly by frame 12
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 240, mass: 0.7 },
  });

  // Pure constant angular velocity 3D rotation (mechanical gyroscope, no breathing)
  const rotY = (frame / fps) * Math.PI * 1.2;
  const rotX = 0.45;

  // Generate 3D wireframe sphere points & arcs
  const radius = 220;
  const latitudes = [-60, -30, 0, 30, 60];
  const longitudes = [0, 30, 60, 90, 120, 150];

  const projectPoint = (latDeg: number, lonDeg: number) => {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180 + rotY;

    let x = radius * Math.cos(lat) * Math.sin(lon);
    let y = radius * Math.sin(lat);
    let z = radius * Math.cos(lat) * Math.cos(lon);

    const y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
    const z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

    const fov = 600;
    const p = fov / (fov + z1);

    return { x: x * p, y: y1 * p, z: z1, p };
  };

  const latPaths = useMemo(() => {
    return latitudes.map((lat) => {
      const points: string[] = [];
      for (let lon = 0; lon <= 360; lon += 12) {
        const { x, y } = projectPoint(lat, lon);
        points.push(`${lon === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      return points.join(' ');
    });
  }, [frame, rotY, rotX]);

  const lonPaths = useMemo(() => {
    return longitudes.map((lon) => {
      const points: string[] = [];
      for (let lat = -90; lat <= 90; lat += 10) {
        const { x, y } = projectPoint(lat, lon);
        points.push(`${lat === -90 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      return points.join(' ');
    });
  }, [frame, rotY, rotX]);

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
      {/* Background architectural coordinate grid */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <circle cx="960" cy="540" r="420" fill="none" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="960" cy="540" r="560" fill="none" stroke="#141414" strokeWidth="1" />
        <line x1="960" y1="60" x2="960" y2="1020" stroke="#1A1A1A" strokeWidth="1" />
        <line x1="160" y1="540" x2="1760" y2="540" stroke="#1A1A1A" strokeWidth="1" />
      </svg>

      {/* 3D Wireframe Crest Assembly - consistent mechanical rotation, zero float */}
      <div
        style={{
          position: 'relative',
          width: '600px',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${entrance})`,
        }}
      >
        {/* Crisp dashed vermilion orbital ring */}
        <div
          style={{
            position: 'absolute',
            width: '490px',
            height: '490px',
            borderRadius: '50%',
            border: '2px dashed #FF3B1D',
            transform: `rotate(${frame * 0.8}deg)`,
            opacity: 0.85,
          }}
        />

        {/* Solid inner guide ring */}
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255, 59, 29, 0.4)',
          }}
        />

        {/* 3D Wireframe Sphere SVG */}
        <svg
          viewBox="-300 -300 600 600"
          style={{
            width: '540px',
            height: '540px',
            overflow: 'visible',
          }}
        >
          {latPaths.map((d, i) => (
            <path
              key={`lat-${i}`}
              d={d}
              fill="none"
              stroke="#FAF8F5"
              strokeWidth={i === 2 ? '2.5' : '1.5'}
              opacity={i === 2 ? 0.9 : 0.6}
            />
          ))}

          {lonPaths.map((d, i) => (
            <path
              key={`lon-${i}`}
              d={d}
              fill="none"
              stroke="#FAF8F5"
              strokeWidth="1.5"
              opacity="0.6"
            />
          ))}

          <circle cx="0" cy="0" r="14" fill="#FF3B1D" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="#FF3B1D" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>

        {/* Dynamic crest status readout */}
        <div
          style={{
            position: 'absolute',
            bottom: '-70px',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            color: '#FAF8F5',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ color: '#FF3B1D' }}>●</span>
          <span>GLOBAL CREATIVE ENGINE</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
