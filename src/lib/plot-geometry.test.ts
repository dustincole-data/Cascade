import { describe, it, expect } from 'vitest';
import { makeScale, nearestIndex, valueAt, type PlotBox } from './plot-geometry';

const box: PlotBox = { w: 400, h: 300, m: { l: 44, r: 20, t: 26, b: 38 } };
const s = makeScale(box, 0.3, 0.86);

describe('makeScale', () => {
  it('maps the density domain onto the plot width', () => {
    expect(s.x(0.3)).toBeCloseTo(44, 5);
    expect(s.x(0.86)).toBeCloseTo(380, 5);
    expect(s.x(0.58)).toBeCloseTo(212, 5);
  });

  it('maps fraction 0 to the bottom and 1 to the top (y is inverted)', () => {
    expect(s.y(1)).toBeCloseTo(26, 5);
    expect(s.y(0)).toBeCloseTo(262, 5);
  });

  it('invX round-trips x', () => {
    for (const d of [0.31, 0.45, 0.5927, 0.8]) expect(s.invX(s.x(d))).toBeCloseTo(d, 6);
  });

  it('clamps invX to the domain', () => {
    expect(s.invX(-500)).toBeCloseTo(0.3, 6);
    expect(s.invX(5000)).toBeCloseTo(0.86, 6);
  });
});

describe('lookups', () => {
  const densities = [0.3, 0.4, 0.5, 0.6, 0.7];
  const values = [0.01, 0.03, 0.09, 0.62, 0.93];

  it('nearestIndex picks the closest density', () => {
    expect(nearestIndex(densities, 0.29)).toBe(0);
    expect(nearestIndex(densities, 0.58)).toBe(3);
    expect(nearestIndex(densities, 0.99)).toBe(4);
  });

  it('valueAt reads the curve at the nearest density', () => {
    expect(valueAt(densities, values, 0.61)).toBe(0.62);
  });
});
