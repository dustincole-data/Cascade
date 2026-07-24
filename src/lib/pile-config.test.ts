import { describe, it, expect } from 'vitest';
import surv from '../data/sandpile-survival.json';
import { DRIFT_GATE, FEED_GATE, PILE_BEATS } from './pile-config';
import { CHARGE_GRAINS, CRITICAL_SLOPE, PILE } from './sandpile';

describe('sandpile on-ramp beats (ticket 05)', () => {
  it('is exactly three beats — beat 2 is the refusal that makes beat 3 land', () => {
    expect(PILE_BEATS.map((b) => b.n)).toEqual([1, 2, 3]);
  });

  it('teaches the stage first, hands over the feed for the trap, then goes back to one grain', () => {
    expect(PILE_BEATS.map((b) => b.spotlight)).toEqual(['stage', 'feed', 'stage']);
  });

  it('beat 1 carries the mid-line that makes the flood theirs', () => {
    expect(PILE_BEATS[0]!.mid).toContain('fifteen thousand');
    expect(PILE_BEATS[1]!.mid).toBeUndefined();
    // …and the copy's claim is the charge the engine actually pours.
    expect(CHARGE_GRAINS).toBe(15000);
  });

  it('beat 1 completes only once the dial has parked', () => {
    const g = PILE_BEATS[0]!.done;
    expect(g({ charged: false, fed: 0, drift: 0, ringDropped: false })).toBe(false);
    expect(g({ charged: true, fed: 0, drift: 0, ringDropped: false })).toBe(true);
  });

  it('beat 2 needs thousands of grains AND a slope that refused to move', () => {
    const g = PILE_BEATS[1]!.done;
    const s = (fed: number, drift: number) => ({ charged: true, fed, drift, ringDropped: false });
    expect(g(s(FEED_GATE - 1, 0))).toBe(false); // not enough poured yet
    expect(g(s(FEED_GATE, DRIFT_GATE))).toBe(false); // it moved ⇒ the beat is not true
    expect(g(s(FEED_GATE, 0.01))).toBe(true);
  });

  it('beat 3 completes only on the ring cell — an off-ring drop is a near miss', () => {
    const g = PILE_BEATS[2]!.done;
    expect(g({ charged: true, fed: 9e9, drift: 0, ringDropped: false })).toBe(false);
    expect(g({ charged: true, fed: 9e9, drift: 0, ringDropped: true })).toBe(true);
  });

  it('uses no jargon, and leaves "nobody set the dial" unspent for the coda', () => {
    const words = PILE_BEATS.map((b) => `${b.prompt} ${b.mid ?? ''} ${b.lesson}`)
      .join(' ')
      .toLowerCase();
    for (const jargon of ['criticality', 'critical', 'power law', 'self-organi', 'avalanche', 'exponent']) {
      expect(words).not.toContain(jargon);
    }
    expect(words).not.toContain('nobody set the dial');
  });
});

describe('the baked survival law (ticket 04 backbone + ticket 06 panel 2)', () => {
  it('is a real charged run: the pile parked at its own edge', () => {
    expect(surv.meta.chargedSlope).toBeGreaterThan(2.0);
    expect(surv.meta.chargedSlope).toBeLessThan(CRITICAL_SLOPE + 0.05);
    expect(surv.meta.chargeGrains).toBe(CHARGE_GRAINS);
    expect(surv.meta.grid).toBe(PILE.W);
  });

  it('is a survival curve: sizes ascending, probabilities falling, none impossible', () => {
    for (let i = 1; i < surv.sizes.length; i++) {
      expect(surv.sizes[i]!).toBeGreaterThan(surv.sizes[i - 1]!);
      expect(surv.p[i]!).toBeLessThanOrEqual(surv.p[i - 1]!);
    }
    expect(surv.p[0]!).toBeLessThanOrEqual(1);
    expect(surv.p[surv.p.length - 1]!).toBeGreaterThan(0);
    expect(surv.sizes[surv.sizes.length - 1]!).toBeLessThanOrEqual(PILE.W * PILE.H);
  });

  it('spans the decades panel 2 claims: three orders of rarity with no gap', () => {
    const first = 1 / surv.p[0]!;
    const last = 1 / surv.p[surv.p.length - 1]!;
    expect(last / first).toBeGreaterThan(1000);
  });

  it('measures an exponent inside the exponent the source line cites', () => {
    // The annotation prints this number, so it must not drift out of the range
    // "τ ≈ 1.1–1.3 (approx.)" that sits beneath the plot.
    expect(surv.meta.tau).toBeGreaterThanOrEqual(1.1);
    expect(surv.meta.tau).toBeLessThanOrEqual(1.3);
  });
});
