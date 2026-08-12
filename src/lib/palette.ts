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

/**
 * The sandpile's own ramp. HEIGHT (above) encodes the same 0→3 quantity in the
 * forest's teal, which is why the charged table read as woven camo rather than
 * sand — the material was wearing another exhibit's colour. This runs bare table
 * → shadowed sand → lit sand → the pale gold of a cell one grain from toppling.
 * Sequential with monotone luminance, so it is CVD-safe by the same rule as FIRE.
 */
/* Nearly flat across 0→2, then a jump into 3. A critical BTW field is spatially
   uncorrelated — neighbours sit at 0 and 3 constantly — so any ramp that spends
   its full range on those four values renders the physics faithfully and reads
   as a hard checkerboard. Holding 0–2 inside one narrow band of sand lets the
   table read as a single continuous material, and spends all the remaining
   contrast where it carries the argument: height 3, a cell one grain from
   toppling, glinting across the whole surface. Still monotone in luminance, so
   it stays CVD-safe by the same rule as FIRE. */
export const SAND: Stop[] = [
  [0, hex2rgb('#7d6440')],
  [0.34, hex2rgb('#96784b')],
  [0.67, hex2rgb('#b4915e')],
  [1, hex2rgb('#f2e0b6')],
];

/* Sand is granular below the scale of the simulation. A stable per-cell jitter
   of a few percent gives the surface a grain that does not move when the pile
   does, so the material reads as material rather than as flat fill. */
export const grainJitter = (i: number): number => {
  const h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  return 0.955 + (((h ^ (h >>> 15)) >>> 8) & 0xff) / 255 * 0.09;
};

/** Colour of a cell holding `h` grains (0–3), before relief shading. */
export const sandColor = (h: number): RGB => lerpStops(SAND, Math.max(0, Math.min(3, h)) / 3);

/**
 * Directional relief. A heightfield painted in flat per-cell colour has no
 * surface — every neighbour reads as an unrelated tile, which is the checkerboard.
 * Lighting each cell by how far it rises above the neighbours up and to its left
 * turns the same numbers into a granular slope you can see the shape of.
 */
export const reliefShade = (h: number, hLeft: number, hUp: number): number =>
  Math.max(0.78, Math.min(1.2, 1 + (h - hLeft + (h - hUp)) * 0.07));

/**
 * Spent scar. This used to be #31281c — a hair above the stage, which on a
 * 60%-empty lattice made a burned cell and an empty cell the same near-black.
 * Beat 1's whole lesson is a spark that goes nowhere *and leaves a small scar
 * you can see*; with no visible ash the beat read as a broken page. Ash is the
 * one thing on this stage that is neither alive nor burning, so it is the one
 * thing that is neutral grey.
 */
export const SCAR: RGB = hex2rgb('#6a6055');

/**
 * Forest floor. The gaps between trees were the stage itself showing through —
 * pure near-black against a saturated canopy, which is maximum local contrast
 * on a field that is mostly gaps. That is what made the forest read as green
 * confetti on a void rather than a canopy with clearings in it.
 */
export const FLOOR: RGB = hex2rgb('#1d2026');

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
