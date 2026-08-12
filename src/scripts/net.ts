import net from '../data/network-profile.json';
import { HEIGHT, TEAL, lerpStops, type RGB } from '../lib/palette.ts';
import { KEY_NET_WORST } from '../lib/net-config.ts';
import {
  DEFAULT_SLACK,
  SLACK_STOPS,
  type Cascade,
  type Graph,
  capacities,
  cascade,
  createGrid,
  hubNode,
  pickRing,
} from '../lib/network.ts';
import { attachProfile, type ProfileHandle } from './profile.ts';
import { createGraphStage, type GraphStage } from './graph-stage.ts';

/**
 * The network instrument (🔒 ticket 07). One canonical grid; the user takes a
 * node offline and watches the consequences run, then the grid comes back up for
 * the next attempt (fork 3). Three readouts carry the spine: `tried` counts the
 * failures to break it, then one node reads 78% dark.
 *
 * Two time bases share nothing here (unlike the sandpile's) because there is no
 * batched "weather": a cascade is a single event that animates, and the restore
 * is a quick relight. Everything the user does is an event.
 */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAGE_MAX_H = 520;
/** The resting field is dimmed so a white-hot failure keeps its contrast. */
const NODE_DIM = 0.72;
/** Ticks a failing node stays in the glowing front before it is just dark. */
const BAND = 8;
/** Ticks between cascade rounds — a round of failures flashes, then the next. */
const ROUND_TICKS = 5;
const RESTORE_MS = 600;
/** How long the blacked-out grid stays on screen before the lights sweep back. */
const HOLD_MS = 1500;

export type NetPhase = 'beat1' | 'beat2' | 'beat3' | 'sandbox';

export interface NetHandle {
  onEvent(cb: (c: Cascade, node: number) => void): void;
  knockOut(node: number): void;
  hubNode(): number;
  ringNode(): number;
  showRing(node: number | null): void;
  focusNode(node: number): void;
  spotlightHub(on: boolean): void;
  setControls(mode: NetPhase): void;
  reset(): void;
  setAlpha(alpha: number): void;
  plot: ProfileHandle;
}

