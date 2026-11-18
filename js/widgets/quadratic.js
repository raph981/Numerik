/**
 * Widget: Die quadratische Gleichung x² − p x + q = 0 in float (Abschnitt 3.5):
 * p-q-Formel vs. Vieta.
 */
import { h, setChildren, slider, controls, table, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { quadraticRoots, quadraticRootsExact, relativeError } from '../lib/numerics/condition.js';

const rd = Math.fround;

export default function mount(el) {
  const state = { p: 100, logQ: -2 };
  const result = h('div');
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const { p } = state;
    const q = 10 ** state.logQ;
    if (p * p / 4 <= q) {
      setChildren(result, h('p', { class: 'widget__error' }, 'Für p²/4 ≤ q gibt es keine zwei verschiedenen reellen Lösungen.'));
      return;
    }
    const exact = quadraticRootsExact(p, q);
    const { naive, stable } = quadraticRoots(p, q, rd);
    const smallIndex = p > 0 ? 1 : 0;
    const cell = (v, e, i) => h('span', { class: i === smallIndex && e > 1e-4 ? 'digits-bad' : '' }, `${fmtExp(v, 7)}  (rel. Fehler ${fmtExp(relativeError(v, e), 1)})`);
    setChildren(result, table(['', 'x₁', 'x₂'], [
      ['exakt', fmtExp(exact[0], 10), fmtExp(exact[1], 10)],
      ['p-q-Formel', cell(naive[0], exact[0], 0), cell(naive[1], exact[1], 1)],
      ['mit Vieta', cell(stable[0], exact[0], 0), cell(stable[1], exact[1], 1)],
    ]));

    const sweep = Array.from({ length: 81 }, (_, i) => -8 + (i * 7.9) / 80)
      .map((lq) => 10 ** lq)
      .filter((qq) => p * p / 4 > qq)
      .map((qq) => {
        const ex = quadraticRootsExact(p, qq);
        const r = quadraticRoots(p, qq, rd);
        return { q: qq, naive: relativeError(r.naive[smallIndex], ex[smallIndex]), stable: relativeError(r.stable[smallIndex], ex[smallIndex]) };
      });
    const floor = 1e-9;
    renderPlot(plot, {
      height: 280,
      x: { label: 'q', log: true },
      y: { label: 'rel. Fehler der kleinen Lösung', log: true, min: floor, max: 10 },
      series: [
        { data: sweep.map((s) => [s.q, Math.max(s.naive, floor)]), label: 'p-q-Formel', color: 5 },
        { data: sweep.map((s) => [s.q, Math.max(s.stable, floor)]), label: 'über Vieta', color: 2 },
      ],
      markers: [{ x: q }],
      ariaLabel: 'Fehler der kleinen Lösung in Abhängigkeit von q',
    });
  }

  setChildren(el,
    controls(
      slider({ label: 'p =', min: -200, max: 200, step: 5, value: state.p, onInput: (v) => { state.p = v || 5; update(); } }),
      slider({ label: 'q = 10^', min: -8, max: 3, step: 0.1, value: state.logQ, format: (v) => v.toFixed(1), onInput: (v) => { state.logQ = v; update(); } }),
    ),
    result,
    plot,
    h('p', { class: 'widget__hint' }, 'Für kleines q ist √(p²/4 − q) ≈ |p|/2: Bei der betragskleinen Lösung werden fast gleiche Zahlen subtrahiert. Vieta (x₁·x₂ = q) umgeht diese Subtraktion.'),
  );
  update();
}
