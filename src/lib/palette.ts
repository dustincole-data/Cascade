export type RGB = [number, number, number];
export type Stop = [number, RGB];

const hex2rgb = (h: string): RGB => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

/**
 * Warm spectral front: age 0 = leading + hottest → 1 = trailing, cooling to scar.
 * This is a SEQUENTIAL ramp (position + monotone luminance encode it), not a
 * categorical set — which is why it survives the CVD check (spec §1.2).
 */
export const FIRE: Stop[] = [
  [0, hex2rgb('#fff1c2')],
  [0.14, hex2rgb('#ffd166')],
  [0.42, hex2rgb('#ff8a3d')],
  [0.7, hex2rgb('#ff5a5f')],
  [1, hex2rgb('#e0479e')],
];

/** Latent forest: deep → bright teal, varied per cell by a stable hash. */
export const TEAL: Stop[] = [
  [0, hex2rgb('#1f7a5c')],
  [1, hex2rgb('#2fb488')],
];

/**
 * Sandpile height ramp (🔒 ticket 04, fork 3): grains 0→3 run cool→warm, so the
 * field visibly heats as the pile self-loads and settles into a tense mixed
 * state. Sequential with monotone luminance — CVD-safe by the same rule as FIRE,
 * and the coda's panel-2 stroke reuses it so exhibit and coda match (ticket 06,
 * fork 8). Height 3 is amber: one grain from toppling.
 */
export const HEIGHT: Stop[] = [
  [0, hex2rgb('#123f33')],
  [0.34, hex2rgb('#1f7a5c')],
  [0.67, hex2rgb('#2fb488')],
  [1, hex2rgb('#ffd166')],
];

/** Spent scar — a hair above the stage so the burned region still reads. */
export const SCAR: RGB = hex2rgb('#31281c');

export function lerpStops(stops: Stop[], t: number): RGB {
  const u = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i]!;
    const [b, cb] = stops[i + 1]!;
    if (u >= a && u <= b) {
      const k = (u - a) / (b - a || 1);
      return [ca[0] + (cb[0] - ca[0]) * k, ca[1] + (cb[1] - ca[1]) * k, ca[2] + (cb[2] - ca[2]) * k];
    }
  }
  return stops[stops.length - 1]![1];
}

export const fireColor = (age: number): RGB => lerpStops(FIRE, age);
/** Colour of a cell holding `h` grains (0–3). */
export const heightColor = (h: number): RGB => lerpStops(HEIGHT, Math.max(0, Math.min(3, h)) / 3);
/** Relative luminance, 0–1 — the channel that keeps a sequential ramp CVD-safe. */
export const luminance = (c: RGB): number => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
export const rgbStr = (c: RGB): string => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
