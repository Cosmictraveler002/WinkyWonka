import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export interface LogoLockupProps {
  logoUrl?: string;
  logoNode?: React.ReactNode;
  title?: string;
  badge?: string;
  delay?: number;
  layout?: 'horizontal' | 'vertical';
  textColor?: string;
  badgeColor?: string;
  badgeBg?: string;
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoLockup: React.FC<LogoLockupProps> = ({
  logoUrl,
  logoNode,
  title,
  badge,
  delay = 0,
  layout = 'horizontal',
  textColor = '#ffffff',
  badgeColor = '#818cf8',
  badgeBg = 'rgba(99, 102, 241, 0.15)',
  springConfig = 'snappy',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = computeSpring({
    frame,
    fps,
    delay,
    config: springConfig,
  });

  const textProgress = computeSpring({
    frame,
    fps,
    delay: delay + 6,
    config: springConfig,
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0.6, 1]);
  const textTranslate = interpolate(textProgress, [0, 1], [25, 0]);
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap: layout === 'horizontal' ? '1.25rem' : '0.75rem',
        opacity,
        ...style,
      }}
    >
      <div style={{ transform: `scale(${logoScale})`, display: 'flex', alignItems: 'center' }}>
        {logoNode}
        {logoUrl && !logoNode && (
          <Img src={logoUrl} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: layout === 'horizontal' ? 'flex-start' : 'center',
          transform: `translateY(${textTranslate}px)`,
        }}
      >
        {badge && (
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: badgeColor,
              backgroundColor: badgeBg,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              marginBottom: '0.25rem',
            }}
          >
            {badge}
          </span>
        )}
        {title && (
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: textColor,
              letterSpacing: '-0.02em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {title}
          </span>
        )}
      </div>
    </div>
  );
};
