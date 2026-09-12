/**
 * Type definitions for the Storyboard Director Agent.
 */

export type ShotPurpose =
  | 'hook'
  | 'orient'
  | 'introduce'
  | 'establish'
  | 'setup'
  | 'question'
  | 'misdirect'
  | 'explain'
  | 'demonstrate'
  | 'escalate'
  | 'contrast'
  | 'reveal'
  | 'reaction'
  | 'punchline'
  | 'payoff'
  | 'reset'
  | 'transition'
  | 'brand'
  | 'cta'
  | 'end'
  // Legacy / granular aliases
  | 'emotional_beat'
  | 'visual_joke'
  | 'product_demonstration'
  | 'information_delivery'
  | 'ending';

export type HookCategory =
  | 'curiosity'
  | 'contradiction'
  | 'immediate_result'
  | 'problem'
  | 'visual_novelty'
  | 'character'
  | 'audio'
  | 'text';

export type AttentionLoadScore = 'low' | 'medium' | 'high' | 'extreme';

export type VisualComplexityLevel = 'low' | 'medium' | 'high' | 'chaotic';

export type ShotSize =
  | 'extreme_wide'
  | 'wide'
  | 'medium_wide'
  | 'medium'
  | 'medium_close_up'
  | 'close_up'
  | 'extreme_close_up'
  | 'macro';

export type CameraAngle =
  | 'eye_level'
  | 'low'
  | 'high'
  | 'dutch'
  | 'top_down'
  | 'overhead'
  | 'ground_level';

export type CameraMovement =
  | 'static'
  | 'slow_push_in'
  | 'fast_push_in'
  | 'pull_back'
  | 'pan_left'
  | 'pan_right'
  | 'tilt_up'
  | 'tilt_down'
  | 'orbit'
  | 'whip_pan'
  | 'tracking'
  | 'handheld_drift';

export interface ShotFraming {
  shot_size: ShotSize;
  angle: CameraAngle;
  composition: string; // e.g. "Rule of thirds, subject screen left", "Centered hero", "Negative space dominant"
}

export interface ShotAudioRelation {
  dialogue?: boolean;
  dialogue_line_ids?: string[];
  music_beat?: string; // e.g. "Cut hits on beat drop", "Swells through visual hold"
  sfx?: string;        // e.g. "whoosh", "heavy_thud", "ambient_hum"
  voice?: string;
  music_event?: string;
}

export interface ShotTransition {
  type: 'hard_cut' | 'slide_left' | 'cross_fade' | 'wipe' | 'zoom_through' | 'match_cut' | 'glitch' | 'none';
  duration_frames?: number;
  reason?: string;
}

export interface ShotMotion {
  entrance?: string;
  transformation?: string;
  exit?: string;
}

export interface Shot {
  id: string;                    // Stable ID: e.g. "S01_SH01", "S02_SH03"
  time: {
    start_seconds: number;
    end_seconds: number;
    duration_seconds: number;
    start_frame?: number;
    end_frame?: number;
  };
  script: {
    dialogue?: string | null;
    line_ids?: string[];
  };
  purpose: ShotPurpose;

  // Creative Rulebook (Section 57): Perceptual Experience Targets
  viewer_should_notice: string;
  viewer_should_understand: string;
  viewer_should_feel: string;
  attention_target: string;      // Rule 2: Exactly ONE primary attention target
  secondary_target?: string | null; // Rule 2: Optional secondary target

  visual: {
    description: string;
    focal_point?: string;
    action?: string;
  };
  framing: ShotFraming;
  camera: {
    movement: CameraMovement;
    lens?: string;               // e.g. "50mm anamorphic look", "24mm wide dramatic"
  };
  motion?: ShotMotion;
  subject: string;               // Main subject of the shot
  action?: string;
  performance?: string | null;   // Staging / performance notes
  text?: {
    content: string;
    hierarchy: 'headline' | 'caption' | 'badge' | 'disclaimer';
    animation?: string;
  } | null;
  audio: ShotAudioRelation;
  transition: ShotTransition;
  rhythm: {
    event: 'pulse' | 'hold' | 'accelerate' | 'impact' | 'break' | 'payoff';
    notes?: string;
    rhythm_role?: string;
  };
  previous_shot_relationship?: string;
  next_shot_relationship?: string;

  // Cognitive Budget (Rule 3, 37, 58)
  complexity: VisualComplexityLevel;
  attention_load: AttentionLoadScore;
  creative_rationale: string;
  brand_elements?: string[];
  asset_dependencies: string[]; // Stable asset IDs
}

export interface RulebookAuditIssue {
  rule_id: number;
  rule_name: string;
  severity: 'error' | 'warning';
  shot_id?: string;
  message: string;
  remedy: string;
}

export interface RulebookAuditResult {
  passed: boolean;
  score: number; // 0 - 100
  total_checks: number;
  issues: RulebookAuditIssue[];
}

export interface SceneStoryboard {
  id: string;                   // e.g. "scene_01"
  title: string;
  purpose: string;
  total_duration_seconds: number;
  total_duration_frames: number;
  shots: Shot[];
}

export interface StoryDirection {
  core_idea: string;
  visual_language: string;
  camera_language: string;
  editing_language: string;
  performance_language: string;
  typography_language: string;
  ending_strategy: string;
  major_creative_decisions: {
    id: string;                 // e.g. "D001"
    topic: string;
    proposed_direction: string;
    alternatives: string[];
    requires_human_choice: boolean;
    status: 'pending' | 'approved' | 'modified';
  }[];
}

export interface CreativeDecision {
  id: string;                   // e.g. "D001"
  timestamp: string;
  topic: string;
  human_decision: string;
  reason?: string;
  affects_shots?: string[];
  affects_scenes?: string[];
}

export interface ScriptNote {
  id: string;                   // e.g. "SN001"
  location: string;             // e.g. "line_04", "Scene 02 intro"
  issue: string;
  suggestion: string;
  impact: string;
  requires_human_approval: boolean;
  status: 'open' | 'addressed' | 'dismissed';
}

export interface StoryboardAssetRequirement {
  id: string;
  type: string;
  name: string;
  priority: number;
  required: boolean;
  used_in_shots: string[];
  description: string;
  visual_role: string;
}

export interface StoryboardManifest {
  project: string;
  version: string;              // e.g. "v001"
  updated_at: string;
  fps: number;
  total_duration_seconds: number;
  total_duration_frames: number;
  rhythm_template?: string;
  creative_direction: StoryDirection;
  scenes: SceneStoryboard[];
  ending: {
    strategy: string;
    payoff_shot_id: string;
  };
  asset_requirements: StoryboardAssetRequirement[];
  script_notes: ScriptNote[];
  human_decisions: CreativeDecision[];
}
