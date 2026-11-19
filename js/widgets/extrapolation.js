/**
 * Widget: Extrapolation zum Limes (Vorlesung 19). Interpolationspolynom durch
 * (h_i, a(h_i)) und Auswertung bei h = 0, wahlweise in h oder h².
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { neville } from '../lib/numerics/interpolation.js';

const PROBLEMS = {
  limit: { label: '(cos h − 1)/sin h → 0', a: (h0) => (Math.cos(h0) - 1) / Math.sin(h0), exact: 0, even: false },
  forward: { label: 'Vorwärtsdifferenz von eˣ bei 1', a: (h0) => (Math.exp(1 + h0) - Math.E) / h0, exact: Math.E, even: false },
  central: { label: 'Zentraldifferenz von eˣ bei 1', a: (h0) => (Math.exp(1 + h0) - Math.exp(1 - h0)) / (2 * h0), exact: Math.E, even: true },
};

export default function mount(el) {
  const state = { problem: 'limit', count: 3, h0: 1 / 8, variable: 'h' };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const tableau = h('div');

  function update() {
    const P = PROBLEMS[state.problem];
    const hs = Array.from({ length: state.count }, (_, i) => state.h0 / 2 ** i); // h_i = h0·rⁱ, r = ½
    const ys = hs.map(P.a);
    const nodes = state.variable === 'h2' ? hs.map((v) => v * v) : hs;
    const T = neville(nodes, ys, 0);
    const extrapolated = T[0][state.count - 1];

    // Interpolationspolynom auf [0, h0] zeichnen (Neville an vielen Stellen)
    const grid = Array.from({ length: 200 }, (_, k) => (state.h0 * 1.05 * k) / 199);
    const poly = grid.map((x) => [x, neville(nodes, ys, state.variable === 'h2' ? x * x : x)[0][state.count - 1]]);
    renderPlot(plot, {
      height: 280,
      x: { label: 'h', min: 0, max: state.h0 * 1.05 },
      series: [
        { data: grid.slice(1).map((x) => [x, P.a(x)]), label: 'a(h)', color: 6, dashed: true },
        { data: poly, label: `Interpolationspolynom in ${state.variable === 'h2' ? 'h²' : 'h'}`, color: 4 },
        { data: hs.map((x, i) => [x, ys[i]]), kind: 'points', label: 'berechnete a(hᵢ)', color: 1, radius: 4.5 },
        { data: [[0, extrapolated]], kind: 'points', label: 'Extrapolation p(0)', color: 5, radius: 6 },
      ],
      markers: [{ y: P.exact, label: 'a(0)' }],
      y: { label: 'a' },
      ariaLabel: 'Extrapolation zum Limes',
    });

    // Tableau der Fehler: Spalte k = Extrapolation aus k+1 Werten
    setChildren(tableau, h('div', { class: 'table-scroll' }, h('table', { class: 'data-table tableau' },
      h('thead', {}, h('tr', {}, h('th', {}, 'hᵢ'), Array.from({ length: state.count }, (_, k) => h('th', {}, k === 0 ? '|a(hᵢ) − a(0)|' : `${k + 1} Werte`)))),
      h('tbody', {}, hs.map((x, i) => h('tr', {}, h('td', {}, `1/${Math.round(1 / x)}`),
        Array.from({ length: state.count }, (_, k) => h('td', { class: i === 0 && k === state.count - 1 ? 'tableau__top' : '' }, i + k < state.count ? fmtExp(Math.abs(T[i][k] - P.exact), 1) : ''))))),
    )), h('p', { class: 'widget__hint' }, 'Fehler im Neville-Tableau bei h = 0: Jede Spalte nach rechts eliminiert einen weiteren Term der Taylorentwicklung.'));

    setChildren(stats,
      stat('bester Einzelwert a(h_n)', fmtExp(Math.abs(ys.at(-1) - P.exact), 2), 'Fehler'),
      stat('Extrapolation p(0)', fmtExp(Math.abs(extrapolated - P.exact), 2), 'Fehler'),
      stat('Gewinn', `Faktor ${fmtExp(Math.abs(ys.at(-1) - P.exact) / Math.max(Math.abs(extrapolated - P.exact), 1e-300), 0)}`, 'bei gleich vielen Auswertungen'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Größe a(h)', value: state.problem, options: Object.entries(PROBLEMS).map(([k, p]) => ({ value: k, label: p.label })), onChange: (v) => { state.problem = v; update(); } }),
      segmented({ label: 'Polynom in', value: state.variable, options: [{ value: 'h', label: 'h' }, { value: 'h2', label: 'h² (gerade Entwicklung)' }], onChange: (v) => { state.variable = v; update(); } }),
    ),
    controls(
      slider({ label: 'Anzahl Werte n + 1 =', min: 1, max: 6, step: 1, value: state.count, onInput: (v) => { state.count = v; update(); } }),
      slider({ label: 'h₀ = 1/', min: 2, max: 32, step: 1, value: 1 / state.h0, onInput: (v) => { state.h0 = 1 / v; update(); } }),
    ),
    stats,
    plot,
    tableau,
    h('p', { class: 'widget__hint' }, 'hᵢ = h₀/2ⁱ. Die zentrale Differenz hat eine Fehlerentwicklung nur in geraden Potenzen von h: Mit einem Polynom in h² eliminiert man mit gleich vielen Auswertungen doppelt so viele Fehlerterme.'),
  );
  update();
}
