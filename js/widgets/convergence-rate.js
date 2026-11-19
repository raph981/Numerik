/**
 * Widget: Konvergenzraten am 1D-Poissonproblem tridiag(−1, 2, −1) (Abschnitte 14.1, 14.3).
 * Mit wachsendem n steigt κ₂(A) ∼ n² – und damit die Zahl der Iterationen.
 */
import { h, setChildren, slider, controls, table, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { runIteration, poisson1D, poissonRates, stepsForReduction } from '../lib/numerics/iterative.js';

const EPS = 1e-6;
const MAX_IT = 3000;

export default function mount(el) {
  const state = { n: 20 };
  const plot = h('div', { class: 'plot-container' });
  const info = h('div');

  function update() {
    const n = state.n;
    const A = poisson1D(n);
    const exact = Array.from({ length: n }, (_, i) => Math.sin((Math.PI * (i + 1)) / (n + 1)) + ((i * 7) % 5) / 10);
    const b = A.map((row) => row.reduce((s, v, j) => s + v * exact[j], 0));
    const x0 = new Array(n).fill(0);
    const rates = poissonRates(n);
    const runs = [
      { key: 'richardson', label: 'Richardson, ω = 1/λmax', color: 3, rate: rates.richardson, run: runIteration(A, b, x0, 'richardson', { omega: 1 / rates.lambdaMax, maxIt: MAX_IT, exact }) },
      { key: 'jacobi', label: 'Jacobi', color: 4, rate: rates.jacobi, run: runIteration(A, b, x0, 'jacobi', { maxIt: MAX_IT, exact }) },
      { key: 'gaussSeidel', label: 'Gauß-Seidel', color: 2, rate: rates.gaussSeidel, run: runIteration(A, b, x0, 'gaussSeidel', { maxIt: MAX_IT, exact }) },
    ];
    const thin = (arr) => arr.map((e, k) => [k, e / arr[0]]).filter((_, k) => k % Math.max(1, Math.floor(arr.length / 300)) === 0);
    renderPlot(plot, {
      height: 280,
      x: { label: 'Iteration k', min: 0, max: MAX_IT },
      y: { label: '‖eᵏ‖₂ / ‖e⁰‖₂', log: true, min: 1e-8, max: 2 },
      series: runs.map((r) => ({ data: thin(r.run.errors), label: r.label, color: r.color })),
      markers: [{ y: EPS, label: 'ε = 10⁻⁶' }],
      ariaLabel: 'Fehlerreduktion der drei Verfahren',
    });
    setChildren(info, table(['Verfahren', 'Konvergenzrate ϱ', 'Schritte für ε = 10⁻⁶: |ln ε|/|ln ϱ|', 'beobachtet'], runs.map((r) => {
      const observed = r.run.errors.findIndex((e) => e <= EPS * r.run.errors[0]);
      return [r.label, fmt(r.rate, 6), String(stepsForReduction(r.rate, EPS)), observed >= 0 ? String(observed) : `> ${MAX_IT}`];
    })), h('p', { class: 'widget__hint' }, `κ₂(A) = λmax/λmin = ${fmt(rates.kappa, 4)} ≈ 0,4·n². Prognose nach Abschnitt 14.3: k(ε) ≈ κ₂·|ln ε| = ${fmt(rates.kappa * Math.abs(Math.log(EPS)), 0)} für Richardson.`));
  }

  setChildren(el,
    controls(slider({ label: 'Unbekannte n =', min: 4, max: 60, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } })),
    plot,
    info,
  );
  update();
}
