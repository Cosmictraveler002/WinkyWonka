import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets } from '../motion/springs';

export interface KineticTextProps {
  text: string;
  delay?: number;
  stagger?: number;
  fontSize?: number | string;
  fontWeight?: number | string;
  color?: string;
  gradient?: string;
  fontFamily?: string;
  mode?: 'words' | 'characters' | 'line';
  springPreset?: keyof typeof SpringPresets;
  className?: string;
  style?: React.CSSProperties;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  stagger = 3,
  fontSize = '4rem',
  fontWeight = 800,
  color = '#ffffff',
  gradient,
  fontFamily = 'system-ui, -apple-system, sans-serif',
  mode = 'words',
  springPreset = 'snappy',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tokens = mode === 'characters' 
    ? text.split('') 
    : mode === 'words' 
      ? text.split(' ') 
      : [text];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: mode === 'words' ? '0.35em' : mode === 'characters' ? '0.02em' : '0',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily,
        fontSize,
        fontWeight,
        ...style,
      }}
    >
      {tokens.map((token, i) => {
        const tokenDelay = delay + i * stagger;
        const progress = computeSpring({
          frame,
          fps,
          delay: tokenDelay,
          config: springPreset,
        });

        const opacity = interpolate(frame - tokenDelay, [0, 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const translateY = interpolate(progress, [0, 1], [40, 0]);
        const scale = interpolate(progress, [0, 1], [0.85, 1]);

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              transformOrigin: 'bottom center',
              whiteSpace: mode === 'characters' && token === ' ' ? 'pre' : 'normal',
              color,
              ...(gradient ? {
                backgroundImage: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : {}),
            }}
          >
            {token === ' ' ? '\u00A0' : token}
          </span>
        );
      })}
    </div>
  );
};
