/**
 * Widget: Lagrange-Basis und Interpolationspolynom (Abschnitt 17.2),
 * dazu die Kondition der Vandermonde-Matrix.
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { equidistantNodes, lagrangeBasis, lagrangeEval, vandermonde } from '../lib/numerics/interpolation.js';
import { inverse } from '../lib/numerics/lu.js';
import { normInf } from '../lib/numerics/linalg.js';

const sinc = (x) => (x === 0 ? 1 : Math.sin(x) / x);

export default function mount(el) {
  const state = { data: 'table', n: 6, highlight: 1 };
  const nSlider = slider({ label: 'Grad n =', min: 1, max: 12, step: 1, value: state.n, onInput: (v) => { state.n = v; state.highlight = Math.min(state.highlight, v); update(); } });
  const highlightHolder = h('div');
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function data() {
    if (state.data === 'table') return { xs: [0, 2, 7, 10], ys: [1, 0.4546, 0.0938, -0.0544], range: [0, 10] };
    const xs = equidistantNodes(0, 1, state.n);
    return { xs, ys: xs.map((x) => Math.sin(2 * Math.PI * x) + x), range: [0, 1] };
  }

  function update() {
    nSlider.element.hidden = state.data === 'table';
    const { xs, ys, range } = data();
    const n = xs.length - 1;
    state.highlight = Math.min(state.highlight, n);
    setChildren(highlightHolder, slider({ label: 'hervorgehobenes Lᵢ: i =', min: 0, max: n, step: 1, value: state.highlight, onInput: (v) => { state.highlight = v; update(); } }).element);

    const grid = Array.from({ length: 400 }, (_, k) => range[0] + ((range[1] - range[0]) * k) / 399);
    const series = xs.map((_, i) => ({
      data: grid.map((x) => [x, lagrangeBasis(xs, i, x)]),
      color: i === state.highlight ? 4 : 6,
      dashed: i !== state.highlight,
      label: i === state.highlight ? `L${'₀₁₂₃₄₅₆₇₈₉'[i] ?? i}⁽ⁿ⁾(x): 1 bei x${'₀₁₂₃₄₅₆₇₈₉'[i] ?? i}, 0 an allen anderen Stützstellen` : undefined,
    }));
    series.push({ data: grid.map((x) => [x, lagrangeEval(xs, ys, x)]), label: 'p(x) = Σ yᵢ Lᵢ(x)', color: 5 });
    series.push({ data: xs.map((x, i) => [x, ys[i]]), kind: 'points', label: 'Daten (xᵢ, yᵢ)', color: 1, radius: 4.5 });
    if (state.data === 'table') series.push({ data: grid.map((x) => [x, sinc(x)]), label: 'sin(x)/x (Herkunft der Daten)', color: 3, dashed: true });

    renderPlot(plot, {
      height: 320,
      x: { label: 'x', min: range[0], max: range[1] },
      y: { label: 'y', min: -1.6, max: 2.2 },
      series,
      ariaLabel: 'Lagrange-Polynome und Interpolationspolynom',
    });

    const V = vandermonde(xs);
    let cond;
    try { cond = normInf(V) * normInf(inverse(V)); } catch { cond = Infinity; }
    setChildren(stats,
      stat('Stützstellen', String(n + 1), `Polynom vom Grad ${n}`),
      stat('cond∞ der Vandermonde-Matrix', fmtExp(cond, 2), 'Monombasis: schlecht konditioniert'),
      stat('Lagrange-Basis', 'Gleichungssystem I·a = y', 'Koeffizienten = Daten, nichts zu lösen'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Daten', value: state.data, options: [{ value: 'table', label: 'Tabelle aus Beispiel 17.6' }, { value: 'equi', label: 'äquidistant auf [0, 1]' }], onChange: (v) => { state.data = v; state.highlight = 1; update(); } }),
      nSlider,
      highlightHolder,
    ),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Jedes Lagrange-Polynom „schaltet“ genau einen Datenpunkt ein und ist an allen anderen Stützstellen null. Das Interpolationspolynom ist einfach ihre mit yᵢ gewichtete Summe.'),
  );
  update();
}
