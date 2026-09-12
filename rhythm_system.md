# MOTION AD RHYTHM & CUTTING SYSTEM

## Purpose

Design the temporal rhythm of the video before implementing the Remotion composition.

The goal is to make the edit feel intentionally composed around rhythm, not like a sequence of AI-generated scenes placed one after another.

Treat:

* shot duration
* cut frequency
* motion frequency
* visual density
* audio beats
* dialogue cadence
* pauses
* anticipation
* acceleration
* deceleration
* visual repetition
* pattern interruption

as explicit design variables.

Do NOT assume that every cut should happen on a music beat.

Music provides the pulse. The edit creates the rhythm.

---

# 1. PRIMARY RULE

First determine:

1. Total duration `T`
2. Visual aesthetic
3. Energy level
4. Narrative structure
5. Audio structure
6. Major visual beats
7. Desired pacing curve

Then choose or construct a rhythm template.

Never generate arbitrary shot durations independently.

The timeline should have a recognizable temporal pattern.

---

# 2. RHYTHM VARIABLES

Use these variables:

`T` = total video duration in seconds

`N` = number of major shots

`d_i` = duration of shot `i`

`B` = dominant musical beat interval

`E(t)` = visual energy at time `t`, normalized from `0` to `1`

`D(t)` = visual information density at time `t`

`M(t)` = motion intensity at time `t`

`C(t)` = cutting frequency at time `t`

The rhythm should generally satisfy:

`C(t) ∝ E(t)`

but NOT continuously.

Use deliberate changes in cutting frequency.

A good rhythm contains:

`setup → establish pattern → variation → acceleration → interruption → payoff`

rather than:

`cut → cut → cut → cut → cut`

---

# 3. CUTTING PRINCIPLE

Do not cut simply because a shot has reached an arbitrary duration.

Prefer cuts triggered by one of these events:

* musical impact
* snare / kick / percussion
* meaningful word in dialogue
* visual action
* object entering frame
* object leaving frame
* camera movement reaching a peak
* text appearing
* text completing
* joke setup
* punchline
* reveal
* change in visual scale
* change in information
* emotional shift
* deliberate silence
* pattern interruption

Every major cut should have a reason.

---

# 4. SHOT DURATION DISTRIBUTION

Avoid uniform durations.

BAD:

`[2, 2, 2, 2, 2, 2]`

Prefer:

`[3.0, 1.8, 1.2, 0.8, 0.5, 0.3]`

or:

`[0.8, 0.8, 0.8, 1.6, 0.4, 2.2]`

or:

`[2.5, 1.0, 0.5, 0.25, 0.25, 1.5]`

Variation creates rhythm.

---

# 5. RHYTHM TEMPLATES

Select a template based on the visual aesthetic and total duration.

## TEMPLATE A — ACCELERATION

Use for:

* product launches
* energetic ads
* chaotic social content
* comedic escalation
* hype
* transformation

Mathematical structure:

`d_i = d_0 * r^(i-1)`

where:

`0 < r < 1`

Typical:

`r = 0.65–0.85`

Example for `T = 10s`:

`[2.8, 2.0, 1.4, 1.0, 0.7, 0.5, 0.35, 0.25]`

Pattern:

`LONG → SHORT → SHORTER → SHORTER → BURST`

Do not maintain maximum cutting speed until the end.

Insert a payoff or visual hold after the acceleration.

---

## TEMPLATE B — BURST → HOLD → BURST

Use for:

* comedy
* meme ads
* surprising product reveals
* highly visual ads

Structure:

`BURST → HOLD → BURST → PAYOFF`

Mathematical approximation:

`T = A + H + B + P`

where:

`A ≈ 0.25T`

`H ≈ 0.10T–0.20T`

`B ≈ 0.30T`

`P ≈ 0.15T–0.25T`

Example `T = 12s`:

`[0.7, 0.5, 0.4, 0.3]`
→ `HOLD 1.5s`
→ `[0.6, 0.4, 0.3, 0.2, 0.2]`
→ `PAYOFF 1.8s`

The hold is intentional.

Do not fill the silence with unnecessary animation.

---

## TEMPLATE C — MUSICAL 1/2/4/8

Use for:

* music-driven ads
* fashion
* product montage
* kinetic typography
* visually rhythmic edits

Define the beat unit as `b`.

Group cuts in powers of two:

`1b → 2b → 4b → 8b`

Example:

`1 beat`
`1 beat`
`2 beats`
`2 beats`
`4 beats`
`1 beat`
`1 beat`

This creates a musical phrase rather than constant cutting.

