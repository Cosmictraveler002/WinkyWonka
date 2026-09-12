import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets } from '../motion/springs';

export interface GlowBadgeProps {
  label: string;
  icon?: React.ReactNode;
  delay?: number;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  springPreset?: keyof typeof SpringPresets;
  style?: React.CSSProperties;
}

export const GlowBadge: React.FC<GlowBadgeProps> = ({
  label,
  icon,
  delay = 0,
  glowColor = '#6366f1',
  backgroundColor = 'rgba(99, 102, 241, 0.12)',
  textColor = '#a5b4fc',
  springPreset = 'bouncy',
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

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.6, 1]);

  // Subtle breathing pulse after entrance
  const elapsed = Math.max(0, frame - delay - 15);
  const pulse = Math.sin((elapsed / fps) * Math.PI * 2) * 0.15 + 0.85;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1.1rem',
        borderRadius: '9999px',
        backgroundColor,
        border: `1px solid ${glowColor}40`,
        boxShadow: `0 0 ${16 * pulse}px ${glowColor}50, inset 0 0 ${8 * pulse}px ${glowColor}25`,
        color: textColor,
        fontSize: '0.95rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transform: `scale(${scale})`,
        opacity,
        ...style,
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};
