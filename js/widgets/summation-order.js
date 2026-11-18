/**
 * Widget: Die Reihenfolge der Summation beeinflusst das Ergebnis (Abschnitt 3.1, Folge von b).
 * Σ 1/k² vorwärts (große Terme zuerst) vs. rückwärts (kleine Terme zuerst) in float.
 */
import { h, setChildren, controls, segmented, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { inverseSquareSum } from '../lib/numerics/arithmetic.js';

const NS = Array.from({ length: 21 }, (_, i) => Math.round(10 ** (1 + (i * 5) / 20)));

export default function mount(el) {
  const state = { precision: 'float' };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const rows = NS.map((n) => {
      const exact = inverseSquareSum(n, 'double', 'backward');
      return {
        n,
        exact,
        forward: Math.abs(inverseSquareSum(n, state.precision, 'forward') - exact) / exact,
        backward: Math.abs(inverseSquareSum(n, state.precision, 'backward') - exact) / exact,
      };
    });
    const last = rows.at(-1);
    setChildren(stats,
      stat(`n = ${last.n.toLocaleString('de-DE')}: vorwärts`, fmtExp(last.forward, 1), 'rel. Fehler, große Terme zuerst'),
      stat('rückwärts', fmtExp(last.backward, 1), 'rel. Fehler, kleine Terme zuerst'),
    );
    const floor = state.precision === 'float' ? 1e-9 : 1e-18;
    renderPlot(plot, {
      height: 280,
      x: { label: 'Anzahl Summanden n', log: true },
      y: { label: 'relativer Fehler', log: true, min: floor },
      series: [
        { data: rows.map((r) => [r.n, Math.max(r.forward, floor)]), label: 'vorwärts: 1 + 1/4 + 1/9 + …', color: 5 },
        { data: rows.map((r) => [r.n, Math.max(r.backward, floor)]), label: 'rückwärts: … + 1/9 + 1/4 + 1', color: 2 },
      ],
      ariaLabel: 'Fehler der Summation in Abhängigkeit von n',
    });
  }

  setChildren(el,
    controls(segmented({ label: 'Genauigkeit', value: state.precision, options: [{ value: 'float', label: 'float' }, { value: 'double', label: 'double' }], onChange: (v) => { state.precision = v; update(); } })),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Vorwärts: Ist die Summe erst ≈ 1,64, fallen kleine Summanden 1/k² < eps·1,64 einfach weg (x ⊕ y = x). Rückwärts wachsen kleine Terme erst gemeinsam an und gehen nicht verloren.'),
  );
  update();
}
