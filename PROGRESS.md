# Cascade — build log

Tracker for the phased build in the locked spec, [§9](.claude/plans/2026-07-23-cascade-design.md).
Plan being executed: [2026-07-24-cascade-forest-fire-build.md](.claude/plans/2026-07-24-cascade-forest-fire-build.md).

## Phases

- [x] **Phase 0 — Look-study** (2026-07-23). Dustin picked the graft: Direction B's stage bloom inside Direction A's framed chrome + rigorous plot. Reference: [`.scratch/cascade/assets/01-forest-fire-look.html`](.scratch/cascade/assets/01-forest-fire-look.html).
- [x] **Phase 1 — Shell.** Astro static scaffold, deploy config, locked palette + type tokens, instrument chrome, control bar, seed/reset, a11y plumbing, reusable signature plot.
- [x] **Phase 2 — Exhibit 1 end-to-end.** Percolation core (tested), canvas stage, live signature plot, 3-beat on-ramp, free sandbox. §4.5 acceptance met and verified in-browser at every step.
- [x] **Phase 3 — Landing + synthesis coda.** Landing frames the thesis with one live door; `/synthesis` panel 1 built as a board-slot.
- [~] **Phase 4 — Ship** (2026-07-24). Done: repo [`dustincole-data/Cascade`](https://github.com/dustincole-data/Cascade) created public, all commits pushed; Vercel project `cascade` created and **GitHub-connected** (a push to `main` builds automatically — proven, 15s build, Ready); domain `cascade.dustincoledata.com` added to the project. **Remaining — one manual step:** add the DNS record at Namecheap (see below). Until then the site is not publicly reachable.
- [ ] **Phase 5 — Graduate exhibits 2 & 3** (sandpile, then network) as new rule-sets on the proven shell. Not started.

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

## Open

- **DNS (blocking the public launch).** `dustincoledata.com` runs on Namecheap nameservers (`dns1/dns2.registrar-servers.com`), not Vercel's, so Vercel's own DNS panel is not authoritative. Add at Namecheap:

  | Type | Host | Value |
  |---|---|---|
  | CNAME | `cascade` | `36ca4220b061ecc3.vercel-dns-017.com.` |

  This is the same pattern `moves` already uses (`d90d5b329ae0d868.vercel-dns-017.com`). Then `vercel domains verify cascade.dustincoledata.com`. If the certificate stalls, remove and re-add the domain.
- Add a Cascade `<ProjectCard external>` to dustincoledata.com `/projects` (spec §7 — out of scope for this repo; note for a site session).

## Deploy notes

- **Node 24.x, not the spec's 22.** Vercel's current default, and what every other dustincoledata project runs. Newer and supported; no reason to pin backwards.
- **Deployment protection is on for `*.vercel.app` URLs** — they redirect to a Vercel login, and `curl` sees a **200 for the login page**, so a status code alone proves nothing there. Production custom domains bypass it (verified against the live `moves.dustincoledata.com`).
