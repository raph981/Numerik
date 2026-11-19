/**
 * Widget: Newton-Interpolation mit dividierten Differenzen und Neville-Schema
 * (Abschnitt 17.3). Punkte lassen sich hinzufügen – die alten Koeffizienten bleiben.
 */
import { h, setChildren, slider, controls, button, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { dividedDifferences, newtonEval, neville } from '../lib/numerics/interpolation.js';

const sinc = (x) => (x === 0 ? 1 : Math.sin(x) / x);
const ALL_X = [0, 2, 7, 10, 4.5, 1, 8.5, 5.5];
const num = (v) => fmt(v, 5);

/** Dreieckiges Tableau als HTML-Tabelle; highlight markiert die erste Zeile bzw. das Ergebnis. */
function tableau(xs, T, header, label) {
  const n = xs.length;
  return h('div', { class: 'table-scroll' }, h('table', { class: 'data-table tableau' },
    h('thead', {}, h('tr', {}, h('th', {}, 'xᵢ'), Array.from({ length: n }, (_, k) => h('th', {}, header(k))))),
    h('tbody', {}, xs.map((x, i) => h('tr', {},
      h('td', {}, fmt(x, 3)),
      Array.from({ length: n }, (_, k) => h('td', { class: i === 0 ? 'tableau__top' : '' }, i + k < n ? num(T[i][k]) : ''))))),
  ), h('p', { class: 'widget__hint' }, label));
}

export default function mount(el) {
  const state = { count: 3, x: 5 };
  const plot = h('div', { class: 'plot-container' });
  const tables = h('div');
  const buttons = h('div', { class: 'button-row' });

  function update() {
    const xs = ALL_X.slice(0, state.count);
    const ys = xs.map(sinc);
    const D = dividedDifferences(xs, ys);
    const coeffs = D[0];
    const N = neville(xs, ys, state.x);
    const grid = Array.from({ length: 400 }, (_, k) => (10 * k) / 399);

    setChildren(buttons,
      button('+ Stützstelle hinzufügen', () => { state.count = Math.min(ALL_X.length, state.count + 1); update(); }),
      button('− entfernen', () => { state.count = Math.max(1, state.count - 1); update(); }, { secondary: true }),
      h('span', { class: 'widget__hint' }, `${state.count} Stützstellen → Polynom vom Grad ${state.count - 1}`),
    );
    renderPlot(plot, {
      height: 280,
      x: { label: 'x', min: 0, max: 10 },
      y: { label: 'y', min: -1, max: 1.6 },
      series: [
        { data: grid.map((x) => [x, sinc(x)]), label: 'f(x) = sin(x)/x', color: 6, dashed: true },
        { data: grid.map((x) => [x, newtonEval(xs, coeffs, x)]), label: 'Interpolationspolynom', color: 5 },
        { data: xs.map((x, i) => [x, ys[i]]), kind: 'points', label: 'Stützstellen', color: 1, radius: 4.5 },
        { data: [[state.x, N[0][state.count - 1]]], kind: 'points', label: 'Neville-Auswertung p(x)', color: 4, radius: 6 },
      ],
      markers: [{ x: state.x }],
      ariaLabel: 'Newton-Interpolation',
    });
    setChildren(tables,
      h('h4', {}, 'Dividierte Differenzen y[xᵢ, …, xᵢ₊ₖ]'),
      tableau(xs, D, (k) => (k === 0 ? 'y[xᵢ]' : `k = ${k}`),
        `Die erste Zeile (fett) enthält die Newton-Koeffizienten: p(x) = ${coeffs.map((c, i) => `${num(c)}${i ? ' · N' + '₀₁₂₃₄₅₆₇'[i] + '(x)' : ''}`).join(' + ')}. Fügen Sie einen Punkt hinzu: Die bisherigen Koeffizienten bleiben unverändert, es kommt nur eine neue Diagonale dazu.`),
      h('h4', {}, `Neville-Schema an der Stelle x = ${fmt(state.x, 2)}`),
      tableau(xs, N, (k) => `p_{i,i+${k}}(x)`, `Rechts oben steht der Wert p(x) = ${num(N[0][state.count - 1])} – ohne die Koeffizienten des Polynoms je zu berechnen.`),
    );
  }

  setChildren(el,
    buttons,
    controls(slider({ label: 'Auswertestelle x =', min: 0, max: 10, step: 0.1, value: state.x, format: (v) => v.toFixed(1), onInput: (v) => { state.x = v; update(); } })),
    plot,
    tables,
  );
  update();
}
