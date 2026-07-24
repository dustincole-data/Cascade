# 07 — Network: the cascade instrument, its on-ramp, and coda panel 3

**Type:** HITL · design decision (`/grilling` + Intent) · **then BUILD** (this effort's one execution ticket — the user carried execution into the map).
**Status:** ✅ RESOLVED 2026-07-24 — 9 forks + 16 derived decisions locked with Dustin via grilling. Feeds spec §5.2 (rewrite), §6 (panel 3 + the 3-up board), §3.2 (7th plot config), §3.3 (network row), §2 (third door), §9 (Phase 5).
**Depends on:** tickets 01–06 ✅ (look, on-ramp grammar, board-slot contract, the sandpile's spine, the widening board).
**Was:** *"Network exhibit specifics"* + *"Coda — panel 3 + the full 3-up board"* + the `/exhibit → /synthesis` routing, in the map's fog.

## Scope fence

- **Does:** the network exhibit's **spine/aha**, **stage language** (a graph on the locked palette), **signature plot**, **control set + readouts**, its **3 on-ramp beats**, **coda panel 3 + the 3-up board seam line**, and the `/exhibit → /synthesis` **arrival routing** — then builds all of it.
- **Does NOT:** logo / favicon / share-OG (still fog).

## The question

Fire put the cliff where the user's hand put it (**threshold**). The sandpile walked to its own edge and refused to be pushed (**criticality**). Both fields are **homogeneous** — every cell interchangeable, and *where* you act barely matters.

A network is the opposite: the parts are **not** interchangeable, and nothing on the outside tells you which one holds the whole thing up. So: **what is the network's instrument** — what does the user do, what does the stage show, what plot does their play build, and what is the one re-feel on the coda board — such that *cascade* lands as a third distinct idea rather than a restatement of the first two?

Constraint carried verbatim: **neutral power grid, never social/political.**

## Resolution — the spine (everything hangs off this)

**You can't tell which.** Fire and the sandpile both hand the user a *homogeneous* field: any tree above d_c will do, any cell at criticality will do, and the interesting quantity is *when* or *how big*. The grid's parts look alike and are not alike. Take out this node and the grid shrugs. Take out that one — same size dot, fewer wires, nothing to see — and the whole thing goes dark.

That completes the trio as three genuinely different questions:

| Exhibit | The unpredictable thing | Aha |
|---|---|---|
| Forest fire | **when** — a line in a parameter | cliffs, not ramps |
| Sandpile | **how big** — no typical size | nobody set the dial |
| **Network** | **which** — structure decides | nothing looks load-bearing |

Design consequence, taken literally: **the exhibit's job is to let the user try, and fail, to break the grid — and then hand them the one node that breaks it.** The stage says it (identical dots, one of them lethal), the readout says it (`tried 4`, then 78% dark), the plot says it (a long flat floor of harmless nodes and a cliff of a few monsters — *and it is the only place the answer was ever visible*), and the coda says it (the same data in the world's arbitrary order, where the monster is invisible again).

The plot is therefore not a summary of the lesson — **it is the map of what the hand could not see.**

## The 9 locked forks

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | **Spine / aha** | **"You can't tell which."** Heterogeneity — the parts are not interchangeable and nothing on the outside says which is load-bearing. Trio = **when · how big · which**. Rejected: *efficiency is fragility* (expose α — real, and it is the "hot day", but it hands back a dial and a line to cross, which is exhibit 1's exact move: fire with wires); *failure is contagious* (restates the site's own title — cascade explaining cascade); *nothing fails alone* (the mechanism, not a discovery — nothing for the hand to be wrong about). |
| 2 | **Stage & model** | **Small-world grid, new sibling renderer.** ~180 nodes on a jittered lattice, mostly-local edges plus a few rewired long links (Watts–Strogatz — whose 1998 paper measured the actual US Western power grid). A `graph-stage.ts` sibling of `stage.ts` draws nodes + edges and **reuses the locked halo sprites, bloom constants and `lighter` composite** unchanged. The long links create bridges whose importance **degree does not predict** — which is what makes fork 1 true rather than asserted. Rejected: nodes on the existing cell grid (no visible wires ⇒ a third cellular automaton, and every node interchangeable again — fork 1 dies); force-directed layout (prettiest, reads social/abstract not infrastructure, costs determinism); scale-free/BA hubs (the killer is always the visible hub — fork 1 is false on click one). |
| 3 | **The act** | **One knock-out per run; the grid restores.** Click → cascade animates → readout lands → the grid relights in a quick sweep, ready for the next attempt. Every click is a clean experiment on the *same* grid, so each contributes one honest point to the plot, and repeated cheap trials are what let the on-ramp's trap work. ("The grid comes back up" is also true of real grids.) Rejected: cumulative damage (confounds *which node* with *how much damage already done*; every trial after the first is a different grid, so the per-node plot is meaningless); manual reset only (a click of ceremony between every experiment). |
| 4 | **Signature plot** | **The ranked cliff, with your own tries bright on it.** x = every node ranked by the fraction of the grid its removal takes down; y = % dark. A **faint computed backbone** shows the whole profile — a long flat floor and a cliff at the far left — and **each node the user knocks out drops a bright dot at its rank**, so their harmless attempts visibly pile up on the floor and the ringed one lands on the cliff. Third distinct shape (S-curve · straight log-log · **cliff**), same bright-series-over-faint-backbone grammar the sandpile proved. Rejected: heavy-tail survival curve (what §5.2 sketched — but it is panel 2's shape on panel 2's axes; the board would show one shape twice); degree-vs-size scatter (makes "can't tell by looking" literal, but "no correlation" renders as a featureless blob and argues instead of showing). |
| 5 | **Parameter slot** | **A `slack` slider, released only into the sandbox.** The on-ramp never touches it — the three beats are pure structure. On release the sandbox gains spare capacity α: cut the slack and the **backbone's cliff visibly widens** as more nodes become lethal. Distinct from fire's dial (that one *built the field*; this one changes **how many parts are load-bearing**), and it is literally the hot day in the panel's real-world echo. Rejected: no parameter at all (purest, but the sandpile just did untouchable-slot — twice running reads as a variation on exhibit 2); α live through the on-ramp (maximum instrument, maximum risk of replaying exhibit 1). |
| 6 | **Money readout** | **`tried` · `dark` · `worst`.** A counter of nodes knocked out, the live fraction going dark, and a ratcheting worst. **`tried` is the one carrying the spine** — after four harmless attempts the number itself says *I have been trying to break this and cannot*, and then the fifth reads 78%. Rejected: `1 node → N% dark` (the sandpile's arrow with new nouns — rhymes hard and restates the thesis, but exhibit 3 becomes a re-skin of exhibit 2's signature move and *which* never gets counted; 🔒 ticket 04 fork 6 owns that form); a ledger of attempts (the most direct evidence, but it adds chrome to a stage the canon wants quiet and duplicates the plot's job). |
| 7 | **The on-ramp trap** | **Beat 2 = "take out the biggest one."** Spotlight the most-connected node — visibly the fattest dot on the stage — and invite them to kill it. **The grid absorbs it.** This kills the one intuition every viewer arrives with (*the hub is the fragile part*) and it is scientifically honest: under load redistribution the killer is usually a **bridge**, not a hub. Beat 3's ordinary-looking node then has nowhere to hide. Rejected: "take out three more, anywhere" (their own free choice plants robustness, but it is three clicks of the same nothing and a lucky hit spends beat 3 early); "take out three at once" (teaches *more damage* when the exhibit is about *which damage*, and adds a second interaction the shell lacks). |
| 8 | **Coda re-feel** | **Scrub the grid in the world's order.** Panel 3's hero plot is the same per-node data as the exhibit's, deliberately left **UNSORTED** — a needle field in the arbitrary order the grid hands you. Drag along it and the readout **jumps with no pattern**: `0.3% · 0.6% · 0.4% · 71% · 0.5%`. Panel 1 has an edge you can find, panel 2 has none, **panel 3 has one you cannot locate** — three panels, three feels. Rejected: a marker on the ranked cliff (cleanest rhyme with the exhibit's own plot, but it is panel 2's climb ending in panel 1's leap — three panels, two feels); the sort morph (the most direct enactment of the spine and gorgeous, but a morph the shell has never done, no readout, and reduced motion flattens it to a swap that loses the point). |
| 9 | **Copy** | **Felt callback: "Nothing looks load-bearing."** — flat statement of the true gap, adding the *looking* angle the plain line lacks, and it leaves the word *which* free for the seam. **Board seam at n=3: "One edge you cross. One a system finds by itself. One you'd never have picked."** — three clauses for three panels, rhythm holds (4 / 6 / 5 words), and the third stays true for a direct arrival who never played the exhibit. Rejected callbacks: *"You can't tell which one."* (the spine verbatim per ticket 04's precedent, punchiest — but it collides with the seam line three inches below, and "you can't" reads faintly as a taunt); *"The grid came back up."* (deadpan and true, but it comforts where the panel should unsettle, and cites a mechanic a direct arrival never saw). Rejected seams: the long explicit clause (*"…in a part that looks like all the others"* — twice the length, rhythm dies, reads as explanation); rewriting all three (re-opens approved ticket-06 copy for a likely-zero gain). |

## The 16 derived decisions

| # | Derived | Call |
|---|---|---|
| D1 | **The graph** | **180 nodes**, jittered lattice (~15 × 12) + local edges, with a small fraction of links **rewired long** (Watts–Strogatz β small). Seeded (mulberry32) — one canonical grid, deterministic. Node dot radius scales with degree so "the biggest one" is a real, visible target for beat 2. |
| D2 | **The physics** | **Motter–Lai (2002)**: a node's load = its **betweenness centrality**, capacity = `load₀ × (1 + α)`. Removing a node re-routes flow; any node now over capacity fails; iterate to a fixed point. Deterministic given (graph, α, node). Brandes betweenness on 180 nodes / ~400 edges is ~72k ops — a whole cascade is a few ms. |
| D3 | **Baked profiles, live cascades** | The **ranked backbone** for each α stop is computed at **build time** and shipped as small static JSON (the sandpile's baked-artifact pattern); the cascade the user actually triggers is computed **live** by the same code, so a clicked node's outcome and its plotted rank agree by construction. A test asserts that agreement. **α is a stepped slider** (a handful of stops) precisely so no profile is ever computed at runtime. |
| D4 | **No ⤫ Shuffle** | The graph *is* the exhibit's subject, not statistical noise, so there is one canonical grid — which also keeps the baked profiles, the ring node, and **the coda's needle field the same object the user played**. Deviates from §3.3's row deliberately. |
| D5 | **No Play / Pause / Speed** | A cascade is an **event**, not a continuous time base — there is nothing to play. §3.3's row is amended: the network's controls are ● Knock out · `slack` (sandbox) · ↺ Reset. |
| D6 | **Stage language** | Live node = dim teal (`TEAL`, dimmed as `FOREST_DIM` does) · edges hairline and faint · **failing node = white-hot on the `FIRE` age ramp with the locked halo bloom**, then near-black · **islanded** nodes (cut off, no path to a source) fade dark **without** a flash — overload and starvation are physically different and the distinction is free. The stage **darkens progressively** as the cascade runs: the glow payoff §5.2 asked for. |
| D7 | **Minimum flash** | Inherits 🔒 ticket 04 D4 — a 1–2 node cascade would resolve invisibly, so every cascade gets a **≥2-frame visible flash**. |
| D8 | **Restore** | A ~600 ms relight sweep (order = distance from the source side, so it reads as power coming back), then the grid is ready. Not skippable, not gated — it is faster than the next click. |
| D9 | **a11y** | Stage focusable; **arrow keys move the focus ring to the nearest node in that direction** (a graph is spatial, so spatial navigation is the honest mapping); **Enter knocks out** the focus node. `aria-live` on the readout trio. Beat 3 moves the focus node onto the ring, as the sandpile's beat 3 does. Meaning never rides on colour alone — luminance carries alive/dead, and the readout carries the size. |
| D10 | **Reduced motion** | The cascade resolves as an **immediate before/after** swap (dark set applied at once); the outcome rides the readout + the new plot dot. The restore is instant rather than swept. |
| D11 | **No-JS** | SSR renders the **baked ranked backbone** at the default α, the annotation, the sci line and the source line; the graph hydrates. `/synthesis` renders all three panels' plots, annotations, source lines and copy with no JS (🔒 ticket 03 dec. 11 pattern holds at n=3). |
| D12 | **Naming** | Route **`/network`**; door + page title **"Power grid"**; concept word **`CASCADE`**; sci line *"cascading failure · load redistribution"*; plot source line *"Motter–Lai 2002 · small-world grid (Watts–Strogatz 1998) · 180 nodes"*. Neutral infrastructure language throughout — **no social, political, or attack framing** ("knock out" stays an engineering word: a node goes offline). |
| D13 | **Storage** | New key **`cascade.nw.worst`** — the largest fraction the user took down (one number, best-effort), read by coda panel 3 for an optional **`★ you found this one`** on that node's needle. **Absent ⇒ no star ⇒ the panel is still complete** (🔒 ticket 03/06 rule). |
| D14 | **Landing + board at n=3** | The landing gains its **third live door** and the promise line **disappears** (🔒 ticket 06 D11: n=3 ⇒ nothing). The board steps to its locked n=3 rung: container ~1500, plots ~430, side-by-side ≥1100px, stacked below at hero scale, panel 1's scatter already dropped below ~560px. **No new layout rules** — `data-panels="3"` is a step in the locked rule. |
| D15 | **Arrival routing** | A quiet persistent **`synthesis →`** link in each exhibit's header rail (all three pages), present from arrival, plus **back-links to the three exhibits** on `/synthesis`. No gating, no state, works with no JS, never interrupts the instrument. Rejected: revealing it at on-ramp release (best timing, but costs beat-runner state and a skipping visitor needs a second path anyway); landing-only (free, and almost nobody who plays an exhibit would ever reach the coda that is the point of the site). |
| D16 | **What must NOT be re-spent** | The sandpile's `1 grain → N cells` arrow and its refusal beat (🔒 ticket 05) · panel 2's **rarity** readout — panel 3 counts *nodes*, never "1 in N" · panel 1's flip and flood. Panel 3 states **no rarity sentence**; its readout is a bare per-node percentage that jumps. |

## The instrument anatomy (hand to build)

| Zone | Content | Treatment |
|---|---|---|
| **Stage** | 180-node small-world grid: nodes dim teal sized by degree, edges hairline. A cascade flashes failing nodes white-hot on the `FIRE` ramp with the locked halo, leaves them near-black, and islanded nodes fade without a flash. The field darkens as it runs; ~600 ms relight sweep restores it. | `graph-stage.ts` — sibling of `stage.ts`, same halo sprites / bloom constants / `lighter` composite. Cached edge+node background, O(front) per-frame repaint. |
| **Plot (signature)** | **Ranked cliff.** Faint computed backbone = all 180 nodes ranked by % dark; **bright dots** = the nodes this user tried, at their rank. Annotation **off the line** with a thin leader on the cliff: *"7 of 180 nodes take down more than half."* | Locked §4.4 treatment (faint gridlines, spectral stroke, JetBrains mono axes). Source line beneath. Backbone re-draws when `slack` steps. |
| **Readouts** | `tried 4` · `dark 0.6%` · `worst 1.1%` | Mono. `aria-live` on the trio. `tried` is the spine's counter. |
| **Controls** | ● Knock out (click the stage, or Enter at the focus node) · `slack` slider **(sandbox only)** · ↺ Reset | No Shuffle (D4), no Play/Speed (D5). On-ramp gates the slider out entirely. |
| **Rail** | `synthesis →` | Quiet, persistent, all three exhibit pages (D15). |

## On-ramp — 3 light beats

**Spine: you cannot break it, and then you can.** Fire trapped the user with their own hand on the dial; the sandpile refused to be pushed; the network lets them **hunt** and come up empty — twice, the second time with the obvious suspect handed to them — and then points at a node that looks like nothing.

1. **"Take one out. The grid holds."** Full grid humming, `tried 0`. Prompt `knock out any node` → they click; a few neighbours flash amber as load re-routes, **nothing dies**, `dark 0.3%`, the grid relights. Their first bright dot lands on the plot's flat floor. Gate = one knock-out resolved.
2. **"Even the biggest one."** Prompt `now the biggest one — it's the fattest dot`; that node is spotlit on the stage. They kill it; a handful of neighbours flash, the grid **absorbs it**, `dark 1.1%`. Second dot, still on the floor. ← **the trap sprung** (the hub intuition, dead). Gate = the hub node knocked out.
3. **"This one. Nothing about it looks different."** A **pulsing ring** (the rhyme with fire's knee-tick and the sandpile's ring) marks one ordinary node — mid-degree, unremarkable. Prompt `this one`. The click starts a cascade that **runs in rounds across the whole grid**, the stage going progressively dark, and `dark` races to **~78%** while `worst` ratchets with it; **their third dot lands on the cliff**, three ranks from the left, with the annotation resolving off the line. **Off-ring clicks are honoured** as real (usually harmless) attempts — the near-miss principle from tickets 02 and 05: the readout updates, `tried` increments, the beat stays open, the ring keeps pulsing. ← the aha. Then releases to the sandbox (`knock out anything →` · *"Now it's yours."*).

**On-ramp rules:** control gating = beat 1–3 stage-only, release adds **only `slack` + ↺ Reset**. The **restore is never gated** (a beat that leaves the grid dark cannot be retried). Completion flag `cascade.nw.onramp` + the quiet *"▷ replay intro."* rhyme. The plot is **live from beat 1** — the backbone is present from arrival (it is the no-JS content) and the user's dots accumulate on it, so beat 3's payoff is a dot landing somewhere the first two could not reach. **"Nothing looks load-bearing."** stays **unspent** by the on-ramp — it is the coda's callback (the ticket-05 discipline).

## Coda panel 3 (`CASCADE`) — filled into the locked board-slot

| Zone | Content | Treatment |
|---|---|---|
| **Concept word** | `CASCADE` | Mono, small, `--ink-muted` — identical slot to panels 1 and 2. |
| **The plot** | **The needle field**: all 180 nodes in the grid's own arbitrary order, each a hairline needle whose height is the fraction its removal takes down. A flat fringe with a few spikes and **no order to them**. One continuous cool→warm ramp by height (panel 2's rule — sequential, CVD-safe). Annotation **off the field** with a thin leader on the floor, not on a spike: *"7 of 180 · nothing on the outside says which."* Optional **`★ you found this one`** on the needle the user's own worst belongs to. | `coda-network` plot config. Source line: *"Motter–Lai 2002 · small-world grid (Watts–Strogatz 1998) · 180 nodes."* |
| **Re-feel** | Drag (or arrow-key) along the field → the readout **jumps with no pattern**: `node 41 → 0.3% dark`, `42 → 0.6%`, `43 → 71%`, `44 → 0.5%`. No line, no ramp-up, no warning. | The one interaction. Rests at the left. Nothing floods; nothing flips at a locatable place. |
| **Plain line** | "One failure can take the whole connected system." | Archivo, small, `--ink`. |
| **Felt callback** | "Nothing looks load-bearing." | Mono, smaller, `--ink-muted`. Unspent by the on-ramp on purpose. |
| **Real-world echo** | "A grid failing on a hot day." | Small, `--ink-faint`. Apolitical. |
| **Board seam** (n=3) | "One edge you cross. One a system finds by itself. One you'd never have picked." | Muted, beneath the trio, outside every panel. Amends ticket 06's two-clause line. |
| **Degrade frame** | Header unchanged; **the promise line is gone** (n=3 ⇒ nothing). | No ghost cards — there is nothing left to promise. |

**Copy block:**
```
CASCADE
One failure can take the whole connected system.
Nothing looks load-bearing.
A grid failing on a hot day.

  One edge you cross. One a system finds by itself. One you'd never have picked.
```

**a11y:** marker is `role="slider"` stepping node by node, `aria-valuetext` speaking *"node 43 of 180, takes down 71 percent"*. Reduced motion is free — nothing animates. No-JS renders the field, annotation, source line and all four copy lines.

## Feeds spec (edits the build session applies)

- **§5.2 (rewrite):** no longer a sketch — spine, Motter–Lai physics, the small-world grid, the restore, the ranked-cliff plot with the user's own dots, `tried · dark · worst`, the 3 beats, the control set, and D1–D16.
- **§3.3 (control vocabulary):** the network row changes — **no Shuffle, no Play/Speed**; parameter slot = `slack` α, **sandbox-only**; click-to-act = take a node offline.
- **§3.2 (signature-plot component):** two new configs — **`network-live`** (ranked profile backbone + the user's bright dots at rank, annotation on the cliff) and **`coda-network`** (unsorted needle field, marker + jumping per-node readout, continuous ramp, optional ★).
- **§6:** panel 3 in full, the **three-clause seam line**, the promise line's removal at n=3, and `data-panels="3"` stepping the locked board rule.
- **§2:** the landing's **third door** ("Power grid"), promise line dropped.
- **§9 (Phase 5):** exhibit 3 carries the graph renderer, the baked profile artifact, panel 3, the 3-up board, and the arrival routing.

## Engine / build constraints this ticket adds

- **`graph-stage.ts`** — a node/edge renderer beside the cell renderer, reusing the halo sprites and locked bloom constants. `stage.ts` is not generalised into it: a grid of cells and a graph of nodes are different objects, and forcing one interface over both would be churn.
- **Betweenness + cascade core** — Brandes betweenness and the Motter–Lai fixed-point loop as a tested pure module (`network.ts`), like `percolation.ts` and `sandpile.ts`.
- **Baked profile artifact** — a build-time script computes the ranked profile per α stop and ships small JSON. No cron, no dataset, no runtime compute.
- **Plot component** — the ranked profile and the needle field are both bar/needle geometries rather than curves; they reuse `plot-layout.ts` scales, the locked treatment, and the responsive re-lay-out.

## Acceptance (this design is "right")

- The user **tries to break the grid and cannot** — twice, the second time on the most-connected node in the field — and then one ordinary-looking node takes most of it down.
- `tried` makes the failure to break it **countable**, and no readout borrows the sandpile's arrow.
- The plot's flat floor and cliff are **built from the user's own clicks** over the faint truth, and the annotation names how few monsters there are.
- Cutting `slack` in the sandbox **visibly widens the cliff** — and does so without turning the exhibit into fire.
- On the board, the **same drag** gives three outcomes: a flip at a pixel · a smooth climb with no break · **jumps with no locatable line**.
- Keyboard, reduced-motion and no-JS paths all deliver the same outcome readout and a real plot; panel 3 is complete on direct arrival with no history.
- Nothing invents chrome: the locked shell, palette, plot treatment and halo machinery in a new rule-set — plus a node/edge renderer and a needle geometry.
- The grid stays **neutral infrastructure** end to end: no social contagion, no attack framing, no politics.

## References

Locks consumed: ticket 01 (look, palette, §4.4 plot treatment), ticket 02 (on-ramp grammar, the near-miss principle), ticket 03 (board-slot contract, `★` pattern, no-ghost-cards degrade), ticket 04 (the arrow form and the cool→warm ramp rule this ticket must not re-spend), ticket 05 (control gating, the ring, the replay flag), ticket 06 (the widening board, the seam line this ticket extends, the continuous-ramp rule). Spec: §2, §3.2, §3.3, §5.2, §6, §9. Science: Watts–Strogatz 1998 (small-world; the US Western power grid), Motter–Lai 2002 (cascade-based failure under load redistribution).
