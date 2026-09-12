import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export type ShakeIntensity = 'subtle' | 'medium' | 'heavy';

export interface CameraShakeProps {
  children: React.ReactNode;
  startFrame?: number;
  durationInFrames?: number;
  intensity?: ShakeIntensity | number;
  decay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CameraShake: React.FC<CameraShakeProps> = ({
  children,
  startFrame = 0,
  durationInFrames = 15,
  intensity = 'medium',
  decay = true,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();

  const maxOffset = typeof intensity === 'number'
    ? intensity
    : intensity === 'subtle'
      ? 6
      : intensity === 'heavy'
        ? 24
        : 12;

  const isActive = frame >= startFrame && frame < startFrame + durationInFrames;

  let offsetX = 0;
  let offsetY = 0;
  let rotation = 0;

  if (isActive) {
    const elapsed = frame - startFrame;
    const progress = elapsed / durationInFrames;
    const dampening = decay ? 1 - progress : 1;

    // Harmonic multi-sine superposition for organic shake
    offsetX = (Math.sin(elapsed * 1.7) * 0.6 + Math.cos(elapsed * 2.3) * 0.4) * maxOffset * dampening;
    offsetY = (Math.cos(elapsed * 1.9) * 0.7 + Math.sin(elapsed * 2.9) * 0.3) * maxOffset * dampening;
    rotation = Math.sin(elapsed * 1.5) * (maxOffset * 0.08) * dampening;
  }

  return (
    <div
      className={className}
      style={{
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
