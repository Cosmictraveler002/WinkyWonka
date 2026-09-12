---
name: remotion-director
description: AI Motion Director and Orchestration Harness for high-end Remotion video production. Handles reference video/image deconstruction, frame snapshot refinement, YAML scene storytelling, asset preparation, declarative Remotion React code generation, and automated Critic Agent contact sheet auditing.
---

# Remotion Motion Director Skill

This skill governs your role as the **AI Motion Graphics Orchestrator & Director** within the Remotion Motion Harness. Follow this exact protocol to transform raw reference media into high-aesthetic, frame-accurate Remotion animations using parameterized primitives and the Critic Agent feedback loop.

---

## 🚫 Mandatory Directive: AVOID AI-SLOP AESTHETICS (See AGENTS.md)
You MUST strictly follow the directives in [AGENTS.md](file:///c:/Users/PC/myapps/Remotion/AGENTS.md):
- **Never** make the design look like a generic AI-generated startup, SaaS brand, or tech company.
- **Avoid**: Generic purple/blue/cyan gradients, glowing blobs, floating 3D spheres/nodes, neural-net or brain imagery, circuitry traces, robot heads, generic sparkles/particles, glassmorphism as a default crutch, fake HUD/terminal decoration, and predictable startup-logo symbolism.
- **The result must feel authored rather than generated**: Specific, intentional, culturally grounded, slightly imperfect where appropriate, with an original typographic or structural idea that works in one solid color. Every element must have a clear reason to exist.

---

## The 5-Stage Project Architecture

Each video project lives inside `projects/<project-slug>/` with the following rigid hierarchy:

```
projects/<project-slug>/
├── 01_Reference/            # Raw reference video (.mp4, .mov) and moodboard images
├── 02_Analyzer/             # Pass 1 Macro report + contact_sheet/ + critique.md + critique.json
├── 03_Planner/              # core_aesthetic.yaml + timeline.yaml + scenes/scene_XX.yaml
├── 04_Assets/               # shared/ (fonts, textures) + scene_XX/ (scene-specific images/SVGs)
└── 05_Code/                 # Composition.tsx + scenes/Scene01.tsx, Scene02.tsx...
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
              ┌──────────────┐
              │ CREATIVE     │
              │ SPEC (YAML)  │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │ BUILDER      │
              │ AGENT        │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │ CONTACT      │
              │ SHEET (HTML) │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │ CRITIC       │
              │ AGENT        │
              └──────┬───────┘
                     ↓
               PATCH REQUEST
                     ↓
              ┌──────────────┐
              │ REMOTION     │
              │ STUDIO       │
              └──────┬───────┘
                     ↓
               USER APPROVAL
                     ↓
              FINAL MP4 RENDER
```

---

## Step-by-Step Orchestration Protocol

### Phase 1: Ingestion & Multimodal Macro Analysis
1. Inspect reference files in `01_Reference/videos` and `01_Reference/images`.
2. Produce `02_Analyzer/macro_aesthetic.md` detailing visual tone, motion physics, and component palette.

### Phase 2: Frame Snapshot Extraction
1. Run snapshot extraction:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" scripts/extract-frames.ts <project-slug> [video-file] interval
   ```
2. Inspect frames and write `02_Analyzer/refined_analysis.yaml`.

### Phase 3: Storyboard Director Layer (Creative Planning & Shot Director)
The agent acts as the **Storyboard Director** (commercial director / storyboard artist / editor) and **MUST STRICTLY FOLLOW** the **Motion Video & Ad Creative Rulebook** ([creative_rulebook.md](file:///c:/Users/PC/myapps/Remotion/creative_rulebook.md)):
1. **Checkpoint 1 (Story Direction)**:
   - Formulate core visual idea, visual language, camera language, editing language, performance language, and ending strategy:
     ```powershell
     & "C:\Users\PC\.bun\bin\bun.exe" run storyboard:direction <project-slug>
     ```
   - Present major creative decisions (e.g. `D001`, `D002`) to the Human Director with viable alternatives.
   - Record approved decisions:
     ```powershell
     & "C:\Users\PC\.bun\bin\bun.exe" scripts/storyboard-director.ts decide <project-slug> <decision-id> "<choice>"
     ```
2. **Checkpoint 2 (Shot-by-Shot Storyboard & Perceptual Plan)**:
   - Compile atomic shots adhering to Section 57 Shot Card Schema with stable IDs (`S01_SH01`), explicit primary `attention_target` (Rule 2), `viewer_should_notice`, `viewer_should_understand`, `viewer_should_feel`, cognitive budget `attention_load` (`low` | `medium` | `high` | `extreme`), timing, framing, camera motion, typography, and audio relations:
     ```powershell
     & "C:\Users\PC\.bun\bin\bun.exe" run storyboard:build <project-slug>
     ```
   - Enforces the **105 Creative Rulebook Principles**: Active hooks (no static logos), valid shot purposes (delete purposeless shots), cognitive load wave (no $\ge 3$ consecutive extreme loads), and holds for comprehension.
   - Outputs: `03_Planner/STORYBOARD.yaml`, `03_Planner/RULEBOOK_AUDIT.yaml`, and human-readable `03_Planner/STORYBOARD_NOTES.md`.
   - If script issues or timing bottlenecks are discovered, emit a formal `SCRIPT_NOTE` in `03_Planner/SCRIPT_FEEDBACK.yaml` for the Script Writer. Never silently rewrite the script!
3. **Checkpoint 3 (Production Readiness)**:
   - Storyboard asset dependencies are automatically compiled into `03_Planner/STORYBOARD_ASSET_REQUIREMENTS.yaml` to feed Phase 4 Asset Acquisition.

### Phase 4: Asset Acquisition Layer (Agent as Conversational Asset Coordinator)
The agent acts as the **Asset Producer & Coordinator** directly in the chat:
1. **Map Internal Asset Requirements**:
   - Run requirements mapping to separate procedural Remotion code from external source media:
     ```powershell
     & "C:\Users\PC\.bun\bin\bun.exe" run assets:map <project-slug>
     ```
2. **Execute the One-Asset-At-A-Time Chat Loop**:
   - The agent surfaces the next unresolved asset directly in chat using the exact single-asset template:
     ```text
     Asset 01 of N — [Asset Name]
     Reference usage: ...
     Role: ...
     I need: ...
     Choose:
     [Provide asset] -> Path to your local file
     [Generate asset] -> Generate high-fidelity asset via generation spec
     ```
3. **Conversational Inference & Autonomous File Routing**:
   - **User Provides Asset**: The user pastes a file path or uploads a media file. The agent infers the path, validates it (`validateImageAsset`), moves/copies the file to `projects/<slug>/04_Assets/<scene>/<asset_id>.<ext>` and `public/projects/<slug>/<asset_id>.<ext>`, and registers it into `ASSET_MANIFEST.yaml` and `VIDEO_SPEC.yaml`.
   - **User Chooses Generate**: The user says "generate", "Option B", or describes what they want. The agent derives the structured `GenerationSpec`, invokes `generate_image`, validates the resulting artifact, moves/copies it to the designated directories (`04_Assets` and `public/`), and registers it into `ASSET_MANIFEST.yaml` and `VIDEO_SPEC.yaml`.
   - **Validation Rejection**: If the image fails technical checks (opaque when alpha required, low resolution), explain the issue clearly and ask for replacement or regeneration of THAT SAME ASSET.
4. **Seamless Workflow Continuation**:
   - Once the current asset is registered, immediately query for the next unresolved asset.
   - When all required assets are approved (`bun run assets:status <project-slug>` returns `READY`), the agent automatically transitions into **Phase 5: Declarative Remotion Scene Construction**. Do not stop or ask the user for permission to move files—route them automatically!

### Phase 5: Declarative Remotion Code Generation (Builder Agent)
1. Write modular scene components in `05_Code/scenes/Scene01.tsx`, `Scene02.tsx`, etc., using the Parameterized Primitives (`<Headline />`, `<Caption />`, `<ImageReveal />`, `<GradientBackground />`, `<CTA />`).
2. Compose in `05_Code/Composition.tsx` using `TransitionSeries`.
3. Register in `src/Root.tsx`.

### Phase 6: AI-Optimized Contact Sheet Generation (Vision Inspection Artifact)
1. Generate machine-readable contact sheets and manifests before rendering video:
   ```powershell
   # Storyboard Mode (sparse structural keyframes: entry, apex, settled, exit)
   & "C:\Users\PC\.bun\bin\bun.exe" run contact:sheets <project-slug> storyboard

   # Motion Mode (dense sequential inspection for motion cadence and continuity)
   & "C:\Users\PC\.bun\bin\bun.exe" run contact:sheets <project-slug> motion
   ```
2. The generator extracts keyframes, mounts a 32px high-contrast monospace metadata strip (`023 | 00:04.21 | scene_03 | shot_01`) *underneath* each thumbnail (preserving the full 16:9 frame without overlay clutter), composites multi-sheet grids (`contact_001.jpg`, `contact_002.jpg`), and outputs `contact-sheet-manifest.json` in `02_Analyzer/contact_sheets_<mode>/`.

### Phase 7: Critic Agent Audit & Patch Request Loop
1. Run the Critic Agent audit:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run critic:audit <project-slug>
   ```
2. The Critic evaluates hierarchy, contrast, timing, motion, CTA payoff, and audits the visual contact sheet manifests:
   - Verifies keyframe coverage for all scenes against `timeline.yaml`.
   - Emits human-readable `02_Analyzer/critique.md` (with `✓`, `△`, `✗` status marks and visual contact sheet links).
   - Emits machine-readable `02_Analyzer/critique.json` referencing inspected manifests and sheets.
3. If issues are identified, the Builder Agent issues surgical patch edits to `SceneXX.tsx`.

### Phase 8: Interactive Studio Review & User Approval
1. Launch Remotion Studio for user inspection:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run dev
   ```
2. User inspects the timeline at `http://localhost:3000` and reviews the contact sheet.
3. **MANDATORY**: Await user permission before initiating the full video render!
4. On User Approval, execute the final render:
   ```powershell
   & "C:\Users\PC\.bun\bin\bun.exe" run remotion render src/index.ts <CompositionId> out/<output-name>.mp4
   ```
