# 03 — Synthesis coda: first panel (forest fire → the knee)

**Type:** HITL · design decision (`/grilling` + Intent) · **Plan-don't-build.**
**Status:** ✅ RESOLVED 2026-07-24 — 12 decisions locked with Dustin via grilling. Feeds spec §6 (rewritten — the coda), §4.4 (adds a coda-config for the plot), §3.2 (signature-plot component gains a coda mode).
**Depends on:** ticket 01 — hero look + plot §4.4 LOCKED ([../assets/01-forest-fire-look.html](../assets/01-forest-fire-look.html)); ticket 02 — on-ramp aha *"cliffs, not ramps"* LOCKED ([02-on-ramp-choreography.md](02-on-ramp-choreography.md)).
**Was:** `[FRONTIER · next] Synthesis coda design` in the map. **Now:** the coda's *first panel* is locked; panels 2 & 3 + the full 3-up board layout + arrival routing remain fog (later tickets, unblock as ≥2 plots exist).

## Scope fence (what this ticket does and does NOT settle)

- **Does:** the forest-fire coda panel end-to-end — its register, plot treatment, copy, the one interaction, and how it sits as *first-of-three* when it's the only panel that exists. Plus the **board-slot contract** so panels 2 & 3 echo cleanly.
- **Does NOT:** the sandpile/network panels themselves (fog until their plots exist), the final 3-up board layout/responsive grid, or the routing that lands the user on `/synthesis` (the forest-fire → coda handoff). Those are named as downstream frontier, not designed here.

## The question (a decision to settle, not a build)

How does the locked forest-fire signature plot (§4.4 — S-curve, knee at d_c≈0.59) **rhyme into the meta-aha** *"one small thing, enormous consequences"* — reusing the on-ramp's locked *"cliffs, not ramps"* — as the coda's first panel? (Map frontier: *"how the three signature plots rhyme into the meta-aha … the coda's first panel (threshold → the knee) can be designed."*)

## Resolution — the spine (everything hangs off this)

**The coda's job is the intelligence the exhibit can't give: naming and generalizing.** The exhibit delivered the *felt* hit ("cliffs, not ramps," in the fingertips). This panel's one job: **bridge the felt-personal to the named-universal** — give the thing you felt a name (**threshold**) and place it as *one of three ways the world does small-cause → big-effect.*

So the panel plays the **opposite register to the exhibit**: where the exhibit was a hot, tactile stage, the coda is a **calm instrument readout** — and *the calm is the point* (it reads as reflection, as understanding, not repetition). The signature plot, which was **supporting cast** beside the stage in the exhibit, becomes the **hero** here (there is no stage in the coda). One restrained re-feel keeps the aha in the hand so the meta-idea doesn't land as words alone.

