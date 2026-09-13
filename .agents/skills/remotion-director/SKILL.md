---
name: remotion-director
description: AI Motion Director and Orchestration Harness for high-end Remotion video production. Handles reference video/image deconstruction, frame snapshot refinement, YAML scene storytelling, asset preparation, declarative Remotion React code generation, and automated Critic Agent contact sheet auditing.
---

# Remotion Motion Director Skill

This skill governs your role as the **AI Motion Graphics Orchestrator & Director** within the Remotion Motion Harness. Follow this exact protocol to transform raw reference media into high-aesthetic, frame-accurate Remotion animations using parameterized primitives, audio-first temporal skeleton framing, and the Critic Agent feedback loop.

---

## 🚫 Mandatory Directive: AVOID AI-SLOP AESTHETICS (See AGENTS.md)
You MUST strictly follow the directives in [AGENTS.md](file:///c:/Users/PC/myapps/Remotion/AGENTS.md):
- **Never** make the design look like a generic AI-generated startup, SaaS brand, or tech company.
- **Avoid**: Generic purple/blue/cyan gradients, glowing blobs, floating 3D spheres/nodes, neural-net or brain imagery, circuitry traces, robot heads, generic sparkles/particles, glassmorphism as a default crutch, fake HUD/terminal decoration, and predictable startup-logo symbolism.
- **The result must feel authored rather than generated**: Specific, intentional, culturally grounded, slightly imperfect where appropriate, with an original typographic or structural idea that works in one solid color. Every element must have a clear reason to exist.

---

## The Audio-First Project Architecture

Each video project lives inside `projects/<project-slug>/` with the following hierarchy:

```
projects/<project-slug>/
├── 00_Audio/                # Foundational soundtrack & beat map (before scripting)
│   ├── soundtrack.wav       # Selected or extracted audio track
│   ├── analysis.yaml        # BPM, transients, spectral, energy profile
│   └── temporal_skeleton.yaml # Cut windows, phrase boundaries, hold zones, energy curve
├── 01_Reference/            # Raw reference video (.mp4, .mov) and moodboard images
├── 02_Deconstruction/       # Scene snapshots, TEMPORAL & VISUAL analysis, DECONSTRUCTION.yaml
├── 03_Planner/              # SCRIPT_INTAKE.yaml, SCRIPT.md, SCRIPT_AUDIT.yaml, STORYBOARD.yaml
├── 04_Assets/               # Co-designed media assets, ASSET_MANIFEST.yaml
└── 05_Code/                 # Composition.tsx, scenes/Scene01.tsx, Scene02.tsx...
```

---

## 🎨 Parameterized Motion Primitives Library

Always build scenes using the parameterized motion primitives from `@/shared`. Never hardcode static CSS widgets.

| Primitive | Props & Config | Description |
| :--- | :--- | :--- |
| **`<Headline />`** | `text`, `delay`, `animation ('slideUp'\|'fade'\|'scale'\|'tracking')`, `fontSize`, `fontWeight`, `gradient`, `color`, `letterSpacing`, `springConfig` | Kinetic primary title with spring physics |
| **`<Caption />`** | `text`, `delay`, `fontSize`, `color`, `maxWidth`, `lineHeight`, `springConfig` | Secondary subtitles and supporting narrative copy |
| **`<WordReveal />`** | `text`, `delay`, `stagger`, `animation ('rise'\|'pop'\|'rotate')`, `gradient`, `springConfig` | Word-by-word kinetic text reveals |
| **`<ImageReveal />`** | `src`, `delay`, `revealType ('wipe-left'\|'wipe-right'\|'zoom-in'\|'blur-in'\|'curtain')`, `borderRadius`, `aspectRatio` | Commercial-grade image/video container reveal |
| **`<MaskReveal />`** | `children`, `delay`, `maskType ('circle'\|'split-vertical'\|'split-horizontal'\|'diagonal'\|'iris')`, `durationInFrames` | Geometric clip-path mask reveal for any layout |
| **`<CameraShake />`**| `children`, `startFrame`, `durationInFrames`, `intensity ('subtle'\|'medium'\|'heavy'\|number)`, `decay` | Organic harmonic sine camera vibration |
| **`<Zoom />`** | `children`, `fromScale`, `toScale`, `fromOrigin`, `delay`, `durationInFrames`, `easing` | Cinematic push-in and pull-out camera movement |
| **`<Noise />`** | `opacity`, `blendMode`, `baseFrequency`, `numOctaves` | Tactile procedural SVG fractal noise overlay |
| **`<FilmGrain />`** | `intensity`, `speed`, `blendMode` | Cinema-grade shifting film grain emulation |
| **`<GradientBackground />`** | `stops`, `type ('linear'\|'radial'\|'mesh')`, `angle`, `animated`, `speed` | Token-driven animated backdrop |
| **`<LogoLockup />`** | `logoUrl`, `logoNode`, `title`, `badge`, `delay`, `layout ('horizontal'\|'vertical')` | Brand identity header with staggered spring entry |
| **`<CTA />`** | `title`, `subtitle`, `buttonText`, `buttonIcon`, `delay`, `glowColor`, `accentColor` | Closing call-to-action card with breathing glow |

---

## 🔄 The Feedback Loop Architecture

```
              ┌───────────────────────────┐
              │ 00_Audio TEMPORAL SKELETON│
              │ (Beat grid & cut windows) │
              └─────────────┬─────────────┘
                            ↓
              ┌───────────────────────────┐
              │ 02_Deconstruction YAML    │
              │ (Motion DNA & visual cues)│
              └─────────────┬─────────────┘
                            ↓
              ┌───────────────────────────┐
              │ SCRIPT.md & STORYBOARD    │
              │ (Locked with user in chat)│
              └─────────────┬─────────────┘
                            ↓
              ┌───────────────────────────┐
              │ BUILDER AGENT             │
              │ (Remotion TSX primitives) │
              └─────────────┬─────────────┘
                            ↓
              ┌───────────────────────────┐
              │ IN-CHAT REFINEMENT LOOP   │
              │ (Draft MP4 & keyframes)   │
              └─────────────┬─────────────┘
                            ↓
              ┌───────────────────────────┐
              │ CRITIC AGENT VISION AUDIT │
              │ (Contact sheets & score)  │
              └─────────────┬─────────────┘
                            ↓
              ┌───────────────────────────┐
              │ STUDIO PREVIEW & APPROVAL │
              └─────────────┬─────────────┘
                            ↓
                     FINAL MP4 RENDER
```

---

## 📊 Universal Phase & Progress Tracking Protocol

Every video project maintains an automated, self-synchronizing `PHASE_TRACKER.yaml` and `PROGRESS.md` covering all 14 lifecycle phases:

```powershell
# View live visual ASCII progress bar & phase table
& "C:\Users\PC\.bun\bin\bun.exe" run progress <project-slug>

# Full breakdown of deliverables and weights
& "C:\Users\PC\.bun\bin\bun.exe" run phase:status <project-slug>

# Resync phase tracker from project artifacts
& "C:\Users\PC\.bun\bin\bun.exe" run phase:sync <project-slug>

# Sign off a human gate (e.g. Phase 3.7 or Phase 8.0)
& "C:\Users\PC\.bun\bin\bun.exe" run phase:approve <project-slug> <phaseNumber>
```

---

## Step-by-Step Orchestration Protocol

### Phase 1: Reference Deconstruction

#### Phase 1A: Temporal Deconstruction
1. Watch the reference video in `01_Reference/video/` using multimodal understanding.
2. Analyze total duration, cut points, pacing, intention, hook type, and global rhythm template.
3. Write `02_Deconstruction/TEMPORAL_ANALYSIS.yaml`.

#### Phase 1B: Visual Deconstruction (Scene Snapshots)
1. Extract entry, apex, and exit snapshots for each detected scene:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run deconstruct:frames <project-slug> scene_deconstruct
   ```
2. Inspect the resulting frames (`scene_XX_entry.jpg`, `scene_XX_apex.jpg`, `scene_XX_exit.jpg`) using `view_file`.
3. Dissect:
   - Animation techniques (easing curves, entrance paths, velocity).
   - Camera movements (pan, tilt, zoom velocity, orbital origin).
   - Transition mechanics (wipes, cuts, morphs, mask reveals).
   - Depth layers (background texture, midground elements, foreground focus).
   - SFX & atmosphere (grain, vignette, procedural noise, chromatic aberration).
   - Micro-motion (ambient particle drift, badge breathing, kinetic accent trails).
   - Color palette & typographic hierarchy.
4. Save `02_Deconstruction/VISUAL_ANALYSIS.yaml` and merge into `02_Deconstruction/DECONSTRUCTION.yaml`.

#### Phase 1C: Audio Foundation
1. Ask the user in chat whether they have a soundtrack, or if they want the agent to analyze the reference video audio and search the web for an open-source royalty-free match.
2. If searching: analyze reference audio with `bun run audio:analyze <project-slug>`, search Pixabay/Free Music Archive/Mixkit for adjacent tracks matching BPM and mood, present 2–3 options with links, and let user pick.
3. Generate the temporal beat skeleton:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run audio:skeleton <project-slug>
   ```
   Outputs `00_Audio/temporal_skeleton.yaml` with beat grid, phrase boundaries, cut windows, and hold zones.

---

### Phase 2: Script & Creative Development

1. **Conduct Structured User Intake**:
   Present the intake questionnaire in chat (format, audience, emotional goal, primary CTA, core message, duration, brand elements, restrictions).
   Save answers to `03_Planner/SCRIPT_INTAKE.yaml`.
2. **Draft Audio-Locked Script**:
   Draft `03_Planner/SCRIPT.md` with timestamps locked to `temporal_skeleton.yaml` phrase boundaries and strong cut windows.

---

### Phase 2.5: Script & Rhythm Audit

1. Audit `SCRIPT.md` against:
   - `rhythm_system.md` templates (ensure shot duration non-uniformity).
   - `temporal_skeleton.yaml` beat grid (verify cuts land on strong cut windows).
   - `creative_rulebook.md` (active hook, cognitive load balance, hold zones for comprehension).
   - Anti-AI-copy principles (flag clichés like "experience the future").
2. Write `03_Planner/SCRIPT_AUDIT.yaml`.
3. Present audit findings to user and refine script in chat.

---

### Phase 3: Asset Planning & Tech Stack

1. **Map Asset Dependencies**:
   Distinguish Remotion procedural elements from external source media:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run assets:map <project-slug>
   ```
   Outputs `03_Planner/STORYBOARD_ASSET_REQUIREMENTS.yaml`.
2. **Map Tech Stack**:
   Write `03_Planner/TECH_STACK_MAP.yaml` detailing per-scene Remotion primitives, 3D needs, and custom shaders.

---

### Phase 3.5: Interactive Asset Co-Design

1. **Palette First**: Present extracted palette from `DECONSTRUCTION.yaml` for user confirmation or brand adjustment.
2. **Hero Scene First**: Co-design the primary showcase visual asset before secondary items.
3. **One-by-One Chat Acquisition**:
   Surface each required asset using `bun run assets:next <project-slug>`.
   Support user provide (path/upload) or generate (`generate_image`).
   Validate and register into `04_Assets/ASSET_MANIFEST.yaml`.
   (Batch escape supported if user requests autonomous generation.)

---

### Phase 3.7: Storyboard Lock (Human Gate)

1. Rebuild `03_Planner/STORYBOARD.yaml` with concrete assets, confirmed palette, audited script, and audio beat alignment:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run storyboard:build <project-slug>
   ```
2. **MANDATORY HUMAN GATE**: Present locked storyboard to the user for explicit approval before proceeding to Remotion React code build.

---

### Phase 4: Declarative Remotion Code Generation (Builder Agent)

1. Write modular scene components in `05_Code/scenes/Scene01.tsx`, `Scene02.tsx`, etc., using the Parameterized Primitives (`<Headline />`, `<Caption />`, `<ImageReveal />`, `<GradientBackground />`, `<CTA />`).
2. Compose in `05_Code/Composition.tsx` using `TransitionSeries`.
3. Register in `src/Root.tsx`.

---

### Phase 5: AI-Optimized Contact Sheet Generation

1. Generate contact sheets:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run contact:sheets <project-slug> storyboard
   ```
2. Mounts 32px high-contrast monospace metadata strip underneath each thumbnail (preserving 16:9 ratio).

---

### Phase 6: Visual Refinement Loop

1. **Render Draft MP4 & Keyframe Stills (Single-pass sequence 25x–30x speedup)**:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run refine:render <project-slug> --fast-still-only
   ```
2. **In-Chat Multimodal Inspection**:
   Inspect entry, apex, settled, and exit keyframes using `view_file`.
   Verify typography legibility, color palette harmony, spring settling, and CTA prominence.
3. **Apply Surgical Patches**:
   Edit `05_Code/scenes/SceneXX.tsx` and re-render (up to 5 iterations).
4. **Log Report**:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run refine:report <project-slug> --verdict=converged --score=98 --notes="All visual objectives verified"
   ```

---

### Phase 7: Critic Agent Audit & Patch Loop

1. Run Critic Agent audit:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run critic:audit <project-slug>
   ```
2. Inspects hierarchy, timing, rhythm contrast, AI-slop avoidance, and CTA payoff. Emits `critique.md` and `critique.json`.
3. Apply surgical patches if score $< 90$ (max 3 autonomous iterations).

---

### Phase 8: Interactive Studio Review & Mandatory User Approval

1. Launch Remotion Studio:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run dev
   ```
2. Preview at `http://localhost:3000`.
3. **MANDATORY DIRECTIVE**: Await explicit user confirmation before full render!

---

### Phase 9: Production Video Export

1. Upon explicit user approval:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run remotion render src/index.ts <CompositionId> out/<project-slug>.mp4
   ```
