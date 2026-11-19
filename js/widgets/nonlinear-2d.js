/**
 * Widget: Relaxation und Newton-Verfahren für Kreis ∩ Ellipse (Beispiele 15.1 b, 16.1, 16.10).
 * Der Startwert lässt sich ziehen. Für die Relaxation wird der Banach'sche
 * a-posteriori-Fehlerkreis eingezeichnet.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { renderPlot } from '../core/plot.js';
import { systemExample, solveSystem, nearestRoot, SYSTEM_ROOTS } from '../lib/numerics/nonlinear.js';

const ellipse = Array.from({ length: 181 }, (_, k) => {
  const t = (2 * Math.PI * k) / 180;
  return [3 * Math.cos(t), Math.sin(t)];
});
const QUADRANT = ['I', 'II', 'III', 'IV'];

export default function mount(el, { method = 'relaxation' } = {}) {
  const state = { method, sigma: 0.1, x0: [2, 1] };
  const sigmaSlider = slider({ label: 'σ =', min: -0.6, max: 0.6, step: 0.005, value: state.sigma, format: (v) => v.toFixed(3), onInput: (v) => { state.sigma = v; update(); } });
  const plane = createPlane({ range: 3.5, ariaLabel: 'Kreis und Ellipse mit Iterationspfad' });
  plane.onDrag((p) => { state.x0 = p; update(); });
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function update() {
    sigmaSlider.element.hidden = state.method !== 'relaxation';
    const res = solveSystem(systemExample, state.x0, { method: state.method, sigma: state.sigma, maxIt: state.method === 'newton' ? 50 : 4000 });
    const it = res.iterates;

    plane.clear().grid(0.5);
    plane.circle([0, 0], 2, 'series-3');
    plane.path(ellipse, 'series-5', { closed: true });
    SYSTEM_ROOTS.forEach((r) => plane.dot(r, 'series-6', 3));

    // a-posteriori-Kreis nach Satz 15.17 an einem frühen Schritt k
    const k = Math.min(8, it.length - 1);
    if (state.method === 'relaxation' && k >= 2) {
      const d1 = Math.hypot(it[k][0] - it[k - 1][0], it[k][1] - it[k - 1][1]);
      const d0 = Math.hypot(it[k - 1][0] - it[k - 2][0], it[k - 1][1] - it[k - 2][1]);
      const q = d0 > 0 ? d1 / d0 : 1;
      if (q < 1) {
        plane.circle(it[k], (q / (1 - q)) * d1, 'series-4', { dashed: true });
        plane.text(it[k], `ξ liegt im Kreis um x${'⁰¹²³⁴⁵⁶⁷⁸'[k]}`, 'series-4', 8, 18);
      }
    }
    const visible = it.slice(0, 400);
    plane.path(visible, 'series-1');
    visible.slice(0, 60).forEach((x, i) => plane.dot(x, i === 0 ? 'series-2' : 'series-1', i === 0 ? 6 : 2.5));
    plane.text(state.x0, 'x⁰ (ziehen)', 'series-2');

    const floor = 1e-16;
    renderPlot(plot, {
      height: 200,
      x: { label: 'Schritt k', min: 0, max: Math.max(10, it.length - 1) },
      y: { label: '‖f(xᵏ)‖', log: true, min: floor },
      series: [{ data: res.residuals.map((r, i) => [i, Math.max(r, floor)]), kind: 'points', color: 1, radius: 2.5 }],
      ariaLabel: 'Residuum über den Iterationen',
    });

    const root = nearestRoot(it.at(-1));
    const reductions = res.residuals.slice(1).map((r, i) => r / res.residuals[i]);
    setChildren(stats,
      stat('Ergebnis', res.converged ? `Nullstelle im Quadrant ${QUADRANT[root] ?? '?'}` : 'keine Konvergenz', res.converged ? `(${fmt(it.at(-1)[0], 6)}, ${fmt(it.at(-1)[1], 6)})` : ''),
      stat('Schritte', String(it.length - 1), 'bis Reduktion 10⁻¹⁰'),
      stat('letzte Reduktionsfaktoren', reductions.slice(-3).map((r) => fmtExp(r, 1)).join(', '), state.method === 'newton' ? 'quadrieren sich' : '≈ konstant (linear)'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Verfahren', value: state.method, options: [{ value: 'relaxation', label: 'Relaxation x − σf(x)' }, { value: 'newton', label: 'Newton' }], onChange: (v) => { state.method = v; update(); } }),
      sigmaSlider,
    ),
    h('div', { class: 'widget-columns' }, plane.svg, h('div', {}, stats, plot)),
    h('p', { class: 'widget__hint' }, 'Blau: Kreis x₁² + x₂² = 4, rot: Ellipse x₁²/9 + x₂² = 1. Ziehen Sie den Startwert in die Nähe der Schnittpunkte im 2. oder 4. Quadranten: Die Relaxation läuft für kein σ dorthin – Newton findet alle vier.'),
  );
  update();
}
