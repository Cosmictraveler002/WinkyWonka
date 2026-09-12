import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export interface CaptionProps {
  text: string;
  delay?: number;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  maxWidth?: number | string;
  lineHeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number | string;
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  delay = 0,
  fontSize = '1.35rem',
  fontWeight = 400,
  fontFamily = 'system-ui, -apple-system, sans-serif',
  color = '#94a3b8',
  maxWidth = '700px',
  lineHeight = 1.6,
  textAlign = 'center',
  letterSpacing = '0.01em',
  springConfig = 'gentle',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = computeSpring({
    frame,
    fps,
    delay,
    config: springConfig,
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [25, 0]);

  return (
    <p
      className={className}
      style={{
        margin: 0,
        fontFamily,
        fontSize,
        fontWeight,
        color,
        maxWidth,
        lineHeight,
        textAlign,
        letterSpacing,
        transform: `translateY(${translateY}px)`,
        opacity,
        ...style,
      }}
    >
      {text}
    </p>
  );
};
