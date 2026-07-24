import { describe, it, expect } from 'vitest';
import {
  CHARGE_GRAINS,
  CRITICAL_SLOPE,
  charge,
  createPile,
  drop,
  pickRing,
  previewCells,
  slope,
  survival,
} from './sandpile';

describe('the topple rule', () => {
  it('a grain on a cell below threshold just sits there', () => {
    const p = createPile(1, 8, 8);
    const a = drop(p, 27);
    expect(a.cells).toBe(0);
    expect(a.topples).toBe(0);
    expect(p.h[27]).toBe(1);
    expect(p.resident).toBe(1);
  });

  it('the fourth grain topples one to each von-Neumann neighbour', () => {
    const p = createPile(1, 8, 8);
    for (let k = 0; k < 3; k++) drop(p, 27);
    const a = drop(p, 27);
    expect(a.topples).toBe(1);
    expect(a.cells).toBe(1);
    expect(p.h[27]).toBe(0);
    for (const n of [26, 28, 19, 35]) expect(p.h[n]).toBe(1);
  });

  it('conserves grains in the interior — 4 out, 4 in', () => {
    const p = createPile(1, 8, 8);
    for (let k = 0; k < 4; k++) drop(p, 27);
    expect(p.resident).toBe(4);
  });

  it('loses grains off the edge — that dissipation is why the pile settles', () => {
    const p = createPile(1, 8, 8);
    for (let k = 0; k < 4; k++) drop(p, 0); // corner: two of the four grains leave
    expect(p.resident).toBe(2);
    expect(p.h[1]).toBe(1);
    expect(p.h[8]).toBe(1);
  });

  it('leaves every cell stable (0–3) once the avalanche resolves', () => {
    const p = createPile(7, 16, 16);
    charge(p, 4000);
    for (let i = 0; i < p.h.length; i++) expect(p.h[i]).toBeLessThan(4);
  });

  it('records the front tick by tick, starting at the dropped cell', () => {
    const p = createPile(9, 16, 16);
    charge(p, 3000);
    let big = { cells: 0, buckets: [] as number[][], maxTick: 0 };
    for (let k = 0; k < 400 && big.cells < 12; k++) big = drop(p, p.next());
    expect(big.cells).toBeGreaterThan(11);
    expect(big.buckets[0]!.length).toBe(1); // the avalanche starts at one cell
    expect(big.maxTick).toBe(big.buckets.length - 1);
    expect(big.buckets.reduce((n, b) => n + b.length, 0)).toBe(big.topples);
    expect(big.topples).toBeGreaterThanOrEqual(big.cells); // a cell may topple twice
  });
});

describe('determinism (spec §7 — same seed, same pile)', () => {
  it('two piles charged from the same seed are byte-identical', () => {
    const a = createPile(0x0ca5cade, 32, 32);
    const b = createPile(0x0ca5cade, 32, 32);
    charge(a, 2000);
    charge(b, 2000);
    expect(Array.from(a.h)).toEqual(Array.from(b.h));
    expect(a.resident).toBe(b.resident);
  });

  it('a different seed builds a different pile', () => {
    const a = createPile(1, 32, 32);
    const b = createPile(2, 32, 32);
    charge(a, 2000);
    charge(b, 2000);
    expect(Array.from(a.h)).not.toEqual(Array.from(b.h));
  });
});

describe('self-organised criticality — nobody sets the dial (ticket 04)', () => {
  const p = createPile(0x0ca5cade);
  charge(p, CHARGE_GRAINS);

  it('walks to its own edge: the locked charge parks the slope at ≈2.1', () => {
    expect(slope(p)).toBeGreaterThan(2.0);
    expect(slope(p)).toBeLessThan(CRITICAL_SLOPE + 0.05);
  });

  it('parks there — 3,000 more grains cannot push it (beat 2 is not a lie)', () => {
    const before = slope(p);
    charge(p, 3000);
    expect(Math.abs(slope(p) - before)).toBeLessThan(0.02);
  });
});

describe('survival curve — the signature (ticket 04, fork 5)', () => {
  it('counts, for each observed size, how many runs were at least that big', () => {
    expect(survival([3, 1, 1, 7])).toEqual([
      [1, 4],
      [3, 2],
      [7, 1],
    ]);
  });

  it('is monotone non-increasing in count and spans decades on a real run', () => {
    const p = createPile(0x0ca5cade);
    charge(p, CHARGE_GRAINS);
    const sizes: number[] = [];
    for (let k = 0; k < 600; k++) {
      const a = drop(p, p.next());
      if (a.cells > 0) sizes.push(a.cells);
    }
    const s = survival(sizes);
    for (let i = 1; i < s.length; i++) {
      expect(s[i]![0]).toBeGreaterThan(s[i - 1]![0]);
      expect(s[i]![1]).toBeLessThanOrEqual(s[i - 1]![1]);
    }
    const biggest = s[s.length - 1]![0];
    expect(biggest / s[0]![0]).toBeGreaterThan(100); // no typical size: ≥2 decades
  });
});

describe('the ring cell (ticket 05, fork 4)', () => {
  const p = createPile(0x0ca5cade);
  charge(p, CHARGE_GRAINS);
  const ring = pickRing(p);

  it('finds a cell whose one grain takes a big share of the field', () => {
    expect(ring.cell).toBeGreaterThanOrEqual(0);
    expect(ring.cells).toBeGreaterThan(p.h.length * 0.15);
  });

  it('predicts the real avalanche — the monster is computed, never faked', () => {
    expect(drop(p, ring.cell).cells).toBe(ring.cells);
  });

  it('survives the user putting their own first grain down first (beat 1)', () => {
    const q = createPile(0x0ca5cade);
    drop(q, 40 * 64 + 21); // the user's tap, wherever it lands
    charge(q, CHARGE_GRAINS);
    const r = pickRing(q);
    expect(r.cells).toBeGreaterThan(q.h.length * 0.15);
    expect(drop(q, r.cell).cells).toBe(r.cells);
  });
});

describe('previewCells — the ring cell is found without disturbing the pile', () => {
  it('reports the avalanche a cell would produce and leaves the pile untouched', () => {
    const p = createPile(0x0ca5cade, 32, 32);
    charge(p, 4000);
    const before = Array.from(p.h);
    const resident = p.resident;
    const i = 32 * 16 + 16;
    const predicted = previewCells(p, i);
    expect(Array.from(p.h)).toEqual(before);
    expect(p.resident).toBe(resident);
    expect(drop(p, i).cells).toBe(predicted);
  });
});
