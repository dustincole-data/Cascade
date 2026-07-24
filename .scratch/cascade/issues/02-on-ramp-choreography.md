# 02 — On-ramp choreography (forest fire)

**Type:** HITL · design decision (`/grilling` + Intent on-ramp lens)
**Status:** ✅ RESOLVED 2026-07-23 — 12 decisions locked with Dustin via grilling. Designed ON the real stage (ticket 01). Feeds spec §4.2 (rewritten), §4.1/§4.3 (monotonic-fill model), §4.4 (plot-during-on-ramp), §3.4. **Plan-don't-build.**
**Depends on:** ticket 01 — hero look LOCKED ([../assets/01-forest-fire-look.html](../assets/01-forest-fire-look.html)). The beats live on the locked instrument: **stage (dominant) + signature plot + control bar.**
**Was:** `[FRONTIER · next]` in the map. **Now unblocked** → synthesis-coda design becomes the next frontier once ≥1 plot exists.

## The question (a decision to settle, not a build)

Are the 3 forest-fire on-ramp beats right — **pacing, copy, who drives, and exactly when the plot's knee lights up** — choreographed on the locked stage? (Map frontier: *"are the 3 forest-fire beats right?"*)

## Resolution — the spine (everything hangs off this)

The on-ramp's **one job: plant a linear expectation, then shatter it.**
- **Beat 1** — a spark just dies.
- **Beat 2** — the *trap*: "more trees → a bit more burn, gradual, predictable."
- **Beat 3** — break it: one more nudge and the **same** spark takes **everything** — a discontinuity, not a slope.

The aha is **"the world has cliffs, not ramps,"** *felt in the fingertips*. It is 3 beats and not 2 precisely because beat 2's false-linear baseline is what makes beat 3 shocking. No jargon in the beats — the `/synthesis` coda names "threshold" later.

## The 12 locked decisions

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | Spine | Plant linear expectation → shatter it. 3 beats; **beat 2 is the trap.** Payoff = *cliffs, not ramps.* |
| 2 | Who drives | **User-acts every beat** (no watch-only). Script only pre-sets state + spotlights the one live control. People believe what their own hand caused; the on-ramp doubles as the tutorial. |
| 3 | "Same spark" honesty | **Monotonic fill:** each cell has a fixed `r_i` from the seed; tree iff `r_i < d`. Raising density **only ever adds** trees. So "one more tree, same spark" is *literally true*; fixed spark cell across beats 2–3. Fully deterministic. |
| 4 | Verb progression | **Beat 1 teaches Spark** (tap a tree on the stage → user picks the protagonist cell). **Beats 2–3 teach density** (drag the slider). Two real controls, one at a time; nothing taught that isn't in the sandbox. Empty-tap → snap to nearest tree. |
| 5 | Plot / when the knee lights | **Build from the user's own trials.** Live density **marker** tracks from beat 1 (cyan, on the flat left tail); each beat drops **one real trial point** (floor · slightly-up · leap). **At the beat-3 crossing** the marker flips **cyan→amber**, the knee dot blooms, and the smoothed theoretical curve + off-line annotation resolve behind their 3 points. *The knee lights up the exact frame density passes d_c.* |
| 6 | Beat-3 crossing | User drags across 0.59. **Guided pulsing knee-tick** on the slider + prompt *"one more nudge"* (can't miss it, can't overshoot into confusion). Marker flips **mid-drag** at the exact d_c pixel — tipping point is tactile, not announced. **Near-miss preserved** (0.58 still fizzles). Beat completes **only on crossing.** Keyboard arrow-step gets the identical flip. |
| 7 | Advance | Completed action **auto-advances** + a faint persistent **"next →"** safety rail (no dead-ends). **No timer / no carousel.** Reduced-motion: instant caption swap. |
| 8 | Beat chrome | **Slim caption strip above the instrument frame** — beat line (Archivo) + prompt (mono) on the left; `1·2·3` progress + "skip intro →" on the right. **Never overlaid on the stage** (canon: chrome never competes with the glow). The payoff lands via the *stage sweeping* + *knee blooming*; words stay small. |
| 9 | Skip / re-entry | Persistent **skip → sandbox** at d≈0.62 (opens already interesting). **`localStorage` remembers completion** (no server — free/low-upkeep); repeat visits open in the sandbox with a quiet **"▷ replay intro."** |
| 10 | Control visibility | Each beat **spotlights its one live control** (beat 1 → Spark, density dimmed; beats 2–3 → density spotlighted). **Play / Pause / Speed appear only in the sandbox** — beats never need continuous play; a spark auto-runs its one burn. |
| 11 | Copy | Locked (table below). |
| 12 | a11y / reduced-motion | Every beat keyboard-operable (arrow-key density crossing gets the cyan→amber flip); reduced-motion renders spark→result as a **before/after state** (keeps fizzle-vs-sweep contrast, drops the animated spread); **swept-% readout + plot point carry the outcome** so nothing rides on motion alone. |

