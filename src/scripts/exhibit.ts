import {
  buildField,
  burn,
  isTree,
  largestClusterMask,
  largestClusterSpark,
  nearestTreeWhere,
  type Burn,
  type Field,
} from '../lib/forest-fire.ts';
import { SCAR, TEAL, lerpStops, type RGB } from '../lib/palette.ts';
import { attachPlot, type PlotHandle } from './plot.ts';
import { bandFor, createStage, type Stage } from './stage.ts';

/** The forest dims so the burning front keeps its contrast (locked look, ticket 01). */
const FOREST_DIM = 0.52;

export interface ExhibitOpts {
  grid: { W: number; H: number };
  seed: number;
  startD: number;
}

export interface ExhibitHandle {
  setDensity(d: number): void;
  getDensity(): number;
  sparkAt(i: number): void;
  setControlsMode(mode: 'onramp' | 'sandbox'): void;
  spotlight(which: 'stage' | 'density' | 'none'): void;
  onTrial(cb: (d: number, frac: number) => void): void;
  /**
   * Restrict sparks to trees that join the spanning cluster at `atDensity`.
   * The on-ramp sets this so beat 3's promised sweep is guaranteed; the free
   * sandbox passes null and any tree is fair game.
   */
  setSparkConstraint(atDensity: number | null): void;
  plot: PlotHandle;
}

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createExhibit(root: HTMLElement, opts: ExhibitOpts): ExhibitHandle {
  const { W, H } = opts.grid;
  const canvas = root.querySelector<HTMLCanvasElement>('#stage')!;
  const svg = root.querySelector<SVGSVGElement>('#plot')!;
  const dSlider = root.querySelector<HTMLInputElement>('.density')!;
  const dVal = root.querySelector<HTMLElement>('.dval')!;
  const speed = root.querySelector<HTMLInputElement>('.speed')!;
  const sweptVal = root.querySelector<HTMLElement>('.sweptval')!;
  const seedVal = root.querySelector<HTMLElement>('.seedval')!;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-act=play]')!;

  let seed = opts.seed;
  let field: Field = buildField(W, H, seed);
  let density = opts.startD;
  let sparkCell = -1;
  let result: Burn | null = null;
  let tick = 0;

  /**
   * The resting colour of a cell: latent forest, or charcoal scar once the front
   * has passed over it. Cells inside the glowing band get their scar painted here
   * too and `paintFront` overdraws them — without that they would be holes in any
   * frame the front doesn't cover (idle, tab-restore, resize).
   */
  function cellBg(i: number): RGB | null {
    if (!isTree(field, i, density)) return null;
    const t = result ? result.ig[i]! : -1;
    if (t < 0 || t > tick) {
      const c = lerpStops(TEAL, field.shade[i]!);
      return [c[0] * FOREST_DIM, c[1] * FOREST_DIM, c[2] * FOREST_DIM];
    }
    const g = 0.72 + 0.5 * field.shade[i]!;
    return [SCAR[0] * g, SCAR[1] * g, SCAR[2] * g];
  }

  const stage: Stage = createStage(canvas, { W, H, bg: cellBg });
  const plot: PlotHandle = attachPlot(svg);
  let raf = 0;
  let playing = false;
  const trialCbs: ((d: number, frac: number) => void)[] = [];

  let constraintD: number | null = null;
  let maskCache: Uint8Array | null = null;
  function sparkOk(): (i: number) => boolean {
    if (constraintD == null) return () => true;
    if (!maskCache) maskCache = largestClusterMask(field, constraintD);
    const mask = maskCache;
    return (i) => mask[i] === 1;
  }

  const showSeed = () => (seedVal.textContent = `0x${(seed >>> 0).toString(16).toUpperCase()}`);

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /** A real but tiny burn must not read as a flat "0%" — that's beat 1's whole point. */
  const sweptText = (frac: number) => (frac > 0 && frac < 0.005 ? '<1%' : `${Math.round(frac * 100)}%`);

  function finish() {
    if (!result) return;
    sweptVal.textContent = sweptText(result.frac);
    plot.addTrial(density, result.frac);
    const frac = result.frac;
    trialCbs.forEach((cb) => cb(density, frac));
  }

  /** Run the fixed spark at the current density, animating the front. */
  function runBurn() {
    stopLoop();
    if (sparkCell >= 0 && !(field.r[sparkCell]! < density)) {
      // The fixed spark's cell may not be a tree at a lower density — snap out.
      sparkCell = nearestTreeWhere(field, density, sparkCell % W, Math.floor(sparkCell / W), sparkOk());
    }
    result = burn(field, density, sparkCell);
    tick = 0;
    stage.paintAll();

    if (result.spark < 0) {
      sweptVal.textContent = '—';
      return;
    }

    const band = bandFor(result.maxTick);

    if (REDUCED) {
      // Before/after state: paint the finished burn, no animated spread.
      tick = result.maxTick + band;
      stage.paintAll();
      finish();
      return;
    }

    // Speed scales how many sim ticks a frame advances; 1 = one tick per frame.
    let acc = 0;
    const step = () => {
      acc += parseFloat(speed.value) || 1;
      while (acc >= 1 && tick <= result!.maxTick + band) {
        acc -= 1;
        tick++;
        const spent = result!.buckets[tick - band];
        if (spent) stage.paintCells(spent); // aged out of the band → permanent scar in the cache
      }
      if (tick <= result!.maxTick + band) {
        stage.paintFront(frontCells(result!, band), (i) => frontAge(result!, i, band), performance.now());
        raf = requestAnimationFrame(step);
      } else {
        stage.paintAll();
        finish();
      }
    };
    raf = requestAnimationFrame(step);
  }

  /** The cells still glowing: everything ignited within `band` ticks of now. */
  function frontCells(b: Burn, band: number): number[] {
    const front: number[] = [];
    for (let t = Math.max(0, tick - band + 1); t <= Math.min(tick, b.maxTick); t++) {
      const bucket = b.buckets[t];
      if (bucket) front.push(...bucket);
    }
    return front;
  }

  const frontAge = (b: Burn, i: number, band: number) => Math.max(0, Math.min(1, (tick - b.ig[i]!) / band));

  function repaintIdle() {
    stopLoop();
    result = null;
    stage.paintAll();
    sweptVal.textContent = '—';
  }

  function setDensity(d: number) {
    density = d;
    dSlider.value = String(d);
    dVal.textContent = d.toFixed(3);
    plot.setMarker(d);
    if (sparkCell >= 0) runBurn();
    else repaintIdle();
  }

  function sparkAt(i: number) {
    sparkCell = i;
    runBurn();
  }

  dSlider.addEventListener('input', () => setDensity(parseFloat(dSlider.value)));

  canvas.addEventListener('click', (e) => {
    const c = stage.cellAt(e.clientX, e.clientY);
    if (!c) return;
    const t = nearestTreeWhere(field, density, c.x, c.y, sparkOk()); // an empty tap snaps to a tree
    if (t >= 0) sparkAt(t);
  });

  canvas.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const t =
      constraintD == null
        ? largestClusterSpark(field, density)
        : nearestTreeWhere(field, density, W >> 1, H >> 1, sparkOk());
    if (t >= 0) sparkAt(t);
  });

  root.querySelector('[data-act=spark]')!.addEventListener('click', () => {
    if (sparkCell >= 0) return sparkAt(sparkCell);
    const t =
      constraintD == null
        ? largestClusterSpark(field, density)
        : nearestTreeWhere(field, density, W >> 1, H >> 1, sparkOk());
    if (t >= 0) sparkAt(t);
  });

  root.querySelector('[data-act=shuffle]')!.addEventListener('click', () => {
    seed = (seed + 0x9e37) >>> 0; // Shuffle is the ONLY re-randomiser
    field = buildField(W, H, seed);
    maskCache = null;
    showSeed();
    sparkCell = -1;
    repaintIdle();
  });

  root.querySelector('[data-act=reset]')!.addEventListener('click', () => {
    seed = opts.seed;
    field = buildField(W, H, seed);
    maskCache = null;
    showSeed();
    sparkCell = -1;
    playing = false;
    playBtn.textContent = '▷ Play';
    plot.clearTrials();
    setDensity(opts.startD);
  });

  playBtn.addEventListener('click', () => {
    if (REDUCED) return;
    playing = !playing;
    playBtn.textContent = playing ? '❚❚ Pause' : '▷ Play';
    playBtn.setAttribute('aria-pressed', String(playing));
    if (playing && sparkCell >= 0) runBurn();
    else stopLoop();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop(); // never burn rAF in a background tab
      return;
    }
    // Coming back: the loop was cut mid-burn, so repaint the current state
    // rather than leaving whatever half-frame was on screen.
    repaintCurrent();
  });

  function repaintCurrent() {
    stage.paintAll();
    if (result && result.spark >= 0) {
      const band = bandFor(result.maxTick);
      stage.paintFront(frontCells(result, band), (i) => frontAge(result!, i, band), 0);
    }
  }

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      stage.resize(canvas.parentElement!.getBoundingClientRect().width);
      repaintCurrent();
    }, 120);
  });

  showSeed();
  // Sync the SSR'd slider/readout to the starting density — a returning visitor
  // opens at the sandbox density, not the markup's on-ramp default.
  setDensity(opts.startD);

  return {
    setDensity,
    getDensity: () => density,
    sparkAt,
    plot,
    setControlsMode(mode) {
      root.querySelectorAll<HTMLElement>('[data-sandbox-only]').forEach((el) => {
        el.hidden = mode === 'onramp';
      });
    },
    spotlight(which) {
      if (which === 'none') delete root.dataset.spotlight;
      else root.dataset.spotlight = which;
    },
    onTrial(cb) {
      trialCbs.push(cb);
    },
    setSparkConstraint(atDensity) {
      constraintD = atDensity;
      maskCache = null;
    },
  };
}
