export interface PlotBox {
  w: number;
  h: number;
  m: { l: number; r: number; t: number; b: number };
}

export interface Scale {
  x(d: number): number;
  y(f: number): number;
  invX(px: number): number;
}

export function makeScale(box: PlotBox, dMin: number, dMax: number): Scale {
  const pw = box.w - box.m.l - box.m.r;
  const ph = box.h - box.m.t - box.m.b;
  return {
    x: (d) => box.m.l + ((d - dMin) / (dMax - dMin)) * pw,
    y: (f) => box.m.t + (1 - f) * ph,
    invX: (px) => {
      const t = (px - box.m.l) / pw;
      return Math.min(dMax, Math.max(dMin, dMin + t * (dMax - dMin)));
    },
  };
}

/**
 * One mapped axis. The sandpile's survival curve needs log scales on BOTH axes
 * (spec §3.2 — a real addition, not a config flag), and the coda's rarity marker
 * needs the inverse to walk the line in fixed fractional-decade steps.
 */
export interface Axis {
  px(v: number): number;
  val(px: number): number;
}

export function linearAxis(min: number, max: number, p0: number, p1: number): Axis {
  return {
    px: (v) => p0 + ((v - min) / (max - min)) * (p1 - p0),
    val: (px) => clamp(min + ((px - p0) / (p1 - p0)) * (max - min), min, max),
  };
}

export function logAxis(min: number, max: number, p0: number, p1: number): Axis {
  const lo = Math.log10(min);
  const hi = Math.log10(max);
  return {
    px: (v) => p0 + ((Math.log10(Math.max(v, Number.MIN_VALUE)) - lo) / (hi - lo)) * (p1 - p0),
    val: (px) => clamp(10 ** (lo + ((px - p0) / (p1 - p0)) * (hi - lo)), min, max),
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Powers of ten inside [min, max] — the only honest ticks on a log axis. */
export function decadeTicks(min: number, max: number): number[] {
  const out: number[] = [];
  for (let e = Math.ceil(Math.log10(min)); 10 ** e <= max * 1.0000001; e++) out.push(10 ** e);
  return out;
}

/**
 * Read y off a curve at any x by interpolating in LOG-log space — the coda's
 * rarity readout ("1 in 400 drops ≥ 900 cells") comes from here, so every number
 * on screen is read off the baked data rather than authored (ticket 06, D8).
 */
export function interpLog(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  if (n === 0) return NaN;
  if (x <= xs[0]!) return ys[0]!;
  if (x >= xs[n - 1]!) return ys[n - 1]!;
  let i = 0;
  while (i < n - 1 && xs[i + 1]! < x) i++;
  const x0 = Math.log10(xs[i]!);
  const x1 = Math.log10(xs[i + 1]!);
  const y0 = Math.log10(ys[i]!);
  const y1 = Math.log10(ys[i + 1]!);
  const k = x1 === x0 ? 0 : (Math.log10(x) - x0) / (x1 - x0);
  return 10 ** (y0 + (y1 - y0) * k);
}

export function nearestIndex(densities: number[], d: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < densities.length; i++) {
    const dist = Math.abs(densities[i]! - d);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

export const valueAt = (densities: number[], values: number[], d: number): number =>
  values[nearestIndex(densities, d)]!;
