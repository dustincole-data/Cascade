# Cascade

An explorable explanation about one idea: **how one small action can have enormous consequences.**

The plan is three exhibits — threshold, criticality, cascade — sharing one engine and one visual shell. This repo currently ships the first one end-to-end: a **forest fire**. Below a certain tree density a spark fizzles out; a hair past it, *the same spark* takes the whole forest. You drive the simulation yourself, and the plot beside it is built from your own runs.

Everything is computed in your browser. No dataset, no server, no tracking.

## Routes

| Route | What it is |
|---|---|
| `/` | The thesis and the door into exhibit 1 |
| `/forest-fire` | A 3-beat guided on-ramp, then a free sandbox, with the live signature plot |
| `/synthesis` | The coda: the same plot at hero scale, naming what you just felt — *threshold* |

## Running it

```bash
npm install
npm run dev       # dev server
npm test          # vitest — the simulation core is pure and tested
npm run build     # static output to dist/
npm run preview   # serve the built output
npm run bake      # regenerate src/data/percolation-curve.json (deterministic)
```

Node 22+. The baked curve is committed, so `bake` is only needed if the Monte-Carlo parameters change.

## How it works

- **The model** (`src/lib/forest-fire.ts`) is a site-percolation lattice. Every cell holds a frozen random threshold `r_i`; it is a tree iff `r_i < d`. Raising density therefore only ever *adds* trees, never moves them — which is what makes "one more tree, same spark" literally true on screen. Fire spreads to 4-neighbours (von Neumann) via BFS, recording an ignition tick per cell.
- **The threshold** is the real one: `d_c ≈ 0.5927`, site percolation on a 2D square lattice.
- **The plot** is real Monte-Carlo data — 16 trials × 46 densities on a 64² lattice (`src/lib/percolation.ts`), baked at build time. In the exhibit, your own completed trials drop onto it as you play.
- **The stage** (`src/scripts/stage.ts`) is canvas 2D. Each frame blits a cached background and repaints only the moving burning front, so a full sweep holds 60fps (measured: median 16.7 ms/frame).
- **The plot** is SVG, server-rendered. The coda therefore works with JavaScript disabled — the marker you can drag is pure enhancement.

Everything seeded is deterministic: a given (seed, density, spark) reproduces exactly.

## Design

The look, the on-ramp choreography, and the coda are locked design decisions, not improvisation. The reference artefacts live in the repo:

- Locked spec — [`.claude/plans/2026-07-23-cascade-design.md`](.claude/plans/2026-07-23-cascade-design.md)
- Build plan — [`.claude/plans/2026-07-24-cascade-forest-fire-build.md`](.claude/plans/2026-07-24-cascade-forest-fire-build.md)
- Hero look reference — [`.scratch/cascade/assets/01-forest-fire-look.html`](.scratch/cascade/assets/01-forest-fire-look.html)
- On-ramp choreography — [`.scratch/cascade/issues/02-on-ramp-choreography.md`](.scratch/cascade/issues/02-on-ramp-choreography.md)
- Synthesis coda — [`.scratch/cascade/issues/03-synthesis-coda-first-panel.md`](.scratch/cascade/issues/03-synthesis-coda-first-panel.md)

## Deploy

Static output, its own Vercel project, Node 22, no serverless functions. Target: `cascade.dustincoledata.com`.
