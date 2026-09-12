import { spring, SpringConfig } from 'remotion';

export type SpringPresetConfig = Partial<SpringConfig> & {
  damping: number;
  mass: number;
  stiffness: number;
};

export const SpringPresets: Record<string, SpringPresetConfig> = {
  snappy: {
    damping: 12,
    mass: 0.5,
    stiffness: 150,
    overshootClamping: false,
  },
  cinematic: {
    damping: 20,
    mass: 1.2,
    stiffness: 60,
    overshootClamping: false,
  },
  bouncy: {
    damping: 8,
    mass: 0.6,
    stiffness: 180,
    overshootClamping: false,
  },
  gentle: {
    damping: 18,
    mass: 1,
    stiffness: 90,
    overshootClamping: false,
  },
  stiff: {
    damping: 26,
    mass: 0.4,
    stiffness: 260,
    overshootClamping: false,
  },
};

export interface UseSpringOptions {
  frame: number;
  fps: number;
  delay?: number;
  config?: keyof typeof SpringPresets | Partial<SpringConfig>;
  from?: number;
  to?: number;
}

export function computeSpring({
  frame,
  fps,
  delay = 0,
  config = 'gentle',
  from = 0,
  to = 1,
}: UseSpringOptions): number {
  const selectedConfig = typeof config === 'string' ? SpringPresets[config] : config;
  const rawSpring = spring({
    frame: frame - delay,
    fps,
    config: selectedConfig,
  });

  return from + (to - from) * rawSpring;
}
