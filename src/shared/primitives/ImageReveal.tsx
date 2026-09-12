import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { computeSpring, SpringPresets, SpringPresetConfig } from '../motion/springs';

export type ImageRevealType = 'wipe-left' | 'wipe-right' | 'zoom-in' | 'blur-in' | 'curtain';

export interface ImageRevealProps {
  src: string;
  delay?: number;
  revealType?: ImageRevealType;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  borderRadius?: number | string;
  borderColor?: string;
  boxShadow?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  springConfig?: keyof typeof SpringPresets | SpringPresetConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  src,
  delay = 0,
  revealType = 'wipe-left',
  width = '100%',
  height = 'auto',
  aspectRatio = '16/9',
  borderRadius = '20px',
  borderColor = 'rgba(255, 255, 255, 0.15)',
  boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  objectFit = 'cover',
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

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let clipPath = 'none';
  let transform = '';
  let filter = 'none';

  switch (revealType) {
    case 'wipe-left': {
      const wipe = interpolate(progress, [0, 1], [100, 0]);
      clipPath = `inset(0 0 0 ${wipe}%)`;
      break;
    }
    case 'wipe-right': {
      const wipe = interpolate(progress, [0, 1], [100, 0]);
      clipPath = `inset(0 ${wipe}% 0 0)`;
      break;
    }
    case 'curtain': {
      const wipe = interpolate(progress, [0, 1], [50, 0]);
      clipPath = `inset(0 ${wipe}% 0 ${wipe}%)`;
      break;
    }
    case 'zoom-in': {
      const scale = interpolate(progress, [0, 1], [1.2, 1]);
      transform = `scale(${scale})`;
      break;
    }
    case 'blur-in': {
      const blur = interpolate(progress, [0, 1], [20, 0]);
      filter = `blur(${blur}px)`;
      const scale = interpolate(progress, [0, 1], [0.95, 1]);
      transform = `scale(${scale})`;
      break;
    }
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        aspectRatio,
        borderRadius,
        border: `1px solid ${borderColor}`,
        boxShadow,
        overflow: 'hidden',
        clipPath,
        opacity,
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          transform,
          filter,
          display: 'block',
        }}
      />
    </div>
  );
};
