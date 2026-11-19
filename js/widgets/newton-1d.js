/**
 * Widget: Newton-Verfahren in einer Variablen – Tangenten Schritt für Schritt,
 * quadratische Konvergenz und lokale Konvergenz (Abschnitt 16.3).
 */
import { h, setChildren, slider, segmented, controls, table, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { newton1d, estimateOrder, scalarExample, SCALAR_ROOT } from '../lib/numerics/nonlinear.js';
import { correctDigits } from '../lib/numerics/iteration.js';

const FUNCTIONS = {
  xexp: { label: 'x eˣ − 3', f: scalarExample.f, df: scalarExample.df, root: SCALAR_ROOT, x0: 2.5, range: [-1, 3], y: [-5, 25], x0Range: [-0.5, 3] },
  atan: { label: 'arctan x', f: Math.atan, df: (x) => 1 / (1 + x * x), root: 0, x0: 1.3, range: [-6, 6], y: [-1.8, 1.8], x0Range: [-2, 2] },
  cubic: { label: 'x³ − 2x + 2', f: (x) => x ** 3 - 2 * x + 2, df: (x) => 3 * x * x - 2, root: -1.7692923542386314, x0: 0, range: [-2.5, 2], y: [-6, 6], x0Range: [-2.5, 2] },
};

export default function mount(el) {
  const state = { fn: 'xexp', x0: FUNCTIONS.xexp.x0, steps: 3 };
  const x0Holder = h('div');
  const plot = h('div', { class: 'plot-container' });
  const info = h('div');

  function buildX0Slider() {
    const F = FUNCTIONS[state.fn];
    setChildren(x0Holder, slider({ label: 'Startwert x⁰ =', min: F.x0Range[0], max: F.x0Range[1], step: 0.01, value: state.x0, format: (v) => v.toFixed(2), onInput: (v) => { state.x0 = v; update(); } }).element);
  }

  function update() {
    const F = FUNCTIONS[state.fn];
    const xs = newton1d(F.f, F.df, state.x0, 12);
    const shown = xs.slice(0, state.steps + 1);
    const [lo, hi] = F.range;
    const grid = Array.from({ length: 400 }, (_, k) => lo + ((hi - lo) * k) / 399);
    const tangents = [];
    for (let k = 0; k < shown.length - 1; k++) {
      tangents.push({ data: [[shown[k], 0], [shown[k], F.f(shown[k])], [shown[k + 1], 0]], color: 5 });
    }
    renderPlot(plot, {
      height: 300,
      x: { label: 'x', min: lo, max: hi },
      y: { label: 'f(x)', min: F.y[0], max: F.y[1] },
      series: [
        { data: grid.map((x) => [x, F.f(x)]), label: `f(x) = ${F.label}`, color: 1 },
        { data: [[lo, 0], [hi, 0]], color: 6 },
        ...tangents.map((t, i) => ({ ...t, label: i === 0 ? 'Tangenten' : undefined })),
        { data: shown.map((x) => [x, 0]), kind: 'points', color: 5, radius: 3.5 },
      ],
      ariaLabel: 'Funktion mit Newton-Tangenten',
    });

    const errors = xs.map((x) => Math.abs(x - F.root));
    const orders = estimateOrder(errors);
    setChildren(info, table(['k', 'xᵏ', '|xᵏ − ξ|', 'korrekte Stellen', 'geschätzte Ordnung p'], xs.slice(0, 9).map((x, k) => [
      String(k), h('span', { class: 'mono' }, fmt(x, 15)), fmtExp(errors[k], 2), F.root === 0 ? '—' : String(correctDigits(x, F.root)),
      k >= 2 && Number.isFinite(orders[k - 2]) ? fmt(orders[k - 2], 2) : '—',
    ])));
  }

  setChildren(el,
    controls(
      segmented({ label: 'Funktion', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, f]) => ({ value: k, label: f.label })), onChange: (v) => { state.fn = v; state.x0 = FUNCTIONS[v].x0; buildX0Slider(); update(); } }),
      x0Holder,
      slider({ label: 'gezeigte Schritte', min: 0, max: 8, step: 1, value: state.steps, onInput: (v) => { state.steps = v; update(); } }),
    ),
    plot,
    info,
    h('p', { class: 'widget__hint' }, 'In jedem Schritt wird f durch seine Tangente ersetzt und deren Nullstelle genommen. Nahe der Lösung verdoppelt sich die Zahl der korrekten Stellen pro Schritt. Aber: arctan mit x⁰ = 1,4 springt immer weiter weg, und x³ − 2x + 2 mit x⁰ = 0 pendelt ewig zwischen 0 und 1 – Newton konvergiert nur lokal.'),
  );
  buildX0Slider();
  update();
}