The visual rhythm should correspond to musical phrasing, not merely individual beats.

---

## TEMPLATE D — 3:2:1

Use for:

* short social ads
* punchy product demos
* comedic setup
* simple storytelling

Normalize:

`d_1 : d_2 : d_3 = 3 : 2 : 1`

Repeat with variation.

For a 6-second sequence:

`3s → 2s → 1s`

For a 3-second sequence:

`1.5s → 1.0s → 0.5s`

For longer sequences, repeat:

`3 : 2 : 1 | 3 : 2 : 1`

Do not make every repetition identical.

---

## TEMPLATE E — LONG → LONG → RAPID → SILENCE

Use for:

* storytelling
* deadpan comedy
* cinematic product reveal
* absurdist ads

Structure:

`LONG → LONG → RAPID → SILENCE → PAYOFF`

Recommended proportions:

`0.25T : 0.20T : 0.20T : 0.10T : 0.25T`

The silence should feel intentionally empty.

The payoff should exploit the expectation created by the rapid section.

---

## TEMPLATE F — CONSTANT PULSE

Use for:

* rhythmic product demonstrations
* dance/music
* kinetic typography
* high-energy montage

Choose a base beat `b`.

Most cuts occur near:

`n*b`

where:

`n ∈ Z`

But introduce controlled deviations:

`b ± ε`

where:

`ε ≈ 0.05b–0.20b`

The deviations prevent mechanical beat-syncing.

Example:

`0.50s`
`0.50s`
`0.45s`
`0.55s`
`1.00s`
`0.50s`

---

## TEMPLATE G — PATTERN → BREAK

Use for:

* comedy
* clever ads
* surreal / absurdist content
* memorable brand moments

Establish a repeated rhythm:

`A → A → A`

Then break it:

`A → A → B`

or:

`A → A → A → HOLD → B`

The viewer should learn the pattern before it is interrupted.

The interruption is the point.

---

# 6. DURATION-BASED RHYTHM SELECTION

## 3–6 seconds

Use:

`1–3 major shots`

Prioritize:

`HOOK → PAYOFF`

Do not over-cut simply because the video is short.

Recommended shot duration:

`0.3s–2.5s`

---

## 6–10 seconds

Use:

`3–7 major shots`

Recommended structure:

`HOOK → BUILD → PAYOFF`

Introduce at least one duration contrast.

Example:

`1.8 → 1.2 → 0.8 → 0.5 → 1.7`

---

## 10–15 seconds

Use:

`5–10 major shots`

Recommended structure:

`HOOK → ESTABLISH → ESCALATE → BREAK → PAYOFF`

Allow one meaningful hold.

Example:

`2.2 → 1.6 → 1.0 → 0.6 → 0.3 → 1.2 → 2.0`

---

## 15–30 seconds

Use:

`7–16 major shots`

Divide the video into rhythmic sections rather than maintaining one global tempo.

Example:

`SECTION A`
slow setup

`SECTION B`
increasing density

`SECTION C`
rapid burst

`SECTION D`
pause

`SECTION E`
final payoff / CTA

A 20-second video should NOT feel like one 20-second rhythm.

It should contain several rhythmic phrases.

---

# 7. VISUAL-AESTHETIC MAPPING

## Cinematic / premium

Prefer:

`LONG → MEDIUM → MEDIUM → LONG → PAYOFF`

Low cut frequency.

Use:

* camera movement
* negative space
* deliberate holds
* match cuts
* motivated transitions

Avoid constant motion.

---

## Minimal / typographic

Prefer:

`HOLD → TEXT → HOLD → TEXT → BURST`

Let typography itself provide the rhythm.

Use:

* word-level entrances
* scale changes
* positional shifts
* typographic pauses

Do not add random visual effects to compensate for slow pacing.

---

## Kinetic / energetic

Prefer:

`SHORT → SHORT → SHORT → MEDIUM → SHORT → SHORT → HOLD`

Use strong musical relationships.

Allow occasional off-beat cuts.

---

## Chaotic / absurdist

Prefer:

`MEDIUM → SHORT → SHORT → LONG → VERY SHORT → HOLD → PAYOFF`

Use rhythmically unexpected cuts.

Do not make chaos uniform.

Chaos must contain an underlying pattern.

The viewer should subconsciously feel:

`something is happening`

even when the visual events are absurd.

---

## Meme / comedic

Prefer:

`SETUP → HOLD → REACTION → CUT → PUNCHLINE`

Timing is more important than visual complexity.

A pause immediately before a punchline is often more valuable than another transition.

---

## Luxury / fashion

