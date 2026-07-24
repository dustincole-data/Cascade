import { KEY_PILE_BIGGEST } from '../lib/pile-config.ts';
import { SP_X, codaWidth } from '../lib/plot-layout.ts';
import { attachPlot } from './plot.ts';
import { attachSurvival } from './survival.ts';

const KEY_CROSSING = 'cascade.ff.crossing';
const D_MIN = 0.3;
const D_MAX = 0.86;
const D_STEP = 0.005;
/** Panel 2's arrows walk the line in fixed fractional-decade steps (🔒 ticket 06, D3). */
const DECADE_STEP = 1 / 12;

const readNumber = (key: string): number | null => {
  try {
    const raw = localStorage.getItem(key);
    const v = raw == null ? null : Number(raw);
    return v != null && Number.isFinite(v) ? v : null;
  } catch {
    return null; // private mode — the ★ is simply absent
  }
};

/** Drag or arrow-key one marker; both panels get the same gesture, never a synced one. */
function draggable(svg: SVGSVGElement, o: { label: string; move(clientX: number): void; step(dir: -1 | 1 | 'min' | 'max'): void }) {
  svg.setAttribute('role', 'slider');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-label', o.label);
  svg.addEventListener('keydown', (e) => {
    const k = e.key;
    const dir =
      k === 'ArrowRight' || k === 'ArrowUp' ? 1 : k === 'ArrowLeft' || k === 'ArrowDown' ? -1 : k === 'Home' ? 'min' : k === 'End' ? 'max' : null;
    if (dir === null) return;
    e.preventDefault();
    o.step(dir as -1 | 1 | 'min' | 'max');
  });
  let dragging = false;
  svg.addEventListener('pointerdown', (e) => {
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    o.move(e.clientX);
  });
  svg.addEventListener('pointermove', (e) => {
    if (dragging) o.move(e.clientX);
  });
  svg.addEventListener('pointerup', (e) => {
    dragging = false;
    svg.releasePointerCapture(e.pointerId);
  });
  svg.addEventListener('pointercancel', () => {
    dragging = false;
  });
  svg.classList.add('is-interactive');
}

/**
 * The coda's re-feels. Plot-space only — no sim, no rAF (ticket 03's constraint,
 * intact). Pure enhancement: with no JS both panels already render their line,
 * annotation, source and copy.
 *
 * The two panels answer the SAME gesture with opposite outcomes (🔒 ticket 06):
 * panel 1 flips at one exact pixel and its readout leaps; panel 2's rarity climbs
 * three orders of magnitude with no break, warming continuously, never flipping.
 * You go looking for the edge and there isn't one.
 */
export function attachCoda(): void {
  const observed: { el: HTMLElement; apply(width: number): void }[] = [];

  const fireSvg = document.getElementById('coda-plot') as SVGSVGElement | null;
  if (fireSvg) {
    const plot = attachPlot(fireSvg);
    let d = 0.55; // rests poised just BELOW the knee; no autoplay
    plot.setYReadout(true);
    plot.setYourRun(readNumber(KEY_CROSSING));

    const set = (next: number) => {
      d = Math.min(D_MAX, Math.max(D_MIN, next));
      plot.setMarker(d);
      fireSvg.setAttribute('aria-valuenow', d.toFixed(3));
      fireSvg.setAttribute(
        'aria-valuetext',
        `density ${d.toFixed(2)}, ${Math.round(plot.yAt(d) * 100)} percent burned`,
      );
    };
    fireSvg.setAttribute('aria-valuemin', String(D_MIN));
    fireSvg.setAttribute('aria-valuemax', String(D_MAX));
    draggable(fireSvg, {
      label: 'Density marker. Move across the threshold to see the fraction burned leap.',
      move: (x) => set(plot.dFromClientX(x)),
      step: (dir) => set(dir === 'min' ? D_MIN : dir === 'max' ? D_MAX : d + dir * D_STEP),
    });
    set(d);
    observed.push({
      el: fireSvg.closest('.coda-plot') as HTMLElement,
      apply: (width) => {
        plot.layout(width);
        set(d);
      },
    });
  }

  const survSvg = document.getElementById('coda-survival') as SVGSVGElement | null;
  if (survSvg) {
    const plot = attachSurvival(survSvg);
    let s = SP_X.min; // rests at the small end, poised to travel out the tail
    plot.setStar(readNumber(KEY_PILE_BIGGEST));

    const set = (next: number) => {
      s = Math.min(plot.maxSize(), Math.max(SP_X.min, next));
      plot.setMarker(s);
    };
    const sMax = plot.maxSize();
    survSvg.setAttribute('aria-valuemin', String(SP_X.min));
    survSvg.setAttribute('aria-valuemax', String(sMax));
    draggable(survSvg, {
      label: 'Avalanche-size marker. Move out along the tail: the rarity climbs and never breaks.',
      move: (x) => set(plot.sizeFromClientX(x)),
      step: (dir) =>
        set(
          dir === 'min' ? SP_X.min : dir === 'max' ? sMax : 10 ** (Math.log10(s) + dir * DECADE_STEP),
        ),
    });
    set(s);
    observed.push({
      el: survSvg.closest('.coda-plot') as HTMLElement,
      apply: (width) => {
        plot.layout(width);
        set(s);
      },
    });
  }

  // The board widens as panels land, and stacks below 1100px — so a plot takes
  // the width of the slot it lands in and re-lays-out when that changes.
  const relayout = () => {
    for (const o of observed) {
      const avail = o.el.clientWidth;
      if (avail > 0) o.apply(codaWidth(avail));
    }
  };
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(relayout);
    for (const o of observed) ro.observe(o.el);
  } else {
    addEventListener('resize', relayout);
  }
  relayout();

  document.querySelectorAll<HTMLElement>('[data-js-only]').forEach((el) => (el.dataset.jsOn = 'true'));
}
