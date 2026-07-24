import { mulberry32 } from './prng.ts';

/**
 * Exhibit 3's rule-set (🔒 ticket 07): a Motter–Lai cascade on a Watts–Strogatz
 * small-world grid. Pure, seeded and deterministic — the same (graph, α, node)
 * always produces the same blackout, which is what lets the ranked profile be
 * baked at build time and still agree with the cascade the user triggers live.
 *
 * Spine: **you can't tell which.** Fire and the sandpile both hand out a
 * homogeneous field where *where* you act barely matters. Here the parts look
 * alike and are not alike — so the graph has to be one where **degree does not
 * predict importance**. That is exactly what the rewired long links buy: they
 * create bridges that carry flow far out of proportion to how they look.
 */

/** 15 × 12 = 180 nodes — big enough for a heavy tail, few enough that one node is
 *  a legible dot and a whole ranked profile fits on an axis. */
export const GRID = { COLS: 15, ROWS: 12 } as const;
export const NODES = GRID.COLS * GRID.ROWS;

/** The canonical grid's seed. There is no Shuffle: the graph is the subject, so
 *  every surface (exhibit, bake, coda) reasons about the same object. */
export const NET_SEED = 0xbeef00;

/** Fraction of lattice edges rewired long. Small enough that the field still
 *  reads as a grid, large enough to make bridges. */
export const REWIRE = 0.06;

/**
 * Local redundancy: how often a cell of the lattice also gets a diagonal tie.
 * This is not decoration — it is what makes the exhibit's claim true. On a bare
 * lattice the most-connected node is *also* the busiest, so beat 2 ("even the
 * biggest one") would be a lie. Local triangles make a well-connected node
 * *routable around* — its neighbours reach each other without it — so degree
 * stops predicting betweenness, and the fragile nodes become the bridges rather
 * than the hubs. Real grids have exactly this redundancy around big substations.
 */
export const DIAGONAL = 0.35;

/** Spare capacity stops. Stepped (not continuous) so every ranked profile can be
 *  baked — nothing is ever computed at runtime (🔒 ticket 07, D3). */
export const SLACK_STOPS = [0.2, 0.3, 0.4, 0.55, 0.8] as const;
export const DEFAULT_SLACK = 0.4;

export interface Graph {
  n: number;
  /** Layout in [0,1]² — a jittered lattice, so it reads as infrastructure. */
  xs: Float64Array;
  ys: Float64Array;
  /** Adjacency, each list ascending. */
  adj: number[][];
  deg: Int32Array;
  /** Undirected edge list, each pair once (a < b). */
  edges: [number, number][];
}

const key = (a: number, b: number) => (a < b ? a * NODES + b : b * NODES + a);

/**
 * A jittered lattice with local edges, then Watts–Strogatz rewiring: each edge
 * has probability `REWIRE` of having one endpoint moved to a random node. A
 * rewire is rejected if it would duplicate an edge, self-loop, or disconnect the
 * grid — a power grid with an unpowered island in it at rest is not the object
 * this exhibit is about.
 */
export function createGrid(seed = NET_SEED): Graph {
  const rnd = mulberry32(seed);
  const { COLS, ROWS } = GRID;
  const n = NODES;
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      xs[i] = (c + 0.5 + (rnd() - 0.5) * 0.44) / COLS;
      ys[i] = (r + 0.5 + (rnd() - 0.5) * 0.44) / ROWS;
    }
  }

  const set = new Set<number>();
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    if (a === b || set.has(key(a, b))) return false;
    set.add(key(a, b));
    edges.push(a < b ? [a, b] : [b, a]);
    return true;
  };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (c < COLS - 1) add(i, i + 1);
      if (r < ROWS - 1) add(i, i + COLS);
      if (c < COLS - 1 && r < ROWS - 1 && rnd() < DIAGONAL) add(i, i + COLS + 1);
      if (c > 0 && r < ROWS - 1 && rnd() < DIAGONAL) add(i, i + COLS - 1);
    }
  }

  for (let e = 0; e < edges.length; e++) {
    if (rnd() >= REWIRE) continue;
    const [a, b] = edges[e]!;
    const keep = rnd() < 0.5 ? a : b;
    const target = Math.floor(rnd() * n);
    if (target === keep || set.has(key(keep, target))) continue;
    set.delete(key(a, b));
    set.add(key(keep, target));
    edges[e] = keep < target ? [keep, target] : [target, keep];
    if (!connected(buildAdj(n, edges), n)) {
      // Put it back — the resting grid stays one connected system.
      set.delete(key(keep, target));
      set.add(key(a, b));
      edges[e] = [a, b];
    }
  }

  const adj = buildAdj(n, edges);
  const deg = new Int32Array(n);
  for (let i = 0; i < n; i++) deg[i] = adj[i]!.length;
  return { n, xs, ys, adj, deg, edges };
}

