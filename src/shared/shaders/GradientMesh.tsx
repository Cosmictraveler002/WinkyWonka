import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface GradientMeshProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  speed?: number;
  noiseOpacity?: number;
  style?: React.CSSProperties;
}

export const GradientMesh: React.FC<GradientMeshProps> = ({
  primaryColor = '#6366f1',
  secondaryColor = '#ec4899',
  accentColor = '#06b6d4',
  backgroundColor = '#0b0f19',
  speed = 0.5,
  noiseOpacity = 0.03,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const time = (frame / fps) * speed;

  const orb1X = 25 + Math.sin(time * 0.8) * 15;
  const orb1Y = 30 + Math.cos(time * 0.7) * 12;

  const orb2X = 75 + Math.cos(time * 0.9) * 18;
  const orb2Y = 65 + Math.sin(time * 0.6) * 15;

  const orb3X = 50 + Math.sin(time * 1.1 + 2) * 20;
  const orb3Y = 80 + Math.cos(time * 0.85) * 15;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Orb 1 */}
      <div
        style={{
          position: 'absolute',
          top: `${orb1Y}%`,
          left: `${orb1X}%`,
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor}40 0%, ${primaryColor}00 70%)`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Orb 2 */}
      <div
        style={{
          position: 'absolute',
          top: `${orb2Y}%`,
          left: `${orb2X}%`,
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryColor}35 0%, ${secondaryColor}00 70%)`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Orb 3 */}
      <div
        style={{
          position: 'absolute',
          top: `${orb3Y}%`,
          left: `${orb3X}%`,
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}30 0%, ${accentColor}00 70%)`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />
    </div>
  );
};
