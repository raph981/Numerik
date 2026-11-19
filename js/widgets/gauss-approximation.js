/**
 * Widget: Gauß-Approximation in verschiedenen Basen (Satz 23.3, Abschnitte 23.2 und 23.3).
 * Zeigt Bestapproximation, Gramsche Matrix (Kondition), Koeffizienten und die Fehlerkontrolle.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { BASES, gaussApproximation, norm, spdCondition } from '../lib/numerics/approximation.js';

const FUNCTIONS = {
  abs: { label: '|x|', f: Math.abs },
  sign: { label: 'Sprung sign(x)', f: (x) => Math.sign(x) },
  exp: { label: 'eˣ', f: Math.exp },
  runge: { label: '1/(1+25x²)', f: (x) => 1 / (1 + 25 * x * x) },
};
const MAX_N = 16;

/** y-Bereich mit etwas Luft, damit Punkte nicht am Rahmen kleben (inkl. 0). */
function paddedRange(values) {
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  const pad = 0.12 * (hi - lo || 1);
  return { min: lo < 0 ? lo - pad : 0, max: hi + pad };
}

export default function mount(el) {
  const state = { fn: 'abs', basis: 'legendre', N: 5, tolExp: -1.5 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const coeffPlot = h('div', { class: 'plot-container' });
  const errorPlot = h('div', { class: 'plot-container' });
  const grid = Array.from({ length: 401 }, (_, k) => -1 + k / 200);
  const errorCache = new Map();

  /** Fehler ‖f − g_N‖ für N = 1 … MAX_N (einmal pro Funktion und Basis berechnet). */
  function errorCurve() {
    const key = `${state.fn}/${state.basis}`;
    if (!errorCache.has(key)) {
      const f = FUNCTIONS[state.fn].f;
      errorCache.set(key, Array.from({ length: MAX_N }, (_, i) => gaussApproximation(f, state.basis, i + 1).error));
    }
    return errorCache.get(key);
  }

  function update() {
    const F = FUNCTIONS[state.fn];
    const fit = gaussApproximation(F.f, state.basis, state.N);
    const fNorm = norm(F.f);
    const tol = 10 ** state.tolExp;
    const errors = errorCurve();
    const needed = errors.findIndex((e) => e <= tol * fNorm) + 1;
    const cond = spdCondition(fit.gram);

    renderPlot(plot, {
      height: 260,
      x: { label: 'x', min: -1, max: 1 },
      y: { label: 'y' },
      series: [
        { data: grid.map((x) => [x, F.f(x)]), label: 'f', color: 6, dashed: true },
        { data: grid.map((x) => [x, fit.evaluate(x)]), label: `Bestapproximation g, N = ${state.N}`, color: 1 },
        { data: grid.map((x) => [x, F.f(x) - fit.evaluate(x)]), label: 'Fehler f − g', color: 5 },
      ],
      ariaLabel: 'Funktion und Bestapproximation',
    });
    renderPlot(coeffPlot, {
      height: 200,
      x: { label: 'Index j', min: -0.5, max: state.N - 0.5, ticks: fit.coeffs.map((_, j) => j), format: String },
      y: { label: 'c_j', ...paddedRange(fit.coeffs) },
      series: [{ data: fit.coeffs.map((c, j) => [j, c]), kind: 'stem', label: 'Koeffizienten c_j', color: 3 }],
      ariaLabel: 'Koeffizienten der Bestapproximation',
    });
    renderPlot(errorPlot, {
      height: 220,
      x: { label: 'Dimension N von S', min: 1, max: MAX_N, ticks: Array.from({ length: MAX_N }, (_, i) => i + 1), format: String },
      y: { label: '‖f − g_N‖ / ‖f‖', log: true, min: Math.min(tol, ...errors.map((e) => e / fNorm)) / 3, max: 2 },
      series: [
        { data: errors.map((e, i) => [i + 1, Math.max(e / fNorm, 1e-16)]), label: 'relativer Fehler', color: 1 },
        { data: [[state.N, Math.max(fit.error / fNorm, 1e-16)]], kind: 'points', color: 5, radius: 5 },
      ],
      markers: [{ y: tol, label: 'TOL' }],
      ariaLabel: 'Fehler in Abhängigkeit von N',
    });

    setChildren(stats,
      stat('‖f − g‖', fmtExp(fit.error, 3), `relativ ${fmtExp(fit.error / fNorm, 2)}`),
      stat('cond₂(A)', fmtExp(cond, 2), BASES[state.basis].orthonormal ? 'Orthonormalbasis: A = I' : `≈ ${Math.max(0, Math.round(Math.log10(cond)))} Stellen gehen verloren`),
      stat(`kleinstes N mit ‖f − g_N‖ ≤ TOL·‖f‖`, needed > 0 ? String(needed) : `> ${MAX_N}`, `TOL = ${fmtExp(tol, 1)} (23.4)`),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Funktion f', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } }),
      segmented({ label: 'Basis von S', value: state.basis, options: Object.entries(BASES).map(([k, B]) => ({ value: k, label: B.label })), onChange: (v) => { state.basis = v; update(); } }),
    ),
    controls(
      slider({ label: 'Dimension N =', min: 1, max: MAX_N, step: 1, value: state.N, onInput: (v) => { state.N = v; update(); } }),
      slider({ label: 'TOL = 10^', min: -3, max: -0.5, step: 0.1, value: state.tolExp, format: (v) => fmt(v, 1), onInput: (v) => { state.tolExp = v; update(); } }),
    ),
    stats,
    plot,
    coeffPlot,
    errorPlot,
    h('p', { class: 'widget__hint' }, 'Monome und Legendre-Polynome spannen für gleiches N denselben Raum auf und liefern daher dieselbe Bestapproximation – aber die Gramsche Matrix der Monome ist extrem schlecht konditioniert. Bei einer Orthonormalbasis ändern sich vorhandene Koeffizienten nicht, wenn N wächst, und der Fehler kann nur fallen (Bemerkung 23.8).'),
  );
  update();
}
