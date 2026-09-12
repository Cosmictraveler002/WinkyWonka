# 🛠️ Required Tech Stack for High-End Motion Video Production

This document outlines the complete technology stack, rendering engines, 3D pipelines, physics libraries, and media deconstruction tools required to analyze, plan, build, and render videos matching high-end references.

---

## 1. Core Composition & Rendering Engine

| Technology | Package | Purpose |
| :--- | :--- | :--- |
| **Remotion Core** | `remotion` | Declarative React video framework. Provides frame synchronization (`useCurrentFrame`), resolution/FPS configuration (`useVideoConfig`), and spatial layering (`AbsoluteFill`, `Sequence`). |
| **Remotion CLI** | `@remotion/cli` | Headless Chromium rendering engine for MP4/WebM video compilation and frame snapshot capture (`remotion still`). |
| **Remotion Bundler** | `@remotion/bundler` | Webpack compiler supporting path aliases (`@/shared`, `@projects`), asset bundling, and TypeScript. |
| **Remotion Transitions** | `@remotion/transitions` | Presentation transitions (wipes, directional slides, cross-fades, 3D flips) with frame-accurate timing. |
| **Remotion Motion Blur** | `@remotion/motion-blur` | Vector motion blur on high-speed kinetic typography and moving elements. |
| **Google Fonts** | `@remotion/google-fonts` | Dynamic web font loading directly inside video frames without external CSS dependencies. |

---

## 2. 3D Graphics, Spatial Depth & GLSL Shaders

When visual components cannot be achieved via 2D CSS/SVG, the 3D pipeline is deployed:

| Technology | Package | Purpose |
| :--- | :--- | :--- |
| **Three.js** | `three`, `@types/three` | Full-featured WebGL 3D engine: meshes, geometries, PBR materials, directional lights, cameras, and particle fields. |
| **Remotion Three** | `@remotion/three` | High-performance bridge synchronizing Three.js rendering loops directly to Remotion's frame clock. |
| **React Three Fiber** | `@react-three/fiber` | Declarative React component wrapper for Three.js objects (`<points>`, `<mesh>`, `<ambientLight>`). |
| **Three Drei** | `@react-three/drei` | Ready-made 3D helpers: 3D Text (`<Text3D>`), environment reflections (`<Environment>`), and floating motions (`<Float>`). |
| **GLSL Shaders** | Custom Fragment/Vertex | Custom WebGL shaders for fluid gradient meshes, chromatic aberration, scanlines, and particle physics. |
| **3D Asset Loaders** | `three-stdlib` (GLTFLoader) | Loading 3D models (`.gltf`, `.glb`, `.obj`) for product showcases, physical device frames, and hardware renders. |

---

## 3. Motion Physics, Easing & Interpolation

| Technology | Module | Purpose |
| :--- | :--- | :--- |
| **Spring Physics** | `remotion/spring` | Natural, physics-based motion without rigid linear timelines. Standardized in `@/shared/motion/springs` (`snappy`, `cinematic`, `bouncy`, `gentle`, `stiff`). |
| **Interpolations** | `remotion/interpolate` | Multi-stop keyframe mapping with strict clamping (`extrapolateLeft: 'clamp'`, `extrapolateRight: 'clamp'`). |
| **Cubic Easing** | `remotion/Easing` | Mathematical easing curves (quad, cubic, bezier, exponential) for camera zooms, pan moves, and opacity fades. |

---

## 4. Vector Graphics, Procedural Textures & UI Elements

| Technology | Package / API | Purpose |
| :--- | :--- | :--- |
| **Vector Icons** | `lucide-react` | Clean, customizable vector iconography for metric cards, UI badges, and navigation metaphors. |
| **Procedural SVG Noise** | `<feTurbulence>`, `<feDisplacementMap>` | Procedural fractal noise overlays giving tactile, analog texture to flat vector shapes (`<Noise />`). |
| **Cinema Film Grain** | Canvas / SVG Matrix | Shifting film grain cadence simulating 35mm cinema film emulsion (`<FilmGrain />`). |
| **Canvas 2D API** | HTML5 `<canvas>` | Low-level procedural drawing for animated waveforms, audio visualizers, and interactive chart graphs. |

---

## 5. Media Deconstruction & Analyzer Tooling

| Tool | Capability | Workflow Stage |
| :--- | :--- | :--- |
| **FFmpeg** | `ffmpeg -i video.mp4 -vf "fps=1" frame_%04d.jpg` | Extracting frame-by-frame snapshots and scene cuts from reference videos for visual deconstruction. |
| **FFprobe** | `ffprobe -v quiet -print_format json -show_streams` | Extracting exact FPS, container format, duration, and color profile from raw reference media. |
| **Multimodal Vision** | Gemini Multimodal Models | Macro aesthetic analysis: color palette extraction, typography identification, motion pacing, and lighting deconstruction. |
| **Contact Sheet Generator** | `scripts/generate-contact-sheet.ts` | Automatically rendering 3 keyframes per scene (Entry 20%, Apex 50%, Settled 80%) into an interactive HTML inspection sheet. |

---

## 6. Spec, Asset & Pipeline Orchestration

| Tool | Purpose |
| :--- | :--- |
| **YAML (`yaml`)** | Structured, comment-supported storyboarding for `core_aesthetic.yaml`, `timeline.yaml`, and `scenes/scene_XX.yaml`. |
| **Zod (`zod`)** | Runtime schema validation ensuring scene props and creative specs match expected types. |
| **AI Image Gen** | Antigravity `generate_image` tool for creating reference textures, custom backgrounds, and product concepts into `04_Assets/`. |
| **Critic Agent** | `scripts/critic-audit.ts` auditing typography hierarchy, element timing, and contrast ratios; emits `critique.json`. |
| **Remotion Studio** | Interactive live-reloading player on `http://localhost:3000` for human timeline scrubbing and visual approval prior to render. |

---

## 7. Package Installation Commands

To install or verify this entire stack in any environment:

```powershell
# Core Framework & React 18 Foundation
bun add remotion @remotion/cli @remotion/transitions @remotion/motion-blur @remotion/google-fonts
bun add react@18.3.1 react-dom@18.3.1 @types/react@18.3.1 @types/react-dom@18.3.1

# 3D, WebGL & Shaders
bun add three @types/three @remotion/three @react-three/fiber @react-three/drei three-stdlib

# UI, Icons & Data Formats
bun add lucide-react clsx tailwind-merge yaml zod

# Dev Tools & Compilers
bun add -d typescript @types/node
```
