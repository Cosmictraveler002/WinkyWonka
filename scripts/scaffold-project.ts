import fs from 'node:fs';
import path from 'node:path';

const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error('Error: Please provide a project slug/name.');
  console.log('Usage: bun scripts/scaffold-project.ts <project-slug>');
  process.exit(1);
}

const rootDir = process.cwd();
const projectDir = path.join(rootDir, 'projects', projectSlug);

if (fs.existsSync(projectDir)) {
  console.error(`Error: Project "${projectSlug}" already exists at ${projectDir}`);
  process.exit(1);
}

console.log(`🚀 Scaffolding new 5-Stage Remotion Project: ${projectSlug}...`);

// 1. Create directory hierarchy
const dirs = [
  '01_Reference/videos',
  '01_Reference/images',
  '02_Analyzer/frames',
  '03_Planner/scenes',
  '04_Assets/shared',
  '04_Assets/scene_01',
  '04_Assets/scene_02',
  '05_Code/scenes',
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
}

// 2. Write 01_Reference README
fs.writeFileSync(
  path.join(projectDir, '01_Reference', 'README.md'),
  `# 01_Reference: ${projectSlug}

Place your reference media here before triggering the AI Analyzer:
- \`videos/\`: Drop reference MP4 / MOV motion graphic clips.
- \`images/\`: Drop screenshots, moodboards, brand guidelines, or color palettes.
`
);

// 3. Write 02_Analyzer templates
fs.writeFileSync(
  path.join(projectDir, '02_Analyzer', 'macro_aesthetic.md'),
  `# Stage 1: Macro Aesthetic & Motion Deconstruction Report
**Project:** ${projectSlug}  
**Date:** ${new Date().toISOString().split('T')[0]}  

## 1. Visual Identity & Mood
- **Color Temperature & Palette:** 
- **Lighting & Atmosphere:** 
- **Typography Tone:** 

## 2. Motion Rhythm & Dynamics
- **Pacing & Speed:** 
- **Easing Curves (Spring vs Linear):** 
- **Camera Movement & Parallax:** 

## 3. Recurring Visual Components
- Badges / Callouts:
- Glass / Card Surfaces:
- Shaders / Particle FX:
`
);

fs.writeFileSync(
  path.join(projectDir, '02_Analyzer', 'refined_analysis.yaml'),
  `project: "${projectSlug}"
version: 1.0.0
fps: 30
resolution:
  width: 1920
  height: 1080
scenes:
  - id: "scene_01"
    start_frame: 0
    duration_frames: 90
    cut_type: "hard_cut"
    keyframe_snapshots:
      - "frames/frame_0015.jpg"
      - "frames/frame_0045.jpg"
    visual_motifs:
      - "Kinetic typography zoom"
      - "Atmospheric gradient glow"
    transitions:
      exit: "slideLeft"
`
);

// 4. Write 03_Planner templates
fs.writeFileSync(
  path.join(projectDir, '03_Planner', 'core_aesthetic.yaml'),
  `project: "${projectSlug}"
aesthetic:
  theme: "dark_cyber_minimal"
  colors:
    background: "#080c14"
    primary: "#6366f1"
    secondary: "#ec4899"
    accent: "#06b6d4"
    text_primary: "#f8fafc"
    text_secondary: "#94a3b8"
    card_bg: "rgba(255, 255, 255, 0.04)"
    card_border: "rgba(255, 255, 255, 0.12)"
  typography:
    heading_font: "Inter, system-ui, sans-serif"
    body_font: "Inter, system-ui, sans-serif"
    weight_bold: 800
    weight_medium: 500
  motion:
    default_spring: "snappy"
    exit_transition_frames: 20
`
);

fs.writeFileSync(
  path.join(projectDir, '03_Planner', 'timeline.yaml'),
  `project: "${projectSlug}"
fps: 30
width: 1920
height: 1080
total_duration_in_frames: 180
scenes:
  - id: "scene_01"
    title: "Kinetic Intro"
    file: "scenes/scene_01.yaml"
    duration_in_frames: 90
    transition_to_next: "slideLeft"
  - id: "scene_02"
    title: "Feature Highlight"
    file: "scenes/scene_02.yaml"
    duration_in_frames: 90
    transition_to_next: "crossFade"
`
);

fs.writeFileSync(
  path.join(projectDir, '03_Planner', 'scenes', 'scene_01.yaml'),
  `scene_id: "scene_01"
title: "Kinetic Intro"
duration_in_frames: 90
layers:
  - type: "shader_background"
    component: "GradientMesh"
    params:
      primaryColor: "#6366f1"
      secondaryColor: "#ec4899"
  - type: "badge"
    component: "GlowBadge"
    delay: 10
    label: "NEXT-GEN HARNESS"
  - type: "kinetic_title"
    component: "KineticText"
    delay: 20
    text: "REMOTION WORKFLOW"
`
);

fs.writeFileSync(
  path.join(projectDir, '03_Planner', 'scenes', 'scene_02.yaml'),
  `scene_id: "scene_02"
title: "Feature Highlight"
duration_in_frames: 90
layers:
  - type: "shader_background"
    component: "ParticleField"
    params:
      color: "#a5b4fc"
      count: 200
  - type: "card"
    component: "GlassCard"
    delay: 10
    title: "PRECISION MOTION"
    description: "Built with AI Orchestration and Remotion Spring Physics"
`
);

// 5. Write 05_Code templates
fs.writeFileSync(
  path.join(projectDir, '05_Code', 'scenes', 'Scene01.tsx'),
  `import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GradientMesh, GlowBadge, KineticText } from '@/shared';

export const Scene01: React.FC = () => {
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <GradientMesh />
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <GlowBadge label="NEXT-GEN HARNESS" delay={10} />
        <KineticText text="REMOTION WORKFLOW" delay={20} fontSize="5.5rem" />
      </div>
    </AbsoluteFill>
  );
};
`
);

fs.writeFileSync(
  path.join(projectDir, '05_Code', 'scenes', 'Scene02.tsx'),
  `import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ParticleField, GlassCard, KineticText } from '@/shared';

export const Scene02: React.FC = () => {
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ParticleField />
      <GlassCard delay={10} width={720}>
        <KineticText text="PRECISION MOTION" delay={15} fontSize="3rem" />
        <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '1.4rem', lineHeight: 1.6 }}>
          Declarative React components evaluated at 60fps with spring physics.
        </p>
      </GlassCard>
    </AbsoluteFill>
  );
};
`
);

fs.writeFileSync(
  path.join(projectDir, '05_Code', 'Composition.tsx'),
  `import React from 'react';
import { TransitionSeries, Transitions } from '@/shared/transitions';
import { Scene01 } from './scenes/Scene01';
import { Scene02 } from './scenes/Scene02';

export const ProjectComposition: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene01 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...Transitions.slideLeft(20)} />
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene02 />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
`
);

// Initialize Phase & Progress Tracker
const { spawnSync } = await import('node:child_process');
spawnSync(process.execPath, ['scripts/phase-tracker.ts', 'sync', projectSlug], {
  stdio: 'inherit',
  cwd: rootDir,
});

console.log(`✅ Successfully scaffolded project "${projectSlug}" at: projects/${projectSlug}`);
