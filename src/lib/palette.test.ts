import { describe, it, expect } from 'vitest';
import { lerpStops, fireColor, heightColor, luminance, FIRE, TEAL, SCAR, rgbStr } from './palette';

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

  it('the scar is near-black', () => {
    expect(Math.max(...SCAR)).toBeLessThan(60);
  });

  it('the sandpile height ramp runs cool→warm with monotone luminance (CVD-safe)', () => {
    const lums = [0, 1, 2, 3].map((h) => luminance(heightColor(h)));
    for (let i = 1; i < lums.length; i++) expect(lums[i]!).toBeGreaterThan(lums[i - 1]!);
    expect(heightColor(3).map(Math.round)).toEqual([255, 209, 102]); // #ffd166 — one grain from toppling
    const empty = heightColor(0);
    expect(empty[0]).toBeLessThan(empty[1]!); // still on the cool pole
  });

  it('rgbStr formats integers', () => {
    expect(rgbStr([255.7, 0.2, 61.9])).toBe('rgb(255,0,61)');
  });
});
