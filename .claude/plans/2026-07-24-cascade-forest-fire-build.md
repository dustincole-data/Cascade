# Cascade — Forest-Fire Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship the Cascade forest-fire slice end-to-end — landing + `/forest-fire` (3-beat on-ramp → free sandbox → live signature plot) + `/synthesis` coda panel 1 — as a standalone-valid static site at `cascade.dustincoledata.com`.

**Architecture:** Astro static site, zero runtime. Pure deterministic simulation logic lives in `src/lib/` (vitest-tested, no DOM). The **stage** (the forest) renders to a canvas 2D that repaints only the moving burning front. The **signature plot** renders as **SVG** — server-rendered from a build-time-baked Monte-Carlo curve, with client scripts mutating a handful of elements for the live marker/trials. Browser wiring lives in `src/scripts/`, chrome in `src/components/`.

**Tech Stack:** Astro 5 (static) · TypeScript (strict) · Vitest · canvas 2D · SVG · `@fontsource/archivo` + `@fontsource/jetbrains-mono` · no runtime deps, no dataset, no server.

---

## Source of truth (read these before writing code)

| What | Where |
|---|---|
| **Locked spec** (register, palette, architecture, phases, deploy) | [.claude/plans/2026-07-23-cascade-design.md](2026-07-23-cascade-design.md) |
| **🔒 LOOK LOCK** — the approved visual reference; exact colors, spacing, chrome weight, plot treatment | [../../.scratch/cascade/assets/01-forest-fire-look.html](../../.scratch/cascade/assets/01-forest-fire-look.html) |
| **🔒 ON-RAMP LOCK** — the 3 beats, 12 decisions, gates, copy | [../../.scratch/cascade/issues/02-on-ramp-choreography.md](../../.scratch/cascade/issues/02-on-ramp-choreography.md) |
| **🔒 CODA LOCK** — synthesis panel 1, board-slot contract, re-feel mechanic | [../../.scratch/cascade/issues/03-synthesis-coda-first-panel.md](../../.scratch/cascade/issues/03-synthesis-coda-first-panel.md) |
| Repo/build pattern to mirror | `C:\Users\dusti\Projects\Namesake` (astro.config.mjs, vercel.json, src/lib + src/scripts split) |

**The look reference is authoritative for pixel values.** When this plan says "match the reference," open that HTML and copy the actual number — do not invent spacing, radii, opacities, or hexes.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **FREE; LOW upkeep — fully in-browser computed, NO dataset, no cron.** No server, no API, no scheduled job. (verbatim, spec §7)
- **Deterministic where possible** — seedable PRNG (mulberry32); a given `(seed, density, spark)` reproduces exactly.
- **Static, ~zero runtime; self-contained.** `output: 'static'`, Node 22 on Vercel, `base: '/'`, **default `outDir`** (do NOT nest it — that breaks `astro preview`), `site: 'https://cascade.dustincoledata.com'`.
- **Static OG image only** — no `@vercel/og`, no edge function.
- **Palette hexes exactly as spec §1.2 — do not re-tint** (they are CVD-validated: alive-teal ↔ event-orange worst adjacent ΔE 8.8 protan ≥ 8.0).
- **Type:** Archivo (sans) + JetBrains Mono (readouts/axis/labels), **small and restrained — biggest heading ≈28–32px, NEVER a billboard.** Hard bans: **no serif anywhere; no giant display type; never Fraunces / Inter / Space Grotesk / Hanken / IBM Plex as the sans.** Fonts self-hosted via `@fontsource` (no CDN link tags).
- **d_c = 0.5927** everywhere (displayed as `0.59`).
- **60fps rule:** the rAF loop repaints **only the moving burning front** (~O(perimeter)); a whole-grid repaint happens **once** on density change / reset, never per frame. Cache additive glow as offscreen halo sprites (`drawImage` + `globalCompositeOperation:'lighter'`). `devicePixelRatio`-aware. Pause rAF when the tab is hidden.
- **`prefers-reduced-motion` honored:** sims start paused; the burn renders as a before/after state swap; no information conveyed by motion alone.
- **Meaning never rides on color alone** — luminance (dim forest · bright fire · near-black scar), position, and numeric readouts also carry state.
- **Apolitical.** Nothing social or political anywhere in copy.
- **Chrome never competes with the stage.** Beat captions sit *above* the instrument frame, never overlaid on the stage.
- **Commits:** commit at the end of every task. Message ends with:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```

### Deviations from the spec (deliberate, flag to Dustin)

1. **The signature plot is SVG, not canvas** (spec §4.4 / the reference prototype used canvas). Reason: ticket 03 dec. 11 requires the coda panel to render **completely with no JS**, which canvas cannot do. SVG gives one renderer for all four plot configs, server-rendered markup for free, crisper mono text, and the plot only updates on discrete events (trial drop, marker drag) — never per frame — so there is no perf argument for canvas. **The stage stays canvas 2D** (it does need per-frame painting). Locked treatment (faint scatter + smoothed spectral-gradient mean curve + faint gridlines + off-line annotation with leader + hot-core knee dot + live marker) is reproduced exactly.
2. **No GSAP.** Spec §1.4 permits GSAP for chrome entrances; nothing in this slice needs it. CSS transitions cover the beat caption swaps and the coda flood. Avoids the whole `gsap-scrub-from-conflict` failure class. (If Dustin wants richer landing motion later, add it then.)
3. **Landing shows one live door + one muted promise line**, not three doors (spec §2 assumed all three exhibits). This mirrors ticket 03's locked "clean degrade, no ghost cards" rule so the site reads *finished*, not WIP. The 3-up layout slots in when exhibits 2 & 3 land.

---

## File Structure

```
Cascade/                                  ← repo root (git init here; already holds .claude/ + .scratch/)
├── astro.config.mjs                      static, site, base:'/'
├── package.json                          scripts: dev/build/preview/test/bake
├── tsconfig.json                         astro/tsconfigs/strict
├── vitest.config.ts                      node env, **/*.test.ts
├── vercel.json                           build cmd, cleanUrls, dist
├── .gitignore                            node_modules, dist, .astro, .vercel
├── README.md                             what it is, how to run, how to deploy
├── PROGRESS.md                           the §9 build log / tracker
├── scripts/
│   └── bake-curve.ts                     node: Monte-Carlo → src/data/percolation-curve.json
├── public/
│   ├── favicon.svg
│   └── og.png                            static 1200×630, screenshotted from the built exhibit
└── src/
    ├── data/percolation-curve.json       BAKED (committed; regenerable via `npm run bake`)
    ├── styles/
    │   ├── tokens.css                    §1.2 palette + type + radii + fonts
    │   └── global.css                    reset, page shell, instrument chrome, controls
    ├── layouts/BaseLayout.astro          html head, fonts, meta/OG, footer
    ├── lib/                               ── PURE. No DOM. Vitest-tested. ──
    │   ├── types.ts                      Exhibit interface, Params, Stats, DataPoint
    │   ├── prng.ts                       mulberry32
    │   ├── palette.ts                    token hexes, FIRE/TEAL ramps, lerpStops
    │   ├── forest-fire.ts                field build (monotonic fill), spark, BFS burn, buckets
    │   ├── percolation.ts                Monte-Carlo curve generator (used by bake script + tests)
    │   └── plot-geometry.ts              scales, knee index, curve lookup, annotation anchor
    ├── components/
    │   ├── Instrument.astro              framed chrome: head + stage panel + plot panel + control bar
    │   ├── ControlBar.astro              density / spark / play / speed / reset / shuffle / readouts
    │   ├── CaptionStrip.astro            on-ramp beat strip (above the frame)
    │   ├── SignaturePlot.astro           SSR SVG plot — one component, config-driven
    │   └── CodaPanel.astro               board-slot: concept word + hero plot + 3 copy lines
    ├── scripts/                           ── BROWSER. DOM + canvas. ──
    │   ├── stage.ts                      canvas renderer (bg cache, front repaint, halo sprites)
    │   ├── plot.ts                       attachPlot(): marker, trials, curve reveal
    │   ├── exhibit.ts                    wires model + stage + plot + controls (sandbox)
    │   ├── beats.ts                      the 3-beat on-ramp runner + localStorage
    │   └── coda.ts                       coda marker drag/arrow + y-leap + warm flood
    └── pages/
        ├── index.astro                   landing
        ├── forest-fire.astro             the exhibit
        └── synthesis.astro               the coda
```

---

### Task 1: Repo scaffold, deploy config, and the locked visual shell

Stands up a building, deployable Astro site whose *empty page already looks like Cascade* (dark stage register, correct fonts, palette tokens). Nothing simulates yet.

**Files:**
- Create: `Cascade/package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `vercel.json`, `.gitignore`, `README.md`, `PROGRESS.md`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro` (temporary placeholder — Task 8 writes the real landing)
- Create: `public/favicon.svg`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties consumed by every later task — `--stage #0a0c10`, `--stage-2 #0c0f15`, `--chrome #12151c`, `--chrome-line #1c212b`, `--ink #c9d1d9`, `--ink-muted #8b949e`, `--ink-faint #5a6472`, `--focus #4cc9f0`, `--scar #2a2118`, `--teal-deep #1f7a5c`, `--teal-bright #2fb488`, `--amber #ffd166`, `--orange #ff8a3d`, `--coral #ff5a5f`, `--magenta #e0479e`, `--hotcore #fff1c2`, `--sans`, `--mono`, `--r 10px`. Plus `BaseLayout.astro` with props `{ title: string; description: string }`.

- [ ] **Step 1: Initialize the repo and install dependencies**

```bash
cd "C:/Users/dusti/Projects/Cascade"
git init -b main
npm init -y
npm install astro@^5
npm install -D vitest@^3 @types/node@^26 @fontsource/archivo @fontsource/jetbrains-mono
```

- [ ] **Step 2: Write the config files**

`package.json` (replace the generated one):

```json
{
  "name": "cascade",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "bake": "node --experimental-strip-types scripts/bake-curve.ts"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@fontsource/archivo": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0",
    "@types/node": "^26.1.1",
    "vitest": "^3.0.0"
  }
}
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cascade.dustincoledata.com',
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['**/*.test.ts'], environment: 'node', passWithNoTests: true } });
```

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false
}
```

`.gitignore`:

```
node_modules
dist
.astro
.vercel
.DS_Store
*.stackdump
```

- [ ] **Step 3: Write the design tokens**

`src/styles/tokens.css` — the palette is **copied verbatim** from spec §1.2 / the look reference `:root` block. Do not re-tint.

```css
/* Self-hosted fonts — no CDN. Weights match the look reference. */
@import '@fontsource/archivo/400.css';
@import '@fontsource/archivo/500.css';
@import '@fontsource/archivo/600.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';
@import '@fontsource/jetbrains-mono/600.css';

:root {
  /* ── Stage & chrome (spec §1.2 — LOCKED, do not re-tint) ── */
  --stage: #0a0c10;
  --stage-2: #0c0f15;
  --chrome: #12151c;
  --chrome-line: #1c212b;
  --ink: #c9d1d9;
  --ink-muted: #8b949e;
  --ink-faint: #5a6472;
  --focus: #4cc9f0;

  /* ── Encoding poles ── */
  --scar: #2a2118;
  --teal-deep: #1f7a5c;
  --teal-bright: #2fb488;
  --amber: #ffd166;
  --orange: #ff8a3d;
  --coral: #ff5a5f;
  --magenta: #e0479e;
  --hotcore: #fff1c2;

  /* ── Type — small and restrained. Biggest heading 28–32px. NEVER a billboard. ── */
  --sans: 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  --r: 10px;
  --maxw: 1180px;
}
```

- [ ] **Step 4: Write the global stylesheet**

`src/styles/global.css` — port the reference's chrome verbatim: `body` background (the `radial-gradient(120% 80% at 50% -10%, #0d1119 0%, var(--stage) 60%) fixed` + `var(--stage)` stack), `.instrument` frame (`background: var(--chrome); border: 1px solid var(--chrome-line); border-radius: var(--r); overflow: hidden`), `.inst-head`, `.divider`, `.panels` grid (`1.62fr 1fr`, collapsing to `1fr` at `max-width: 860px`), `.panel-tag`, `.controls`, `.ctl`, range-input styling incl. the `:focus-visible` cyan ring, `button.ctl-btn` (+ the `.spark` warm variant), `.readout`. Open [the look reference](../../.scratch/cascade/assets/01-forest-fire-look.html) lines 43–202 and copy the rules; drop the `.study-*`, `.foot`, `.specimen*`, and `.instrument.b` (Direction-B) rules — those are look-study scaffolding, not product.

Add at the end:

```css
/* Reduced motion: no chrome transitions, no auto-play anywhere. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}

/* Skip link + visible focus everywhere (a11y plumbing, spec §3.2). */
:where(a, button, input, [tabindex]):focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.skip-link {
  position: absolute; left: -9999px; top: 0;
  font-family: var(--mono); font-size: 12px;
  background: var(--chrome); color: var(--ink);
  padding: 10px 14px; border: 1px solid var(--chrome-line); border-radius: var(--r);
}
.skip-link:focus { left: 12px; top: 12px; z-index: 50; }
```

- [ ] **Step 5: Write the base layout**

`src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/tokens.css';
import '../styles/global.css';

interface Props { title: string; description: string }
const { title, description } = Astro.props;
const og = new URL('/og.png', Astro.site).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site).href} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={og} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0a0c10" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <main id="main"><slot /></main>
    <footer class="site-foot">
      <span class="mono">Cascade</span>
      <a href="https://dustincoledata.com">dustincoledata.com</a>
    </footer>
  </body>
</html>
```

Style `.site-foot` in `global.css`: `max-width: var(--maxw); margin: 60px auto 40px; display:flex; gap:14px; justify-content:space-between; font-family: var(--mono); font-size: 11px; color: var(--ink-faint);` with the link in `--ink-muted`, no underline until hover.

- [ ] **Step 6: Write the favicon and a placeholder landing**

