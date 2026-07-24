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

- Each exhibit **ends by handing to the next** (a quiet "next: criticality →").
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
- **Signature-plot component** — a reusable canvas/SVG plot that accepts the exhibit's `sample()` stream and a plot config (axes, annotation, ramp). One component, three configurations.
- **Seed + reset** infrastructure (seedable PRNG, deterministic replays).
- **A11y plumbing** — keyboard bindings, focus management, reduced-motion switch.

### 3.3 Shared control vocabulary
| Control | Fire | Sandpile | Network |
|---------|------|----------|---------|
| **Parameter slider** | density *d* | drop-rate / grains | node load / tolerance α |
| **Click-to-act** | Spark (ignite a tree) | Drop a grain | Knock out a node |
| **Play / Pause** | ✓ | ✓ (grain feed) | ✓ (cascade step) |
| **Speed** | ✓ | ✓ | ✓ |
| **Reset** | ✓ | ✓ | ✓ |
| **Seed / Shuffle** | reproduce vs new random field | ✓ | ✓ |

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

### 5.1 Sandpile / self-organized criticality
- **Model:** Bak–Tang–Wiesenfeld. Grid; each cell holds grains; a cell with **≥4 grains topples**, sending 1 grain to each of its 4 neighbors; grains at the boundary leave the system. Grains drop one at a time (chosen cell or random); the pile **self-tunes to a critical slope**, after which a single grain can trigger an avalanche of *any* size.
- **On-ramp beats:** (1) drop grains, watch the pile build; (2) it reaches a critical, self-maintained slope; (3) now one grain → sometimes a tiny shift, sometimes a system-wide avalanche — you can't predict which.
- **Signature plot:** **log-log histogram of avalanche sizes** → a straight line = a **power law** (no characteristic scale). Label the slope as an approximate power-law exponent (2D BTW is commonly cited near τ ≈ 1.1–1.3; the literature reports a range — state it approximately, don't over-claim a precise value).
- **Lesson:** catastrophes of every magnitude are built into critical systems and are fundamentally unpredictable.

### 5.2 Network cascade / blackout (apolitical power grid)
- **Model (keep legible + cheap):** a modest graph (~100–200 nodes, grid-ish/small-world "power grid"). Each node carries a **load** with **capacity = load × (1 + tolerance α)**. **Knock out one node** → its load redistributes to connected neighbors → any neighbor now over capacity **fails** and pushes its load onward → **cascade**. Deterministic given (graph, α, which node). Most knock-outs are contained; a rare few collapse the grid.
- **On-ramp beats:** (1) here's a connected grid, humming; (2) knock out a node — usually the grid absorbs it; (3) knock out *this* node — the same single action cascades and the grid goes dark. (Stage literally darkens as nodes fail — glow's payoff.)
- **Signature plot:** **cascade-size distribution** over knocking out each node in turn — a **heavy tail** (most tiny, a rare few total).
- **Lesson:** in connected systems, one local failure can cascade to global collapse. **Neutral grid only — never social/political framing.**

---

## 6. Synthesis coda (`/synthesis`)

The three signature plots side by side, each with one plain line:
- **Forest fire → the knee** (threshold): *cross a line and the same spark changes everything.*
- **Sandpile → the power law** (criticality): *disasters of every size are built in and unpredictable.*
- **Network → the heavy tail** (cascade): *one failure can take the whole connected system.*

Landing statement: **"One small thing, enormous consequences — three ways the world does it."** Apolitical real-world echoes stated plainly (an epidemic past R=1; an idea going viral; a grid failing on a hot day). This synthesis is the intelligence the boids version lacked — it is the point of the site.

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

**Phase 5 — Graduate exhibit 2 (sandpile),** then **exhibit 3 (network)** as new rule-sets on the proven shell (§5). Each: on-ramp beats + sandbox + its signature plot + live look-verify; extend the synthesis coda.

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
