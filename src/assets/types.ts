/**
 * Core type definitions for the Asset Acquisition Layer.
 */

export type AssetType =
  | 'product_image'
  | 'character'
  | 'illustration'
  | 'icon'
  | 'logo'
  | 'texture'
  | 'background'
  | 'object'
  | 'environment'
  | 'prop'
  | 'audio'
  | 'music'
  | 'sfx'
  | 'voice'
  | 'video_clip'
  | 'font'
  | 'mask'
  | '3d_render';

export type AssetCategory =
  | 'source_media'        // Must exist as an external source file
  | 'remotion_procedural' // Built procedurally in code (HTML/CSS/Canvas/Three.js)
  | 'remotion_effect'     // Generated via animation or shader compositing
  | 'reference_only';     // Useful for style reference but not rendered directly

export type AcquisitionMethod = 'user_provided' | 'generated';
export type AssetStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface VisualRequirements {
  framing?: string;
  camera?: string;
  lighting?: string;
  transparency?: boolean;
  aspectRatio?: string;
  minimumResolution?: string;
  style?: string;
  materials?: string;
  colorPalette?: string[];
  thingsToAvoid?: string[];
  notes?: string;
}

export interface AssetRequirement {
  id: string;                      // Stable immutable ID, e.g. "asset_product_01"
  name: string;                    // Human-readable title, e.g. "Hero Product Bottle"
  type: AssetType;
  category: AssetCategory;
  priority: number;                // 1 (Highest) to 6 (Optional/Decorative)
  required: boolean;
  targetScenes: string[];          // e.g. ["scene_01", "scene_03"]
  referenceContext: {
    description: string;           // Where and how it appears in the reference
    timestampRange?: string;       // e.g. "00:02.10 - 00:04.50"
    visualRole: string;            // e.g. "Hero subject occupying 40% of frame"
    reuseInOtherScenes?: boolean;
  };
  requirements: VisualRequirements;
  dependsOn?: string;              // Upstream asset dependency ID, e.g. "asset_product_01"
}

export interface GenerationSpec {
  assetId: string;
  subject: string;
  composition: string;
  framing: string;
  camera: string;
  lighting: string;
  perspective: string;
  style: string;
  color: string;
  materials: string;
  background: string;
  aspectRatio: string;
  transparency: boolean;
  resolution: string;
  visualConstraints: string[];
  referenceRelationship: string;
  thingsToAvoid: string[];
  promptRecommendation: string;
}

export interface AssetValidationResult {
  valid: boolean;
  width?: number;
  height?: number;
  format?: string;
  hasAlpha?: boolean;
  aspectRatio?: number;
  issues: string[];
  notes: string[];
}

export interface AssetManifestEntry {
  id: string;
  name: string;
  type: AssetType;
  source: {
    method: AcquisitionMethod;
    path: string;                  // Workspace path, e.g. "projects/<slug>/04_Assets/scene_01/product.png"
    publicPath: string;            // Public mirror path, e.g. "projects/<slug>/product.png"
    originalFileName?: string;
  };
  status: AssetStatus;
  used_in: string[];
  requirements: VisualRequirements;
  validation: {
    passed: boolean;
    subject_match?: boolean;
    quality?: boolean;
    composition_match?: boolean;
    transparency_verified?: boolean;
    dimensions?: { width: number; height: number };
    issues?: string[];
  };
  generation?: {
    prompt_reference?: string;
    generator?: string;
    seed?: number;
  };
  notes?: string[];
}

export interface AssetManifest {
  project: string;
  updatedAt: string;
  totalAssets: number;
  assets: AssetManifestEntry[];
}

export interface VideoSpecSceneLayer {
  type: string;
  component: string;
  assetId?: string;
  params: Record<string, any>;
}

export interface VideoSpecScene {
  id: string;
  title: string;
  duration_in_frames: number;
  duration_in_seconds: number;
  transition_to_next?: string;
  transition_duration?: number;
  required_assets: string[];
  layers?: VideoSpecSceneLayer[];
}

export interface VideoSpec {
  project: string;
  fps: number;
  width: number;
  height: number;
  totalDurationFrames: number;
  totalDurationSeconds: number;
  rhythm_template?: string;
  scenes: VideoSpecScene[];
  assetBindings: Record<string, string>; // assetId -> publicPath
}

export interface AssetReadinessReport {
  status: 'ready' | 'pending_assets' | 'blocked';
  totalRequired: number;
  acquired: number;
  generated: number;
  userProvided: number;
  unresolved: AssetRequirement[];
  assets: {
    id: string;
    name: string;
    status: AssetStatus;
    method?: AcquisitionMethod;
    path?: string;
  }[];
  nextStage: string;
}
