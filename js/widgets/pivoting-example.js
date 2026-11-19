/**
 * Widget: Beispiel 9.8 – ein einziger Rundungsfehler ohne Pivotisierung
 * zerstört die Lösung; mit Zeilentausch ist alles in Ordnung.
 */
import { h, setChildren, slider, segmented, controls, table, matrixView, fmt } from '../core/dom.js';
import { roundSig } from '../lib/numerics/arithmetic.js';
import { luDecompose, luSolve } from '../lib/numerics/lu.js';
import { matMul, solve } from '../lib/numerics/linalg.js';

const SYSTEMS = {
  a: { label: 'a) Original', A: [[-1e-5, 1], [2, 1]], b: [1, 0] },
  b: { label: 'b) erste Zeile · (−10⁶)', A: [[10, -1e6], [2, 1]], b: [-1e6, 0] },
};

const show = (v) => (v === 0 ? '0' : Math.abs(v) >= 1e5 || Math.abs(v) < 1e-3 ? v.toExponential(4).replace('e+', 'e') : fmt(v, 7));

export default function mount(el) {
  const state = { system: 'a', r: 4, pivot: 'none' };
  const out = h('div');

  function update() {
    const { A, b } = SYSTEMS[state.system];
    const rd = (v) => roundSig(v, 10, state.r);
    const exact = solve(A, b);
    let res;
    let dec;
    try {
      dec = luDecompose(A, { pivoting: state.pivot, rd });
      res = luSolve(dec, b, { rd }).x;
    } catch (e) {
      setChildren(out, h('p', { class: 'widget__error' }, e.message));
      return;
    }
    const swapped = dec.rowPerm[0] !== 0 || dec.colPerm[0] !== 0;
    const l21 = dec.L[1][0];
    const relErr = Math.max(...res.map((v, i) => Math.abs(v - exact[i]))) / Math.max(...exact.map(Math.abs));
    // Rückwärtsanalyse: L̂Û ist die (permutierte) Matrix, die tatsächlich zerlegt wurde
    const LU = matMul(dec.L, dec.U);
    const PAQ = dec.rowPerm.map((i) => dec.colPerm.map((j) => A[i][j]));

    setChildren(out,
      table(['Größe', `in F(10, ${state.r})`], [
        ['Tausch?', swapped ? 'ja' : 'nein'],
        ['Multiplikator l₂₁', show(l21)],
        ['neues a₂₂', show(dec.U[1][1])],
        ['x₁, x₂ berechnet', `${show(res[0])}, ${show(res[1])}`],
        ['x₁, x₂ exakt', `${show(exact[0])}, ${show(exact[1])}`],
        ['relativer Fehler', h('strong', { class: relErr > 0.01 ? 'digits-bad-strong' : 'digits-ok' }, show(relErr))],
      ]),
      h('div', { class: 'matrix-row' }, 'Rückwärtsanalyse: Die berechneten Faktoren zerlegen exakt L̂Û =',
        matrixView(LU, { format: show }), 'statt P A Q =', matrixView(PAQ, { format: show })),
      h('p', { class: 'widget__hint' }, Math.abs(l21) > 10
        ? `Der riesige Multiplikator |l₂₁| = ${show(Math.abs(l21))} vergrößert a₂₂ so stark, dass der ursprüngliche Eintrag 1 beim Runden verschwindet – die Information ist weg.`
        : 'Kleine Multiplikatoren (|l₂₁| ≤ 1): Der Rundungsfehler bleibt harmlos.'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'System', value: state.system, options: Object.entries(SYSTEMS).map(([k, s]) => ({ value: k, label: s.label })), onChange: (v) => { state.system = v; update(); } }),
      segmented({ label: 'Pivotisierung', value: state.pivot, options: [{ value: 'none', label: 'keine' }, { value: 'partial', label: 'Spaltenpivotisierung' }, { value: 'full', label: 'Totalpivotisierung' }], onChange: (v) => { state.pivot = v; update(); } }),
      slider({ label: 'Mantissenstellen r =', min: 3, max: 10, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
    ),
    out,
  );
  update();
}
