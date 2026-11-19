/**
 * Widget: Volle QR-Zerlegung mit Householder-Spiegelungen Schritt für Schritt (Satz 12.3).
 */
import { h, setChildren, controls, segmented, matrixView, button, fmt } from '../core/dom.js';
import { householderQR, orthogonalityLoss } from '../lib/numerics/qr.js';
import { matMul } from '../lib/numerics/linalg.js';

const PRESETS = {
  a: { label: '4 × 3', A: [[1, -1, 4], [1, 4, -2], [1, 4, 2], [1, -1, 0]] },
  b: { label: '3 × 3', A: [[12, -51, 4], [6, 167, -68], [-4, 24, -41]] },
  c: { label: '5 × 2 (Ausgleich)', A: [[1, 0], [1, 0.25], [1, 0.5], [1, 0.75], [1, 1]] },
};
const num = (v) => fmt(Math.abs(v) < 1e-10 ? 0 : v, 3);

export default function mount(el) {
  const state = { preset: 'a', step: 0 };
  const nav = h('div', { class: 'button-row' });
  const view = h('div');

  function render() {
    const A = PRESETS[state.preset].A;
    const { Q, R, steps } = householderQR(A);
    const total = steps.length;
    state.step = Math.max(0, Math.min(state.step, total + 1));
    setChildren(nav,
      button('⟲ Anfang', () => { state.step = 0; render(); }, { secondary: true }),
      button('← zurück', () => { state.step -= 1; render(); }, { secondary: true }),
      button('weiter →', () => { state.step += 1; render(); }),
      h('span', { class: 'widget__hint' }, state.step === 0 ? 'Ausgangsmatrix' : state.step <= total ? `Spiegelung k = ${state.step} von ${total}` : 'Ergebnis'),
    );

    if (state.step === 0) {
      setChildren(view, h('div', { class: 'matrix-row' }, 'A =', matrixView(A, { format: num, cellClass: (i, j) => (j === 0 ? 'matrix__cell--changed' : '') })),
        h('p', { class: 'widget__hint' }, 'Grün: die erste Spalte a₁. Sie wird auf ein Vielfaches von e₁ gespiegelt.'));
      return;
    }
    if (state.step <= total) {
      const s = steps[state.step - 1];
      const k = s.k;
      setChildren(view,
        h('div', { class: 'matrix-row' }, 'Householder-Vektor v =', matrixView(s.v.map((x) => [x]), { format: num }), `→ β${'₁₂₃₄₅'[k]} = r${'₁₂₃₄₅'[k]}${'₁₂₃₄₅'[k]} =`, h('strong', {}, num(s.beta))),
        h('div', { class: 'matrix-row' }, `Q_v${'₁₂₃₄₅'[k]} ⋯ Q_v₁ A =`, matrixView(s.after, {
          format: num,
          cellClass: (i, j) => (j === k && i > k ? 'matrix__cell--zeroed' : i >= k && j >= k ? 'matrix__cell--changed' : ''),
        })),
        h('p', { class: 'widget__hint' }, `Die Spiegelung wirkt nur auf die Zeilen ${k + 1} … ${A.length} (v hat oben ${k} Nullen) und erzeugt in Spalte ${k + 1} Nullen unterhalb der Diagonale. Bereits fertige Zeilen und Spalten bleiben unverändert.`),
      );
      return;
    }
    setChildren(view,
      h('div', { class: 'matrix-row' }, 'Q =', matrixView(Q, { format: num }), 'R =', matrixView(R, { format: num })),
      h('p', { class: 'widget__hint' }, `Kontrolle: ‖QR − A‖ ≈ ${fmt(Math.max(...matMul(Q, R).flatMap((row, i) => row.map((v, j) => Math.abs(v - A[i][j])))), 2)}, ‖QᵀQ − I‖∞ ≈ ${orthogonalityLoss(Q).toExponential(1)}. Q ist ${A.length}×${A.length}, R ist ${A.length}×${A[0].length} mit Nullzeilen unten – die ersten ${A[0].length} Spalten von Q bilden die schmale QR-Zerlegung.`),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'Matrix', value: state.preset, options: Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: p.label })), onChange: (v) => { state.preset = v; state.step = 0; render(); } })),
    nav,
    view,
  );
  render();
}
