/**
 * Bakes the network's ranked profiles to static JSON — one profile per `slack`
 * stop, so nothing is ever computed at runtime (🔒 ticket 07, D3). The exhibit's
 * faint backbone AND the coda's needle field read this one artifact.
 *
 * Deterministic: the graph comes from a fixed seed and every cascade is a pure
 * function of (graph, α, node), so re-running produces an identical file — and
 * the cascade the user triggers live agrees with its own baked value by
 * construction. Run: npm run bake:network
 *
 * It also prints the two facts the on-ramp's honesty depends on: the **hub must
 * be absorbed** (beat 2 hands the user the fattest dot and the grid shrugs) and
 * the ring node must be **ordinary-looking** (beat 3's claim is that nothing
 * about it looks different). If either fails, the design is broken, not the copy.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_SLACK,
  DIAGONAL,
  GRID,
  NET_SEED,
  NODES,
  REWIRE,
  SLACK_STOPS,
  createGrid,
  hubNode,
  lethalCount,
  pickRing,
  profile,
} from '../src/lib/network.ts';

const g = createGrid(NET_SEED);
const hub = hubNode(g);
const degs = [...g.deg].sort((a, b) => a - b);
const median = degs[degs.length >> 1]!;

const perNode = SLACK_STOPS.map((a) => profile(g, a).map((v) => Number(v.toFixed(6))));
const di = SLACK_STOPS.indexOf(DEFAULT_SLACK as (typeof SLACK_STOPS)[number]);
const def = perNode[di]!;
const ring = pickRing(g, def);

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/network-profile.json');
const payload = {
  seed: NET_SEED,
  nodes: NODES,
  alphas: [...SLACK_STOPS],
  defaultAlpha: DEFAULT_SLACK,
  /** Fraction of the grid left without power, per node, in NODE order — the coda's
   *  needle field. The exhibit sorts it descending for its ranked cliff. */
  perNode,
  meta: {
    cols: GRID.COLS,
    rows: GRID.ROWS,
    rewire: REWIRE,
    diagonal: DIAGONAL,
    edges: g.edges.length,
    hub,
    hubDegree: g.deg[hub],
    hubFrac: def[hub],
    medianDegree: median,
    ring,
    ringDegree: g.deg[ring],
    ringFrac: def[ring],
    lethal: perNode.map((p) => lethalCount(p)),
    method: `Motter–Lai cascade (load = betweenness + 1, capacity = load₀ × (1 + α)) on a ${GRID.COLS}×${GRID.ROWS} Watts–Strogatz grid, ${Math.round(REWIRE * 100)}% of lattice edges rewired long; one node taken offline per trial, flow re-routed to a fixed point, then anything cut off from the bulk counted dark`,
    source: `Motter–Lai 2002 · small-world grid (Watts–Strogatz 1998) · ${NODES} nodes`,
  },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload) + '\n');

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
console.log(`graph: ${NODES} nodes · ${g.edges.length} edges · degrees ${degs[0]}–${degs[degs.length - 1]} (median ${median})`);
SLACK_STOPS.forEach((a, i) => {
  const p = perNode[i]!;
  const max = Math.max(...p);
  console.log(
    `  α ${a.toFixed(2)} → lethal(>50%) ${String(lethalCount(p)).padStart(3)} · worst ${pct(max)} · median node ${pct([...p].sort((x, y) => x - y)[NODES >> 1]!)}`,
  );
});
console.log(
  `hub  node ${hub} · degree ${g.deg[hub]} → ${pct(def[hub]!)}  ${def[hub]! < 0.05 ? '✓ absorbed (beat 2 honest)' : '✗ BEAT 2 IS A LIE — retune'}`,
);
console.log(
  `ring node ${ring} · degree ${g.deg[ring]} (median ${median}) → ${pct(def[ring]!)}  ${
    g.deg[ring]! <= median && def[ring]! >= 0.5 ? '✓ ordinary and catastrophic' : '✗ retune'
  }`,
);
console.log(`→ ${out}`);
