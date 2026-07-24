import { BEATS, SANDBOX_LESSON, SANDBOX_PROMPT, SKIP_D, type BeatState } from '../lib/beats-config.ts';
import { D_C } from '../lib/forest-fire.ts';
import type { ExhibitHandle } from './exhibit.ts';

const KEY_DONE = 'cascade.ff.onramp';
const KEY_CROSSING = 'cascade.ff.crossing';

/** Density whose spanning cluster the on-ramp's spark must join (see beat 3). */
const SWEEP_D = 0.62;

/** How long the lesson line holds before auto-advancing. Long enough to read it —
 *  the lesson IS the beat's payoff, and advancing wipes it. */
const LESSON_DWELL_MS = 2400;
const PAYOFF_DWELL_MS = 3000;

export const onRampComplete = (): boolean => {
  try {
    return localStorage.getItem(KEY_DONE) === 'done';
  } catch {
    return false;
  }
};

export function markOnRampComplete(): void {
  try {
    localStorage.setItem(KEY_DONE, 'done');
  } catch {
    /* private mode — the on-ramp simply replays */
  }
}

export function runOnRamp(root: HTMLElement, ex: ExhibitHandle, strip: HTMLElement): void {
  const lesson = strip.querySelector<HTMLElement>('.cap-lesson')!;
  const prompt = strip.querySelector<HTMLElement>('.cap-prompt')!;
  const progress = strip.querySelector<HTMLElement>('.cap-progress')!;
  const skip = strip.querySelector<HTMLButtonElement>('.cap-skip')!;
  const next = strip.querySelector<HTMLButtonElement>('.cap-next')!;
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
  let idx = 0;
  let released = false;
  /** True once the CURRENT beat's gate has passed. check() runs on every slider
   *  input and every completed burn, so without this a beat schedules several
   *  advance() timers and a stale one skips the next beat entirely. */
  let settled = false;

  /** Only fire if we are still on the beat that scheduled this timer. */
  function scheduleAdvance(from: number, ms: number) {
    window.setTimeout(() => {
      if (!released && idx === from) advance();
    }, ms);
  }

  ex.setControlsMode('onramp');
  ex.setSparkConstraint(SWEEP_D);
  ex.plot.setMarker(state.d);

  function render() {
    const b = BEATS[idx]!;
    settled = false;
    strip.dataset.beat = String(b.n);
    prompt.textContent = b.prompt;
    lesson.textContent = '';
    progress.innerHTML = [1, 2, 3].map((n) => (n === b.n ? `<b>${n}</b>` : `<span>${n}</span>`)).join('·');
    ex.spotlight(b.spotlight);
    tick.dataset.on = String(b.n === 3);
    if (b.n === 3) placeTick();
    // A fast drag can satisfy the NEXT beat's gate before that beat is even
    // shown (cross d_c while still on beat 2). Re-check on entry so the payoff
    // still fires instead of the beat sitting there uncompletable.
    window.setTimeout(check, 0);
  }

  function check() {
    if (released || settled) return;
    const b = BEATS[idx]!;
    if (!b.done(state)) return;
    settled = true;
    lesson.textContent = b.lesson;
    if (b.n === 3) {
      ex.plot.revealCurve(); // the knee + curve resolve ON the crossing
      try {
        localStorage.setItem(KEY_CROSSING, state.d.toFixed(3));
      } catch {
        /* private mode — the coda's ★ tick is simply absent */
      }
      window.setTimeout(release, PAYOFF_DWELL_MS);
      return;
    }
    scheduleAdvance(idx, LESSON_DWELL_MS);
  }

  function advance() {
    if (released) return;
    if (idx >= BEATS.length - 1) {
      release();
      return;
    }
    idx++;
    render();
  }

  function release() {
    if (released) return;
    released = true;
    tick.dataset.on = 'false';
    strip.dataset.beat = 'sandbox';
    lesson.textContent = SANDBOX_LESSON;
    prompt.textContent = SANDBOX_PROMPT;
    progress.textContent = '';
    next.hidden = true;
    skip.hidden = true;
    ex.spotlight('none');
    ex.setControlsMode('sandbox');
    ex.setSparkConstraint(null); // free play: any tree, honest outcome
    ex.plot.revealCurve();
    markOnRampComplete();
  }

  ex.onTrial((d) => {
    state.burnComplete = true;
    state.sparked = true;
    state.d = d;
    check();
  });

  root.querySelector('#stage')!.addEventListener('click', () => {
    state.sparked = true;
  });

  slider.addEventListener('input', () => {
    const d = parseFloat(slider.value);
    if (!state.crossed && d >= D_C) state.crossed = true; // flips mid-drag, at the exact pixel
    state.d = d;
    check();
  });

  next.addEventListener('click', advance);
  skip.addEventListener('click', () => {
    ex.setDensity(SKIP_D);
    release();
  });
  addEventListener('resize', () => {
    if (strip.dataset.beat === '3') placeTick();
  });

  render();
}
