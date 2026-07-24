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
    const EPS = 1e-9; // the top density lands on 0.8600000000000001 in float
    for (const [d, f] of c.scatter) {
      expect(d).toBeGreaterThanOrEqual(0.3 - EPS);
      expect(d).toBeLessThanOrEqual(0.86 + EPS);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });

  it('is a sigmoid: low on the left, high on the right', () => {
    expect(c.mean[0]!).toBeLessThan(0.1);
    expect(c.mean.at(-1)!).toBeGreaterThan(0.9);
  });

  it('has its steepest rise at the percolation threshold', () => {
    let steepest = 0;
    let at = 0;
    for (let i = 1; i < c.mean.length; i++) {
      const slope = (c.mean[i]! - c.mean[i - 1]!) / (c.densities[i]! - c.densities[i - 1]!);
      if (slope > steepest) {
        steepest = slope;
        at = (c.densities[i]! + c.densities[i - 1]!) / 2;
      }
    }
    expect(at).toBeGreaterThan(D_C - 0.06);
    expect(at).toBeLessThan(D_C + 0.06);
  });
});
