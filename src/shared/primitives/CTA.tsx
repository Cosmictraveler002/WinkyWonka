import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export interface CTAProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  delay?: number;
  glowColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const CTA: React.FC<CTAProps> = ({
  title,
  subtitle,
  buttonText = 'Get Started',
  buttonIcon,
  delay = 0,
  glowColor = '#6366f1',
  accentColor = '#ffffff',
  backgroundColor = 'rgba(15, 23, 42, 0.65)',
  springConfig = 'snappy',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardProgress = computeSpring({
    frame,
    fps,
    delay,
    config: springConfig,
  });

  const buttonProgress = computeSpring({
    frame,
    fps,
    delay: delay + 12,
    config: 'bouncy',
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.9, 1]);
  const cardTranslateY = interpolate(cardProgress, [0, 1], [40, 0]);
  const buttonScale = interpolate(buttonProgress, [0, 1], [0.7, 1]);

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Breathing glow pulse
  const elapsed = Math.max(0, frame - delay - 20);
  const pulse = Math.sin((elapsed / fps) * Math.PI * 2) * 0.15 + 0.85;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '3rem 4rem',
        borderRadius: '32px',
        backgroundColor,
        border: `1px solid ${glowColor}40`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 ${40 * pulse}px ${glowColor}30`,
        transform: `translateY(${cardTranslateY}px) scale(${cardScale})`,
        opacity,
        ...style,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: '3.5rem',
          fontWeight: 800,
          color: accentColor,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: '1rem 0 0 0',
            fontSize: '1.35rem',
            color: '#94a3b8',
            maxWidth: '550px',
            lineHeight: 1.5,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {subtitle}
        </p>
      )}

      {buttonText && (
        <div
          style={{
            marginTop: '2.5rem',
            transform: `scale(${buttonScale})`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              backgroundColor: glowColor,
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: 700,
              boxShadow: `0 10px 30px ${glowColor}60`,
              letterSpacing: '-0.01em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <span>{buttonText}</span>
            {buttonIcon && <span>{buttonIcon}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
