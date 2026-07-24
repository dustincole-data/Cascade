# 01 — Prototype the forest-fire hero look

**Type:** HITL · prototype (`/prototype` + Impeccable)
**Status:** ✅ RESOLVED 2026-07-23 — Dustin picked the **graft (Direction B stage bloom + Direction A framed chrome + scientific plot)**. Reference: [../assets/01-forest-fire-look.html](../assets/01-forest-fire-look.html) · 2-dir study: [../assets/01-forest-fire-look-study.html](../assets/01-forest-fire-look-study.html). Fold-ins: palette CVD-validated (poles ΔE 8.8 ≥ 8.0, hexes kept); mono = JetBrains Mono; 60fps confirmed (repaint the ~125-cell front, 1.66 ms/tick @160², no WebGL). Fed into spec §1 + §4.4. Was the pivotal ticket — everything visual hung off it.
**Blocks:** on-ramp choreography, synthesis coda, and ultimately the spec's final lock (design-first: the look is the hero). — *now unblocked.*

## The question (a decision to settle, not a build)

What is the **locked visual look** of Cascade's dark instrument stage — specifically the forest-fire exhibit's mid-burn frame + its fraction-burned-vs-density signature plot + the chrome/control-bar — such that Dustin says *"that's it"*? This is the Namesake-04 / Meaning-Map-04 analog: the hero-look ticket that de-risks the whole build. Per `design-first-on-visual-projects` + `design-anchor-before-mocks`, this must be resolved with a beautiful artifact in front of Dustin BEFORE any engine is wired.

## Approach

A single self-contained static HTML with **two directions** of the dark stage (throwaway prototype — not the product). Each direction shows:
- **(a) A frozen mid-burn forest-fire frame** — warm-spectral glow + radial halo on `--stage` (near-black), cool-teal unburned trees, charcoal scar. Enough cells to read as a forest at a hair past d≈0.59 (fire sweeping across).
- **(b) The signature plot** — fraction-burned (y) vs density (x), the S-curve with the sharp knee at ≈0.59, **annotation label OFF the curve** (leader + halo), mono axis labels, a method/source line.
- **(c) Chrome** — the control bar (density slider, Spark, Play/Pause, Reset, Speed), one small Archivo heading, mono labels/readouts.

Vary the two directions on **glow intensity / chrome weight / plot treatment** — NOT on the locked fundamentals (dark stage, small Archivo type, CVD-honest cool-alive / warm-event poles, labels-off-lines).

## Inputs / sub-tasks (fold into this ticket)

- **CVD-validate the palette** with the `dataviz` skill's `validate_palette.js` (the §1.2 starting hexes) → adjust; the poles must survive color-blindness + carry state by luminance too.
- **Confirm the 60fps grid size** (rough perf sanity for canvas 2D at the intended cell count).
- **Pick the mono** (JetBrains Mono vs Spline Sans Mono) for the instrument readouts.

## Acceptance

Dustin picks ONE direction (or a graft). That becomes the **visual lock** for build Phases 1–5 and feeds back into the spec's §1 (aesthetic) + §4.4 (signature plot). Save the approved static reference in `.scratch/cascade/assets/` (e.g. `01-forest-fire-look.html`) — the Namesake `namesake-look-reference.html` pattern. Record the resolution one-line in the map's *Decisions so far*.

## References

Bremer/Visual Cinnamon (spectral + glow) · Stefaner/Truth&Beauty (frame, rigour) · Lupi (legend/key). Memories: `design-canon-visual-cinnamon`, `dustin-dataviz-borrow-recipe`, `namesake-project`.
