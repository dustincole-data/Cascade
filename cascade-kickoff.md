# Cascade — new-session kickoff

**One-line:** a dustincoledata personal explorable-explanation site on ONE idea — *how one small action can have enormous consequences* — told as three lean interactive exhibits sharing a single engine.

## Why this supersedes "Emergence"

The earlier Emergence framing (self-organization: boids / fireflies / reaction-diffusion) showed the **wrong lesson**. Those demonstrate *many agents → one pattern*, not *small cause → big effect*. Dustin's actual thesis is the **tipping point / cascade** — a tiny action with outsized, sometimes unpredictable, consequences. Cascade is that. Retire the boids/fireflies/RD bake-off; it answered the wrong question.

## The thesis (the through-line = the point)

**"One small thing, enormous consequences — three ways the world does it."** Three mechanisms, same meta-aha:

1. **Forest fire / percolation — the tipping point.** A density slider + one lightning spark. Below critical density the spark fizzles; nudge density a hair past threshold and the *same* spark burns the *whole* forest. Lesson: phase transitions / tipping points (epidemics past R=1, ideas going viral, one more load → blackout). **Build this exhibit FIRST.**
2. **Sandpile / self-organized criticality.** Drop grains one at a time; the pile self-tunes to a critical slope; then a *single* grain sometimes triggers an avalanche of *any* size, unpredictably. Lesson: why catastrophes of any magnitude are built in and fundamentally unpredictable (power laws).
3. **Network cascade / blackout.** Knock out ONE node in a connected grid; usually contained, occasionally cascades to collapse the whole network. Lesson: cascading failure in connected systems. (Keep it a **neutral power grid — apolitical**, not social/political.)

The synthesis across the three is what reads as *intelligence* — the thing Dustin felt was missing from the boids version.

## Scope discipline (this IS the low-risk plan)

- Build **ONE shared shell** first: visual system, palette, chrome, the on-ramp→sandbox structure, and the common controls (click-to-act + a slider or two + play/pause/reset).
- Ship the **shell + forest-fire exhibit end-to-end**, validate, *then* graduate exhibits 2 & 3 onto the proven shell — they're new **rule-sets, not new products** (~1.4× the work, not 3×). If time runs short, one complete exhibit still ships.
- **Structure per exhibit:** guided on-ramp → free sandbox. A few show-don't-tell beats build the rule and land the aha, then release to play. Keep the on-ramp genuinely light (not a multi-chapter journey).

## Hard constraints (verbatim)

FREE; LOW upkeep — fully **in-browser computed, NO dataset, no cron**; canvas (WebGL only if an exhibit truly needs it); **deterministic where possible**; static ~zero runtime. Doable/self-contained. New standalone repo like Namesake (under `github.com/dustincole-data/`) → own Vercel → linked from dustincoledata.com. Personal, apolitical.

## Design-first

Lock the shell's look with a `/prototype` ticket + Impeccable early — the living visual IS the hero. Consult `dustin-brand-anchor` + `dustincoledata-design-direction` memories + brain first. Final spec → repo `.claude/plans/`. Wayfinder tracker = local-markdown.

## Name

Working title **Cascade** (single evocative noun; it's literally what all three do). Alternates: Tipping Point, Ripple, Chain Reaction. "Effects" is serviceable but vague. Confirm during charting.

---

## Paste-ready `/wayfinder` kickoff

```
/wayfinder Chart the design for "Cascade" — a dustincoledata personal explorable-explanation site on ONE idea: how one small action can have enormous consequences. Three interactive "exhibits," each a lean canvas simulation sharing one engine/shell, each landing the same meta-aha via a different mechanism:
  1. Forest fire / percolation — the tipping point (one more tree, or one spark, flips fizzle → whole forest burns). BUILD THIS FIRST.
  2. Sandpile / self-organized criticality — one grain sometimes triggers an avalanche of any size, unpredictably (power laws).
  3. Network cascade / blackout — knock out one node → it can cascade and collapse the whole grid (neutral power grid, apolitical).
Supersedes the earlier "Emergence" framing (self-organization / boids-fireflies) — that showed the WRONG lesson; Cascade is small-cause-big-effect / tipping points / cascades. New standalone repo like Namesake (under dustincole-data), Vercel, links from dustincoledata.com.

Destination: a locked visual design spec + build plan ready to hand to a separate build session. Plan, don't build.

Notes:
- Scope discipline (the whole low-risk plan): build ONE shared shell (visual system, palette, chrome, on-ramp→sandbox structure, click-to-act + slider + play/pause/reset controls) + the FIRST exhibit (forest fire) end-to-end. Exhibits 2 and 3 graduate onto the proven shell as fog clears — new rule-sets, not new products (~1.4× the work, not 3×). If time runs short, one complete exhibit still ships.
- Structure: guided on-ramp → sandbox per exhibit (a few show-don't-tell beats build the rule + land the aha, then free play). Keep the on-ramp genuinely light.
- Through-line: "one small thing, enormous consequences — three ways the world does it" (threshold · criticality · cascade). The synthesis is the point; it's what reads as intelligence.
- Design-first: lock the shell's look with a /prototype ticket + Impeccable early; the living visual IS the hero.
- Brand+design: consult dustin-brand-anchor + dustincoledata-design-direction memories + brain first. Personal, apolitical.
- Hard constraints: FREE; LOW upkeep — fully computed in-browser, NO dataset, no cron. Doable/self-contained.
- Tech: canvas (WebGL only if an exhibit truly needs it); deterministic where possible.
- Tracker: local-markdown. Final spec → repo .claude/plans/.
```
