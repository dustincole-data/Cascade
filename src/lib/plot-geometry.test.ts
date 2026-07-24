import { describe, it, expect } from 'vitest';
import {
  decadeTicks,
  interpLog,
  linearAxis,
  logAxis,
  makeScale,
  nearestIndex,
  valueAt,
  type PlotBox,
} from './plot-geometry';

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

describe('log axes (spec §3.2 — the survival curve needs them on both axes)', () => {
  const ax = logAxis(1, 4096, 56, 800);

  it('puts each decade the same distance apart', () => {
    const d1 = ax.px(10) - ax.px(1);
    const d2 = ax.px(100) - ax.px(10);
    const d3 = ax.px(1000) - ax.px(100);
    expect(d2).toBeCloseTo(d1, 6);
    expect(d3).toBeCloseTo(d1, 6);
  });

  it('round-trips, and clamps to the domain', () => {
    for (const v of [1, 7, 137, 3999]) expect(ax.val(ax.px(v))).toBeCloseTo(v, 4);
    expect(ax.val(-1e4)).toBe(1);
    expect(ax.val(1e4)).toBe(4096);
  });

  it('a probability axis runs downward: common at the top, rare at the bottom', () => {
    const y = logAxis(1e-3, 1, 434, 34); // pixel at min, pixel at max
    expect(y.px(1)).toBeCloseTo(34, 6);
    expect(y.px(1e-3)).toBeCloseTo(434, 6);
    expect(y.px(0.01)).toBeCloseTo(300.667, 3);
  });

  it('ticks only on the powers of ten inside the domain', () => {
    expect(decadeTicks(1, 4096)).toEqual([1, 10, 100, 1000]);
    expect(decadeTicks(1e-3, 1)).toEqual([0.001, 0.01, 0.1, 1]);
  });

  it('linearAxis stays available for the fire plot', () => {
    const lin = linearAxis(0.3, 0.86, 0, 100);
    expect(lin.px(0.58)).toBeCloseTo(50, 6);
    expect(lin.val(50)).toBeCloseTo(0.58, 6);
  });
});

describe('interpLog — every coda number is read off the baked curve', () => {
  const xs = [1, 10, 100, 1000];
  const ys = [0.4, 0.28, 0.15, 0.02];

  it('interpolates a straight log-log segment exactly', () => {
    const g = [1, 10, 100];
    const h = [1, 0.1, 0.01]; // slope -1 in log space
    expect(interpLog(g, h, 10 ** 1.5)).toBeCloseTo(10 ** -1.5, 8);
  });

  it('hits the sample points and clamps beyond the ends', () => {
    expect(interpLog(xs, ys, 100)).toBeCloseTo(0.15, 8);
    expect(interpLog(xs, ys, 0.2)).toBe(0.4);
    expect(interpLog(xs, ys, 9e9)).toBe(0.02);
  });
});
