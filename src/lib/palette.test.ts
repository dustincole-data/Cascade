import { describe, it, expect } from 'vitest';
import { lerpStops, fireColor, FIRE, TEAL, SCAR, rgbStr } from './palette';

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

  it('rgbStr formats integers', () => {
    expect(rgbStr([255.7, 0.2, 61.9])).toBe('rgb(255,0,61)');
  });
});
