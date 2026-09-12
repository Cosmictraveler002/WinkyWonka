<div align="center">

# 🎬 Remotion Motion Graphics & Audio Pipeline Harness

**Autonomous, high-precision programmatic video production powered by Remotion, Bun, and AI Motion Direction.**

[![Remotion](https://img.shields.io/badge/Remotion-v4.0.260-blue?logo=react&style=flat-square)](https://remotion.dev)
[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun&style=flat-square)](https://bun.sh)
[![Language](https://img.shields.io/badge/Language-TypeScript%205-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/3D-Three.js%20%2F%20R3F-black?logo=three.js&style=flat-square)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

<p align="center">
  <a href="#-architecture">Architecture</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-6-step-audio-pipeline">Audio Pipeline</a> •
  <a href="#-full-pipeline-orchestrator">Pipeline Orchestrator</a> •
  <a href="#-core-motion-system">Motion System</a>
</p>

</div>

---

## 🌟 Overview

The **Remotion Motion Graphics Harness** is an enterprise-grade framework for orchestrating declarative React motion graphics videos with synchronized, frame-accurate audio. It combines:

1. **Declarative 60fps Visual Motion**: Spring physics, kinetic typography, 3D Canvas integration, and seamless scene transitions.
2. **Deterministic 6-Step Audio Pipeline**: From raw reference video extraction and transient/BPM analysis to segment remixing, Schroeder stereo reverb, dynamic compression, and automated QA verification.
3. **Automated Vision & Rhythm Critic**: Automated contact-sheet generation and perceptual audit against creative rulebooks and temporal rhythm templates.

---

## 🏗️ Architecture

Projects follow a structured, 5-stage lifecycle with isolated artifacts and code:

```
projects/<project-slug>/
├── 01_Reference/
│   ├── videos/              # Raw MP4/MOV motion graphic references
│   └── images/              # Moodboards, visual references, screenshots
├── 02_Analyzer/
│   ├── audio/               # Clean extracted PCM (ref_audio.wav), analysis.yaml, SVG charts
│   ├── frames/              # Frame snapshots extracted at key intervals
│   ├── contact_sheets_*/    # Storyboard & motion frame grid audits
│   └── critique.json        # Critic Agent audit scores & feedback
├── 03_Planner/
│   ├── core_aesthetic.yaml  # Design tokens: palette, typography, springs
│   ├── timeline.yaml        # Cut grid, shot durations, and rhythm templates
│   ├── audio_map.yaml       # Human-editable audio segment mapping
│   └── scenes/              # Atomic scene specifications (YAML)
├── 04_Assets/
│   ├── audio/               # soundtrack_raw.wav & final mastered soundtrack.wav
│   ├── shared/              # Project-wide logos, vectors, and textures
│   └── scene_*/             # Scene-specific visual assets
└── 05_Code/
    ├── Composition.tsx      # Master timeline combining scenes via TransitionSeries
    └── scenes/              # Modular React TSX scene components
```

---

## ✨ Features

- **⚡ Blazing Fast Runtime**: Powered by **[Bun](https://bun.sh)** for instant script execution and sub-second DSP processing.
- **🎵 Built-in 6-Stage Audio Engineering Pipeline**:
  - Pure PCM WAV parser with arbitrary chunk traversal (LIST, INFO, BEXT bypass).
  - High-res energy envelope, BPM detection, and transient onset categorization.
  - Beat-aligned creative remixing and sub-bass synthesis (D1 36.71Hz).
  - Broadcast-grade mastering chain: stereo Schroeder reverberator, 3:1 compressor, 5Hz DC filter, and soft limiter.
  - Automated verification: exact duration matching, dynamic range audit, silence dropout detection, and dark-mode SVG energy charts.
- **🎯 Non-Linear Motion Rhythm System**: Strict adherence to rhythm curves (Accelerations, Burst-Hold-Burst, 3:2:1 templates) avoiding robotic, uniform cuts.
- **🛡️ Anti-AI Slop Directive**: Engineered to produce authored, distinctive design rather than generic purple/cyan startup templates or floating geometric cliches.
- **🖼️ Contact Sheet Verification**: Automated sparse and dense frame captures for visual regression testing and critic evaluation.

---

## 🚀 Quick Start

### Prerequisites

- **[Bun](https://bun.sh)** (recommended) or **Node.js 18+**
- **[FFmpeg](https://ffmpeg.org)** (accessible via system `PATH` for video audio extraction)
- *Optional Python environment* for companion analysis scripts:
  ```bash
  pip install -r requirements.txt
  ```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/remotion-motion-harness.git
cd remotion-motion-harness

# Install Node/Remotion dependencies
bun install
```

### 1. Launch Remotion Studio (Preview Player)

```bash
bun run dev
```
Open **`http://localhost:3000`** to scrub through the timeline, inspect component trees, and live-reload edits.

### 2. Scaffold a New Project

```bash
bun run project:new my-campaign
```
Scaffolds the 5-stage folder tree, base aesthetic tokens, and scene templates.

---

## 🎵 6-Step Audio Pipeline

The harness includes a standalone, deterministic audio engine located in `scripts/audio/`:

```bash
# Run the complete end-to-end audio pipeline (~1.5s):
bun run audio:pipeline <project-slug>
```

Or run each inspectable stage independently:

| Step | Command | Description | Output Artifact |
|:---|:---|:---|:---|
| **1. Extract** | `bun run audio:extract <slug>` | Traverses RIFF chunks; extracts clean 48kHz stereo PCM | `02_Analyzer/audio/ref_audio.wav` |
| **2. Analyze** | `bun run audio:analyze <slug>` | Computes BPM, transients, 100ms energy bins, key (`C#m`), and bands | `02_Analyzer/audio/analysis.yaml` |
| **3. Map** | `bun run audio:map <slug> [--force]` | Generates human-editable timeline segment mapping | `03_Planner/audio_map.yaml` |
| **4. Compose** | `bun run audio:compose <slug>` | Assembles segments with 15ms cosine crossfades & sub-bass | `04_Assets/audio/soundtrack_raw.wav` |
| **5. Master** | `bun run audio:master <slug>` | Schroeder reverb, dynamic compression, DC removal & soft limiter | `04_Assets/audio/soundtrack.wav` |
| **6. Verify** | `bun run audio:verify <slug>` | Audits duration, peaks, silence; renders SVG energy chart | `02_Analyzer/audio/energy_chart.svg` |

> [!TIP]
> The `03_Planner/audio_map.yaml` is designed to be **human-editable**. You can tweak gains, remap source hits, or adjust compression ratios before composing.

---

## ⚡ Full Pipeline Orchestrator

Run the complete multi-stage automated build and audit pipeline:

```bash
bun run pipeline:run <project-slug>
```

This sequentially executes:
1. `[1/5] 📦 Synchronize assets`: Copies project assets to Remotion's public folder.
2. `[2/5] 🎵 Audio Pipeline`: Runs the full 6-stage audio extraction, composition, and mastering chain.
3. `[3/5] 🖼️  Storyboard Contact Sheets`: Renders frame grids for structural auditing.
4. `[4/5] 🤖 Critic Agent Audit`: Analyzes visual pacing, contrast, and rulebook compliance.
5. `[5/5] 🏁 Quality Gate`: Confirms score threshold (>=90/100) before final production sign-off.

---

## 🎥 Rendering to Video

Render the production MP4 bundle:

```bash
bun run render src/index.ts DzinrShowcase out/dzinr.mp4 --overwrite
```

Or render a single still frame snapshot:

```bash
bun run still src/index.ts DzinrShowcase out/frame-120.png --frame=120
```

---

## 🎨 Core Motion System

Shared components live in `src/shared/`:

| Component | Path | Description |
|:---|:---|:---|
| **`KineticText`** | `@/shared` | Per-word or per-character spring typography with staggering and gradient fills. |
| **`GlassCard`** | `@/shared` | Crisp glassmorphic panel with dynamic border lighting and backdrop blur. |
| **`GlowBadge`** | `@/shared` | Kinetic pill badge with breathing luminescence and spring entrance. |
| **`ParticleField`**| `@/shared` | Real-time WebGL 3D particle constellation using Three.js and `@react-three/fiber`. |
| **`Transitions`**  | `@/shared/transitions` | Curated wipes, directional slides, cross-fades, and 3D flips. |
| **`SpringPresets`**| `@/shared/motion/springs` | Standardized physics presets (`snappy`, `cinematic`, `bouncy`, `stiff`). |

---

## 📜 Motion Design Directives

Videos produced with this harness adhere to two core specifications:
- **`creative_rulebook.md`**: Directed attention model, cognitive load budgets, and purposeful shot functions.
- **`rhythm_system.md`**: Dynamic cutting rhythms (Macro, Shot, Micro) avoiding uniform shot lengths.

---

## 🤝 Contributing & Customization

1. Create a branch: `git checkout -b feature/new-transition`
2. Validate TypeScript types:
   ```bash
   bun run typecheck
   ```
3. Submit a pull request with before/after contact sheets or video renders.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
