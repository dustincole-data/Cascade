# Cascade — build log

Tracker for the phased build in the locked spec, [§9](.claude/plans/2026-07-23-cascade-design.md).
Plan being executed: [2026-07-24-cascade-forest-fire-build.md](.claude/plans/2026-07-24-cascade-forest-fire-build.md).

## Phases

- [x] **Phase 0 — Look-study** (2026-07-23). Dustin picked the graft: Direction B's stage bloom inside Direction A's framed chrome + rigorous plot. Reference: [`.scratch/cascade/assets/01-forest-fire-look.html`](.scratch/cascade/assets/01-forest-fire-look.html).
- [x] **Phase 1 — Shell.** Astro static scaffold, deploy config, locked palette + type tokens, instrument chrome, control bar, seed/reset, a11y plumbing, reusable signature plot.
- [x] **Phase 2 — Exhibit 1 end-to-end.** Percolation core (tested), canvas stage, live signature plot, 3-beat on-ramp, free sandbox. §4.5 acceptance met and verified in-browser at every step.
- [x] **Phase 3 — Landing + synthesis coda.** Landing frames the thesis with one live door; `/synthesis` panel 1 built as a board-slot.
- [x] **Phase 4 — Ship** (2026-07-24). Repo [`dustincole-data/Cascade`](https://github.com/dustincole-data/Cascade) public, all commits pushed; Vercel project `cascade` **GitHub-connected** (a push to `main` builds automatically — proven, 15s build); DNS added at Namecheap and **live at [cascade.dustincoledata.com](https://cascade.dustincoledata.com)** (verified: `200`, title `Cascade — one small thing, enormous consequences`). Brand card live on [dustincoledata.com/projects](https://dustincoledata.com/projects).
- [x] **Phase 5 — Graduate exhibits 2 & 3.** **Exhibit 2 (sandpile) BUILT** (2026-07-24) from 🔒 tickets [04](.scratch/cascade/issues/04-sandpile-instrument.md) · [05](.scratch/cascade/issues/05-sandpile-on-ramp.md) · [06](.scratch/cascade/issues/06-coda-panel-2.md). **Exhibit 3 (power grid) BUILT** (2026-07-24) from 🔒 ticket [07](.scratch/cascade/issues/07-network-exhibit.md) — instrument, 3-beat on-ramp, sandbox with the `slack` slider, coda panel 3, the **full 3-up board** + its three-clause seam, the landing's third door, and the `/exhibit → /synthesis` arrival rail — all verified in-browser (evidence below). **110 tests green.** The trio is complete.

---

# Exhibit 1 — forest fire (Phases 1–4, 2026-07-23/24)

## Acceptance evidence (§4.5, verified live — not assumed)

| Requirement | Result |
|---|---|
| 60fps at target grid | Live sweep: **median 16.7 ms/frame, p95 17.2 ms** (296 frames). Isolated front repaint: **2.17 ms** with 324 front cells. |
| The 3 beats reproduce reliably (seeded) | Walked end-to-end from clean `localStorage`, repeatedly. |
| Crossing ≈0.59 flips fizzle → total burn | Same fixed spark, on the built output, crossing minimally at 0.596: **<1% → 3% → 35%** (≈50% by 0.62). |
| Knee resolves *in sync* with the crossing | Near miss at 0.58: curve hidden, marker cyan. 0.60: curve + annotation resolve, marker amber. |
| The plot's knee emerges from real trials | Monte-Carlo test asserts the steepest rise falls within ±0.06 of d_c. |
| Keyboard path | Full tab order verified; Enter sparks the stage; arrow-keys cross d_c; coda marker is a keyboard slider with `aria-valuetext`. |
| Reduced-motion path | Burn renders as an immediate before/after state; outcome carried by the swept readout and the plot point. |
| Coda with no JS | Built HTML contains the curve path, annotation, source line, all 4 copy lines, promise line, 738 scatter points. |
| Responsive | 390 / 768 / 1440 — no horizontal overflow; panels collapse to one column. |

## Deviations from the spec (deliberate)

1. **The signature plot is SVG, not canvas.** Ticket 03 dec. 11 requires the coda to render completely with no JS, which canvas cannot do. The plot only updates on discrete events (trial drop, marker drag), never per frame, so there is no perf cost. The stage stays canvas 2D. Locked §4.4 treatment reproduced exactly.
2. **No GSAP.** Spec §1.4 permits it for chrome entrances; nothing in this slice needed it. CSS transitions cover the beat caption swaps and the coda flood, and this avoids the whole `gsap-scrub-from-conflict` failure class.
3. **The landing shows one live door + one muted promise line**, not §2's three doors — exhibits 2 and 3 do not exist yet. This mirrors ticket 03's locked "clean degrade, no ghost cards" rule so the site reads finished, not WIP.

## Constants changed from the look reference (and why)

- **Front-band depth** is derived per burn — `max(4, round(maxTick * 0.14))`, the reference's own formula — rather than a fixed 5 ticks. A fixed depth made a long sweep read as a thin thread instead of the reference's glowing front. Bloom values (`forestDim 0.52`, `haloScale 3.0`, `haloAlpha 0.52`) are unchanged.
- **Stage cell size is fractional**, not floored to an integer. Flooring left a dead strip of up to 13% of the panel on narrow viewports, which reads as broken chrome.

## Defects found by walking it live (all fixed)

- `check()` ran on every slider input, so one beat scheduled several `advance()` timers; a stale one skipped beat 3 entirely and released to the sandbox early, destroying the payoff. Each beat now settles once, and timers are scoped to the beat that scheduled them.
- A fast drag could cross d_c while still on beat 2, leaving beat 3 permanently uncompletable. Each beat now re-checks its gate on entry.
- The exhibit never synced the server-rendered slider to `opts.startD`, so a returning visitor's model sat at 0.62 while the slider read 0.400.
- On-ramp sparks now snap to the spanning cluster, so beat 3's promised sweep cannot fizzle on an unlucky tap. The free sandbox stays unrestricted — an isolated pocket that barely burns above d_c is honest there.
- That snap was anchored at d=0.62 (the knee-tick's target) and still failed: the largest cluster at 0.62 is a *different component* from the one at 0.60, so a cell can belong to it and still sit in an isolated pocket at the moment of crossing. Measured across five tap points, one swept **1%** at 0.595. Re-anchored at 0.60 — now every tap sweeps ~35% the instant it crosses, rising to ~50% by 0.62.
- Lesson dwell raised 900 ms → 2400 ms; the payoff line was being wiped before it could be read.
- A real but tiny burn displayed a flat `0%`; it now reads `<1%`, which is beat 1's entire point.

---

# Exhibit 2 — sandpile (Phase 5, 2026-07-24)

## Acceptance evidence (🔒 tickets 04 · 05 · 06 — walked live, not assumed)

| Requirement | Result |
|---|---|
| A dial the user cannot touch climbs to a number they did not choose, and parks | Walked from an empty table: `0.00 → 0.10 → 1.67 → parks 2.10` over ~12s, 15,001 grains. The dial is `aria-hidden`, not in the tab order (bar tabbables: Drop · Feed · speed · Shuffle · Reset). |
| Feeding harder does not move the parked slope | Beat 2 at max speed: **+3,140 grains, slope 2.10 → 2.11** (drift 0.01 < the 0.02 gate). The refusal is legible without the caption — `grains` races, `slope` sits on its tick. |
| The same grain: nothing, then everything | `1 grain → 0 cells` in beat 1; **`1 grain → 1,378 cells`** (34% of the field) on the ring drop. Left side of the arrow never changed. |
| Beat 3 is the session's first *animated* avalanche, and the plot's first point lands with it | Confirmed: weather (charge + feed) plots nothing; the ring drop animates a white-hot front and drops the first point far out on the right tail, on the backbone's tail, annotation resolving off the line. |
| An off-ring drop is honoured | Yes — a real computed outcome (measured `27 cells`, and `0 cells` where the cell absorbs), readout updates, beat stays open, ring keeps pulsing. |
| The survival curve reads straight and builds from the user's own play | Straight run over two decades, τ ≈ 1.28 measured on the baked artifact; the user's series accumulates drop by drop under the backbone with the annotation riding their own max. |
| Skip / return / Reset always leave a **charged** pile | Skip → `2.10`, 15,000 grains, sandbox open. Return → same + `▷ replay intro`. Reset → recharged in **925 ms**, dial visibly climbing. Never a dead flat table. |
| 60fps | Batched charge: **median 16.7 ms/frame, p95 16.8 ms**. Animated avalanche: **median 16.7, p95 16.8, max 16.8** (n=57). One drop blocks 1.6 ms; the Reset handler 4.2 ms. |
| Keyboard | Arrows move a visible focus cell, Enter drops there (`grains 15,000 → 15,001`, `13 cells`); entering beat 3 moves the focus cell onto the ring, so Enter completes the beat. |
| Reduced motion | Avalanches resolve as an immediate before/after swap; outcome carried by the readout + the new plot point (6 drops → 4 plot points, `biggest 66`, no errors). |
| No-JS | `/sandpile` renders the baked backbone, the sci line and the source line. `/synthesis` renders **2 panels, 2 curves, 2 annotations, 2 source lines, the seam line** and hides the drag hints. |
| The same drag, opposite outcomes (the board's whole point) | Panel 1: `4% → 28% → 63% burned`, marker flips at d_c. Panel 2: `1 in 2 → 1 in 6 → 1 in 27 → 1 in 868` drops, marker warms `rgb(26,102,78) → rgb(226,205,106)` continuously and **never flips**. |
| The board widens, then stacks at hero scale | Plots re-lay-out (not scale): **510 px** each at n=2 ≥1100px, **860×499** stacked at 1000px, **300** on a phone. No horizontal overflow at 390 / 768 / 1000 / 1440. |
| Every coda number is read off the baked data | Rarity interpolates the baked survival series in log space; `★ your biggest` reads `cascade.sp.biggest` (wrote `1,378` live) and is absent-safe. |

## Deviations from the locked tickets (deliberate — flagged, not silent)

1. **Avalanche size is AREA (distinct cells toppled), not topple events.** Ticket 04's illustrative "6,140" implies topple events, but every *locked* quantity is an area: the readout's noun (`N cells`), the annotation's exponent (τ ≈ 1.1–1.3 is BTW's **area** exponent; the size exponent is ≈1.2–1.3), ticket 05's "a quarter of the field", and ticket 06's "≥ 900 cells". Area also keeps the readout honest — a 64² table cannot move 6,140 cells. `topples` is still computed; only the front animation uses it.
2. **The annotation prints τ ≈ 1.3, not the locked τ ≈ 1.1.** It is derived from the baked run (`meta.tau` = 1.28, fitted log-spaced over the scaling region s ≤ 300) rather than authored, per ticket 06 D8. 1.1 would contradict the line the user is looking at. It stays inside the cited "τ ≈ 1.1–1.3 (approx.)", and a test fails if the bake ever drifts out of that range.
3. **The source line names the field: "… · 64² field · τ ≈ 1.1–1.3 (approx.)".** The far tail steepens because a finite table runs out of cells, not because avalanches have a typical size; the method line is where that belongs.
4. **▷ Feed is a toggle, not hold-to-press.** Ticket 05 fork 3 says "hold the feed"; a toggle satisfies the same gate, matches the shell's existing Play/Pause vocabulary, and is the only version a keyboard user can perform.
5. **The survival plot is a second component** (`SurvivalPlot.astro`) sharing the locked `.sp-*` treatment, geometry helpers and palette — rather than a sixth branch inside `SignaturePlot.astro`. Same visual system, two disjoint element sets.
6. **Panel 2's rarity readout parks top-right** instead of riding its marker like panel 1's. Riding it collided with the annotation the panel exists to make; top-right is the one region a descending survival curve always leaves empty.
7. **Board plots are ~510 px at n=2, not ~560.** The locked container (1280) minus page and panel padding lands there. Same layout, ~9% smaller.

## Numbers measured while building (the design constants)

- **The charge:** 15,000 grains — the locked copy's "fifteen thousand" is also what it takes. The pile crosses 2.10 at ~9,000 and the remaining ~6,000 pour in with the needle dead still, which pre-figures beat 2.
- **Ring cell:** found at runtime (~97 ms, only cells at 3 grains can start anything), because beat 1 lets the user put their own first grain down — one grain at criticality genuinely changes which cell is the monster, so a baked answer would sometimes be a dud. Measured payoffs: **1,221–1,378 cells (30–34% of the field)**.
- **Baked law:** 500,000 drops after the charge → 217,707 avalanches, max area 3,781, τ ≈ 1.28. Ships as 1.7 KB of JSON; the exhibit's backbone and the coda's hero line read the same artifact.
- **Rarity anchors** (off that artifact): ≥100 cells = 1 in 7 drops · ≥912 = 1 in 25 · ≥2,650 = 1 in 529.
- **Marker travel stops at 2,811 cells** — where the plotted curve leaves the frame. Past it the readout would be quoting the bake's own sample size ("1 in 500,000") and the dot would sit below the plot area.

## Defects found by walking it live (all fixed)

- `[hidden]` lost to `button.ctl-btn{display:inline-flex}` and `.readout .r{display:flex}`, so **every control the on-ramp gates out still showed**. Now `[hidden]{display:none!important}`.
- The ring pointed at the **wrong cell**: `cellRect` is canvas-relative, but a square table is centred in a landscape panel, so the canvas is inset ~35 px. Overlays now add `canvas.offsetLeft/Top`. (Caught because the payoff drop returned 27 cells instead of ~1,300.)
- `.instrument[data-phase] .panels{grid-template-columns:1.15fr 1fr}` outranked the 860 px collapse rule, so **on a phone the plot was squeezed to 8 px wide**. Now scoped to `min-width: 861px`.
- Panel 2's leader anchored on `sizes.indexOf(200)` — a size that isn't in the baked series — and fell back to index 0, so the leader shot past the curve to the top-right. It now interpolates the curve at s = 50 (inside the fitted scaling run), and the client re-lays the annotation out on every resize.
- The rarity readout took its colour from the ramp's cool end and was **unreadable on the dark ground**; it now warms from a legible floor (t ≥ 0.42) — still continuous, still never flipping.
- Dragging a marker **sweep-selected the plot's labels**; `user-select: none` on `.sigplot`.
- A square 64² stage at full panel width made a ~950 px-tall instrument. The renderer now fits a grid to a height cap (510) and centres it, and the sandpile's panels run 1.15fr / 1fr.
- The keyboard focus cell appeared after a **mouse** click; it now requires `:focus-visible`.
- `1 grain → N cells` un-greyed the moment the charge ended. It now stays greyed until a single grain actually owns an outcome.

## Engine debts exhibit 2 collected (🔒 ticket 04 D9 · ticket 05 D11) — all paid

- **The stage generalised.** [`stage.ts`](src/scripts/stage.ts) no longer knows about fire: an exhibit supplies `bg(i)` for a cell at rest and the cells in the front, and `paintFront`/`paintCells` serve a burning front and a toppling avalanche identically (halo sprites, `lighter` composite and the locked bloom values unchanged). Fire re-verified end-to-end afterwards.
- **The beat runner extracted.** [`beat-runner.ts`](src/scripts/beat-runner.ts) owns the caption strip, the progress dots, the skip rail and the settle-once/timer-scoping discipline — the machinery every on-ramp defect in the fire slice lived in. Exhibit 2 inherited the fixes; fire's on-ramp was re-walked beat by beat to prove it.
- **Log scales are real.** `logAxis` / `linearAxis` / `decadeTicks` / `interpLog` in [`plot-geometry.ts`](src/lib/plot-geometry.ts), and [`plot-layout.ts`](src/lib/plot-layout.ts) now holds the geometry both the SSR components and their client modules use — which is what lets a plot **re-lay-out** at a new width instead of being a fixed canvas the viewBox shrinks.
- **The instrument frame took slots.** [`Instrument.astro`](src/components/Instrument.astro) supplies the locked chrome; each exhibit fills the plot, controls and overlay slots. No per-exhibit chrome was invented.
- **`src/lib/types.ts` was left alone.** It is unreferenced — the fire-shaped `Params`/`Stats`/`StepResult` names are documentation of a shape nothing imports, so generalising them would have been churn. Flagged as pre-existing dead code, not deleted.

## Open

- Nothing blocking. Next work is **exhibit 3 (network)** plus coda panel 3 / the 3-up board — the board is already a step in a locked rule (`data-panels` drives the container width and the column count), so panel 3 mostly needs its own re-feel and annotated feature.
- The returning-visitor path runs the 15,000-grain charge synchronously (~0.4 s of blocked main thread during hydration). Fine today; if it ever reads as a stall, chunk it across a few frames.

---

# Exhibit 3 — power grid / network cascade (Phase 5, 2026-07-24)

Built from 🔒 ticket [07](.scratch/cascade/issues/07-network-exhibit.md) (9 forks + 16 derived decisions, `/grilling`). **Spine: "you can't tell which."** Fire and the sandpile hand out a *homogeneous* field; the grid's parts look alike and are not alike, completing the trio as **when · how big · which**.

## Acceptance evidence (🔒 ticket 07 — walked live, not assumed)

| Requirement | Result |
|---|---|
| The user tries to break the grid and cannot — twice — then one ordinary node takes most of it | Walked the on-ramp end-to-end: beat 1 any node **`dark 1%`**; beat 2 the **fattest dot** (hub, degree 8) **`dark 2%`** — absorbed; beat 3 the ringed median-degree node **`dark 82%`**. `tried` counted 1 → 2 → 3 across the failures. |
| The trap is scientifically honest, not staged | The bake asserts it: hub node 63 (degree 8) → **1.7%**, ring node 22 (degree 5 = median) → **81.7%**. Under load redistribution the killer is a **bridge**, not a hub. A test fails if a retune ever breaks either claim. |
| Baked profile agrees with the live cascade | `network.test.ts` asserts `cascade()` darkFrac == the baked value on every α stop, sampled across the grid — so a bright dot's rank always describes what just happened on the stage. |
| The plot is built from the user's own clicks over the faint truth | Confirmed: two harmless tries pile on the flat floor (plot y≈380px), the ringed one lands on the cliff (y≈59px), three ranks from the left; annotation *"6 of 180 nodes take down more than half"* off the line with a hot-core dot. |
| Cutting `slack` widens the cliff | Sandbox slider 0.4 → 0.2: tall needles (>50%) **17 → 76**. Snaps to baked stops; the backbone re-draws. |
| The same drag, three outcomes (the board's whole point) | Panel 1 flips at a pixel; panel 2 climbs `1 in 2 → 1 in 868` with no break; **panel 3 jumps** `0.6 · 0.6 · 0.6 · 13.3 · 11.1 · 8.3 · 5.0 · 1.1 · 0.6 %` with no locatable line. `aria-valuetext` speaks *"node 43 of 180, takes down 71 percent."* |
| 60fps | Cascade animation **median 16.7 ms/frame, p95 17.4 ms** (n=61) on a 68% blackout; the white-hot glow renders (418 warm FIRE-ramp pixels sampled mid-front). Worst-case synchronous cascade compute ≈ 23 ms warm (74 ms cold-JIT); even at 4× CPU throttle the payoff click blocks only 91 ms. |
| Keyboard | Arrow keys move a visible focus ring to the nearest node in that direction; Enter takes it offline (`tried 0 → 1`, dot lands). Beat 3 moves the focus node onto the ring, so Enter completes the beat. |
| Reduced motion | The cascade resolves as an immediate before/after swap carried by the readout + the new plot dot; restore is instant (code path mirrors the sandpile's verified pattern). |
| No-JS | `/network` renders the baked ranked backbone, annotation, sci + source lines. `/synthesis` renders **all three panels' plots (180 SSR needles in panel 3), annotations, source lines, the 3-clause seam, and every copy line**; the drag hints hide. |
| The board widens to n=3, then stacks at hero scale | Container 1500 / plots 430 side-by-side at ≥1200px; **571px** stacked below; no horizontal overflow at 390 / 700 / 1280 / 1440. Promise line **gone** at n=3 (nothing left to promise). |
| Neutral infrastructure end to end | "Knock out" = a node goes offline; no social/political/attack framing anywhere. |

## Deviations from the locked ticket (deliberate — flagged, not silent)

1. **The grid needed local redundancy (diagonal ties) to make the spine true.** On a bare lattice the most-connected node is *also* the busiest, so beat 2 would be a lie (first bake: hub → 78% dark, "✗ BEAT 2 IS A LIE"). Adding diagonal edges (`DIAGONAL = 0.35`) makes well-connected nodes *routable around* — degree stops predicting betweenness — so the fragile nodes become bridges, not hubs. Real grids have exactly this redundancy around big substations. Ticket 07 fork 2 named Watts–Strogatz; this keeps that skeleton and adds the redundancy the physics required. The bake prints a pass/fail honesty check on both on-ramp claims.
2. **`graph-stage.ts` is a sibling of `stage.ts`, not a generalization of it.** A field of cells and a graph of nodes-with-wires are different objects; forcing one interface over both would be churn. They share the locked bloom — `haloSprites()`, `HALO_SCALE`, the `lighter` composite were **extracted** from `stage.ts` and reused unchanged, so a failing node glows with exactly a burning cell's light.
3. **The signature plot is a needle/bar geometry, not a curve** (`ProfilePlot.astro` + `profile.ts`), sharing the locked `.sp-*` treatment, `plot-layout` scales and palette — a seventh visual config, two disjoint element sets. The exhibit ranks the needles into a cliff; the coda leaves them in the grid's own order. One geometry, two orders — which *is* the coda move.
4. **No Shuffle, no Play/Speed** (ticket 07 D4/D5, amending §3.3): the graph is the subject (one canonical seeded grid), and a cascade is an event, not a time base.
5. **The coda ★ maps a stored fraction back to a node.** Storage is one number (`cascade.nw.worst` = the largest fraction, per D13); the coda finds the node whose baked blackout matches it and stars that needle — best-effort, absent-safe.
6. **The 3-up board goes side-by-side at ≥1200px, not 1100.** Three 430px plots need the extra width to stay hero-scale; below it the board stacks and each returns to hero scale (the locked rule's intent). Panels 1+2's ≥1100px 2-up rule is untouched.

## Numbers measured while building (the design constants)

- **The grid:** 180 nodes (15×12 jittered lattice), 445 edges after diagonals + 6% long rewires, degrees 2–8 (median 5). Seed `0xbeef00`.
- **The physics:** Motter–Lai — load = betweenness + 1, capacity = load₀ × (1 + α), iterate to a fixed point, then count anything stranded from the bulk. Betweenness via **allocation-free Brandes** (predecessors re-derived from BFS distances rather than stored — halved the worst-case click block).
- **Lethal counts per `slack` stop:** α 0.2 → 64 · 0.3 → 19 · **0.4 → 6 (default)** · 0.55 → 0 · 0.8 → 0. Cutting slack widens the cliff; loosening it flattens the grid to safety.
- **Baked artifact:** 5 α stops × 180 node blackouts, ~14 KB JSON. The exhibit's backbone and the coda's needle field read the same file; the live cascade agrees by construction (asserted).

## Defects found by walking it live (all fixed)

- **First bake failed the on-ramp's own honesty check** — the fattest dot took down 78%, so beat 2 ("even the biggest one" → absorbed) was a lie. Fixed structurally with local redundancy (deviation 1), not by rewording the beat. The bake now prints ✓/✗ on both claims so a future retune can't silently break them.
- The worst-case cascade compute blocked the click **~140 ms** (a dropped frame at the payoff). Rewrote Brandes to drop the array-of-arrays predecessor lists → ~23 ms warm; identical physics (bake byte-for-byte unchanged, 21 tests still green).
- Panel 3's annotation *"6 of 180 · nothing on the outside says which"* overran the narrow board panel; it now wraps to two lines on the ` · `, both bounded inside the plot at 430px.

## Engine seams exhibit 3 added (🔒 ticket 07)

- **`graph-stage.ts`** — the node/edge renderer; reuses the extracted `haloSprites()` from `stage.ts`. Spatial arrow-key navigation (nearest node in a direction) lives here.
- **`network.ts`** — tested pure module: `createGrid` (seeded W–S + diagonals), Brandes `load`, `capacities`, `cascade` (rounds + islanding), `profile`/`ranked`/`rankOf`, `hubNode`/`pickRing`/`lethalCount`. 21 tests.
- **`scripts/bake-network.ts`** — build-time ranked profiles per α stop, with a printed pass/fail check on the on-ramp's two claims. `npm run bake:network`.
- **`ProfilePlot.astro` + `profile.ts`** — needle geometry in two orders (ranked cliff · unsorted field), reusing `plot-layout` scales and the locked treatment; re-lays-out at width.
- **The rail** — a quiet persistent `synthesis →` link added to all three exhibit pages (`.page-rail`), back-links added to `/synthesis`.

## Open

- Nothing blocking. The trio + coda are complete. Remaining map frontier is **logo / favicon / share-OG** (the visual identity mark, deferred per the Namesake pattern).
- The worst-case cascade click still blocks ~23 ms of synchronous betweenness (fine; the animation is smooth). If a future larger grid makes it read as a stall, chunk the round computation across frames.

---

# Reference

## DNS pattern (recorded — done, not pending)

`dustincoledata.com` runs on Namecheap nameservers (`dns1/dns2.registrar-servers.com`), not Vercel's, so Vercel's own DNS panel is not authoritative. The record that made this site live, same pattern `moves` uses:

| Type | Host | Value |
|---|---|---|
| CNAME | `cascade` | `36ca4220b061ecc3.vercel-dns-017.com.` |

Then `vercel domains verify cascade.dustincoledata.com`. If a certificate stalls, remove and re-add the domain.

## Deploy notes

- **Node 24.x, not the spec's 22.** Vercel's current default, and what every other dustincoledata project runs. Newer and supported; no reason to pin backwards.
- **Deployment protection is on for `*.vercel.app` URLs** — they redirect to a Vercel login, and `curl` sees a **200 for the login page**, so a status code alone proves nothing there. Production custom domains bypass it (verified against the live `moves.dustincoledata.com`).
