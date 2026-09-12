import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export type MaskRevealType = 'circle' | 'split-vertical' | 'split-horizontal' | 'diagonal' | 'iris';

export interface MaskRevealProps {
  children: React.ReactNode;
  delay?: number;
  maskType?: MaskRevealType;
  durationInFrames?: number;
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const MaskReveal: React.FC<MaskRevealProps> = ({
  children,
  delay = 0,
  maskType = 'circle',
  durationInFrames = 30,
  springConfig = 'cinematic',
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

  const opacity = interpolate(frame - delay, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let clipPath = 'none';

  switch (maskType) {
    case 'circle': {
      const radius = interpolate(progress, [0, 1], [0, 150]);
      clipPath = `circle(${radius}% at 50% 50%)`;
      break;
    }
    case 'split-vertical': {
      const split = interpolate(progress, [0, 1], [50, 0]);
      clipPath = `inset(0 ${split}% 0 ${split}%)`;
      break;
    }
    case 'split-horizontal': {
      const split = interpolate(progress, [0, 1], [50, 0]);
      clipPath = `inset(${split}% 0 ${split}% 0)`;
      break;
    }
    case 'diagonal': {
      const cut = interpolate(progress, [0, 1], [100, 0]);
      clipPath = `polygon(0 ${cut}%, ${cut}% 0, 100% 0, 100% 100%, 0 100%)`;
      break;
    }
    case 'iris': {
      const size = interpolate(progress, [0, 1], [0, 100]);
      clipPath = `ellipse(${size}% ${size * 0.8}% at 50% 50%)`;
      break;
    }
  }

  return (
    <div
      className={className}
      style={{
        clipPath,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
