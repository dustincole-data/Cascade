import { mulberry32 } from './prng.ts';

/**
 * Bak–Tang–Wiesenfeld sandpile — the criticality rule-set (spec §5.1, 🔒 ticket 04).
 *
 * A cell holding ≥4 grains topples, sending one grain to each of its four
 * von-Neumann neighbours; a grain crossing the boundary leaves the system. Drop
 * grains one at a time and the pile walks to a critical mean height ≈2.1 and
 * parks there — nobody set the dial. At that edge one more grain can move
 * anything from nothing to a quarter of the field.
 *
 * **Avalanche size = AREA (distinct cells that toppled), not topple events.**
 * The ticket's illustrative "6,140" implies topple events, but every *locked*
 * quantity is an area: the readout's noun (`1 grain → N cells`), the annotation's
 * exponent (τ ≈ 1.1 is BTW's area exponent; the size exponent is ≈1.2–1.3), the
 * on-ramp's "a quarter of the field", and the coda's "≥ 900 cells". Area also
 * keeps the readout honest — a 64² field cannot move 6,140 cells. `topples` is
 * returned too; only the front animation uses it.
 */

export const PILE = { W: 64, H: 64 } as const;

/** A cell topples at four grains. */
export const THRESHOLD = 4;

/**
 * Grains the seeded charge pours in to walk an empty table to its own edge.
 * The on-ramp's locked copy says "here are fifteen thousand", and 15,000 is
 * also what it genuinely takes: ~8.7k stay resident at h̄≈2.1 and the rest
 * dissipate off the boundary during the transient (asserted in the tests).
 */
export const CHARGE_GRAINS = 15000;

/** BTW's critical mean height on a square lattice — where the dial parks. */
export const CRITICAL_SLOPE = 2.125;

export interface Pile {
  W: number;
  H: number;
  /** Grains per cell; 0–3 at rest. */
  h: Uint8Array;
  /** Grains dropped in, lifetime. */
  grains: number;
  /** Grains currently on the table (sum of `h`), tracked incrementally. */
  resident: number;
  seed: number;
  /** The seeded charge sequence. User drops never consume it, so the charge is a
   *  stable prefix of the stream: same seed ⇒ same charged pile, always. */
  next(): number;
  /** Scratch — queued-for-topple flags. Kept on the pile to avoid per-drop allocation. */
  q: Uint8Array;
  /** Scratch — toppled-this-avalanche flags. */
  t: Uint8Array;
}

export function createPile(seed: number, W: number = PILE.W, H: number = PILE.H): Pile {
  const N = W * H;
  const rnd = mulberry32(seed);
  return {
    W,
    H,
    h: new Uint8Array(N),
    grains: 0,
    resident: 0,
    seed,
    next: () => (rnd() * N) | 0,
    q: new Uint8Array(N),
    t: new Uint8Array(N),
  };
}

export interface Avalanche {
  /** Distinct cells that toppled — the avalanche's area, and what the UI counts. */
  cells: number;
  /** Total topple events; a cell can topple more than once in one avalanche. */
  topples: number;
  /** buckets[t] = cells toppling at tick t. Drives the O(front) repaint. */
  buckets: number[][];
  maxTick: number;
  /** Every cell whose height changed (toppled or received). The repaint set. May repeat. */
  dirty: number[];
}

/** The mean grains per cell — a true order parameter. This is the self-driving dial. */
export const slope = (p: Pile): number => p.resident / (p.W * p.H);

/**
 * Drop one grain at cell `i` and resolve the avalanche it triggers, recording the
 * front tick by tick so it can animate exactly like a burning front.
 */
export function drop(p: Pile, i: number): Avalanche {
  const { W, H, h, q, t } = p;
  h[i]!++;
  p.grains++;
  p.resident++;

  const dirty: number[] = [i];
  const buckets: number[][] = [];
  const toppled: number[] = [];
  let topples = 0;
  let frontier: number[] = [];
  let next: number[] = [];

  const give = (n: number) => {
    h[n]!++;
    dirty.push(n);
    if (h[n]! >= THRESHOLD && !q[n]) {
      q[n] = 1;
      next.push(n);
    }
  };

  if (h[i]! >= THRESHOLD) {
    frontier.push(i);
    q[i] = 1;
  }

  while (frontier.length) {
    buckets.push(frontier);
    next = [];
    for (const c of frontier) {
      h[c]! -= THRESHOLD;
      q[c] = 0;
      topples++;
      if (!t[c]) {
        t[c] = 1;
        toppled.push(c);
      }
      dirty.push(c);
      const x = c % W;
      const y = (c / W) | 0;
      if (x > 0) give(c - 1);
      else p.resident--; // off the edge, out of the system
      if (x < W - 1) give(c + 1);
      else p.resident--;
      if (y > 0) give(c - W);
      else p.resident--;
      if (y < H - 1) give(c + W);
      else p.resident--;
    }
    // A cell holding 8+ topples again next tick even if no neighbour feeds it.
    for (const c of frontier) {
      if (h[c]! >= THRESHOLD && !q[c]) {
        q[c] = 1;
        next.push(c);
      }
    }
    frontier = next;
  }

  for (const c of toppled) t[c] = 0;
  return { cells: toppled.length, topples, buckets, maxTick: Math.max(0, buckets.length - 1), dirty };
}

