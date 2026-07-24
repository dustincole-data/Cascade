import { attachPlot } from './plot.ts';

const KEY_CROSSING = 'cascade.ff.crossing';
const D_MIN = 0.3;
const D_MAX = 0.86;
const STEP = 0.005;

/**
 * The coda's one interaction: the plot performs the cliff. Dragging the marker
 * across the knee makes the y-readout leap (tiny Δd → huge Δy), flips the
 * marker cyan→amber at the exact d_c pixel, and floods the catastrophe regime
 * warm. Plot-space only — no sim, no rAF. Pure enhancement: with no JS the
 * panel already renders the canonical curve, the annotation and all the copy.
 */
export function attachCoda(): void {
  const svg = document.getElementById('coda-plot') as SVGSVGElement | null;
  if (!svg) return;

  const plot = attachPlot(svg);
  let d = 0.55; // rests poised just BELOW the knee; no autoplay

  plot.setYReadout(true);

  // The personal thread: where THIS user crossed. Absent ⇒ the panel is still complete.
  try {
    const raw = localStorage.getItem(KEY_CROSSING);
    const v = raw == null ? null : Number(raw);
    plot.setYourRun(v != null && Number.isFinite(v) ? v : null);
  } catch {
    plot.setYourRun(null);
  }

  const set = (next: number) => {
    d = Math.min(D_MAX, Math.max(D_MIN, next));
    plot.setMarker(d);
    svg.setAttribute('aria-valuenow', d.toFixed(3));
    svg.setAttribute('aria-valuetext', `density ${d.toFixed(2)}, ${Math.round(plot.yAt(d) * 100)} percent burned`);
  };

  // Keyboard first — arrow-keys get the identical flip (ticket 03, dec. 10).
  svg.setAttribute('role', 'slider');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-label', 'Density marker. Move across the threshold to see the fraction burned leap.');
  svg.setAttribute('aria-valuemin', String(D_MIN));
  svg.setAttribute('aria-valuemax', String(D_MAX));

  svg.addEventListener('keydown', (e) => {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? STEP
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
          ? -STEP
          : e.key === 'Home'
            ? D_MIN - d
            : e.key === 'End'
              ? D_MAX - d
              : 0;
    if (!delta) return;
    e.preventDefault();
    set(d + delta);
  });

  let dragging = false;
  const move = (clientX: number) => set(plot.dFromClientX(clientX));
  svg.addEventListener('pointerdown', (e) => {
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    move(e.clientX);
  });
  svg.addEventListener('pointermove', (e) => {
    if (dragging) move(e.clientX);
  });
  svg.addEventListener('pointerup', (e) => {
    dragging = false;
    svg.releasePointerCapture(e.pointerId);
  });
  svg.addEventListener('pointercancel', () => {
    dragging = false;
  });

  set(d);
  document.querySelectorAll<HTMLElement>('[data-js-only]').forEach((el) => (el.dataset.jsOn = 'true'));
  svg.classList.add('is-interactive');
}
