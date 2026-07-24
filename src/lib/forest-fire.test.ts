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
      if (r.ig[i]! >= 0) expect(isTree(F, i, 0.62)).toBe(true);
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
        if (ig[i]! < 0) continue;
        for (const j of [x > 0 ? i - 1 : -1, x < F.W - 1 ? i + 1 : -1, y > 0 ? i - F.W : -1, y < F.H - 1 ? i + F.W : -1]) {
          if (j >= 0 && ig[j]! >= 0) expect(Math.abs(ig[i]! - ig[j]!)).toBeLessThanOrEqual(1);
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
    for (let i = 0; i < F.W * F.H; i++)
      if (!isTree(F, i, 0.4)) {
        empty = i;
        break;
      }
    const r = burn(F, 0.4, empty);
    expect(r.burned).toBe(0);
    expect(r.frac).toBe(0);
    expect(r.spark).toBe(-1);
  });
});

describe('nearestTree', () => {
  it('returns the tapped cell when it is already a tree', () => {
    let t = -1;
    for (let i = 0; i < F.W * F.H; i++)
      if (isTree(F, i, 0.4)) {
        t = i;
        break;
      }
    expect(nearestTree(F, 0.4, t % F.W, Math.floor(t / F.W))).toBe(t);
  });

  it('snaps an empty tap to a nearby tree (ticket 02, decision 4)', () => {
    let e = -1;
    for (let i = 0; i < F.W * F.H; i++)
      if (!isTree(F, i, 0.4)) {
        e = i;
        break;
      }
    const snapped = nearestTree(F, 0.4, e % F.W, Math.floor(e / F.W));
    expect(snapped).toBeGreaterThanOrEqual(0);
    expect(isTree(F, snapped, 0.4)).toBe(true);
  });

  it('returns -1 on an empty forest', () => {
    expect(nearestTree(F, 0, 10, 10)).toBe(-1);
  });
});