`public/favicon.svg` — a knee curve on the dark stage (the site's one mark):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0a0c10"/>
  <path d="M4 26 C 12 26, 15 25, 17 14 C 19 6, 24 6, 28 6"
        fill="none" stroke="#ff8a3d" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="17" cy="14" r="2.6" fill="#fff1c2"/>
</svg>
```

`src/pages/index.astro` (placeholder, replaced in Task 8):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Cascade" description="One small thing, enormous consequences.">
  <section class="page">
    <p class="kicker">Cascade</p>
    <h1>One small thing, enormous consequences.</h1>
    <p class="lede">Scaffold live. The forest fire lands in Task 8.</p>
  </section>
</BaseLayout>
```

Add to `global.css`: `.page { max-width: var(--maxw); margin: 0 auto; padding: 34px clamp(16px,4vw,52px) 40px; }`, `.kicker { font-family: var(--mono); font-size: 11px; letter-spacing:.16em; text-transform:uppercase; color: var(--ink-faint); margin:0 0 8px; }`, `h1 { font-weight:600; font-size: clamp(22px, 2.6vw, 30px); letter-spacing:-0.02em; margin:0 0 10px; color: var(--ink); text-wrap: balance; }`, `.lede { color: var(--ink-muted); font-size: 14px; line-height:1.55; max-width: 68ch; margin:0; }`.

- [ ] **Step 7: Verify the build and the look live**

```bash
npm run build
```
Expected: `dist/` produced, no errors.

```bash
npm run dev
```
Then open the dev URL in the browser and take a screenshot (chrome-devtools MCP: `navigate_page` → `take_screenshot`). **Confirm visually:** near-black page with the subtle top vignette; heading in Archivo at ~30px (not a billboard); mono kicker; no serif anywhere; no CDN font requests in the network panel.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: scaffold Cascade — Astro static shell, locked palette + type tokens

Node 22 / static output / default outDir per spec §7. Palette hexes copied
verbatim from the CVD-validated §1.2 set. Self-hosted Archivo + JetBrains Mono.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Deterministic percolation core (pure lib, TDD)

The forest-fire model with **monotonic fill** — the engine constraint ticket 02 requires so "one more tree, same spark" is literally true.

**Files:**
- Create: `src/lib/prng.ts`, `src/lib/prng.test.ts`
- Create: `src/lib/forest-fire.ts`, `src/lib/forest-fire.test.ts`
- Create: `src/lib/types.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (used by Tasks 3, 5, 6, 7):
  - `mulberry32(seed: number): () => number`
  - `interface Field { W: number; H: number; r: Float64Array; shade: Float32Array; seed: number }`
  - `buildField(W: number, H: number, seed: number): Field`
  - `isTree(f: Field, i: number, d: number): boolean`
  - `countTrees(f: Field, d: number): number`
  - `nearestTree(f: Field, d: number, x: number, y: number): number`
  - `interface Burn { ig: Int32Array; maxTick: number; burned: number; trees: number; frac: number; spark: number; buckets: number[][] }`
  - `burn(f: Field, d: number, spark: number): Burn`
  - `largestClusterSpark(f: Field, d: number): number`
  - `D_C = 0.5927`

- [ ] **Step 1: Write the failing PRNG test**

`src/lib/prng.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mulberry32 } from './prng';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(0x0ca5cade);
    const b = mulberry32(0x0ca5cade);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toEqual(b);
  });

  it('stays in [0, 1) and is roughly uniform', () => {
    const rnd = mulberry32(42);
    let sum = 0;
    for (let i = 0; i < 10_000; i++) {
      const v = rnd();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 10_000).toBeCloseTo(0.5, 1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/prng.test.ts`
Expected: FAIL — `Failed to resolve import "./prng"`.

- [ ] **Step 3: Implement the PRNG**

`src/lib/prng.ts`:

```ts
/** mulberry32 — small, fast, seedable. Same seed ⇒ same stream, forever. */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `npx vitest run src/lib/prng.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing forest-fire tests**

`src/lib/forest-fire.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildField, isTree, countTrees, nearestTree, burn, largestClusterSpark, D_C } from './forest-fire';

const F = buildField(64, 64, 0x0ca5cade);

describe('monotonic fill (ticket 02, decision 3)', () => {
  it('raising density only ever ADDS trees — never moves one', () => {
    const at = (d: number) => {
      const s = new Set<number>();
      for (let i = 0; i < F.W * F.H; i++) if (isTree(F, i, d)) s.add(i);
      return s;
    };
    const low = at(0.4);
    const high = at(0.52);
    for (const i of low) expect(high.has(i)).toBe(true);
    expect(high.size).toBeGreaterThan(low.size);
  });

  it('countTrees is monotonically non-decreasing in d', () => {
    let prev = -1;
    for (let d = 0; d <= 1.0001; d += 0.05) {
      const n = countTrees(F, d);
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
  });

  it('countTrees(1) is every cell and countTrees(0) is none', () => {
    expect(countTrees(F, 1)).toBe(F.W * F.H);
    expect(countTrees(F, 0)).toBe(0);
  });
});

describe('burn', () => {
  it('is deterministic for a given (field, density, spark)', () => {
    const spark = largestClusterSpark(F, 0.62);
    const a = burn(F, 0.62, spark);
    const b = burn(F, 0.62, spark);
    expect(a.burned).toBe(b.burned);
    expect(Array.from(a.ig)).toEqual(Array.from(b.ig));
  });

  it('only ever burns trees, and every burned cell is reachable from the spark', () => {
    const spark = largestClusterSpark(F, 0.62);
    const r = burn(F, 0.62, spark);
    for (let i = 0; i < F.W * F.H; i++) {
      if (r.ig[i] >= 0) expect(isTree(F, i, 0.62)).toBe(true);
    }
    expect(r.ig[spark]).toBe(0);
    expect(r.burned).toBeGreaterThan(0);
  });

  it('spreads only to 4-neighbours (von Neumann), so ignition ticks differ by at most 1 across an edge', () => {
    const spark = largestClusterSpark(F, 0.62);
    const { ig } = burn(F, 0.62, spark);
    for (let y = 0; y < F.H; y++)
      for (let x = 0; x < F.W; x++) {
        const i = y * F.W + x;
        if (ig[i] < 0) continue;
        for (const j of [x > 0 ? i - 1 : -1, x < F.W - 1 ? i + 1 : -1, y > 0 ? i - F.W : -1, y < F.H - 1 ? i + F.W : -1]) {
          if (j >= 0 && ig[j] >= 0) expect(Math.abs(ig[i] - ig[j])).toBeLessThanOrEqual(1);
        }
      }
  });

  it('fizzles well below d_c and sweeps well above it — the phase transition', () => {
    const lo = burn(F, 0.45, largestClusterSpark(F, 0.45));
    const hi = burn(F, 0.7, largestClusterSpark(F, 0.7));
    expect(lo.frac).toBeLessThan(0.25);
    expect(hi.frac).toBeGreaterThan(0.75);
    expect(D_C).toBe(0.5927);
  });

  it('buckets group cells by ignition tick and cover every burned cell exactly once', () => {
    const r = burn(F, 0.62, largestClusterSpark(F, 0.62));
    const total = r.buckets.reduce((n, b) => n + b.length, 0);
    expect(total).toBe(r.burned);
    expect(r.buckets.length).toBe(r.maxTick + 1);
    r.buckets.forEach((bucket, t) => bucket.forEach((i) => expect(r.ig[i]).toBe(t)));
  });

  it('returns an empty burn when the spark index is not a tree', () => {
    let empty = -1;
    for (let i = 0; i < F.W * F.H; i++) if (!isTree(F, i, 0.4)) { empty = i; break; }
    const r = burn(F, 0.4, empty);
    expect(r.burned).toBe(0);
    expect(r.frac).toBe(0);
    expect(r.spark).toBe(-1);
  });
});

describe('nearestTree', () => {
  it('returns the tapped cell when it is already a tree', () => {
    let t = -1;
    for (let i = 0; i < F.W * F.H; i++) if (isTree(F, i, 0.4)) { t = i; break; }
    expect(nearestTree(F, 0.4, t % F.W, Math.floor(t / F.W))).toBe(t);
  });

  it('snaps an empty tap to a nearby tree (ticket 02, decision 4)', () => {
    let e = -1;
    for (let i = 0; i < F.W * F.H; i++) if (!isTree(F, i, 0.4)) { e = i; break; }
    const snapped = nearestTree(F, 0.4, e % F.W, Math.floor(e / F.W));
    expect(snapped).toBeGreaterThanOrEqual(0);
    expect(isTree(F, snapped, 0.4)).toBe(true);
  });

  it('returns -1 on an empty forest', () => {
    expect(nearestTree(F, 0, 10, 10)).toBe(-1);
  });
});
```

- [ ] **Step 6: Run to confirm it fails**

Run: `npx vitest run src/lib/forest-fire.test.ts`
Expected: FAIL — `Failed to resolve import "./forest-fire"`.

- [ ] **Step 7: Implement the model**

`src/lib/forest-fire.ts`:

```ts
import { mulberry32 } from './prng';

/** Site-percolation threshold, 2D square lattice. Displayed as 0.59. */
export const D_C = 0.5927;

/**
 * A fixed random field. Monotonic fill (ticket 02, dec. 3): every cell holds a
 * frozen threshold r_i; the cell is a tree iff r_i < d. Raising d therefore only
 * ever ADDS trees — never relocates one — so "one more tree, same spark" is
 * literally true on screen. `shade` is a stable per-cell hash used only for the
 * latent forest's colour variation (never for state).
 */
export interface Field {
  W: number;
  H: number;
  r: Float64Array;
  shade: Float32Array;
  seed: number;
}

export function buildField(W: number, H: number, seed: number): Field {
  const rnd = mulberry32(seed);
  const N = W * H;
  const r = new Float64Array(N);
  const shade = new Float32Array(N);
  for (let i = 0; i < N; i++) r[i] = rnd();
  for (let i = 0; i < N; i++) {
    const x = Math.imul(i ^ seed, 2654435761) >>> 0;
    shade[i] = ((x >>> 8) & 255) / 255;
  }
  return { W, H, r, shade, seed };
}

export const isTree = (f: Field, i: number, d: number): boolean => f.r[i]! < d;

export function countTrees(f: Field, d: number): number {
  let n = 0;
  for (let i = 0; i < f.W * f.H; i++) if (f.r[i]! < d) n++;
  return n;
}

/** Snap a tap to the nearest tree by expanding rings. -1 if the forest is empty. */
export function nearestTree(f: Field, d: number, x: number, y: number): number {
  const { W, H } = f;
  if (x >= 0 && x < W && y >= 0 && y < H && isTree(f, y * W + x, d)) return y * W + x;
  const maxR = Math.max(W, H);
  for (let r = 1; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const i = ny * W + nx;
        if (isTree(f, i, d)) return i;
      }
    }
  }
  return -1;
}

export interface Burn {
  /** Ignition tick per cell; -1 = never burned. */
  ig: Int32Array;
  maxTick: number;
  burned: number;
  trees: number;
  frac: number;
  spark: number;
  /** buckets[t] = cell indices igniting at tick t. Drives the O(front) repaint. */
  buckets: number[][];
}

/** BFS flood-fill from `spark` over 4-neighbours (von Neumann), recording tick. */
export function burn(f: Field, d: number, spark: number): Burn {
  const { W, H } = f;
  const N = W * H;
  const ig = new Int32Array(N).fill(-1);
  const trees = countTrees(f, d);

  if (spark < 0 || spark >= N || !isTree(f, spark, d)) {
    return { ig, maxTick: 0, burned: 0, trees, frac: 0, spark: -1, buckets: [] };
  }

  const buckets: number[][] = [[spark]];
  ig[spark] = 0;
  let burned = 1;
  let frontier = [spark];
  let tick = 0;

  while (frontier.length) {
    const next: number[] = [];
    for (const idx of frontier) {
      const x = idx % W;
      const y = (idx / W) | 0;
      if (x > 0 && ig[idx - 1] < 0 && isTree(f, idx - 1, d)) { ig[idx - 1] = tick + 1; next.push(idx - 1); }
      if (x < W - 1 && ig[idx + 1] < 0 && isTree(f, idx + 1, d)) { ig[idx + 1] = tick + 1; next.push(idx + 1); }
      if (y > 0 && ig[idx - W] < 0 && isTree(f, idx - W, d)) { ig[idx - W] = tick + 1; next.push(idx - W); }
      if (y < H - 1 && ig[idx + W] < 0 && isTree(f, idx + W, d)) { ig[idx + W] = tick + 1; next.push(idx + W); }
    }
    if (next.length) { buckets.push(next); burned += next.length; }
    frontier = next;
    tick++;
  }

  return { ig, maxTick: buckets.length - 1, burned, trees, frac: trees ? burned / trees : 0, spark, buckets };
}

/**
 * The leftmost cell of the largest connected cluster — used for scripted/random
 * sparks. Below d_c the largest cluster is small (honest fizzle); above it a
 * spanning cluster exists (dramatic sweep), so the slider is a real transition.
 */
export function largestClusterSpark(f: Field, d: number): number {
  const { W, H } = f;
  const N = W * H;
  const seen = new Uint8Array(N);
  const stack: number[] = [];
  let bestSize = 0;
  let spark = -1;

  for (let i = 0; i < N; i++) {
    if (!isTree(f, i, d) || seen[i]) continue;
    let size = 0, leftX = Infinity, leftIdx = -1;
    stack.length = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const idx = stack.pop()!;
      size++;
      const x = idx % W, y = (idx / W) | 0;
      if (x < leftX) { leftX = x; leftIdx = idx; }
      if (x > 0 && !seen[idx - 1] && isTree(f, idx - 1, d)) { seen[idx - 1] = 1; stack.push(idx - 1); }
      if (x < W - 1 && !seen[idx + 1] && isTree(f, idx + 1, d)) { seen[idx + 1] = 1; stack.push(idx + 1); }
      if (y > 0 && !seen[idx - W] && isTree(f, idx - W, d)) { seen[idx - W] = 1; stack.push(idx - W); }
      if (y < H - 1 && !seen[idx + W] && isTree(f, idx + W, d)) { seen[idx + W] = 1; stack.push(idx + W); }
    }
    if (size > bestSize) { bestSize = size; spark = leftIdx; }
  }
  return spark;
}
```

- [ ] **Step 8: Write the shared types**

`src/lib/types.ts` — the spec §3.1 engine contract. Forest fire implements it; exhibits 2 & 3 will too.

```ts
export type ExhibitId = 'forest-fire' | 'sandpile' | 'network';

export interface Params {
  /** The single primary parameter (fire: density d). */
  value: number;
  seed: number;
}

export interface Stats {
  density: number;
  trees: number;
  burned: number;
  /** Fraction of trees swept, 0–1. */
  frac: number;
  tick: number;
  maxTick: number;
}

/** One completed trial — the datum the signature plot consumes. */
export interface DataPoint {
  x: number;
  y: number;
}

