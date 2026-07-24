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
