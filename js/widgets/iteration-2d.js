/**
 * Widget: Lineare Iterationsverfahren in der Ebene (Vorlesungen 13/14).
 * Zeigt den Pfad der Iterierten, die Höhenlinien der Energienorm des Fehlers
 * und den Spektralradius der Iterationsmatrix.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { renderPlot } from '../core/plot.js';
import { METHODS, runIteration, iterationMatrix } from '../lib/numerics/iterative.js';
import { solve2x2, spectralRadius2x2, eigenvalues2x2 } from '../lib/numerics/linalg.js';

const PRESETS = {
  good: { label: 'gut konditioniert (SPD)', A: [[3, 1], [1, 2]] },
  bad: { label: 'schlecht konditioniert (SPD)', A: [[1, 0.9], [0.9, 1]] },
  dd: { label: 'diagonaldominant, unsymm.', A: [[4, -2], [1, 3]] },
  nondd: { label: 'nicht diagonaldominant', A: [[1, 2], [2, 1.5]] },
};
const B = [1, 1];
const X0 = [-1.5, 1.8];

/** Höhenlinie (x − x*)ᵀ A (x − x*) = c für symmetrische A. */
function energyEllipse(A, center, c) {
  return Array.from({ length: 121 }, (_, k) => {
    const t = (2 * Math.PI * k) / 120;
    const u = [Math.cos(t), Math.sin(t)];
    const q = A[0][0] * u[0] ** 2 + 2 * A[0][1] * u[0] * u[1] + A[1][1] * u[1] ** 2;
    const r = q > 0 ? Math.sqrt(c / q) : 10;
    return [center[0] + r * u[0], center[1] + r * u[1]];
  });
}

export default function mount(el) {
  const state = { preset: 'good', method: 'jacobi', omega: 0.3 };
  const omegaSlider = slider({ label: 'ω =', min: 0.05, max: 1.5, step: 0.01, value: state.omega, format: (v) => v.toFixed(2), onInput: (v) => { state.omega = v; update(); } });
  const holder = h('div');
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function update() {
    omegaSlider.element.hidden = state.method !== 'richardson';
    const A = PRESETS[state.preset].A;
    const exact = solve2x2(A, B);
    const { iterates, errors } = runIteration(A, B, X0, state.method, { omega: state.omega, maxIt: 40, exact });
    const S = iterationMatrix(A, state.method, state.omega);
    const rho = spectralRadius2x2(S);
    const symmetric = A[0][1] === A[1][0];
    const eigA = eigenvalues2x2(A).map((l) => l.re);

    const range = 2.6;
    const plane = createPlane({ range, center: [exact[0] * 0.5, exact[1] * 0.5], ariaLabel: 'Pfad der Iterierten' }).grid(0.5);
    if (symmetric) [0.1, 0.5, 1.5, 3, 6].forEach((c) => plane.path(energyEllipse(A, exact, c), 'series-6', { dashed: true }));
    const visible = iterates.filter((x) => x.every((v) => Math.abs(v) < 50));
    plane.path(visible, 'series-5');
    visible.forEach((x, k) => plane.dot(x, k === 0 ? 'series-4' : 'series-5', k === 0 ? 5 : 3));
    plane.dot(exact, 'series-1', 6);
    plane.text(exact, 'x*', 'series-1');
    plane.text(X0, 'x⁰', 'series-4');
    setChildren(holder, plane.svg);

    const floor = 1e-16;
    renderPlot(plot, {
      height: 220,
      x: { label: 'Iteration k', min: 0, max: 40 },
      y: { label: '‖eᵏ‖₂', log: true, min: floor },
      series: [
        { data: errors.map((e, k) => [k, Math.max(e, floor)]), kind: 'points', label: 'Fehler', color: 5, radius: 2.5 },
        { data: errors.map((_, k) => [k, Math.max(errors[0] * rho ** k, floor)]), label: `ϱ(S)ᵏ · ‖e⁰‖`, color: 6, dashed: true },
      ],
      ariaLabel: 'Fehler über den Iterationen',
    });

    setChildren(stats,
      stat('ϱ(S) = ϱ(I − W⁻¹A)', fmt(rho, 4), rho < 1 ? 'konvergiert (Satz 13.5)' : 'divergiert!'),
      stat('Fehler nach 40 Schritten', fmtExp(errors.at(-1), 1)),
      symmetric ? stat('Eigenwerte von A', eigA.map((l) => fmt(l, 3)).join(', '), state.method === 'richardson' ? `optimal: ω = 2/(λmin+λmax) = ${fmt(2 / (eigA[0] + eigA[1]), 3)}` : `κ₂ = ${fmt(Math.max(...eigA) / Math.min(...eigA), 3)}`) : null,
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Matrix', value: state.preset, options: Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: p.label })), onChange: (v) => { state.preset = v; update(); } }),
      segmented({ label: 'Verfahren', value: state.method, options: Object.entries(METHODS).map(([k, m]) => ({ value: k, label: m.label })), onChange: (v) => { state.method = v; update(); } }),
      omegaSlider,
    ),
    h('div', { class: 'widget-columns' }, holder, stats),
    plot,
    h('p', { class: 'widget__hint' }, 'Gestrichelt: Höhenlinien der Energienorm ‖x − x*‖_A. Jacobi korrigiert beide Komponenten gleichzeitig, Gauß-Seidel nacheinander (der Pfad läuft achsenparallel im Zickzack) und nutzt dabei schon die neue Komponente – meist doppelt so schnell.'),
  );
  update();
}
