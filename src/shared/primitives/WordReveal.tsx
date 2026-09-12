import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export type WordRevealAnimation = 'rise' | 'pop' | 'rotate';

export interface WordRevealProps {
  text: string;
  delay?: number;
  stagger?: number;
  animation?: WordRevealAnimation;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  gradient?: string;
  letterSpacing?: number | string;
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  delay = 0,
  stagger = 3,
  animation = 'rise',
  fontSize = '3.5rem',
  fontWeight = 800,
  fontFamily = 'system-ui, -apple-system, sans-serif',
  color = '#ffffff',
  gradient,
  letterSpacing = '-0.02em',
  springConfig = 'snappy',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.35em',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + i * stagger;
        const progress = computeSpring({
          frame,
          fps,
          delay: wordDelay,
          config: springConfig,
        });

        const opacity = interpolate(frame - wordDelay, [0, 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        let transform = '';
        if (animation === 'rise') {
          const translateY = interpolate(progress, [0, 1], [35, 0]);
          transform = `translateY(${translateY}px)`;
        } else if (animation === 'pop') {
          const scale = interpolate(progress, [0, 1], [0.75, 1]);
          transform = `scale(${scale})`;
        } else if (animation === 'rotate') {
          const translateY = interpolate(progress, [0, 1], [30, 0]);
          const rotate = interpolate(progress, [0, 1], [15, 0]);
          transform = `translateY(${translateY}px) rotate(${rotate}deg)`;
        }

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform,
              opacity,
              color,
              ...(gradient
                ? {
                    backgroundImage: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                : {}),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
