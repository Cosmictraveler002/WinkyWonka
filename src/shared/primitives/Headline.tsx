import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export type HeadlineAnimation = 'slideUp' | 'fade' | 'scale' | 'tracking';

export interface HeadlineProps {
  text: string;
  delay?: number;
  animation?: HeadlineAnimation;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  gradient?: string;
  letterSpacing?: number | string;
  lineHeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const Headline: React.FC<HeadlineProps> = ({
  text,
  delay = 0,
  animation = 'slideUp',
  fontSize = '4.5rem',
  fontWeight = 800,
  fontFamily = 'system-ui, -apple-system, sans-serif',
  color = '#ffffff',
  gradient,
  letterSpacing = '-0.03em',
  lineHeight = 1.1,
  textAlign = 'center',
  springConfig = 'snappy',
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

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let transform = '';
  let trackingValue = letterSpacing;

  switch (animation) {
    case 'slideUp': {
      const translateY = interpolate(progress, [0, 1], [50, 0]);
      transform = `translateY(${translateY}px)`;
      break;
    }
    case 'scale': {
      const scale = interpolate(progress, [0, 1], [0.85, 1]);
      transform = `scale(${scale})`;
      break;
    }
    case 'tracking': {
      const extraTracking = interpolate(progress, [0, 1], [15, 0]);
      trackingValue = `calc(${letterSpacing} + ${extraTracking}px)`;
      break;
    }
    case 'fade':
    default:
      transform = 'none';
      break;
  }

  return (
    <h1
      className={className}
      style={{
        margin: 0,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        letterSpacing: trackingValue,
        transform,
        opacity,
        ...(gradient
          ? {
              backgroundImage: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }
          : { color }),
        ...style,
      }}
    >
      {text}
    </h1>
  );
};
