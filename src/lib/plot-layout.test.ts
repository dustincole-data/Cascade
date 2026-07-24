import { describe, it, expect } from 'vitest';
import {
  SP_X,
  SP_Y_CODA,
  codaHeight,
  codaMargins,
  codaWidth,
  makeFrame,
  oneIn,
  scatterStride,
  spDomain,
  survivalPath,
} from './plot-layout';

describe('the widening board (ticket 06, fork 5)', () => {
  it('takes the slot it lands in, hero scale at the top end', () => {
    expect(codaWidth(560)).toBe(560); // 2-up board
    expect(codaWidth(860)).toBe(860); // solo / stacked hero
    expect(codaWidth(1400)).toBe(860); // never wider than hero
    expect(codaWidth(220)).toBe(300); // phone floor
  });

  it('keeps panel 1 at its shipped hero proportions', () => {
    expect(codaHeight(860)).toBe(499);
    expect(codaHeight(560)).toBe(325);
    expect(codaHeight(300)).toBe(300);
  });

  it('gives narrow plots tighter margins so the plot area survives', () => {
    expect(codaMargins(340).l).toBeLessThan(codaMargins(860).l);
  });

  it('thins then drops the honest scatter as the plot narrows (D10)', () => {
    expect(scatterStride(860)).toBe(1);
    expect(scatterStride(560)).toBe(2);
    expect(scatterStride(360)).toBe(0);
  });
});

describe('log-log frame', () => {
  const f = makeFrame(560, 325, codaMargins(560), spDomain('coda'));

  it('puts one cell at the left edge and the whole field at the right', () => {
    expect(f.x.px(SP_X.min)).toBeCloseTo(f.m.l, 6);
    expect(f.x.px(SP_X.max)).toBeCloseTo(f.m.l + f.pw, 6);
  });

  it('puts the commonest outcome at the top and the rarest at the bottom', () => {
    expect(f.y.px(SP_Y_CODA.max)).toBeCloseTo(f.m.t, 6);
    expect(f.y.px(SP_Y_CODA.min)).toBeCloseTo(f.m.t + f.ph, 6);
  });

  it('spaces the decades evenly', () => {
    expect(f.x.px(100) - f.x.px(10)).toBeCloseTo(f.x.px(10) - f.x.px(1), 6);
  });
});

describe('survivalPath', () => {
  const f = makeFrame(560, 325, codaMargins(560), spDomain('coda'));

  it('draws the visible run and exits on the bottom edge, not at the last point', () => {
    const sizes = [1, 10, 100, 1000, 2000];
    const ys = [0.4, 0.28, 0.15, 0.02, 1e-5];
    const d = survivalPath(sizes, ys, f, SP_Y_CODA.min);
    const pts = d.split(/[ML]/).filter(Boolean);
    expect(pts.length).toBe(5); // four in-domain points + the edge crossing
    const lastY = Number(pts[pts.length - 1]!.split(',')[1]);
    expect(lastY).toBeCloseTo(f.m.t + f.ph, 4);
    // …and it exits between the two straddling sizes, not beyond them
    const lastX = Number(pts[pts.length - 1]!.split(',')[0]);
    expect(lastX).toBeGreaterThan(f.x.px(1000));
    expect(lastX).toBeLessThan(f.x.px(2000));
  });

  it('draws every point when the whole series is in the domain', () => {
    const d = survivalPath([1, 10, 100], [1, 0.1, 0.01], f, SP_Y_CODA.min);
    expect(d.split(/[ML]/).filter(Boolean).length).toBe(3);
    expect(d.startsWith('M')).toBe(true);
  });
});

describe('rarity in counting words (ticket 06, fork 2)', () => {
  it('speaks 1 in N, never a negative exponent', () => {
    expect(oneIn(0.4)).toBe(3);
    expect(oneIn(0.025)).toBe(40);
    expect(oneIn(0.9)).toBe(1);
  });
});
