# Cascade — Locked Visual Design Spec + Build Plan

**Status:** LOCKED (charted 2026-07-23, approved by Dustin). Destination artifact of the `/wayfinder` charting session. Hand to a separate build session.
**One-line:** a personal explorable-explanation site for dustincoledata on ONE idea — *how one small action can have enormous consequences* — told as three lean interactive exhibits sharing a single engine/shell.
**Repo (to create):** standalone `github.com/dustincole-data/Cascade` → own Vercel → `cascade.dustincoledata.com` → linked from dustincoledata.com (external-card pattern, like Namesake / Fanbase Weather).
**Supersedes:** the retired "Emergence" framing (boids / fireflies / reaction-diffusion showed the *wrong* lesson — many-agents→one-pattern, not small-cause→big-effect). Do not resume it.

---

## 0. Approved decisions (the four forks + confirmations)

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | Aesthetic register | **Dark instrument stage** — near-black field, the sim glows on it; quiet neutral chrome. Cascade is its own standalone brand (like Namesake's "Vital Records"), so it does NOT inherit dustincoledata's locked light register. This is the deliberate "dark option" the borrow-recipe says to surface — fire/embers/blackout are glow's natural home. |
| 2 | Site architecture | **Hub + spoke + coda** — landing frames thesis → 3 exhibit routes (on-ramp → sandbox) → synthesis coda. |
| 3 | Data-art payoff | **Yes — every exhibit = living sim + a signature colorful data-art plot built FROM the sim's own data.** The toy generates the data; the plot is the aha (Visual Cinnamon "real data underneath"). |
| 4 | Name | **Cascade** (single evocative noun; literally what all three do). |

**Through-line (the point):** *"One small thing, enormous consequences — three ways the world does it."* — **threshold · criticality · cascade.** The synthesis across the three is what reads as intelligence.

**Standing brand/design constraints applied:** anchors on `dustin-brand-anchor` (a regular analytics guy who directs AI to build real, visual, trustworthy things; publish only personal projects; non-engineer-who-directs-AI is the feature; NO "governed analytics / eval-gate" reach-language) and the design canon (`design-canon-visual-cinnamon`, `dustin-dataviz-borrow-recipe`). **Personal, apolitical, free, low-upkeep.**

---

## 1. Aesthetic system

> **🔒 LOOK-LOCK (ticket 01, approved by Dustin 2026-07-23).** Reference: [`.scratch/cascade/assets/01-forest-fire-look.html`](../../.scratch/cascade/assets/01-forest-fire-look.html) (2-direction study alongside it). The chosen look is a **graft: Direction B's stage bloom (glow is the hero) inside Direction A's framed chrome + rigorous scientific signature plot.** Concretely: bigger additive halo bloom on the stage; a present, framed control bar with dividers and labeled mono readouts; a plot that reads as a precise instrument (real scatter cloud + smoothed mean curve + faint gridlines + off-line knee annotation), NOT decorative. Palette §1.2 and plot §4.4 below are now **locked**, not provisional. Build Phases 1–5 match this reference.

### 1.1 Register
An **observatory / control-room**: a dark instrument on which a living system glows. Chrome is quiet, technical, restrained — it never competes with the stage. The colorful, glowing simulation and its signature plot are the largest, brightest things on every screen (canon: *the work carries the page; type stays small*).

### 1.2 Palette (🔒 VALIDATED & LOCKED — ticket 01)
CVD-honest rule: **spectral within each encoding pole, never a rainbow across categories.** Cool family = latent/alive; warm spectral family = the event (burning / toppling / overloading). Luminance also carries state, so nothing relies on red-vs-green alone.

**Validation result (`validate_palette.js`, dark mode, surface `#0a0c10`):** the load-bearing distinction — **alive-teal `#2fb488` ↔ event-orange `#ff8a3d` — PASSES CVD**: worst adjacent ΔE **8.8** (protan) ≥ the 8.0 target (normal-vision ΔE 25.9). State is *also* carried by luminance in-context — latent forest renders dim, the burning front bright + glowing, the scar near-black — so it survives even total achromatopsia. The **warm spectral front (amber→orange→coral→magenta) is a *sequential* ramp** (position/age + monotonic luminance encode it, à la the plot's density axis), **not a categorical set** — so the categorical "normal-vision floor" that a 4-way warm split trips does not apply; keep it as a smooth gradient. The teal alive-ramp passes the ordinal check (single hue, monotone L). **Hexes kept exactly as the starting values below** — they already pass the test that matters; do not re-tint. (The dark-band "fails" the validator flags on the bright glow marks are by-design: glow marks are deliberately high-luminance on near-black, and all clear contrast strongly.)

| Token | Intent | Start value |
|-------|--------|-------------|
| `--stage` | near-black field (slight blue) | `#0a0c10` |
| `--chrome` | panel / control-bar ground | `#12151c` |
| `--ink` | primary chrome text | `#c9d1d9` |
| `--ink-muted` | labels, secondary | `#8b949e` |
| `--focus` | focus ring / active control | `#4cc9f0` (soft cyan) |
| Alive pole (cool) | trees / latent nodes / low load | `#1f7a5c` → `#2fb488` (deep→bright teal-green) |
| Event pole (warm spectral) | burning / toppling / overloaded | `#ffd166` amber → `#ff8a3d` → `#ff5a5f` coral → `#e0479e` magenta, hot core `#fff1c2`, each with a **radial halo** |
| Spent | burned scar / failed node | `#2a2118` on `#1a1c22` charcoal |

Glow = additive radial halo behind active cells/nodes (reads only because the ground is dark — the whole reason for fork #1). Keep halos disciplined (Stefaner rigour keeps Bremer glow from reading tacky).

### 1.3 Typography
- **Archivo** (the locked free grotesque; Atlas-Grotesk stand-in) for UI + headings, **small and restrained — biggest heading ≈28–32px, NEVER a billboard**.
- **Mono = JetBrains Mono (🔒 locked, ticket 01)** for numeric readouts, axis labels, control values, the "instrument" register (Atlas-Typewriter role) — engineered digits + taller x-height read cleaner as an instrument readout than Spline Sans Mono's softer humanist curves.
- **Hard bans (canon):** no serif anywhere; no giant display type; never Fraunces / Inter / Space Grotesk / Hanken / IBM Plex as the sans. Inline woff2 as base64 data-URIs (CSP blocks CDN fonts).

### 1.4 Motion
- The **simulation** is a canvas `requestAnimationFrame` loop — NOT GSAP.
- **GSAP only for chrome** (landing entrances, beat transitions). Apply the `gsap-scrub-from-conflict` rules: scroll-triggered `from()` gets `immediateRender:false`; never double-drive one transform property with both a `from()` and a scrub tween; ~2.5s failsafe clears inline transform/opacity/visibility.
- `prefers-reduced-motion`: disable auto-play and aggressive entrances; sims start paused with a visible Play; no essential information conveyed by motion alone.

### 1.5 Layout
Truth & Beauty discipline (calm editorial chrome) around a dark stage. Per exhibit: **stage (dominant) + signature-plot panel + control bar**. Generous quiet margins; small labels; the glowing stage is the hero.

---

## 2. Architecture

```
/                Landing — frames the thesis, three doors, sets register
/forest-fire     Exhibit 1 (BUILD FIRST): on-ramp → sandbox + signature plot
/sandpile        Exhibit 2 (graduate onto shell): on-ramp → sandbox + plot
/network         Exhibit 3 (graduate onto shell): on-ramp → sandbox + plot
/synthesis       Coda — the three plots rhymed → the meta-aha
```

- Each exhibit carries a quiet persistent **`synthesis →`** rail link (🔒 ticket 07); the landing holds **three live doors** at n=3 — `01 Forest fire` · `02 Sandpile` · `03 Power grid` — and its promise line disappears.
- **Standalone-fallback:** landing + `/forest-fire` + a light `/synthesis` form a complete shippable piece with just exhibit 1. Exhibits 2 & 3 are additive routes.
- Static routes, prerendered. No client router needed (Astro pages + light per-page island for the canvas).

---

## 3. The shared shell (build once, right — this is the leverage)

The shell is the product; exhibits are **rule-sets, not new products** (~1.4× total work, not 3×).

### 3.1 Engine interface (every exhibit implements this)
```ts
interface Exhibit {
  id: 'forest-fire' | 'sandpile' | 'network';
  init(params: Params, seed: number): void;   // build initial state from a seedable PRNG
  step(): StepResult;                          // advance one tick; returns what changed
  render(ctx: CanvasRenderingContext2D): void; // draw current state to the stage canvas
  act(x: number, y: number): void;             // primary interaction (spark / drop / knock-out)
  stats(): Stats;                              // current readouts (for counters)
  sample(): DataPoint | DataPoint[];           // a completed-trial datum for the signature plot
  reset(): void;
}
```
Fire & sandpile are **2D grid cellular automata**; network is a **graph**. Both render to the same canvas; the shell is agnostic. Keep each exhibit file focused (one clear purpose).

### 3.2 Shell responsibilities (built once)
- **Layout & theme** (palette tokens, dark stage, plot panel, control bar).
- **Control bar** — shared control vocabulary (§3.3), bound generically to the active exhibit's params/actions.
- **Beat-runner** — runs an exhibit's scripted on-ramp beats (§3.4), then releases to free play.
- **Signature-plot component** — a reusable canvas/SVG plot that accepts the exhibit's `sample()` stream and a plot config (axes, annotation, ramp). One component, several configurations: exhibit-live · exhibit-on-ramp (ticket 02) · coda (ticket 03) · **`sandpile-live` (ticket 04) — log-log axes, a baked backbone series plus a live user series, annotation anchored to the running max** · **`coda-sandpile` (ticket 06) — log-log, the baked survival series only, an interactive marker with a *rarity* readout, one continuous cool→warm stroke ramp (no regime split), no hot-core dot, optional `★ your biggest`** · **`network-live` (ticket 07) — a ranked *profile* (needle/bar geometry, not a curve): faint computed backbone of all 180 nodes plus the user's bright dots at their rank, annotation on the cliff, backbone re-drawn when `slack` steps** · **`coda-network` (ticket 07) — the same per-node data left UNSORTED as a needle field in the grid's own order, a marker stepping node by node with a per-node readout that *jumps*, one continuous cool→warm ramp by height, optional `★ you found this one`**. Log scales are a real addition to `plot-geometry.ts`, not a config flag; so is a **per-segment stroke ramp** (panel 1's is a two-regime split), and plots must **accept a width at render and re-lay-out on breakpoint change** (today's coda plot is a fixed 860×500).
- **Seed + reset** infrastructure (seedable PRNG, deterministic replays).
- **A11y plumbing** — keyboard bindings, focus management, reduced-motion switch.

### 3.3 Shared control vocabulary
| Control | Fire | Sandpile | Network |
|---------|------|----------|---------|
| **Parameter slider** | density *d* | **none — the slot holds a read-only, non-focusable slope readout that drives itself (🔒 ticket 04)** | **`slack` α — stepped, and released only into the sandbox (🔒 ticket 07)** |
| **Click-to-act** | Spark (ignite a tree) | Drop a grain at the clicked cell | Take a node offline at the clicked node |
| **Play / Pause** | ✓ | ✓ (grain feed) | **✗ — a cascade is an event, not a time base (🔒 ticket 07)** |
| **Speed** | ✓ | ✓ | **✗** |
| **Reset** | ✓ | ✓ | ✓ |
| **Seed / Shuffle** | reproduce vs new random field | ✓ | **✗ — one canonical seeded grid; the graph is the subject, not noise (🔒 ticket 07)** |

All keyboard-operable; visible focus ring (`--focus`).

### 3.4 On-ramp pattern (per exhibit)
**Guided on-ramp → free sandbox.** A few *show-don't-tell* beats that build the rule and land the aha, then release to play. **Keep it genuinely light** — not a multi-chapter journey. Each beat = a short line + a scripted state/interaction; the user acts, sees, moves on.

---

## 4. Exhibit 1 — Forest fire / percolation (END-TO-END, BUILD FIRST)

**Lesson:** the tipping point / phase transition. Below a threshold a spark fizzles; a hair past it the *same* spark takes *everything*.

### 4.1 The science (accurate + deterministic)
- Grid of cells; each is a **tree** with independent probability *d* (density), else empty. (Suggested grid ~120–160² — tune for 60fps.) **Construction = monotonic fill (🔒 ticket 02):** each cell holds a fixed seeded value `r_i`; it is a tree iff `r_i < d`. Raising density therefore only ever *adds* trees (never moves existing ones) — required for the on-ramp's literal "same spark, one more tree," and a valid sampling of the same Bernoulli(*d*) field.
- One **lightning** ignites a chosen/random tree. Fire spreads each tick to **4-neighbor (von Neumann)** trees that are adjacent to a burning cell. Burning cells become **burned** (spent) after one tick.
- **Critical density d\_c ≈ 0.59** — the site-percolation threshold on a 2D square lattice (p\_c ≈ 0.5927). Below it, burn clusters stay local; above it a spanning cluster exists and the burn reaches across / consumes a giant fraction. The fraction-burned-vs-density curve is a sigmoid with its knee at ≈d\_c.
- **Seedable PRNG (mulberry32 or equivalent)** — a given (seed, density, spark cell) reproduces exactly. "Shuffle" advances the seed for a new random forest.

### 4.2 On-ramp — 3 light beats (🔒 CHOREOGRAPHY LOCKED — ticket 02)

> **🔒 ON-RAMP-LOCK (ticket 02, `/grilling` + Intent, approved by Dustin 2026-07-23).** Full choreography + the 12 locked decisions: [`.scratch/cascade/issues/02-on-ramp-choreography.md`](../../.scratch/cascade/issues/02-on-ramp-choreography.md). **Spine:** plant a linear expectation, then shatter it — the aha is *"the world has cliffs, not ramps,"* felt in the fingertips (beat 2 is the *trap* that makes beat 3 shocking). **User-acts every beat** (no watch-only); beat 1 teaches Spark (tap a tree → fixes the protagonist cell), beats 2–3 teach the density slider. Beats designed on the real stage (ticket 01).

1. **"A spark here goes nowhere."** d≈0.40. User **taps a tree** → fixes the spark → a tiny local patch burns and dies. Plot marker sits **cyan**; trial point #1 drops near the floor.
2. **"Denser. A bigger scar. Still stops."** User **drags density to ≈0.52**; monotonic fill adds trees around the *same fixed spark*, whose burn re-runs live → bigger scar, still contained. Point #2 drops slightly higher (two low points = the linear *trap*).
3. **"One more tree. Same spark. Everything."** A pulsing **knee-tick** invites *"one more nudge"*; dragging **past d\_c≈0.59** flips the marker **cyan→amber mid-drag** and the same spark **sweeps the whole forest**. Point #3 leaps up; the **knee blooms + the curve resolves in sync with the crossing** (not before). ← the aha. Then releases to the sandbox (*"Now it's yours."*).

### 4.3 Free sandbox
Full density slider (0→1 with the ≈0.59 knee felt), spark anywhere by click, Play/Pause/Speed, run repeated trials, Seed/Shuffle, Reset. **Density change fills/empties the forest monotonically** (drag up = trees appear, drag down = they vanish in reverse order — the ticket-02 `r_i < d` model, so the slider feels physical); **only Shuffle re-randomizes** (advances the seed). A burn animates cell-by-cell with warm-spectral glow + halo, leaving charcoal scar.

### 4.4 Signature plot (the Visual Cinnamon payoff) — 🔒 treatment locked (ticket 01)
- **Fraction burned (y) vs density (x).** Each completed trial drops a point; the **S-curve builds from the user's own play**, revealing the sharp **knee at ≈0.59**.
- **Locked treatment = Direction A (scientific/rigorous), not data-art.** Faint real **scatter cloud** of individual trials (kept for honesty) + a **smoothed mean curve** (light 3-pt moving average for display; raw scatter shows the true spread) drawn with a **left→right spectral gradient stroke** (amber→magenta, rhyming with the fire); faint gridlines on dark. No area-fill, no glowing curve — the plot stays an instrument. (Direction B's glow-curve + spectral area-fill was the rejected alt.)
- **Annotation label OFF the curve** — `d_c ≈ 0.59 / "the same spark now takes everything"` in whitespace with a thin leader, never overlapping the data (canon's overlap rule). A vertical hairline + hot-core dot mark the knee.
- **Live density marker:** a vertical line + dot tracking the control-bar density, **cyan below d_c → amber at/above** — this is the beat-3 "knee lights up in sync" mechanic, proven in the prototype (drag 0.52→0.62 flips fizzle→sweep).
- Mono (JetBrains) axis labels. Source/method line: *"site-percolation threshold · square lattice ≈ 0.5927."*
- **Method (real data underneath):** the curve is a genuine **Monte-Carlo** — for each density, N trials spark the forest and record burned/total; the mean traces the order-parameter sigmoid with the knee at p_c. In the sandbox this is fed live by the user's own completed trials; the prototype pre-computes it (~16 trials × ~46 densities on a 64² grid) to show the target shape.

### 4.5 Acceptance (exhibit 1)
Runs 60fps at target grid size; the 3 beats reproduce reliably (seeded); crossing ≈0.59 visibly flips fizzle→total burn; the plot's knee emerges from real trials; keyboard + reduced-motion paths work; looks beautiful live in-browser (design-first — verified, not assumed).

---

## 5. Exhibits 2 & 3 (graduate onto the proven shell — new rule-sets)

### 5.1 Sandpile / self-organized criticality (🔒 INSTRUMENT LOCKED — ticket 04)

> **🔒 INSTRUMENT-LOCK (ticket 04, `/grilling`, approved by Dustin 2026-07-24).** 7 forks + 10 derived decisions, designed against the *built* shell: [`.scratch/cascade/issues/04-sandpile-instrument.md`](../../.scratch/cascade/issues/04-sandpile-instrument.md). **Spine: "nobody set the dial."** Exhibit 1 put the cliff wherever the user's hand put it; the pile walks to its own edge and parks there. That contrast is the trio's intelligence, and it is taken literally in the chrome, the stage, the charge, and the plot.

- **Model:** Bak–Tang–Wiesenfeld. Grid; each cell holds grains; a cell with **≥4 grains topples**, sending 1 grain to each of its 4 neighbors; grains at the boundary leave the system. Grains drop one at a time (chosen cell or random); the pile **self-tunes to a critical slope**, after which a single grain can trigger an avalanche of *any* size. **Grid 64²** — bigger cells than fire's 128×82 so one topple is legible; ~8.7k grains resident at h̄≈2.125. Charge is a **seeded** drop sequence (replayable); Shuffle advances the seed.
- **The dial (🔒):** the control bar's parameter slot holds a **read-only, self-driving slope readout** — mean grains/cell, a true order parameter — that climbs as the pile loads and **parks at ≈2.1**, marked with a critical tick. No handle, no groove, **not focusable**: un-touchability is the meaning. The sandpile has no user-owned parameter.
- **Stage (🔒):** cell height 0→3 on a **cool→warm sequential ramp** (dim teal → amber), so the field visibly heats as it self-loads and settles into a tense mixed state; toppling cells flash **white-hot on the `FIRE` age ramp with the halo bloom** (unchanged machinery, `lighter` composite). Sequential + monotone luminance ⇒ CVD-safe by §1.2's rule. Rest field dimmed so topples keep contrast; every avalanche gets a **≥2-frame visible flash**.
- **Two time bases (🔒):** **charge** ≈12 s, batched (~1.2k grains/s), no per-avalanche animation, the dial climbs — *watched, not skipped* (it is the proof of the spine), but **skippable and re-runnable**; then **critical**, one grain per click at the clicked cell, each avalanche animated as a front reusing fire's `paintFrame`/`ageOut`.
- **Signature plot (🔒):** **log-log survival curve — the user's own avalanches, biggest first** (for each size *s*, how many were at least that big). No binning, so it reads as a clean straight line by ~20 avalanches and each drop inserts a point live; a **faint baked backbone** from one long build-time run sits underneath as the shape it converges to. Straight line = no bump = **no typical size**. Annotation **off the line** with a thin leader + hot-core dot on the **user's own max** (*"one grain, 6,140 cells"*). Source line: *"Bak–Tang–Wiesenfeld 1987 · τ ≈ 1.1–1.3 (approx.)"* — state the exponent approximately, never over-claim. *(The binned log-log histogram was the rejected alt: binning artifacts at low N, and the plot would be pre-baked rather than built by play.)*
- **Readouts (🔒):** `grains` · **`1 grain → N cells`** · ratcheting `biggest`. The left side of the arrow **never changes** — that invariance is the small→big argument. `aria-live` on the pairing. The exhibit also **writes `cascade.sp.biggest`** (one number, best-effort) so the coda's panel-2 `★` can mark the user's own max — never load-bearing (🔒 ticket 06).
- **Controls (🔒):** read-only `slope` dial · **● Drop** (click the stage, or Enter at the focus cell) · **▷ Feed** · **speed** · **⤫ Shuffle** · **↺ Reset**. Reduced motion: the avalanche is an immediate before/after swap, with the outcome carried by the readout + the new plot point. No-JS: the baked backbone, copy, and source line still render.

> **🔒 ON-RAMP-LOCK (ticket 05, `/grilling`, approved by Dustin 2026-07-24).** 8 forks + 12 derived decisions: [`.scratch/cascade/issues/05-sandpile-on-ramp.md`](../../.scratch/cascade/issues/05-sandpile-on-ramp.md). **Spine: the trap is the dial you no longer have.** Fire trapped the user with their own hand *on* the dial; the sandpile traps them with the expectation that a dial exists — planted for free by exhibit 1 ("I set the parameter") and by a needle climbing for twelve seconds — then **refuses** them. Two shatters, one story: beat 2 breaks *more input → more parameter*, beat 3 breaks *small input → small output*.

**On-ramp — 3 light beats (🔒 ticket 05):**

1. **"It loads itself. Then it stops."** Empty table, dial `0.00`. Prompt `drop a grain` → they **tap a cell**; one grain sits there and **nothing happens** (`1 grain → 0 cells` — the baseline beat 3 detonates). Mid-line `one grain does nothing. here are fifteen thousand.` hands over to the **batched charge they started**: ~12 s, dial climbs, field warms, **parks ≈2.1**. Gate = the dial parks.
2. **"All that. The slope didn't move."** Prompt `pour it in — push the slope higher`; ▷ Feed + speed spotlit; they crank speed and hold the feed. `grains` races into the thousands, the stage roils, the slope sits at its critical tick. Gate = ~3,000 grains with Δslope < 0.02. ← **the trap sprung**
3. **"The same grain. Nothing, then this."** A **pulsing ring** marks one seeded cell (the rhyme with fire's pulsing knee-tick); prompt `one more grain — here`. The drop triggers the **session's first *animated* avalanche** — a front takes ~a quarter of the field white-hot — and in the same frame `1 grain → 6,140 cells` appears, the **first plotted point ever** lands far out on the right tail, the faint backbone **brightens** beneath it, and the annotation resolves off the line. **Off-ring drops are honored** as real small avalanches (the near-miss, ticket 02's 0.58-still-fizzles principle). ← the aha. Then releases to the sandbox (`drop anywhere →` · *"Now it's yours."*).

- **On-ramp rules (🔒):** **batched = weather, animated = event** — weather (charge, feed, Reset recharge) moves only the dial and the field's warmth and **never plots**; events move the readout and the plot. `1 grain → N cells` is present from beat 1 and **dimmed through the batched phases**; `biggest` first appears at beat 3. The feed is always **one grain → resolve → next grain** (concurrent grains would genuinely raise mean height and beat 2 would be a lie); speed changes wall-clock only. Control gating: beat 1 stage-only · beat 2 adds Feed + speed · beat 3 stage-only · release adds **only ⤫ Shuffle + ↺ Reset** (unlike fire, which released Play/Speed). Charge runs at **three rates — paced ~12 s (on-ramp) · instant (skip / return) · ~1–2 s (↺ Reset)**; skip and reset always leave a **charged** pile, never a dead flat table. Completion flag `cascade.sp.onramp` + quiet *"▷ replay intro."* Keyboard: beat 3 moves the stage focus cell onto the ring. Reduced motion: the avalanche is a before/after swap carried by the readout + the new plot point. ⤫ Shuffle is gated out of the on-ramp so the ring's seed can't drift.
- **Lesson:** catastrophes of every magnitude are built into critical systems and are fundamentally unpredictable — **and nobody set the dial.**
- **Coda fill (for §6 / ticket 06):** `CRITICALITY` · the survival line · *"Systems drift to their own edge and stay there."* · **"Nobody set the dial."** · *"An idea going viral."*
- **Build consequences this exhibit carries:** the shell's **first real engine generalization** (`Params.value` / `Stats` / `StepResult` in `src/lib/types.ts` are fire-shaped), **log scales** in `plot-geometry.ts` (fire's are linear), and the landing's **second live door** (§2).

### 5.2 Network cascade / blackout (🔒 LOCKED — ticket 07)

> **🔒 EXHIBIT-LOCK (ticket 07, `/grilling`, approved by Dustin 2026-07-24).** 9 forks + 16 derived decisions: [`.scratch/cascade/issues/07-network-exhibit.md`](../../.scratch/cascade/issues/07-network-exhibit.md). **Spine: "you can't tell which."** Fire and the sandpile both hand out a **homogeneous** field — any tree above d_c, any cell at criticality — so *where* you act barely matters and the open question is *when* or *how big*. The grid's parts look alike and **are not alike**. That completes the trio as **when · how big · which**, and it makes the signature plot the *map of what the hand could not see*.

- **Model (🔒):** **Motter–Lai (2002) on a Watts–Strogatz small-world grid.** **180 nodes** on a jittered ~15×12 lattice, mostly-local edges plus a few rewired long links (W–S 1998 measured the actual US Western power grid; the long links create **bridges whose importance degree does not predict** — which is what makes the spine true rather than asserted). Node load = **betweenness centrality**, capacity = `load₀ × (1 + α)`. Taking a node offline re-routes flow; any node now over capacity fails; iterate to a fixed point. **Deterministic** given (graph, α, node) — one canonical seeded grid, **no Shuffle** (the graph is the subject, not statistical noise, and this keeps the baked profiles, the ring node and the coda's needle field the *same object* the user played).
- **The act (🔒):** **one knock-out per run, then the grid restores** — click → cascade animates → readout lands → a ~600 ms relight sweep, ready for the next. Every click is a clean experiment on the same grid (so each contributes one honest plot point), repeated trials are what let the on-ramp's trap work, and real grids do come back up. Cumulative damage was rejected: it confounds *which node* with *how much damage already done*.
- **Stage (🔒):** live node = dim teal sized by degree · edges hairline and faint · a failing node flashes **white-hot on the `FIRE` age ramp with the locked halo bloom** then goes near-black · **islanded** nodes (cut off) fade dark **without** a flash (overload and starvation are physically different). The field **darkens progressively** as the cascade runs — the glow payoff. Rendered by **`graph-stage.ts`**, a sibling of `stage.ts` reusing the halo sprites, bloom constants and `lighter` composite unchanged; a grid of cells and a graph of nodes are different objects, so `stage.ts` is *not* forced to cover both.
- **Signature plot (🔒):** **the ranked cliff.** x = every node ranked by the fraction its removal takes down, y = % dark — a long flat floor and a cliff at the far left. A **faint computed backbone** shows the whole profile; **each node the user takes offline drops a bright dot at its rank**, so harmless attempts visibly pile up on the floor and the ringed one lands on the cliff. Same bright-series-over-faint-backbone grammar the sandpile proved; third distinct shape (S-curve · straight log-log · **cliff**). Annotation off the line with a thin leader: *"7 of 180 nodes take down more than half."* Source line: *"Motter–Lai 2002 · small-world grid (Watts–Strogatz 1998) · 180 nodes."* Rejected: a heavy-tail survival curve (what this section used to sketch — but it is panel 2's shape on panel 2's axes, so the board would show one shape twice) and a degree-vs-size scatter (renders as a featureless blob).
- **Readouts (🔒):** `tried` · `dark` · `worst`. **`tried` carries the spine** — after four harmless attempts the counter itself says *I have been trying to break this and cannot*, and then the fifth reads 78%. `aria-live` on the trio. It must **never** borrow the sandpile's `1 grain → N cells` arrow (🔒 ticket 04 owns that form).
- **Controls (🔒):** ● **Knock out** (click the stage, or Enter at the focus node) · **`slack` α slider — sandbox only** · ↺ **Reset**. Cutting slack **visibly widens the backbone's cliff** as more nodes become lethal — distinct from fire's dial, which *built the field*, where this one changes **how many parts are load-bearing** (and it is literally the hot day in the panel's echo). **No Play/Pause/Speed** — a cascade is an event, not a continuous time base. α is a **stepped** slider so the ranked profile for every stop can be **baked at build time** and nothing is ever computed at runtime; the cascade the user triggers is computed live by the same code, so a clicked node's outcome and its plotted rank agree by construction (a test asserts it).
- **a11y (🔒):** stage focusable; **arrows move the focus ring to the nearest node in that direction** (a graph is spatial, so spatial navigation is the honest mapping); Enter takes it offline. **Reduced motion:** the cascade resolves as an immediate before/after swap carried by the readout + the new plot dot, and the restore is instant. **No-JS:** the baked ranked backbone, annotation, sci line and source line all render.

**On-ramp — 3 light beats (🔒 ticket 07).** *Spine: you cannot break it, and then you can.* Fire trapped the user with their hand on the dial; the sandpile refused to be pushed; the network lets them **hunt and come up empty** — twice, the second time with the obvious suspect handed to them — then points at a node that looks like nothing.

1. **"Take one out. The grid holds."** Prompt `knock out any node` → they click; neighbours flash amber as load re-routes, **nothing dies**, `dark 0.3%`, the grid relights. Their first bright dot lands on the plot's flat floor.
2. **"Even the biggest one."** Prompt `now the biggest one — it's the fattest dot`, that node spotlit. They kill it; the grid **absorbs it**, `dark 1.1%`. Second dot, still on the floor. ← **the trap sprung** — the hub intuition every viewer arrives with, dead, and honestly so: under load redistribution the killer is usually a **bridge**, not a hub.
3. **"This one. Nothing about it looks different."** A **pulsing ring** (the rhyme with fire's knee-tick and the sandpile's ring) marks one ordinary mid-degree node. The click cascades in rounds across the whole grid, the stage going progressively dark, `dark` racing to **~78%**; **their third dot lands on the cliff**, three ranks from the left, annotation resolving off the line. **Off-ring clicks are honoured** as real attempts (the near-miss principle, tickets 02 + 05): readout updates, `tried` increments, the beat stays open, the ring keeps pulsing. ← the aha. Then releases to the sandbox (`knock out anything →` · *"Now it's yours."*).

- **On-ramp rules (🔒):** gating = beats 1–3 stage-only, release adds **only `slack` + ↺ Reset**; the **restore is never gated** (a beat that leaves the grid dark cannot be retried). The plot is **live from beat 1** (the backbone is the no-JS content), so beat 3's payoff is a dot landing where the first two could not reach. Completion flag `cascade.nw.onramp` + the quiet *"▷ replay intro."* rhyme. **"Nothing looks load-bearing."** stays **unspent** — it is the coda's callback.
- **Lesson:** in connected systems one local failure can cascade to global collapse — **and nothing on the outside tells you which part is load-bearing. Neutral infrastructure only** ("knock out" stays an engineering word: a node goes offline). Never social/political framing.
- **Coda fill (§6 / panel 3):** `CASCADE` · the needle field · *"One failure can take the whole connected system."* · **"Nothing looks load-bearing."** · *"A grid failing on a hot day."*
- **Build consequences this exhibit carries:** `graph-stage.ts` (the node/edge renderer), a tested `network.ts` (Brandes betweenness + the Motter–Lai fixed point), the **build-time baked profile artifact** (one ranked profile per α stop), needle/bar geometry in the plot component, the landing's **third door**, and the `/exhibit → /synthesis` **arrival routing** (a quiet persistent `synthesis →` rail link on all three exhibit pages + back-links on the coda).

---

## 6. Synthesis coda (`/synthesis`)

> **🔒 PANEL-1 + SLOT LOCK (ticket 03)** · **🔒 PANEL-2 + BOARD LOCK (ticket 06, `/grilling`, approved by Dustin 2026-07-24)** — [`03-synthesis-coda-first-panel.md`](../../.scratch/cascade/issues/03-synthesis-coda-first-panel.md) · [`06-coda-panel-2.md`](../../.scratch/cascade/issues/06-coda-panel-2.md).

Header: **"One small thing, enormous consequences — three ways the world does it."** The coda plays the **opposite register to the exhibits** — calm, still, no stage; the signature plot leads and *names* what the hand already felt. Apolitical real-world echoes attach **per panel**.

**The board-slot contract (🔒 ticket 03).** Every panel = `{ concept-word · hero plot (its real shape, ONE critical feature off-line-annotated, cool-safe/warm-catastrophe coloring) · plain line · felt callback · real-world echo }`, plus **one restrained re-feel**. The rhyme lives in identical framing / annotation / color, never in forcing the shapes to match.

**Panel 1 — `THRESHOLD` (🔒 ticket 03).** Canonical baked fraction-burned-vs-density S-curve (§4.4 treatment, always drawn — works on direct arrival) + optional static **`★ your run`** tick from `cascade.ff.crossing`. Annotation `threshold · d_c ≈ 0.59`, off-line + leader + hot-core knee dot. **Re-feel:** drag (or arrow-key) the marker across the knee — the y-readout **leaps**, the marker **flips cyan→amber at the exact d_c pixel**, the catastrophe regime **floods warm**. Plot-space only, no sim. Copy: *"Cross a line and the same spark changes everything." / "Cliffs, not ramps." / "An epidemic past R = 1."*

**Panel 2 — `CRITICALITY` (🔒 ticket 06).** Designed as the **inverse of panel 1 under the same hand**. Baked log-log **survival curve** (the same build-time BTW artifact the exhibit's backbone uses) + optional **`★ your biggest`** on the line from `cascade.sp.biggest`. Annotation marks **the straightness itself** — `no typical size · τ ≈ 1.1`, off-line + leader, **no hot-core dot** (nothing to mark *is* the inversion). Source line *"Bak–Tang–Wiesenfeld 1987 · τ ≈ 1.1–1.3 (approx.)"*. Coloring: **one continuous cool→warm ramp along the line, no regime split** (same palette, boundary removed; CVD-safe sequential). **Re-feel:** the same drag — the **rarity readout** `1 in 400 drops ≥ 900 cells` climbs three orders of magnitude **with no break anywhere**, and the marker **warms continuously, never flips**. Rests at the small end. It must **never** re-spend exhibit 2's `1 grain → N cells` or its refusal beat (🔒 ticket 05). Copy: *"Systems drift to their own edge and stay there." / "Nobody set the dial." / "An idea going viral."*

**Panel 3 — `CASCADE` (🔒 ticket 07).** The **needle field**: the same per-node data as the exhibit's ranked plot, deliberately left **UNSORTED** — all 180 nodes in the grid's own arbitrary order, each a hairline needle whose height is the fraction its removal takes down. A flat fringe with a few spikes and **no order to them**. One continuous cool→warm ramp by height (panel 2's rule — sequential, CVD-safe). Annotation off the field with a thin leader **on the floor, not on a spike**: *"7 of 180 · nothing on the outside says which."* Optional **`★ you found this one`** on the needle the user's own worst belongs to (`cascade.nw.worst`, absent-safe). **Re-feel:** the same drag — the readout **jumps with no pattern** (`node 41 → 0.3% dark`, `42 → 0.6%`, `43 → 71%`, `44 → 0.5%`): no line, no ramp-up, no warning. Panel 1 has an edge you can find, panel 2 has none, **panel 3 has one you cannot locate** — three panels, three feels. Rests at the left. It must **never** re-spend panel 2's rarity sentence (it counts *nodes*, never "1 in N"), the sandpile's arrow, or panel 1's flip and flood. `aria-valuetext` speaks *"node 43 of 180, takes down 71 percent."* Reduced motion is free — nothing animates. Copy: *"One failure can take the whole connected system." / "Nothing looks load-bearing." / "A grid failing on a hot day."*

**The board (🔒 ticket 06).** The board **widens as panels land**: container `960 → ~1280 → ~1500`, plots `860 → ~560 → ~430`; **side by side at ≥1100px**, stacked below it with each plot back at hero scale. Scatter thins then drops below ~560px of plot width so the curve stays the object. Panel order is fixed **THRESHOLD → CRITICALITY → CASCADE**. Every panel keeps its own re-feel; markers are **never synced**. *This amends ticket 03 dec. 7 — hero scale was a solo-panel privilege; the board buys comparison with size.*

**Beneath the board:** at **n≥2**, one muted board-level line names the trio's intelligence — **"One edge you cross. One a system finds by itself."**, growing a third clause at n=3: **"… One you'd never have picked."** (🔒 ticket 07 — three clauses for three panels, rhythm 4 / 6 / 5 words, and the third stays true for a direct arrival who never played the exhibit). Board-level, never inside a panel, so every panel stays standalone. Then the degrade line: **no ghost cards, ever** — solo *"criticality and cascade — the next two exhibits."* → n=2 *"cascade — the last exhibit."* → **n=3 nothing** (there is nothing left to promise).

**Arrival routing (🔒 ticket 07).** Each exhibit page carries a quiet, persistent **`synthesis →`** link in its header rail — present from arrival, no gating, no state, works with no JS, never interrupts the instrument — and `/synthesis` carries **back-links to the three exhibits**. Rejected: revealing it at on-ramp release (best timing, but it costs beat-runner state and a skipping visitor needs a second path anyway) and landing-only (free, but almost nobody who plays an exhibit would reach the coda that is the point of the site).

**a11y / degrade (🔒 tickets 03 + 06).** Markers are `role="slider"`, keyboard-operable, with `aria-valuetext` speaking the outcome in words (panel 2's speaks the rarity sentence); panel 2 is inherently reduced-motion clean (nothing flips or floods); **no-JS** renders every plot, annotation, source line and all copy — the re-feels are pure enhancement, never load-bearing. Every `★` is best-effort: absent ⇒ the panel is still complete.

This synthesis is the intelligence the boids version lacked — it is the point of the site.

---

## 7. Tech / constraints / deploy

- **Stack:** Astro (static) + TypeScript + Vitest; **canvas 2D** rendering; seedable PRNG (mulberry32). Mirrors the Namesake build model. **WebGL not required** — grids ≤ ~160² and graphs ≤ ~200 nodes render fine on 2D canvas at 60fps; only reach for WebGL if profiling forces it.
- **Hard constraints (verbatim, honored):** FREE; LOW upkeep — fully **in-browser computed, NO dataset, no cron**; **deterministic where possible**; static, ~zero runtime; self-contained.
- **Deploy (Namesake gotchas baked in):**
  - Standalone repo `github.com/dustincole-data/Cascade`, public, `main`.
  - Its **own Vercel project**, Node 22, 100% static → ~zero runtime compute (do NOT proxy through the main site).
  - `base:'/'`, **default `outDir`** (so `astro preview` works — don't nest outDir), `site='https://cascade.dustincoledata.com'`.
  - DNS: CNAME `cascade` → Vercel. Verify live: landing, each exhibit route, plot render.
  - **Static OG image only** (no `@vercel/og` edge fn — simpler than Namesake; nothing here is per-URL personalized).
- **dustincoledata link-in:** add a Cascade `<ProjectCard external>` on `/projects` (external subdomain pattern), later. Out of scope for this repo's build; note for the site session.

## 8. Accessibility & performance
- Keyboard-operable controls; visible focus ring; logical tab order.
- `prefers-reduced-motion` honored (sims start paused; no motion-only information).
- CVD-validated palette (§1.2) via `validate_palette.js` — ✓ done (ticket 01, poles ΔE 8.8 ≥ 8.0); state also carried by luminance + position, not color alone.
- **60fps confirmed (ticket 01), and the render strategy that gets it there:** the rAF loop must **repaint only the moving burning front** (cache the flat forest/scar as a static background), not the whole grid — the front is ~O(perimeter) cells (~125 at 160²) → **1.66 ms/tick @160²** on integrated graphics (Intel Iris Xe), far under the 16.7 ms line. A whole-grid repaint is ~38 ms, so do that **once on density change / reset**, never per frame. Cache the additive glow as offscreen halo sprites (`drawImage` + `globalCompositeOperation:'lighter'`). **Canvas 2D holds 60fps at the spec's top grid (160²) — no WebGL needed.** `devicePixelRatio`-aware canvas; pause rAF when tab hidden / offscreen.

---

## 9. Build plan (phased, low-risk — one complete exhibit always ships)

**Phase 0 — Look-study (build-task-zero; design-first gate).**
Static 2-direction look-study of the **dark stage**: a frozen mid-burn fire frame + one signature plot + the chrome/control-bar treatment, two variations. Use `/prototype` + Impeccable. **Dustin picks one before the engine is wired** (honors `design-anchor-before-mocks` / `design-first-on-visual-projects`). Output: an approved static look reference in `.claude/plans/` (Namesake pattern).

**Phase 1 — Shell.**
Astro scaffold + deploy config (§7). Engine interface (§3.1), layout/theme, control bar + shared vocabulary, beat-runner, reusable signature-plot component, seed/reset, a11y plumbing. Verify with a trivial placeholder exhibit.

**Phase 2 — Exhibit 1 (forest fire) end-to-end.**
Implement the CA on the shell (§4). Wire the 3 on-ramp beats, the sandbox, the fraction-burned-vs-density plot. **Verify the look live in-browser at each step** (never leave polish to the end). Meet §4.5 acceptance.

**Phase 3 — Landing + synthesis coda.**
Landing frames the thesis and register; `/synthesis` works with just exhibit 1's plot present (2 & 3 slot in later).

**Phase 4 — Ship exhibit 1** as a complete, standalone-valid piece (deploy + live-verify).

**Phase 5 — Graduate exhibit 2 (sandpile),** then **exhibit 3 (network)** as new rule-sets on the proven shell (§5). Each: on-ramp beats + sandbox + its signature plot + live look-verify; extend the synthesis coda. **Exhibit 2 additionally carries** (🔒 ticket 04): the engine generalization off fire-shaped types, log scales in the plot component, a build-time baked survival backbone, and the landing's second live door — plus (🔒 ticket 05) a **batched phase that renders** (thousands of drops per frame, repainting only the field's warmth and the dial — fire has no equivalent), the **ring-cell selection pass** (same seed → same monster → fixed copy), the three charge rates, and the `Beat` shape generalization (exhibit-specific pre-set state, wider `spotlight`, optional `mid` line). **Coda panel 2 + the 2-up board ship *with* exhibit 2, not after it** (🔒 ticket 06 — the board is the reason exhibit 2 is worth shipping): the `coda-sandpile` config, the widening/responsive board, the board-level contrast line, and the `cascade.sp.biggest` write. **Exhibit 3 additionally carries** (🔒 ticket 07): **`graph-stage.ts`** (a node/edge renderer beside the cell renderer, reusing the locked halo), a tested **`network.ts`** (Brandes betweenness + the Motter–Lai fixed point), the **build-time baked profile artifact** (one ranked profile per `slack` stop), **needle/bar geometry** in the plot component, the landing's **third door**, and the `/exhibit → /synthesis` **arrival routing**. **Coda panel 3 + the 3-up board ship *with* exhibit 3** — `data-panels="3"` is a step in ticket 06's locked rule, so the board needs no new layout logic, only the third clause on the seam line and the promise line's removal.

**Fallback:** if time runs short after Phase 4, one complete exhibit still ships as a finished product.

**Tracker:** local markdown in the repo (a `PROGRESS.md` or `.claude/plans/` build log). No external tracker.

---

## 10. Risks & watch-items
- **Blind-mock burn (Dustin's #1 design frustration):** mitigated by Phase 0 look-study + anchoring on named references, not iterating mocks blind.
- **Billboard/serif/AI-tell reflex:** guard the type rules (§1.3) — small Archivo, mono labels, no giant hero, no decorative generative art. The plots are RIGOROUS real (sim-generated) data with labels/annotation/source line.
- **Glow reading tacky:** discipline the halos with Stefaner rigour; validate on the actual dark ground.
- **Perf:** cap grid/graph sizes; profile before adding WebGL.
- **Apolitical guard:** network exhibit stays a neutral power grid, always.
- **Scope creep:** exhibits 2 & 3 are rule-sets on the shell, not redesigns; resist per-exhibit bespoke chrome.

## 11. References (anchor the look; do NOT copy)
- **Nicky Case** (explorable explanations, the forest-fire/percolation lineage) · **Bret Victor** (explorable-explanation ethos).
- **Visual Cinnamon / Nadieh Bremer** — spectral color + radial glow (the signature graphics register). `visualcinnamon.com`
- **Truth & Beauty / Moritz Stefaner** — editorial rigour + calm chrome. `truth-and-beauty.net`
- **Giorgia Lupi** — hand-feel / legend-as-art accent. `giorgialupi.com`
- Borrow-recipe zones (`dustin-dataviz-borrow-recipe`): Stefaner = frame · Bremer = hero mark (glow) · Lupi = legend/key.

---

## 12. Look-study brief (for Phase 0)
Deliver a single static HTML with **two directions** of the dark stage, each showing: (a) a frozen mid-burn forest-fire frame (warm-spectral glow + halo on `--stage`, charcoal scar, cool-teal unburned), (b) the fraction-burned-vs-density signature plot with an off-line annotated knee, (c) the control bar + one heading in small Archivo + mono labels. Vary the two directions on glow intensity / chrome weight / plot treatment — NOT on the locked fundamentals (dark stage, small type, CVD-honest poles). Dustin picks one; that becomes the visual lock for Phases 1–5.
