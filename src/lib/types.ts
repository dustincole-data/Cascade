export type ExhibitId = 'forest-fire' | 'sandpile' | 'network';

export interface Params {
  /** The single primary parameter (fire: density d). */
  value: number;
  seed: number;
}

export interface Stats {
  density: number;
  trees: number;
  burned: number;
  /** Fraction of trees swept, 0–1. */
  frac: number;
  tick: number;
  maxTick: number;
}

/** One completed trial — the datum the signature plot consumes. */
export interface DataPoint {
  x: number;
  y: number;
}

export interface StepResult {
  /** Cell indices that changed to "burning" this tick. */
  ignited: number[];
  /** Cell indices that aged out of the front into scar this tick. */
  spent: number[];
  done: boolean;
}
