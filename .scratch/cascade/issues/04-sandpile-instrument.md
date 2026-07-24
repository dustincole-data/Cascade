# 04 — Sandpile: the instrument (criticality on the proven shell)

**Type:** HITL · design decision (`/grilling` + Intent) · **Plan-don't-build.**
**Status:** ✅ RESOLVED 2026-07-24 — 7 forks + 10 derived decisions locked with Dustin via grilling. Feeds spec §5.1 (rewrite), §3.3 (control vocabulary), §3.2 (plot configs), §9 (Phase 5).
**Depends on:** ticket 01 (look + §4.4 plot treatment) · ticket 02 (on-ramp grammar) · ticket 03 (coda board-slot contract) — all closed. Unblocked by the forest-fire slice being **built + proven live** (`cascade.dustincoledata.com`, PROGRESS.md Phases 1–4).
**Was:** *"Sandpile exhibit specifics"* in the map's fog. **Now:** the instrument is locked; the on-ramp beats (ticket 05) and coda panel 2 (ticket 06) are sharp enough to ticket.

## Scope fence

- **Does:** the sandpile's **aha**, its **stage language** (pile + avalanche render on the locked palette), its **signature plot** (what it plots, how it builds, what's annotated), and its **sandbox control set + readouts** — the instrument, end to end, as a rule-set on the proven shell.
- **Does NOT:** the on-ramp beat choreography (ticket 05), coda panel 2 (ticket 06), the 3-up board layout, or the network exhibit.

## The question

Exhibit 1 works because *you* turn a dial and the world cliffs. The sandpile has **no dial** — that is the science (self-organized criticality). So: **what is the sandpile's instrument** — what does the user do, what do they see on the stage, and what plot does their play build — such that *criticality* lands as felt understanding and rhymes with, without repeating, the threshold exhibit?

## Resolution — the spine (everything hangs off this)

**Nobody set the dial.** Exhibit 1 put the cliff where the user's hand put it: you drag density to 0.59 and the world flips. The sandpile's whole point is the opposite — **the system walks to its own edge and parks there**, unprompted, and will not be pushed further. That contrast *is* the trio's intelligence: threshold is a line you cross, criticality is a place systems go by themselves.

Design consequence, taken literally everywhere: **the exhibit's job is to show a dial the user cannot touch, climbing to a number the user did not choose, and stopping.** The chrome says it (a self-driving slope readout), the stage says it (the field visibly heats as it self-loads), the charge says it (you watch the climb park), and the plot says it (no typical size — the tail is built in, not chosen).

The small→big through-line stays load-bearing via the readout pairing: the left side of `1 grain → N cells` **never changes**. That invariance is the argument.

