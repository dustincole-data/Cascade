import { makeScale, nearestIndex, type PlotBox } from '../lib/plot-geometry.ts';

export interface PlotHandle {
  setMarker(d: number): void;
  addTrial(d: number, frac: number): void;
  clearTrials(): void;
  revealCurve(): void;
  setYReadout(on: boolean): void;
  setCatastrophe(on: boolean): void;
  setYourRun(d: number | null): void;
  yAt(d: number): number;
  dFromClientX(clientX: number): number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function attachPlot(root: SVGSVGElement): PlotHandle {
  const box = JSON.parse(root.dataset.box!) as PlotBox;
  const densities = JSON.parse(root.dataset.densities!) as number[];
  const curve = JSON.parse(root.dataset.curve!) as number[];
  const dMin = Number(root.dataset.dmin);
  const dMax = Number(root.dataset.dmax);
  const dc = Number(root.dataset.dc);
  const s = makeScale(box, dMin, dMax);

  const marker = root.querySelector<SVGGElement>('.sp-marker')!;
  const mLine = root.querySelector<SVGLineElement>('.sp-marker-line')!;
  const mDot = root.querySelector<SVGCircleElement>('.sp-marker-dot')!;
  const readout = root.querySelector<SVGTextElement>('.sp-readout')!;
  const trials = root.querySelector<SVGGElement>('.sp-trials')!;
  const signature = root.querySelector<SVGGElement>('.sp-signature')!;
  const catastrophe = root.querySelector<SVGRectElement>('.sp-catastrophe')!;
  const yourRun = root.querySelector<SVGTextElement>('.sp-yourrun')!;

  let showReadout = false;
  const yAt = (d: number) => curve[nearestIndex(densities, d)]!;

  function setMarker(d: number) {
    const x = s.x(d);
    const y = s.y(yAt(d));
    const past = d >= dc;
    mLine.setAttribute('x1', String(x));
    mLine.setAttribute('x2', String(x));
    mDot.setAttribute('cx', String(x));
    mDot.setAttribute('cy', String(y));
    marker.dataset.past = String(past);
    if (showReadout) {
      // The y-leap IS the point: a tiny Δd across the knee moves this a lot.
      const flip = x > box.w * 0.72;
      readout.setAttribute('x', String(x + (flip ? -8 : 8)));
      readout.setAttribute('text-anchor', flip ? 'end' : 'start');
      readout.setAttribute('y', String(Math.max(box.m.t + 12, y - 12)));
      readout.textContent = `${Math.round(yAt(d) * 100)}% burned`;
    }
    catastrophe.dataset.on = String(past);
  }

  return {
    setMarker,
    yAt,
    dFromClientX(clientX) {
      const r = root.getBoundingClientRect();
      return s.invX(((clientX - r.left) / r.width) * box.w);
    },
    addTrial(d, frac) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', String(s.x(d)));
      c.setAttribute('cy', String(s.y(frac)));
      c.setAttribute('r', '3');
      trials.append(c);
    },
    clearTrials() {
      trials.replaceChildren();
    },
    revealCurve() {
      signature.dataset.hidden = 'false';
    },
    setYReadout(on) {
      showReadout = on;
      if (!on) readout.textContent = '';
    },
    setCatastrophe(on) {
      catastrophe.dataset.on = String(on);
    },
    setYourRun(d) {
      if (d == null) {
        yourRun.dataset.hidden = 'true';
        return;
      }
      yourRun.setAttribute('x', String(s.x(d)));
      yourRun.setAttribute('text-anchor', 'middle');
      yourRun.dataset.hidden = 'false';
    },
  };
}
