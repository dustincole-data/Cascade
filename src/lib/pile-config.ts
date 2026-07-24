import type { BeatDef } from '../scripts/beat-runner.ts';

/**
 * The sandpile's on-ramp (🔒 ticket 05). Spine: **the trap is the dial you no
 * longer have.** Exhibit 1 taught "I set the parameter, the parameter sets the
 * outcome"; a needle climbing for twelve seconds says it again for free. So beat 2
 * invites the user to push the slope and the system refuses — then the grain that
 * did nothing in beat 1 takes a third of the field.
 */
export interface PileBeatState {
  /** Beat 1: the charge finished and the dial has parked. */
  charged: boolean;
  /** Beat 2: grains poured in since the beat opened. */
  fed: number;
  /** Beat 2: how far the parked slope moved while they poured. */
  drift: number;
  /** Beat 3: a drop on the ring cell resolved. */
  ringDropped: boolean;
}

export interface PileBeat extends BeatDef<PileBeatState> {
  n: 1 | 2 | 3;
  spotlight: 'stage' | 'feed';
  /** Swapped into the prompt slot mid-beat — the hand-over that makes the flood theirs. */
  mid?: string;
}

/** Beat 2's gate: enough grains that "all that" is undeniable (🔒 ticket 05, D4). */
export const FEED_GATE = 3000;
/** …and the slope must not have moved while they did it. */
export const DRIFT_GATE = 0.02;

/** Copy is LOCKED — ticket 05, fork 7. Do not rewrite.
 *  "Nobody set the dial." is deliberately UNSPENT here: it is the coda's callback. */
export const PILE_BEATS: PileBeat[] = [
  {
    n: 1,
    prompt: 'drop a grain',
    mid: 'one grain does nothing. here are fifteen thousand.',
    lesson: 'It loads itself. Then it stops.',
    spotlight: 'stage',
    done: (s) => s.charged,
  },
  {
    n: 2,
    prompt: 'pour it in — push the slope higher',
    lesson: 'All that. The slope didn’t move.',
    spotlight: 'feed',
    done: (s) => s.fed >= FEED_GATE && s.drift < DRIFT_GATE,
  },
  {
    n: 3,
    prompt: 'one more grain — here',
    lesson: 'The same grain. Nothing, then this.',
    spotlight: 'stage',
    done: (s) => s.ringDropped,
  },
];

export const PILE_SANDBOX = { prompt: 'drop anywhere →', lesson: 'Now it’s yours.' };
export const KEY_PILE_ONRAMP = 'cascade.sp.onramp';
/** One number for the coda's ★ — best-effort, never load-bearing (🔒 ticket 06, D6). */
export const KEY_PILE_BIGGEST = 'cascade.sp.biggest';
