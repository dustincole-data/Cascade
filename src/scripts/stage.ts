import { isTree, type Burn, type Field } from '../lib/forest-fire.ts';
import { SCAR, TEAL, fireColor, lerpStops } from '../lib/palette.ts';

/* Locked graft values (ticket 01): Direction B's stage bloom inside Direction
   A's framed chrome. Do not tune without noting why in PROGRESS.md. */
const FOREST_DIM = 0.52;
const HALO_SCALE = 3.0;
const HALO_ALPHA = 0.52;
const HALO_BUCKETS = 12;

export interface Stage {
  resize(cssWidth: number): void;
  /** Full repaint of latent forest + scar through `tick`. ~38ms at 160² — density change / reset ONLY. */
  paintAll(field: Field, d: number, burn: Burn | null, tick: number): void;
  /** O(front): blit the cached background, then draw the glowing band. */
  paintFrame(field: Field, burn: Burn, tick: number, shimmer: number): void;
  /** Move cells that aged out of the band into the cached scar background. */
  ageOut(cells: number[], field: Field): void;
  cellAt(clientX: number, clientY: number): { x: number; y: number; i: number } | null;
  /**
   * Depth of the glowing front, in ticks, scaled to the burn's length — the
   * locked reference's `max(4, round(maxTick * 0.14))`. A physically burning
   * cell spends one tick, but it keeps GLOWING as it cools; that cooling trail
   * is what the warm-spectral age ramp encodes and what gives the fire its
   * visual weight. A fixed depth makes a long sweep read as a thin thread.
   */
  bandFor(burn: Burn): number;
}

export function createStage(canvas: HTMLCanvasElement, W: number, H: number): Stage {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const bg = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  let bgCtx = bg.getContext('2d')!;
  let cell = 4;
  let halo: { sprites: HTMLCanvasElement[]; R: number } = { sprites: [], R: 0 };
  const bandFor = (burn: Burn) => Math.max(4, Math.round(burn.maxTick * 0.14));

  const gap = () => (cell >= 6 ? 0.6 : 0.3);

  function makeHaloSprites() {
    const R = Math.round(cell * HALO_SCALE);
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
    halo = { sprites, R };
  }

  function resize(cssWidth: number) {
    cell = Math.max(3, Math.floor(cssWidth / W));
    const w = W * cell;
    const h = H * cell;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    bg.width = w * dpr;
    bg.height = h * dpr;
    ctx = canvas.getContext('2d')!;
    bgCtx = bg.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeHaloSprites();
  }

  function paintTree(i: number, field: Field) {
    const x = i % W;
    const y = (i / W) | 0;
    const s = cell - gap();
    const c = lerpStops(TEAL, field.shade[i]!);
    bgCtx.fillStyle = `rgb(${(c[0] * FOREST_DIM) | 0},${(c[1] * FOREST_DIM) | 0},${(c[2] * FOREST_DIM) | 0})`;
    bgCtx.fillRect(x * cell, y * cell, s, s);
  }

  function paintScar(i: number, field: Field) {
    const x = i % W;
    const y = (i / W) | 0;
    const s = cell - gap();
    const g = 0.72 + 0.5 * field.shade[i]!;
    bgCtx.fillStyle = `rgb(${(SCAR[0] * g) | 0},${(SCAR[1] * g) | 0},${(SCAR[2] * g) | 0})`;
    bgCtx.fillRect(x * cell, y * cell, s, s);
  }

  /** ~38ms at 160². Density change / reset ONLY — never inside the rAF loop. */
  function paintAll(field: Field, d: number, burn: Burn | null, tick: number) {
    const band = burn ? bandFor(burn) : 0;
    bgCtx.clearRect(0, 0, W * cell, H * cell);
    for (let i = 0; i < W * H; i++) {
      if (!isTree(field, i, d)) continue;
      const t = burn ? burn.ig[i]! : -1;
      if (t < 0 || t > tick) paintTree(i, field);
      // Cells inside the glowing band get their scar painted here too, then
      // paintFrame overdraws them with glow. Without this they'd be holes in
      // any frame where paintFrame doesn't follow (idle, tab-restore, resize).
      else paintScar(i, field);
    }
    ctx.clearRect(0, 0, W * cell, H * cell);
    ctx.drawImage(bg, 0, 0, W * cell, H * cell);
  }

  /** Cells that just left the glowing band become permanent scar in the cache. */
  function ageOut(cells: number[], field: Field) {
    for (const i of cells) paintScar(i, field);
  }

  /** The only per-frame work: blit the cache + repaint the ~O(perimeter) front. */
  function paintFrame(field: Field, burn: Burn, tick: number, shimmer: number) {
    const s = cell - gap();
    const band = bandFor(burn);
    ctx.clearRect(0, 0, W * cell, H * cell);
    ctx.drawImage(bg, 0, 0, W * cell, H * cell);

    const front: number[] = [];
    for (let t = Math.max(0, tick - band + 1); t <= Math.min(tick, burn.maxTick); t++) {
      const bucket = burn.buckets[t];
      if (bucket) front.push(...bucket);
    }

    ctx.globalCompositeOperation = 'lighter';
    for (const i of front) {
      const x = i % W;
      const y = (i / W) | 0;
      const age = Math.max(0, Math.min(1, (tick - burn.ig[i]!) / band));
      const flicker = shimmer ? 0.82 + 0.18 * Math.sin(x * 12.9 + y * 7.7 + shimmer * 0.006) : 1;
      ctx.globalAlpha = flicker;
      const sprite = halo.sprites[Math.min(HALO_BUCKETS - 1, Math.round(age * (HALO_BUCKETS - 1)))]!;
      ctx.drawImage(sprite, x * cell + cell / 2 - halo.R, y * cell + cell / 2 - halo.R);
    }
    ctx.globalAlpha = 1;
    for (const i of front) {
      const x = i % W;
      const y = (i / W) | 0;
      const age = Math.max(0, Math.min(1, (tick - burn.ig[i]!) / band));
      const c = fireColor(age);
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

  resize(canvas.parentElement?.getBoundingClientRect().width ?? 640);
  return { resize, paintAll, paintFrame, ageOut, cellAt, bandFor };
}
