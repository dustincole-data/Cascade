# 06 — Synthesis coda: panel 2 (criticality) + the 2-up board

**Type:** HITL · design decision (`/grilling` + Intent) · **Plan-don't-build.**
**Status:** ✅ RESOLVED 2026-07-24 — 8 forks + 12 derived decisions locked with Dustin via grilling. Feeds spec §6 (rewrite), §3.2 (sixth plot config), §5.1 (the `cascade.sp.biggest` write), §9 (Phase 5).
**Depends on:** ticket 03 (the board-slot contract + panel 1) ✅ · ticket 04 (the sandpile plot + its coda fill) ✅ · ticket 05 (what the on-ramp already spent) ✅.
**Was:** *"Coda — panels 2 & 3 + full board"* in the map's fog; partly graduated by ticket 04.

## Scope fence

- **Does:** coda panel 2 filled into the locked board-slot, plus the **first real board layout** — how two panels sit together, responsive behaviour, and whether the promise line survives at n=2.
- **Does NOT:** panel 3 / the network (fog until that plot exists), the 3-up final board, the `/sandpile → /synthesis` arrival routing.

## The question

Ticket 04 settled panel 2's **contents**: `CRITICALITY` · log-log survival line · *"Systems drift to their own edge and stay there."* · **"Nobody set the dial."** · *"An idea going viral."*

What was **not** settled: its **one re-feel** (a straight line has no knee), the **board at n=2**, and whether the **placed-cliff vs found-edge contrast** is stated.

## Resolution — the spine (everything hangs off this)

**At n=2 the board becomes the instrument.** Until now every design decision lived inside one panel; from here the intelligence is what happens *between* them. So panel 2 is designed as the **inverse of panel 1 under the same hand**: same gesture, same frame, same palette, same annotation grammar — and no edge anywhere.

- Panel 1: drag the marker, and at one exact pixel it **flips** cyan→amber, the y-readout **leaps**, the catastrophe regime **floods**. You find an edge, and it is violent.
- Panel 2: drag the marker along the survival line and the rarity readout climbs **three orders of magnitude with no break**, the marker **warms continuously** and never flips, and nothing floods, because there is nothing to flood *up to*. You go looking for the edge and there isn't one — the system already sat on it.

That is *"nobody set the dial"* delivered to the hand rather than to the ear, and it is the one shape panel 1 cannot repeat. The exhibit's own spends stay unspent here: **no refusal beat, no `1 grain → N cells`** (ticket 05 owns both) — the coda's readout is *rarity*, a fact the exhibit never stated.

Then, once — and only at board level — the contrast is **named**, because naming is the coda's locked job (ticket 03 spine): *"One edge you cross. One a system finds by itself."*

Intent lenses: **storytelling** (the two-panel turn: what-you-did → what-does-itself) · **articulate** (name once, at the seam, never inside a panel) · **include** (panel 2 is inherently reduced-motion clean; the rarity sentence is what the screen reader gets) · **fortify** (direct arrival, no-JS, and no-exhibit-2-history all still read as complete).

