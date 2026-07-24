import { nearestIndex } from '../lib/plot-geometry.ts';
import {
  codaHeight,
  codaMargins,
  makeFrame,
  scatterStride,
  type Domain,
  type Frame,
} from '../lib/plot-layout.ts';

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
  /** Re-lay-out at a new width — the coda board's plots step 860 → ~560 (ticket 06). */
  layout(width: number): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function attachPlot(root: SVGSVGElement): PlotHandle {
  const densities = JSON.parse(root.dataset.densities!) as number[];
  const curve = JSON.parse(root.dataset.curve!) as number[];
  const scatter = JSON.parse(root.dataset.scatter ?? '[]') as [number, number][];
  const dMin = Number(root.dataset.dmin);
  const dMax = Number(root.dataset.dmax);
  const dc = Number(root.dataset.dc);
  const dom: Domain = { xMin: dMin, xMax: dMax, yMin: 0, yMax: 1 };

  let w = Number(root.getAttribute('width'));
  let h = Number(root.getAttribute('height'));
  let f: Frame = makeFrame(w, h, JSON.parse(root.dataset.m!), dom);

  const grid = root.querySelector<SVGGElement>('.sp-grid')!;
  const axis = root.querySelector<SVGGElement>('.sp-axis')!;
  const xTitle = root.querySelector<SVGTextElement>('.sp-xtitle')!;
  const yTitle = root.querySelector<SVGTextElement>('.sp-ytitle')!;
  const source = root.querySelector<SVGTextElement>('.sp-source')!;
  const ramp = root.querySelector<SVGLinearGradientElement>('linearGradient')!;
  const marker = root.querySelector<SVGGElement>('.sp-marker')!;
  const mLine = root.querySelector<SVGLineElement>('.sp-marker-line')!;
  const mDot = root.querySelector<SVGCircleElement>('.sp-marker-dot')!;
  const readout = root.querySelector<SVGTextElement>('.sp-readout')!;
  const trials = root.querySelector<SVGGElement>('.sp-trials')!;
  const signature = root.querySelector<SVGGElement>('.sp-signature')!;
  const curvePath = root.querySelector<SVGPathElement>('.sp-curve')!;
  const kneeHair = root.querySelector<SVGLineElement>('.sp-knee-hair')!;
  const kneeDot = root.querySelector<SVGCircleElement>('.sp-knee-dot')!;
  const leader = root.querySelector<SVGLineElement>('.sp-leader')!;
  const annoTitle = root.querySelector<SVGTextElement>('.sp-anno-title')!;
  const annoSubs = root.querySelectorAll<SVGTextElement>('.sp-anno-sub');
  const catastrophe = root.querySelector<SVGRectElement>('.sp-catastrophe')!;
  const scatterG = root.querySelector<SVGGElement>('.sp-scatter')!;
  const yourRun = root.querySelector<SVGTextElement>('.sp-yourrun')!;

  let showReadout = false;
  let markerD = Number(mDot.getAttribute('cx')) ? dMin : dMin;
  let yourRunD: number | null = null;
  const yAt = (d: number) => curve[nearestIndex(densities, d)]!;

  function setMarker(d: number) {
    markerD = d;
    const x = f.x.px(d);
    const y = f.y.px(yAt(d));
    const past = d >= dc;
    mLine.setAttribute('x1', String(x));
    mLine.setAttribute('x2', String(x));
    mLine.setAttribute('y1', String(f.m.t));
    mLine.setAttribute('y2', String(f.m.t + f.ph));
    mDot.setAttribute('cx', String(x));
    mDot.setAttribute('cy', String(y));
    marker.dataset.past = String(past);
    if (showReadout) {
      // The y-leap IS the point: a tiny Δd across the knee moves this a lot.
      const flip = x > f.m.l + f.pw * 0.72;
      readout.setAttribute('x', String(x + (flip ? -8 : 8)));
      readout.setAttribute('text-anchor', flip ? 'end' : 'start');
      readout.setAttribute('y', String(Math.max(f.m.t + 12, y - 12)));
      readout.textContent = `${Math.round(yAt(d) * 100)}% burned`;
    }
    catastrophe.dataset.on = String(past);
  }

  /** Everything whose pixels come from the frame — redrawn on every re-layout. */
  function drawFrame() {
    root.setAttribute('viewBox', `0 0 ${w} ${h}`);
    root.setAttribute('width', String(w));
    root.setAttribute('height', String(h));
    ramp.setAttribute('x1', String(f.m.l));
    ramp.setAttribute('x2', String(f.m.l + f.pw));

    for (const el of grid.querySelectorAll<SVGLineElement>('line')) {
      if (el.dataset.gx) {
        const x = f.x.px(Number(el.dataset.gx));
        el.setAttribute('x1', String(x));
        el.setAttribute('x2', String(x));
        el.setAttribute('y1', String(f.m.t));
        el.setAttribute('y2', String(f.m.t + f.ph));
      } else {
        const y = f.y.px(Number(el.dataset.gy));
        el.setAttribute('y1', String(y));
        el.setAttribute('y2', String(y));
        el.setAttribute('x1', String(f.m.l));
        el.setAttribute('x2', String(f.m.l + f.pw));
      }
    }
    for (const el of axis.querySelectorAll<SVGTextElement>('text')) {
      if (el.dataset.gx) {
        el.setAttribute('x', String(f.x.px(Number(el.dataset.gx))));
        el.setAttribute('y', String(f.m.t + f.ph + 16));
      } else if (el.dataset.gy) {
        el.setAttribute('x', String(f.m.l - 8));
        el.setAttribute('y', String(f.y.px(Number(el.dataset.gy)) + 3.5));
      }
    }
    xTitle.setAttribute('x', String(f.m.l + f.pw / 2));
    xTitle.setAttribute('y', String(h - 6));
    yTitle.setAttribute('transform', `translate(13 ${f.m.t + f.ph / 2}) rotate(-90)`);
    source.setAttribute('x', String(f.m.l));
    source.setAttribute('y', String(f.m.t - 12));

    curvePath.setAttribute(
      'd',
      densities.map((d, i) => `${i ? 'L' : 'M'}${f.x.px(d).toFixed(2)},${f.y.px(curve[i]!).toFixed(2)}`).join(''),
    );

    const kx = f.x.px(dc);
    const ky = f.y.px(curve[nearestIndex(densities, dc)]!);
    const lx = kx + 30;
    const ly = ky - 52;
    catastrophe.setAttribute('x', String(kx));
    catastrophe.setAttribute('y', String(f.m.t));
    catastrophe.setAttribute('width', String(f.m.l + f.pw - kx));
    catastrophe.setAttribute('height', String(f.ph));
    kneeHair.setAttribute('x1', String(kx));
    kneeHair.setAttribute('x2', String(kx));
    kneeHair.setAttribute('y1', String(f.m.t + f.ph));
    kneeHair.setAttribute('y2', String(ky));
    kneeDot.setAttribute('cx', String(kx));
    kneeDot.setAttribute('cy', String(ky));
    leader.setAttribute('x1', String(kx + 6));
    leader.setAttribute('y1', String(ky - 6));
    leader.setAttribute('x2', String(lx));
    leader.setAttribute('y2', String(ly + 16));
    annoTitle.setAttribute('x', String(lx));
    annoTitle.setAttribute('y', String(ly));
    annoSubs.forEach((el, i) => {
      el.setAttribute('x', String(lx));
      el.setAttribute('y', String(ly + 14 + i * 13));
    });

    const stride = scatterStride(w);
    const pts = stride > 0 ? scatter.filter((_, i) => i % stride === 0) : [];
    const dots = scatterG.querySelectorAll<SVGCircleElement>('circle');
    pts.forEach(([d, v], i) => {
      let dot = dots[i];
      if (!dot) {
        dot = document.createElementNS(SVG_NS, 'circle') as SVGCircleElement;
        dot.setAttribute('r', '1.7');
        scatterG.append(dot);
      }
      dot.setAttribute('cx', f.x.px(d).toFixed(2));
      dot.setAttribute('cy', f.y.px(v).toFixed(2));
    });
    for (let i = pts.length; i < dots.length; i++) dots[i]!.remove();

    for (const c of trials.querySelectorAll<SVGCircleElement>('circle')) {
      c.setAttribute('cx', String(f.x.px(Number(c.dataset.gx))));
      c.setAttribute('cy', String(f.y.px(Number(c.dataset.gy))));
    }

    if (yourRunD != null) {
      yourRun.setAttribute('x', String(f.x.px(yourRunD)));
      yourRun.setAttribute('y', String(f.m.t + f.ph + 30));
    }
    setMarker(markerD);
  }

  return {
    setMarker,
    yAt,
    layout(width) {
      w = width;
      h = codaHeight(width);
      f = makeFrame(w, h, codaMargins(w), dom);
      drawFrame();
    },
    dFromClientX(clientX) {
      const r = root.getBoundingClientRect();
      return f.x.val(((clientX - r.left) / r.width) * w);
    },
    addTrial(d, frac) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.dataset.gx = String(d);
      c.dataset.gy = String(frac);
      c.setAttribute('cx', String(f.x.px(d)));
      c.setAttribute('cy', String(f.y.px(frac)));
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
      yourRunD = d;
      if (d == null) {
        yourRun.dataset.hidden = 'true';
        return;
      }
      yourRun.setAttribute('x', String(f.x.px(d)));
      yourRun.setAttribute('text-anchor', 'middle');
      yourRun.dataset.hidden = 'false';
    },
  };
}