function buildAdj(n: number, edges: [number, number][]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a]!.push(b);
    adj[b]!.push(a);
  }
  for (const l of adj) l.sort((x, y) => x - y);
  return adj;
}

function connected(adj: number[][], n: number): boolean {
  const seen = new Uint8Array(n);
  const q = [0];
  seen[0] = 1;
  let count = 1;
  for (let h = 0; h < q.length; h++) {
    for (const b of adj[q[h]!]!) {
      if (seen[b]) continue;
      seen[b] = 1;
      count++;
      q.push(b);
    }
  }
  return count === n;
}

/**
 * Brandes betweenness over the nodes still standing — how many shortest paths
 * run through each node. This is the *load* in Motter–Lai: what flows through a
 * node because of where it sits, which is precisely the quantity you cannot read
 * off a picture of the grid.
 *
 * A node with betweenness 0 (a leaf) would otherwise have capacity 0 and die to
 * any load at all, so load is `betweenness + 1`: every node carries its own
 * demand. Stated here rather than hidden, because it is a modelling choice.
 */
export function load(g: Graph, alive: Uint8Array): Float64Array {
  const n = g.n;
  const bc = new Float64Array(n);
  const sigma = new Float64Array(n);
  const dist = new Int32Array(n);
  const delta = new Float64Array(n);
  const stack = new Int32Array(n);
  const queue = new Int32Array(n);

  for (let s = 0; s < n; s++) {
    if (!alive[s]) continue;
    sigma.fill(0);
    dist.fill(-1);
    delta.fill(0);
    sigma[s] = 1;
    dist[s] = 0;
    let qh = 0;
    let qt = 0;
    let sp = 0;
    queue[qt++] = s;
    while (qh < qt) {
      const v = queue[qh++]!;
      stack[sp++] = v;
      for (const w of g.adj[v]!) {
        if (!alive[w]) continue;
        if (dist[w]! < 0) {
          dist[w] = dist[v]! + 1;
          queue[qt++] = w;
        }
        if (dist[w] === dist[v]! + 1) sigma[w]! += sigma[v]!;
      }
    }
    // Accumulation, allocation-free: instead of storing predecessor lists (an
    // array-of-arrays that dominated the cost — a ~140ms blocking click for the
    // biggest cascades), re-derive predecessors on the fly from the BFS distances.
    while (sp > 0) {
      const w = stack[--sp]!;
      const coeff = (1 + delta[w]!) / sigma[w]!;
      for (const v of g.adj[w]!) {
        if (alive[v] && dist[v] === dist[w]! - 1) delta[v]! += sigma[v]! * coeff;
      }
      if (w !== s) bc[w]! += delta[w]!;
    }
  }
  for (let i = 0; i < n; i++) bc[i] = alive[i] ? bc[i]! + 1 : 0;
  return bc;
}

/** capacity = load₀ × (1 + α) — the grid's spare margin, Motter–Lai's α. */
export function capacities(g: Graph, alpha: number): Float64Array {
  const all = new Uint8Array(g.n).fill(1);
  const l0 = load(g, all);
  const cap = new Float64Array(g.n);
  for (let i = 0; i < g.n; i++) cap[i] = l0[i]! * (1 + alpha);
  return cap;
}

export interface Cascade {
  /** Still powered at the end. */
  alive: Uint8Array;
  /** Failed by overload, in the round they failed — round 0 is the node the user took offline. */
  rounds: number[][];
  /** Cut off from the bulk: dark without ever overloading (they fade, they don't flash). */
  islanded: number[];
  /** Nodes without power ÷ nodes in the grid. The readout's `dark`. */
  darkFrac: number;
  darkCount: number;
}

const MAX_ROUNDS = 60;

/**
 * Take one node offline and let the consequences run. Each round: re-route flow
 * (recompute load over the survivors), fail everyone now over capacity, repeat
 * until it settles. Then anything cut off from the bulk is dark too — overload
 * and starvation are physically different, and the stage draws them differently.
 */