export interface StepResult {
  /** Cell indices that changed to "burning" this tick. */
  ignited: number[];
  /** Cell indices that aged out of the front into scar this tick. */
  spent: number[];
  done: boolean;
}
```

- [ ] **Step 9: Run the whole suite**

Run: `npm test`
Expected: PASS — 3 prng tests + 10 forest-fire tests, 0 failures.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(lib): deterministic percolation core with monotonic fill

mulberry32 + a frozen r_i field so raising density only ADDS trees (ticket 02
dec. 3 — "same spark, one more tree" must be literally true). BFS von-Neumann
burn with per-tick buckets, which is what makes the O(front) repaint possible.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Monte-Carlo canonical curve + bake script

The plot's backbone: the real order-parameter sigmoid with its knee at p_c. Generated once at build time, committed as JSON, so the coda needs no live sim.

**Files:**
- Create: `src/lib/percolation.ts`, `src/lib/percolation.test.ts`
- Create: `scripts/bake-curve.ts`
- Create (generated): `src/data/percolation-curve.json`

**Interfaces:**
- Consumes: `buildField`, `burn`, `nearestTree`, `D_C` from `src/lib/forest-fire.ts`; `mulberry32` from `src/lib/prng.ts`.
- Produces:
  - `interface Curve { densities: number[]; mean: number[]; meanS: number[]; scatter: [number, number][] }`
  - `monteCarlo(opts?: { grid?: number; steps?: number; trials?: number; dMin?: number; dMax?: number; seedBase?: number }): Curve`
  - `src/data/percolation-curve.json` importable as `Curve` (Tasks 4, 6, 9).

Defaults reproduce the look reference exactly: `grid: 64, steps: 46, trials: 16, dMin: 0.30, dMax: 0.86, seedBase: 1234567`.

- [ ] **Step 1: Write the failing test**

`src/lib/percolation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { monteCarlo } from './percolation';
import { D_C } from './forest-fire';

const c = monteCarlo({ grid: 48, steps: 24, trials: 8 });