## The 8 locked forks

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | **The re-feel** | **Hunt the missing edge.** The *same gesture* as panel 1 — drag the marker along the line — with the opposite outcome: no leap anywhere, at any scale, and the marker **warms continuously** rather than flipping at a pixel. The contrast is enacted by the hand, not asserted by copy. Rejected: a **ghost comparison** curve ("if sizes were typical") — legible, but it draws a fiction on a rigorous-data-only plot and argues rather than shows; **decade zoom** (self-similarity is the truest signature, but "the picture doesn't change" is a hard thing to feel and zoom chrome is new machinery); **no interaction** (calmest, but panel 2 reads flat beside a live panel 1, and at n=3 one live panel among two dead ones). |
| 2 | **The readout** | **Rarity, in counting words** — `1 in 400 drops ≥ 900 cells`. The survival curve's honest y-meaning; it is what makes "no jump anywhere" *visible* (panel 1's leap was carried by a readout too), and it lands the panel's plain line and echo. **It is a new fact — never the exhibit's `1 grain → N cells`**, which ticket 05 spent. Rejected: technical probability (`P(s ≥ 900) = 2.5×10⁻³`) — instrument-voiced but the shock must be decoded; the **shock delta** ("10× bigger · only 13× rarer") — the strongest argument, but a computed comparison that lectures; **no readout** (the 2,000× climb becomes invisible). |
| 3 | **Plot data** | **Canonical baked survival curve + optional `★ your biggest`.** Exact mirror of ticket 03 dec. 2: the baked long-run BTW survival curve is always the hero line (authoritative, deterministic, works on direct arrival); if the user played exhibit 2, a static ★ sits **on the line** at their own biggest avalanche. *"The law was always there and you are a dot on it"* — ticket 05 fork 5's plot spine, carried into the coda. Rejected: draw the user's own curve when present (a 6-point jagged line where the board needs a law; two different plots in one slot break the 3-up rhyme); canonical-only (panel 1 has a star, panel 2 wouldn't — the slots stop matching). |
| 4 | **The annotation** | **The straightness itself** — `no typical size · τ ≈ 1.1`, off the line, thin leader touching mid-run, and **deliberately no hot-core dot**. Panel 1's dot marks its one critical point; panel 2 has none, so the *missing dot is the inversion*, not a broken slot. Technical voice per ticket 03 dec. 8. Source line beneath: *"Bak–Tang–Wiesenfeld 1987 · τ ≈ 1.1–1.3 (approx.)"*. Rejected: the far-tail extreme (*"one grain, 6,140 cells"* — re-spends the exhibit plot's annotation **and** ticket 05's payoff); a marked absent bump (draws a fiction); the user's ★ (absent on direct arrival ⇒ the panel's one critical feature would sometimes not exist). |
| 5 | **The board at n=2** | **Side by side above 1100px; the board widens as panels land.** Container `960 (solo) → ~1280 (n=2) → ~1500 (n=3)`; plots step `860 → ~560 → ~430`. Below the breakpoint it stacks and each plot returns to hero scale. Both shapes on screen at once is where the contrast lives, and *"three ways the world does it"* promises a triptych. **This amends ticket 03 dec. 7:** hero scale was a solo-panel privilege — the board buys comparison with size. Rejected: stacked-always (zero layout risk and the plot stays hero, but the contrast is remembered rather than seen); a shapes-strip above stacked heroes (comparison *and* scale, at the cost of rendering every plot twice + a component the shell doesn't have). |
| 6 | **The contrast** | **Stated once, at board level.** One muted line beneath the pair, appearing at n≥2 — outside both panels, so each stays standalone and the slot contract stays clean. The exhibits show; the **coda names** (ticket 03 spine), so this is the one place stating it is on-brand. It also rescues the direct arrival, who never set a dial and would otherwise read *"Nobody set the dial."* against nothing. Rejected: don't state it (purest show-don't-tell, but the smartest thing on the page is left to inference); inside panel 2's copy (panel 2 stops being standalone and references panel 1); defer to the 3-up synthesis line (n=2 is what ships next — it would ship without its own intelligence). |
| 7 | **The wording** | **"One edge you cross. One a system finds by itself."** Flat, no repeat of *dial* three inches from panel 2's callback, and it **generalizes** instead of narrating what the user did — so it holds for a direct arrival, who did cross the first edge with the marker. Rejected: *"First one, you set the dial. Second one, nobody did."* (punchiest, but "dial" lands twice on one screen and dulls the callback); *"You went looking for the second edge. It was already there."* (ties to the re-feel, but muddy — the pile's edge is real, it just isn't on this chart); *"Thresholds are placed. Critical points are found."* (aphoristic, reads as a fortune cookie). |
| 8 | **The color rule** | **One continuous cool→warm ramp along the line, no split.** The same palette panel 1 uses as a hard `cool safe \| warm catastrophe` boundary runs here as an unbroken gradient (small avalanches cool, enormous ones warm), with **no regime fill and no boundary anywhere** — and the marker warms with it. The board then says it in pure color: identical ramp, one panel has an edge in it, the other doesn't. CVD-safe by ticket 04 fork 3's rule (sequential, monotone luminance), and it reuses exhibit 2's own stage height ramp so the exhibit and its coda panel match. Rejected: warm-follows-the-marker (closest echo of panel 1's flood, but it draws the boundary this panel exists to deny); no regime color (panel 2 drops out of the shared color grammar and the rhyme thins to framing + annotation). |

## The 12 derived decisions

| # | Derived | Call |
|---|---|---|
| D1 | **Resting state** | The marker **rests at the small end**, poised to travel out the tail (panel 1 rests just below the knee). No autoplay on either; both are "poised", both move only on the user's hand. |
| D2 | **Hint line** | `drag the marker out along the tail` — mono, `--ink-faint`, `data-js-only` (rhymes with panel 1's `drag the marker across the knee`; no promise of an interaction that isn't there). |
| D3 | **Keyboard** | Same `role="slider"` pattern as `coda.ts`: arrows step along **log-x** in fixed fractional-decade steps, Home/End hit the ends, and `aria-valuetext` speaks the rarity sentence (*"at least 900 cells, 1 in 400 drops"*). The screen-reader path gets the same climb-with-no-break. |
| D4 | **Reduced motion** | Free here — nothing flips, sweeps, or floods by design. The readout and the marker's ramp update discretely with the hand. |
| D5 | **No-JS** | SSR renders the baked line, the `no typical size · τ ≈ 1.1` annotation, the source line, and all four copy lines. The marker + readout hydrate as pure enhancement (ticket 03 dec. 11 pattern). |
| D6 | **Storage** | New key **`cascade.sp.biggest`** — one number (the session's largest avalanche), written by exhibit 2, read by the coda for the ★. Mirrors `cascade.ff.crossing`. **Absent ⇒ no star ⇒ panel still complete.** Private-mode failure is a silent no-star. |
| D7 | **Plot config #6** | `coda-sandpile`: log-log axes, baked survival series, interactive marker + rarity readout, continuous ramped stroke, **no hot-core dot**, optional ★. Log scales already budgeted by ticket 04; nothing new beyond them. |
| D8 | **Honest numbers** | Every number in the readout is read off the **baked survival data** — nothing is authored. The copy's *"six thousand"* claims stay pinned to ticket 05's seeded run. |
| D9 | **Board mechanics** | `.coda` max-width becomes a function of `data-panels`; `.coda-board[data-panels='2']` → 2 columns at ≥1100px. Panel order is **fixed THRESHOLD → CRITICALITY** (site order, and the contrast line reads left→right). Both panels stay interactive — **one re-feel each, no synced markers** (linking them would be a third mechanic nobody asked for). |
| D10 | **Scatter at width** | Panel 1's faint scatter **thins, then drops, below ~560px** of plot width so the curve stays the object at board scale. The smoothed curve + annotation never drop. |
| D11 | **Degrade at n=2** | Promise line becomes **"cascade — the last exhibit."** — still one muted forward line, still **no ghost cards** (ticket 03 dec. 6 holds). Order beneath the board: contrast line, then promise line. |
| D12 | **Panel 2 copy** | Stands **verbatim** from ticket 04 fork 7 / the board-slot fill: `CRITICALITY` · *"Systems drift to their own edge and stay there."* · **"Nobody set the dial."** · *"An idea going viral."* Not re-litigated here. |

## The panel anatomy (hand to build)

| Zone | Content | Treatment |
|---|---|---|
| **Concept word** | `CRITICALITY` | Mono, small, `--ink-muted` — identical to panel 1's slot. |
| **The plot (hero-ish)** | Baked log-log **survival curve** (for each size *s*, how often an avalanche was at least that big), drawn with **one continuous cool→warm stroke, no regime split**; faint gridlines; `no typical size · τ ≈ 1.1` off-line with a thin leader, **no dot**; optional static **`★ your biggest`** on the line. | Locked §4.4 treatment in `coda-sandpile` config, at board scale (~560px at n=2). JetBrains mono axes. Source line beneath: *"Bak–Tang–Wiesenfeld 1987 · τ ≈ 1.1–1.3 (approx.)"*. |
| **Re-feel** | Drag (or arrow-key) the marker out along the line → `1 in 400 drops ≥ 900 cells` climbs three orders of magnitude **with no break**; the marker warms continuously and **never flips**. | The one interaction. Rests at the small end; no autoplay; nothing floods. |
| **Plain line** | "Systems drift to their own edge and stay there." | Archivo, small, `--ink`. |
| **Felt callback** | "Nobody set the dial." | Mono, smaller, `--ink-muted`. The spine, unspent by the on-ramp on purpose (ticket 05 fork 7). |
| **Real-world echo** | "An idea going viral." | Mono/Archivo, small, `--ink-faint`. Apolitical. |
| **Board seam** *(new, board-level)* | "One edge you cross. One a system finds by itself." | Muted, beneath the pair, outside both panels. Appears at n≥2. |
| **Degrade frame** | Header unchanged + promise line now *"cascade — the last exhibit."* | No ghost cards. Reflows to 3-up when panel 3 lands. |

**Copy block:**
```
CRITICALITY
Systems drift to their own edge and stay there.
Nobody set the dial.
An idea going viral.

  One edge you cross. One a system finds by itself.
  cascade — the last exhibit.
```

## Feeds spec (edits the build session applies)

- **§6 (rewrite):** the coda is now a **widening board** — container and plot scale step with `data-panels`, side-by-side ≥1100px, stacked below (hero scale returns). Panel 2's full spec above. The **board seam line** at n≥2 and the degraded promise line. Explicit amendment of ticket 03 dec. 7 (hero scale = solo privilege).
- **§3.2 (signature-plot component):** a **sixth config** — `coda-sandpile` (log-log, baked survival series, marker + rarity readout, continuous ramped stroke, no hot-core dot, optional ★).
- **§5.1 (sandpile):** exhibit 2 additionally **writes `cascade.sp.biggest`** (its ratcheting `biggest`) for the coda's ★ — one number, best-effort, never load-bearing.
- **§9 (Phase 5):** coda panel 2 + the 2-up board land **with** exhibit 2, not after it (the board is the reason exhibit 2 is worth shipping).

## Engine / build constraints this ticket adds

- **Baked survival data as a shipped static file** — the same build-time long-run BTW pass ticket 04 already requires for the exhibit's backbone; the coda reads the *same* artifact (one dataset, two configs). No new computation, no cron, no dataset fetch.
- **Rarity lookup** — the readout interpolates `1 in N` off the baked survival series in log space; trivial cost, no rAF loop (the coda still has no sim, ticket 03's constraint intact).
- **Continuous stroke ramp** — the plot component needs a per-segment (or gradient) stroke along the curve; panel 1's is a two-regime split. Small addition to the plot renderer, same palette tokens.
- **Responsive board** — plot components must accept a width at render *and* re-lay-out on breakpoint change; today's coda plot is a fixed 860×500.

## Acceptance (this design is "right")

- The **same drag** on the two panels produces **opposite outcomes** — a flip and a leap on panel 1, a smooth 2,000× climb with no break anywhere on panel 2 — and a viewer who does both understands the contrast before reading the seam line.
- Panel 2 **never re-spends** ticket 05: no refusal, no `1 grain → N cells`; its readout states rarity, which the exhibit never did.
- The panel is **complete standalone** — on direct arrival, with no exhibit-2 history and no JS, it still reads as a finished, meaningful instrument (line + annotation + four lines of copy + source).
- At ≥1100px both shapes are **on screen together**; below it, the board stacks and each plot is hero-scale again — and at neither size does the page read as WIP (no ghost cards; one muted promise line).
- Keyboard and screen-reader paths get the same climb (`aria-valuetext` speaks the rarity sentence); reduced motion costs nothing because nothing here animates.
- Nothing invents chrome: it is the locked slot, the locked palette applied with its boundary removed, and the existing plot component in a sixth config.

## References

Locks consumed: ticket 03 (board-slot contract, coda register, `★ your run` pattern, no-ghost-cards degrade — dec. 7 amended here), ticket 04 (panel 2's contents, the survival plot, the cool→warm ramp rule), ticket 05 (what must **not** be re-spent: the refusal beat, the invariant readout; and the "you are a dot on the law" plot spine). Spec: §6, §3.2, §5.1, §9. Intent lenses: storytelling, articulate, include, fortify.
