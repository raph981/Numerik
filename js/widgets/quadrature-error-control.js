/**
 * Widget: Integration mit Fehlerschätzung (Abschnitt 25.3, Algorithmus 25.10).
 */
import { h, setChildren, slider, segmented, controls, stat, table, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { EXAMPLE_INTEGRANDS, trapezoidWithErrorControl } from '../lib/numerics/quadrature.js';

export default function mount(el) {
  const state = { fn: 'sin', tolExp: -6, omega: 0.5 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const tableHolder = h('div');

  function update() {
    const F = EXAMPLE_INTEGRANDS[state.fn];
    const tol = 10 ** state.tolExp;
    const result = trapezoidWithErrorControl(F.f, F.a, F.b, { tol, omega: state.omega, maxLevel: 22 });
    const rows = result.steps.map((s) => ({ ...s, error: Math.abs(s.trapezoid - F.exact) }));

    renderPlot(plot, {
      height: 260,
      x: { label: 'Teilintervalle N der Trapezsumme', log: true },
      y: { label: 'Fehler', log: true },
      series: [
        { data: rows.map((r) => [r.N, Math.max(r.estimate, 1e-17)]), label: 'Schätzung |I⁽²⁾_h − I⁽¹⁾_{h/2}| / (1 − ω)', color: 4 },
        { data: rows.map((r) => [r.N, Math.max(r.error, 1e-17)]), label: 'tatsächlicher Fehler |I − I⁽¹⁾_{h/2}|', color: 1 },
      ],
      markers: [{ y: tol, label: 'TOL' }],
      ariaLabel: 'Fehlerschätzer und wahrer Fehler',
    });
    setChildren(tableHolder, table(
      ['N', 'Trapez I⁽¹⁾_{h/2}', 'Simpson I⁽²⁾_h', 'Schätzung', 'wahrer Fehler', 'Schätzung ≥ Fehler?'],
      rows.map((r) => [String(r.N), r.trapezoid.toPrecision(14), r.simpson.toPrecision(14), fmtExp(r.estimate, 2), fmtExp(r.error, 2), r.estimate >= r.error ? '✓' : '✗']),
      { className: 'data-table tableau' },
    ));
    const last = rows.at(-1);
    setChildren(stats,
      stat('Ergebnis', fmt(result.value, 12), result.converged ? `nach ${rows.length} Halbierungen` : 'Abbruch: maximale Stufe erreicht'),
      stat('Auswertungen', String(result.evals), 'jeder Funktionswert wird nur einmal berechnet'),
      stat('wahrer Fehler', fmtExp(last.error, 2), last.error <= tol ? '≤ TOL ✓' : '> TOL – Annahme an ω verletzt'),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'Integrand', value: state.fn, options: Object.entries(EXAMPLE_INTEGRANDS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } })),
    controls(
      slider({ label: 'TOL = 10^', min: -10, max: -1, step: 0.5, value: state.tolExp, format: (v) => fmt(v, 1), onInput: (v) => { state.tolExp = v; update(); } }),
      slider({ label: 'ω =', min: 0, max: 0.95, step: 0.05, value: state.omega, format: (v) => fmt(v, 2), onInput: (v) => { state.omega = v; update(); } }),
    ),
    stats,
    plot,
    h('details', {}, h('summary', {}, 'Ablauf Schritt für Schritt'), tableHolder),
    h('p', { class: 'widget__hint' }, 'Die Simpsonsumme zu h wird aus den schon vorhandenen Trapez- und Mittelpunktssummen gebildet (Bemerkung 25.7) – die Schätzung ist gratis. Sie ist zuverlässig, solange Simpson wirklich genauer ist als Trapez. Bei (ii) ist das für grobe Gitter falsch: Dort kann der Schätzer den Fehler unterschätzen.'),
  );
  update();
}