describe('monteCarlo', () => {
  it('is deterministic', () => {
    const again = monteCarlo({ grid: 48, steps: 24, trials: 8 });
    expect(again.mean).toEqual(c.mean);
  });

  it('spans the requested density domain', () => {
    expect(c.densities.length).toBe(24);
    expect(c.densities[0]).toBeCloseTo(0.3, 5);
    expect(c.densities.at(-1)).toBeCloseTo(0.86, 5);
    expect(c.mean.length).toBe(24);
    expect(c.meanS.length).toBe(24);
  });

  it('produces one scatter point per trial', () => {
    expect(c.scatter.length).toBe(24 * 8);
    for (const [d, f] of c.scatter) {
      expect(d).toBeGreaterThanOrEqual(0.3);
      expect(d).toBeLessThanOrEqual(0.86);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });

  it('is a sigmoid: low on the left, high on the right', () => {
    expect(c.mean[0]!).toBeLessThan(0.1);
    expect(c.mean.at(-1)!).toBeGreaterThan(0.9);
  });

  it('has its steepest rise at the percolation threshold', () => {
    let steepest = 0, at = 0;
    for (let i = 1; i < c.mean.length; i++) {
      const slope = (c.mean[i]! - c.mean[i - 1]!) / (c.densities[i]! - c.densities[i - 1]!);
      if (slope > steepest) { steepest = slope; at = (c.densities[i]! + c.densities[i - 1]!) / 2; }
    }
    expect(at).toBeGreaterThan(D_C - 0.06);
    expect(at).toBeLessThan(D_C + 0.06);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npx vitest run src/lib/percolation.test.ts`
Expected: FAIL — `Failed to resolve import "./percolation"`.

- [ ] **Step 3: Implement the generator**

`src/lib/percolation.ts`:

```ts
import { buildField, burn, nearestTree } from './forest-fire';

export interface Curve {
  densities: number[];
  /** Raw trial mean per density. */
  mean: number[];
  /** 3-point smoothed mean — the display curve. Raw scatter keeps the honesty. */
  meanS: number[];
  scatter: [number, number][];
}

export interface MonteCarloOpts {
  grid?: number;
  steps?: number;
  trials?: number;
  dMin?: number;
  dMax?: number;
  seedBase?: number;
}

/**
 * The real thing: for each density, spark the tree nearest the centre of a fresh
 * seeded field and record burned/total. The mean traces the order-parameter
 * sigmoid whose knee sits at the site-percolation threshold p_c ≈ 0.5927.
 * Defaults reproduce the locked look reference's curve exactly.
 */
export function monteCarlo(opts: MonteCarloOpts = {}): Curve {
  const { grid = 64, steps = 46, trials = 16, dMin = 0.3, dMax = 0.86, seedBase = 1234567 } = opts;
  const densities: number[] = [];
  const mean: number[] = [];
  const scatter: [number, number][] = [];

  for (let s = 0; s < steps; s++) {
    const d = dMin + (dMax - dMin) * (s / (steps - 1));
    densities.push(d);
    let acc = 0;
    for (let t = 0; t < trials; t++) {
      const field = buildField(grid, grid, seedBase + s * 131 + t * 977);
      const spark = nearestTree(field, d, grid >> 1, grid >> 1);
      const frac = spark < 0 ? 0 : burn(field, d, spark).frac;
      acc += frac;
      scatter.push([d, frac]);
    }
    mean.push(acc / trials);
  }

  const meanS = mean.map((v, i) => {
    const a = mean[i - 1] ?? v;
    const b = mean[i + 1] ?? v;
    return (a + v * 2 + b) / 4;
  });

  return { densities, mean, meanS, scatter };
}
```

- [ ] **Step 4: Run to confirm it passes**

Run: `npx vitest run src/lib/percolation.test.ts`
Expected: PASS, 5 tests. If the "steepest rise" test fails, do **not** widen the tolerance — a knee away from 0.5927 means the model is wrong; go back to Task 2.

- [ ] **Step 5: Write the bake script**

`scripts/bake-curve.ts`:

```ts
/**
 * Bakes the canonical Monte-Carlo curve to static JSON so the coda (and the
 * exhibit's backbone curve) need no live simulation. Deterministic — re-running
 * this produces a byte-identical file. Run: npm run bake
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { monteCarlo } from '../src/lib/percolation.ts';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/percolation-curve.json');
const curve = monteCarlo();

const round = (n: number, p = 5) => Number(n.toFixed(p));
const payload = {
  densities: curve.densities.map((d) => round(d)),
  mean: curve.mean.map((v) => round(v)),
  meanS: curve.meanS.map((v) => round(v)),
  scatter: curve.scatter.map(([d, f]) => [round(d), round(f)]),
  meta: {
    method: 'Monte-Carlo site percolation, 64² lattice, 16 trials × 46 densities, von-Neumann spread',
    source: 'site-percolation threshold · square lattice ≈ 0.5927',
    grid: 64,
    trials: 16,
  },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload) + '\n');
console.log(`baked ${payload.densities.length} densities · ${payload.scatter.length} trials → ${out}`);
```

- [ ] **Step 6: Bake and eyeball the output**

```bash
npm run bake
```
Expected: `baked 46 densities · 736 trials → …/src/data/percolation-curve.json`

```bash
node -e "const c=require('./src/data/percolation-curve.json');console.log(c.mean[0],c.mean[22],c.mean[45])"
```
Expected: first value near 0 (≈0.00–0.02), last near 1 (≈0.97–1.00), middle in between — the sigmoid.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(lib): Monte-Carlo percolation curve + build-time bake

Real data underneath the signature plot: 16 trials x 46 densities on a 64^2
lattice. Baked to JSON so the coda renders with no live sim and no JS.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Signature plot — geometry (pure) + SSR SVG component + client attach

The one plot renderer, config-driven, used by the exhibit (live) and the coda (hero). Locked treatment per spec §4.4 + ticket 01.

**Files:**
- Create: `src/lib/plot-geometry.ts`, `src/lib/plot-geometry.test.ts`
- Create: `src/components/SignaturePlot.astro`
- Create: `src/scripts/plot.ts`
- Modify: `src/styles/global.css` (plot styles)
- Modify: `src/pages/index.astro` (temporarily mount the plot to verify it live; Task 8 replaces this)

**Interfaces:**
- Consumes: `Curve` JSON from Task 3; `D_C` from Task 2.
- Produces:
  - `interface PlotBox { w: number; h: number; m: { l: number; r: number; t: number; b: number } }`
  - `makeScale(box: PlotBox, dMin: number, dMax: number): { x(d: number): number; y(f: number): number; invX(px: number): number }`
  - `nearestIndex(densities: number[], d: number): number`
  - `valueAt(densities: number[], values: number[], d: number): number`
  - `SignaturePlot.astro` props: `{ mode: 'exhibit' | 'coda'; width: number; height: number; showCurve?: boolean; showScatter?: boolean; markerD?: number; annotation: { title: string; sub?: string[] }; id: string }`
  - `attachPlot(root: SVGSVGElement): PlotHandle` where
    ```ts
    interface PlotHandle {
      setMarker(d: number): void;          // moves line + dot, flips cyan↔amber at D_C
      addTrial(d: number, frac: number): void;
      clearTrials(): void;
      revealCurve(): void;                 // un-hides mean curve + knee + annotation
      setYReadout(on: boolean): void;      // coda: show the leaping fraction readout
      setCatastrophe(on: boolean): void;   // coda: flood the >d_c regime warm
      setYourRun(d: number | null): void;  // coda: the ★ memory tick; null hides it
      yAt(d: number): number;              // curve value, for readouts
      dFromClientX(clientX: number): number; // pointer x → density, clamped
    }
    ```

- [ ] **Step 1: Write the failing geometry test**

`src/lib/plot-geometry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { makeScale, nearestIndex, valueAt, type PlotBox } from './plot-geometry';

const box: PlotBox = { w: 400, h: 300, m: { l: 44, r: 20, t: 26, b: 38 } };
const s = makeScale(box, 0.3, 0.86);

describe('makeScale', () => {
  it('maps the density domain onto the plot width', () => {
    expect(s.x(0.3)).toBeCloseTo(44, 5);
    expect(s.x(0.86)).toBeCloseTo(380, 5);
    expect(s.x(0.58)).toBeCloseTo(212, 5);
  });

  it('maps fraction 0 to the bottom and 1 to the top (y is inverted)', () => {
    expect(s.y(1)).toBeCloseTo(26, 5);
    expect(s.y(0)).toBeCloseTo(262, 5);
  });

  it('invX round-trips x', () => {
    for (const d of [0.31, 0.45, 0.5927, 0.8]) expect(s.invX(s.x(d))).toBeCloseTo(d, 6);
  });

  it('clamps invX to the domain', () => {
    expect(s.invX(-500)).toBeCloseTo(0.3, 6);
    expect(s.invX(5000)).toBeCloseTo(0.86, 6);
  });
});

describe('lookups', () => {
  const densities = [0.3, 0.4, 0.5, 0.6, 0.7];
  const values = [0.01, 0.03, 0.09, 0.62, 0.93];

  it('nearestIndex picks the closest density', () => {
    expect(nearestIndex(densities, 0.29)).toBe(0);
    expect(nearestIndex(densities, 0.58)).toBe(3);
    expect(nearestIndex(densities, 0.99)).toBe(4);
  });

  it('valueAt reads the curve at the nearest density', () => {
    expect(valueAt(densities, values, 0.61)).toBe(0.62);
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npx vitest run src/lib/plot-geometry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the geometry**

`src/lib/plot-geometry.ts`:

```ts
export interface PlotBox {
  w: number;
  h: number;
  m: { l: number; r: number; t: number; b: number };
}

export interface Scale {
  x(d: number): number;
  y(f: number): number;
  invX(px: number): number;
}

export function makeScale(box: PlotBox, dMin: number, dMax: number): Scale {
  const pw = box.w - box.m.l - box.m.r;
  const ph = box.h - box.m.t - box.m.b;
  return {
    x: (d) => box.m.l + ((d - dMin) / (dMax - dMin)) * pw,
    y: (f) => box.m.t + (1 - f) * ph,
    invX: (px) => {
      const t = (px - box.m.l) / pw;
      return Math.min(dMax, Math.max(dMin, dMin + t * (dMax - dMin)));
    },
  };
}

export function nearestIndex(densities: number[], d: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < densities.length; i++) {
    const dist = Math.abs(densities[i]! - d);
    if (dist < bestDist) { bestDist = dist; best = i; }
  }
  return best;
}

export const valueAt = (densities: number[], values: number[], d: number): number =>
  values[nearestIndex(densities, d)]!;
```

- [ ] **Step 4: Run to confirm it passes**

Run: `npx vitest run src/lib/plot-geometry.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Build the SSR SVG plot component**

`src/components/SignaturePlot.astro`. Treatment is **locked** (spec §4.4): faint real scatter cloud · smoothed mean curve stroked with a left→right spectral gradient (`#fff1c2 → #ffd166 → #ff8a3d → #ff5a5f → #e0479e`) · faint gridlines · dashed knee hairline + hot-core knee dot · **annotation OFF the curve** in whitespace with a thin leader · JetBrains Mono axis labels · source line. **No area fill, no glowing curve** — that was the rejected Direction B.

```astro
---
import curveData from '../data/percolation-curve.json';
import { makeScale, nearestIndex, type PlotBox } from '../lib/plot-geometry';
import { D_C } from '../lib/forest-fire';

interface Props {
  id: string;
  mode: 'exhibit' | 'coda';
  width: number;
  height: number;
  showCurve?: boolean;    // exhibit on-ramp withholds it until the beat-3 crossing
  showScatter?: boolean;  // coda shows the canonical cloud; exhibit builds its own
  markerD?: number;
  annotation: { title: string; sub?: string[] };
}

const { id, mode, width, height, showCurve = true, showScatter = true, markerD, annotation } = Astro.props;

const D_MIN = 0.3, D_MAX = 0.86;
const m = mode === 'coda'
  ? { l: 56, r: 28, t: 34, b: 46 }
  : { l: 44, r: 20, t: 26, b: 38 };
const box: PlotBox = { w: width, h: height, m };
const s = makeScale(box, D_MIN, D_MAX);
const pw = width - m.l - m.r;
const ph = height - m.t - m.b;

const { densities, meanS, scatter } = curveData;
const curvePath = densities.map((d, i) => `${i ? 'L' : 'M'}${s.x(d).toFixed(2)},${s.y(meanS[i]).toFixed(2)}`).join('');

const ki = nearestIndex(densities, D_C);
const kx = s.x(D_C), ky = s.y(meanS[ki]);
// Annotation lives in whitespace, never over the data: above-right of the knee.
const lx = kx + 30, ly = ky - 52;

const xTicks = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
const yTicks = [0, 0.25, 0.5, 0.75, 1];
const mk = markerD ?? D_MIN;
---
<svg
  id={id}
  class:list={['sigplot', `sigplot--${mode}`]}
  viewBox={`0 0 ${width} ${height}`}
  width={width} height={height}
  role="img"
  aria-label={`Fraction of the forest burned versus tree density. The curve is flat until density ${D_C.toFixed(2)}, then rises almost vertically to near total burn.`}
  data-dmin={D_MIN} data-dmax={D_MAX} data-dc={D_C}
  data-densities={JSON.stringify(densities)}
  data-curve={JSON.stringify(meanS)}
  data-box={JSON.stringify(box)}
>
  <defs>
    <linearGradient id={`${id}-spectral`} x1={m.l} y1="0" x2={m.l + pw} y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff1c2" />
      <stop offset="0.25" stop-color="#ffd166" />
      <stop offset="0.5" stop-color="#ff8a3d" />
      <stop offset="0.75" stop-color="#ff5a5f" />
      <stop offset="1" stop-color="#e0479e" />
    </linearGradient>
  </defs>

  <!-- catastrophe regime (coda only; hidden until the marker crosses) -->
  <rect class="sp-catastrophe" x={kx} y={m.t} width={m.l + pw - kx} height={ph} />

  <g class="sp-grid">
    {xTicks.map((d) => <line x1={s.x(d)} y1={m.t} x2={s.x(d)} y2={m.t + ph} />)}
    {yTicks.map((f) => <line x1={m.l} y1={s.y(f)} x2={m.l + pw} y2={s.y(f)} />)}
  </g>

  <g class="sp-axis">
    {xTicks.map((d) => <text x={s.x(d)} y={m.t + ph + 16} text-anchor="middle">{d.toFixed(1)}</text>)}
    {yTicks.map((f) => <text x={m.l - 8} y={s.y(f) + 3.5} text-anchor="end">{Math.round(f * 100)}%</text>)}
    <text class="sp-axis-title" x={m.l + pw / 2} y={height - 6} text-anchor="middle">density  d  →</text>
    <text class="sp-axis-title" transform={`translate(13 ${m.t + ph / 2}) rotate(-90)`} text-anchor="middle">fraction burned</text>
  </g>

  {showScatter && (
    <g class="sp-scatter">
      {scatter.map(([d, f]) => <circle cx={s.x(d)} cy={s.y(f)} r="1.7" />)}
    </g>
  )}

  <!-- trials the user actually ran (client-appended) -->
  <g class="sp-trials"></g>

  <g class="sp-signature" data-hidden={showCurve ? 'false' : 'true'}>
    <path class="sp-curve" d={curvePath} stroke={`url(#${id}-spectral)`} />
    <line class="sp-knee-hair" x1={kx} y1={m.t + ph} x2={kx} y2={ky} />
    <circle class="sp-knee-dot" cx={kx} cy={ky} r={mode === 'coda' ? 4.2 : 3.2} />
    <line class="sp-leader" x1={kx + 6} y1={ky - 6} x2={lx} y2={ly + 16} />
    <text class="sp-anno-title" x={lx} y={ly}>{annotation.title}</text>
    {(annotation.sub ?? []).map((line, i) => (
      <text class="sp-anno-sub" x={lx} y={ly + 14 + i * 13}>{line}</text>
    ))}
  </g>

  <g class="sp-marker" data-past="false">
    <line class="sp-marker-line" x1={s.x(mk)} y1={m.t} x2={s.x(mk)} y2={m.t + ph} />
    <circle class="sp-marker-dot" cx={s.x(mk)} cy={s.y(0)} r="3.4" />
    <text class="sp-readout" x={s.x(mk) + 8} y={m.t + 14}></text>
  </g>

  <!-- optional memory mark: where THIS user crossed (client-set from localStorage) -->
  <text class="sp-yourrun" x="0" y={m.t + ph + 30} data-hidden="true">★ your run</text>

  <text class="sp-source" x={m.l} y={m.t - 12}>site-percolation threshold · square lattice ≈ 0.5927</text>
</svg>
```

- [ ] **Step 6: Style the plot**

Append to `src/styles/global.css` — values ported from the look reference's `renderPlot` (gridline `#232a35` at 0.7 alpha, axis text `#6b7482` 10px mono, scatter `rgba(255,138,61,0.13)` r1.7, curve width 2, knee hairline `rgba(201,209,217,0.28)` dashed `2 3`, leader `rgba(201,209,217,0.4)`, annotation title 11.5px Archivo 600 `#e8eef4`, sub 11px mono `#8b949e`, source 9.5px mono `#4b5563`):

```css
/* ── Signature plot (spec §4.4 — LOCKED treatment) ── */
.sigplot { display: block; width: 100%; height: auto; }
.sp-grid line { stroke: #232a35; stroke-width: 1; opacity: 0.7; }
.sp-axis text { font-family: var(--mono); font-size: 10px; fill: #6b7482; }
.sp-axis .sp-axis-title { fill: var(--ink-muted); }
.sp-scatter circle, .sp-trials circle { fill: rgba(255, 138, 61, 0.13); }
.sp-trials circle { fill: rgba(255, 209, 102, 0.55); }
.sp-curve { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.sp-knee-hair { stroke: rgba(201, 209, 217, 0.28); stroke-width: 1; stroke-dasharray: 2 3; }
.sp-knee-dot { fill: var(--hotcore); }
.sp-leader { stroke: rgba(201, 209, 217, 0.4); stroke-width: 1; }
.sp-anno-title { font-family: var(--sans); font-weight: 600; font-size: 11.5px; fill: #e8eef4; }
.sp-anno-sub { font-family: var(--mono); font-size: 11px; fill: var(--ink-muted); }
.sp-source { font-family: var(--mono); font-size: 9.5px; fill: #4b5563; }

/* Signature (curve + knee + annotation) is withheld during the on-ramp. */
.sp-signature { transition: opacity 420ms ease; }
.sp-signature[data-hidden='true'] { opacity: 0; pointer-events: none; }

/* Live density marker — cyan below d_c, amber at/above. Luminance also shifts. */
.sp-marker-line { stroke: rgba(76, 201, 240, 0.55); stroke-width: 1.5; }
.sp-marker-dot { fill: var(--focus); }
.sp-marker[data-past='true'] .sp-marker-line { stroke: rgba(255, 138, 61, 0.7); }
.sp-marker[data-past='true'] .sp-marker-dot { fill: var(--amber); }
.sp-readout { font-family: var(--mono); font-size: 11px; fill: var(--ink-muted); }
.sp-marker[data-past='true'] .sp-readout { fill: var(--amber); }

/* Catastrophe regime — coda only, revealed on crossing. */
.sp-catastrophe { fill: rgba(255, 138, 61, 0.07); opacity: 0; transition: opacity 300ms ease; }
.sigplot--coda .sp-catastrophe[data-on='true'] { opacity: 1; }
.sp-yourrun { font-family: var(--mono); font-size: 10px; fill: var(--teal-bright); }
.sp-yourrun[data-hidden='true'] { display: none; }

/* Coda hero scale: bigger type, the plot is the largest bright object. */
.sigplot--coda .sp-axis text { font-size: 12px; }
.sigplot--coda .sp-curve { stroke-width: 2.6; }
.sigplot--coda .sp-anno-title { font-size: 13px; }
```

- [ ] **Step 7: Write the client attach module**

`src/scripts/plot.ts`:

```ts
import { makeScale, nearestIndex, type PlotBox } from '../lib/plot-geometry';

export interface PlotHandle {
  setMarker(d: number): void;
  addTrial(d: number, frac: number): void;
  clearTrials(): void;
  revealCurve(): void;
  setYReadout(on: boolean): void;
  setCatastrophe(on: boolean): void;
  setYourRun(d: number | null): void;
  yAt(d: number): number;
  dFromClientX(clientX: number): number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function attachPlot(root: SVGSVGElement): PlotHandle {
  const box = JSON.parse(root.dataset.box!) as PlotBox;
  const densities = JSON.parse(root.dataset.densities!) as number[];
  const curve = JSON.parse(root.dataset.curve!) as number[];
  const dMin = Number(root.dataset.dmin);
  const dMax = Number(root.dataset.dmax);
  const dc = Number(root.dataset.dc);
  const s = makeScale(box, dMin, dMax);

  const marker = root.querySelector<SVGGElement>('.sp-marker')!;
  const mLine = root.querySelector<SVGLineElement>('.sp-marker-line')!;
  const mDot = root.querySelector<SVGCircleElement>('.sp-marker-dot')!;
  const readout = root.querySelector<SVGTextElement>('.sp-readout')!;
  const trials = root.querySelector<SVGGElement>('.sp-trials')!;
  const signature = root.querySelector<SVGGElement>('.sp-signature')!;
  const catastrophe = root.querySelector<SVGRectElement>('.sp-catastrophe')!;
  const yourRun = root.querySelector<SVGTextElement>('.sp-yourrun')!;

  let showReadout = false;
  const yAt = (d: number) => curve[nearestIndex(densities, d)]!;

  function setMarker(d: number) {
    const x = s.x(d);
    const y = s.y(yAt(d));
    const past = d >= dc;
    mLine.setAttribute('x1', String(x));
    mLine.setAttribute('x2', String(x));
    mDot.setAttribute('cx', String(x));
    mDot.setAttribute('cy', String(y));
    marker.dataset.past = String(past);
    if (showReadout) {
      // The y-leap IS the point: a tiny Δd across the knee moves this a lot.
      readout.setAttribute('x', String(x + (x > box.w * 0.72 ? -8 : 8)));
      readout.setAttribute('text-anchor', x > box.w * 0.72 ? 'end' : 'start');
      readout.setAttribute('y', String(Math.max(box.m.t + 12, y - 12)));
      readout.textContent = `${Math.round(yAt(d) * 100)}% burned`;
    }
    catastrophe.dataset.on = String(past);
  }

  return {
    setMarker,
    yAt,
    dFromClientX(clientX) {
      const r = root.getBoundingClientRect();
      return s.invX(((clientX - r.left) / r.width) * box.w);
    },
    addTrial(d, frac) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', String(s.x(d)));
      c.setAttribute('cy', String(s.y(frac)));
      c.setAttribute('r', '3');
      trials.append(c);
    },
    clearTrials() { trials.replaceChildren(); },
    revealCurve() { signature.dataset.hidden = 'false'; },
    setYReadout(on) { showReadout = on; if (!on) readout.textContent = ''; },
    setCatastrophe(on) { catastrophe.dataset.on = String(on); },
    setYourRun(d) {
      if (d == null) { yourRun.dataset.hidden = 'true'; return; }
      yourRun.setAttribute('x', String(s.x(d)));
      yourRun.setAttribute('text-anchor', 'middle');
      yourRun.dataset.hidden = 'false';
    },
  };
}
```

- [ ] **Step 8: Mount it temporarily and verify live**

In `src/pages/index.astro`, add below the lede:

```astro
<SignaturePlot id="probe" mode="coda" width={760} height={460}
  annotation={{ title: 'threshold · d_c ≈ 0.59' }} markerD={0.5} />
```
(with `import SignaturePlot from '../components/SignaturePlot.astro';` in the frontmatter)

Run `npm run dev`, navigate, **take a screenshot**, and compare side by side against the plot panel in [the look reference](../../.scratch/cascade/assets/01-forest-fire-look.html) (open it in a second tab). Confirm: faint scatter cloud reads; the mean curve's spectral gradient runs amber→magenta left→right; the knee dot is hot-core white-gold; **the annotation sits in whitespace with a thin leader and does not overlap the curve**; axis labels are mono; the source line is present and quiet; nothing glows or fills under the curve.

Fix any mismatch **now** (this is the "verify the look live at every step" rule — do not defer polish).

- [ ] **Step 9: Commit**

```bash
npm test && npm run build
git add -A
git commit -m "$(cat <<'EOF'
feat(plot): SSR SVG signature plot with locked scientific treatment

One renderer, config-driven, for both the exhibit and the coda. SVG (not canvas)
so the coda renders fully with no JS per ticket 03 dec. 11; the plot only updates
on discrete events, so nothing is lost. Geometry is pure + tested.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: The stage — canvas renderer with front-only repaint

Where the 60fps rule lives. Cached flat background + additive halo sprites for the moving front.

**Files:**
- Create: `src/lib/palette.ts`, `src/lib/palette.test.ts`
- Create: `src/scripts/stage.ts`
- Modify: `src/pages/index.astro` (temporary probe mount; removed in Task 8)

**Interfaces:**
- Consumes: `Field`, `Burn`, `isTree` from `src/lib/forest-fire.ts`.
- Produces:
  - `src/lib/palette.ts`: `FIRE: Stop[]`, `TEAL: Stop[]`, `SCAR: RGB`, `lerpStops(stops, t): RGB`, `fireColor(age: number): RGB`, `rgbStr(c: RGB): string`, with `type RGB = [number, number, number]` and `type Stop = [number, RGB]`.
  - `src/scripts/stage.ts`: `createStage(canvas: HTMLCanvasElement, W: number, H: number): Stage` where
    ```ts
    interface Stage {
      resize(cssWidth: number): void;
      /** Full repaint of latent forest + scar through `tick`. ~38ms at 160² — density change / reset ONLY. */
      paintAll(field: Field, d: number, burn: Burn | null, tick: number): void;
      /** O(front): blit the cached background, then draw the glowing band. */
      paintFrame(field: Field, burn: Burn, tick: number, shimmer: number): void;
      /** Move cells that aged out of the band into the cached scar background. */
      ageOut(cells: number[], field: Field): void;
      cellAt(clientX: number, clientY: number): { x: number; y: number; i: number } | null;
      readonly band: number;
    }
    ```

- [ ] **Step 1: Write the failing palette test**

`src/lib/palette.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { lerpStops, fireColor, FIRE, TEAL, SCAR, rgbStr } from './palette';

describe('palette ramps', () => {
  it('anchors the fire ramp on the locked hexes', () => {
    expect(fireColor(0).map(Math.round)).toEqual([255, 241, 194]); // #fff1c2 hot core
    expect(fireColor(1).map(Math.round)).toEqual([224, 71, 158]);  // #e0479e magenta tail
  });

  it('interpolates between stops', () => {
    const mid = lerpStops(FIRE, 0.42).map(Math.round); // #ff8a3d stop
    expect(mid).toEqual([255, 138, 61]);
  });

  it('clamps outside [0,1]', () => {
    expect(lerpStops(TEAL, -3)).toEqual(lerpStops(TEAL, 0));
    expect(lerpStops(TEAL, 9)).toEqual(lerpStops(TEAL, 1));
  });

  it('the fire ramp gets darker as it ages — luminance carries state too', () => {
    const lum = (c: number[]) => 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    expect(lum(fireColor(0))).toBeGreaterThan(lum(fireColor(1)));
  });

  it('the scar is near-black', () => {
    expect(Math.max(...SCAR)).toBeLessThan(60);
  });

  it('rgbStr formats integers', () => {
    expect(rgbStr([255.7, 0.2, 61.9])).toBe('rgb(255,0,61)');
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npx vitest run src/lib/palette.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the palette**

`src/lib/palette.ts` (hexes copied verbatim from spec §1.2 / the look reference — do not re-tint):

```ts
export type RGB = [number, number, number];
export type Stop = [number, RGB];

const hex2rgb = (h: string): RGB => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

/** Warm spectral front: age 0 = leading + hottest → 1 = trailing, cooling to scar.
 *  This is a SEQUENTIAL ramp (position + monotone luminance encode it), not a
 *  categorical set — which is why it survives the CVD check (spec §1.2). */
export const FIRE: Stop[] = [
  [0, hex2rgb('#fff1c2')],
  [0.14, hex2rgb('#ffd166')],
  [0.42, hex2rgb('#ff8a3d')],
  [0.7, hex2rgb('#ff5a5f')],
  [1, hex2rgb('#e0479e')],
];

/** Latent forest: deep → bright teal, varied per cell by a stable hash. */
export const TEAL: Stop[] = [
  [0, hex2rgb('#1f7a5c')],
  [1, hex2rgb('#2fb488')],
];

/** Spent scar — a hair above the stage so the burned region still reads. */
export const SCAR: RGB = hex2rgb('#31281c');

export function lerpStops(stops: Stop[], t: number): RGB {
  const u = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i]!;
    const [b, cb] = stops[i + 1]!;
    if (u >= a && u <= b) {
      const k = (u - a) / (b - a || 1);
      return [ca[0] + (cb[0] - ca[0]) * k, ca[1] + (cb[1] - ca[1]) * k, ca[2] + (cb[2] - ca[2]) * k];
    }
  }
  return stops[stops.length - 1]![1];
}

export const fireColor = (age: number): RGB => lerpStops(FIRE, age);
export const rgbStr = (c: RGB): string => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
```

- [ ] **Step 4: Run to confirm it passes**

Run: `npx vitest run src/lib/palette.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Implement the stage renderer**

`src/scripts/stage.ts`. Structure follows the look reference's `renderFlat` / `renderFront` / `makeHaloSprites`, with the background hoisted into an offscreen canvas so a frame is `blit + front` only. Locked bloom values from the graft: `forestDim 0.52`, `haloScale 3.0`, `haloAlpha 0.52`.

```ts
import { isTree, type Burn, type Field } from '../lib/forest-fire';
import { SCAR, TEAL, fireColor, lerpStops } from '../lib/palette';

const FOREST_DIM = 0.52;   // locked graft value (Direction B stage bloom)
const HALO_SCALE = 3.0;
const HALO_ALPHA = 0.52;
const HALO_BUCKETS = 12;

export interface Stage {
  resize(cssWidth: number): void;
  paintAll(field: Field, d: number, burn: Burn | null, tick: number): void;
  paintFrame(field: Field, burn: Burn, tick: number, shimmer: number): void;
  ageOut(cells: number[], field: Field): void;
  cellAt(clientX: number, clientY: number): { x: number; y: number; i: number } | null;
  readonly band: number;
}

export function createStage(canvas: HTMLCanvasElement, W: number, H: number): Stage {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const bg = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  let bgCtx = bg.getContext('2d')!;
  let cell = 4;
  let halo: { sprites: HTMLCanvasElement[]; R: number } = { sprites: [], R: 0 };
  const band = 5; // depth of the glowing front band, in ticks

  const gap = () => (cell >= 6 ? 0.6 : 0.3);

  function makeHaloSprites() {
    const R = Math.round(cell * HALO_SCALE);
    const size = R * 2;
    const sprites: HTMLCanvasElement[] = [];
    for (let k = 0; k < HALO_BUCKETS; k++) {
      const c = fireColor(k / (HALO_BUCKETS - 1));
      const cv = document.createElement('canvas');
      cv.width = cv.height = size;
      const g = cv.getContext('2d')!;
      const grd = g.createRadialGradient(R, R, 0, R, R, R);
      grd.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${HALO_ALPHA})`);
      grd.addColorStop(0.4, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${HALO_ALPHA * 0.38})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(R, R, R, 0, Math.PI * 2);
      g.fill();
      sprites.push(cv);
    }
    halo = { sprites, R };
  }

  function resize(cssWidth: number) {
    cell = Math.max(3, Math.floor(cssWidth / W));
    const w = W * cell, h = H * cell;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    bg.width = w * dpr; bg.height = h * dpr;
    ctx = canvas.getContext('2d')!;
    bgCtx = bg.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeHaloSprites();
  }

  function paintTree(i: number, field: Field) {
    const x = i % W, y = (i / W) | 0, s = cell - gap();
    const c = lerpStops(TEAL, field.shade[i]!);
    bgCtx.fillStyle = `rgb(${(c[0] * FOREST_DIM) | 0},${(c[1] * FOREST_DIM) | 0},${(c[2] * FOREST_DIM) | 0})`;
    bgCtx.fillRect(x * cell, y * cell, s, s);
  }

  function paintScar(i: number, field: Field) {
    const x = i % W, y = (i / W) | 0, s = cell - gap();
    const g = 0.72 + 0.5 * field.shade[i]!;
    bgCtx.fillStyle = `rgb(${(SCAR[0] * g) | 0},${(SCAR[1] * g) | 0},${(SCAR[2] * g) | 0})`;
    bgCtx.fillRect(x * cell, y * cell, s, s);
  }

  /** ~38ms at 160². Density change / reset ONLY — never inside the rAF loop. */
  function paintAll(field: Field, d: number, burn: Burn | null, tick: number) {
    bgCtx.clearRect(0, 0, W * cell, H * cell);
    for (let i = 0; i < W * H; i++) {
      if (!isTree(field, i, d)) continue;
      const t = burn ? burn.ig[i]! : -1;
      if (t >= 0 && t <= tick - band) paintScar(i, field);
      else if (t < 0 || t > tick) paintTree(i, field);
      // cells inside the band are drawn by paintFrame, not baked into the bg
    }
    ctx.clearRect(0, 0, W * cell, H * cell);
    ctx.drawImage(bg, 0, 0, W * cell, H * cell);
  }

  /** Cells that just left the glowing band become permanent scar in the cache. */
  function ageOut(cells: number[], field: Field) {
    for (const i of cells) paintScar(i, field);
  }

  /** The only per-frame work: blit the cache + repaint the ~O(perimeter) front. */
  function paintFrame(field: Field, burn: Burn, tick: number, shimmer: number) {
    const s = cell - gap();
    ctx.clearRect(0, 0, W * cell, H * cell);
    ctx.drawImage(bg, 0, 0, W * cell, H * cell);

    const front: number[] = [];
    for (let t = Math.max(0, tick - band + 1); t <= Math.min(tick, burn.maxTick); t++) {
      const bucket = burn.buckets[t];
      if (bucket) front.push(...bucket);
    }

    ctx.globalCompositeOperation = 'lighter';
    for (const i of front) {
      const x = i % W, y = (i / W) | 0;
      const age = Math.max(0, Math.min(1, (tick - burn.ig[i]!) / band));
      const flicker = shimmer ? 0.82 + 0.18 * Math.sin(x * 12.9 + y * 7.7 + shimmer * 0.006) : 1;
      ctx.globalAlpha = flicker;
      const sprite = halo.sprites[Math.min(HALO_BUCKETS - 1, Math.round(age * (HALO_BUCKETS - 1)))]!;
      ctx.drawImage(sprite, x * cell + cell / 2 - halo.R, y * cell + cell / 2 - halo.R);
    }
    ctx.globalAlpha = 1;
    for (const i of front) {
      const x = i % W, y = (i / W) | 0;
      const age = Math.max(0, Math.min(1, (tick - burn.ig[i]!) / band));
      const c = fireColor(age);
      const b = shimmer ? 0.9 + 0.1 * Math.sin(x * 4.1 - y * 3.3 + shimmer * 0.009) : 1;
      ctx.fillStyle = `rgb(${Math.min(255, c[0] * b) | 0},${Math.min(255, c[1] * b) | 0},${Math.min(255, c[2] * b) | 0})`;
      ctx.fillRect(x * cell, y * cell, s, s);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function cellAt(clientX: number, clientY: number) {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - r.left) / r.width) * W);
    const y = Math.floor(((clientY - r.top) / r.height) * H);
    if (x < 0 || x >= W || y < 0 || y >= H) return null;
    return { x, y, i: y * W + x };
  }

  resize(canvas.parentElement?.getBoundingClientRect().width ?? 640);
  return { resize, paintAll, paintFrame, ageOut, cellAt, band };
}
```

- [ ] **Step 6: Probe it live and confirm the frozen mid-burn frame matches the reference**

Temporarily add to `src/pages/index.astro`:

```astro
<div class="panel stage" style="max-width:760px"><canvas id="probe-stage"></canvas></div>
<script>
  import { buildField, burn, largestClusterSpark } from '../lib/forest-fire';
  import { createStage } from '../scripts/stage';
  const canvas = document.getElementById('probe-stage') as HTMLCanvasElement;
  const W = 128, H = 82, d = 0.62;
  const field = buildField(W, H, 0x0ca5cade);
  const b = burn(field, d, largestClusterSpark(field, d));
  const stage = createStage(canvas, W, H);
  const tick = Math.round(b.maxTick * 0.5);
  stage.paintAll(field, d, b, tick);
  stage.paintFrame(field, b, tick, 0);
  console.log('front cells', b.buckets.slice(Math.max(0, tick - 4), tick + 1).flat().length);
</script>
```

Run `npm run dev`, screenshot, and put it beside the stage panel in [the look reference](../../.scratch/cascade/assets/01-forest-fire-look.html). Confirm: dim teal latent forest (not vivid), a bright warm-spectral front with a generous additive bloom, near-black scar behind it, and the fire reads as the brightest thing on the page. Adjust nothing but the three locked constants if it's off — and if you change one, note why in `PROGRESS.md`.

- [ ] **Step 7: Measure the front repaint**

In the same probe script, append:

```ts
const t0 = performance.now();
for (let k = 0; k < 120; k++) stage.paintFrame(field, b, tick, k * 16);
console.log('ms/frame', ((performance.now() - t0) / 120).toFixed(2));
```
Read the console via chrome-devtools `list_console_messages`.
Expected: **well under 16.7** (the reference measured 1.66 ms at 160²). If it is over, the background is being repainted per frame — fix that before continuing; do not proceed to Task 6.

- [ ] **Step 8: Commit**

```bash
npm test
git add -A
git commit -m "$(cat <<'EOF'
feat(stage): canvas renderer — cached background, front-only repaint

Frame = blit the cached forest/scar + redraw the ~O(perimeter) burning band with
cached additive halo sprites. Whole-grid repaint happens once on density change.
Locked graft bloom values (forestDim .52 / haloScale 3.0 / haloAlpha .52).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: The exhibit — instrument chrome + free sandbox

The full `/forest-fire` page in sandbox mode (the on-ramp lands in Task 7). This is where the locked look becomes the product.

**Files:**
- Create: `src/components/Instrument.astro`, `src/components/ControlBar.astro`
- Create: `src/scripts/exhibit.ts`
- Create: `src/pages/forest-fire.astro`
- Modify: `src/pages/index.astro` (strip the probes)

**Interfaces:**
- Consumes: `createStage` (Task 5), `attachPlot` (Task 4), `buildField`/`burn`/`nearestTree`/`largestClusterSpark`/`D_C` (Task 2).
- Produces: `createExhibit(root: HTMLElement, opts: { grid: { W: number; H: number }; seed: number; startD: number }): ExhibitHandle` where
  ```ts
  interface ExhibitHandle {
    setDensity(d: number): void;
    sparkAt(i: number): void;
    getDensity(): number;
    setControlsMode(mode: 'onramp' | 'sandbox'): void;
    spotlight(which: 'stage' | 'density' | 'none'): void;
    onTrial(cb: (d: number, frac: number) => void): void;
    plot: PlotHandle;
  }
  ```

- [ ] **Step 1: Build the chrome components**

`src/components/ControlBar.astro` — the shared control vocabulary (spec §3.3). All keyboard-operable, visible focus ring.

```astro
---
interface Props { startD: number }
const { startD } = Astro.props;
---
<div class="controls">
  <div class="ctl" data-control="density">
    <label for="density">density</label>
    <input type="range" class="density" id="density" min="0.30" max="0.86" step="0.001"
      value={startD} aria-label="tree density"
      aria-describedby="density-readout" />
    <span class="val dval" id="density-readout">{startD.toFixed(3)}</span>
  </div>
  <button class="ctl-btn spark" data-act="spark">✦ Spark</button>
  <button class="ctl-btn" data-act="play" data-sandbox-only>▷ Play</button>
  <div class="ctl" data-sandbox-only>
    <label for="speed">speed</label>
    <input type="range" class="speed" id="speed" min="0.3" max="2" step="0.1" value="1" aria-label="speed" />
  </div>
  <button class="ctl-btn" data-act="shuffle">⤫ Shuffle</button>
  <button class="ctl-btn" data-act="reset">↺ Reset</button>
  <div class="spacer"></div>
  <div class="readout">
    <span class="r">swept <b class="sweptval" aria-live="polite">—</b></span>
    <span class="r">seed <b class="seedval">—</b></span>
  </div>
</div>
```

`src/components/Instrument.astro` — the framed chrome (head + dividers + stage/plot panels + control bar), matching the reference's `.instrument` block:

```astro
---
import ControlBar from './ControlBar.astro';
import SignaturePlot from './SignaturePlot.astro';

interface Props {
  title: string;
  sci: string;
  startD: number;
  showCurve: boolean;
}
const { title, sci, startD, showCurve } = Astro.props;
---
<section class="instrument" id="instrument">
  <div class="inst-head">
    <div class="inst-title">
      <h2>{title}</h2>
      <span class="sci">{sci}</span>
    </div>
  </div>
  <div class="divider"></div>
  <div class="panels">
    <div class="panel stage" data-spot="stage">
      <span class="panel-tag">stage</span>
      <canvas id="stage" tabindex="0" role="application"
        aria-label="Forest stage. Click or press Enter to spark the nearest tree."></canvas>
    </div>
    <div class="panel plot">
      <span class="panel-tag">signature</span>
      <SignaturePlot id="plot" mode="exhibit" width={460} height={430}
        showCurve={showCurve} showScatter={false} markerD={startD}
        annotation={{ title: 'd_c ≈ 0.59', sub: ['the same spark', 'now takes everything'] }} />
    </div>
  </div>
  <ControlBar startD={startD} />
</section>
```

Add to `global.css`: `[data-sandbox-only][hidden] { display: none; }` and the spotlight treatment —

```css
/* Beat spotlight: the live control is full strength, everything else recedes. */
.instrument[data-spotlight] .controls .ctl,
.instrument[data-spotlight] .controls .ctl-btn { opacity: 0.34; transition: opacity 220ms ease; }
.instrument[data-spotlight='density'] .controls [data-control='density'],
.instrument[data-spotlight='stage'] .controls [data-act='spark'] { opacity: 1; }
.instrument[data-spotlight='stage'] .panel.stage { box-shadow: inset 0 0 0 1px rgba(76, 201, 240, 0.28); }
```

- [ ] **Step 2: Write the exhibit wiring**

`src/scripts/exhibit.ts`. Key behaviours: monotonic-fill density (drag up adds trees, drag down removes them in reverse), a **fixed spark** that re-runs live as density changes, Shuffle as the only re-randomiser, rAF animation of the burn, reduced-motion before/after, tab-hidden pause.

```ts
import { buildField, burn, largestClusterSpark, nearestTree, type Burn, type Field } from '../lib/forest-fire';
import { attachPlot, type PlotHandle } from './plot';
import { createStage, type Stage } from './stage';

export interface ExhibitOpts {
  grid: { W: number; H: number };
  seed: number;
  startD: number;
}

export interface ExhibitHandle {
  setDensity(d: number): void;
  getDensity(): number;
  sparkAt(i: number): void;
  setControlsMode(mode: 'onramp' | 'sandbox'): void;
  spotlight(which: 'stage' | 'density' | 'none'): void;
  onTrial(cb: (d: number, frac: number) => void): void;
  plot: PlotHandle;
}

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createExhibit(root: HTMLElement, opts: ExhibitOpts): ExhibitHandle {
  const { W, H } = opts.grid;
  const canvas = root.querySelector<HTMLCanvasElement>('#stage')!;
  const svg = root.querySelector<SVGSVGElement>('#plot')!;
  const dSlider = root.querySelector<HTMLInputElement>('.density')!;
  const dVal = root.querySelector<HTMLElement>('.dval')!;
  const speed = root.querySelector<HTMLInputElement>('.speed')!;
  const sweptVal = root.querySelector<HTMLElement>('.sweptval')!;
  const seedVal = root.querySelector<HTMLElement>('.seedval')!;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-act=play]')!;

  const stage: Stage = createStage(canvas, W, H);
  const plot: PlotHandle = attachPlot(svg);

  let seed = opts.seed;
  let field: Field = buildField(W, H, seed);
  let density = opts.startD;
  let sparkCell = -1;
  let result: Burn | null = null;
  let tick = 0;
  let raf = 0;
  let playing = false;
  const trialCbs: ((d: number, frac: number) => void)[] = [];

  const showSeed = () => (seedVal.textContent = `0x${(seed >>> 0).toString(16).toUpperCase()}`);

  function stopLoop() { cancelAnimationFrame(raf); raf = 0; }

  function finish() {
    if (!result) return;
    sweptVal.textContent = `${Math.round(result.frac * 100)}%`;
    plot.addTrial(density, result.frac);
    trialCbs.forEach((cb) => cb(density, result!.frac));
  }

  /** Run the fixed spark at the current density, animating the front. */
  function runBurn() {
    stopLoop();
    if (sparkCell < 0 || !(field.r[sparkCell]! < density)) {
      // The fixed spark's cell may not be a tree at a lower density — snap out.
      const alt = nearestTree(field, density, sparkCell % W, Math.floor(sparkCell / W));
      sparkCell = alt;
    }
    result = burn(field, density, sparkCell);
    tick = 0;
    stage.paintAll(field, density, result, 0);

    if (result.spark < 0) { sweptVal.textContent = '0%'; return; }
    if (REDUCED) {
      // Before/after state: paint the finished burn, no animated spread.
      tick = result.maxTick + stage.band;
      stage.paintAll(field, density, result, tick);
      finish();
      return;
    }
    // Speed scales how many sim ticks a frame advances; 1 = one tick per frame.
    let acc = 0;
    const step = () => {
      acc += parseFloat(speed.value) || 1;
      while (acc >= 1 && tick <= result!.maxTick + stage.band) {
        acc -= 1;
        tick++;
        const spent = result!.buckets[tick - stage.band];
        if (spent) stage.ageOut(spent, field);
      }
      if (tick <= result!.maxTick + stage.band) {
        stage.paintFrame(field, result!, tick, performance.now());
        raf = requestAnimationFrame(step);
      } else {
        stage.paintAll(field, density, result!, tick);
        finish();
      }
    };
    raf = requestAnimationFrame(step);
  }

  function repaintIdle() {
    stopLoop();
    result = null;
    stage.paintAll(field, density, null, 0);
    sweptVal.textContent = '—';
  }

  function setDensity(d: number) {
    density = d;
    dSlider.value = String(d);
    dVal.textContent = d.toFixed(3);
    plot.setMarker(d);
    if (sparkCell >= 0) runBurn(); else repaintIdle();
  }

  function sparkAt(i: number) {
    sparkCell = i;
    runBurn();
  }

  dSlider.addEventListener('input', () => setDensity(parseFloat(dSlider.value)));

  canvas.addEventListener('click', (e) => {
    const c = stage.cellAt(e.clientX, e.clientY);
    if (!c) return;
    const t = nearestTree(field, density, c.x, c.y); // empty tap snaps to a tree
    if (t >= 0) sparkAt(t);
  });
  canvas.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const t = largestClusterSpark(field, density);
    if (t >= 0) sparkAt(t);
  });

  root.querySelector('[data-act=spark]')!.addEventListener('click', () => {
    const t = sparkCell >= 0 ? sparkCell : largestClusterSpark(field, density);
    if (t >= 0) sparkAt(t);
  });
  root.querySelector('[data-act=shuffle]')!.addEventListener('click', () => {
    seed = (seed + 0x9e37) >>> 0;          // Shuffle is the ONLY re-randomiser
    field = buildField(W, H, seed);
    showSeed();
    sparkCell = -1;
    repaintIdle();
  });
  root.querySelector('[data-act=reset]')!.addEventListener('click', () => {
    seed = opts.seed;
    field = buildField(W, H, seed);
    showSeed();
    sparkCell = -1;
    playing = false;
    playBtn.textContent = '▷ Play';
    plot.clearTrials();
    setDensity(opts.startD);
  });
  playBtn.addEventListener('click', () => {
    if (REDUCED) return;
    playing = !playing;
    playBtn.textContent = playing ? '❚❚ Pause' : '▷ Play';
    playBtn.setAttribute('aria-pressed', String(playing));
    if (playing && sparkCell >= 0) runBurn();
    else stopLoop();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoop(); });
  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      stage.resize(canvas.parentElement!.getBoundingClientRect().width);
      stage.paintAll(field, density, result, tick);
      if (result) stage.paintFrame(field, result, tick, 0);
    }, 120);
  });

  showSeed();
  plot.setMarker(density);
  repaintIdle();

  return {
    setDensity,
    getDensity: () => density,
    sparkAt,
    plot,
    setControlsMode(mode) {
      root.querySelectorAll<HTMLElement>('[data-sandbox-only]').forEach((el) => {
        el.hidden = mode === 'onramp';
      });
    },
    spotlight(which) {
      if (which === 'none') delete root.dataset.spotlight;
      else root.dataset.spotlight = which;
    },
    onTrial(cb) { trialCbs.push(cb); },
  };
}
```

- [ ] **Step 3: Write the exhibit page (sandbox only for now)**

`src/pages/forest-fire.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Instrument from '../components/Instrument.astro';
---
<BaseLayout
  title="Forest fire · Cascade"
  description="Below a line a spark fizzles. A hair past it, the same spark takes everything.">
  <section class="page">
    <p class="kicker">Cascade · 01 · threshold</p>
    <Instrument title="Forest fire" sci="percolation · von-Neumann spread" startD={0.4} showCurve={true} />
  </section>
</BaseLayout>

<script>
  import { createExhibit } from '../scripts/exhibit';
  const root = document.getElementById('instrument');
  if (root) createExhibit(root, { grid: { W: 128, H: 82 }, seed: 0x0ca5cade, startD: 0.4 });
</script>
```

- [ ] **Step 4: Strip the probes from the landing**

Remove the `SignaturePlot` and `#probe-stage` blocks added in Tasks 4 and 5 from `src/pages/index.astro`; leave the placeholder text plus a link to `/forest-fire`.

- [ ] **Step 5: Verify the sandbox live — this is the acceptance moment**

Run `npm run dev`, open `/forest-fire`, and check each of these **in the browser** (screenshot each):

1. The instrument reads like the look reference: framed chrome, stage on the left at ~1.62fr, plot right, control bar below with mono labels and readouts.
2. Click a tree → a burn animates cell-by-cell with the warm-spectral glow and leaves a charcoal scar; `swept` updates; a trial point drops on the plot.
3. Drag density **0.52 → 0.62**: trees appear (never move), the same spark's burn re-runs live, and the outcome flips **contained → total**. The plot marker slides and flips **cyan → amber** as it crosses 0.59.
4. Drag density back down: trees vanish in reverse order (monotonic fill).
5. `Shuffle` gives a new forest; `Reset` restores seed + density + clears trials.
6. Tab through every control: visible cyan focus ring, logical order, the stage canvas is focusable and Enter sparks it.
7. Console is clean; the front repaint stays under 16.7 ms (re-run the Task-5 timing snippet if unsure).

Fix anything that doesn't match the reference now.

- [ ] **Step 6: Commit**

```bash
npm test && npm run build
git add -A
git commit -m "$(cat <<'EOF'
feat(exhibit): forest-fire instrument + free sandbox

Monotonic-fill density slider re-runs the FIXED spark live, so dragging
0.52 -> 0.62 flips contained -> total with the same spark. Shuffle is the only
re-randomiser. Trials build the plot's scatter. Keyboard + reduced-motion paths.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: The 3-beat on-ramp

Ticket 02, locked verbatim. Plant a linear expectation, then shatter it.

**Files:**
- Create: `src/components/CaptionStrip.astro`
- Create: `src/scripts/beats.ts`
- Create: `src/lib/beats-config.ts`, `src/lib/beats-config.test.ts`
- Modify: `src/pages/forest-fire.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `ExhibitHandle` (Task 6), `D_C` (Task 2).
- Produces:
  - `src/lib/beats-config.ts`: `BEATS: Beat[]` with
    ```ts
    interface Beat {
      n: 1 | 2 | 3;
      prompt: string;                       // mono, before the action
      lesson: string;                       // Archivo, after the result
      spotlight: 'stage' | 'density';
      presetD: number;
      /** Gate: has the user done the thing? */
      done(s: { d: number; sparked: boolean; burnComplete: boolean; crossed: boolean }): boolean;
    }
    ```
  - `src/scripts/beats.ts`: `runOnRamp(root: HTMLElement, ex: ExhibitHandle, strip: HTMLElement): void`
  - localStorage keys: `cascade.ff.onramp` (`'done'`), `cascade.ff.crossing` (the density at the beat-3 crossing, for the coda's `★ your run`).

- [ ] **Step 1: Write the failing beats-config test**

`src/lib/beats-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { BEATS } from './beats-config';
import { D_C } from './forest-fire';

describe('on-ramp beats (ticket 02)', () => {
  it('is exactly three beats — beat 2 is the trap that makes beat 3 land', () => {
    expect(BEATS.map((b) => b.n)).toEqual([1, 2, 3]);
  });

  it('teaches spark first, then density (one verb at a time)', () => {
    expect(BEATS[0]!.spotlight).toBe('stage');
    expect(BEATS[1]!.spotlight).toBe('density');
    expect(BEATS[2]!.spotlight).toBe('density');
  });

  it('presets the locked densities: sparse, the trap, then poised below the knee', () => {
    expect(BEATS[0]!.presetD).toBeCloseTo(0.4, 5);
    expect(BEATS[1]!.presetD).toBeCloseTo(0.4, 5);
    expect(BEATS[2]!.presetD).toBeCloseTo(0.52, 5);
  });

  it('beat 1 completes only when a spark has finished burning', () => {
    const g = BEATS[0]!.done;
    expect(g({ d: 0.4, sparked: false, burnComplete: false, crossed: false })).toBe(false);
    expect(g({ d: 0.4, sparked: true, burnComplete: false, crossed: false })).toBe(false);
    expect(g({ d: 0.4, sparked: true, burnComplete: true, crossed: false })).toBe(true);
  });

  it('beat 2 completes when density reaches the 0.52 band', () => {
    const g = BEATS[1]!.done;
    expect(g({ d: 0.5, sparked: true, burnComplete: true, crossed: false })).toBe(false);
    expect(g({ d: 0.52, sparked: true, burnComplete: true, crossed: false })).toBe(true);
  });

  it('beat 3 completes ONLY on crossing d_c — a near miss at 0.58 still fizzles', () => {
    const g = BEATS[2]!.done;
    expect(g({ d: 0.58, sparked: true, burnComplete: true, crossed: false })).toBe(false);
    expect(g({ d: D_C, sparked: true, burnComplete: true, crossed: true })).toBe(true);
  });

  it('uses no jargon — "threshold" is withheld for the coda', () => {
    const words = BEATS.map((b) => `${b.prompt} ${b.lesson}`).join(' ').toLowerCase();
    for (const jargon of ['threshold', 'percolation', 'critical', 'phase transition']) {
      expect(words).not.toContain(jargon);
    }
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npx vitest run src/lib/beats-config.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the beat configuration — copy is LOCKED (ticket 02)**

`src/lib/beats-config.ts`:

```ts
import { D_C } from './forest-fire';

export interface BeatState {
  d: number;
  sparked: boolean;
  burnComplete: boolean;
  crossed: boolean;
}

export interface Beat {
  n: 1 | 2 | 3;
  /** mono, shown before the action */
  prompt: string;
  /** Archivo, shown after the result lands */
  lesson: string;
  spotlight: 'stage' | 'density';
  presetD: number;
  done(s: BeatState): boolean;
}

/** Copy is LOCKED — ticket 02, decision 11. Do not rewrite. */
export const BEATS: Beat[] = [
  {
    n: 1,
    prompt: 'tap a tree to spark it',
    lesson: 'A spark here goes nowhere.',
    spotlight: 'stage',
    presetD: 0.4,
    done: (s) => s.sparked && s.burnComplete,
  },
  {
    n: 2,
    prompt: 'drag density up to add trees',
    lesson: 'Denser. A bigger scar. Still stops.',
    spotlight: 'density',
    presetD: 0.4,
    done: (s) => s.d >= 0.52,
  },
  {
    n: 3,
    prompt: 'one more nudge',
    lesson: 'One more tree. Same spark. Everything.',
    spotlight: 'density',
    presetD: 0.52,
    done: (s) => s.crossed && s.d >= D_C,
  },
];

export const SANDBOX_LESSON = 'Now it’s yours.';
export const SANDBOX_PROMPT = 'explore freely →';
export const SKIP_D = 0.62; // skip opens the sandbox somewhere already interesting
```

- [ ] **Step 4: Run to confirm it passes**

Run: `npx vitest run src/lib/beats-config.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Build the caption strip**

`src/components/CaptionStrip.astro` — a **slim strip above the instrument frame**, never overlaid on the stage (ticket 02, dec. 8):

```astro
<div class="caption-strip" id="caption" data-beat="1">
  <div class="cap-left">
    <p class="cap-lesson" aria-live="polite"></p>
    <p class="cap-prompt"></p>
  </div>
  <div class="cap-right">
    <span class="cap-progress" aria-hidden="true"><b>1</b>·<span>2</span>·<span>3</span></span>
    <button class="cap-skip" type="button">skip intro →</button>
    <button class="cap-next" type="button" hidden>next →</button>
  </div>
</div>
```

Styles for `global.css`:

```css
/* On-ramp caption strip — above the frame; the stage keeps the glow to itself. */
.caption-strip {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
  padding: 0 2px 14px;
}
.cap-lesson { margin: 0 0 3px; font-size: 15px; font-weight: 500; color: var(--ink); min-height: 20px; }
.cap-prompt { margin: 0; font-family: var(--mono); font-size: 11.5px; color: var(--ink-muted); }
.cap-right { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; }
.cap-progress { font-family: var(--mono); font-size: 11px; color: var(--ink-faint); letter-spacing: .14em; }
.cap-progress b { color: var(--ink); font-weight: 600; }
.cap-skip, .cap-next {
  font-family: var(--mono); font-size: 11px; color: var(--ink-faint);
  background: none; border: none; cursor: pointer; padding: 4px 2px;
}
.cap-skip:hover, .cap-next:hover { color: var(--ink); }

/* The knee-tick that invites "one more nudge" (beat 3). */
.knee-tick {
  position: absolute; width: 2px; height: 14px; border-radius: 1px;
  background: var(--amber); pointer-events: none; opacity: 0;
}
.knee-tick[data-on='true'] { opacity: 1; animation: kneepulse 1.4s ease-in-out infinite; }
@keyframes kneepulse { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .knee-tick[data-on='true'] { animation: none; opacity: 1; } }
.ctl[data-control='density'] { position: relative; }
```

- [ ] **Step 6: Implement the beat runner**

`src/scripts/beats.ts`:

```ts
import { BEATS, SANDBOX_LESSON, SANDBOX_PROMPT, SKIP_D, type BeatState } from '../lib/beats-config';
import { D_C } from '../lib/forest-fire';
import type { ExhibitHandle } from './exhibit';

const KEY_DONE = 'cascade.ff.onramp';
const KEY_CROSSING = 'cascade.ff.crossing';

export const onRampComplete = (): boolean => {
  try { return localStorage.getItem(KEY_DONE) === 'done'; } catch { return false; }
};

export function runOnRamp(root: HTMLElement, ex: ExhibitHandle, strip: HTMLElement): void {
  const lesson = strip.querySelector<HTMLElement>('.cap-lesson')!;
  const prompt = strip.querySelector<HTMLElement>('.cap-prompt')!;
  const progress = strip.querySelector<HTMLElement>('.cap-progress')!;
  const skip = strip.querySelector<HTMLButtonElement>('.cap-skip')!;
  const next = strip.querySelector<HTMLButtonElement>('.cap-next')!;
  const densityCtl = root.querySelector<HTMLElement>('[data-control="density"]')!;

  // The pulsing knee-tick sits at d_c's pixel on the slider track (beat 3).
  const tick = document.createElement('span');
  tick.className = 'knee-tick';
  densityCtl.append(tick);
  function placeTick() {
    const slider = densityCtl.querySelector<HTMLInputElement>('.density')!;
    const min = 0.3, max = 0.86;
    const r = slider.getBoundingClientRect();
    const c = densityCtl.getBoundingClientRect();
    tick.style.left = `${r.left - c.left + ((D_C - min) / (max - min)) * r.width}px`;
    tick.style.top = `${r.top - c.top - 5}px`;
  }

  const state: BeatState = { d: ex.getDensity(), sparked: false, burnComplete: false, crossed: false };
  let idx = 0;

  ex.setControlsMode('onramp');
  ex.plot.setMarker(state.d);

  function render() {
    const b = BEATS[idx]!;
    strip.dataset.beat = String(b.n);
    prompt.textContent = b.prompt;
    lesson.textContent = '';
    progress.innerHTML = [1, 2, 3].map((n) => (n === b.n ? `<b>${n}</b>` : `<span>${n}</span>`)).join('·');
    ex.spotlight(b.spotlight);
    tick.dataset.on = String(b.n === 3);
    if (b.n === 3) placeTick();
    if (ex.getDensity() !== b.presetD && b.n === 1) ex.setDensity(b.presetD);
  }

  function check() {
    const b = BEATS[idx]!;
    if (!b.done(state)) return;
    lesson.textContent = b.lesson;
    if (b.n === 3) {
      ex.plot.revealCurve();                       // knee + curve resolve ON the crossing
      try { localStorage.setItem(KEY_CROSSING, state.d.toFixed(3)); } catch { /* private mode */ }
      window.setTimeout(release, 1400);
      return;
    }
    next.hidden = false;
    window.setTimeout(advance, 900);
  }

  function advance() {
    if (idx >= BEATS.length - 1) { release(); return; }
    idx++;
    next.hidden = true;
    render();
  }

  function release() {
    tick.dataset.on = 'false';
    strip.dataset.beat = 'sandbox';
    lesson.textContent = SANDBOX_LESSON;
    prompt.textContent = SANDBOX_PROMPT;
    progress.textContent = '';
    next.hidden = true;
    skip.hidden = true;
    ex.spotlight('none');
    ex.setControlsMode('sandbox');
    ex.plot.revealCurve();
    try { localStorage.setItem(KEY_DONE, 'done'); } catch { /* private mode */ }
  }

  ex.onTrial((d) => {
    state.burnComplete = true;
    state.sparked = true;
    state.d = d;
    check();
  });

  root.querySelector('#stage')!.addEventListener('click', () => { state.sparked = true; });

  root.querySelector('.density')!.addEventListener('input', (e) => {
    const d = parseFloat((e.target as HTMLInputElement).value);
    if (!state.crossed && d >= D_C) state.crossed = true;   // flips mid-drag, at the exact pixel
    state.d = d;
    check();
  });

  next.addEventListener('click', advance);
  skip.addEventListener('click', () => { ex.setDensity(SKIP_D); release(); });
  addEventListener('resize', () => { if (strip.dataset.beat === '3') placeTick(); });

  render();
}
```

- [ ] **Step 7: Wire it into the page with the re-entry rule**

Replace the `<script>` block in `src/pages/forest-fire.astro`, and add `<CaptionStrip />` above `<Instrument />` (import both):

```astro
<script>
  import { createExhibit } from '../scripts/exhibit';
  import { runOnRamp, onRampComplete } from '../scripts/beats';
  import { SKIP_D } from '../lib/beats-config';

  const root = document.getElementById('instrument');
  const strip = document.getElementById('caption');
  if (root && strip) {
    const returning = onRampComplete();
    const ex = createExhibit(root, {
      grid: { W: 128, H: 82 },
      seed: 0x0ca5cade,
      startD: returning ? SKIP_D : 0.4,
    });
    if (returning) {
      // Repeat visits open in the sandbox with a quiet replay affordance.
      ex.setControlsMode('sandbox');
      ex.plot.revealCurve();
      strip.dataset.beat = 'sandbox';
      strip.querySelector('.cap-lesson')!.textContent = '';
      strip.querySelector('.cap-prompt')!.textContent = 'explore freely →';
      const replay = strip.querySelector('.cap-skip') as HTMLButtonElement;
      replay.textContent = '▷ replay intro';
      replay.addEventListener('click', () => {
        localStorage.removeItem('cascade.ff.onramp');
        location.reload();
      });
    } else {
      runOnRamp(root, ex, strip);
    }
  }
</script>
```

Set `showCurve={false}` on the `<Instrument />` when the on-ramp will run — pass a prop from the page. Since the page is static, render with `showCurve={false}` always and let the client `revealCurve()` immediately for returning visitors (one frame, imperceptible), keeping the markup identical.

- [ ] **Step 8: Walk the on-ramp in the browser — the acceptance moment**

Clear `localStorage` first (devtools console: `localStorage.clear()`), reload `/forest-fire`, then verify with screenshots at each beat:

1. **Beat 1** — sparse forest, the caption reads `tap a tree to spark it`, the stage is spotlit and the density control is dimmed. Tap a tree → a tiny patch burns and dies → `A spark here goes nowhere.` appears; trial point #1 sits near the floor; the marker is **cyan**. **The curve and annotation are NOT visible yet.**
2. **Beat 2** — density spotlit. Drag to 0.52 → trees fill in around the same spark, its burn re-runs live, bigger scar, still contained → `Denser. A bigger scar. Still stops.` Point #2 sits slightly higher (two low points = the trap).
3. **Beat 3** — a pulsing amber knee-tick appears on the slider at 0.59, prompt `one more nudge`. Drag slowly across 0.59: **the marker flips cyan → amber at the exact pixel**, the same spark sweeps the whole forest, point #3 leaps to the top, and **the curve + knee + off-line annotation resolve in sync with the crossing**. Then `One more tree. Same spark. Everything.` → releases to the sandbox with `Now it's yours.`; Play/Speed fade in.
4. **Near miss** — reload and stop at 0.58: it still fizzles and the beat does **not** complete.
5. **Keyboard** — reload, Tab to the density slider, arrow-key across 0.59: identical flip and completion.
6. **Skip** — reload, click `skip intro →` → lands in the sandbox at d = 0.62 with the curve shown.
7. **Re-entry** — reload again → opens in the sandbox with `▷ replay intro`.
8. **Reduced motion** — emulate `prefers-reduced-motion: reduce` (chrome-devtools `emulate`), reload, walk the beats: burns render as before/after states, the fizzle-vs-sweep contrast still reads, and the swept-% readout plus the plot point carry the outcome.

- [ ] **Step 9: Commit**

```bash
npm test && npm run build
git add -A
git commit -m "$(cat <<'EOF'
feat(onramp): the three locked beats — plant a linear expectation, shatter it

Beat 1 teaches Spark, beats 2-3 teach density. The knee, curve and annotation
are withheld until the beat-3 crossing, then resolve in sync with it (ticket 02
dec. 5). Near-miss at 0.58 preserved; keyboard crossing gets the same flip;
localStorage remembers completion and the crossing density for the coda.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Landing page

Frames the thesis and the register. One live door + one muted promise line (deviation 3).

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `BaseLayout` (Task 1).
- Produces: the `/` route; `.door` card styles reused nowhere else yet.

- [ ] **Step 1: Write the landing**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  title="Cascade — one small thing, enormous consequences"
  description="Three ways the world turns a small cause into an enormous effect. Live simulations you drive yourself.">
  <section class="page landing">
    <p class="kicker">Cascade</p>
    <h1>One small thing, enormous consequences.</h1>
    <p class="lede">
      Three ways the world does it — threshold, criticality, cascade. Each one is a live
      simulation you drive yourself, and a plot built from your own runs.
    </p>

    <a class="door" href="/forest-fire">
      <span class="door-num">01</span>
      <span class="door-body">
        <span class="door-title">Forest fire</span>
        <span class="door-line">Below a line a spark fizzles. A hair past it, the same spark takes everything.</span>
        <span class="door-meta">threshold · site percolation · d_c ≈ 0.59</span>
      </span>
      <span class="door-go">→</span>
    </a>

    <p class="promise">criticality and cascade — the next two exhibits.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Style it**

Append to `global.css` — restrained, dark, type small; the door card borrows the instrument frame so the landing already reads as the same instrument:

```css
.landing { padding-top: 64px; max-width: 860px; }
.landing .lede { margin-bottom: 34px; }

.door {
  display: flex; align-items: center; gap: 20px;
  padding: 22px 24px; text-decoration: none;
  background: var(--chrome); border: 1px solid var(--chrome-line); border-radius: var(--r);
  transition: border-color 160ms ease, background 160ms ease;
}
.door:hover { border-color: #2a3140; background: #151922; }
.door-num { font-family: var(--mono); font-size: 11px; color: var(--ink-faint); letter-spacing: .14em; }
.door-body { display: grid; gap: 5px; }
.door-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.door-line { font-size: 13.5px; line-height: 1.5; color: var(--ink-muted); }
.door-meta { font-family: var(--mono); font-size: 10.5px; color: var(--ink-faint); letter-spacing: .06em; }
.door-go { margin-left: auto; color: var(--ink-faint); font-size: 18px; }
.door:hover .door-go { color: var(--amber); }

.promise { margin: 18px 2px 0; font-family: var(--mono); font-size: 11px; color: var(--ink-faint); }
```

- [ ] **Step 3: Verify live**

`npm run dev` → screenshot `/`. Confirm: the H1 is ~30px (not a billboard), no serif, the door card reads as part of the same instrument family, the promise line is quiet and reads as *finished* rather than "coming soon", and the door navigates to `/forest-fire`.

- [ ] **Step 4: Commit**

```bash
npm run build
git add -A
git commit -m "$(cat <<'EOF'
feat(landing): thesis + one live door + one promise line

No ghost cards for exhibits 2 and 3 (ticket 03's degrade rule, applied to the
landing) so the site reads finished rather than WIP.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Synthesis coda — panel 1

Ticket 03, locked. The calm opposite register: the plot becomes the hero, threshold gets named, one drag re-fires the cliff.

**Files:**
- Create: `src/components/CodaPanel.astro`
- Create: `src/scripts/coda.ts`
- Create: `src/pages/synthesis.astro`
- Modify: `src/styles/global.css`
- Modify: `src/pages/forest-fire.astro` (the hand-off link)

**Interfaces:**
- Consumes: `SignaturePlot.astro` (Task 4, `mode='coda'`), `attachPlot` (Task 4), `D_C`.
- Produces: `CodaPanel.astro` props `{ concept: string; plain: string; felt: string; echo: string }` — the **board-slot contract** panels 2 & 3 will fill.

- [ ] **Step 1: Build the board-slot panel**

`src/components/CodaPanel.astro` — the slot: `{ concept-word, hero plot, plain line, felt callback, real-world echo }`.

```astro
---
import SignaturePlot from './SignaturePlot.astro';

interface Props { concept: string; plain: string; felt: string; echo: string }
const { concept, plain, felt, echo } = Astro.props;
---
<article class="coda-panel">
  <p class="coda-concept">{concept}</p>
  <div class="coda-plot">
    <SignaturePlot id="coda-plot" mode="coda" width={860} height={500}
      showCurve={true} showScatter={true} markerD={0.55}
      annotation={{ title: 'threshold · d_c ≈ 0.59' }} />
  </div>
  <p class="coda-hint" data-js-only>drag the marker across the knee</p>
  <p class="coda-plain">{plain}</p>
  <p class="coda-felt">{felt}</p>
  <p class="coda-echo">{echo}</p>
</article>
```

- [ ] **Step 2: Write the coda page**

`src/pages/synthesis.astro`. Copy block is **locked** (ticket 03, dec. 4):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import CodaPanel from '../components/CodaPanel.astro';
---
<BaseLayout
  title="Synthesis · Cascade"
  description="One small thing, enormous consequences — three ways the world does it.">
  <section class="page coda">
    <p class="kicker">Cascade · synthesis</p>
    <h1>One small thing, enormous consequences — three ways the world does it.</h1>

    <div class="coda-board">
      <CodaPanel
        concept="THRESHOLD"
        plain="Cross a line and the same spark changes everything."
        felt="Cliffs, not ramps."
        echo="An epidemic past R = 1." />
    </div>

    <p class="promise">criticality and cascade — the next two exhibits.</p>
  </section>
</BaseLayout>

<script>
  import { attachCoda } from '../scripts/coda';
  attachCoda();
</script>
```

- [ ] **Step 3: Implement the re-feel interaction**

`src/scripts/coda.ts` — plot-space only; **no sim, no rAF**:

```ts
import { attachPlot } from './plot';

const KEY_CROSSING = 'cascade.ff.crossing';
const D_MIN = 0.3, D_MAX = 0.86, STEP = 0.005;

export function attachCoda(): void {
  const svg = document.getElementById('coda-plot') as SVGSVGElement | null;
  if (!svg) return;

  const plot = attachPlot(svg);
  let d = 0.55;                       // rests poised just BELOW the knee; no autoplay

  plot.setYReadout(true);
  plot.setMarker(d);

  // The personal thread: where THIS user crossed. Absent ⇒ the panel is still complete.
  try {
    const raw = localStorage.getItem(KEY_CROSSING);
    plot.setYourRun(raw ? Number(raw) : null);
  } catch { plot.setYourRun(null); }

  const set = (next: number) => {
    d = Math.min(D_MAX, Math.max(D_MIN, next));
    plot.setMarker(d);
    svg.setAttribute('aria-valuenow', d.toFixed(3));
    svg.setAttribute('aria-valuetext', `density ${d.toFixed(2)}, ${Math.round(plot.yAt(d) * 100)} percent burned`);
  };

  // Keyboard first — arrow-keys get the identical flip (ticket 03, dec. 10).
  svg.setAttribute('role', 'slider');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-label', 'Density marker. Move across the threshold to see the fraction burned leap.');
  svg.setAttribute('aria-valuemin', String(D_MIN));
  svg.setAttribute('aria-valuemax', String(D_MAX));
  svg.addEventListener('keydown', (e) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? STEP
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -STEP
      : e.key === 'Home' ? D_MIN - d
      : e.key === 'End' ? D_MAX - d
      : 0;
    if (!delta) return;
    e.preventDefault();
    set(d + delta);
  });

  let dragging = false;
  const move = (clientX: number) => set(plot.dFromClientX(clientX));
  svg.addEventListener('pointerdown', (e) => { dragging = true; svg.setPointerCapture(e.pointerId); move(e.clientX); });
  svg.addEventListener('pointermove', (e) => { if (dragging) move(e.clientX); });
  svg.addEventListener('pointerup', (e) => { dragging = false; svg.releasePointerCapture(e.pointerId); });
  svg.addEventListener('pointercancel', () => { dragging = false; });

  set(d);
  document.querySelectorAll<HTMLElement>('[data-js-only]').forEach((el) => (el.dataset.jsOn = 'true'));
  svg.classList.add('is-interactive');
}
```

- [ ] **Step 4: Style the coda**

Append to `global.css` — calm, hero-scale plot, small type, generous quiet:

```css
.coda { max-width: 960px; padding-top: 64px; }
.coda h1 { margin-bottom: 40px; }
.coda-board { display: grid; gap: 40px; }            /* reflows to 3-up when panels 2 & 3 land */
@media (min-width: 1200px) { .coda-board[data-panels='3'] { grid-template-columns: repeat(3, 1fr); } }

.coda-panel {
  background: var(--chrome); border: 1px solid var(--chrome-line); border-radius: var(--r);
  padding: 26px 28px 24px;
}
.coda-concept {
  margin: 0 0 18px; font-family: var(--mono); font-size: 11px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--ink-muted);
}
.coda-plot { margin: 0 0 8px; }
.coda-plot .sigplot { cursor: ew-resize; }
.coda-plot .sigplot:not(.is-interactive) { cursor: default; }
.coda-hint {
  margin: 0 0 22px; font-family: var(--mono); font-size: 10.5px; color: var(--ink-faint);
  display: none;
}
.coda-hint[data-js-on='true'] { display: block; }    /* no-JS never promises an interaction */
.coda-plain { margin: 0 0 6px; font-size: 15.5px; font-weight: 500; color: var(--ink); }
.coda-felt { margin: 0 0 6px; font-family: var(--mono); font-size: 12.5px; color: var(--ink-muted); }
.coda-echo { margin: 0; font-family: var(--mono); font-size: 11.5px; color: var(--ink-faint); }
.sigplot:focus-visible { outline: 2px solid var(--focus); outline-offset: 4px; }
```

- [ ] **Step 5: Hand off from the exhibit**

In `src/pages/forest-fire.astro`, below the instrument:

```astro
<p class="handoff"><a href="/synthesis">next: what you just felt, named →</a></p>
```

```css
.handoff { margin: 26px 2px 0; font-family: var(--mono); font-size: 11.5px; }
.handoff a { color: var(--ink-muted); text-decoration: none; }
.handoff a:hover { color: var(--amber); }
```

- [ ] **Step 6: Verify the coda live**

`npm run dev` → `/synthesis`, screenshot, and check:

1. **Register** — calm. No stage, no glow field; the plot is the biggest bright object; type is small; it reads as reflection, not a repeat of the exhibit.
2. **Copy** — `THRESHOLD` / `Cross a line and the same spark changes everything.` / `Cliffs, not ramps.` / `An epidemic past R = 1.` exactly.
3. **Resting state** — the marker sits **just below** the knee, cyan, nothing moving.
4. **The re-feel** — drag right across 0.59: the y-readout **leaps** (tiny Δx → huge Δy), the marker flips **cyan → amber at the exact d_c pixel**, and the catastrophe regime right of the knee floods warm. Drag back: it all reverses.
5. **Keyboard** — Tab to the plot, arrow-key across the knee: same flip, same leap; `aria-valuetext` announces the density and the percent burned.
6. **`★ your run`** — with a `cascade.ff.crossing` value in localStorage the tick appears at that density; clear the key and reload → the panel is still complete, no gap.
7. **No JS** — disable JavaScript (chrome-devtools) and reload: the canonical plot, the `threshold · d_c ≈ 0.59` annotation, all four copy lines, and the promise line still render. The `drag the marker` hint is **absent** (it never promises what isn't there).
8. **Solo degrade** — no ghost cards for exhibits 2 & 3 anywhere; one muted promise line only.

- [ ] **Step 7: Commit**

```bash
npm test && npm run build
git add -A
git commit -m "$(cat <<'EOF'
feat(coda): synthesis panel 1 — threshold, named

The calm opposite register to the exhibit: the plot is the hero, one drag
re-fires the cliff (y-readout leaps, marker flips at d_c, catastrophe regime
floods warm). Built as a board-slot so panels 2 and 3 drop in unchanged.
Renders complete with no JS; the marker is pure enhancement.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Hardening pass — a11y, responsive, perf, OG, docs

Everything §4.5 and §8 demand, verified rather than assumed.

**Files:**
- Create: `public/og.png`
- Create/Modify: `README.md`, `PROGRESS.md`
- Modify: `src/styles/global.css` (responsive fixes found here)

- [ ] **Step 1: Keyboard-only walkthrough**

With the mouse untouched, Tab from the top of `/forest-fire`: skip link → density → spark → shuffle → reset → stage canvas → plot → handoff link. Every stop has a visible cyan focus ring. Enter on the stage sparks. Arrow keys on the density slider cross d_c and flip the marker. Fix any trap or invisible focus.

- [ ] **Step 2: Reduced-motion pass**

chrome-devtools `emulate` → `prefers-reduced-motion: reduce`. Reload all three routes. Confirm: nothing auto-plays, burns render as before/after states, the caption swaps instantly, the knee-tick is static-visible (not pulsing), and every outcome is still readable from the swept-% readout and the plot point.

- [ ] **Step 3: Responsive pass**

`resize_page` to 390×844 and 768×1024. Confirm on each route: no horizontal scroll, the `.panels` grid collapses to one column, the stage canvas fits its container, the plot's annotation still sits in whitespace (not off-canvas or over the curve), and the control bar wraps without overlap. Fix in `global.css` only.

- [ ] **Step 4: Perf check**

On `/forest-fire`, run a burn at d = 0.62 while recording a performance trace (chrome-devtools `performance_start_trace` → spark → `performance_stop_trace`). Confirm frames stay ≈16.7 ms or better during the sweep. Switch to a hidden tab and confirm the rAF loop stops.

- [ ] **Step 5: Make the static OG image**

Navigate to `/forest-fire`, drive it to a dramatic mid-burn frame (d = 0.62, spark, pause mid-sweep), `resize_page` to 1200×630, screenshot the instrument, and save the PNG to `public/og.png`. Reload any page and confirm the `og:image` URL resolves in the built output.

- [ ] **Step 6: Write the docs**

`README.md` — what Cascade is (one paragraph, plain), the routes, `npm run dev / test / bake / build`, the deploy target, and a pointer to the locked spec + the three design tickets. `PROGRESS.md` — the spec §9 build log: Phases 0–4 checked off with one line each, plus a "Next: Phase 5 — sandpile, then network (spec §5)" line and any constant you changed in Task 5 with the reason.

- [ ] **Step 7: Full verification**

```bash
npm test
npm run build
npm run preview
```
Expected: all tests pass; build clean; `preview` serves `/`, `/forest-fire`, `/synthesis` — visit all three in the browser and confirm they behave exactly as in dev (this is the real artifact).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: hardening pass — a11y, reduced motion, responsive, perf, OG, docs

Keyboard-only walkthrough, reduced-motion emulation, 390/768 viewports, a
performance trace across a full sweep, static OG image, README + PROGRESS.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Ship (Phase 4)

**⚠️ Gate: push and deploy require Dustin's explicit go.** Commits are pre-authorised; publishing is not. Present the local build first, then ask.

**Files:** none (infrastructure).

- [ ] **Step 1: Ask for the go**

Show Dustin the three routes running locally (links + what to look at), then ask for the go on: create the GitHub repo, push, create the Vercel project, add the DNS record.

- [ ] **Step 2: Create the repo and push**

```bash
cd "C:/Users/dusti/Projects/Cascade"
git log --oneline | head -20     # sanity: the whole slice is committed
```
Create `github.com/dustincole-data/Cascade` (public, `main`) via the GitHub API using the cached PAT (`git credential fill`, host `github.com`), then:
```bash
git remote add origin https://github.com/dustincole-data/Cascade.git
git push -u origin main
```

- [ ] **Step 3: Vercel project**

New Vercel project from the GitHub repo. **Node 22.** Framework preset: Astro. Build `npm run build`, output `dist`. 100% static — no serverless functions, no edge config. Deploy and open the preview URL.

- [ ] **Step 4: Domain**

Add `cascade.dustincoledata.com` to the Vercel project; add the CNAME `cascade` → Vercel at the DNS provider. If the certificate stalls, remove and re-add the domain via the Vercel API (the Where America Moves fix).

- [ ] **Step 5: Live verification**

On `https://cascade.dustincoledata.com`, in a real browser: the landing renders; `/forest-fire` runs the full on-ramp from a clean localStorage and releases to the sandbox; `/synthesis` renders and the marker drag works; the OG image resolves; no console errors; fonts load from the origin (no CDN requests).

- [ ] **Step 6: Record and hand off**

Update `PROGRESS.md` (Phase 4 shipped, live URL, date). Note for a later dustincoledata session: **add the Cascade `<ProjectCard external>` to `/projects`** (spec §7 — out of scope for this repo).

```bash
git add -A
git commit -m "$(cat <<'EOF'
docs: Phase 4 shipped — cascade.dustincoledata.com live

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Out of scope (spec §9 Phase 5, deliberately not in this plan)

Sandpile and network exhibits, the 3-up coda board layout, the `/forest-fire → /synthesis` arrival routing, and the dustincoledata `/projects` card. Each graduates onto the shell this plan proves. The forest-fire slice ships complete without them.
