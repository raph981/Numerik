/**
 * Widget: Elementwachstum ‖U‖∞/‖A‖∞ bei Spalten- und Totalpivotisierung (Abschnitt 9.4).
 */
import { h, setChildren, slider, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { luDecompose, luSolve, growthFactor, wilkinsonMatrix } from '../lib/numerics/lu.js';
import { createRng } from '../lib/numerics/special.js';

function randomMatrix(n, seed) {
  const rnd = createRng(seed);
  return Array.from({ length: n }, () => Array.from({ length: n }, () => rnd()));
}

function solveError(A, pivoting) {
  const n = A.length;
  const x = Array.from({ length: n }, (_, i) => 1 + (i % 3));
  const b = A.map((row) => row.reduce((s, v, j) => s + v * x[j], 0));
  const xh = luSolve(luDecompose(A, { pivoting }), b).x;
  return Math.max(...xh.map((v, i) => Math.abs(v - x[i]))) / 3;
}

export default function mount(el) {
  const state = { n: 40 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const ns = Array.from({ length: 30 }, (_, i) => 2 + i * 2);
  const data = ns.map((n) => {
    const W = wilkinsonMatrix(n);
    const R = randomMatrix(n, n);
    return {
      n,
      wPartial: growthFactor(W, luDecompose(W, { pivoting: 'partial' }).U),
      wFull: growthFactor(W, luDecompose(W, { pivoting: 'full' }).U),
      rPartial: growthFactor(R, luDecompose(R, { pivoting: 'partial' }).U),
    };
  });

  function update() {
    const W = wilkinsonMatrix(state.n);
    setChildren(stats,
      stat('Wachstum Spaltenpivot', fmtExp(growthFactor(W, luDecompose(W, { pivoting: 'partial' }).U), 2), `= 2^${state.n - 1} / ${state.n} (Wilkinson)`),
      stat('rel. Fehler von x (Spaltenpivot)', fmtExp(solveError(W, 'partial'), 1)),
      stat('rel. Fehler von x (Totalpivot)', fmtExp(solveError(W, 'full'), 1)),
    );
    renderPlot(plot, {
      height: 280,
      x: { label: 'n' },
      y: { label: '‖U‖∞ / ‖A‖∞', log: true, min: 0.1 },
      series: [
        { data: data.map((d) => [d.n, d.wPartial]), label: 'Wilkinson-Matrix, Spaltenpivot', color: 5 },
        { data: data.map((d) => [d.n, d.wFull]), label: 'Wilkinson-Matrix, Totalpivot', color: 2 },
        { data: data.map((d) => [d.n, d.rPartial]), label: 'Zufallsmatrix, Spaltenpivot', color: 3, dashed: true },
      ],
      markers: [{ x: state.n }],
      ariaLabel: 'Wachstumsfaktor in Abhängigkeit von n',
    });
  }

  setChildren(el,
    controls(slider({ label: 'n =', min: 10, max: 60, step: 2, value: state.n, onInput: (v) => { state.n = v; update(); } })),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, `Die Wilkinson-Matrix (1 auf der Diagonale und in der letzten Spalte, −1 darunter) ist der Worst Case: Die letzte Spalte verdoppelt sich in jedem Schritt. Bei Zufallsmatrizen bleibt das Wachstum harmlos – „extremely rare“, wie Golub und Van Loan schreiben.`),
  );
  update();
}
