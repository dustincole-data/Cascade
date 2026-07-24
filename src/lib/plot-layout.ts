import { PILE } from './sandpile.ts';
import { linearAxis, logAxis, type Axis } from './plot-geometry.ts';

/**
 * Geometry shared by the SSR components and their client modules, so a plot that
 * re-lays-out in the browser lands on exactly the pixels the server drew.
 *
 * The coda board widens as panels land (🔒 ticket 06, fork 5): container
 * 960 → ~1280 → ~1500, plots 860 → ~560 → ~430, side by side at ≥1100px and
 * stacked below it at hero scale again. A plot therefore cannot be a fixed
 * 860×500 canvas scaled by the viewBox — that shrinks the type with it. It takes
 * the width of the slot it lands in and re-lays-out when the slot changes.
 */

export interface Margins {
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface Domain {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLog?: boolean;
  yLog?: boolean;
}

export interface Frame {
  w: number;
  h: number;
  m: Margins;
  /** Plot-area width / height, inside the margins. */
  pw: number;
  ph: number;
  x: Axis;
  y: Axis;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function makeFrame(w: number, h: number, m: Margins, d: Domain): Frame {
  const pw = w - m.l - m.r;
  const ph = h - m.t - m.b;
  const x = d.xLog ? logAxis(d.xMin, d.xMax, m.l, m.l + pw) : linearAxis(d.xMin, d.xMax, m.l, m.l + pw);
  const y = d.yLog ? logAxis(d.yMin, d.yMax, m.t + ph, m.t) : linearAxis(d.yMin, d.yMax, m.t + ph, m.t);
  return { w, h, m, pw, ph, x, y };
}

/** Hero scale when a panel has the row to itself; ~560 in the 2-up board. */
export const codaWidth = (avail: number) => clamp(Math.round(avail), 300, 860);
export const codaHeight = (w: number) => Math.max(300, Math.round(w * 0.58));

/** The bottom margin carries tick labels, the ★ memory tick, and the axis title. */
export const codaMargins = (w: number): Margins =>
  w < 500 ? { l: 46, r: 22, t: 30, b: 58 } : { l: 56, r: 28, t: 34, b: 66 };

/**
 * Panel 1's faint scatter thins, then drops, as the plot narrows, so the curve
 * stays the object at board scale (🔒 ticket 06, D10). 0 = no scatter.
 */
export const scatterStride = (w: number) => (w >= 700 ? 1 : w >= 470 ? 2 : 0);

/** Avalanche area: one cell → the whole field. Both sandpile plots share it. */
export const SP_X = { min: 1, max: PILE.W * PILE.H };
/** The exhibit plots counts — "how many of my avalanches were at least this big".
 *  Capped at 300 so the law fills the frame instead of hugging one corner; a
 *  session that runs past 300 avalanches of one size simply clamps. */
export const SP_Y_LIVE = { min: 1, max: 300 };
/** The coda plots rarity — 1 in 1 down to 1 in 1000 drops. */
export const SP_Y_CODA = { min: 1e-3, max: 1 };

/**
 * The exhibit's backbone is the baked law scaled to a drop count, so the user's
 * raw counts land ON it rather than under it. Floored here so the first plotted
 * point ever — beat 3's monster — lands exactly on the line's tail, which is the
 * locked image: "the curve was always there and you are a dot on it".
 */
export const SP_FLOOR_DROPS = 40;

/** Where panel 2's leader touches the line: inside the straight scaling run the
 *  annotation is describing (the exponent is fitted over s ≤ 300). */
export const SP_ANNO_S = 50;

export const spDomain = (kind: 'live' | 'coda'): Domain => ({
  ...SP_X,
  ...(kind === 'live' ? { yMin: SP_Y_LIVE.min, yMax: SP_Y_LIVE.max } : { yMin: SP_Y_CODA.min, yMax: SP_Y_CODA.max }),
  xMin: SP_X.min,
  xMax: SP_X.max,
  xLog: true,
  yLog: true,
});

/**
 * A monotone-decreasing series as an SVG path, ending exactly on the frame's
 * bottom edge where it leaves the domain. The survival curve runs out of the
 * frame rather than stopping at the rarest single event — standard for a survival
 * plot, and it keeps the line reading as "it keeps going" instead of "here is an
 * edge" (the whole point of panel 2).
 */
export function survivalPath(sizes: number[], ys: number[], f: Frame, yMin: number): string {
  let d = '';
  for (let i = 0; i < sizes.length; i++) {
    const s = sizes[i]!;
    const y = ys[i]!;
    if (y < yMin) {
      // Interpolate the crossing in log-log space so the line exits on the edge.
      const s0 = sizes[i - 1];
      const y0 = ys[i - 1];
      if (s0 != null && y0 != null && y0 > 0 && y > 0) {
        const k = (Math.log10(y0) - Math.log10(yMin)) / (Math.log10(y0) - Math.log10(y));
        const sx = 10 ** (Math.log10(s0) + (Math.log10(s) - Math.log10(s0)) * k);
        d += `L${f.x.px(sx).toFixed(2)},${f.y.px(yMin).toFixed(2)}`;
      }
      break;
    }
    d += `${d ? 'L' : 'M'}${f.x.px(s).toFixed(2)},${f.y.px(y).toFixed(2)}`;
  }
  return d;
}

/** "1 in 25" — the coda's rarity words. Counting words, never 2.5×10⁻³. */
export const oneIn = (p: number): number => Math.max(1, Math.round(1 / p));
