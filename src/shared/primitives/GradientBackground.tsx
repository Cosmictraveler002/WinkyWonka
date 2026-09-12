import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface GradientBackgroundProps {
  stops?: string[];
  type?: 'linear' | 'radial' | 'mesh';
  angle?: number;
  animated?: boolean;
  speed?: number;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  stops = ['#0f172a', '#1e1b4b', '#020617'],
  type = 'linear',
  angle = 135,
  animated = true,
  speed = 0.5,
  backgroundColor = '#0b0f19',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const time = (frame / fps) * speed;

  let backgroundStyle: React.CSSProperties = {
    backgroundColor,
  };

  if (type === 'linear') {
    const dynamicAngle = animated ? angle + Math.sin(time) * 20 : angle;
    backgroundStyle.background = `linear-gradient(${dynamicAngle}deg, ${stops.join(', ')})`;
  } else if (type === 'radial') {
    const posX = animated ? 50 + Math.sin(time * 0.8) * 15 : 50;
    const posY = animated ? 50 + Math.cos(time * 0.9) * 15 : 50;
    backgroundStyle.background = `radial-gradient(circle at ${posX}% ${posY}%, ${stops.join(', ')})`;
  } else if (type === 'mesh') {
    const c1 = stops[0] || '#6366f1';
    const c2 = stops[1] || '#ec4899';
    const c3 = stops[2] || '#06b6d4';

    return (
      <div
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor,
          overflow: 'hidden',
          ...style,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: `${30 + Math.sin(time) * 15}%`,
            left: `${30 + Math.cos(time) * 15}%`,
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}45 0%, ${c1}00 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: `${70 + Math.cos(time * 1.2) * 15}%`,
            left: `${70 + Math.sin(time * 1.1) * 15}%`,
            width: '55vw',
            height: '55vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c2}40 0%, ${c2}00 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: `${50 + Math.sin(time * 0.7) * 20}%`,
            left: `${50 + Math.cos(time * 0.6) * 20}%`,
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c3}35 0%, ${c3}00 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(100px)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        ...backgroundStyle,
        ...style,
      }}
    />
  );
};
