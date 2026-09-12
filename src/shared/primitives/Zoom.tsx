import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

export interface ZoomProps {
  children: React.ReactNode;
  fromScale?: number;
  toScale?: number;
  fromOrigin?: string;
  delay?: number;
  durationInFrames?: number;
  easing?: 'linear' | 'ease-out' | 'ease-in-out';
  className?: string;
  style?: React.CSSProperties;
}

export const Zoom: React.FC<ZoomProps> = ({
  children,
  fromScale = 1.0,
  toScale = 1.15,
  fromOrigin = 'center center',
  delay = 0,
  durationInFrames = 90,
  easing = 'ease-out',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();

  const selectedEasing =
    easing === 'ease-out'
      ? Easing.out(Easing.quad)
      : easing === 'ease-in-out'
        ? Easing.inOut(Easing.quad)
        : Easing.linear;

  const scale = interpolate(
    frame - delay,
    [0, durationInFrames],
    [fromScale, toScale],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: selectedEasing,
    }
  );

  return (
    <div
      className={className}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: fromOrigin,
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
