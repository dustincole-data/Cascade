import net from '../data/network-profile.json';
import { HEIGHT, lerpStops, rgbStr } from '../lib/palette.ts';
import { ranked, rankOf } from '../lib/network.ts';
import {
  type Frame,
  codaHeight,
  makeFrame,
  needleWidth,
  nwMargins,
  nwDomain,
  nwYTop,
} from '../lib/plot-layout.ts';

/**
 * Client half of the network's plot — the exhibit's ranked cliff and the coda's
 * unsorted needle field, one module because they are one geometry (🔒 ticket 07).
 * One draw path serves data updates, marker moves and re-layout, so a plot that
 * resizes lands on exactly the pixels the server drew.
 */
export interface ProfileHandle {
  /** Exhibit: mark a node the user just took offline, bright at its rank. */
  addTry(node: number): void;
  clear(): void;
  /** Exhibit: switch `slack` stop — the whole cliff re-draws. */
  setAlpha(alpha: number): void;
  /** Coda: move the marker to a node index (0-based, grid order). */
  setMarker(index: number): void;
  setStar(node: number | null): void;
  layout(width: number): void;
  /** Coda: which needle a client-x lands on. */
  indexFromClientX(clientX: number): number;
  count(): number;
}

const SVG = 'http://www.w3.org/2000/svg';

