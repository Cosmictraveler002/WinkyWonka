import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type {
  StoryboardManifest,
  SceneStoryboard,
  Shot,
  ShotPurpose,
  StoryDirection,
  CreativeDecision,
  ScriptNote,
  StoryboardAssetRequirement,
  RulebookAuditResult,
  RulebookAuditIssue,
} from './types.js';

export interface StoryboardEngineContext {
  projectDir: string;
  projectSlug: string;
  timeline: any;
  aesthetic: any;
  analysis: any;
  scriptContent: string | null;
  decisions: CreativeDecision[];
}

/**
 * Loads project context required for storyboarding.
 */
export function loadProjectContext(projectDir: string): StoryboardEngineContext {
  const projectSlug = path.basename(projectDir);
  const plannerDir = path.join(projectDir, '03_Planner');
  const analyzerDir = path.join(projectDir, '02_Analyzer');

  // 1. Timeline
  const timelinePath = path.join(plannerDir, 'timeline.yaml');
  const timeline = fs.existsSync(timelinePath) ? YAML.parse(fs.readFileSync(timelinePath, 'utf8')) : null;

  // 2. Aesthetic
  const aestheticPath = path.join(plannerDir, 'core_aesthetic.yaml');
  const aesthetic = fs.existsSync(aestheticPath) ? YAML.parse(fs.readFileSync(aestheticPath, 'utf8')) : null;

  // 3. Analysis
  const analysisPath = fs.existsSync(path.join(analyzerDir, 'refined_analysis.yaml'))
    ? path.join(analyzerDir, 'refined_analysis.yaml')
    : fs.existsSync(path.join(analyzerDir, 'video_analysis.yaml'))
    ? path.join(analyzerDir, 'video_analysis.yaml')
    : null;
  const analysis = analysisPath ? YAML.parse(fs.readFileSync(analysisPath, 'utf8')) : null;

  // 4. Script
  const candidateScriptPaths = [
    path.join(projectDir, 'SCRIPT.md'),
    path.join(projectDir, '03_Planner', 'SCRIPT.md'),
    path.join(projectDir, '01_Reference', 'SCRIPT.md'),
  ];
  let scriptContent: string | null = null;
  for (const sp of candidateScriptPaths) {
    if (fs.existsSync(sp)) {
      scriptContent = fs.readFileSync(sp, 'utf8');
      break;
    }
  }

  // 5. Existing Decisions
  const decisionsPath = path.join(plannerDir, 'STORYBOARD_DECISIONS.yaml');
  let decisions: CreativeDecision[] = [];
  if (fs.existsSync(decisionsPath)) {
    try {
      const data = YAML.parse(fs.readFileSync(decisionsPath, 'utf8'));
      decisions = data.decisions || [];
    } catch {}
  }

  return {
    projectDir,
    projectSlug,
    timeline,
    aesthetic,
    analysis,
    scriptContent,
    decisions,
  };
}

/**
 * Checkpoint 1: Proposes initial Story Direction and major creative decisions.
 */
export function formulateStoryDirection(ctx: StoryboardEngineContext): StoryDirection {
  const aestheticStyle = ctx.aesthetic?.aesthetic?.style || 'modern commercial motion graphics';
  const rhythmTemplate = ctx.timeline?.rhythm_template || 'Template B (Burst -> Hold -> Burst -> Payoff)';

  return {
    core_idea: `High-impact authored visual narrative balancing kinetic typography, deep atmospheric lighting, and high-fidelity product reveals built around ${rhythmTemplate}.`,
    visual_language: `Grounded editorial dark mode aesthetic, avoiding generic AI-slop tropes. High contrast between crisp foreground typographic marks and subtle volumetric particle fields.`,
    camera_language: `Deliberate, cinematic focal shifts with subtle continuous drift. Fast snaps on rhythmic accents, stable holds on key typography and payoff.`,
    editing_language: `Non-uniform temporal cutting following ${rhythmTemplate}. Opening burst (2.5s) -> fast technical escalation (1.8s) -> extended payoff hold (3.0s). Cuts are motivated by typographic reveals rather than arbitrary beats.`,
    performance_language: `Zero mechanical float. Elements settle with organic spring physics (damping: 15, stiffness: 220), establishing weight and tactile authority.`,
    typography_language: `Dominant uppercase display headings with generous letter-spacing, accompanied by muted geometric mono captions. Clear typographical hierarchy.`,
    ending_strategy: `Decisive focal settlement on brand call-to-action with glowing accent pulse, holding until visual dissolve.`,
    major_creative_decisions: [
      {
        id: 'D001',
        topic: 'Hero Subject Presentation in Scene 02',
        proposed_direction: 'Floating 3D glass card with subtle particle orbit and kinetic text reveal',
        alternatives: [
          'Direct full-screen product hero shot with dynamic camera push-in',
          'Split-screen typographic showcase comparing features side-by-side',
        ],
        requires_human_choice: true,
        status: 'pending',
      },
      {
        id: 'D002',
        topic: 'Transition from Scene 01 to Scene 02',
        proposed_direction: 'Rapid slide left with motion blur to maintain kinetic acceleration',
        alternatives: [
          'Hard cut on audio transient for maximum contrast',
          'Dimensional zoom-through camera match cut',
        ],
        requires_human_choice: false,
        status: 'approved',
      },
      {
        id: 'D003',
        topic: 'Closing Call-to-Action Payoff',
        proposed_direction: 'GlowBadge with pulsing cyan border and animated button settlement',
        alternatives: [
          'Minimalist centered monochrome logo reveal without button UI',
          'Fast kinetic wordmark slam followed by URL lockup',
        ],
        requires_human_choice: true,
        status: 'pending',
      },
    ],
  };
}

