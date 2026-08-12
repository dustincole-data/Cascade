import { describe, it, expect } from 'vitest';
import {
  lerpStops,
  fireColor,
  heightColor,
  sandColor,
  reliefShade,
  grainJitter,
  luminance,
  FIRE,
  TEAL,
  SCAR,
  FLOOR,
  rgbStr,
  type RGB,
} from './palette';

describe('palette ramps', () => {
  it('anchors the fire ramp on the locked hexes', () => {
    expect(fireColor(0).map(Math.round)).toEqual([255, 241, 194]); // #fff1c2 hot core
    expect(fireColor(1).map(Math.round)).toEqual([224, 71, 158]); // #e0479e magenta tail
  });

  it('interpolates between stops', () => {
    const mid = lerpStops(FIRE, 0.42).map(Math.round); // #ff8a3d stop
    expect(mid).toEqual([255, 138, 61]);
  });

  it('clamps outside [0,1]', () => {
    expect(lerpStops(TEAL, -3)).toEqual(lerpStops(TEAL, 0));
    expect(lerpStops(TEAL, 9)).toEqual(lerpStops(TEAL, 1));
  });

  it('the fire ramp gets darker as it ages — luminance carries state too', () => {
    const lum = (c: number[]) => 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    expect(lum(fireColor(0))).toBeGreaterThan(lum(fireColor(1)));
  });

  /* Was "the scar is near-black" (max channel < 60). That is the property that
     made a small burn invisible: on a lattice that is mostly empty, a near-black
     scar and the near-black stage showing through a clearing were the same
     colour, so beat 1's spark-that-goes-nowhere read as a page that does nothing.
     What the scar actually has to be is *separable* — clearly above the stage and
     the forest floor, clearly below the fire that made it. */
  it('the scar reads against the stage it sits on', () => {
    const STAGE: RGB = [0x0a, 0x0c, 0x10];
    expect(luminance(SCAR)).toBeGreaterThan(luminance(STAGE) + 0.16);
    expect(luminance(SCAR)).toBeGreaterThan(luminance(FLOOR) + 0.14);
  });

  it('the scar is spent — never brighter than the fire that made it', () => {
    expect(luminance(SCAR)).toBeLessThan(luminance(fireColor(1)));
  });

  it('the scar is neutral: ash is the one thing neither alive nor burning', () => {
    const [r, g, b] = SCAR;
    expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThan(30);
  });

  it('the sandpile height ramp runs cool→warm with monotone luminance (CVD-safe)', () => {
    const lums = [0, 1, 2, 3].map((h) => luminance(heightColor(h)));
    for (let i = 1; i < lums.length; i++) expect(lums[i]!).toBeGreaterThan(lums[i - 1]!);
    expect(heightColor(3).map(Math.round)).toEqual([255, 209, 102]); // #ffd166 — one grain from toppling
    const empty = heightColor(0);
    expect(empty[0]).toBeLessThan(empty[1]!); // still on the cool pole
  });

  it('the sand ramp is monotone in luminance (CVD-safe, same rule as FIRE)', () => {
    const lums = [0, 1, 2, 3].map((h) => luminance(sandColor(h)));
    for (let i = 1; i < lums.length; i++) expect(lums[i]!).toBeGreaterThan(lums[i - 1]!);
  });

  it('sand is warm at every height — it never wears the forest’s colour', () => {
    for (const h of [0, 1, 2, 3]) {
      const [r, , b] = sandColor(h);
      expect(r).toBeGreaterThan(b);
    }
  });

  /* The point of the ramp: 0→2 hold one band so the table reads as one material,
     and height 3 — one grain from toppling — is the thing that stands out. */
  it('spends its contrast on the cells that are about to go', () => {
    const step = (a: number, b: number) => luminance(sandColor(b)) - luminance(sandColor(a));
    expect(step(2, 3)).toBeGreaterThan(step(0, 1) + step(1, 2));
  });

  it('relief lights a rise and shades a dip, and stays bounded', () => {
    expect(reliefShade(3, 0, 0)).toBeGreaterThan(1);
    expect(reliefShade(0, 3, 3)).toBeLessThan(1);
    expect(reliefShade(2, 2, 2)).toBe(1);
    for (const [h, l, u] of [
      [3, 0, 0],
      [0, 3, 3],
      [3, 3, 0],
    ] as const) {
      expect(reliefShade(h, l, u)).toBeGreaterThanOrEqual(0.78);
      expect(reliefShade(h, l, u)).toBeLessThanOrEqual(1.2);
    }
  });

  it('grain is stable per cell and stays a few percent', () => {
    expect(grainJitter(1234)).toBe(grainJitter(1234));
    const vs = Array.from({ length: 400 }, (_, i) => grainJitter(i));
    expect(Math.min(...vs)).toBeGreaterThanOrEqual(0.955);
    expect(Math.max(...vs)).toBeLessThanOrEqual(1.045);
    expect(new Set(vs).size).toBeGreaterThan(100); // actually varies, not a constant
  });

  it('rgbStr formats integers', () => {
    expect(rgbStr([255.7, 0.2, 61.9])).toBe('rgb(255,0,61)');
  });
});
