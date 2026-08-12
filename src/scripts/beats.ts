import { BEATS, SANDBOX_LESSON, SANDBOX_PROMPT, SKIP_D, type BeatState } from '../lib/beats-config.ts';
import { D_C } from '../lib/forest-fire.ts';
import { onRampComplete as complete, runBeats } from './beat-runner.ts';
import type { ExhibitHandle } from './exhibit.ts';

const KEY_DONE = 'cascade.ff.onramp';
const KEY_CROSSING = 'cascade.ff.crossing';

/**
 * Density whose spanning cluster the on-ramp's spark must join (see beat 3).
 *
 * Must be a hair ABOVE d_c, not at the knee-tick's 0.62 target. The largest
 * cluster at 0.62 is a different component from the one at 0.60, so a cell can
 * belong to the former while still sitting in an isolated pocket the moment the
 * user crosses — measured: one tap in five swept 1% at 0.595 with a 0.62 mask.
 * Anchoring at 0.60 makes every tap sweep ~35% the instant they cross, rising
 * to ~50% by 0.62. Monotonic fill guarantees the cell stays connected above it.
 */
const SWEEP_D = 0.6;

export const onRampComplete = (): boolean => complete(KEY_DONE);

export function runOnRamp(root: HTMLElement, ex: ExhibitHandle, strip: HTMLElement): void {
  const densityCtl = root.querySelector<HTMLElement>('[data-control="density"]')!;
  const slider = densityCtl.querySelector<HTMLInputElement>('.density')!;

  // The pulsing knee-tick sits at d_c's pixel on the slider track (beat 3).
  const tick = document.createElement('span');
  tick.className = 'knee-tick';
  tick.dataset.on = 'false';
  densityCtl.append(tick);

  function placeTick() {
    const min = 0.3;
    const max = 0.86;
    const r = slider.getBoundingClientRect();
    const c = densityCtl.getBoundingClientRect();
    tick.style.left = `${r.left - c.left + ((D_C - min) / (max - min)) * r.width}px`;
    tick.style.top = `${r.top - c.top - 5}px`;
  }

  const state: BeatState = { d: ex.getDensity(), sparked: false, burnComplete: false, crossed: false };

  ex.setControlsMode('onramp');
  ex.setSparkConstraint(SWEEP_D);
  ex.plot.setMarker(state.d);

  const runner = runBeats<BeatState>({
    beats: BEATS,
    state,
    strip,
    storageKey: KEY_DONE,
    sandbox: { prompt: SANDBOX_PROMPT, lesson: SANDBOX_LESSON },
    // Beat 2's gate trips mid-drag, ~1.3s before the burn it describes has
    // finished spreading. The dwell is what keeps the bigger scar on screen
    // underneath its own lesson instead of half a second of it.
    lessonDwellMs: 3400,
    onEnter(b) {
      ex.spotlight(b.spotlight as 'stage' | 'density');
      if (b.n !== 1) ex.showRing(null); // beat 1's marker, and only beat 1's
      tick.dataset.on = String(b.n === 3);
      if (b.n === 3) placeTick();
    },
    onPayoff() {
      ex.plot.revealCurve(); // the knee + curve resolve ON the crossing
      try {
        localStorage.setItem(KEY_CROSSING, state.d.toFixed(3));
      } catch {
        /* private mode — the coda's ★ tick is simply absent */
      }
    },
    onRelease() {
      tick.dataset.on = 'false';
      ex.showRing(null);
      ex.spotlight('none');
      ex.setControlsMode('sandbox');
      ex.setSparkConstraint(null); // free play: any tree, honest outcome
      ex.plot.revealCurve();
    },
    onSkip() {
      ex.setDensity(SKIP_D);
    },
  });

  ex.onTrial((d, _frac, cell) => {
    state.burnComplete = true;
    state.sparked = true;
    state.d = d;
    // At d=0.40 the burn is one 2.8px cell. Mark where it died, or "a spark here
    // goes nowhere" arrives with no *here* and reads as a tap that never landed.
    if (runner.beat() === 1) ex.showRing(cell);
    runner.check();
  });

  root.querySelector('#stage')!.addEventListener('click', () => {
    state.sparked = true;
  });

  slider.addEventListener('input', () => {
    const d = parseFloat(slider.value);
    if (!state.crossed && d >= D_C) state.crossed = true; // flips mid-drag, at the exact pixel
    state.d = d;
    runner.check();
  });

  addEventListener('resize', () => {
    if (strip.dataset.beat === '3') placeTick();
  });
}
