/**
 * Bakes the canonical BTW survival curve to static JSON — the exhibit's faint
 * backbone AND the coda's panel-2 hero line read this one artifact (ticket 06:
 * one dataset, two configs). Deterministic: re-running produces an identical
 * file. Run: npm run bake:sandpile
 *
 * Measured on the same 64² field the exhibit plays on, so the user's own points
 * land on the law rather than beside it.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARGE_GRAINS, PILE, charge, createPile, drop, fitTau, slope, survival } from '../src/lib/sandpile.ts';

const DROPS = 500_000;
/** Fit the exponent over the scaling region only — past this the finite 64²
 *  field cuts the tail off, which is real physics but not the power law. */
const TAU_WINDOW = 300;
/** How many curve points ship. ~140 log-spaced is smooth at every plot width. */
const POINTS = 140;

const p = createPile(0x0ca5cade, PILE.W, PILE.H);
charge(p, CHARGE_GRAINS);
const chargedSlope = slope(p);

const areas: number[] = [];
for (let k = 0; k < DROPS; k++) {
  const a = drop(p, p.next());
  if (a.cells > 0) areas.push(a.cells);
}

const full = survival(areas);
const maxArea = full[full.length - 1]![0];

// Log-space downsample: walk targets across the decades and take the nearest
// observed point, keeping the ends exactly.
const lo = Math.log10(full[0]![0]);
const hi = Math.log10(maxArea);
const keep = new Set<number>([0, full.length - 1]);
for (let k = 0; k < POINTS; k++) {
  const target = 10 ** (lo + ((hi - lo) * k) / (POINTS - 1));
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < full.length; i++) {
    const d = Math.abs(Math.log10(full[i]![0]) - Math.log10(target));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  keep.add(best);
}
const pts = [...keep].sort((a, b) => a - b).map((i) => full[i]!);

// Fit on the log-spaced points, i.e. on the line as drawn — equal weight per
// decade. Fitting every distinct size instead over-weights the crowded upper
// decade and reports a steeper exponent than the curve visibly has.
const tau = fitTau(pts.filter(([s]) => s <= TAU_WINDOW));

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/sandpile-survival.json');
const payload = {
  /** Avalanche area (distinct cells toppled), ascending. */
  sizes: pts.map(([s]) => s),
  /** P(area ≥ size) over ALL drops — so the coda can say "1 in N drops". */
  p: pts.map(([, c]) => Number((c / DROPS).toPrecision(6))),
  drops: DROPS,
  avalanches: areas.length,
  /** The exhibit's backbone is this law scaled to a nominal drop count, so the
   *  user's raw counts land on it rather than under it. */
  nominal: 300,
  meta: {
    tau: Number(tau.toFixed(2)),
    tauWindow: TAU_WINDOW,
    grid: PILE.W,
    maxArea,
    chargeGrains: CHARGE_GRAINS,
    chargedSlope: Number(chargedSlope.toFixed(3)),
    method: `Bak–Tang–Wiesenfeld sandpile, ${PILE.W}² field, ${CHARGE_GRAINS} grains to criticality then ${DROPS} recorded drops; survival = P(area ≥ s) over all drops`,
    // The far tail steepens because a 64² table runs out of cells, not because
    // avalanches have a typical size — so the source line states the field.
    source: `Bak–Tang–Wiesenfeld 1987 · ${PILE.W}² field · τ ≈ 1.1–1.3 (approx.)`,
  },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload) + '\n');
console.log(
  `baked ${payload.sizes.length} points · ${areas.length} avalanches in ${DROPS} drops · ` +
    `slope ${chargedSlope.toFixed(3)} · max area ${maxArea} · τ ≈ ${payload.meta.tau} (s ≤ ${TAU_WINDOW}) → ${out}`,
);
