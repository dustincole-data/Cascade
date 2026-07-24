import type { BeatDef } from '../scripts/beat-runner.ts';

/**
 * Exhibit 3's on-ramp (🔒 ticket 07). Spine: **you cannot break it, and then you
 * can.** Fire trapped the user with their hand on the dial; the sandpile refused
 * to be pushed; the network lets them hunt and come up empty — twice, the second
 * time with the obvious suspect handed to them — then points at a node that looks
 * like nothing.
 */
export interface NetBeatState {
  /** Beat 1: any node taken offline and its cascade resolved. */
  tried: boolean;
  /** Beat 2: the most-connected node (the fattest dot) taken offline. */
  hubTried: boolean;
  /** Beat 3: the ringed node taken offline. */
  ringTried: boolean;
}

export interface NetBeat extends BeatDef<NetBeatState> {
  n: 1 | 2 | 3;
  spotlight: 'stage' | 'hub';
}

/** Copy is LOCKED — ticket 07, fork 7 + 9. Do not rewrite.
 *  "Nothing looks load-bearing." is deliberately UNSPENT here: it is the coda's callback. */
export const NET_BEATS: NetBeat[] = [
  {
    n: 1,
    prompt: 'knock out any node',
    lesson: 'Take one out. The grid holds.',
    spotlight: 'stage',
    done: (s) => s.tried,
  },
  {
    n: 2,
    prompt: 'now the biggest one — it’s the fattest dot',
    lesson: 'Even the biggest one.',
    spotlight: 'hub',
    done: (s) => s.hubTried,
  },
  {
    n: 3,
    prompt: 'this one',
    lesson: 'The same knock-out. Nothing, then this.',
    spotlight: 'stage',
    done: (s) => s.ringTried,
  },
];

export const NET_SANDBOX = { prompt: 'knock out anything →', lesson: 'Now it’s yours.' };
export const KEY_NET_ONRAMP = 'cascade.nw.onramp';
/** One number for the coda's ★ — best-effort, never load-bearing (🔒 ticket 07, D13). */
export const KEY_NET_WORST = 'cascade.nw.worst';
