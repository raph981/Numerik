/**
 * Widget: Kollokationsmethode für ∫₀¹ |x − y|^{−γ} u(y) dy = f(x) (Beispiel 8.6),
 * Kondition der Systemmatrix und Rundungsfehler in double und float.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { collocationMatrix, midpoints, rhsExample } from '../lib/numerics/integral.js';
import { luDecompose, luSolve, inverse } from '../lib/numerics/lu.js';
import { matMul, normInf } from '../lib/numerics/linalg.js';

const NS = [8, 16, 32, 64, 128];

/** ‖A·A⁻¹ − I‖∞ mit in der Genauigkeit rd berechneter Inversen. */
function inverseError(A, rd) {
  const Ar = A.map((row) => row.map(rd));
  const inv = inverse(Ar, { rd });
  const prod = matMul(Ar, inv);
  return normInf(prod.map((row, i) => row.map((v, j) => v - (i === j ? 1 : 0))));
}

export default function mount(el) {
  const state = { logGamma: Math.log10(0.5), n: 32 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const gamma = 10 ** state.logGamma;
    const n = state.n;
    const A = collocationMatrix(n, gamma);
    const c = midpoints(n);
    const z = luSolve(luDecompose(A), c.map(rhsExample)).x;
    const cond = normInf(A) * normInf(inverse(A));
    const errDouble = inverseError(A, (v) => v);
    const errFloat = inverseError(A, Math.fround);

    // u_h ist stückweise konstant: Treppenfunktion zeichnen
    const h0 = 1 / n;
    const steps = z.flatMap((zi, i) => [[i * h0, zi], [(i + 1) * h0, zi]]);
    const scale = Math.max(...z.map(Math.abs));
    const fx = Array.from({ length: 401 }, (_, k) => [k / 400, rhsExample(k / 400)]);
    const fScale = Math.max(...fx.map((p) => p[1]));
    renderPlot(plot, {
      height: 280,
      x: { label: 'x', min: 0, max: 1 },
      y: { label: 'Werte (u skaliert)', min: -0.3, max: 1.15 },
      series: [
        { data: fx.map(([x, y]) => [x, y / fScale]), label: `f(x) / ${fmt(fScale, 2)}`, color: 3 },
        { data: steps.map(([x, y]) => [x, y / scale]), label: `Lösung u_h(x) / ${fmt(scale, 3)}`, color: 1 },
      ],
      ariaLabel: 'Rechte Seite und Kollokationslösung',
    });

    setChildren(stats,
      stat('cond∞(A)', fmt(cond, 4), `γ = ${fmt(gamma, 4)}, n = ${n}`),
      stat('‖AA⁻¹ − I‖∞ in double', fmtExp(errDouble, 2), `eps ≈ 1,1e−16`),
      stat('‖AA⁻¹ − I‖∞ in float', fmtExp(errFloat, 2), errFloat > 0.1 ? 'unbrauchbar!' : 'eps ≈ 6e−8'),
      stat('≈ verlorene Stellen', fmt(Math.log10(cond), 1), 'log₁₀ cond(A)'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'γ = 10^', min: -4, max: Math.log10(0.9), step: 0.05, value: state.logGamma, format: (v) => `${v.toFixed(2)} ≈ ${fmt(10 ** v, 4)}`, onInput: (v) => { state.logGamma = v; update(); } }),
      segmented({ label: 'Teilintervalle n', value: String(state.n), options: NS.map((n) => ({ value: String(n), label: String(n) })), onChange: (v) => { state.n = Number(v); update(); } }),
    ),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Kleines γ macht den Kern fast konstant: Die Zeilen von A werden sich immer ähnlicher, die Matrix fast singulär. Die Kondition wächst dann zusätzlich linear mit n.'),
  );
  update();
}
