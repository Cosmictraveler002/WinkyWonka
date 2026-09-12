# AGENTS.md

## Strict Aesthetic Directive: AVOID AI-SLOP AESTHETICS

Do not make the design look like a generic AI-generated startup identity, SaaS brand, tech startup, or AI company.

### Prohibited Visual Clichés & Tropes
Avoid:
- generic blue/purple/cyan gradients
- glowing blobs, aurora backgrounds, liquid gradients, iridescent surfaces
- abstract neural-network patterns
- floating 3D spheres and interconnected nodes
- brain imagery, circuits, circuitry traces, neural nodes
- robot heads, humanoid robots, android imagery
- glowing eyes or futuristic holograms
- generic sparkles, stars, particles, light trails
- glassmorphism used as a default visual language
- excessive chrome, metallic 3D objects, glossy plastic
- isometric cubes and floating geometric objects
- generic futuristic sans-serif typography
- overused geometric monograms
- generic infinity symbols and looping ribbons
- random mathematical formulas or code fragments used as decoration
- meaningless brackets, terminal prompts, binary, circuit diagrams, or fake technical UI
- generic “innovation” imagery
- predictable minimal black-and-white tech branding
- sterile corporate presentation aesthetics
- excessive whitespace with a single floating object
- symmetrical centered compositions by default
- perfectly smooth vector shapes everywhere
- stock-photo-like compositions
- overly polished synthetic perfection
- artificial depth-of-field and cinematic glow used without purpose
- unnecessary neon lighting
- excessive lens flares
- generic futuristic interfaces
- dashboards, holographic screens, translucent panels, or HUD elements unless explicitly required
- generic AI-generated 3D typography
- predictable startup-logo symbolism
- visual clichés associated with artificial intelligence, machine learning, blockchain, Web3, or generic software companies

---

### Core Directives for Motion Design & Art Direction

1. **Do not imitate the visual language** of common AI-generated logos, startup landing pages, Midjourney-style branding, DALL·E-style corporate illustrations, or generic LLM-generated design concepts.
2. **The result should feel authored rather than generated**:
   - Specific, intentional, culturally or contextually grounded.
   - Slightly imperfect where appropriate.
   - Visually distinctive and based on a clear design idea rather than a collection of fashionable visual effects.
3. **Do not add visual elements merely because they are aesthetically pleasing**:
   - Every element must have a concrete reason to exist.
4. **Do not invent symbolism just to make the mark “look like technology”**:
   - Do not use obvious symbols for design, engineering, creativity, AI, code, connectivity, intelligence, or innovation.
   - Avoid combining two obvious icons into a predictable clever-logo construction.
   - Avoid generic monograms that could belong to any startup.
   - Avoid making the identity “futuristic” merely through typography, gradients, geometry, or effects.
5. **Prioritize an original typographic or structural idea** that would still be distinctive if rendered entirely in one color.

---

## Mandatory Directive: MOTION AD RHYTHM & CUTTING SYSTEM (See rhythm_system.md)

Design the temporal rhythm of the video before implementing the Remotion composition. The edit must feel intentionally composed around rhythm, not like a sequence of scenes placed one after another.

### Rhythm Rules:
1. **Never make all shots equal length** (e.g. `[2, 2, 2, 2]` is prohibited). Variation creates rhythm. Prefer deliberate distributions like `[2.2, 1.4, 0.8, 0.4, 1.8]`.
2. **Do not cut on every beat by default**. Music provides the pulse; the edit creates the rhythm.
3. **Select an explicit Rhythm Template** based on total duration `T` and aesthetic:
   - **Template A (Acceleration)**: `d_i = d_0 * r^(i-1)` (Product launches, hype).
   - **Template B (Burst → Hold → Burst → Payoff)**: (Surprise reveals, comedic payoff).
   - **Template C (Musical 1/2/4/8)**: Phrasing in powers of two.
   - **Template D (3:2:1)**: Punchy social ads (`3s → 2s → 1s`).
   - **Template E (Long → Long → Rapid → Silence → Payoff)**: (Cinematic storytelling).
   - **Template F (Constant Pulse)**: Base beat with controlled deviations `b ± ε`.
   - **Template G (Pattern → Break)**: `A → A → A → Break B → Payoff`.
