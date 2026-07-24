import { KEY_NET_ONRAMP, NET_BEATS, NET_SANDBOX, type NetBeatState } from '../lib/net-config.ts';
import { onRampComplete as complete, runBeats } from './beat-runner.ts';
import type { NetHandle } from './net.ts';

export const netOnRampComplete = (): boolean => complete(KEY_NET_ONRAMP);

/**
 * The network's three beats (🔒 ticket 07). You cannot break it, and then you
 * can: beat 1 any node is absorbed, beat 2 the fattest dot is absorbed too, beat
 * 3 a pulsing ring on an ordinary node takes most of the grid down. Off-target
 * clicks are honoured as real (usually harmless) attempts — the near-miss
 * principle from the fire and sandpile on-ramps.
 */
export function runNetOnRamp(root: HTMLElement, ex: NetHandle, strip: HTMLElement): void {
  const state: NetBeatState = { tried: false, hubTried: false, ringTried: false };

  ex.setControls('beat1');

  const runner = runBeats<NetBeatState>({
    beats: NET_BEATS,
    state,
    strip,
    storageKey: KEY_NET_ONRAMP,
    sandbox: NET_SANDBOX,
    onEnter(b) {
      ex.setControls(`beat${b.n}` as 'beat1' | 'beat2' | 'beat3');
      if (b.n === 2) {
        // Spotlight the fattest dot and invite them to kill it — the trap.
        ex.spotlightHub(true);
        ex.focusNode(ex.hubNode());
      } else if (b.n === 3) {
        // One ordinary-looking node, ringed. Same seed ⇒ same node, and the bake
        // guarantees it is catastrophic yet median-degree (🔒 ticket 07, fork 7).
        ex.spotlightHub(false);
        const node = ex.ringNode();
        ex.showRing(node);
        ex.focusNode(node); // Enter completes the beat for a keyboard user
      } else {
        ex.spotlightHub(false);
        ex.showRing(null);
      }
    },
    onRelease() {
      ex.showRing(null);
      ex.spotlightHub(false);
      ex.setControls('sandbox');
    },
    onSkip() {
      ex.showRing(null);
      ex.spotlightHub(false);
      ex.reset();
    },
  });

  ex.onEvent((_c, node) => {
    const beat = runner.beat();
    if (beat === 1) {
      state.tried = true;
      runner.check();
    } else if (beat === 2 && node === ex.hubNode()) {
      state.hubTried = true;
      runner.check();
    } else if (beat === 3 && node === ex.ringNode()) {
      state.ringTried = true;
      runner.check();
    }
    // Any other click is honoured as a real attempt; the beat stays open.
  });
}
