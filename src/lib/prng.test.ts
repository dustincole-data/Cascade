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
