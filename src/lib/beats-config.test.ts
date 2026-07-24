import { describe, it, expect } from 'vitest';
import { BEATS } from './beats-config';
import { D_C } from './forest-fire';

describe('on-ramp beats (ticket 02)', () => {
  it('is exactly three beats — beat 2 is the trap that makes beat 3 land', () => {
    expect(BEATS.map((b) => b.n)).toEqual([1, 2, 3]);
  });

  it('teaches spark first, then density (one verb at a time)', () => {
    expect(BEATS[0]!.spotlight).toBe('stage');
    expect(BEATS[1]!.spotlight).toBe('density');
    expect(BEATS[2]!.spotlight).toBe('density');
  });

  it('presets the locked densities: sparse, the trap, then poised below the knee', () => {
    expect(BEATS[0]!.presetD).toBeCloseTo(0.4, 5);
    expect(BEATS[1]!.presetD).toBeCloseTo(0.4, 5);
    expect(BEATS[2]!.presetD).toBeCloseTo(0.52, 5);
  });

  it('beat 1 completes only when a spark has finished burning', () => {
    const g = BEATS[0]!.done;
    expect(g({ d: 0.4, sparked: false, burnComplete: false, crossed: false })).toBe(false);
    expect(g({ d: 0.4, sparked: true, burnComplete: false, crossed: false })).toBe(false);
    expect(g({ d: 0.4, sparked: true, burnComplete: true, crossed: false })).toBe(true);
  });

  it('beat 2 completes when density reaches the 0.52 band', () => {
    const g = BEATS[1]!.done;
    expect(g({ d: 0.5, sparked: true, burnComplete: true, crossed: false })).toBe(false);
    expect(g({ d: 0.52, sparked: true, burnComplete: true, crossed: false })).toBe(true);
  });

  it('beat 3 completes ONLY on crossing d_c — a near miss at 0.58 still fizzles', () => {
    const g = BEATS[2]!.done;
    expect(g({ d: 0.58, sparked: true, burnComplete: true, crossed: false })).toBe(false);
    expect(g({ d: D_C, sparked: true, burnComplete: true, crossed: true })).toBe(true);
  });

  it('uses no jargon — "threshold" is withheld for the coda', () => {
    const words = BEATS.map((b) => `${b.prompt} ${b.lesson}`).join(' ').toLowerCase();
    for (const jargon of ['threshold', 'percolation', 'critical', 'phase transition']) {
      expect(words).not.toContain(jargon);
    }
  });
});
