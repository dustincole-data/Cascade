import { type RGB, fireColor } from '../lib/palette.ts';
import { HALO_BUCKETS, HALO_SCALE, haloSprites } from './stage.ts';

/**
 * The dark stage, for a graph instead of a grid (🔒 ticket 07, fork 2).
 *
 * `stage.ts` is not generalised into this: a field of 13k cells and a grid of 180
 * nodes with wires between them are different objects, and forcing one interface
 * over both would be churn. What they *do* share is the locked bloom — the halo
 * sprites, their scale and the `lighter` composite come straight from `stage.ts`,
 * so a failing node glows with exactly the light a burning cell does.
 *
 * At 180 nodes and ~450 edges a whole redraw is well under a millisecond, so
 * there is no cached-background/repaint-the-front split to maintain here. The
 * grid renderer needs one; this one would only pay for the complexity.
 */

export interface GraphSpec {
  n: number;
  /** Layout in [0,1]². */
  xs: Float64Array;
  ys: Float64Array;
  edges: [number, number][];
  /** Dot size, relative — degree, so "the biggest one" is a real visible target. */
  weight(i: number): number;
  /** Resting colour of a node; null = dark (no power). */
  color(i: number): RGB | null;
  /** A wire only carries light while both ends do. */
  live(i: number): boolean;
}

export interface GraphStage {
  resize(cssWidth: number, maxHeight?: number): void;
  /** The resting frame: wires, then nodes. */
  paint(): void;
  /** The resting frame plus a glowing front. `age` runs 0 (hottest) → 1. */
  paintFront(nodes: number[], age: (i: number) => number, shimmer: number): void;
  nodeAt(clientX: number, clientY: number): number | null;
  /** CSS-pixel box of a node, for chrome that has to point at one (the ring). */
  nodeRect(i: number): { x: number; y: number; w: number };
  /** Keyboard navigation: the nearest node lying in a given direction. */
  step(from: number, dx: number, dy: number): number;
}

const EDGE_LIVE = 'rgba(90,150,140,0.30)';
const EDGE_DARK = 'rgba(70,80,96,0.10)';
/** The empty socket a dead node leaves behind — read against both stage and canopy. */
const NODE_DEAD = 'rgba(150,120,110,0.55)';
/** Nodes sit inside this much padding so an edge node's halo is never clipped. */
const PAD = 16;

export function createGraphStage(canvas: HTMLCanvasElement, spec: GraphSpec): GraphStage {
  const { n, xs, ys, edges } = spec;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let ctx = canvas.getContext('2d')!;
  let w = 640;
  let h = 480;
  let base = 5;
  let halo: { sprites: HTMLCanvasElement[]; R: number } = { sprites: [], R: 0 };

  let maxWeight = 1;
  for (let i = 0; i < n; i++) maxWeight = Math.max(maxWeight, spec.weight(i));

  const px = (i: number) => PAD + xs[i]! * (w - PAD * 2);
  const py = (i: number) => PAD + ys[i]! * (h - PAD * 2);
  /** Degree spread reads as size without any node becoming a blob. */
  const radius = (i: number) => base * (0.62 + 0.7 * (spec.weight(i) / maxWeight));

  function resize(cssWidth: number, maxHeight = Infinity) {
    w = Math.max(240, cssWidth);
    h = Math.min(maxHeight, Math.round(w * 0.72));
    // Node scale tracks the stage, but a phone-sized stage was landing at ~2–4px
    // dots — too small to read as "a piece of infrastructure" and too small to
    // aim at. The floor rises as the stage shrinks rather than staying fixed.
    base = Math.max(w < 520 ? 4.2 : 3, Math.min(w, h * 1.4) / (w < 520 ? 84 : 108));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    halo = { sprites: haloSprites(Math.round(base * HALO_SCALE)), R: Math.round(base * HALO_SCALE) };
  }

  function paint() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (const [a, b] of edges) {
      ctx.strokeStyle = spec.live(a) && spec.live(b) ? EDGE_LIVE : EDGE_DARK;
      ctx.beginPath();
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
      ctx.stroke();
    }
    for (let i = 0; i < n; i++) {
      const c = spec.color(i);
      if (!c) {
        // A node that has gone dark is DRAWN dark, not skipped. Omitting it left
        // an absence, and on a field of 180 dots a missing dot is invisible —
        // which is why knocking one out looked like the click had done nothing.
        // A hollow socket is a thing you can see: the grid is missing a piece.
        ctx.strokeStyle = NODE_DEAD;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(px(i), py(i), radius(i), 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      ctx.beginPath();
      ctx.arc(px(i), py(i), radius(i), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 1;
  }

  function paintFront(nodes: number[], age: (i: number) => number, shimmer: number) {
    paint();
    ctx.globalCompositeOperation = 'lighter';
    for (const i of nodes) {
      const flicker = shimmer ? 0.82 + 0.18 * Math.sin(i * 12.9 + shimmer * 0.006) : 1;
      ctx.globalAlpha = flicker;
      const sprite = halo.sprites[Math.min(HALO_BUCKETS - 1, Math.round(age(i) * (HALO_BUCKETS - 1)))]!;
      ctx.drawImage(sprite, px(i) - halo.R, py(i) - halo.R);
    }
    ctx.globalAlpha = 1;
    for (const i of nodes) {
      const c = fireColor(age(i));
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      ctx.beginPath();
      ctx.arc(px(i), py(i), radius(i) * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function nodeAt(clientX: number, clientY: number): number | null {
    const r = canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * w;
    const y = ((clientY - r.top) / r.height) * h;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const d = (px(i) - x) ** 2 + (py(i) - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    // Generous: clicking a wire's midpoint should not silently do nothing, but a
    // click way off the grid should miss. A finger is not a cursor, so a coarse
    // pointer gets a target it can actually hit — the nodes are ~5px wide.
    const coarse = matchMedia('(pointer: coarse)').matches;
    const reach = base * (coarse ? 7 : 4);
    return bestD <= reach ** 2 ? best : null;
  }

  /**
   * A graph is spatial, so arrow keys move spatially (🔒 ticket 07, D9): the
   * nearest node lying roughly in the pressed direction. Falling back to node
   * index order would walk the keyboard user along a lattice row invisibly.
   */
  function step(from: number, dx: number, dy: number): number {
    let best = from;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (i === from) continue;
      const vx = px(i) - px(from);
      const vy = py(i) - py(from);
      const len = Math.hypot(vx, vy);
      if (len === 0) continue;
      if ((vx * dx + vy * dy) / len < 0.55) continue; // not in that direction
      if (len < bestD) {
        bestD = len;
        best = i;
      }
    }
    return best;
  }

  const nodeRect = (i: number) => ({ x: px(i) - base * 2, y: py(i) - base * 2, w: base * 4 });

  resize(canvas.parentElement?.getBoundingClientRect().width ?? 640);
  return { resize, paint, paintFront, nodeAt, nodeRect, step };
}
