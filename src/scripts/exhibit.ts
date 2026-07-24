import {
  buildField,
  burn,
  largestClusterMask,
  largestClusterSpark,
  nearestTree,
  nearestTreeWhere,
  type Burn,
  type Field,
} from '../lib/forest-fire.ts';
import { attachPlot, type PlotHandle } from './plot.ts';
import { createStage, type Stage } from './stage.ts';

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

  const stage: Stage = createStage(canvas, W, H);
  const plot: PlotHandle = attachPlot(svg);

  let seed = opts.seed;
  let field: Field = buildField(W, H, seed);
  let density = opts.startD;
  let sparkCell = -1;
  let result: Burn | null = null;
  let tick = 0;
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
    stage.paintAll(field, density, result, 0);

    if (result.spark < 0) {
      sweptVal.textContent = '—';
      return;
    }

    const band = stage.bandFor(result);

    if (REDUCED) {
      // Before/after state: paint the finished burn, no animated spread.
      tick = result.maxTick + band;
      stage.paintAll(field, density, result, tick);
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
        if (spent) stage.ageOut(spent, field);
      }
      if (tick <= result!.maxTick + band) {
        stage.paintFrame(field, result!, tick, performance.now());
        raf = requestAnimationFrame(step);
      } else {
        stage.paintAll(field, density, result!, tick);
        finish();
      }
    };
    raf = requestAnimationFrame(step);
  }

  function repaintIdle() {
    stopLoop();
    result = null;
    stage.paintAll(field, density, null, 0);
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
    stage.paintAll(field, density, result, tick);
    if (result && result.spark >= 0) stage.paintFrame(field, result, tick, 0);
  });

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      stage.resize(canvas.parentElement!.getBoundingClientRect().width);
      stage.paintAll(field, density, result, tick);
      if (result) stage.paintFrame(field, result, tick, 0);
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
