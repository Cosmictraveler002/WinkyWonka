import React from 'react';
import { useCurrentFrame } from 'remotion';

export interface FilmGrainProps {
  intensity?: number;
  speed?: number; // frame step
  blendMode?: React.CSSProperties['mixBlendMode'];
  className?: string;
  style?: React.CSSProperties;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({
  intensity = 0.07,
  speed = 2,
  blendMode = 'overlay',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();

  // Shift seed pseudo-randomly every `speed` frames
  const grainSeed = Math.floor(frame / speed) % 10;
  const shiftX = (grainSeed * 17) % 30;
  const shiftY = (grainSeed * 29) % 30;

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: '-30px',
        pointerEvents: 'none',
        opacity: intensity,
        mixBlendMode: blendMode,
        transform: `translate(${shiftX}px, ${shiftY}px)`,
        zIndex: 998,
        ...style,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id={`film-grain-${grainSeed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            seed={grainSeed * 13}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#film-grain-${grainSeed})`} />
      </svg>
    </div>
  );
};
