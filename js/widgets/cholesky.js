/**
 * Widget: Cholesky-Zerlegung A = LDLᵀ = L̃L̃ᵀ einer symmetrischen 3×3-Matrix (Satz 10.1/10.2).
 */
import { h, setChildren, controls, stat, matrixView, matrixInput, fmt } from '../core/dom.js';
import { cholesky } from '../lib/numerics/special.js';
import { symmetricEigenvalues } from '../lib/numerics/eigen.js';

const PRESETS = [
  { label: 'positiv definit', M: [[4, 2, 2], [2, 5, 3], [2, 3, 6]] },
  { label: 'schlecht konditioniert', M: [[1, 0.99, 0.98], [0.99, 1, 0.99], [0.98, 0.99, 1]] },
  { label: 'indefinit', M: [[1, 2, 0], [2, 1, 0], [0, 0, 3]] },
];
const num = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 4);

export default function mount(el) {
  let A = PRESETS[0].M;
  const out = h('div');
  const inputHolder = h('div');

  function setMatrix(M) {
    A = M;
    const input = matrixInput(A, (next) => {
      // symmetrisch halten: das obere Dreieck bestimmt die Matrix
      A = next.map((row, i) => row.map((v, j) => (j >= i ? v : next[j][i])));
      update();
    });
    setChildren(inputHolder, input.element);
    update();
  }

  function update() {
    const eig = symmetricEigenvalues(A);
    const lmin = eig[0];
    let res;
    try {
      res = cholesky(A);
    } catch (error) {
      setChildren(out,
        h('div', { class: 'stats' }, stat('Eigenwerte', eig.map((l) => fmt(l, 3)).join(', '), 'nicht alle positiv')),
        h('p', { class: 'widget__error' }, error.message));
      return;
    }
    setChildren(out,
      h('div', { class: 'stats' },
        stat('Eigenwerte', eig.map((l) => fmt(l, 3)).join(', ')),
        stat('λmin(A)', fmt(lmin, 4)),
        stat('Pivots dₖ', res.D.map((d) => fmt(d, 4)).join(', '), `alle ≥ λmin ✓ (Satz 10.1)`),
        stat('cond₂(A)', fmt(eig.at(-1) / lmin, 4)),
      ),
      h('div', { class: 'matrix-row' }, 'A = L D Lᵀ mit L =', matrixView(res.L, { format: num }), 'D =', matrixView(res.D.map((d, i) => res.D.map((_, j) => (i === j ? d : 0))), { format: num })),
      h('div', { class: 'matrix-row' }, 'Cholesky: L̃ = L D^½ =', matrixView(res.Ltilde, { format: num }), 'mit A = L̃ L̃ᵀ'),
      h('details', { class: 'widget__details' }, h('summary', {}, 'Restmatrizen B − vvᵀ/α der einzelnen Schritte'),
        res.steps.map((s) => h('div', { class: 'matrix-row' }, `Schritt ${s.k + 1} (Pivot α = ${num(s.alpha)}):`, matrixView(s.rest, { format: num })))),
    );
  }

  setChildren(el,
    controls(
      h('div', { class: 'control' }, h('span', { class: 'control__label' }, 'Symmetrische Matrix A (oberes Dreieck bearbeiten)'), inputHolder),
      h('div', { class: 'control' }, h('span', { class: 'control__label' }, 'Vorlagen'),
        h('div', { class: 'example-buttons' }, PRESETS.map((p) => h('button', { type: 'button', class: 'chip', onclick: () => setMatrix(p.M) }, p.label)))),
    ),
    out,
  );
  setMatrix(A);
}
