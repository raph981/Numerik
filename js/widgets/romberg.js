/**
 * Widget: Romberg-Integration als Extrapolation der Trapezsummen in h² (Abschnitt 26.1).
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { EXAMPLE_INTEGRANDS, romberg } from '../lib/numerics/quadrature.js';
import { neville } from '../lib/numerics/interpolation.js';

const INTEGRANDS = {
  exp: { label: 'eˣ auf [0, 1]', f: Math.exp, a: 0, b: 1, exact: Math.E - 1 },
  ...EXAMPLE_INTEGRANDS,
};

export default function mount(el) {
  const state = { fn: 'exp', n: 4 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const tableau = h('div');

  function update() {
    const F = INTEGRANDS[state.fn];
    const { tableau: T, evals } = romberg(F.f, F.a, F.b, state.n);
    const hs = T.map((_, i) => (F.b - F.a) / 2 ** i);
    const h2 = hs.map((v) => v * v);
    const trap = T.map((row) => row[0]);

    // Interpolationspolynom in y = h² durch (h_i², I_{h_i}) und seine Auswertung bis y = 0
    const maxY = h2[Math.min(1, state.n)] * 1.1;
    const ys = Array.from({ length: 200 }, (_, k) => (maxY * k) / 199);
    const pts = h2.map((y, i) => [y, trap[i]]).filter(([y]) => y <= maxY);
    const values = [...pts.map(([, v]) => v), F.exact];
    const pad = 0.15 * (Math.max(...values) - Math.min(...values) || Math.abs(F.exact) || 1);
    renderPlot(plot, {
      height: 260,
      x: { label: 'y = h²', min: 0, max: maxY },
      y: { label: 'Trapezsumme', min: Math.min(...values) - pad, max: Math.max(...values) + pad },
      series: [
        { data: ys.map((y) => [y, neville(h2, trap, y)[0][state.n]]), label: 'Interpolationspolynom in h²', color: 4 },
        { data: pts, kind: 'points', label: 'Trapezsummen I⁽¹⁾_{hᵢ}', color: 1, radius: 4.5 },
        { data: [[0, T[0][state.n]]], kind: 'points', label: 'Romberg-Wert p₀,ₙ', color: 5, radius: 6 },
      ],
      markers: [{ y: F.exact, label: 'I(f)' }],
      ariaLabel: 'Extrapolation der Trapezsummen nach h = 0',
    });

    setChildren(tableau, h('div', { class: 'table-scroll' }, h('table', { class: 'data-table tableau' },
      h('thead', {}, h('tr', {}, h('th', {}, 'hᵢ'), T.map((_, k) => h('th', {}, k === 0 ? 'Trapez' : `k = ${k}`)))),
      h('tbody', {}, T.map((row, i) => h('tr', {}, h('td', {}, `(b−a)/${2 ** i}`),
        T.map((_, k) => h('td', { class: i === 0 && k === state.n ? 'tableau__top' : '' }, k < row.length ? fmtExp(Math.abs(row[k] - F.exact), 1) : ''))))),
    )), h('p', { class: 'widget__hint' }, 'Fehler |p_{i,k} − I(f)|. Spalte k = 1 ist die Simpsonregel, jede weitere Spalte eliminiert einen weiteren Term τₖh²ᵏ der Euler-MacLaurin-Entwicklung.'));

    const best = Math.abs(T[0][state.n] - F.exact);
    setChildren(stats,
      stat('Trapezsumme, feinstes h', fmtExp(Math.abs(trap.at(-1) - F.exact), 2), `Fehler, ${evals} Auswertungen`),
      stat('Romberg p₀,ₙ', fmtExp(best, 2), 'Fehler mit denselben Auswertungen'),
      stat('Gewinn', `Faktor ${fmtExp(Math.abs(trap.at(-1) - F.exact) / Math.max(best, 1e-300), 0)}`, state.fn === 'circle' || state.fn === 'peak' ? 'f nicht glatt genug: wenig Gewinn' : 'f glatt: Fehler O(h²ⁿ⁺²)'),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'Integrand', value: state.fn, options: Object.entries(INTEGRANDS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } })),
    controls(slider({ label: 'Halbierungen n =', min: 1, max: 9, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } })),
    stats,
    plot,
    tableau,
  );
  update();
}