## The 7 locked forks

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | **Spine / aha** | **"Nobody set the dial."** Self-organized criticality: the pile tunes *itself* to the edge and stays. Chosen over *"same grain, any size"* (unpredictability — rejected: rhymes almost too closely with fire's "same spark, everything") and *"there is no normal size"* (scale-free — rejected: the aha would live in the chart, not the fingertips). |
| 2 | **The dial** | **A dial that turns itself.** The control bar's parameter slot holds a slider-shaped **read-only slope readout** — mean grains/cell, a true order parameter — that climbs as the pile loads and **parks at the critical value ≈2.1**, marked with a critical tick, jittering there forever. **No handle, no track groove, not focusable** — it is deliberately *not* yours. Rejected: an empty slot (chrome says nothing, and the stage is the biggest object on the page) and a draggable-but-inert drop-rate slider (teaches "broken control"; only lands if the user runs the experiment). |
| 3 | **Stage language** | **The field warms as it loads.** Cell height 0→3 maps along a **cool→warm sequential ramp** (dim teal → amber), so the stage visibly heats as the pile self-loads and settles into a tense mixed field; avalanche topples flash **white-hot with the fire halo** (`FIRE` age ramp + `lighter` + halo sprites, unchanged machinery). The self-driving dial gets a visual twin on the stage. CVD-safe by the same rule as `FIRE` — sequential, monotone luminance, not categorical. Rest field is dimmed (~`FOREST_DIM`) so the topple keeps its contrast. Rejected: cool-pile/warm-avalanche-only (self-loading invisible) and a near-black event-only stage (pile becomes an abstraction). |
| 4 | **The charge** | **Watch it charge, ~12 s, then it hands you the grain.** Two time bases. **Charging:** grains rain in batched (~1.2k/s), the dial visibly climbs, no per-avalanche animation; it parks and releases. **Critical:** one grain per click, every avalanche animated as a front. The charge **is** the proof of the spine, so it is shown, not skipped by default — but it is **skippable and re-runnable**. Rejected: arriving pre-charged (spine told, not shown) and hold-to-feed (a user who lets go early never reaches the payoff). |
| 5 | **Signature plot** | **Your avalanches, biggest first** — a **log-log survival curve**: for each size *s*, how many of the user's own avalanches were at least that big. No binning, so it reads as a clean straight line at N≈20 and **each drop inserts a point live** (rhymes with fire's S-curve building from the user's trials). A **faint baked curve from a long run** sits underneath as the shape it converges to. Straight line = no bump = **there is no typical size**. Rejected: the binned log-log histogram (binning artifacts at low N; the plot would be mostly pre-baked, so play wouldn't build it) and an avalanche timeline (visceral, but shows punctuated equilibrium instead of the power law, costing the coda its "straight line" feature and the trio one of its three plot shapes). |
| 6 | **Money readout** | **`1 grain → N cells` + a ratcheting `biggest`.** A persistent paired readout showing cause beside effect, plus a record line that only ever goes up. The **left side never changes** — that invariance is the small→big argument. `aria-live` on the pairing so the screen-reader path carries the same shock. Rejected: "% of the pile moved" (rhymes with fire's `swept 35%`, but % flattens the tail — 3 cells reads as 0%, and "6%" sounds small when one grain moved six thousand things) and a live ledger of the last ~12 drops (compelling for the variance, but adds chrome to a stage the canon wants quiet, and competes with the plot for the data role). |
| 7 | **Felt callback** | **"Nobody set the dial."** The spine verbatim, filling the blank ticket 03 left in the board-slot contract. Deadpan, 4 words, and literally what the instrument does; it carries the contrast with exhibit 1 without naming it. Rejected: *"It tunes itself to the edge"* (the panel's plain line already says this — the callback slot would repeat, where panel 1's *"cliffs, not ramps"* adds the metaphor its plain line lacked) and *"The edge is the resting place"* (strongest idea, weakest callback — the hand never felt a resting place, it felt a dial refuse to move; better used as a plain line). |

## The 10 derived decisions

| # | Derived | Call |
|---|---|---|
| D1 | **Control set** | read-only `slope` dial (critical tick) · **● Drop** (click the stage, or Enter) · **▷ Feed** (auto-drop) · **speed** · **⤫ Shuffle** (new seed) · **↺ Reset** (empty + recharge). Readouts: `grains` · `1 grain → N cells` · `biggest`. |
| D2 | **Grid** | **64²** (4,096 cells) vs fire's 128×82 — bigger cells so a single topple is legible; ~8.7k grains resident at h̄≈2.125, ~15k drops with boundary loss ⇒ ~12 s at 1.2k/s. |
| D3 | **Two time bases** | Charge = batched, no per-avalanche animation, dial climbs. Critical = 1 grain/click, topple front animated tick-by-tick reusing fire's front-repaint + halo (`paintFrame`/`ageOut`). |
| D4 | **Minimum flash** | A 1–3 cell topple resolves in a single frame and would be invisible; every avalanche gets a **≥2-frame visible flash**. |
| D5 | **Naming** | Concept word `CRITICALITY`; page title "Sandpile"; sci line *"self-organized criticality · Bak–Tang–Wiesenfeld"*; plot source line *"Bak–Tang–Wiesenfeld 1987 · τ ≈ 1.1–1.3 (approx.)"* — state the exponent approximately, never over-claim (spec §5.1). |
| D6 | **a11y** | Stage focusable; **Enter drops at the focus cell**, arrows move it. `aria-live` on the pairing. **Reduced motion:** the avalanche is an immediate before/after state swap; the outcome rides the readout + the new plot point. **The dial is never focusable** — un-touchability is the meaning, and a focus ring would promise otherwise. Meaning never rides on color alone (luminance carries height; the pairing carries size). |
| D7 | **Progressive enhancement** | SSR renders the plot with the **baked backbone** + copy + the sci/source lines; the sim hydrates. No-JS still shows a real, meaningful power-law instrument. |
| D8 | **Determinism** | The charge runs a **seeded drop sequence** (same seed → same charged pile, replayable); user clicks are their own; **Shuffle** advances the seed. |
| D9 | **Engine generalization** (build note) | `Params.value`, `Stats`, `StepResult` in [`src/lib/types.ts`](../../../src/lib/types.ts) are fire-shaped (`density/trees/burned/frac`, `ignited/spent`). Sandpile forces the shell's **first real generalization** — a design consequence to budget for, not a design change. |
| D10 | **Landing** | The landing gains a **second live door** when this ships, and the promise line drops to one exhibit (spec §2; PROGRESS deviation 3 — "no ghost cards" still holds). |

## The instrument anatomy (hand to build)

| Zone | Content | Treatment |
|---|---|---|
| **Stage** | 64² heightfield; height 0→3 on a cool→warm sequential ramp, dimmed at rest. Toppling cells = white-hot `FIRE` age ramp + halo bloom, `lighter` composite. | Same canvas machinery as fire: cached background + O(front) repaint. Field warms visibly across the charge. |
| **Dial** | `slope [=======@--] 2.09 ▲` with a marked critical tick. | Slider-shaped, **read-only**: no handle, no groove, not focusable, `aria-hidden` from the tab order with the value mirrored in the readout region. |
| **Plot (signature)** | Log-log survival curve — the user's avalanches, biggest first — bright, over a **faint baked backbone** from a long run. Annotation **off the line** with a thin leader + hot-core dot on **the user's own max**: *"one grain, 6,140 cells."* | Locked §4.4 treatment (faint real scatter, smoothed spectral stroke, faint gridlines, JetBrains mono axes). Source line beneath. |
| **Readouts** | `grains 4,182` · `1 grain → 6,140 cells` · `biggest 11,308` | Mono. `aria-live` on the pairing. The left side of the arrow never changes. |
| **Controls** | ● Drop · ▷ Feed · speed · ⤫ Shuffle · ↺ Reset | Sandbox-only controls stay gated during the charge, as fire gates Play/Speed during the on-ramp. |

**Coda board-slot fill (now settled, for ticket 06):** `CRITICALITY` · log-log survival line · *"Systems drift to their own edge and stay there."* · **"Nobody set the dial."** · *"An idea going viral."*

## Feeds spec (edits the build session applies)

- **§5.1 (rewrite):** the sandpile is no longer a sketch — spine, dial, stage ramp, two-phase charge, survival-curve plot, readout pairing, and the control set above.
- **§3.3 (control vocabulary):** the sandpile row changes — the parameter slider is **not a user control** for this exhibit; it is a read-only self-driving slope readout. Click-to-act = drop a grain at the clicked cell.
- **§3.2 (signature-plot component):** a **fifth config** — `sandpile-live`: log-log axes, baked backbone series + a live user series, annotation anchored to the running max.
- **§9 (Phase 5):** exhibit 2 carries the engine generalization (D9) and the landing's second door (D10) as part of its scope.

## Engine / build constraints this ticket adds

- **Baked backbone:** one long BTW run (millions of grains) precomputed at build time and shipped as static data — same pattern as the coda's canonical curve. Keeps FREE + low-upkeep + deterministic.
- **Batched charge:** the charge advances many drops per frame with rendering decoupled from the drop count; only the dial and the field's warmth update. Per-avalanche animation is off until the pile parks.
- **Front-repaint reuse:** an avalanche is a propagating front like a burn, so `paintFrame`/`ageOut` generalize; a big avalanche must not force a whole-grid repaint per frame.
- **Log-log geometry:** the plot component needs log scales (fire's is linear) — a real addition to [`plot-geometry.ts`](../../../src/lib/plot-geometry.ts), not a config flag.

## Acceptance (this design is "right")

- The user **watches a dial they cannot touch** climb and park at a number they did not choose — and the stage's warming field says the same thing a second way.
- Feeding harder does not move the parked slope; the exhibit survives a user actively trying to push it.
- At criticality, identical clicks produce wildly different sizes, and `1 grain → N cells` makes the ratio unmissable while its left side never changes.
- The survival curve reads as a **straight line by ~20 of the user's own avalanches**, with the user's own max annotated off the line.
- Keyboard, reduced-motion, and no-JS paths all deliver the same outcome readout and a real plot.
- Nothing here invents new chrome: it is the locked shell, palette, plot treatment, and halo machinery in a new rule-set — plus a log axis and the engine generalization D9 names.

## References

Locks consumed: ticket 01 (look, palette, §4.4 plot treatment), ticket 02 (on-ramp grammar, sandbox gating), ticket 03 (board-slot contract — this ticket fills its sandpile blank). Spec: §5.1, §3.2, §3.3, §9. Canon: the rigorous graphic is the hero, chrome + type stay small, glow disciplined, sequential ramps for CVD safety.