## The choreography (hand to build)

Densities are the **proven mechanic** from the look-study (0.52→0.62 = fizzle→sweep). d_c = 0.5927.

| Beat | Pre-set state | Spotlight | User action | Stage result | Plot result | Prompt (mono) → Lesson (Archivo, after result) |
|---|---|---|---|---|---|---|
| **1** | Sparse forest, **d≈0.40**, no spark yet | Spark (stage tappable) | **Tap a tree** → fixes the protagonist spark cell | Tiny local patch burns, dies; small charcoal scar | Marker sits **cyan** low-left; **point #1 drops near the floor** | `tap a tree to spark it` → **A spark here goes nowhere.** |
| **2** | Same spark cell fixed; density slider live | density (slider) | **Drag density up to ≈0.52** — trees fill in around the fixed spark; the same spark's burn **re-runs live** | Bigger scar, **still contained** | Marker slides cyan to ≈0.52; **point #2 drops slightly higher** (two low points read as a gentle *slope* — the trap) | `drag density up to add trees` → **Denser. A bigger scar. Still stops.** |
| **3** | Density at ≈0.52; **knee-tick pulses** at 0.59 | density (slider) | **Drag past 0.59** (→≈0.62). Crossing d_c flips the marker **cyan→amber mid-drag**; the same spark now **sweeps the whole forest** | Front bridges across; **the forest goes** (warm-spectral sweep + halo → charcoal) | **Point #3 leaps to the top**; knee dot blooms; theoretical curve + off-line annotation resolve behind the 3 points | `one more nudge` → **One more tree. Same spark. Everything.** |
| **→ sandbox** | Density stays where they left it; Play/Speed fade in | all controls | free play | full sandbox (§4.3) | scatter fills in as they run trials | — → **Now it's yours.** · `explore freely →` |

**The felt mechanic (beats 2–3):** the fixed spark's burn is **bound to the density slider** — dragging re-runs it live, so the user watches the *same spark's* outcome flip from contained to total in real time as their finger crosses the edge. This is the look-study interaction, promoted to the on-ramp.

## Engine constraints this ticket adds to the build

- **Monotonic fill** (`r_i < d`, add-only) with a **fixed spark cell** across beats 2–3 — required for "same spark" to be literally true. Refines §4.1's CA init and §4.3's sandbox slider (drag down removes trees in reverse order).
- **Density-bound live re-run** of the fixed spark in beats 2–3 (drag = re-spark same cell at new density).
- **Beat completion gates:** beat 1 = burn finishes; beat 2 = density reaches ≈0.52 band; **beat 3 = density crosses d_c** (not merely "moved").
- **Plot in on-ramp mode:** marker + 3 user trial points only; the smoothed Monte-Carlo curve + annotation are **withheld until the beat-3 crossing**, then resolve. Sandbox mode = full scatter builds from live trials (§4.4 unchanged).
- **`localStorage`** completion flag; **Play/Pause/Speed** hidden until sandbox.

## Acceptance (this design is "right")

- The 3 beats reproduce reliably (seeded); beat 3's crossing **visibly + tactilely** flips fizzle→total burn with the marker cyan→amber at the exact d_c pixel.
- "Same spark, one more tree" is *literally true* on-screen (monotonic fill; fixed spark).
- The knee/curve resolve **in sync** with the beat-3 crossing, not before.
- Keyboard + reduced-motion paths deliver the same fizzle-vs-sweep contrast and outcome readout.
- Reads as *genuinely light* (§3.4) — three short beats, two verbs, no multi-chapter journey — and hands cleanly to the sandbox.

## References

Intent on-ramp lens (journey/onboarding: do-don't-watch, escape hatch, you-are-here · articulate: concrete restrained copy · include: keyboard/reduced-motion · fortify: near-miss/edge). Canon: stage is the hero, chrome quiet, type small. Look lock: ticket 01. Proven mechanic: look-study drag 0.52→0.62.
