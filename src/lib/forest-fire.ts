import { mulberry32 } from './prng.ts';

/** Site-percolation threshold, 2D square lattice. Displayed as 0.59. */
export const D_C = 0.5927;

/**
 * A fixed random field. Monotonic fill (ticket 02, dec. 3): every cell holds a
 * frozen threshold r_i; the cell is a tree iff r_i < d. Raising d therefore only
 * ever ADDS trees — never relocates one — so "one more tree, same spark" is
 * literally true on screen. `shade` is a stable per-cell hash used only for the
 * latent forest's colour variation (never for state).
 */
export interface Field {
  W: number;
  H: number;
  r: Float64Array;
  shade: Float32Array;
  seed: number;
}

export function buildField(W: number, H: number, seed: number): Field {
  const rnd = mulberry32(seed);
  const N = W * H;
  const r = new Float64Array(N);
  const shade = new Float32Array(N);
  for (let i = 0; i < N; i++) r[i] = rnd();
  for (let i = 0; i < N; i++) {
    const x = Math.imul(i ^ seed, 2654435761) >>> 0;
    shade[i] = ((x >>> 8) & 255) / 255;
  }
  return { W, H, r, shade, seed };
}

export const isTree = (f: Field, i: number, d: number): boolean => f.r[i]! < d;

export function countTrees(f: Field, d: number): number {
  let n = 0;
  for (let i = 0; i < f.W * f.H; i++) if (f.r[i]! < d) n++;
  return n;
}

/** Snap a tap to the nearest tree by expanding rings. -1 if the forest is empty. */
export function nearestTree(f: Field, d: number, x: number, y: number): number {
  const { W, H } = f;
  if (x >= 0 && x < W && y >= 0 && y < H && isTree(f, y * W + x, d)) return y * W + x;
  const maxR = Math.max(W, H);
  for (let r = 1; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const i = ny * W + nx;
        if (isTree(f, i, d)) return i;
      }
    }
  }
  return -1;
}

export interface Burn {
  /** Ignition tick per cell; -1 = never burned. */
  ig: Int32Array;
  maxTick: number;
  burned: number;
  trees: number;
  frac: number;
  spark: number;
  /** buckets[t] = cell indices igniting at tick t. Drives the O(front) repaint. */
  buckets: number[][];
}

/** BFS flood-fill from `spark` over 4-neighbours (von Neumann), recording tick. */
export function burn(f: Field, d: number, spark: number): Burn {
  const { W, H } = f;
  const N = W * H;
  const ig = new Int32Array(N).fill(-1);
  const trees = countTrees(f, d);

  if (spark < 0 || spark >= N || !isTree(f, spark, d)) {
    return { ig, maxTick: 0, burned: 0, trees, frac: 0, spark: -1, buckets: [] };
  }

  const buckets: number[][] = [[spark]];
  ig[spark] = 0;
  let burned = 1;
  let frontier = [spark];
  let tick = 0;

  while (frontier.length) {
    const next: number[] = [];
    for (const idx of frontier) {
      const x = idx % W;
      const y = (idx / W) | 0;
      if (x > 0 && ig[idx - 1]! < 0 && isTree(f, idx - 1, d)) {
        ig[idx - 1] = tick + 1;
        next.push(idx - 1);
      }
      if (x < W - 1 && ig[idx + 1]! < 0 && isTree(f, idx + 1, d)) {
        ig[idx + 1] = tick + 1;
        next.push(idx + 1);
      }
      if (y > 0 && ig[idx - W]! < 0 && isTree(f, idx - W, d)) {
        ig[idx - W] = tick + 1;
        next.push(idx - W);
      }
      if (y < H - 1 && ig[idx + W]! < 0 && isTree(f, idx + W, d)) {
        ig[idx + W] = tick + 1;
        next.push(idx + W);
      }
    }
    if (next.length) {
      buckets.push(next);
      burned += next.length;
    }
    frontier = next;
    tick++;
  }

  return { ig, maxTick: buckets.length - 1, burned, trees, frac: trees ? burned / trees : 0, spark, buckets };
}

/**
 * The leftmost cell of the largest connected cluster — used for scripted/random
 * sparks. Below d_c the largest cluster is small (honest fizzle); above it a
 * spanning cluster exists (dramatic sweep), so the slider is a real transition.
 */
export function largestClusterSpark(f: Field, d: number): number {
  const { W, H } = f;
  const N = W * H;
  const seen = new Uint8Array(N);
  const stack: number[] = [];
  let bestSize = 0;
  let spark = -1;

  for (let i = 0; i < N; i++) {
    if (!isTree(f, i, d) || seen[i]) continue;
    let size = 0;
    let leftX = Infinity;
    let leftIdx = -1;
    stack.length = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const idx = stack.pop()!;
      size++;
      const x = idx % W;
      const y = (idx / W) | 0;
      if (x < leftX) {
        leftX = x;
        leftIdx = idx;
      }
      if (x > 0 && !seen[idx - 1] && isTree(f, idx - 1, d)) {
        seen[idx - 1] = 1;
        stack.push(idx - 1);
      }
      if (x < W - 1 && !seen[idx + 1] && isTree(f, idx + 1, d)) {
        seen[idx + 1] = 1;
        stack.push(idx + 1);
      }
      if (y > 0 && !seen[idx - W] && isTree(f, idx - W, d)) {
        seen[idx - W] = 1;
        stack.push(idx - W);
      }
      if (y < H - 1 && !seen[idx + W] && isTree(f, idx + W, d)) {
        seen[idx + W] = 1;
        stack.push(idx + W);
      }
    }
    if (size > bestSize) {
      bestSize = size;
      spark = leftIdx;
    }
  }
  return spark;
}
