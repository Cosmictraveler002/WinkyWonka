export type RhythmTemplateType =
  | 'acceleration'
  | 'burst_hold_burst'
  | 'musical_powers'
  | 'three_two_one'
  | 'long_rapid_silence'
  | 'constant_pulse'
  | 'pattern_break';

export interface RhythmShot {
  index: number;
  durationSeconds: number;
  durationFrames: number;
  startFrame: number;
  endFrame: number;
  role?: string;
}

export interface RhythmPlan {
  template: RhythmTemplateType;
  totalDurationSeconds: number;
  totalDurationFrames: number;
  fps: number;
  shots: RhythmShot[];
}

export function secondsToFrames(seconds: number, fps = 30): number {
  return Math.round(seconds * fps);
}

/**
 * Validates that shot durations are not artificially uniform (Anti-uniformity rule)
 */
export function validateShotVariation(durations: number[]): { isUniform: boolean; stdDev: number } {
  if (durations.length <= 1) return { isUniform: false, stdDev: 0 };
  const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  // If standard deviation is near zero (< 0.05s), durations are considered uniform (bad rhythm)
  return {
    isUniform: stdDev < 0.05,
    stdDev,
  };
}

/**
 * Generates an intentional rhythm plan based on the selected mathematical rhythm template.
 */
export function generateRhythmPlan(
  template: RhythmTemplateType,
  totalSeconds: number,
  fps = 30
): RhythmPlan {
  let rawDurations: number[] = [];

  switch (template) {
    case 'acceleration': {
      // Template A: d_i = d_0 * r^(i-1) with final visual hold/payoff
      const r = 0.75;
      const d0 = 2.8;
      const count = 6;
      for (let i = 0; i < count; i++) {
        rawDurations.push(parseFloat((d0 * Math.pow(r, i)).toFixed(2)));
      }
      // Add payoff hold
      rawDurations.push(1.8);
      break;
    }

    case 'burst_hold_burst': {
      // Template B: A (0.25T) -> H (0.15T) -> B (0.35T) -> P (0.25T)
      const a = totalSeconds * 0.25;
      const h = totalSeconds * 0.15;
      const b = totalSeconds * 0.35;
      const p = totalSeconds * 0.25;

      rawDurations = [
        a * 0.55,
        a * 0.45,
        h, // hold
        b * 0.35,
        b * 0.35,
        b * 0.3,
        p, // payoff
      ];
      break;
    }

    case 'three_two_one': {
      // Template D: 3:2:1 normalized
      const unit = totalSeconds / 6;
      rawDurations = [unit * 3, unit * 2, unit * 1];
      break;
    }

    case 'long_rapid_silence': {
      // Template E: 0.25T : 0.20T : 0.20T : 0.10T (silence) : 0.25T (payoff)
      rawDurations = [
        totalSeconds * 0.25,
        totalSeconds * 0.2,
        totalSeconds * 0.1,
        totalSeconds * 0.1,
        totalSeconds * 0.1, // silence hold
        totalSeconds * 0.25, // payoff
      ];
      break;
    }

    case 'pattern_break': {
      // Template G: Pattern A -> A -> Break B -> Payoff
      const a = totalSeconds * 0.2;
      rawDurations = [a, a, totalSeconds * 0.1, totalSeconds * 0.15, totalSeconds * 0.35];
      break;
    }

    case 'constant_pulse':
    case 'musical_powers':
    default: {
      // Musical / pulse variation
      const base = totalSeconds / 5;
      rawDurations = [base * 1.4, base * 0.8, base * 0.7, base * 0.5, base * 1.6];
      break;
    }
  }

  // Normalize so sum equals totalSeconds
  const currentSum = rawDurations.reduce((acc, d) => acc + d, 0);
  const scaleFactor = totalSeconds / currentSum;
  const normalizedDurations = rawDurations.map(d => parseFloat((d * scaleFactor).toFixed(2)));

  const shots: RhythmShot[] = [];
  let currentFrame = 0;

  for (let i = 0; i < normalizedDurations.length; i++) {
    const dSec = normalizedDurations[i];
    const dFrames = Math.round(dSec * fps);
    shots.push({
      index: i + 1,
      durationSeconds: dSec,
      durationFrames: dFrames,
      startFrame: currentFrame,
      endFrame: currentFrame + dFrames,
    });
    currentFrame += dFrames;
  }

  return {
    template,
    totalDurationSeconds: totalSeconds,
    totalDurationFrames: currentFrame,
    fps,
    shots,
  };
}
