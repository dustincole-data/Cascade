import { fireColor, type RGB } from '../lib/palette.ts';

/* Locked graft values (ticket 01): Direction B's stage bloom inside Direction
   A's framed chrome. Do not tune without noting why in PROGRESS.md. */
export const HALO_SCALE = 3.0;
const HALO_ALPHA = 0.52;
export const HALO_BUCKETS = 12;

/**
 * The additive glow, pre-rendered once per size: one sprite per age bucket along
 * the FIRE ramp, blitted with `lighter`. Exported because exhibit 3 draws a
 * graph rather than a grid and must reuse *these* values rather than re-tune a
 * second bloom (🔒 ticket 07, fork 2) — a failing node and a burning cell glow
 * with the same light.
 */
export function haloSprites(R: number): HTMLCanvasElement[] {
  const size = R * 2;
  const sprites: HTMLCanvasElement[] = [];
  for (let k = 0; k < HALO_BUCKETS; k++) {
    const c = fireColor(k / (HALO_BUCKETS - 1));
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const g = cv.getContext('2d')!;
    const grd = g.createRadialGradient(R, R, 0, R, R, R);
    grd.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${HALO_ALPHA})`);
    grd.addColorStop(0.4, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${HALO_ALPHA * 0.38})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(R, R, R, 0, Math.PI * 2);
    g.fill();
    sprites.push(cv);
  }
  return sprites;
}

/**
 * The dark stage: a cached background of resting cells plus an O(front) glowing
 * band repainted per frame. Exhibit-agnostic — the exhibit supplies the resting
 * colour of a cell and the cells currently in the front. A burning fire front and
 * a toppling avalanche are the same shape, so they share this machinery (🔒 ticket
 * 04: `paintFrame`/`ageOut` generalise).
 */
export interface StageSpec {
  W: number;
  H: number;
  /** Resting colour of cell `i`; null leaves the stage showing through. */
  bg(i: number): RGB | null;
}

export interface Stage {
  /** `maxHeight` lets a square grid sit in a landscape panel without stretching it. */
  resize(cssWidth: number, maxHeight?: number): void;
  /** Full repaint of the cached background. ~38ms at 160² — never inside the rAF loop. */
  paintAll(): void;
  /** Patch just these cells into the cached background (front cells ageing out, grains landing). */
  paintCells(cells: Iterable<number>): void;
  /** Blit the cache, then draw the glowing front. `age` runs 0 (hottest) → 1 (cooling out). */
  paintFront(cells: number[], age: (i: number) => number, shimmer: number): void;
  /** Blit the cache alone — the resting field, no front. */
  blit(): void;
  cellAt(clientX: number, clientY: number): { x: number; y: number; i: number } | null;
  /** CSS-pixel rect of a cell, for chrome that has to point at one (the on-ramp's ring). */
  cellRect(i: number): { x: number; y: number; w: number };
}

/**
 * Depth of the glowing front, in ticks, scaled to the event's length — the locked
 * reference's `max(4, round(maxTick * 0.14))`. A cell spends one tick physically
 * active but keeps GLOWING as it cools; that trail is what the warm-spectral age
 * ramp encodes and what gives the front its visual weight. A fixed depth makes a
 * long sweep read as a thin thread.
 */
export const bandFor = (maxTick: number) => Math.max(4, Math.round(maxTick * 0.14));

export function createStage(canvas: HTMLCanvasElement, spec: StageSpec): Stage {
  const { W, H, bg } = spec;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const offscreen = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  let bgCtx = offscreen.getContext('2d')!;
  let cell = 4;
  let halo: { sprites: HTMLCanvasElement[]; R: number } = { sprites: [], R: 0 };

  const gap = () => (cell >= 6 ? 0.6 : 0.3);

  function makeHalo() {
    const R = Math.round(cell * HALO_SCALE);
    halo = { sprites: haloSprites(R), R };
  }

  function resize(cssWidth: number, maxHeight = Infinity) {
    // Fractional cell size so the grid fills its panel exactly. Flooring to an
    // integer left a dead strip (up to 13% of the panel on narrow viewports),
    // which reads as broken chrome; sub-pixel cell edges do not.
    cell = Math.max(2, Math.min(cssWidth / W, maxHeight / H));
    const w = W * cell;
    const h = H * cell;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    ctx = canvas.getContext('2d')!;
    bgCtx = offscreen.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeHalo();
  }

  function paintCell(i: number) {
    const c = bg(i);
    const x = (i % W) * cell;
    const y = ((i / W) | 0) * cell;
    const s = cell - gap();
    if (!c) {
      bgCtx.clearRect(x, y, cell, cell);
      return;
    }
    bgCtx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
    bgCtx.fillRect(x, y, s, s);
  }

  function blit() {
    ctx.clearRect(0, 0, W * cell, H * cell);
    ctx.drawImage(offscreen, 0, 0, W * cell, H * cell);
  }

  function paintAll() {
    bgCtx.clearRect(0, 0, W * cell, H * cell);
    for (let i = 0; i < W * H; i++) paintCell(i);
    blit();
  }

  function paintCells(cells: Iterable<number>) {
    for (const i of cells) paintCell(i);
  }

  /** The only per-frame work: blit the cache + repaint the ~O(perimeter) front. */
  function paintFront(cells: number[], age: (i: number) => number, shimmer: number) {
    const s = cell - gap();
    blit();
    ctx.globalCompositeOperation = 'lighter';
    for (const i of cells) {
      const x = i % W;
      const y = (i / W) | 0;
      const flicker = shimmer ? 0.82 + 0.18 * Math.sin(x * 12.9 + y * 7.7 + shimmer * 0.006) : 1;
      ctx.globalAlpha = flicker;
      const sprite = halo.sprites[Math.min(HALO_BUCKETS - 1, Math.round(age(i) * (HALO_BUCKETS - 1)))]!;
      ctx.drawImage(sprite, x * cell + cell / 2 - halo.R, y * cell + cell / 2 - halo.R);
    }
    ctx.globalAlpha = 1;
    for (const i of cells) {
      const x = i % W;
      const y = (i / W) | 0;
      const c = fireColor(age(i));
      const b = shimmer ? 0.9 + 0.1 * Math.sin(x * 4.1 - y * 3.3 + shimmer * 0.009) : 1;
      ctx.fillStyle = `rgb(${Math.min(255, c[0] * b) | 0},${Math.min(255, c[1] * b) | 0},${Math.min(255, c[2] * b) | 0})`;
      ctx.fillRect(x * cell, y * cell, s, s);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function cellAt(clientX: number, clientY: number) {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - r.left) / r.width) * W);
    const y = Math.floor(((clientY - r.top) / r.height) * H);
    if (x < 0 || x >= W || y < 0 || y >= H) return null;
    return { x, y, i: y * W + x };
  }

  const cellRect = (i: number) => ({ x: (i % W) * cell, y: ((i / W) | 0) * cell, w: cell });

  resize(canvas.parentElement?.getBoundingClientRect().width ?? 640);
  return { resize, paintAll, paintCells, paintFront, blit, cellAt, cellRect };
}
