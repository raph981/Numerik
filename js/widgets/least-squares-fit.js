/**
 * Widget: Methode der kleinsten Quadrate (Abschnitt 11.1/11.2) –
 * Normalengleichung vs. QR-Zerlegung und die quadrierte Kondition von AᵀA.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { BASES, designMatrix, solveNormalEquations, solveLeastSquaresQR } from '../lib/numerics/qr.js';
import { createRng } from '../lib/numerics/special.js';
import { dot, solve, transpose } from '../lib/numerics/linalg.js';
import { symmetricEigenvalues } from '../lib/numerics/eigen.js';

const truth = (x) => Math.sin(2 * Math.PI * x) + 0.5 * x;

export default function mount(el) {
  const state = { m: 15, n: 4, noise: 0.15, basis: 'poly' };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const rnd = createRng(11);
    const xs = Array.from({ length: state.m }, (_, i) => (state.m === 1 ? 0.5 : i / (state.m - 1)));
    const ys = xs.map((x) => truth(x) + state.noise * rnd());
    const grid = Array.from({ length: 201 }, (_, k) => k / 200);
    const series = [
      { data: grid.map((x) => [x, truth(x)]), label: 'unbekannte Funktion', color: 6, dashed: true },
      { data: xs.map((x, i) => [x, ys[i]]), kind: 'points', label: 'Datenpunkte (xᵢ, yᵢ)', color: 1, radius: 4 },
    ];

    if (state.n > state.m) {
      renderPlot(plot, { height: 300, x: { label: 'x', min: 0, max: 1 }, y: { label: 'y', min: -2, max: 2 }, series });
      setChildren(stats, stat('Fall i) m < n', 'unendlich viele Lösungen', 'mehr Koeffizienten als Datenpunkte – Az = y ist exakt lösbar, aber nicht eindeutig'));
      return;
    }

    const A = designMatrix(xs, state.n, state.basis);
    const zQR = solveLeastSquaresQR(A, ys);
    let zNE = null;
    try { zNE = solveNormalEquations(A, ys, solve); } catch { /* AᵀA numerisch singulär */ }
    const u = (z) => (x) => z.reduce((s, zj, j) => s + zj * BASES[state.basis].fn(j + 1, x), 0);
    series.push({ data: grid.map((x) => [x, u(zQR)(x)]), label: `Ausgleichsfunktion (n = ${state.n}, über QR)`, color: 4 });
    if (zNE) series.push({ data: grid.map((x) => [x, u(zNE)(x)]), label: 'über Normalengleichung', color: 5, dashed: true });
    renderPlot(plot, { height: 300, x: { label: 'x', min: 0, max: 1 }, y: { label: 'y', min: -2, max: 2 }, series, ariaLabel: 'Datenpunkte und Ausgleichsfunktion' });

    const At = transpose(A);
    const AtA = At.map((ri) => At.map((rj) => dot(ri, rj)));
    const eig = symmetricEigenvalues(AtA);
    const condAtA = eig.at(-1) / Math.max(eig[0], 1e-300);
    const residual = Math.sqrt(ys.reduce((s, y, i) => s + (y - u(zQR)(xs[i])) ** 2, 0));
    const diff = zNE ? Math.max(...zNE.map((v, i) => Math.abs(v - zQR[i]))) / Math.max(...zQR.map(Math.abs)) : Infinity;
    setChildren(stats,
      stat(state.m === state.n ? 'Fall ii) m = n' : 'Fall iii) m > n', state.m === state.n ? 'Interpolation' : 'Ausgleich', `${state.m} Punkte, ${state.n} Koeffizienten`),
      stat('Residuum ‖y − Az‖₂', fmt(residual, 4)),
      stat('cond₂(A)', fmtExp(Math.sqrt(condAtA), 2)),
      stat('cond₂(AᵀA)', fmtExp(condAtA, 2), '= cond₂(A)² !'),
      stat('Abweichung Normalengl. ↔ QR', zNE ? fmtExp(diff, 1) : 'AᵀA singulär', 'relativ, Koeffizienten'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'Datenpunkte m =', min: 2, max: 30, step: 1, value: state.m, onInput: (v) => { state.m = v; update(); } }),
      slider({ label: 'Basisfunktionen n =', min: 1, max: 18, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } }),
      slider({ label: 'Rauschen', min: 0, max: 0.5, step: 0.01, value: state.noise, format: (v) => v.toFixed(2), onInput: (v) => { state.noise = v; update(); } }),
      segmented({ label: 'Basis', value: state.basis, options: Object.entries(BASES).map(([k, b]) => ({ value: k, label: b.label })), onChange: (v) => { state.basis = v; update(); } }),
    ),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Erhöhen Sie bei Polynomen n auf 12–18: cond(AᵀA) erreicht 10¹⁶ und die Normalengleichung liefert Unsinn, während QR noch eine brauchbare Lösung findet.'),
  );
  update();
}
