import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets } from '../motion/springs';

export interface GlassCardProps {
  children: React.ReactNode;
  delay?: number;
  width?: number | string;
  height?: number | string;
  padding?: number | string;
  borderRadius?: number | string;
  background?: string;
  borderColor?: string;
  springPreset?: keyof typeof SpringPresets;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  delay = 0,
  width = 'auto',
  height = 'auto',
  padding = '2rem',
  borderRadius = '24px',
  background = 'rgba(255, 255, 255, 0.04)',
  borderColor = 'rgba(255, 255, 255, 0.12)',
  springPreset = 'snappy',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = computeSpring({
    frame,
    fps,
    delay,
    config: springPreset,
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        width,
        height,
        padding,
        borderRadius,
        background,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
