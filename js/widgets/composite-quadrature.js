/**
 * Widget: Summierte Quadraturformeln und experimentelle Konvergenzordnung
 * (Abschnitt 25.2, Beispiel 25.8, Bemerkung 25.9).
 */
import { h, setChildren, slider, segmented, controls, stat, table, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { EXAMPLE_INTEGRANDS as INTEGRANDS, RULES, composite, experimentalOrder } from '../lib/numerics/quadrature.js';
import { lagrangeEval } from '../lib/numerics/interpolation.js';

const RULE_KEYS = ['midpoint', 'trapezoid', 'simpson'];
const LEVELS = Array.from({ length: 15 }, (_, i) => 2 ** i); // N = 1 … 16384

/** Stückweises Interpolationspolynom der Regel (das, was die Regel tatsächlich integriert). */
function piecewiseInterpolant(rule, f, a, b, N, x) {
  const h0 = (b - a) / N;
  const i = Math.min(N - 1, Math.max(0, Math.floor((x - a) / h0)));
  const xs = rule.nodes.map((s) => a + (i + s) * h0);
  return lagrangeEval(xs, xs.map(f), x);
}

export default function mount(el) {
  const state = { fn: 'sin', rule: 'trapezoid', N: 4 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const errorPlot = h('div', { class: 'plot-container' });
  const tableHolder = h('div');

  function update() {
    const F = INTEGRANDS[state.fn];
    const { rule } = RULES[state.rule];
    const grid = Array.from({ length: 801 }, (_, k) => F.a + ((F.b - F.a) * k) / 800);
    const current = composite(rule, F.f, F.a, F.b, state.N);

    renderPlot(plot, {
      height: 260,
      x: { label: 'x', min: F.a, max: F.b },
      y: { label: 'y', ...(state.fn === 'peak' ? { log: true, min: 0.5, max: 2e5 } : {}) },
      series: [
        { data: grid.map((x) => [x, piecewiseInterpolant(rule, F.f, F.a, F.b, state.N, x)]), kind: state.fn === 'peak' ? 'line' : 'area', label: `${RULES[state.rule].label}, N = ${state.N}`, color: 3 },
        { data: grid.map((x) => [x, F.f(x)]), label: 'f', color: 6, dashed: true },
      ],
      ariaLabel: 'Summierte Quadraturformel',
    });

    const results = Object.fromEntries(RULE_KEYS.map((key) => [key, LEVELS.map((N) => {
      const r = composite(RULES[key].rule, F.f, F.a, F.b, N);
      return { N, ...r, error: Math.abs(r.value - F.exact) };
    })]));
    renderPlot(errorPlot, {
      height: 260,
      x: { label: 'Funktionsauswertungen', log: true },
      y: { label: '|I − I_h|', log: true, min: 1e-16 },
      series: RULE_KEYS.map((key, i) => ({
        data: results[key].map((r) => [r.evals, Math.max(r.error, 1e-16)]), label: RULES[key].label, color: [4, 3, 2][i],
      })),
      markers: [{ x: current.evals }],
      ariaLabel: 'Fehler der summierten Quadraturformeln',
    });

    const rows = results[state.rule];
    const eoc = experimentalOrder(rows.map((r) => Math.max(r.error, 1e-300)));
    setChildren(tableHolder, table(
      ['N', '#Fktausw.', 'I_h', 'Fehler', 'EOC α'],
      rows.map((r, i) => [String(r.N), String(r.evals), r.value.toPrecision(16), fmtExp(r.error, 4), i === 0 || r.error < 1e-14 ? '' : fmt(eoc[i - 1], 3)]),
      { className: 'data-table tableau' },
    ));
    setChildren(stats,
      stat(`I_h mit N = ${state.N}`, fmt(current.value, 12), `${current.evals} Auswertungen`),
      stat('Fehler', fmtExp(Math.abs(current.value - F.exact), 3), `exakt ${fmt(F.exact, 12)}`),
      stat('EOC (letzte Zeilen ohne Rundungsfehler)', fmt(eoc.filter((_, i) => rows[i + 1].error > 1e-13).at(-1) ?? NaN, 3), 'α = log(e_{h/2}/e_h) / log(½)'),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'Integrand (Beispiel 25.8)', value: state.fn, options: Object.entries(INTEGRANDS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } })),
    controls(
      segmented({ label: 'Regel', value: state.rule, options: RULE_KEYS.map((k) => ({ value: k, label: RULES[k].label })), onChange: (v) => { state.rule = v; update(); } }),
      slider({ label: 'Teilintervalle N =', min: 1, max: 32, step: 1, value: state.N, onInput: (v) => { state.N = v; update(); } }),
    ),
    stats,
    plot,
    errorPlot,
    h('details', {}, h('summary', {}, 'Tabelle wie im Skript anzeigen'), tableHolder),
    h('p', { class: 'widget__hint' }, 'Doppelt logarithmisch wird die Ordnung zur Steigung. (i): Trapez und Mittelpunkt mit h², Simpson mit h⁴ – bis die Rundungsfehler bei ~10⁻¹⁵ übernehmen. (ii): Lange passiert wenig, die asymptotische Rate stellt sich erst spät ein. (iii): Wegen der unendlichen Steigung am Rand erreichen alle Regeln nur α ≈ 3/2.'),
  );
  update();
}
