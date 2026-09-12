import React from 'react';

export interface NoiseProps {
  opacity?: number;
  blendMode?: React.CSSProperties['mixBlendMode'];
  baseFrequency?: number;
  numOctaves?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Noise: React.FC<NoiseProps> = ({
  opacity = 0.05,
  blendMode = 'overlay',
  baseFrequency = 0.85,
  numOctaves = 3,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blendMode,
        zIndex: 999,
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <filter id="procedural-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#procedural-noise)" />
      </svg>
    </div>
  );
};