Prefer:

`LONG → LONG → SHORT → LONG → SHORT → LONG`

Use music phrasing rather than aggressive beat cutting.

Allow shots to breathe.

---

# 8. RHYTHM HIERARCHY

There are three levels of rhythm.

### LEVEL 1 — MACRO RHYTHM

The overall energy curve.

Example:

`LOW → MEDIUM → HIGH → VERY HIGH → LOW`

This controls the structure of the entire advertisement.

---

### LEVEL 2 — SHOT RHYTHM

The duration relationship between shots.

Example:

`2.0 → 1.2 → 0.8 → 0.5 → 1.5`

---

### LEVEL 3 — MICRO RHYTHM

Events inside a shot.

Example:

```text
0f     object appears
8f     text appears
14f    impact
20f    camera movement
32f    secondary element
45f    pause
52f    transition
```

A good motion ad should have rhythm at all three levels.

---

# 9. AUDIO-FIRST TIMING

If music or dialogue exists, analyze its temporal events.

Represent audio events as:

```yaml
audio_beats:
  - time: 0.0
    type: downbeat

  - time: 0.5
    type: kick

  - time: 1.0
    type: snare

  - time: 2.0
    type: phrase_end

  - time: 2.4
    type: silence
```

Map visual events onto these events.

Do not automatically cut on every beat.

Use:

* beat alignment
* anticipation
* delayed cuts
* early cuts
* phrase-end cuts
* silence
* sound-effect impacts

as appropriate.

A cut occurring `±5–15%` around a beat can feel more organic than mathematically exact synchronization.

---

# 10. RHYTHM SHOULD BE DESCRIBED IN THE VIDEO SPEC

Every scene should expose its timing and rhythmic role.

Example:

```yaml
scene:
  id: scene_04

  timing:
    start: 6.0
    end: 8.5

  rhythm:
    role: acceleration
    density: high

    beats:
      - frame: 180
        event: text_impact

      - frame: 192
        event: object_enter

      - frame: 204
        event: camera_hit

      - frame: 216
        event: visual_change

  transition:
    type: hard_cut
    reason: phrase_end
```

---

# 11. REMOTION IMPLEMENTATION RULE

The rhythm specification is authoritative.

Implement timing explicitly in frames.

At `fps`:

`frame = round(seconds × fps)`

Do not use arbitrary `setTimeout`, browser timing, or real-time animation.

All motion must be deterministic and renderable by Remotion.

Prefer:

* `useCurrentFrame()`
* `interpolate()`
* `spring()`
* `Sequence`
* `AbsoluteFill`
* frame-based timing

---

# 12. AGENT DECISION PROCESS

Before writing code, output a compact rhythm plan:

```text
TOTAL DURATION: 20s

AESTHETIC: chaotic_absurdist

RHYTHM TEMPLATE:
BURST → HOLD → BURST → PAYOFF

ENERGY:
0–4s    LOW → MEDIUM
4–8s    MEDIUM → HIGH
8–10s   HOLD
10–15s  HIGH
15–17s  VERY HIGH
17–20s  LOW → PAYOFF

SHOT DURATIONS:
2.0
1.2
0.8
0.5
1.5
0.3
0.4
0.25
0.25
1.2
2.0
...

PRIMARY CUT TRIGGERS:
- dialogue
- percussion
- visual impact
- punchline
- silence

PATTERN BREAK:
8.0s

PAYOFF:
17.0s
```

Only after this plan is established should the Remotion implementation begin.

---

# 13. FINAL RULES

1. Never make all shots equal length.
2. Never cut on every beat by default.
3. Never use constant high energy.
4. Never confuse visual complexity with rhythm.
5. Always establish some pattern before breaking it.
6. Use silence and holds deliberately.
7. Let dialogue create rhythm when dialogue is present.
8. Let music create rhythm when music is present.
9. Let motion inside a shot contribute to rhythm.
10. Make the ending feel rhythmically earned.
11. Prefer intentional temporal relationships over arbitrary timestamps.
12. The rhythm should support the visual aesthetic, not fight it.
13. For short-form ads, prioritize rhythm and information hierarchy over the number of visual effects.
14. If no audio exists, construct a visual rhythm using motion, cuts, text entrances, and holds.
15. When uncertain between adding another cut and holding the current shot, prefer the hold if the viewer needs time to understand the visual.
16. When uncertain between two equally valid rhythms, choose the one with greater variation in shot duration.

The objective is NOT "fast editing."

The objective is:

**PULSE → PATTERN → EXPECTATION → VARIATION → BREAK → PAYOFF.**