/**
 * Pour `n` grains from the seeded charge sequence. Batched — the caller repaints
 * the field's warmth and the dial, never individual avalanches (ticket 05, D1:
 * batched is weather, animated is an event, and weather never plots).
 */
export function charge(p: Pile, n: number): { biggest: number } {
  let biggest = 0;
  for (let k = 0; k < n; k++) {
    const a = drop(p, p.next());
    if (a.cells > biggest) biggest = a.cells;
  }
  return { biggest };
}

export interface Scratch {
  h: Uint8Array;
  q: Uint8Array;
  t: Uint8Array;
}

export const makeScratch = (p: Pile): Scratch => ({
  h: new Uint8Array(p.h.length),
  q: new Uint8Array(p.h.length),
  t: new Uint8Array(p.h.length),
});

/**
 * The area a drop at `i` would produce, computed on a copy so the pile is
 * untouched. Used to seed the on-ramp's ring cell (ticket 05, D6).
 */
export function previewCells(p: Pile, i: number, sc: Scratch = makeScratch(p)): number {
  const { W, H } = p;
  const { h, q, t } = sc;
  h.set(p.h);
  q.fill(0);
  t.fill(0);
  h[i]!++;
  let cells = 0;
  let frontier: number[] = [];
  let next: number[] = [];

  const give = (n: number) => {
    h[n]!++;
    if (h[n]! >= THRESHOLD && !q[n]) {
      q[n] = 1;
      next.push(n);
    }
  };

  if (h[i]! >= THRESHOLD) {
    frontier.push(i);
    q[i] = 1;
  }
  while (frontier.length) {
    next = [];
    for (const c of frontier) {
      h[c]! -= THRESHOLD;
      q[c] = 0;
      if (!t[c]) {
        t[c] = 1;
        cells++;
      }
      const x = c % W;
      const y = (c / W) | 0;
      if (x > 0) give(c - 1);
      if (x < W - 1) give(c + 1);
      if (y > 0) give(c - W);
      if (y < H - 1) give(c + W);
    }
    for (const c of frontier) {
      if (h[c]! >= THRESHOLD && !q[c]) {
        q[c] = 1;
        next.push(c);
      }
    }
    frontier = next;
  }
  return cells;
}

/**
 * The on-ramp's ring cell: the cell whose next grain moves the most (ticket 05,
 * fork 4 — "the cell that takes a quarter of the field looks identical to every
 * other cell"). Found at runtime rather than baked, because beat 1 lets the user
 * put their own first grain anywhere: one grain at criticality genuinely changes
 * which cell is the monster, so a build-time answer would sometimes be a dud.
 * Only a cell already holding THRESHOLD-1 can start an avalanche at all, so the
 * scan is ~a quarter of the field, not all of it.
 */
export function pickRing(p: Pile): { cell: number; cells: number } {
  const sc = makeScratch(p);
  let cell = -1;
  let best = -1;
  for (let i = 0; i < p.h.length; i++) {
    if (p.h[i] !== THRESHOLD - 1) continue;
    const cells = previewCells(p, i, sc);
    if (cells > best) {
      best = cells;
      cell = i;
    }
  }
  return { cell, cells: Math.max(0, best) };
}

/**
 * Survival curve: for each observed size s (ascending), how many avalanches were
 * at least that big. No binning, so ~20 of the user's own avalanches already read
 * as a straight line on log-log — and a straight line means no typical size.
 */
export function survival(sizes: number[]): [number, number][] {
  const sorted = [...sizes].sort((a, b) => a - b);
  const out: [number, number][] = [];
  let i = 0;
  while (i < sorted.length) {
    const s = sorted[i]!;
    let j = i;
    while (j < sorted.length && sorted[j] === s) j++;
    out.push([s, sorted.length - i]);
    i = j;
  }
  return out;
}

/**
 * Least-squares slope of log10(y) on log10(x) — the survival curve's exponent.
 * S(s) ~ s^-(τ-1), so τ = 1 - slope. Reported, never authored (ticket 06, D8).
 */
export function fitTau(points: [number, number][]): number {
  const pts = points.filter(([s, c]) => s > 0 && c > 0);
  const n = pts.length;
  if (n < 2) return NaN;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const [s, c] of pts) {
    const x = Math.log10(s);
    const y = Math.log10(c);
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  return 1 - (n * sxy - sx * sy) / (n * sxx - sx * sx);
}
