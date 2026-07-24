# 05 — Sandpile: on-ramp choreography

**Type:** HITL · design decision (`/grilling` + Intent) · **Plan-don't-build.**
**Status:** ✅ RESOLVED 2026-07-24 — 8 forks + 12 derived decisions locked with Dustin via grilling. Feeds spec §5.1 (on-ramp block), §3.4, §9 (Phase 5).
**Depends on:** ticket 04 (the instrument — spine, dial, charge, plot, readouts) ✅ closed. Grammar from ticket 02 (fire's on-ramp).
**Was:** part of *"Sandpile exhibit specifics"* in the map's fog; graduated by ticket 04.

## Scope fence

- **Does:** the sandpile's guided beats — how many, what the user does in each, what the caption strip says, where the charge sits in the sequence, what gates release to the sandbox, and the re-entry/skip behaviour.
- **Does NOT:** the instrument itself (locked, ticket 04), coda panel 2 (ticket 06), the network exhibit.

## The question

Fire's on-ramp works by **planting a linear expectation and shattering it** — beat 2 is the trap (ticket 02). The sandpile has no user-owned dial to trap them with, and its aha is *"nobody set the dial."* So: **what is the sandpile's trap?**

## Resolution — the spine (everything hangs off this)

**The trap is the dial you no longer have.**

Fire trapped the user with their own hand *on* the dial. The sandpile traps them with the expectation that a dial exists at all — and that expectation plants itself for free, twice over: a visitor arriving from exhibit 1 was **just taught "I set the parameter, the parameter sets the outcome,"** and a newcomer watching a needle climb for twelve seconds assumes the same thing. So the on-ramp invites them to push it, and the system refuses. Then the grain that did nothing in beat 1 takes six thousand cells.

Two shatters, one story: **the system chose its own edge, and at that edge size is unbounded.** Beat 2 breaks *more input → more parameter*; beat 3 breaks *small input → small output*. The instrument's spine (ticket 04) is landed by the user's hand being refused, not by a caption asserting it — and the refusal is the one shape exhibit 1 cannot repeat, which is what keeps exhibit 2 from reading as exhibit 1 with grains.

The small→big through-line is carried by the readout's invariant left side across the whole ramp: **`1 grain → 0 cells` … `1 grain → 6,140 cells`.**

## The 8 locked forks

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | **The trap** | **The dial refuses.** Plant *"input drives the parameter"*; beat 2 springs it — crank the speed, hold the feed, watch `grains` race into the thousands, and the slope sits at 2.09 ▲ against its critical tick. Their own hand gets refused. Rejected: *stable ≠ safe* (true to criticality, but the shatter is still small→big — fire's shape — and "nobody set it" ends up **told** by the caption rather than felt); *the size trap* (small/small/enormous — fire's exact structure in new nouns, the rhyme ticket 04 fork 1 already refused); *predict-and-be-wrong* (needs a prediction affordance the canon wants quiet, and teaches "you can't guess" instead of "nobody set the dial"). |
| 2 | **Where the charge sits** | **Beat 1 = their grain starts it.** Empty table; they tap a cell; one dim grain sits there doing nothing (`1 grain → 0 cells`); the caption hands over — *"here are fifteen thousand"* — and the batched rain runs, the dial climbs, the field warms, it parks. Teaches the money verb first, makes its outcome **nothing** (the baseline beat 3 detonates — the exact rhyme with fire's spark that dies), and pins the readout's left side from the first second. Satisfies ticket 02 decision 2 (**user acts every beat**): the twelve-second watch is something they started. Rejected: *press ▷ Feed to start* (cleaner control pedagogy, but the first act is on the chrome, not the stage, and it spends beat 1 without planting the dead-grain baseline); *pre-beat charge under the caption* (~12 s faster to the payoff, but the first thing the visitor does on the page is watch — which breaks the on-ramp's credibility mechanism). |
| 3 | **The refusal act** | **▷ Feed + speed to max.** Prompt *"pour it in — push the slope higher"*; both controls spotlit; gate = **~3,000 grains fed with Δslope < 0.02**. Teaches the two controls fire only released at the sandbox, inside the beat that needs them; the roiling stage keeps the beat from reading as broken; *"turn it up"* is exactly the mental model being broken. Rejected: *mash the stage* (strongest ownership, but ~20 clicks mid-ramp is a chore, queued avalanche animations get messy, and it teaches nothing new); *try to drag the dial* (most literal, but ticket 04 fork 2 refused to teach a broken control, and D6 makes the dial non-focusable + `aria-hidden`, so **no keyboard user could perform the beat**). |
| 4 | **The payoff drop** | **Spotlit cell, one drop.** A pulsing ring marks one seeded cell — the exact rhyme with fire beat 3's pulsing knee-tick (*can't miss it, can't overshoot into confusion*). The avalanche is genuinely computed; the ring reveals an invisible fact — **the cell that takes a quarter of the field looks identical to every other cell.** Deterministic, so the lesson copy is fixed. Rejected: *free tap, repeat until big* (honest and it is criticality's real texture, but at τ≈1.1 the beat has no bounded length, the lesson copy can't be fixed because the outcome isn't, and a stalling final beat breaks §3.4's "genuinely light"); *free tap first, then the ring* (recovered anyway as the near-miss — see fork 8 — without spending a fourth action). |
| 5 | **Plot across the ramp** | **The backbone waits; one point lands.** The faint baked backbone renders from SSR (D7) and **nothing moves through beats 1–2**. At the beat-3 monster, in one frame: the field goes white, `1 grain → 6,140 cells` appears, the user's **first plotted point ever** lands far out on the right tail, the backbone **brightens** under it, and the annotation + leader resolve. Fire's payoff was *your points revealed the curve*; this one is *the curve was always there and you are a dot on it* — **the plot rhymes the spine** instead of repeating exhibit 1. Rejected: *the charge draws the backbone live* (gorgeous, and it would make the backbone earned rather than shipped — but it adds a third animated thing to the beat whose entire job is watch-the-dial-park, and ticket 04 fork 5 chose built-by-play over pre-baked for ownership); *plot dark until beat 3* (sharpest single moment, but D7's SSR backbone would have to visibly vanish on hydration). |
| 6 | **Skip / re-entry / Reset** | **Paced once, fast forever after.** The 12 s paced charge exists only in the on-ramp. **Skip** → the same seeded charge runs instantly, sandbox opens critical with everything live. **Return** (`cascade.sp.onramp`) → same, plus a quiet *"▷ replay intro."* **↺ Reset** → empties and recharges in ~1–2 s, batched at full speed, still visibly warming with the dial climbing — the spine is re-proven on every reset without costing 12 s. Rejected: *full 12 s on every Reset* (a 12 s gate on the sandbox's most-pressed button reads as a loading screen by the third press); *skip/reset leave the table empty* (most honest and cheapest, but a visitor who skipped the intro to reach the toy finds a stage where nothing happens). |
| 7 | **Copy** | **The observational set** (table below) — fire's flat, jargon-free cadence. Beat 3's lesson points back at beat 1's dead grain rather than restating the readout's number. **Beat 1 carries a mid-beat line** (the hand-off that makes the flood theirs), a small addition to the `Beat` shape. ***"Nobody set the dial."* is unspent** — ticket 04 fork 7 reserved it as the coda callback, so no beat uses it. |
| 8 | **The near-miss** | **An off-ring drop is a real, small, animated avalanche** — honored, with its readout and its plot point. The ring keeps pulsing; the beat completes only on the ring cell. Preserves ticket 02 decision 6's near-miss principle (0.58 still fizzles), **proves** the ring's cell was special rather than asserting it, and hands over the size contrast (`1 grain → 3 cells`, then `1 grain → 6,140 cells`) without spending a fourth beat. Rejected: *ignore off-ring drops* (teaches the dead stage ticket 04 refused; a no-op click on the money verb reads as a bug); *any drop triggers the monster* (the avalanche would no longer be the one the pile computes for that cell — every claim the exhibit makes about real seeded simulation would be false at its single most important moment). |

## The choreography (hand to build)

| Beat | Pre-set state | Spotlight | User action | Stage result | Plot result | Prompt (mono) → Lesson (Archivo, after result) |
|---|---|---|---|---|---|---|
| **1** | Empty 64² table; dial `0.00`; plot = faint baked backbone; all other controls gated | stage (tappable) | **Tap a cell** → one grain sits, nothing happens. Caption hands over → the **batched charge** runs (~1.2k/s, ~12 s), dial climbs, field warms, **parks ≈2.1** | Dim field → warm, tense mixed field; no per-avalanche animation | Unchanged (backbone only) | `drop a grain` · *mid:* `one grain does nothing. here are fifteen thousand.` → **It loads itself. Then it stops.** |
| **2** | Pile critical; dial parked and jittering at its critical tick | ▷ Feed + speed | **Crank speed to max and hold Feed** — ~3,000 grains poured in | Roils constantly (still batched — weather, not events); `grains` races into the thousands; slope does not move | Unchanged | `pour it in — push the slope higher` → **All that. The slope didn't move.** |
| **3** | A **pulsing ring** on one seeded cell; time base switches to *critical* | stage (ring) | **Drop on the ring.** Off-ring drops are honored as real small avalanches (the near-miss); the beat completes only on the ring | **First animated avalanche of the session** — a front sweeps ~a quarter of the field white-hot (`FIRE` ramp + halo) | **First point ever** lands far out on the right tail; backbone **brightens**; annotation + leader resolve on the user's own max | `one more grain — here` → **The same grain. Nothing, then this.** |
| **→ sandbox** | Pile stays exactly as they left it; ⤫ Shuffle + ↺ Reset fade in | all controls | free play | full sandbox (§5.1) | user series builds, drop by drop | `drop anywhere →` → **Now it's yours.** |

**The felt mechanic:** the readout's left side never changes across the entire ramp — `1 grain → 0 cells` in beat 1, greyed through the weather, `1 grain → 6,140 cells` in beat 3. The argument is made by an invariant, not by a sentence.

## The 12 derived decisions

| # | Derived | Call |
|---|---|---|
| D1 | **Weather vs event** | **Batched = weather, animated = event.** Weather (the charge, the feed, a Reset recharge) moves only the dial and the field's warmth. Events move the readout and the plot. One rule, and it protects the payoff — plotting beat 2's 3,000 avalanches would draw the whole straight line before the user has dropped a grain of their own. |
| D2 | **Beat 2 is batched** | The feed runs on the charge's time base: no per-avalanche animation. Beat 3's front is therefore **the first avalanche the user ever sees as an event**, not just the biggest. |
| D3 | **Readout schedule** | `1 grain → N cells` is present from beat 1 (`→ 0 cells`) and **dimmed through the batched phases** — during weather no single grain owns the outcome. It comes alive at beat 3. **`biggest` first appears at beat 3** (showing the monster) and ratchets from there. |
| D4 | **Beat gates** | Beat 1 = the dial parks (Δslope < 0.02 over the last ~500 grains). Beat 2 = ~3,000 grains fed with Δslope < 0.02. Beat 3 = a drop **on the ring cell** resolves. |
| D5 | **Feed honesty** | The feed is always **one grain → resolve → next grain**, only faster in wall-clock. Dropping grains concurrently really would push mean height above 2.1, and beat 2 would be a lie. Speed changes wall-clock only, never ordering. |
| D6 | **Ring determinism** | The ring cell is found by replaying the seeded charge at build time (or on the fly from the same seed) and picking a cell whose avalanche is large. Same seed → same ring → same monster → fixed copy. ⤫ Shuffle is gated out of the on-ramp so the seed can't drift under it. |
| D7 | **Control gating** | Beat 1: stage only. Beat 2: + ▷ Feed and speed. Beat 3: stage only again (feed disabled so the payoff is one grain). Release adds **only ⤫ Shuffle and ↺ Reset** — unlike fire, whose release introduced Play/Speed. The dial is never live in any phase. |
| D8 | **Caption strip** | Reuses fire's slim strip above the frame — beat line + prompt left, `1·2·3` progress + persistent *"skip intro →"* right. **Never overlaid on the stage.** Beat 1 additionally swaps in a mid-line when the charge starts. |
| D9 | **a11y — keyboard** | Entering beat 3 **moves the stage's focus cell onto the ring cell**, so Enter completes the beat immediately; arrows still let a keyboard user take the near-miss. The ring is announced in the beat prompt, never by color alone. |
| D10 | **a11y — reduced motion** | Charge still runs (a climbing number and a warming field are not vestibular); the beat-3 avalanche is an **immediate before/after state swap**, with the outcome carried by `1 grain → N cells` and the new plot point (D6 of ticket 04, applied). Caption swaps are instant. |
| D11 | **`Beat` shape** | [`src/lib/beats-config.ts`](../../../src/lib/beats-config.ts)'s `Beat` (`prompt` · `lesson` · `spotlight` · `presetD` · `done`) generalizes: `presetD` becomes exhibit-specific pre-set state, `spotlight` widens beyond `'stage' | 'density'`, and an **optional `mid`** line is added. Same generalization pressure as ticket 04's D9 — budget it there, don't re-litigate it here. |
| D12 | **Storage** | Completion flag `cascade.sp.onramp` (fire's `cascade.ff.onramp` pattern, per-exhibit). Private-mode failure simply replays the on-ramp, as fire already does. |

## Engine / build constraints this ticket adds

- **Sequential feed at any speed** (D5) — the speed control multiplies wall-clock rate, never overlaps grains.
- **A batched phase that renders** — the charge and beat 2 both advance thousands of drops per frame while repainting only the field's warmth and the dial. Fire has no equivalent; this is new shell machinery.
- **Ring-cell selection** (D6) — a build-time (or first-load, same-seed) pass over the charged pile to find a cell with a large avalanche, plus its expected size for the copy's *"six thousand"* claim to stay honest.
- **A three-speed charge:** paced (~12 s, on-ramp) · instant (skip / return) · fast (~1–2 s, ↺ Reset). One code path, three rates.
- **Plot gating** — the user series is empty until the first *event*; the backbone brightens on the first point landing.

## Acceptance (this design is "right")

- A visitor who has just finished exhibit 1 reaches for a dial in beat 2 **and is refused** — and the refusal is legible without reading the caption (`grains` racing, `slope` still).
- Beat 1's grain visibly does **nothing**, and the same readout later reads `1 grain → 6,140 cells` with its left side unchanged.
- The three beats reproduce exactly from the seed; the ring cell and its avalanche size are stable enough for fixed copy.
- Beat 3 is the first animated avalanche of the session, and the plot's first point lands in the same frame the field goes white.
- An off-ring drop still produces a real, small, honestly-computed avalanche.
- Keyboard and reduced-motion paths complete all three beats and deliver the same outcome readout and plot point.
- Skip, return, and Reset all leave a **charged** pile — the sandbox is never a dead flat table.
- Reads as *genuinely light* (§3.4): three beats, two verbs, ~25 s to the payoff.

## References

Locks consumed: ticket 02 (on-ramp grammar — user-acts-every-beat, caption strip, near-miss, skip + `localStorage`, withhold-until-the-crossing), ticket 04 (instrument — dial, two time bases, survival plot, readout pairing, control set), ticket 01 (look, §4.4 plot treatment). Spec: §5.1, §3.4, §9. Built shell: [`beats-config.ts`](../../../src/lib/beats-config.ts), [`beats.ts`](../../../src/scripts/beats.ts).