export function attachProfile(root: SVGSVGElement): ProfileHandle {
  const kind = (root.dataset.kind ?? 'coda') as 'live' | 'coda';
  const coda = kind === 'coda';
  const n = net.nodes;

  const grid = root.querySelector<SVGGElement>('.sp-grid')!;
  const axis = root.querySelector<SVGGElement>('.sp-axis')!;
  const needlesG = root.querySelector<SVGGElement>('.nw-needles')!;
  const ramp = root.querySelector<SVGLinearGradientElement>('linearGradient')!;
  const signature = root.querySelector<SVGGElement>('.sp-signature')!;
  const cliffDot = root.querySelector<SVGCircleElement>('.nw-cliff-dot');
  const leader = root.querySelector<SVGLineElement>('.sp-leader')!;
  const annoTitle = root.querySelector<SVGTextElement>('.sp-anno-title')!;
  const annoSub = root.querySelector<SVGTextElement>('.sp-anno-sub');
  const source = root.querySelector<SVGTextElement>('.sp-source')!;
  const xTitle = root.querySelector<SVGTextElement>('.sp-xtitle')!;
  const yTitle = root.querySelector<SVGTextElement>('.sp-ytitle')!;
  const triesG = root.querySelector<SVGGElement>('.nw-tries');
  const marker = root.querySelector<SVGGElement>('.nw-marker');
  const mLine = root.querySelector<SVGLineElement>('.sp-marker-line');
  const mDot = root.querySelector<SVGCircleElement>('.sp-marker-dot');
  const readout = root.querySelector<SVGTextElement>('.nw-readout');
  const star = root.querySelector<SVGTextElement>('.sp-star');

  let alpha = Number(root.dataset.alpha ?? net.defaultAlpha);
  let fracs = stopFor(alpha);
  let ordered = coda ? fracs : ranked(fracs);
  let yTop = nwYTop(fracs);

  let w = Number(root.getAttribute('width'));
  let h = Number(root.getAttribute('height'));
  let dom = nwDomain(yTop);
  let f: Frame = makeFrame(w, h, JSON.parse(root.dataset.m!), dom);

  /** The user's own attempts, as node indices (exhibit only). */
  const tries = new Set<number>();
  let markerIdx = 0;
  let starNode: number | null = null;

  function stopFor(a: number): number[] {
    const i = net.alphas.indexOf(a);
    return net.perNode[i < 0 ? net.alphas.indexOf(net.defaultAlpha) : i]!;
  }

  const pct = (v: number) => v * 100;
  const colour = (v: number) => rgbStr(lerpStops(HEIGHT, Math.min(1, pct(v) / yTop)));

  function drawFrame() {
    root.setAttribute('viewBox', `0 0 ${w} ${h}`);
    root.setAttribute('width', String(w));
    root.setAttribute('height', String(h));
    ramp.setAttribute('y1', String(f.m.t + f.ph));
    ramp.setAttribute('y2', String(f.m.t));

    // The y axis rescales with `slack` (a looser grid has a lower ceiling), so
    // the three gridlines and their labels are repositioned AND re-numbered.
    const yTicks = [0, yTop / 2, yTop];
    const lines = grid.querySelectorAll<SVGLineElement>('line');
    const yLabels = [...axis.querySelectorAll<SVGTextElement>('text')].filter((el) => el.dataset.gy != null);
    yTicks.forEach((v, i) => {
      const el = lines[i];
      if (el) {
        const y = f.y.px(v);
        el.setAttribute('y1', String(y));
        el.setAttribute('y2', String(y));
        el.setAttribute('x1', String(f.m.l));
        el.setAttribute('x2', String(f.m.l + f.pw));
      }
      const lbl = yLabels[i];
      if (lbl) {
        lbl.dataset.gy = String(v);
        lbl.textContent = String(Math.round(v));
        lbl.setAttribute('x', String(f.m.l - 8));
        lbl.setAttribute('y', String(f.y.px(v) + 3.5));
      }
    });
    axis.querySelectorAll<SVGTextElement>('text').forEach((el) => {
      const gx = el.dataset.gx;
      if (gx != null) {
        el.setAttribute('x', String(f.x.px(Number(gx))));
        el.setAttribute('y', String(f.m.t + f.ph + 16));
      }
    });
    xTitle.setAttribute('x', String(f.m.l + f.pw / 2));
    xTitle.setAttribute('y', String(h - 6));
    yTitle.setAttribute('transform', `translate(13 ${f.m.t + f.ph / 2}) rotate(-90)`);
    source.setAttribute('x', String(f.m.l));
    source.setAttribute('y', String(f.m.t - 12));
  }

  function drawNeedles() {
    const width = needleWidth(f.pw);
    needlesG.setAttribute('stroke-width', String(width));
    const lines = needlesG.querySelectorAll<SVGLineElement>('line');
    ordered.forEach((v, i) => {
      const el = lines[i];
      if (!el) return;
      const x = f.x.px(i + 1);
      el.setAttribute('x1', String(x));
      el.setAttribute('x2', String(x));
      el.setAttribute('y1', String(f.y.px(0)));
      el.setAttribute('y2', String(f.y.px(Math.max(pct(v), 0.35))));
      el.setAttribute('stroke', colour(v));
    });
  }

  /** Exhibit: a bright dot on the needle for each node the user tried. */
  function drawTries() {
    if (!triesG) return;
    const rankOfNode = (node: number) => rankOf(fracs, node); // 1-based rank = x
    const dots = triesG.querySelectorAll<SVGCircleElement>('circle');
    const arr = [...tries];
    arr.forEach((node, i) => {
      let dot = dots[i];
      if (!dot) {
        dot = document.createElementNS(SVG, 'circle');
        dot.setAttribute('r', '3.2');
        triesG.append(dot);
      }
      const rank = rankOfNode(node);
      dot.setAttribute('cx', String(f.x.px(rank)));
      dot.setAttribute('cy', String(f.y.px(pct(fracs[node]!))));
    });
    for (let i = arr.length; i < dots.length; i++) dots[i]!.remove();
  }

  function drawSignature() {
    if (coda) {
      // Leader onto the FLOOR, no dot — nothing on the outside says which.
      const lx = f.m.l + f.pw * 0.3;
      const ly = f.m.t + f.ph * 0.42;
      leader.setAttribute('x1', String(f.x.px(n * 0.5)));
      leader.setAttribute('y1', String(f.y.px(0) - 6));
      leader.setAttribute('x2', String(lx + 22));
      leader.setAttribute('y2', String(ly + 8));
      annoTitle.setAttribute('x', String(lx));
      annoTitle.setAttribute('y', String(ly));
      if (annoSub) {
        annoSub.setAttribute('x', String(lx));
        annoSub.setAttribute('y', String(ly + 15));
      }
      return;
    }
    // Exhibit: the cliff top, with the hot-core dot.
    const ax = f.x.px(1);
    const ay = f.y.px(pct(ordered[0]!));
    const lx = f.m.l + f.pw * 0.28;
    const ly = Math.max(f.m.t + 18, ay + 34);
    if (cliffDot) {
      cliffDot.setAttribute('cx', String(ax));
      cliffDot.setAttribute('cy', String(ay));
    }
    leader.setAttribute('x1', String(ax));
    leader.setAttribute('y1', String(ay - 7));
    leader.setAttribute('x2', String(lx + 22));
    leader.setAttribute('y2', String(ly + 8));
    annoTitle.setAttribute('x', String(lx));
    annoTitle.setAttribute('y', String(ly));
  }

  function drawMarker() {
    if (!marker || !mLine || !mDot || !readout) return;
    const v = ordered[markerIdx]!;
    const x = f.x.px(markerIdx + 1);
    const y = f.y.px(pct(v));
    const c = colour(v);
    mLine.setAttribute('x1', String(x));
    mLine.setAttribute('x2', String(x));
    mLine.setAttribute('y1', String(f.m.t));
    mLine.setAttribute('y2', String(f.m.t + f.ph));
    mLine.setAttribute('stroke', c);
    mDot.setAttribute('cx', String(x));
    mDot.setAttribute('cy', String(y));
    mDot.setAttribute('fill', c);
    // The readout rides just above the marker, but stays inside the frame and
    // flips to the left of the line near the right edge so it never clips.
    const near = x > f.m.l + f.pw * 0.7;
    readout.setAttribute('x', String(near ? x - 10 : x + 10));
    readout.setAttribute('text-anchor', near ? 'end' : 'start');
    readout.setAttribute('y', String(Math.max(f.m.t + 12, y - 10)));
    readout.setAttribute('fill', rgbStr(lerpStops(HEIGHT, Math.max(0.42, Math.min(1, pct(v) / yTop)))));
    readout.textContent = `node ${markerIdx + 1} → ${pct(v).toFixed(1)}% dark`;
    root.setAttribute('aria-valuenow', String(markerIdx + 1));
    root.setAttribute('aria-valuetext', `node ${markerIdx + 1} of ${n}, takes down ${pct(v).toFixed(0)} percent of the grid`);
  }

  function drawStar() {
    if (!star) return;
    if (starNode == null) {
      star.dataset.hidden = 'true';
      return;
    }
    // The ★ marks the user's own worst node, on whichever needle it is — which in
    // the coda's unsorted field is wherever the grid happens to put it.
    const idx = coda ? starNode : rankOf(fracs, starNode) - 1;
    const v = ordered[idx] ?? fracs[starNode]!;
    star.dataset.hidden = 'false';
    star.setAttribute('x', String(f.x.px(idx + 1)));
    star.setAttribute('y', String(f.y.px(pct(v)) - 8));
    star.setAttribute('text-anchor', 'middle');
    star.textContent = '★';
  }

  function draw() {
    drawFrame();
    drawNeedles();
    drawTries();
    drawSignature();
    drawMarker();
    drawStar();
  }

  return {
    addTry(node) {
      tries.add(node);
      root.dataset.lit = 'true';
      drawTries();
    },
    clear() {
      tries.clear();
      delete root.dataset.lit;
      drawTries();
    },
    setAlpha(a) {
      alpha = a;
      fracs = stopFor(a);
      ordered = coda ? fracs : ranked(fracs);
      yTop = nwYTop(fracs);
      dom = nwDomain(yTop);
      f = makeFrame(w, h, f.m, dom);
      draw();
    },
    setMarker(index) {
      markerIdx = Math.min(n - 1, Math.max(0, index));
      drawMarker();
    },
    setStar(node) {
      starNode = node;
      drawStar();
    },
    layout(width) {
      w = width;
      h = codaHeight(width);
      f = makeFrame(w, h, nwMargins(w), dom);
      draw();
    },
    indexFromClientX(clientX) {
      const r = root.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * w;
      return Math.min(n - 1, Math.max(0, Math.round(f.x.val(x) - 1)));
    },
    count: () => n,
  };
}
