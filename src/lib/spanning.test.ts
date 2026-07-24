import { describe, it, expect } from 'vitest';
import { buildField, burn, isTree, largestClusterMask, nearestTreeWhere, nearestTree } from './forest-fire';

const F = buildField(128, 82, 0x0ca5cade);

describe('largestClusterMask', () => {
  it('marks only trees, and marks the biggest connected component', () => {
    const mask = largestClusterMask(F, 0.62);
    let marked = 0;
    for (let i = 0; i < F.W * F.H; i++) {
      if (mask[i]) {
        expect(isTree(F, i, 0.62)).toBe(true);
        marked++;
      }
    }
    // Above d_c a spanning cluster exists and dominates the field.
    expect(marked).toBeGreaterThan(0.5 * F.W * F.H * 0.62);
  });

  it('is much smaller below d_c than above it', () => {
    const below = largestClusterMask(F, 0.45).reduce((n, v) => n + v, 0);
    const above = largestClusterMask(F, 0.7).reduce((n, v) => n + v, 0);
    expect(above).toBeGreaterThan(below * 10);
  });
});

describe('nearestTreeWhere', () => {
  it('picks a tree satisfying the predicate, so the on-ramp sweep is guaranteed', () => {
    const mask = largestClusterMask(F, 0.62);
    const picked = nearestTreeWhere(F, 0.4, 30, 40, (i) => mask[i] === 1);
    expect(picked).toBeGreaterThanOrEqual(0);
    expect(isTree(F, picked, 0.4)).toBe(true); // a tree already at the beat-1 density
    expect(mask[picked]).toBe(1); // and it joins the spanning cluster at 0.62

    // The promise the choreography makes: this same spark sweeps at 0.62.
    expect(burn(F, 0.62, picked).frac).toBeGreaterThan(0.5);
    // ...and fizzles at the beat-1 density.
    expect(burn(F, 0.4, picked).frac).toBeLessThan(0.05);
  });

  it('falls back to plain nearestTree behaviour with an always-true predicate', () => {
    expect(nearestTreeWhere(F, 0.4, 30, 40, () => true)).toBe(nearestTree(F, 0.4, 30, 40));
  });

  it('returns -1 when nothing satisfies the predicate', () => {
    expect(nearestTreeWhere(F, 0.4, 30, 40, () => false)).toBe(-1);
  });
});
