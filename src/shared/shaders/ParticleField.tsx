import React, { useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

interface ParticlesInnerProps {
  count?: number;
  color?: string;
  size?: number;
}

const ParticlesInner: React.FC<ParticlesInnerProps> = ({
  count = 200,
  color = '#818cf8',
  size = 0.05,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sc[i] = Math.random();
    }
    return [pos, sc];
  }, [count]);

  const time = frame / fps;

  return (
    <points ref={pointsRef} rotation={[time * 0.05, time * 0.08, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          args={[scales, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export interface ParticleFieldProps {
  width?: number;
  height?: number;
  count?: number;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  width = 1920,
  height = 1080,
  count = 250,
  color = '#a5b4fc',
  size = 0.06,
  style = {},
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 5], fov: 60 }}
      >
        <ambientLight intensity={0.5} />
        <ParticlesInner count={count} color={color} size={size} />
      </ThreeCanvas>
    </div>
  );
};
