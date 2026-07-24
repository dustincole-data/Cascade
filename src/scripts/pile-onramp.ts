import {
  KEY_PILE_ONRAMP,
  PILE_BEATS,
  PILE_SANDBOX,
  type PileBeatState,
} from '../lib/pile-config.ts';
import { onRampComplete as complete, runBeats } from './beat-runner.ts';
import type { PileHandle } from './pile.ts';

export const pileOnRampComplete = (): boolean => complete(KEY_PILE_ONRAMP);

/**
 * The sandpile's three beats (🔒 ticket 05). Beat 1's tap starts the charge they
 * then watch park; beat 2 hands them the feed and refuses to move; beat 3 rings
 * one cell and the same grain takes a third of the field.
 */
export function runPileOnRamp(root: HTMLElement, ex: PileHandle, strip: HTMLElement): void {
  const state: PileBeatState = { charged: false, fed: 0, drift: 0, ringDropped: false };
  let slopeAtBeat2 = 0;
  let started = false;

  ex.setControls('beat1');
  ex.spotlight('stage');

  const runner = runBeats<PileBeatState>({
    beats: PILE_BEATS,
    state,
    strip,
    storageKey: KEY_PILE_ONRAMP,
    sandbox: PILE_SANDBOX,
    onEnter(b) {
      ex.spotlight(b.spotlight as 'stage' | 'feed');
      ex.setControls(`beat${b.n}` as 'beat1' | 'beat2' | 'beat3');
      if (b.n === 2) {
        slopeAtBeat2 = ex.slope();
        state.fed = 0;
        state.drift = 0;
      }
      if (b.n === 3) {
        // Same pile, same seed ⇒ the same monster. Found now rather than baked:
        // the user's own beat-1 grain moves which cell it is.
        const cell = ex.findRing();
        ex.showRing(cell);
        ex.focusCell(cell); // Enter completes the beat for a keyboard user
      }
    },
    onRelease() {
      ex.showRing(null);
      ex.spotlight('none');
      ex.setControls('sandbox');
    },
    onSkip() {
      // Skip runs the same seeded charge instantly: the sandbox opens critical,
      // never on a dead flat table.
      ex.showRing(null);
      if (!state.charged) ex.startCharge('instant');
    },
  });

  // Beat 1: their grain, then the flood they started.
  ex.onEvent((a, cell) => {
    if (runner.beat() === 1 && !started) {
      started = true;
      runner.setPrompt(PILE_BEATS[0]!.mid!);
      ex.startCharge('paced');
      return;
    }
    if (runner.beat() === 3 && cell === ex.ringCell()) {
      state.ringDropped = true;
      runner.check();
    }
    // An off-ring drop is honoured as a real, small avalanche — the near-miss.
  });

  ex.onCharged(() => {
    state.charged = true;
    runner.check();
  });

  // Beat 2: the refusal. `grains` races, the slope does not move.
  ex.onWeather((poured) => {
    if (runner.beat() !== 2) return;
    state.fed += poured;
    state.drift = Math.abs(ex.slope() - slopeAtBeat2);
    runner.check();
  });
}