export function cascade(g: Graph, cap: Float64Array, start: number): Cascade {
  const alive = new Uint8Array(g.n).fill(1);
  alive[start] = 0;
  const rounds: number[][] = [[start]];

  for (let r = 0; r < MAX_ROUNDS; r++) {
    const l = load(g, alive);
    const over: number[] = [];
    for (let i = 0; i < g.n; i++) if (alive[i] && l[i]! > cap[i]!) over.push(i);
    if (!over.length) break;
    for (const i of over) alive[i] = 0;
    rounds.push(over);
  }

  const inBulk = giantComponent(g, alive);
  const islanded: number[] = [];
  for (let i = 0; i < g.n; i++) {
    if (alive[i] && !inBulk[i]) {
      islanded.push(i);
      alive[i] = 0;
    }
  }

  let live = 0;
  for (let i = 0; i < g.n; i++) if (alive[i]) live++;
  const darkCount = g.n - live;
  return { alive, rounds, islanded, darkFrac: darkCount / g.n, darkCount };
}

/** The largest surviving component — the part of the grid that still has power. */
export function giantComponent(g: Graph, alive: Uint8Array): Uint8Array {
  const comp = new Int32Array(g.n).fill(-1);
  const sizes: number[] = [];
  const q: number[] = [];
  for (let s = 0; s < g.n; s++) {
    if (!alive[s] || comp[s]! >= 0) continue;
    const id = sizes.length;
    comp[s] = id;
    q.length = 0;
    q.push(s);
    let size = 1;
    for (let h = 0; h < q.length; h++) {
      for (const b of g.adj[q[h]!]!) {
        if (!alive[b] || comp[b]! >= 0) continue;
        comp[b] = id;
        size++;
        q.push(b);
      }
    }
    sizes.push(size);
  }
  let best = -1;
  let bestSize = -1;
  sizes.forEach((s, i) => {
    if (s > bestSize) {
      bestSize = s;
      best = i;
    }
  });
  const out = new Uint8Array(g.n);
  for (let i = 0; i < g.n; i++) if (alive[i] && comp[i] === best) out[i] = 1;
  return out;
}

/** Every node's blackout, in node order — one cascade each. Baked, not run live. */
export function profile(g: Graph, alpha: number): number[] {
  const cap = capacities(g, alpha);
  const out: number[] = [];
  for (let i = 0; i < g.n; i++) out.push(cascade(g, cap, i).darkFrac);
  return out;
}

/** Ranked descending — the exhibit's cliff. Values only; ranks are positions. */
export const ranked = (fracs: number[]): number[] => [...fracs].sort((a, b) => b - a);

/** A node's place on that cliff, 1-based: where the user's bright dot lands. */
export function rankOf(fracs: number[], node: number): number {
  const v = fracs[node]!;
  let r = 1;
  for (let i = 0; i < fracs.length; i++) if (fracs[i]! > v || (fracs[i] === v && i < node)) r++;
  return r;
}

/** The most-connected node — beat 2's obvious suspect, which the grid absorbs. */
export function hubNode(g: Graph): number {
  let best = 0;
  for (let i = 1; i < g.n; i++) if (g.deg[i]! > g.deg[best]!) best = i;
  return best;
}

/**
 * Beat 3's node: catastrophic, and as **ordinary-looking as possible** — of the
 * nodes that take down at least half the grid, the one whose degree sits nearest
 * the grid's median. The beat's whole claim is that nothing about it looks
 * different, so the choice is made on appearance, not on being the worst.
 */
export function pickRing(g: Graph, fracs: number[], threshold = 0.5): number {
  const degs = [...g.deg].sort((a, b) => a - b);
  const median = degs[degs.length >> 1]!;
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < g.n; i++) {
    if (fracs[i]! < threshold) continue;
    const score = Math.abs(g.deg[i]! - median) - fracs[i]! * 0.001;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (best >= 0) return best;
  // No node clears the threshold (only possible at generous slack): take the worst.
  let worst = 0;
  for (let i = 1; i < g.n; i++) if (fracs[i]! > fracs[worst]!) worst = i;
  return worst;
}

/** How many nodes take down more than `frac` of the grid — the annotation's count. */
export const lethalCount = (fracs: number[], frac = 0.5): number =>
  fracs.reduce((k, v) => k + (v > frac ? 1 : 0), 0);
