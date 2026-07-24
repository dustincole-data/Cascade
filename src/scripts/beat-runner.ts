/**
 * The on-ramp machinery both exhibits share: the caption strip, the progress
 * dots, the skip rail, and — the part worth extracting — the settle-once /
 * timer-scoping discipline. Every on-ramp defect found by walking the fire slice
 * live lived in here (a stale timer skipping a beat, a fast gesture satisfying
 * the next beat's gate before it was shown), so exhibit 2 inherits the fixes
 * instead of a copy of the bugs.
 *
 * An exhibit supplies its beats, its gate state, and what to do on entry;
 * everything exhibit-shaped stays in the exhibit's own module.
 */

export interface BeatDef<S> {
  n: number;
  /** mono, shown before the action */
  prompt: string;
  /** Archivo, shown once the result lands */
  lesson: string;
  spotlight: string;
  done(s: S): boolean;
}

export interface RunnerOpts<S> {
  beats: BeatDef<S>[];
  state: S;
  strip: HTMLElement;
  /** Per-exhibit completion flag, e.g. `cascade.sp.onramp`. */
  storageKey: string;
  sandbox: { prompt: string; lesson: string };
  /** A beat becomes current: pre-set state, gate the controls, move the spotlight. */
  onEnter(beat: BeatDef<S>): void;
  /** The last beat's gate just passed — the payoff frame. */
  onPayoff?(beat: BeatDef<S>): void;
  onRelease(): void;
  onSkip(): void;
  /** How long a lesson holds before advancing. The lesson IS the beat's payoff. */
  lessonDwellMs?: number;
  payoffDwellMs?: number;
}

export interface Runner {
  /** Re-test the current beat's gate. Safe to call on every input. */
  check(): void;
  /** Swap the prompt line mid-beat without re-rendering the beat. */
  setPrompt(text: string): void;
  released(): boolean;
  beat(): number;
}

export const onRampComplete = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === 'done';
  } catch {
    return false; // private mode — the on-ramp simply replays
  }
};

export function markOnRampComplete(key: string): void {
  try {
    localStorage.setItem(key, 'done');
  } catch {
    /* private mode — the on-ramp simply replays */
  }
}

export function runBeats<S>(o: RunnerOpts<S>): Runner {
  const lessonDwell = o.lessonDwellMs ?? 2400;
  const payoffDwell = o.payoffDwellMs ?? 3000;
  const lesson = o.strip.querySelector<HTMLElement>('.cap-lesson')!;
  const prompt = o.strip.querySelector<HTMLElement>('.cap-prompt')!;
  const progress = o.strip.querySelector<HTMLElement>('.cap-progress')!;
  const skip = o.strip.querySelector<HTMLButtonElement>('.cap-skip')!;
  const next = o.strip.querySelector<HTMLButtonElement>('.cap-next')!;

  let idx = 0;
  let released = false;
  /** True once the CURRENT beat's gate has passed. `check()` runs on every input,
   *  so without this a beat schedules several advance() timers and a stale one
   *  skips the next beat entirely. */
  let settled = false;

  /** Only fire if we are still on the beat that scheduled this timer. */
  function scheduleAdvance(from: number, ms: number) {
    window.setTimeout(() => {
      if (!released && idx === from) advance();
    }, ms);
  }

  function render() {
    const b = o.beats[idx]!;
    settled = false;
    o.strip.dataset.beat = String(b.n);
    prompt.textContent = b.prompt;
    lesson.textContent = '';
    progress.innerHTML = o.beats
      .map((x) => (x.n === b.n ? `<b>${x.n}</b>` : `<span>${x.n}</span>`))
      .join('·');
    o.onEnter(b);
    // A fast gesture can satisfy the NEXT beat's gate before that beat is even
    // shown. Re-check on entry so the payoff still fires instead of the beat
    // sitting there uncompletable.
    window.setTimeout(check, 0);
  }

  function check() {
    if (released || settled) return;
    const b = o.beats[idx]!;
    if (!b.done(o.state)) return;
    settled = true;
    lesson.textContent = b.lesson;
    if (idx === o.beats.length - 1) {
      o.onPayoff?.(b);
      window.setTimeout(release, payoffDwell);
      return;
    }
    scheduleAdvance(idx, lessonDwell);
  }

  function advance() {
    if (released) return;
    if (idx >= o.beats.length - 1) {
      release();
      return;
    }
    idx++;
    render();
  }

  function release() {
    if (released) return;
    released = true;
    o.strip.dataset.beat = 'sandbox';
    lesson.textContent = o.sandbox.lesson;
    prompt.textContent = o.sandbox.prompt;
    progress.textContent = '';
    next.hidden = true;
    skip.hidden = true;
    o.onRelease();
    markOnRampComplete(o.storageKey);
  }

  next.addEventListener('click', advance);
  skip.addEventListener('click', () => {
    o.onSkip();
    release();
  });

  render();

  return {
    check,
    setPrompt(text) {
      prompt.textContent = text;
    },
    released: () => released,
    beat: () => (released ? 0 : o.beats[idx]!.n),
  };
}
