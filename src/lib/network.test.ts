import { describe, expect, it } from 'vitest';
import profileData from '../data/network-profile.json';
import {
  DEFAULT_SLACK,
  NODES,
  SLACK_STOPS,
  cascade,
  capacities,
  createGrid,
  hubNode,
  lethalCount,
  load,
  pickRing,
  profile,
  rankOf,
  ranked,
} from './network.ts';

const g = createGrid();
const di = SLACK_STOPS.indexOf(DEFAULT_SLACK as (typeof SLACK_STOPS)[number]);
const fracs = profileData.perNode[di]!;

describe('the grid', () => {
  it('is one connected system of 180 nodes', () => {
    expect(g.n).toBe(NODES);
    const seen = new Uint8Array(g.n);
    const q = [0];
    seen[0] = 1;
    let count = 1;
    for (let h = 0; h < q.length; h++) {
      for (const b of g.adj[q[h]!]!) {
        if (seen[b]) continue;
        seen[b] = 1;
        count++;
        q.push(b);
      }
    }
    expect(count).toBe(g.n);
  });

  it('is deterministic — same seed, same graph, forever', () => {
    expect(createGrid().edges).toEqual(g.edges);
  });

  it('has no self-loops and no duplicate edges', () => {
    const seen = new Set<string>();
    for (const [a, b] of g.edges) {
      expect(a).not.toBe(b);
      expect(seen.has(`${a}-${b}`)).toBe(false);
      seen.add(`${a}-${b}`);
    }
  });
});

describe('load (betweenness + 1)', () => {
  it('gives every standing node a load of at least its own demand', () => {
    const l = load(g, new Uint8Array(g.n).fill(1));
    for (let i = 0; i < g.n; i++) expect(l[i]).toBeGreaterThanOrEqual(1);
  });

  it('is zero for a node that is already out', () => {
    const alive = new Uint8Array(g.n).fill(1);
    alive[7] = 0;
    expect(load(g, alive)[7]).toBe(0);
  });
});

describe('the cascade', () => {
  const cap = capacities(g, DEFAULT_SLACK);

  it('always leaves at least the node you took offline dark', () => {
    for (const n of [0, 45, 99, 179]) expect(cascade(g, cap, n).darkCount).toBeGreaterThanOrEqual(1);
  });

  it('is deterministic — the same node twice is the same blackout', () => {
    expect(cascade(g, cap, 22).darkCount).toBe(cascade(g, cap, 22).darkCount);
  });

  it('reports round 0 as the node the user took offline', () => {
    expect(cascade(g, cap, 88).rounds[0]).toEqual([88]);
  });

  it('cannot cascade at all when the grid has enormous slack', () => {
    const loose = capacities(g, 20);
    // Only the node itself (and anything it strands) can go dark.
    for (const n of [12, 63, 140]) expect(cascade(g, loose, n).rounds.length).toBe(1);
  });

  it('counts stranded nodes as dark without failing them by overload', () => {
    const c = cascade(g, cap, 22);
    const failed = c.rounds.flat().length;
    expect(c.darkCount).toBe(failed + c.islanded.length);
  });
});

/**
 * 🔒 ticket 07, D3 — the profile is baked at build time but the cascade the user
 * triggers is computed live. If those two ever disagree, a bright dot lands at a
 * rank that does not describe what just happened on the stage.
 */
describe('baked profiles agree with live cascades', () => {
  it('matches on every alpha stop, sampled across the grid', () => {
    SLACK_STOPS.forEach((alpha, ai) => {
      const cap = capacities(g, alpha);
      for (const n of [0, 22, 63, 101, 179]) {
        expect(cascade(g, cap, n).darkFrac).toBeCloseTo(profileData.perNode[ai]![n]!, 5);
      }
    });
  });

  it('ships one value per node per stop', () => {
    expect(profileData.perNode.length).toBe(SLACK_STOPS.length);
    for (const p of profileData.perNode) expect(p.length).toBe(NODES);
  });

  it('was baked from this graph', () => {
    expect(profileData.meta.edges).toBe(g.edges.length);
    expect(profileData.nodes).toBe(g.n);
  });
});

/**
 * The on-ramp's two claims are properties of the graph, not of the copy. If the
 * grid is ever retuned and these fail, the beats are lying and must be rewritten
 * — that is the point of asserting them (🔒 ticket 07, fork 7).
 */
describe('the on-ramp’s claims are true of the actual grid', () => {
  const degs = [...g.deg].sort((a, b) => a - b);
  const median = degs[degs.length >> 1]!;

  it('beat 2: the most-connected node is absorbed', () => {
    const hub = hubNode(g);
    expect(g.deg[hub]).toBe(degs[degs.length - 1]);
    expect(fracs[hub]!).toBeLessThan(0.05);
  });

  it('beat 3: the ringed node is catastrophic and looks utterly ordinary', () => {
    const ring = pickRing(g, fracs);
    expect(fracs[ring]!).toBeGreaterThan(0.5);
    expect(g.deg[ring]!).toBeLessThanOrEqual(median);
  });

  it('the killers are rare — a handful out of a hundred and eighty', () => {
    const k = lethalCount(fracs);
    expect(k).toBeGreaterThan(0);
    expect(k).toBeLessThanOrEqual(12);
  });

  it('cutting the slack widens the cliff', () => {
    const counts = profileData.perNode.map((p) => lethalCount(p));
    // Stops run low slack → high slack, so lethal counts must never rise.
    for (let i = 1; i < counts.length; i++) expect(counts[i]!).toBeLessThanOrEqual(counts[i - 1]!);
  });
});

describe('ranking', () => {
  it('sorts descending and keeps every value', () => {
    const r = ranked(fracs);
    expect(r.length).toBe(fracs.length);
    for (let i = 1; i < r.length; i++) expect(r[i]!).toBeLessThanOrEqual(r[i - 1]!);
  });

  it('puts a node at the rank whose value is its own', () => {
    const r = ranked(fracs);
    for (const n of [0, 22, 63, 140]) expect(r[rankOf(fracs, n) - 1]).toBeCloseTo(fracs[n]!, 9);
  });

  it('gives every node a distinct rank', () => {
    const seen = new Set(fracs.map((_, i) => rankOf(fracs, i)));
    expect(seen.size).toBe(fracs.length);
  });
});

describe('profile()', () => {
  it('reproduces the baked default stop exactly', () => {
    expect(profile(g, DEFAULT_SLACK).map((v) => Number(v.toFixed(6)))).toEqual(fracs);
  });
});