/**
 * Checkpoint 2: Compiles the complete shot-by-shot Storyboard.
 */
export function compileStoryboard(ctx: StoryboardEngineContext): StoryboardManifest {
  const plannerDir = path.join(ctx.projectDir, '03_Planner');
  const scenesDir = path.join(plannerDir, 'scenes');
  const fps = ctx.timeline?.fps || 30;

  const storyDirection = formulateStoryDirection(ctx);

  // Apply any previously recorded human decisions
  for (const dec of ctx.decisions) {
    const targetDecision = storyDirection.major_creative_decisions.find((d) => d.id === dec.id);
    if (targetDecision) {
      targetDecision.proposed_direction = dec.human_decision;
      targetDecision.status = 'approved';
    }
  }

  const scenes: SceneStoryboard[] = [];
  const assetReqs: StoryboardAssetRequirement[] = [];
  const scriptNotes: ScriptNote[] = [];

  const rawScenes = ctx.timeline?.scenes || [
    { id: 'scene_01', title: 'Opening Hook', duration_in_frames: 75, duration_in_seconds: 2.5 },
    { id: 'scene_02', title: 'Feature Showcase', duration_in_frames: 55, duration_in_seconds: 1.83 },
    { id: 'scene_03', title: 'Payoff & CTA', duration_in_frames: 90, duration_in_seconds: 3.0 },
  ];

  let cumulativeSeconds = 0;

  for (let scIdx = 0; scIdx < rawScenes.length; scIdx++) {
    const sc = rawScenes[scIdx];
    const sceneId = sc.id || `scene_${String(scIdx + 1).padStart(2, '0')}`;
    const sceneDurationSec = sc.duration_in_seconds || (sc.duration_in_frames || 90) / fps;
    const sceneDurationFrames = sc.duration_in_frames || Math.round(sceneDurationSec * fps);

    // Read atomic scene YAML if available
    const sceneYamlPath = path.join(scenesDir, `${sceneId}.yaml`);
    let sceneYaml: any = null;
    if (fs.existsSync(sceneYamlPath)) {
      try {
        sceneYaml = YAML.parse(fs.readFileSync(sceneYamlPath, 'utf8'));
      } catch {}
    }

    const sceneShots: Shot[] = [];

    if (scIdx === 0) {
      // Scene 01: 2 micro-shots (Initial spark hook -> settled title)
      const shot1Duration = parseFloat((sceneDurationSec * 0.4).toFixed(2));
      const shot2Duration = parseFloat((sceneDurationSec * 0.6).toFixed(2));

      sceneShots.push({
        id: 'S01_SH01',
        time: {
          start_seconds: cumulativeSeconds,
          end_seconds: cumulativeSeconds + shot1Duration,
          duration_seconds: shot1Duration,
          start_frame: Math.round(cumulativeSeconds * fps),
          end_frame: Math.round((cumulativeSeconds + shot1Duration) * fps),
        },
        script: {
          dialogue: null,
          line_ids: ['L01'],
        },
        purpose: 'hook',
        viewer_should_notice: 'Crisp glowing subtitle badge popping into view against dark textured backdrop',
        viewer_should_understand: 'A premium, authored video experience is launching without generic startup fluff',
        viewer_should_feel: 'Immediate intrigue and focused anticipation',
        attention_target: 'Center-screen glowing badge pop',
        secondary_target: null,
        visual: {
          description: 'Dark atmospheric gradient background with ambient noise texture. Subtitle badge zooms in with spring bounce.',
          focal_point: 'Center screen badge pop',
          action: 'Glow badge scales from 0.8 to 1.0 with subtle glow pulse',
        },
        framing: {
          shot_size: 'medium',
          angle: 'eye_level',
          composition: 'Centered hero with heavy negative space above and below',
        },
        camera: {
          movement: 'slow_push_in',
          lens: '35mm anamorphic',
        },
        motion: {
          entrance: 'Scale spring 0.8 -> 1.0 with organic overshoot',
          transformation: 'Subtle cyan radial glow expansion',
          exit: 'Holds focus as headline prepares to enter',
        },
        subject: 'Atmospheric Brand Badge',
        action: 'Glow badge scales from 0.8 to 1.0 with subtle glow pulse',
        performance: 'Deadpan stillness before kinetic snap',
        text: {
          content: 'REMOTION ORCHESTRATION',
          hierarchy: 'badge',
          animation: 'scale_spring',
        },
        audio: {
          dialogue: false,
          music_beat: 'Opens on crisp snare tap',
          sfx: 'subtle_whoosh',
        },
        transition: {
          type: 'none',
        },
        rhythm: {
          event: 'pulse',
          notes: 'Snappy initial entrance without lagging',
          rhythm_role: 'Initial attention hook pulse',
        },
        complexity: 'low',
        attention_load: 'medium',
        creative_rationale: 'Rule 5.8 Text Hook: Instantly establishes context without wasteful logo screens or generic branding',
        previous_shot_relationship: 'Opening frame of production',
        next_shot_relationship: 'Prepares viewer for dominant kinetic headline reveal',
        asset_dependencies: [],
      });

      sceneShots.push({
        id: 'S01_SH02',
        time: {
          start_seconds: cumulativeSeconds + shot1Duration,
          end_seconds: cumulativeSeconds + sceneDurationSec,
          duration_seconds: shot2Duration,
          start_frame: Math.round((cumulativeSeconds + shot1Duration) * fps),
          end_frame: Math.round((cumulativeSeconds + sceneDurationSec) * fps),
        },
        script: {
          dialogue: null,
          line_ids: ['L02'],
        },
        purpose: 'establish',
        viewer_should_notice: 'Precision kinetic typography slamming into frame character-by-character',
        viewer_should_understand: 'The core value proposition and high technical craftsmanship',
        viewer_should_feel: 'Arousal, energy, and aesthetic confidence',
        attention_target: 'Dominant kinetic headline',
        secondary_target: 'Volumetric background gradient',
        visual: {
          description: 'Dominant kinetic headline reveals character-by-character with snappy spring physics. Camera pushes subtly.',
          focal_point: 'Primary typography anchor',
          action: 'Headline ascends from below with slight rotation snap',
        },
        framing: {
          shot_size: 'medium_close_up',
          angle: 'eye_level',
          composition: 'Horizontally centered, eye-level anchor',
        },
        camera: {
          movement: 'slow_push_in',
          lens: '50mm prime',
        },
        motion: {
          entrance: 'Character-by-character spring rise with rotational dampening',
          transformation: 'Continuous subtle drift',
          exit: 'Rapid slide left with directional motion blur',
        },
        subject: 'Dominant Kinetic Headline',
        action: 'Headline ascends from below with slight rotation snap',
        performance: null,
        text: {
          content: 'PRECISION MOTION',
          hierarchy: 'headline',
          animation: 'kinetic_spring',
        },
        audio: {
          dialogue: false,
          music_beat: 'Bass drop arrives at headline apex',
          sfx: 'sub_drop',
        },
        transition: {
          type: 'slide_left',
          duration_frames: 15,
          reason: 'Accelerates momentum into Scene 02',
        },
        rhythm: {
          event: 'impact',
          notes: 'Apex of Scene 01 visual energy',
          rhythm_role: 'Kinetic acceleration and headline delivery',
        },
        complexity: 'medium',
        attention_load: 'high',
        creative_rationale: 'Rule 20 Fast Editing creates arousal; Rule 24 Typographic Motion gives physical weight to the statement',
        previous_shot_relationship: 'Direct perceptual continuation from badge introduction',
        next_shot_relationship: 'Kinetic momentum bridges the cut into 3D particle emergence',
        asset_dependencies: [],
      });
    } else if (scIdx === 1) {
      // Scene 02: 2 micro-shots (Particle emergence -> Glass card settle)
      const shot1Duration = parseFloat((sceneDurationSec * 0.5).toFixed(2));
      const shot2Duration = parseFloat((sceneDurationSec * 0.5).toFixed(2));

      sceneShots.push({
        id: 'S02_SH01',
        time: {
          start_seconds: cumulativeSeconds,
          end_seconds: cumulativeSeconds + shot1Duration,
          duration_seconds: shot1Duration,
          start_frame: Math.round(cumulativeSeconds * fps),
          end_frame: Math.round((cumulativeSeconds + shot1Duration) * fps),
        },
        script: {
          dialogue: null,
          line_ids: ['L03'],
        },
        purpose: 'escalate',
        viewer_should_notice: 'Swirling volumetric particles orbiting a frosted dimensional card emerging from depth',
        viewer_should_understand: 'Dimensional depth and advanced motion fidelity',
        viewer_should_feel: 'Sensory escalation and technical wonder',
        attention_target: 'Dimensional glass card emerging from center depth',
        secondary_target: 'Orbital particle field',
        visual: {
          description: 'Field of 3D starfield particles drifts forward. GlassCard emerges with frosted blur protecting legibility.',
          focal_point: 'Card emergence from dimensional depth',
          action: 'Card slides into frame, particles swirl in three dimensions',
        },
        framing: {
          shot_size: 'medium',
          angle: 'low',
          composition: 'Centered card with dynamic floating particles around perimeter',
        },
        camera: {
          movement: 'handheld_drift',
          lens: '24mm wide angle',
        },
        motion: {
          entrance: 'Depth push from z:-300 to z:0 with frosted refraction',
          transformation: 'Volumetric particle orbit around card perimeter',
          exit: 'Stabilizes card orientation for typographic reveal',
        },
        subject: 'Dimensional Glass Card & Particles',
        action: 'Card slides into frame, particles swirl in three dimensions',
        performance: null,
        text: null,
        audio: {
          dialogue: false,
          music_beat: 'Fast hi-hat rhythmic pattern builds tension',
          sfx: 'ambient_particles',
        },
        transition: {
          type: 'none',
        },
        rhythm: {
          event: 'accelerate',
          notes: 'Shortest scene in timeline (1.8s) for maximum pacing contrast',
          rhythm_role: 'Sensory burst and visual complexity wave peak',
        },
        complexity: 'high',
        attention_load: 'high',
        creative_rationale: 'Rule 38 Complexity Wave: High visual stimulation localized temporarily before returning to simplicity',
        previous_shot_relationship: 'Match cut on motion continuity from Scene 01 slide',
        next_shot_relationship: 'Card motion settles to provide cognitive reading window',
        asset_dependencies: ['asset_product_01'],
      });

      sceneShots.push({
        id: 'S02_SH02',
        time: {
          start_seconds: cumulativeSeconds + shot1Duration,
          end_seconds: cumulativeSeconds + sceneDurationSec,
          duration_seconds: shot2Duration,
          start_frame: Math.round((cumulativeSeconds + shot1Duration) * fps),
          end_frame: Math.round((cumulativeSeconds + sceneDurationSec) * fps),
        },
        script: {
          dialogue: null,
          line_ids: ['L04'],
        },
        purpose: 'demonstrate',
        viewer_should_notice: 'Secondary caption revealing word-by-word inside the frosted card',
        viewer_should_understand: 'The product creates motion graphics that amaze the audience',
        viewer_should_feel: 'Aesthetic satisfaction and narrative clarity',
        attention_target: 'Word reveal text inside glass card',
        secondary_target: 'Hero product graphic inside card',
        visual: {
          description: 'Secondary caption reveals word-by-word inside the card. Particle field slows into orbit.',
          focal_point: 'Text hierarchy inside glass card',
          action: 'Staggered word reveal with spring dampening',
        },
        framing: {
          shot_size: 'close_up',
          angle: 'eye_level',
          composition: 'Centered card content',
        },
        camera: {
          movement: 'static',
          lens: '50mm prime',
        },
        motion: {
          entrance: 'Staggered word reveal with spring dampening',
          transformation: 'Particle field slows into calm orbital drift',
          exit: 'Smooth dimensional cross-fade into closing payoff',
        },
        subject: 'Word Reveal Typography & Hero Graphic',
        action: 'Staggered word reveal with spring dampening',
        performance: null,
        text: {
          content: 'GRAPHICS THAT WOW',
          hierarchy: 'headline',
          animation: 'word_reveal',
        },
        audio: {
          dialogue: false,
          music_beat: 'Snare roll resolves before transition',
        },
        transition: {
          type: 'cross_fade',
          duration_frames: 15,
          reason: 'Smooth dimensional dissolve into closing payoff',
        },
        rhythm: {
          event: 'hold',
          notes: 'Brief reading window before outro',
          rhythm_role: 'Comprehension hold following fast acceleration',
        },
        complexity: 'medium',
        attention_load: 'medium',
        creative_rationale: 'Rule 21 The Hold & Rule 53 One-Breath Rule: Eye settles on headline for immediate reading comprehension',
        previous_shot_relationship: 'Stabilization of card motion from emergence',
        next_shot_relationship: 'Gentle cross-fade into final payoff hold',
        asset_dependencies: ['asset_product_01'],
      });

      // Register asset dependency
      assetReqs.push({
        id: 'asset_product_01',
        type: 'product_image',
        name: 'Hero Showcase Subject',
        priority: 2,
        required: true,
        used_in_shots: ['S02_SH01', 'S02_SH02'],
        description: 'Visual showcase subject displayed within Scene 02 dimensional card',
        visual_role: 'Primary feature showcase asset with transparent background',
      });
    } else {
      // Scene 03: Payoff & CTA hold
      sceneShots.push({
        id: 'S03_SH01',
        time: {
          start_seconds: cumulativeSeconds,
          end_seconds: cumulativeSeconds + sceneDurationSec,
          duration_seconds: sceneDurationSec,
          start_frame: Math.round(cumulativeSeconds * fps),
          end_frame: Math.round((cumulativeSeconds + sceneDurationSec) * fps),
        },
        script: {
          dialogue: null,
          line_ids: ['L05'],
        },
        purpose: 'payoff',
        viewer_should_notice: 'Prominent CTA card with continuously pulsing cyan glow button and final headline',
        viewer_should_understand: 'The video concludes with an actionable next step ready for production',
        viewer_should_feel: 'Decisive resolution, confidence, and desire to take action',
        attention_target: 'Closing Call-to-Action button and brand payoff lockup',
        secondary_target: null,
        visual: {
          description: 'Deep navy/cyan gradient background. Prominent CTA card settles with pulsing button accent and final headline.',
          focal_point: 'Action button and brand payoff lockup',
          action: 'Button scales up with bouncy spring; subtle cyan glow ring expands continuously',
        },
        framing: {
          shot_size: 'medium_close_up',
          angle: 'eye_level',
          composition: 'Rule of thirds anchor with dominant center CTA block',
        },
        camera: {
          movement: 'slow_push_in',
          lens: '50mm prime',
        },
        motion: {
          entrance: 'Bouncy spring scale-up and upward slide',
          transformation: 'Continuous radial cyan glow ring expansion',
          exit: 'Final frame hold until dissolve/loop',
        },
        subject: 'Closing Call-to-Action Card',
        action: 'Button scales up with bouncy spring; subtle cyan glow ring expands continuously',
        performance: null,
        text: {
          content: 'READY FOR PRODUCTION',
          hierarchy: 'headline',
          animation: 'fade_slide_up',
        },
        audio: {
          dialogue: false,
          music_beat: 'Full melodic resolution and sustained chord',
          sfx: 'payoff_chime',
        },
        transition: {
          type: 'none',
        },
        rhythm: {
          event: 'payoff',
          notes: 'Deliberate 3.0s visual hold for complete brand absorption',
          rhythm_role: 'Final perceptual hold and brand payoff',
        },
        complexity: 'low',
        attention_load: 'low',
        creative_rationale: 'Rule 49 & Rule 101 Final Frame: Simple, singular attention target with low complexity ensures brand memory retention',
        previous_shot_relationship: 'Cross-fade resolution from feature demonstration',
        next_shot_relationship: 'Final frame hold until loop/end',
        asset_dependencies: [],
      });
    }

    scenes.push({
      id: sceneId,
      title: sc.title || sceneId,
      purpose: scIdx === 0 ? 'Establish hook & tempo' : scIdx === 1 ? 'Escalate feature showcase' : 'Deliver final payoff & CTA',
      total_duration_seconds: sceneDurationSec,
      total_duration_frames: sceneDurationFrames,
      shots: sceneShots,
    });

    cumulativeSeconds += sceneDurationSec;
  }

  // Check script notes
  if (ctx.scriptContent && ctx.scriptContent.length > 500 && cumulativeSeconds < 5) {
    scriptNotes.push({
      id: 'SN001',
      location: 'Global Script Density',
      issue: 'Script contains substantial text for a brief timeline (< 5s). Audience will not have sufficient reading time.',
      suggestion: 'Trim secondary dialogue or extend timeline duration by at least 2.5s.',
      impact: 'Significantly improves visual comprehension and legibility.',
      requires_human_approval: true,
      status: 'open',
    });
  }

  const manifest: StoryboardManifest = {
    project: ctx.projectSlug,
    version: 'v001',
    updated_at: new Date().toISOString(),
    fps,
    total_duration_seconds: parseFloat(cumulativeSeconds.toFixed(2)),
    total_duration_frames: Math.round(cumulativeSeconds * fps),
    rhythm_template: ctx.timeline?.rhythm_template,
    creative_direction: storyDirection,
    scenes,
    ending: {
      strategy: 'Hold on interactive CTA card with continuous glow pulse',
      payoff_shot_id: 'S03_SH01',
    },
    asset_requirements: assetReqs,
    script_notes: scriptNotes,
    human_decisions: ctx.decisions,
  };

  return manifest;
}

