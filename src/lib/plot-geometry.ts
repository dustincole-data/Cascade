export interface PlotBox {
  w: number;
  h: number;
  m: { l: number; r: number; t: number; b: number };
}

export interface Scale {
  x(d: number): number;
  y(f: number): number;
  invX(px: number): number;
}

export function makeScale(box: PlotBox, dMin: number, dMax: number): Scale {
  const pw = box.w - box.m.l - box.m.r;
  const ph = box.h - box.m.t - box.m.b;
  return {
    x: (d) => box.m.l + ((d - dMin) / (dMax - dMin)) * pw,
    y: (f) => box.m.t + (1 - f) * ph,
    invX: (px) => {
      const t = (px - box.m.l) / pw;
      return Math.min(dMax, Math.max(dMin, dMin + t * (dMax - dMin)));
    },
  };
}

export function nearestIndex(densities: number[], d: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < densities.length; i++) {
    const dist = Math.abs(densities[i]! - d);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

export const valueAt = (densities: number[], values: number[], d: number): number =>
  values[nearestIndex(densities, d)]!;