Intent lenses that shaped it: **storytelling** (what-is → what-could-be: your one cliff → a universal shape) · **articulate** (the interaction already taught "threshold"; the coda *names* it, doesn't lecture) · **include** + **fortify** (keyboard / reduced-motion / no-JS paths carry the same meaning).

## The 12 locked decisions

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | **Register** | **Calm reflection + one re-feel.** A still, rigorous instrument readout that *names* threshold and generalizes it; ONE draggable marker keeps the cliff tactile. Not a re-run of the sim (that would repeat, not reflect); not fully static (that would lose the locked "felt in the fingertips"). *The contrast with the hot exhibit is deliberate — the calm reads as intelligence.* |
| 2 | **Plot source** | **Canonical backbone + your crossing.** Always the clean canonical Monte-Carlo S-curve (§4.4 method) — authoritative, deterministic, rhymes with panels 2–3, and works on **direct arrival** (no exhibit run needed). **If** the user came through the exhibit, a subtle static **`★ your run`** tick marks their real crossing density on the axis (a memory mark), gracefully absent otherwise. The coda names the *law*; the star is the personal thread. |
| 3 | **Rhyme grammar** | **Shared template, true shapes.** One reusable **pattern-panel** the other two echo: `concept-word` + the **real** instrument plot (its honest shape) + **one critical feature** highlighted in the locked annotation style (off-line label + thin leader + hot-core dot) + **cool = safe regime / warm-spectral = catastrophe regime** coloring + a **plain line**. The rhyme lives in identical *framing / annotation / color / "mark the small→big locus,"* never in forcing the shapes to match. Each science stays itself. → **board-slot contract** below. |
| 4 | **Copy stack** | **Layered but tight — 4 short lines** (Archivo small; canon: words stay small even here, the coda is just the one place they do the most work). Named + felt + landed-in-the-world, so the panel is complete standalone. Exact draft in the copy block below. |
| 5 | **Re-feel mechanic** | **The plot performs the cliff.** Drag the marker along the curve: the **fraction-burned y-readout leaps** as it crosses the near-vertical knee (tiny Δx → huge Δy = "cliffs not ramps" *enacted on the instrument*), the marker flips **cyan→amber** at the exact d_c pixel, and the **catastrophe regime right of the knee floods warm-spectral**. No sim, no forest glimpse — the chart itself is the drama; the calm register holds. |
| 6 | **One-of-three** | **Clean degrade + one promise line.** Solo, the coda shows the header + the live panel 1 + **one muted forward line** ("criticality and cascade — the next two exhibits"). **No empty/ghost cards** (Dustin's brand resists "coming soon"). The panel is *built as a board-slot* (dec. 3), so when 2 & 3 land the layout reflows to the 3-up board — but alone it reads **finished, not WIP.** |
| 7 | **Plot-as-hero** (derived) | In the coda there is no stage, so the **signature plot leads** — same locked §4.4 treatment (scatter + smoothed spectral mean curve + faint gridlines + off-line annotation), **promoted in scale** to be the largest bright object on the panel. Canon holds: the rigorous graphic carries it, chrome/type stay small. |
| 8 | **Coda annotation** (derived) | The plot's on-canvas annotation in coda-config = **`threshold · d_c ≈ 0.59`** (mono, off-line, thin leader) — *technical*, naming the concept. The exhibit's §4.4 annotation phrase *"the same spark now takes everything"* is **not repeated** on the plot here; that meaning is carried by the panel's plain line (dec. 4). Source line unchanged: *"site-percolation threshold · square lattice ≈ 0.5927."* |
| 9 | **Resting state** (derived) | **No autoplay.** The interactive marker **rests just below the knee** (cyan, poised) with a subtle drag affordance (faint one-time hint / handle); nothing moves on its own. Calm + reduced-motion friendly. Distinct from the `★ your run` memory tick (dec. 2), which is static. |
| 10 | **a11y** (Intent:include, derived) | Marker is **keyboard-operable** — arrow-keys step density across d_c and get the **same cyan→amber flip + y-leap**, rendered as **discrete states**. **Reduced-motion:** the crossing is a before/after state swap (no animated sweep/flood), keeping the fizzle-vs-total contrast. Meaning **never rides on color alone** — luminance (dim→bright), the leaping y-readout, and the annotation all carry it (consistent §1.2). |
| 11 | **Progressive enhancement** (Intent:fortify, derived) | With **no JS**, the panel still renders the static canonical plot + the `threshold` annotation + the 4-line copy + the promise line — a complete, meaningful reflection. The re-feel marker is a **pure enhancement**, never load-bearing for the aha. |
| 12 | **Board-slot contract** (derived) | Panel 1 defines the slot every coda panel fills (dec. 3), so 2 & 3 drop in without redesign. Contract below. |

## The panel anatomy (hand to build)

Top → bottom, one self-contained board-slot unit:

| Zone | Content | Treatment |
|---|---|---|
| **Concept word** | `THRESHOLD` | Mono (JetBrains), small, `--ink-muted`. The jargon named at last (on-ramp withheld it on purpose — ticket 02, dec. #19). |
| **The plot (hero)** | Canonical fraction-burned-vs-density S-curve; faint real scatter + smoothed spectral mean curve (amber→magenta) + faint gridlines; **`threshold · d_c ≈ 0.59`** off-line annotation w/ thin leader + hot-core knee dot; live density **marker** (vertical line + dot); optional static **`★ your run`** tick at the user's real crossing. | Locked §4.4 treatment, **promoted to hero scale**. Cool/teal below d_c, warm-spectral catastrophe regime above. JetBrains mono axis labels. Source line beneath. |
| **Re-feel** | Drag the marker (or arrow-keys) → y-readout leaps at the knee, marker flips cyan→amber, catastrophe regime floods warm. | The one interaction. Rests poised just below the knee; no autoplay; discrete states under reduced-motion. |
| **Plain line** | "Cross a line and the same spark changes everything." | Archivo, small, `--ink`. The mechanism in plain language. |
| **Felt callback** | "Cliffs, not ramps." | Archivo/mono, smaller, `--ink-muted`. Ties to the exhibit aha. |
| **Real-world echo** | "An epidemic past R = 1." | Mono/Archivo, small, `--ink-muted`. Lands threshold in the world (apolitical; §6's threshold echo). *Wording is Dustin-redlineable for voice.* |
| **Degrade frame** | Coda header: *"One small thing, enormous consequences — three ways the world does it."* + (solo only) one muted line: *"criticality and cascade — the next two exhibits."* | Frames panel 1 as first-of-three; reflows to the 3-up board when 2 & 3 exist. |

**Copy block (draft — voice-redline welcome):**
```
THRESHOLD
Cross a line and the same spark changes everything.
Cliffs, not ramps.
An epidemic past R = 1.
```

**Board-slot contract (so panels 2 & 3 echo):** each coda panel = `{ concept-word, hero plot (real shape · one critical feature off-line-annotated · cool safe-regime / warm-spectral catastrophe-regime), plain line, felt callback, real-world echo }`. Fills for the fog panels (design later): sandpile → `CRITICALITY` · power-law log-log line · "Disasters of every size are built in." · *(sandpile aha)* · "An idea going viral."; network → `CASCADE` · heavy-tail distribution · "One failure can take the whole connected system." · *(network aha)* · "A grid failing on a hot day." — **not locked here; shown only to prove the slot generalizes.**

## Feeds spec (edits the build session applies)

- **§6 (rewrite):** the coda = a **degrade-frame board** under the "three ways" header; the **first panel spec** above; solo behavior (header + panel 1 + one promise line, no ghost cards); the board-slot contract; reflow to 3-up as panels land. Real-world echoes attach **per-panel** (threshold → "an epidemic past R = 1").
- **§4.4 (add a coda-config note):** the signature plot gets a **coda mode** — hero scale, canonical curve always drawn (not user-built), `threshold · d_c≈0.59` annotation, optional `★ your run` tick, and the **y-leap re-feel marker** (plot-only, no sim).
- **§3.2 (signature-plot component):** now one component, **four configs** — exhibit-live, exhibit-on-ramp (ticket 02), **coda**, plus panels 2/3 later. Coda config = static canonical data + interactive marker + threshold annotation.

## Engine / build constraints this ticket adds

- **Canonical curve is precomputed + baked** (the §4.4 prototype's ~16 trials × ~46 densities Monte-Carlo), shipped as static data — the coda never needs a live sim (keeps calm register + FREE/low-upkeep; deterministic).
- **Cross-route personal thread is optional + cheap:** the `★ your run` tick reads one number (the user's crossing density) from `localStorage` (ticket 02 already sets a completion flag) — **absent ⇒ panel still complete.** No new server/state machinery.
- **Marker = plot-space only** (no forest re-render): drag/arrow updates marker x, reads y off the baked curve, flips color at d_c, toggles the catastrophe-regime warm fill. Trivial cost; no rAF sim loop on the coda.
- **Progressive enhancement:** SSR/static renders the plot + annotation + copy; the marker hydrates as an enhancement.

## Acceptance (this design is "right")

- The forest-fire plot reads as a **calm, hero-scale instrument** — the opposite register to the exhibit stage — and names **threshold** without re-teaching it.
- **One drag re-fires the cliff** in the instrument: the y-readout leaps at the knee, the marker flips cyan→amber at the exact d_c pixel, the catastrophe regime floods warm — with keyboard + reduced-motion + no-JS paths delivering the same contrast and outcome readout (color is never the only carrier).
- The 4-line copy makes the plot **rhyme into the meta-aha** — named (threshold), felt (cliffs not ramps), landed (an epidemic past R=1) — and the panel is **complete standalone**.
- Solo, the coda reads **finished** (header + panel + one promise line, no ghost cards); the panel is built as a **board-slot** that reflows to the 3-up rhyme board when panels 2 & 3 exist.
- Nothing here contradicts the locked look (§1/§4.4) or on-ramp (§4.2); it **reuses** the signature-plot component in a new config rather than inventing chrome.

## References

Intent lenses: **storytelling** (what-is → what-could-be), **articulate** (name, don't lecture — the interaction already taught it), **include** (keyboard / reduced-motion / color-independent meaning), **fortify** (direct-arrival / no-JS / near-miss preserved). Canon: the rigorous graphic is the hero, chrome + type stay small, glow disciplined. Locks consumed: ticket 01 (look + §4.4 plot), ticket 02 ("cliffs, not ramps" aha + `localStorage` flag). Spec: §6 (coda), §4.4 (plot), §3.2 (component), §2 (standalone-fallback).