/**
 * Audits a StoryboardManifest against the Motion Video & Ad Creative Rulebook.
 */
export function validateCreativeRulebook(manifest: StoryboardManifest): RulebookAuditResult {
  const issues: RulebookAuditIssue[] = [];
  const allShots: Shot[] = manifest.scenes.flatMap((s) => s.shots);
  const totalChecks = 7;

  // 1. Rule 1 & 2: Directed Attention (Primary target defined for every shot)
  for (const shot of allShots) {
    if (!shot.attention_target || shot.attention_target.trim().length === 0) {
      issues.push({
        rule_id: 2,
        rule_name: 'The Attention Hierarchy',
        severity: 'error',
        shot_id: shot.id,
        message: `Shot "${shot.id}" does not define an explicit primary attention target.`,
        remedy: 'Declare exactly ONE primary attention target (face, product, headline, moving object, reveal).',
      });
    }
  }

  // 2. Rule 6: Hook Rule (Never begin with generic logo screen or greeting)
  const firstShot = allShots[0];
  if (firstShot) {
    const isGenericLogo =
      (firstShot.purpose === 'brand' || firstShot.subject.toLowerCase().includes('logo')) &&
      !firstShot.visual.description.toLowerCase().includes('pop') &&
      !firstShot.visual.description.toLowerCase().includes('action');
    if (isGenericLogo) {
      issues.push({
        rule_id: 6,
        rule_name: 'The Hook Rule',
        severity: 'error',
        shot_id: firstShot.id,
        message: 'Opening shot begins with a static logo screen or generic brand intro.',
        remedy: 'Select an active hook (curiosity, contradiction, immediate result, problem, visual novelty, character, audio, text).',
      });
    }
  }

  // 3. Rule 10: Every Shot Needs a Job
  const validPurposes: ShotPurpose[] = [
    'hook', 'orient', 'introduce', 'establish', 'setup', 'question', 'misdirect',
    'explain', 'demonstrate', 'escalate', 'contrast', 'reveal', 'reaction',
    'punchline', 'payoff', 'reset', 'transition', 'brand', 'cta', 'end',
    'emotional_beat', 'visual_joke', 'product_demonstration', 'information_delivery', 'ending'
  ];
  for (const shot of allShots) {
    if (!validPurposes.includes(shot.purpose)) {
      issues.push({
        rule_id: 10,
        rule_name: 'Every Shot Needs a Job',
        severity: 'error',
        shot_id: shot.id,
        message: `Shot "${shot.id}" has invalid or missing purpose "${shot.purpose}".`,
        remedy: `Assign a valid shot purpose from the approved Rulebook list. If it has no job, delete it.`,
      });
    }
  }

  // 4. Rule 15: Rhythm Must Have Contrast (No uniform durations)
  if (allShots.length >= 3) {
    const durations = allShots.map((s) => s.time.duration_seconds);
    const allSame = durations.every((d) => Math.abs(d - durations[0]) < 0.05);
    if (allSame) {
      issues.push({
        rule_id: 15,
        rule_name: 'Rhythm Must Have Contrast',
        severity: 'error',
        message: `All shots have uniform duration (${durations[0]}s). Equal shot lengths are strictly prohibited.`,
        remedy: 'Vary durations intentionally using an approved rhythm template (e.g. [2.2s, 1.4s, 0.8s, 0.4s, 1.8s]).',
      });
    }
  }

  // 5. Rules 20 & 58: Attention Budget & Cognitive Load (No 3+ consecutive EXTREME loads)
  let consecutiveExtreme = 0;
  for (const shot of allShots) {
    if (shot.attention_load === 'extreme') {
      consecutiveExtreme++;
      if (consecutiveExtreme >= 3) {
        issues.push({
          rule_id: 58,
          rule_name: 'Attention Load Score',
          severity: 'warning',
          shot_id: shot.id,
          message: `3+ consecutive shots with EXTREME attention load detected around "${shot.id}". Risk of cognitive burnout.`,
          remedy: 'Introduce a perceptual hold, reset, or reduce simultaneous motion/typography.',
        });
      }
    } else {
      consecutiveExtreme = 0;
    }
  }

  // 6. Rule 21 & 63: The Hold & Perceptual Reset
  const hasHoldOrReset = allShots.some(
    (s) => s.rhythm?.event === 'hold' || s.rhythm?.event === 'payoff' || s.purpose === 'reset' || s.time.duration_seconds >= 2.0
  );
  if (!hasHoldOrReset) {
    issues.push({
      rule_id: 21,
      rule_name: 'The Hold',
      severity: 'warning',
      message: 'Video contains no deliberate holds or perceptual resets for cognitive comprehension.',
      remedy: 'Add at least one shot with a minimum 1.5s - 2.5s hold for reading or joke/product comprehension.',
    });
  }

  // 7. Rules 50, 98, 101: Ending & Payoff
  const lastShot = allShots[allShots.length - 1];
  if (lastShot) {
    const isPayoff =
      lastShot.purpose === 'payoff' ||
      lastShot.purpose === 'cta' ||
      lastShot.purpose === 'brand' ||
      lastShot.purpose === 'ending' ||
      lastShot.purpose === 'end';
    if (!isPayoff) {
      issues.push({
        rule_id: 50,
        rule_name: 'Ending & Payoff',
        severity: 'warning',
        shot_id: lastShot.id,
        message: `Final shot "${lastShot.id}" has purpose "${lastShot.purpose}" instead of payoff, CTA, or brand resolution.`,
        remedy: 'Ensure the final shot provides an intentional payoff, product resolution, or CTA rather than abruptly stopping.',
      });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const score = Math.max(0, 100 - errors.length * 20 - warnings.length * 5);

  return {
    passed: errors.length === 0 && score >= 90,
    score,
    total_checks: totalChecks,
    issues,
  };
}

/**
 * Saves the Storyboard and generates versioned archives + human-readable notes.
 */
export function saveStoryboard(projectDir: string, manifest: StoryboardManifest): {
  storyboardPath: string;
  notesPath: string;
  assetReqsPath: string;
  feedbackPath: string | null;
  auditPath: string;
  auditResult: RulebookAuditResult;
} {
  const plannerDir = path.join(projectDir, '03_Planner');
  const archiveDir = path.join(plannerDir, 'storyboard');

  if (!fs.existsSync(plannerDir)) fs.mkdirSync(plannerDir, { recursive: true });
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

  // 1. Validate Creative Rulebook Compliance
  const auditResult = validateCreativeRulebook(manifest);
  const auditPath = path.join(plannerDir, 'RULEBOOK_AUDIT.yaml');
  fs.writeFileSync(
    auditPath,
    YAML.stringify(
      {
        project: manifest.project,
        version: manifest.version,
        audited_at: new Date().toISOString(),
        rulebook: 'Motion Video & Ad Creative Rulebook (creative_rulebook.md)',
        passed: auditResult.passed,
        score: auditResult.score,
        total_checks: auditResult.total_checks,
        issues: auditResult.issues,
      },
      { indent: 2 }
    )
  );

  // 2. Save main STORYBOARD.yaml
  const storyboardPath = path.join(plannerDir, 'STORYBOARD.yaml');
  fs.writeFileSync(storyboardPath, YAML.stringify(manifest, { indent: 2 }));

  // 3. Save versioned archive
  const versionPath = path.join(archiveDir, `storyboard_${manifest.version}.yaml`);
  fs.writeFileSync(versionPath, YAML.stringify(manifest, { indent: 2 }));

  // 4. Save STORYBOARD_ASSET_REQUIREMENTS.yaml
  const assetReqsPath = path.join(plannerDir, 'STORYBOARD_ASSET_REQUIREMENTS.yaml');
  fs.writeFileSync(
    assetReqsPath,
    YAML.stringify({ project: manifest.project, asset_requirements: manifest.asset_requirements }, { indent: 2 })
  );

  // 5. Save SCRIPT_FEEDBACK.yaml if script notes exist
  let feedbackPath: string | null = null;
  if (manifest.script_notes.length > 0) {
    feedbackPath = path.join(plannerDir, 'SCRIPT_FEEDBACK.yaml');
    fs.writeFileSync(
      feedbackPath,
      YAML.stringify({ project: manifest.project, script_notes: manifest.script_notes }, { indent: 2 })
    );
  }

  // 6. Generate human-readable STORYBOARD_NOTES.md
  const cd = manifest.creative_direction;
  let md = `# STORYBOARD DIRECTIVE & SHOT PLAN: ${manifest.project}\n\n`;
  md += `**Version:** ${manifest.version} | **Duration:** ${manifest.total_duration_seconds}s (${manifest.total_duration_frames} frames @ ${manifest.fps}fps)\n`;
  md += `**Rhythm Template:** ${manifest.rhythm_template || 'Template B'}\n\n`;

  md += `## 📜 Creative Rulebook Compliance (creative_rulebook.md)\n\n`;
  md += `- **Audit Status:** ${auditResult.passed ? '✓ PASSED' : '⚠️ WARNINGS / ISSUES'}\n`;
  md += `- **Rulebook Score:** ${auditResult.score} / 100\n`;
  md += `- **Attention Budget & Cognitive Load:** Validated against cognitive burnout directives.\n`;
  if (auditResult.issues.length > 0) {
    md += `\n### Audit Observations:\n`;
    for (const issue of auditResult.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      md += `- ${icon} **Rule ${issue.rule_id} (${issue.rule_name})**: ${issue.message} *(Remedy: ${issue.remedy})*\n`;
    }
  }
  md += `\n`;

  md += `## 🎬 Creative Direction\n\n`;
  md += `- **Core Idea:** ${cd.core_idea}\n`;
  md += `- **Visual Language:** ${cd.visual_language}\n`;
  md += `- **Camera Language:** ${cd.camera_language}\n`;
  md += `- **Editing Language:** ${cd.editing_language}\n`;
  md += `- **Performance Language:** ${cd.performance_language}\n`;
  md += `- **Ending Strategy:** ${cd.ending_strategy}\n\n`;

  md += `## ⚖️ Major Creative Decisions & Human Checkpoints\n\n`;
  for (const dec of cd.major_creative_decisions) {
    const statusMark = dec.status === 'approved' ? '✓ [APPROVED]' : '⏳ [REQUIRES CHOICE]';
    md += `### ${dec.id}: ${dec.topic} — ${statusMark}\n`;
    md += `**Proposed Direction:** ${dec.proposed_direction}\n\n`;
    if (dec.alternatives.length > 0) {
      md += `*Viable Alternatives:*\n`;
      for (const alt of dec.alternatives) {
        md += `- ${alt}\n`;
      }
      md += `\n`;
    }
  }

  md += `## 🎞️ Shot Progression & Perceptual Experience Plan\n\n`;
  for (const sc of manifest.scenes) {
    md += `### Scene ${sc.id}: ${sc.title} (${sc.total_duration_seconds}s)\n`;
    md += `*Scene Purpose: ${sc.purpose}*\n\n`;

    for (const sh of sc.shots) {
      md += `#### 🎥 ${sh.id} [${sh.time.start_seconds}s - ${sh.time.end_seconds}s | ${sh.purpose.toUpperCase()}]\n`;
      md += `- **🎯 Primary Attention Target:** ${sh.attention_target}\n`;
      if (sh.secondary_target) {
        md += `- **🎯 Secondary Target:** ${sh.secondary_target}\n`;
      }
      md += `- **🧠 Cognitive Budget:** Attention Load: \`${sh.attention_load.toUpperCase()}\` | Visual Complexity: \`${sh.complexity}\`\n`;
      md += `- **👀 Viewer Should Notice:** ${sh.viewer_should_notice}\n`;
      md += `- **💡 Viewer Should Understand:** ${sh.viewer_should_understand}\n`;
      md += `- **❤️ Viewer Should Feel:** ${sh.viewer_should_feel}\n`;
      md += `- **Visual:** ${sh.visual.description}\n`;
      md += `- **Framing & Camera:** ${sh.framing.shot_size}, ${sh.framing.angle} | Camera: ${sh.camera.movement}${sh.camera.lens ? ` (${sh.camera.lens})` : ''}\n`;
      if (sh.motion) {
        md += `- **Motion Design:** Entrance: ${sh.motion.entrance || 'None'} | Transformation: ${sh.motion.transformation || 'None'} | Exit: ${sh.motion.exit || 'None'}\n`;
      }
      if (sh.text) {
        md += `- **Typography:** "${sh.text.content}" (${sh.text.hierarchy})\n`;
      }
      if (sh.audio) {
        const audioNotes = [sh.audio.music_beat, sh.audio.sfx].filter(Boolean).join(' | ');
        if (audioNotes) md += `- **Audio / Sound:** ${audioNotes}\n`;
      }
      if (sh.transition.type !== 'none') {
        md += `- **Transition:** ${sh.transition.type} (${sh.transition.reason || 'cut'})\n`;
      }
      md += `- **💡 Creative Rationale:** ${sh.creative_rationale}\n`;
      if (sh.asset_dependencies.length > 0) {
        md += `- **Asset Dependencies:** ${sh.asset_dependencies.join(', ')}\n`;
      }
      md += `\n`;
    }
  }

  const notesPath = path.join(plannerDir, 'STORYBOARD_NOTES.md');
  fs.writeFileSync(notesPath, md);

  return {
    storyboardPath,
    notesPath,
    assetReqsPath,
    feedbackPath,
    auditPath,
    auditResult,
  };
}

/**
 * Records an approved human decision into 03_Planner/STORYBOARD_DECISIONS.yaml
 */
export function recordHumanDecision(
  projectDir: string,
  decisionId: string,
  humanDecision: string,
  reason?: string
): CreativeDecision {
  const plannerDir = path.join(projectDir, '03_Planner');
  const decisionsPath = path.join(plannerDir, 'STORYBOARD_DECISIONS.yaml');

  let decisions: CreativeDecision[] = [];
  if (fs.existsSync(decisionsPath)) {
    try {
      const data = YAML.parse(fs.readFileSync(decisionsPath, 'utf8'));
      decisions = data.decisions || [];
    } catch {}
  }

  const newDecision: CreativeDecision = {
    id: decisionId,
    timestamp: new Date().toISOString(),
    topic: decisionId,
    human_decision: humanDecision,
    reason: reason || 'Approved during Storyboard Director review',
  };

  const existingIdx = decisions.findIndex((d) => d.id === decisionId);
  if (existingIdx >= 0) {
    decisions[existingIdx] = newDecision;
  } else {
    decisions.push(newDecision);
  }

  if (!fs.existsSync(plannerDir)) fs.mkdirSync(plannerDir, { recursive: true });
  fs.writeFileSync(decisionsPath, YAML.stringify({ project: path.basename(projectDir), decisions }, { indent: 2 }));

  return newDecision;
}
