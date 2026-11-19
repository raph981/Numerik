/**
 * Widget: LU-Zerlegung P A Q = L U mit wählbarer Pivotisierung und Lösen
 * eines Gleichungssystems mit der fertigen Zerlegung (Vorlesung 8).
 */
import { h, setChildren, segmented, slider, controls, matrixView, matrixInput, fmt } from '../core/dom.js';
import { luDecompose, luSolve, permutationFromVector } from '../lib/numerics/lu.js';

const PRESETS = {
  a: { label: '3 × 3', A: [[2, 1, 1], [4, -6, 0], [-2, 7, 2]], b: [5, -2, 9] },
  b: { label: '4 × 4', A: [[1, 2, 0, 3], [2, 1, 4, 1], [4, 3, 2, 2], [1, 0, 1, 5]], b: [6, 8, 11, 7] },
  c: { label: 'Pivot 0', A: [[0, 1, 2], [1, 1, 1], [2, 3, 7]], b: [3, 3, 12] },
};
const PIVOTING = [
  { value: 'zero', label: 'nur bei Pivot 0' },
  { value: 'partial', label: 'Spaltenpivotisierung' },
  { value: 'full', label: 'Totalpivotisierung' },
];
const num = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3);
const vec = (v) => matrixView(v.map((x) => [x]), { format: num });

export default function mount(el) {
  const state = { preset: 'a', pivoting: 'partial', step: 0 };
  let A = PRESETS.a.A;
  let b = PRESETS.a.b;
  const editor = h('div');
  const stepHolder = h('div');
  const view = h('div');

  function renderEditor() {
    const input = matrixInput(A.map((row, i) => [...row, b[i]]), (M) => {
      A = M.map((r) => r.slice(0, -1));
      b = M.map((r) => r.at(-1));
      render();
    });
    setChildren(editor, h('details', { class: 'widget__details' }, h('summary', {}, 'Eigenes System [A | b] eingeben'), input.element));
  }

  function render() {
    let dec;
    try {
      dec = luDecompose(A, { pivoting: state.pivoting });
    } catch (error) {
      setChildren(view, h('p', { class: 'widget__error' }, `${error.message} – wählen Sie eine Pivotisierung.`));
      setChildren(stepHolder);
      return;
    }
    const n = A.length;
    state.step = Math.min(state.step, n - 1);
    const stepSlider = slider({
      label: 'Schritt k =', min: 0, max: n - 1, step: 1, value: state.step,
      format: (k) => (k === 0 ? '0 (Start)' : `${k}`), onInput: (k) => { state.step = k; renderStep(); },
    });
    setChildren(stepHolder, controls(stepSlider));

    function renderStep() {
      const k = state.step;
      const M = k === 0 ? A : dec.steps[k - 1].after;
      const s = dec.steps[k - 1];
      const piv = k < n ? dec.steps[k] : null;
      const cell = (i, j) => {
        if (k > 0 && j < k && i > j) return 'matrix__cell--changed'; // gespeicherte Multiplikatoren (L)
        if (piv && k === piv.k && i === piv.pivotRow && j === piv.pivotCol) return 'matrix__cell--pivot';
        return '';
      };
      setChildren(stepView,
        h('div', { class: 'matrix-row' }, k === 0 ? 'A =' : `nach Schritt ${k}:`, matrixView(M, { format: num, cellClass: cell })),
        h('p', { class: 'widget__hint' }, k === 0
          ? `Umrandet: das im 1. Schritt gewählte Pivot (Zeile ${piv.pivotRow + 1}, Spalte ${piv.pivotCol + 1}).`
          : `Kompakte Speicherung: Unterhalb der Diagonale (grün) stehen die Multiplikatoren lᵢₖ = Spalte von L, der Rest wird zu U.${s.pivotRow !== s.k ? ` Zeile ${s.k + 1} ↔ ${s.pivotRow + 1} getauscht.` : ''}${s.pivotCol !== s.k ? ` Spalte ${s.k + 1} ↔ ${s.pivotCol + 1} getauscht.` : ''}`),
      );
    }
    const stepView = h('div');
    renderStep();

    const P = permutationFromVector(dec.rowPerm);
    const Q = permutationFromVector(dec.colPerm).map((row, i, all) => all.map((r) => r[i])); // Spaltenpermutation
    const { bp, z, y, x } = luSolve(dec, b);
    const maxL = Math.max(...dec.L.flat().map(Math.abs));

    setChildren(view,
      stepView,
      h('h4', {}, 'Ergebnis: P A Q = L U'),
      h('div', { class: 'matrix-row' }, 'P =', matrixView(P, { format: num }),
        state.pivoting === 'full' ? ['Q =', matrixView(Q, { format: num })] : null,
        'L =', matrixView(dec.L, { format: num }), 'U =', matrixView(dec.U, { format: num })),
      h('p', { class: 'widget__hint' }, `max |lᵢⱼ| = ${num(maxL)}${state.pivoting !== 'zero' ? ' ≤ 1 dank Pivotisierung' : ''}.`),
      h('h4', {}, 'Lösen von A x = b (Algorithmus 8.5)'),
      h('div', { class: 'matrix-row' },
        'b̃ = P b =', vec(bp), '→ L z = b̃: z =', vec(z), '→ U y = z: y =', vec(y),
        state.pivoting === 'full' ? ['→ x = Q y =', vec(x)] : ['= x']),
      h('p', { class: 'widget__hint' }, `Die Zerlegung kostet ≈ ⅔n³ Operationen, jede weitere rechte Seite nur noch 2n² = ${2 * n * n}.`),
    );
  }

  function load(key) {
    state.preset = key;
    A = PRESETS[key].A;
    b = PRESETS[key].b;
    state.step = 0;
    renderEditor();
    render();
  }

  setChildren(el,
    controls(
      segmented({ label: 'Matrix', value: state.preset, options: Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: p.label })), onChange: load }),
      segmented({ label: 'Pivotisierung', value: state.pivoting, options: PIVOTING, onChange: (v) => { state.pivoting = v; render(); } }),
    ),
    editor,
    stepHolder,
    view,
  );
  load(state.preset);
}
