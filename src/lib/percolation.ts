// Explicit .ts extensions: Node's --experimental-strip-types (the bake script)
// needs them; Vite/Vitest resolve them identically.
import { buildField, burn, nearestTree } from './forest-fire.ts';

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
 * Defaults reproduce the locked look reference's curve.
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
