/**
 * Widget: Bernstein-Polynome und Bernstein-Approximation (Definition 22.1, Satz 22.3).
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { bernstein, bernsteinApproximation } from '../lib/numerics/bezier.js';
import { equidistantNodes, lagrangeEval } from '../lib/numerics/interpolation.js';

const FUNCTIONS = {
  runge: { label: 'Runge 1/(1+25(2t−1)²)', f: (t) => 1 / (1 + 25 * (2 * t - 1) ** 2) },
  kink: { label: '|t − ½|', f: (t) => Math.abs(t - 0.5) },
  sin: { label: 'sin(2πt)', f: (t) => Math.sin(2 * Math.PI * t) },
};

export default function mount(el) {
  const state = { n: 5, i: 2, fn: 'runge', m: 10 };
  const basisPlot = h('div', { class: 'plot-container' });
  const approxPlot = h('div', { class: 'plot-container' });
  const iHolder = h('div');
  const stats = h('div', { class: 'stats' });
  const grid = Array.from({ length: 400 }, (_, k) => k / 399);

  function update() {
    state.i = Math.min(state.i, state.n);
    setChildren(iHolder, slider({ label: 'hervorgehoben: i =', min: 0, max: state.n, step: 1, value: state.i, onInput: (v) => { state.i = v; update(); } }).element);
    renderPlot(basisPlot, {
      height: 240,
      x: { label: 't', min: 0, max: 1 },
      y: { label: 'B_i^(n)(t)', min: 0, max: 1.05 },
      series: [
        ...Array.from({ length: state.n + 1 }, (_, i) => ({ data: grid.map((t) => [t, bernstein(state.n, i, t)]), color: i === state.i ? 4 : 6, dashed: i !== state.i, label: i === state.i ? `B${state.i}⁽${state.n}⁾ mit Maximum bei t = i/n = ${(state.i / state.n).toFixed(2)}` : undefined })),
        { data: grid.map((t) => [t, Array.from({ length: state.n + 1 }, (_, i) => bernstein(state.n, i, t)).reduce((a, b) => a + b, 0)]), label: 'Summe = 1 (Zerlegung der Eins)', color: 1 },
      ],
      markers: [{ x: state.i / state.n }],
      ariaLabel: 'Bernstein-Polynome',
    });

    const F = FUNCTIONS[state.fn];
    const nodes = equidistantNodes(0, 1, state.m);
    const vals = nodes.map(F.f);
    const approx = (t) => bernsteinApproximation(F.f, state.m, t);
    const interp = (t) => lagrangeEval(nodes, vals, t);
    renderPlot(approxPlot, {
      height: 260,
      x: { label: 't', min: 0, max: 1 },
      y: { label: 'y', min: -1.5, max: 1.6 },
      series: [
        { data: grid.map((t) => [t, F.f(t)]), label: 'f(t)', color: 6, dashed: true },
        { data: grid.map((t) => [t, approx(t)]), label: `Bernstein-Approximation fₙ, n = ${state.m}`, color: 2 },
        { data: grid.map((t) => [t, interp(t)]), label: 'Lagrange-Interpolation, gleiche Punkte', color: 5 },
        { data: nodes.map((t, k) => [t, vals[k]]), kind: 'points', color: 1, radius: 3 },
      ],
      ariaLabel: 'Bernstein-Approximation und Interpolation',
    });
    const err = (g) => Math.max(...grid.map((t) => Math.abs(F.f(t) - g(t))));
    setChildren(stats,
      stat('max |f − fₙ| (Bernstein)', fmtExp(err(approx), 2), 'konvergiert immer, aber langsam'),
      stat('max |f − p| (Interpolation)', fmtExp(err(interp), 2), 'kann divergieren'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'Grad n =', min: 1, max: 12, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } }),
      iHolder,
    ),
    basisPlot,
    h('h4', {}, 'Approximationssatz: fₙ(t) = Σ f(i/n) Bᵢ⁽ⁿ⁾(t) → f'),
    controls(
      segmented({ label: 'Funktion', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, f]) => ({ value: k, label: f.label })), onChange: (v) => { state.fn = v; update(); } }),
      slider({ label: 'n =', min: 2, max: 60, step: 1, value: state.m, onInput: (v) => { state.m = v; update(); } }),
    ),
    stats,
    approxPlot,
    h('p', { class: 'widget__hint' }, 'Die Bernstein-Approximation geht nicht durch die Punkte, schwingt dafür aber nie über: Sie ist eine gewichtete Mittelung der Werte f(i/n) mit positiven Gewichten, die sich zu 1 summieren.'),
  );
  update();
}
