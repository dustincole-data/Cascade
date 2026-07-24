import { interpLog } from '../lib/plot-geometry.ts';
import { HEIGHT, lerpStops, rgbStr } from '../lib/palette.ts';
import {
  SP_ANNO_S,
  SP_FLOOR_DROPS,
  codaHeight,
  codaMargins,
  makeFrame,
  oneIn,
  spDomain,
  survivalPath,
  type Frame,
} from '../lib/plot-layout.ts';
import { survival } from '../lib/sandpile.ts';

/**
 * Client half of the survival plot. One draw path serves both data updates and
 * re-layout, so a plot that resizes lands on exactly the pixels the server drew.
 */
export interface SurvivalHandle {
  /** The exhibit's own series: every avalanche area so far, and the drops behind them. */
  setUser(sizes: number[], drops: number): void;
  clear(): void;
  /** Panel 2's marker, in cells. */
  setMarker(size: number): void;
  setStar(size: number | null): void;
  layout(width: number): void;
  /** The largest size the plotted curve reaches — where the marker's travel ends. */
  maxSize(): number;
  sizeFromClientX(clientX: number): number;
}

const SVG = 'http://www.w3.org/2000/svg';
const fmt = (n: number) => n.toLocaleString('en-US');

export function attachSurvival(root: SVGSVGElement): SurvivalHandle {
  const kind = (root.dataset.kind ?? 'coda') as 'live' | 'coda';
  const coda = kind === 'coda';
  const sizes = JSON.parse(root.dataset.sizes!) as number[];
  const p = JSON.parse(root.dataset.p!) as number[];
  const dom = spDomain(kind);

  const grid = root.querySelector<SVGGElement>('.sp-grid')!;
  const axis = root.querySelector<SVGGElement>('.sp-axis')!;
  const backbone = root.querySelector<SVGPathElement>('.sp-backbone')!;
  const ramp = root.querySelector<SVGLinearGradientElement>('linearGradient')!;
  const signature = root.querySelector<SVGGElement>('.sp-signature')!;
  const leader = root.querySelector<SVGLineElement>('.sp-leader')!;
  const annoTitle = root.querySelector<SVGTextElement>('.sp-anno-title')!;
  const source = root.querySelector<SVGTextElement>('.sp-source')!;
  const xTitle = root.querySelector<SVGTextElement>('.sp-xtitle')!;
  const yTitle = root.querySelector<SVGTextElement>('.sp-ytitle')!;
  const userG = root.querySelector<SVGGElement>('.sp-user');
  const userLine = root.querySelector<SVGPathElement>('.sp-user-line');
  const maxDot = root.querySelector<SVGCircleElement>('.sp-max-dot');
  const marker = root.querySelector<SVGGElement>('.sp-marker');
  const mLine = root.querySelector<SVGLineElement>('.sp-marker-line');
  const mDot = root.querySelector<SVGCircleElement>('.sp-marker-dot');
  const rarityText = root.querySelector<SVGTextElement>('.sp-rarity');
  const star = root.querySelector<SVGTextElement>('.sp-star');

  let w = Number(root.getAttribute('width'));
  let h = Number(root.getAttribute('height'));
  let f: Frame = makeFrame(w, h, JSON.parse(root.dataset.m!), dom);
  let userSizes: number[] = [];
  let userDrops = 0;
  let revealed = root.querySelector('.sp-signature')!.getAttribute('data-hidden') === 'false';
  let markerSize = sizes[0]!;
  let starSize: number | null = null;

  /**
   * The marker travels only as far as the drawn line: past the point where the
   * curve leaves the frame the readout would be quoting the bake's own sample
   * size ("1 in 500,000"), and the dot would sit below the plot area.
   */
  const markerMax = sizes.filter((_, i) => p[i]! >= dom.yMin).pop() ?? sizes[sizes.length - 1]!;

  /** Read off the baked curve — never authored (🔒 ticket 06, D8). */
  const pAt = (s: number) => interpLog(sizes, p, s);
  /** 0 → 1 across the log domain; drives the continuous warm ramp. */
  const t = (s: number) =>
    (Math.log10(Math.max(dom.xMin, s)) - Math.log10(dom.xMin)) / (Math.log10(dom.xMax) - Math.log10(dom.xMin));

  function drawFrame() {
    root.setAttribute('viewBox', `0 0 ${w} ${h}`);
    root.setAttribute('width', String(w));
    root.setAttribute('height', String(h));
    ramp.setAttribute('x1', String(f.m.l));
    ramp.setAttribute('x2', String(f.m.l + f.pw));

    for (const el of grid.querySelectorAll<SVGLineElement>('line')) {
      const gx = el.dataset.gx;
      if (gx) {
        const x = f.x.px(Number(gx));
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
      const gx = el.dataset.gx;
      const gy = el.dataset.gy;
      if (gx) {
        el.setAttribute('x', String(f.x.px(Number(gx))));
        el.setAttribute('y', String(f.m.t + f.ph + 16));
      } else if (gy) {
        el.setAttribute('x', String(f.m.l - 8));
        el.setAttribute('y', String(f.y.px(Number(gy)) + 3.5));
      }
    }
    xTitle.setAttribute('x', String(f.m.l + f.pw / 2));
    xTitle.setAttribute('y', String(h - 6));
    yTitle.setAttribute('transform', `translate(13 ${f.m.t + f.ph / 2}) rotate(-90)`);
    source.setAttribute('x', String(f.m.l));
    source.setAttribute('y', String(f.m.t - 12));

    const ys = coda ? p : p.map((v) => v * Math.max(SP_FLOOR_DROPS, userDrops));
    backbone.setAttribute('d', survivalPath(sizes, ys, f, dom.yMin));
    drawAnno();
  }

  function drawUser() {
    if (!userG || !userLine) return;
    const pts = survival(userSizes);
    let d = '';
    for (const [s, c] of pts) d += `${d ? 'L' : 'M'}${f.x.px(s).toFixed(2)},${f.y.px(c).toFixed(2)}`;
    userLine.setAttribute('d', d);

    const dots = userG.querySelectorAll<SVGCircleElement>('circle');
    pts.forEach(([s, c], i) => {
      let dot = dots[i];
      if (!dot) {
        dot = document.createElementNS(SVG, 'circle') as SVGCircleElement;
        dot.setAttribute('r', '2.6');
        userG.append(dot);
      }
      dot.setAttribute('cx', f.x.px(s).toFixed(2));
      dot.setAttribute('cy', f.y.px(c).toFixed(2));
    });
    for (let i = pts.length; i < dots.length; i++) dots[i]!.remove();

    // Annotation + hot-core dot ride the user's own running max.
    const max = userSizes.length ? Math.max(...userSizes) : 0;
    signature.dataset.hidden = String(!(revealed && max > 0));
    if (max > 0 && maxDot) {
      const mx = f.x.px(max);
      const my = f.y.px(1);
      maxDot.setAttribute('cx', String(mx));
      maxDot.setAttribute('cy', String(my));
      annoTitle.textContent = `one grain, ${fmt(max)} cells`;
      const flip = mx > f.m.l + f.pw * 0.62;
      const lx = flip ? Math.max(f.m.l + 4, mx - f.pw * 0.5) : mx + 14;
      const ly = Math.max(f.m.t + 18, my - 46);
      annoTitle.setAttribute('x', String(lx));
      annoTitle.setAttribute('y', String(ly));
      annoTitle.setAttribute('text-anchor', 'start');
      leader.setAttribute('x1', String(mx));
      leader.setAttribute('y1', String(my - 7));
      leader.setAttribute('x2', String(flip ? lx + 40 : lx));
      leader.setAttribute('y2', String(ly + 7));
    }
  }

  function drawMarker() {
    if (!marker || !mLine || !mDot || !rarityText) return;
    const s = markerSize;
    const x = f.x.px(s);
    const y = f.y.px(pAt(s));
    // Warms continuously along the ramp and NEVER flips — no edge to find.
    const c = rgbStr(lerpStops(HEIGHT, t(s)));
    mLine.setAttribute('x1', String(x));
    mLine.setAttribute('x2', String(x));
    mLine.setAttribute('y1', String(f.m.t));
    mLine.setAttribute('y2', String(f.m.t + f.ph));
    mLine.setAttribute('stroke', c);
    mDot.setAttribute('cx', String(x));
    mDot.setAttribute('cy', String(y));
    mDot.setAttribute('fill', c);
    const one = oneIn(pAt(s));
    const cells = Math.round(s);
    const cellWord = `cell${cells === 1 ? '' : 's'}`;
    rarityText.textContent = `1 in ${fmt(one)} drops ≥ ${fmt(cells)} ${cellWord}`;
    // Parked top-right — the one region a descending survival curve always leaves
    // empty, so a number that changes under the hand never collides with the
    // annotation or crosses the line it is describing.
    rarityText.setAttribute('x', String(f.m.l + f.pw));
    rarityText.setAttribute('text-anchor', 'end');
    rarityText.setAttribute('y', String(f.m.t + 14));
    // The ramp's cool end is too dark to read as text, so the readout warms along
    // the same ramp from a legible floor: it still never flips, it just stays read.
    rarityText.setAttribute('fill', rgbStr(lerpStops(HEIGHT, Math.max(0.42, t(s)))));
    root.setAttribute('aria-valuenow', String(cells));
    root.setAttribute('aria-valuetext', `at least ${fmt(cells)} ${cellWord}, 1 in ${fmt(one)} drops`);
  }

  function drawStar() {
    if (!star) return;
    if (starSize == null) {
      star.dataset.hidden = 'true';
      return;
    }
    const s = Math.min(dom.xMax, Math.max(dom.xMin, starSize));
    star.dataset.hidden = 'false';
    star.setAttribute('x', String(f.x.px(s)));
    star.setAttribute('y', String(f.y.px(pAt(s)) - 8));
    star.setAttribute('text-anchor', 'middle');
    star.textContent = `★ ${fmt(Math.round(s))}`;
  }

  /** Panel 2's annotation: off the line, thin leader onto the straight run, no dot. */
  function drawAnno() {
    if (!coda) return;
    const ax = f.x.px(SP_ANNO_S);
    const ay = f.y.px(pAt(SP_ANNO_S));
    const lx = f.x.px(SP_ANNO_S / 8);
    const ly = Math.min(f.m.t + f.ph - 26, ay + 86);
    annoTitle.setAttribute('x', String(lx));
    annoTitle.setAttribute('y', String(ly));
    leader.setAttribute('x1', String(ax));
    leader.setAttribute('y1', String(ay + 8));
    leader.setAttribute('x2', String(lx + 26));
    leader.setAttribute('y2', String(ly - 9));
  }

  function draw() {
    drawFrame();
    drawUser();
    drawMarker();
    drawStar();
  }

  return {
    setUser(next, drops) {
      userSizes = next;
      userDrops = drops;
      // The backbone brightens the moment the first point lands on it.
      if (next.length) {
        revealed = true;
        root.dataset.lit = 'true';
      }
      drawFrame(); // the backbone rescales with the drop count
      drawUser();
    },
    clear() {
      userSizes = [];
      userDrops = 0;
      revealed = false;
      delete root.dataset.lit;
      draw();
    },
    setMarker(size) {
      markerSize = Math.min(markerMax, Math.max(dom.xMin, size));
      drawMarker();
    },
    setStar(size) {
      starSize = size;
      drawStar();
    },
    layout(width) {
      w = width;
      h = codaHeight(width);
      f = makeFrame(w, h, codaMargins(w), dom);
      draw();
    },
    sizeFromClientX(clientX) {
      const r = root.getBoundingClientRect();
      return f.x.val(((clientX - r.left) / r.width) * w);
    },
    maxSize: () => markerMax,
  };
}
