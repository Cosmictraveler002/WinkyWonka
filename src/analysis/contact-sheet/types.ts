export type AnalysisMode = 'storyboard' | 'motion';
export type SamplingStrategy = 'fixed_interval' | 'scene_aware' | 'keyframe_aware';

export interface FrameMetadata {
  frame: number;
  time: number;
  timestamp: string; // e.g. "00:04.21"
  sceneId: string;
  shotId: string;
  phase?: string; // "entry" | "apex" | "settled" | "motion"
  filePath?: string;
}

export interface SheetFrame {
  frame: number;
  time: number;
  timestamp: string;
  scene: string;
  shot: string;
  row: number;
  column: number;
}

export interface GeneratedSheet {
  file: string;
  filePath: string;
  sheetIndex: number;
  width: number;
  height: number;
  frames: SheetFrame[];
}

export interface SheetDimensions {
  thumbnailWidth: number;
  thumbnailHeight: number;
  metadataHeight: number;
  totalWidth: number;
  totalHeight: number;
  columns: number;
  rows: number;
}

export interface ContactSheetManifest {
  source: string;
  fps: number;
  duration: number;
  totalFrameCount: number;
  mode: AnalysisMode;
  samplingStrategy: SamplingStrategy;
  sheetDimensions: SheetDimensions;
  sheets: {
    file: string;
    frames: SheetFrame[];
  }[];
}

export interface ContactSheetOptions {
  projectSlug: string;
  mode?: AnalysisMode;
  sourceType?: 'composition' | 'video' | 'frames_dir';
  sourcePath?: string;
  compositionId?: string;
  outputDir?: string;
  maxFramesPerSheet?: number;
  columns?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  metadataHeight?: number;
  format?: 'jpeg' | 'png';
  quality?: number;
  motionIntervalFrames?: number;
}

export interface ContactSheetResult {
  manifest: ContactSheetManifest;
  manifestPath: string;
  sheets: GeneratedSheet[];
  totalFramesSampled: number;
}
