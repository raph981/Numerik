/**
 * Widget: Kondition eines 2×2-Gleichungssystems geometrisch (Vorlesung 6).
 * Zwei Geraden schneiden sich in der Lösung. Gestörte Daten b + Δb (und A + ΔA)
 * erzeugen eine Wolke gestörter Lösungen – je flacher der Schnittwinkel, desto größer.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { inverse2x2, matVec, normInf, norm2x2, det2x2, solve2x2, vectorNorm } from '../lib/numerics/linalg.js';

const X_TRUE = [1, 2];
const SAMPLES = 250;

const PRESETS = {
  ex63: { label: 'Beispiel 6.3', matrix: (eps) => [[-1, 1], [1 - eps, -1]] },
  good: { label: 'gut konditioniert', matrix: () => [[2, 1], [-1, 2]] },
  diag: { label: 'Beispiel 6.7 (diagonal)', matrix: () => [[10, 0], [0, 0.1]] },
};

/** Deterministischer Zufallsgenerator, damit die Wolke beim Schieben nicht flackert. */
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296 * 2 - 1;
  };
}

export default function mount(el) {
  const state = { preset: 'ex63', eps: 0.1, logDelta: -2, perturbA: false };
  const holder = h('div');
  const stats = h('div', { class: 'stats' });
  const epsSlider = slider({ label: 'ε =', min: 0.01, max: 1, step: 0.01, value: state.eps, format: (v) => v.toFixed(2), onInput: (v) => { state.eps = v; update(); } });

  function update() {
    const A = PRESETS[state.preset].matrix(state.eps);
    const b = matVec(A, X_TRUE);
    const delta = 10 ** state.logDelta;
    const cond = normInf(A) * normInf(inverse2x2(A));
    const random = rng(42);

    const cloud = [];
    let worst = 0;
    for (let k = 0; k < SAMPLES; k++) {
      const db = [random(), random()].map((r) => r * delta * vectorNorm(b, Infinity));
      const dA = state.perturbA
        ? A.map((row) => row.map(() => (random() * delta * normInf(A)) / 2))
        : [[0, 0], [0, 0]];
      try {
        const x = solve2x2(A.map((row, i) => row.map((v, j) => v + dA[i][j])), b.map((v, i) => v + db[i]));
        cloud.push(x);
        worst = Math.max(worst, vectorNorm([x[0] - X_TRUE[0], x[1] - X_TRUE[1]], Infinity) / vectorNorm(X_TRUE, Infinity));
      } catch { /* gestörte Matrix singulär – Punkt auslassen */ }
    }

    // Ausschnitt um die exakte Lösung, so dass die Wolke gut sichtbar ist
    const spread = Math.max(...cloud.map((x) => Math.max(Math.abs(x[0] - X_TRUE[0]), Math.abs(x[1] - X_TRUE[1]))), 1e-6);
    const range = Math.min(50, Math.max(0.02, spread * 1.4));
    const step = 10 ** Math.floor(Math.log10(range / 2));
    const plane = createPlane({ range, center: X_TRUE, ariaLabel: 'Geraden des Gleichungssystems und gestörte Lösungen' }).grid(step);
    plane.line(A[0][0], A[0][1], b[0], 'series-3');
    plane.line(A[1][0], A[1][1], b[1], 'series-4');
    cloud.forEach((x) => plane.dot(x, 'series-5', 2.6));
    plane.dot(X_TRUE, 'series-1', 5);
    plane.text(X_TRUE, 'x', 'series-1');
    setChildren(holder, plane.svg);

    const dA = state.perturbA ? delta : 0;
    const bound = cond * dA < 1 ? (cond / (1 - cond * dA)) * (delta + dA) : Infinity;
    setChildren(stats,
      stat('det(A)', fmt(det2x2(A), 4)),
      stat('cond∞(A)', fmt(cond, 4), `cond₂(A) = ${fmt(norm2x2(A) * norm2x2(inverse2x2(A)), 4)}`),
      stat('rel. Störung der Daten', fmtExp(delta, 0)),
      stat('größte beobachtete rel. Änderung von x', fmtExp(worst, 2)),
      stat('Schranke aus dem Störungssatz (6.4)', Number.isFinite(bound) ? fmtExp(bound, 2) : '— (cond·‖ΔA‖/‖A‖ ≥ 1)'),
      stat('≈ verlorene Dezimalstellen', fmt(Math.log10(cond), 1), 'log₁₀ cond(A)'),
      stat('sichtbarer Ausschnitt', `x ± ${fmt(range, 3)}`, `Gitterweite ${fmt(step, 4)}`),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Matrix', value: state.preset, options: Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: p.label })), onChange: (v) => { state.preset = v; epsSlider.element.hidden = v !== 'ex63'; update(); } }),
      epsSlider,
    ),
    controls(
      slider({ label: 'rel. Störung = 10^', min: -4, max: -0.5, step: 0.1, value: state.logDelta, format: (v) => v.toFixed(1), onInput: (v) => { state.logDelta = v; update(); } }),
      segmented({ label: 'gestört wird', value: 'b', options: [{ value: 'b', label: 'nur b' }, { value: 'Ab', label: 'A und b' }], onChange: (v) => { state.perturbA = v === 'Ab'; update(); } }),
    ),
    h('div', { class: 'widget-columns' }, holder, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Jede Gleichung ist eine Gerade, die Lösung ihr Schnittpunkt. Schneiden sich die Geraden flach (kleines ε), verschiebt schon eine winzige Störung den Schnittpunkt weit.'),
      h('p', { class: 'widget__hint' }, 'Der Ausschnitt zoomt automatisch auf die Lösung x = (1, 2): Achten Sie auf die Gitterweite bzw. die beobachtete Änderung, wenn Sie ε oder die Störung verändern.'))),
  );
  update();
}