4. **Enforce 3 Rhythm Levels**:
   - **Level 1 (Macro)**: Global energy curve (`LOW → MEDIUM → HIGH → HOLD → PAYOFF`).
   - **Level 2 (Shot)**: Non-uniform duration relationship between scenes.
   - **Level 3 (Micro)**: Event spacing inside the shot (entrances, impacts, camera peaks).
5. **Output a compact rhythm plan** before writing Remotion code.
6. The objective is always: **PULSE → PATTERN → EXPECTATION → VARIATION → BREAK → PAYOFF**.

---

## Mandatory Directive: MOTION VIDEO & AD CREATIVE RULEBOOK (See creative_rulebook.md)

The **Storyboard Director Agent** (and any agent participating in storyboard design, shot planning, script evaluation, and creative direction) MUST STRICTLY FOLLOW the **Motion Video & Ad Creative Rulebook** ([creative_rulebook.md](file:///c:/Users/PC/myapps/Remotion/creative_rulebook.md)).

Every storyboard, scene, and shot must be authored under these strict operational directives:

### Core Storyboarding & Perception Invariants:
1. **The Fundamental Model (Section 0)**:
   A video is a **controlled sequence of perceptual events**:
   `ATTENTION → ORIENTATION → CURIOSITY → COMPREHENSION → ANTICIPATION → PAYOFF → MEMORY → ACTION`.
   Every moment must explicitly answer what the viewer looks at, understands, feels, anticipates, remembers, and does next.
2. **Directed Attention (Rules 1 & 2)**:
   Every shot must define exactly **ONE primary attention target** and at most **one secondary target**. If multiple elements compete, the scene must be simplified.
3. **Cognitive Load & Attention Budget (Rules 3 & 58)**:
   Never max out visual complexity, motion, text, sound, and narrative simultaneously. Alternate between high-stimulus bursts and comprehension holds. Consecutive shots must never exceed cognitive capacity (`attention_load: EXTREME` cannot appear across 3+ consecutive shots).
4. **Deliberate Hook Selection (Rules 4, 5, 6)**:
   Opening shots MUST select an explicit hook category (`curiosity`, `contradiction`, `immediate_result`, `problem`, `visual_novelty`, `character`, `audio`, `text`). **NEVER** open with a boring logo, company name, or generic greeting. Early branding must be integrated into the action, not floating decoration.
5. **Every Shot Needs a Job (Rules 10 & 11)**:
   Every shot must have an explicit valid purpose (`HOOK`, `ORIENT`, `INTRODUCE`, `ESTABLISH`, `SETUP`, `QUESTION`, `MISDIRECT`, `EXPLAIN`, `DEMONSTRATE`, `ESCALATE`, `CONTRAST`, `REVEAL`, `REACTION`, `PUNCHLINE`, `PAYOFF`, `RESET`, `TRANSITION`, `BRAND`, `CTA`, `END`). If a shot cannot justify its job, **DELETE IT**.
6. **Shot Card Perceptual Schema (Section 57)**:
   Every shot in `STORYBOARD.yaml` MUST declare:
   - `purpose`
   - `attention_target` (and optional `secondary_target`)
   - `viewer_should_notice`
   - `viewer_should_understand`
   - `viewer_should_feel`
   - `complexity` (`low` | `medium` | `high` | `chaotic`)
   - `attention_load` (`low` | `medium` | `high` | `extreme`)
   - `creative_rationale`
7. **Speed Creates Arousal, Holds Create Comprehension (Rules 20, 21, 63)**:
   Fast cuts must be followed by perceptual holds and resets to allow viewer absorption.
8. **Decisive Payoff & Inevitable Ending (Rules 50, 98, 101)**:
   The video must never merely stop; the final frame must resolve with deliberate product/brand meaning, callback payoff, and a natural CTA.
9. **The Golden Rules (Section 103)**:
   Strict adherence to the 20 Golden Rules of the Creative Rulebook.