export function createNetExhibit(root: HTMLElement, opts: { seed?: number } = {}): NetHandle {
  const g: Graph = createGrid(opts.seed);
  const n = g.n;
  const canvas = root.querySelector<HTMLCanvasElement>('#stage')!;
  const svg = root.querySelector<SVGSVGElement>('#plot')!;
  const triedVal = root.querySelector<HTMLElement>('.triedval')!;
  const darkVal = root.querySelector<HTMLElement>('.darkval')!;
  const worstRow = root.querySelector<HTMLElement>('.worst')!;
  const worstVal = root.querySelector<HTMLElement>('.worstval')!;
  const slackInput = root.querySelector<HTMLInputElement>('.slack')!;
  const slackVal = root.querySelector<HTMLElement>('.slackval')!;
  const ring = root.querySelector<HTMLElement>('.stage-ring')!;
  const cursor = root.querySelector<HTMLElement>('.stage-cursor')!;

  let alpha = DEFAULT_SLACK;
  let cap = capacities(g, alpha);
  const hub = hubNode(g);
  let ringAt = -1;
  let focusAt = 0;
  let tried = 0;
  let worst = 0;
  let ringOn = false;

  /** Per-node state for rendering. `alive` is the resting truth; during an
   *  animation `deadAt`/`igTick` drive the reveal so the front shows the failure
   *  spreading rather than the end state appearing at once. */
  const alive = new Uint8Array(n).fill(1);
  const igTick = new Int32Array(n).fill(-1);
  const flashed = new Uint8Array(n); // failed by overload (glows); islanded do not

  const eventCbs: ((c: Cascade, node: number) => void)[] = [];

  /** Cool teal at rest, varied per node so the field is not a flat wash; dark when
   *  it has lost power. */
  function nodeColor(i: number): RGB | null {
    if (!alive[i]) return null;
    const t = 0.35 + 0.5 * ((Math.sin(i * 12.9) + 1) / 2);
    const c = lerpStops(TEAL, t);
    return [c[0] * NODE_DIM, c[1] * NODE_DIM, c[2] * NODE_DIM];
  }

  const stage: GraphStage = createGraphStage(canvas, {
    n,
    xs: g.xs,
    ys: g.ys,
    edges: g.edges,
    weight: (i) => g.deg[i]!,
    color: nodeColor,
    live: (i) => alive[i] === 1,
  });
  const plot: ProfileHandle = attachProfile(svg);

  const fmtPct = (frac: number) => {
    const p = frac * 100;
    return p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`;
  };

  function paintReadout(c: Cascade | null) {
    triedVal.textContent = String(tried);
    if (c) darkVal.textContent = fmtPct(c.darkFrac);
  }

  function recordWorst(frac: number) {
    if (frac <= worst) return;
    worst = frac;
    worstRow.hidden = false;
    worstVal.textContent = fmtPct(frac);
    try {
      const prev = Number(localStorage.getItem(KEY_NET_WORST) ?? 0);
      if (!(prev >= frac)) localStorage.setItem(KEY_NET_WORST, String(frac));
    } catch {
      /* private mode — the coda's ★ is simply absent */
    }
  }

  function placeOverlay(el: HTMLElement, node: number) {
    const r = stage.nodeRect(node);
    el.style.left = `${canvas.offsetLeft + r.x}px`;
    el.style.top = `${canvas.offsetTop + r.y}px`;
    el.style.width = `${r.w}px`;
    el.style.height = `${r.w}px`;
  }

  /* ── the cascade animation ────────────────────────────────────────────────── */
  let raf = 0;
  let tick = 0;
  let maxIg = 0;
  let anim: { c: Cascade; node: number } | null = null;
  let busy = false;

  const frontAge = (i: number) => Math.max(0, Math.min(1, (tick - igTick[i]!) / BAND));

  function frontNodes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!flashed[i] || igTick[i]! < 0) continue;
      const d = tick - igTick[i]!;
      if (d >= 0 && d <= BAND) out.push(i);
    }
    return out;
  }

  function frame() {
    tick++;
    // A node goes dark the instant its ignition tick passes.
    for (let i = 0; i < n; i++) if (igTick[i]! >= 0 && tick >= igTick[i]! && alive[i]) alive[i] = 0;
    const front = frontNodes();
    if (tick <= maxIg + BAND) {
      stage.paintFront(front, frontAge, performance.now());
      raf = requestAnimationFrame(frame);
    } else {
      finishAnim();
    }
  }

  function finishAnim() {
    cancelAnimationFrame(raf);
    raf = 0;
    const a = anim!;
    anim = null;
    stage.paint();
    landEvent(a.c, a.node);
    // Hold the dark grid before the lights come back (🔒 ticket 07, D8 keeps the
    // restore; this only delays it). The cascade plus the relight ran straight
    // through in well under a second, so on a phone — where you tap, then look —
    // the grid was already whole again by the time you looked up, and the
    // readout was describing a state that was no longer on screen.
    holdTimer = window.setTimeout(restore, HOLD_MS);
  }

  /** The event lands: the readouts, the record, and the bright plot dot at rank. */
  function landEvent(c: Cascade, node: number) {
    paintReadout(c);
    recordWorst(c.darkFrac);
    plot.addTry(node);
    eventCbs.forEach((cb) => cb(c, node));
  }

  function knockOut(node: number) {
    // A tap during the hold means they are done looking: drop the dark grid,
    // relight instantly and run the new one. The hold guarantees the result is
    // seen; it must not also make the exhibit feel locked.
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = 0;
      alive.fill(1);
      busy = false;
    }
    if (busy || !alive[node]) return;
    busy = true;
    tried++;
    const c = cascade(g, cap, node);

    // Assign each failed node an ignition tick by the round it failed in, so the
    // failure visibly spreads. Islanded nodes fade at the end WITHOUT a flash —
    // overload and starvation are physically different (🔒 ticket 07, D6).
    igTick.fill(-1);
    flashed.fill(0);
    c.rounds.forEach((round, r) => {
      for (const i of round) {
        igTick[i] = r * ROUND_TICKS;
        flashed[i] = 1;
      }
    });
    maxIg = (c.rounds.length - 1) * ROUND_TICKS;
    const islandTick = maxIg + Math.ceil(BAND * 0.4);
    for (const i of c.islanded) igTick[i] = islandTick; // dark, no flash
    maxIg = Math.max(maxIg, islandTick);

    if (REDUCED) {
      for (let i = 0; i < n; i++) if (!c.alive[i]) alive[i] = 0;
      stage.paint();
      landEvent(c, node);
      restore();
      return;
    }

    tick = 0;
    anim = { c, node };
    raf = requestAnimationFrame(frame);
  }

  /* ── restore: the grid comes back up (🔒 ticket 07, D8) ───────────────────── */
  let restoreRaf = 0;
  let holdTimer = 0;
  let restoreStart = 0;
  /** Relight order: left to right, so it reads as power sweeping back in. */
  const relightOrder = [...Array(n).keys()].sort((a, b) => g.xs[a]! - g.xs[b]!);

  function restore() {
    if (REDUCED) {
      alive.fill(1);
      stage.paint();
      busy = false;
      return;
    }
    restoreStart = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - restoreStart) / RESTORE_MS);
      const upto = Math.floor(t * n);
      for (let k = 0; k < upto; k++) alive[relightOrder[k]!] = 1;
      stage.paint();
      if (t < 1) {
        restoreRaf = requestAnimationFrame(step);
      } else {
        alive.fill(1);
        stage.paint();
        busy = false;
      }
    };
    restoreRaf = requestAnimationFrame(step);
  }

  /* ── wiring ───────────────────────────────────────────────────────────────── */

  canvas.addEventListener('click', (e) => {
    const node = stage.nodeAt(e.clientX, e.clientY);
    if (node == null) return;
    focusAt = node;
    knockOut(node);
  });

  canvas.addEventListener('keydown', (e) => {
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    else if (e.key === 'ArrowUp') dy = -1;
    else if (e.key === 'ArrowDown') dy = 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      knockOut(focusAt);
      return;
    } else return;
    e.preventDefault();
    focusAt = stage.step(focusAt, dx, dy);
    placeOverlay(cursor, focusAt);
  });

  canvas.addEventListener('focus', () => {
    if (!canvas.matches(':focus-visible')) return;
    placeOverlay(cursor, focusAt);
    cursor.dataset.on = 'true';
  });
  canvas.addEventListener('blur', () => (cursor.dataset.on = 'false'));

  root.querySelector('[data-act=knock]')!.addEventListener('click', () => knockOut(focusAt));
  root.querySelector('[data-act=reset]')!.addEventListener('click', () => reset());

  /** `slack` snaps to a baked stop — only those profiles exist (🔒 ticket 07, D3). */
  function snap(v: number): number {
    let best: number = SLACK_STOPS[0]!;
    for (const s of SLACK_STOPS) if (Math.abs(s - v) < Math.abs(best - v)) best = s;
    return best;
  }
  slackInput.addEventListener('input', () => {
    const a = snap(parseFloat(slackInput.value));
    slackInput.value = String(a);
    setAlpha(a);
  });

  function setAlpha(a: number) {
    alpha = a;
    cap = capacities(g, alpha);
    slackVal.textContent = a.toFixed(2);
    plot.setAlpha(a);
  }

  function reset() {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(restoreRaf);
    clearTimeout(holdTimer);
    raf = restoreRaf = holdTimer = 0;
    busy = false;
    anim = null;
    alive.fill(1);
    tried = 0;
    worst = 0;
    worstRow.hidden = true;
    worstVal.textContent = '—';
    darkVal.textContent = '0%';
    paintReadout(null);
    plot.clear();
    stage.paint();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) {
      // A backgrounded tab must not leave the cascade half-lit; finish it to dark.
      cancelAnimationFrame(raf);
      raf = 0;
      if (anim) {
        for (let i = 0; i < n; i++) if (!anim.c.alive[i]) alive[i] = 0;
        stage.paint();
        const a = anim;
        anim = null;
        landEvent(a.c, a.node);
        restore();
      }
    }
  });

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      stage.resize(canvas.parentElement!.getBoundingClientRect().width, STAGE_MAX_H);
      stage.paint();
      if (ringOn && ringAt >= 0) placeOverlay(ring, ringAt);
      if (cursor.dataset.on === 'true') placeOverlay(cursor, focusAt);
    }, 120);
  });

  stage.resize(canvas.parentElement!.getBoundingClientRect().width, STAGE_MAX_H);
  stage.paint();
  paintReadout(null);

  return {
    onEvent(cb) {
      eventCbs.push(cb);
    },
    knockOut,
    hubNode: () => hub,
    ringNode() {
      ringAt = pickRing(g, net.perNode[net.alphas.indexOf(alpha)] ?? net.perNode[net.alphas.indexOf(DEFAULT_SLACK)]!);
      return ringAt;
    },
    showRing(node) {
      if (node == null || node < 0) {
        ring.dataset.on = 'false';
        ringOn = false;
        return;
      }
      ringAt = node;
      placeOverlay(ring, node);
      ring.dataset.on = 'true';
      ringOn = true;
    },
    focusNode(node) {
      focusAt = node;
      if (cursor.dataset.on === 'true') placeOverlay(cursor, node);
    },
    spotlightHub(on) {
      if (on) {
        root.dataset.spotlight = 'stage';
        placeOverlay(ring, hub);
        ring.dataset.on = 'true';
        ring.dataset.hub = 'true';
        ringOn = true;
        ringAt = hub;
      } else {
        delete ring.dataset.hub;
      }
    },
    setControls(mode) {
      root.dataset.phase = mode;
      const show = (sel: string, on: boolean) => {
        const el = root.querySelector<HTMLElement>(sel);
        if (el) el.hidden = !on;
      };
      show('[data-control=slack]', mode === 'sandbox');
      show('[data-act=reset]', mode === 'sandbox');
      if (mode === 'sandbox') delete root.dataset.spotlight;
      else root.dataset.spotlight = 'stage';
    },
    reset,
    setAlpha,
    plot,
  };
}
