import { D_C } from './forest-fire.ts';

export interface BeatState {
  d: number;
  sparked: boolean;
  burnComplete: boolean;
  crossed: boolean;
}

export interface Beat {
  n: 1 | 2 | 3;
  /** mono, shown before the action */
  prompt: string;
  /** Archivo, shown after the result lands */
  lesson: string;
  spotlight: 'stage' | 'density';
  presetD: number;
  done(s: BeatState): boolean;
}

/** Copy is LOCKED — ticket 02, decision 11. Do not rewrite. */
export const BEATS: Beat[] = [
  {
    n: 1,
    prompt: 'tap a tree to spark it',
    lesson: 'A spark here goes nowhere.',
    spotlight: 'stage',
    presetD: 0.4,
    done: (s) => s.sparked && s.burnComplete,
  },
  {
    n: 2,
    prompt: 'drag density up to add trees',
    lesson: 'Denser. A bigger scar. Still stops.',
    spotlight: 'density',
    presetD: 0.4,
    done: (s) => s.d >= 0.52,
  },
  {
    n: 3,
    prompt: 'one more nudge',
    lesson: 'One more tree. Same spark. Everything.',
    spotlight: 'density',
    presetD: 0.52,
    done: (s) => s.crossed && s.d >= D_C,
  },
];

export const SANDBOX_LESSON = 'Now it’s yours.';
export const SANDBOX_PROMPT = 'explore freely →';
/** Skip opens the sandbox somewhere already interesting. */
export const SKIP_D = 0.62;
