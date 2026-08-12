import { grainJitter, reliefShade, sandColor, type RGB } from '../lib/palette.ts';
import { KEY_PILE_BIGGEST } from '../lib/pile-config.ts';
import {
  CHARGE_GRAINS,
  CRITICAL_SLOPE,
  PILE,
  createPile,
  drop,
  pickRing,
  slope as slopeOf,
  type Avalanche,
  type Pile,
} from '../lib/sandpile.ts';
import { attachSurvival, type SurvivalHandle } from './survival.ts';
import { bandFor, createStage, type Stage } from './stage.ts';

/**
 * The sandpile instrument (🔒 ticket 04). Two time bases, one rAF loop:
 *
 * - **weather** — the charge and the feed run *batched*: thousands of drops a
 *   frame, no per-avalanche animation, and only the dial and the field's warmth
 *   move. Weather never plots (🔒 ticket 05, D1) — plotting beat 2's three
 *   thousand avalanches would draw the whole law before the user drops a grain.
 * - **events** — a single grain the user drops: its avalanche animates as a front
 *   (fire's machinery, unchanged), moves the readout, and lands a plot point.
 */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** The resting field is dimmed (fire's own value) so a white-hot topple keeps its
 *  contrast against a field that is already warm. */
/* Sand is a lit surface, not a dark one. The teal field this replaced could sit
   at half brightness because the warm front read against it on hue alone; sand
   and fire share a hue family, so the resting table carries its own light and
   the front separates on saturation and bloom instead. */
const PILE_DIM = 0.68;
/** A square 64² table in a landscape panel: fit it to the plot panel's height and
 *  centre it, rather than letting a full-width square blow the frame's proportions. */
const STAGE_MAX_H = 510;
/** Grains per second. Paced ≈12s for 15k; fast ≈1.5s; instant blocks once. */
const RATE = { paced: 1250, fast: 10_000 } as const;
const DIAL_MAX = 3;

export type ChargeRate = 'paced' | 'fast' | 'instant';
export type PhaseMode = 'beat1' | 'beat2' | 'beat3' | 'sandbox';

export interface PileHandle {
  /** Pour the seeded charge in at one of three rates (🔒 ticket 05, fork 6). */
  startCharge(rate: ChargeRate): void;
  onCharged(cb: () => void): void;
  /** A user's own drop resolved — the only thing that plots. */
  onEvent(cb: (a: Avalanche, cell: number) => void): void;
  onWeather(cb: (grains: number) => void): void;
  dropAt(cell: number): void;
  slope(): number;
  grains(): number;
  /** The cell whose next grain moves the most. Recomputed per charge. */
  findRing(): number;
  showRing(cell: number | null): void;
  ringCell(): number;
  setControls(mode: PhaseMode): void;
  spotlight(which: 'stage' | 'feed' | 'none'): void;
  focusCell(cell: number): void;
  reset(newSeed: boolean, rate?: ChargeRate): void;
  plot: SurvivalHandle;
}

export function createPileExhibit(root: HTMLElement, opts: { seed: number }): PileHandle {
  const { W, H } = PILE;
  const N = W * H;
  const canvas = root.querySelector<HTMLCanvasElement>('#stage')!;
  const svg = root.querySelector<SVGSVGElement>('#plot')!;
  const dialFill = root.querySelector<HTMLElement>('.dial-fill')!;
  const slopeVal = root.querySelector<HTMLElement>('.slopeval')!;
  const slopeSr = root.querySelector<HTMLElement>('.slope-sr')!;
  const grainsVal = root.querySelector<HTMLElement>('.grainsval')!;
  const cellsVal = root.querySelector<HTMLElement>('.cellsval')!;
  const pairing = root.querySelector<HTMLElement>('.pairing')!;
  const biggestRow = root.querySelector<HTMLElement>('.biggest')!;
  const biggestVal = root.querySelector<HTMLElement>('.biggestval')!;
  const feedBtn = root.querySelector<HTMLButtonElement>('[data-act=feed]')!;
  const speed = root.querySelector<HTMLInputElement>('.speed')!;
  const ring = root.querySelector<HTMLElement>('.stage-ring')!;
  const cursor = root.querySelector<HTMLElement>('.stage-cursor')!;

  let seed = opts.seed;
  let pile: Pile = createPile(seed, W, H);
  let ringAt = -1;
  let cursorAt = (H >> 1) * W + (W >> 1);
  let biggest = 0;
  let hadEvent = false;
  /** The user's own avalanche areas, and the drops behind them — the plot's series. */
  let userSizes: number[] = [];
  let userDrops = 0;

  /* ── rAF state ─────────────────────────────────────────────────────────── */
  let raf = 0;
  let mode: 'idle' | 'batch' | 'anim' = 'idle';
  let last = 0;
  let batchLeft = 0;
  let batchRate = RATE.paced;
  let feeding = false;
  let onBatchDone: (() => void) | null = null;
  /** Height snapshot so an avalanche's rearrangement is revealed BY the front,
   *  not applied before it arrives (`drop` resolves the whole thing at once). */
  let pre: Uint8Array | null = null;
  let reached: Uint8Array = new Uint8Array(N);
  let av: Avalanche | null = null;
  let ig = new Int32Array(N);
  let tick = 0;
  let band = 0;

  const chargedCbs: (() => void)[] = [];
  const eventCbs: ((a: Avalanche, cell: number) => void)[] = [];
  const weatherCbs: ((g: number) => void)[] = [];

  /** Height of cell `i` as currently shown — mid-avalanche, cells the front has
   *  not reached yet are still displaying their pre-event height. */
  function shownH(i: number): number {
    return pre && !reached[i] ? pre[i]! : pile.h[i]!;
  }

  /**
   * The table lit from the upper left: sand ramp by height, then shaded by the
   * rise over the neighbours up and to the left (🔒 ticket 04, fork 3 — the
   * cool→warm *direction* is kept, the hue is not: the field still visibly heats
   * as it self-loads, in sand rather than in the forest's teal).
   */
  function cellBg(i: number): RGB {
    const h = shownH(i);
    const x = i % W;
    const y = (i / W) | 0;
    const c = sandColor(h);
    const s =
      reliefShade(h, x > 0 ? shownH(i - 1) : h, y > 0 ? shownH(i - W) : h) *
      grainJitter(i) *
      PILE_DIM;
    return [Math.min(255, c[0] * s), Math.min(255, c[1] * s), Math.min(255, c[2] * s)];
  }

  const stage: Stage = createStage(canvas, { W, H, bg: cellBg, gap: 0, smooth: true });
  const plot: SurvivalHandle = attachSurvival(svg);

  const fmt = (n: number) => n.toLocaleString('en-US');

  function paintDial() {
    const s = slopeOf(pile);
    dialFill.style.width = `${Math.min(100, (s / DIAL_MAX) * 100)}%`;
    dialFill.dataset.parked = String(s >= CRITICAL_SLOPE - 0.06);
    const txt = s.toFixed(2);
    slopeVal.textContent = txt;
    slopeSr.textContent = txt;
    grainsVal.textContent = fmt(pile.grains);
  }

  /** The left side of the arrow never changes — that invariance is the argument.
   *  It stays greyed until a single grain owns an outcome (🔒 ticket 05, D3). */
  function paintPairing(cells: number | null) {
    if (cells != null) cellsVal.textContent = `${fmt(cells)} cell${cells === 1 ? '' : 's'}`;
    pairing.dataset.weather = String(mode === 'batch' || !hadEvent);
  }

  function recordBiggest(cells: number) {
    if (cells <= biggest) return;
    biggest = cells;
    biggestRow.hidden = false;
    biggestVal.textContent = fmt(cells);
    try {
      const prev = Number(localStorage.getItem(KEY_PILE_BIGGEST) ?? 0);
      if (!(prev >= cells)) localStorage.setItem(KEY_PILE_BIGGEST, String(cells));
    } catch {
      /* private mode — the coda's ★ is simply absent */
    }
  }

  /** Overlays live in the panel, but cell rects are canvas-relative — and a square
   *  table is centred in a landscape panel, so the canvas is inset. Miss this and
   *  the ring points at the wrong cell. */
  function placeOverlay(el: HTMLElement, cell: number) {
    const r = stage.cellRect(cell);
    el.style.left = `${canvas.offsetLeft + r.x}px`;
    el.style.top = `${canvas.offsetTop + r.y}px`;
    el.style.width = `${r.w}px`;
    el.style.height = `${r.w}px`;
  }

  /* ── the loop ──────────────────────────────────────────────────────────── */

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
    mode = 'idle';
  }

  function pump() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function frame(ts: number) {
    // Clamp dt so a backgrounded tab doesn't dump a whole charge in one frame.
    const dt = Math.min(0.1, Math.max(0, (ts - last) / 1000));
    last = ts;
    if (mode === 'batch') {
      const want = Math.max(1, Math.round(batchRate * dt));
      const n = Math.min(want, batchLeft);
      let poured = 0;
      for (let k = 0; k < n; k++) {
        drop(pile, pile.next());
        poured++;
      }
      batchLeft -= poured;
      stage.paintAll();
      paintDial();
      weatherCbs.forEach((cb) => cb(poured));
      if (batchLeft <= 0) {
        stopLoop();
        paintPairing(null);
        const done = onBatchDone;
        onBatchDone = null;
        if (feeding) setFeeding(false);
        done?.();
        return;
      }
    } else if (mode === 'anim' && av) {
      const step = parseFloat(speed.value) || 1;
      let acc = step;
      while (acc >= 1) {
        acc -= 1;
        tick++;
        const bucket = av.buckets[tick];
        if (bucket) revealTick(bucket);
      }
      if (tick <= av.maxTick + band) {
        stage.paintFront(frontCells(), frontAge, performance.now());
      } else {
        finishAnim();
        return;
      }
    } else {
      stopLoop();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  /** The cells this tick's topples changed — the toppler and everyone it fed. */
  function revealTick(bucket: number[]) {
    const cells: number[] = [];
    for (const c of bucket) {
      reached[c] = 1;
      cells.push(c);
      const x = c % W;
      const y = (c / W) | 0;
      if (x > 0) cells.push(c - 1);
      if (x < W - 1) cells.push(c + 1);
      if (y > 0) cells.push(c - W);
      if (y < H - 1) cells.push(c + W);
    }
    for (const c of cells) reached[c] = 1;
    stage.paintCells(cells);
  }

  function frontCells(): number[] {
    const out: number[] = [];
    for (let t = Math.max(0, tick - band + 1); t <= Math.min(tick, av!.maxTick); t++) {
      const b = av!.buckets[t];
      if (b) out.push(...b);
    }
    return out;
  }

  const frontAge = (i: number) => Math.max(0, Math.min(1, (tick - ig[i]!) / band));

  function finishAnim() {
    stopLoop();
    pre = null;
    stage.paintAll();
    paintDial();
    const a = av!;
    av = null;
    landEvent(a);
  }

  /** An event lands: the readout, the record, and the one new plot point. */
  function landEvent(a: Avalanche) {
    hadEvent = true;
    paintPairing(a.cells);
    if (a.cells > 0) {
      userSizes.push(a.cells);
      recordBiggest(a.cells);
    }
    userDrops++;
    plot.setUser(userSizes, userDrops);
    eventCbs.forEach((cb) => cb(a, a.buckets[0]?.[0] ?? -1));
  }

  /* ── actions ───────────────────────────────────────────────────────────── */

  function startBatch(grains: number, rate: number, done?: () => void) {
    if (mode === 'anim') return;
    stopLoop();
    batchLeft = grains;
    batchRate = rate;
    onBatchDone = done ?? null;
    mode = 'batch';
    paintPairing(null);
    pump();
  }

  function startCharge(rate: ChargeRate) {
    if (rate === 'instant') {
      for (let k = 0; k < CHARGE_GRAINS; k++) drop(pile, pile.next());
      stage.paintAll();
      paintDial();
      chargedCbs.forEach((cb) => cb());
      return;
    }
    startBatch(CHARGE_GRAINS, rate === 'paced' ? RATE.paced : RATE.fast, () =>
      chargedCbs.forEach((cb) => cb()),
    );
  }

  function dropAt(cell: number) {
    if (mode === 'anim') return;
    if (feeding) setFeeding(false);
    stopLoop();
    pre = Uint8Array.from(pile.h);
    reached.fill(0);
    const a = drop(pile, cell);
    if (a.cells === 0) {
      // A grain that moves nothing is still an honest event: beat 1's baseline.
      pre = null;
      stage.paintCells([cell]);
      stage.blit();
      paintDial();
      landEvent(a);
      return;
    }
    ig.fill(-1);
    a.buckets.forEach((b, t) => {
      for (const c of b) if (ig[c]! < 0) ig[c] = t;
    });
    av = a;
    tick = 0;
    band = bandFor(a.maxTick);

    if (REDUCED) {
      // Immediate before/after swap; the outcome rides the readout + the plot point.
      pre = null;
      stage.paintAll();
      paintDial();
      landEvent(a);
      av = null;
      return;
    }
    revealTick(a.buckets[0]!);
    mode = 'anim';
    pump();
  }

  function setFeeding(on: boolean) {
    feeding = on;
    feedBtn.textContent = on ? '❚❚ Feed' : '▷ Feed';
    feedBtn.setAttribute('aria-pressed', String(on));
    if (on) startBatch(Infinity, RATE.paced * (parseFloat(speed.value) || 1));
    else {
      batchLeft = 0;
      onBatchDone = null;
      if (mode === 'batch') {
        stopLoop();
        paintPairing(null);
      }
    }
  }

  function reset(newSeed: boolean, rate: ChargeRate = 'fast') {
    stopLoop();
    if (feeding) setFeeding(false);
    if (newSeed) seed = (seed + 0x9e37) >>> 0;
    pile = createPile(seed, W, H);
    userSizes = [];
    userDrops = 0;
    biggest = 0;
    hadEvent = false;
    biggestRow.hidden = true;
    biggestVal.textContent = '—';
    cellsVal.textContent = '0 cells';
    ringAt = -1;
    ring.dataset.on = 'false';
    plot.clear();
    stage.paintAll();
    paintDial();
    // Skip, return and Reset always leave a CHARGED pile — never a dead flat
    // table (🔒 ticket 05, fork 6).
    startCharge(rate);
  }

  /* ── wiring ────────────────────────────────────────────────────────────── */

  canvas.addEventListener('click', (e) => {
    const c = stage.cellAt(e.clientX, e.clientY);
    if (!c) return;
    cursorAt = c.i;
    dropAt(c.i);
  });

  canvas.addEventListener('keydown', (e) => {
    const x = cursorAt % W;
    const y = (cursorAt / W) | 0;
    let nx = x;
    let ny = y;
    if (e.key === 'ArrowLeft') nx--;
    else if (e.key === 'ArrowRight') nx++;
    else if (e.key === 'ArrowUp') ny--;
    else if (e.key === 'ArrowDown') ny++;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dropAt(cursorAt);
      return;
    } else return;
    e.preventDefault();
    cursorAt = Math.min(H - 1, Math.max(0, ny)) * W + Math.min(W - 1, Math.max(0, nx));
    placeOverlay(cursor, cursorAt);
  });

  canvas.addEventListener('focus', () => {
    // Keyboard focus only — a cyan cell after a mouse click is just noise.
    if (!canvas.matches(':focus-visible')) return;
    placeOverlay(cursor, cursorAt);
    cursor.dataset.on = 'true';
  });
  canvas.addEventListener('blur', () => (cursor.dataset.on = 'false'));

  root.querySelector('[data-act=drop]')!.addEventListener('click', () => dropAt(cursorAt));
  feedBtn.addEventListener('click', () => setFeeding(!feeding));
  speed.addEventListener('input', () => {
    if (feeding) batchRate = RATE.paced * (parseFloat(speed.value) || 1);
  });
  root.querySelector('[data-act=shuffle]')!.addEventListener('click', () => reset(true));
  root.querySelector('[data-act=reset]')!.addEventListener('click', () => reset(false));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (mode !== 'idle') stopLoop(); // never burn rAF in a background tab
      stage.paintAll();
    }
  });

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      stage.resize(canvas.parentElement!.getBoundingClientRect().width, STAGE_MAX_H);
      stage.paintAll();
      if (ringAt >= 0) placeOverlay(ring, ringAt);
      if (cursor.dataset.on === 'true') placeOverlay(cursor, cursorAt);
    }, 120);
  });

  stage.resize(canvas.parentElement!.getBoundingClientRect().width, STAGE_MAX_H);
  stage.paintAll();
  paintDial();

  return {
    startCharge,
    onCharged(cb) {
      chargedCbs.push(cb);
    },
    onEvent(cb) {
      eventCbs.push(cb);
    },
    onWeather(cb) {
      weatherCbs.push(cb);
    },
    dropAt,
    slope: () => slopeOf(pile),
    grains: () => pile.grains,
    findRing() {
      ringAt = pickRing(pile).cell;
      return ringAt;
    },
    showRing(cell) {
      if (cell == null || cell < 0) {
        ring.dataset.on = 'false';
        return;
      }
      ringAt = cell;
      placeOverlay(ring, cell);
      ring.dataset.on = 'true';
    },
    ringCell: () => ringAt,
    setControls(m) {
      root.dataset.phase = m;
      const show = (sel: string, on: boolean) => {
        const el = root.querySelector<HTMLElement>(sel);
        if (el) el.hidden = !on;
      };
      show('[data-act=feed]', m === 'beat2' || m === 'sandbox');
      show('[data-control=speed]', m === 'beat2' || m === 'sandbox');
      show('[data-act=shuffle]', m === 'sandbox');
      show('[data-act=reset]', m === 'sandbox');
      // Beat 3 is one grain, so the feed cannot be running through the payoff.
      if (m === 'beat3' && feeding) setFeeding(false);
    },
    spotlight(which) {
      if (which === 'none') delete root.dataset.spotlight;
      else root.dataset.spotlight = which;
    },
    focusCell(cell) {
      cursorAt = cell;
      if (cursor.dataset.on === 'true') placeOverlay(cursor, cell);
    },
    reset,
    plot,
  };
}
