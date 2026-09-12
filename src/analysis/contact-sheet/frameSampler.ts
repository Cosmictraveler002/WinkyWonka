import { AnalysisMode, FrameMetadata } from './types';

export interface SceneTimelineMeta {
  id: string;
  title?: string;
  duration_in_frames: number;
  transition_duration?: number;
}

export interface TimelineMeta {
  fps: number;
  total_duration_in_frames: number;
  scenes: SceneTimelineMeta[];
}

export function formatTimestamp(frame: number, fps: number): string {
  const totalSeconds = frame / fps;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toFixed(2).padStart(5, '0');
  return `${minsStr}:${secsStr}`;
}

export function sampleFrames(
  timeline: TimelineMeta,
  mode: AnalysisMode = 'storyboard',
  motionIntervalFrames = 6
): FrameMetadata[] {
  const fps = timeline.fps || 30;
  const scenes = timeline.scenes || [];
  const calculatedFrames = scenes.reduce((acc, sc, idx) => {
    const dur = sc.duration_in_frames || 90;
    const trans = idx < scenes.length - 1 ? (sc.transition_duration ?? 15) : 0;
    return acc + dur - trans;
  }, 0);
  const totalFrames =
    timeline.total_duration_in_frames ||
    (timeline as any).total_duration_frames ||
    (calculatedFrames > 0 ? calculatedFrames : 300);

  // Build scene boundaries mapping
  interface SceneSpan {
    sceneId: string;
    startFrame: number;
    endFrame: number;
    duration: number;
  }

  const sceneSpans: SceneSpan[] = [];
  let currentStart = 0;

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const duration = sc.duration_in_frames;
    const transitionDuration = sc.transition_duration || 15;
    const end = currentStart + duration;

    sceneSpans.push({
      sceneId: sc.id,
      startFrame: currentStart,
      endFrame: end,
      duration,
    });

    currentStart = end - (i < scenes.length - 1 ? transitionDuration : 0);
  }

  function getSceneForFrame(frame: number): { sceneId: string; shotId: string } {
    for (let i = 0; i < sceneSpans.length; i++) {
      const span = sceneSpans[i];
      if (frame >= span.startFrame && frame <= span.endFrame) {
        // Approximate shot division: shot_01 (first half), shot_02 (second half)
        const midpoint = span.startFrame + span.duration / 2;
        const shotId = frame < midpoint ? 'shot_01' : 'shot_02';
        return { sceneId: span.sceneId, shotId };
      }
    }
    const last = sceneSpans[sceneSpans.length - 1];
    return { sceneId: last?.sceneId || 'scene_01', shotId: 'shot_01' };
  }

  const frameNumbers: Set<number> = new Set();

  if (mode === 'storyboard') {
    // Sparse representation: scene starts, key visual peaks, holds, and transitions
    for (const span of sceneSpans) {
      // Scene entrance
      frameNumbers.add(Math.min(totalFrames - 1, span.startFrame + 2));
      // Action apex / keyframe reveal (35% & 50%)
      frameNumbers.add(Math.min(totalFrames - 1, span.startFrame + Math.round(span.duration * 0.35)));
      frameNumbers.add(Math.min(totalFrames - 1, span.startFrame + Math.round(span.duration * 0.5)));
      // Settled state (80%)
      frameNumbers.add(Math.min(totalFrames - 1, span.startFrame + Math.round(span.duration * 0.8)));
      // Near transition/exit
      frameNumbers.add(Math.max(0, span.endFrame - 2));
    }
  } else {
    // MOTION Mode: Dense sequential sampling at fixed interval
    for (let f = 0; f < totalFrames; f += motionIntervalFrames) {
      frameNumbers.add(f);
    }
    // Always include final frame
    frameNumbers.add(totalFrames - 1);
  }

  // Sort chronologically and build metadata
  const sortedFrames = Array.from(frameNumbers).sort((a, b) => a - b);

  return sortedFrames.map(frame => {
    const { sceneId, shotId } = getSceneForFrame(frame);
    const time = parseFloat((frame / fps).toFixed(3));
    const timestamp = formatTimestamp(frame, fps);

    return {
      frame,
      time,
      timestamp,
      sceneId,
      shotId,
    };
  });
}
