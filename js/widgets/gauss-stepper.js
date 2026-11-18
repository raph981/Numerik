/**
 * Widget: Gauß-Elimination Schritt für Schritt (Algorithmus 7.1/7.11, Beispiel 7.4)
 * inklusive Frobenius-/Permutationsmatrizen und Rückwärtseinsetzen.
 */
import { h, setChildren, segmented, controls, matrixView, matrixInput, button, fmt } from '../core/dom.js';
import { gaussElimination, backSubstitution } from '../lib/numerics/gauss.js';

const PRESETS = {
  ex74: { label: 'Beispiel 7.4', A: [[2, 4, 6, 8], [16, 33, 50, 67], [4, 15, 31, 44], [10, 29, 63, 97]], b: [40, 330, 167, 350] },
  pivot: { label: 'mit Zeilentausch', A: [[0, 2, 1], [1, 1, 1], [2, 1, 3]], b: [5, 6, 14] },
  small: { label: '3 × 3', A: [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], b: [8, -11, -3] },
};

const num = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3);
const sub = (i) => String(i + 1).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');

export default function mount(el) {
  const state = { preset: 'ex74', A: null, b: null, step: 0 };
  const editor = h('div');
  const view = h('div');
  const nav = h('div', { class: 'button-row' });

  function load(key) {
    state.preset = key;
    state.A = PRESETS[key].A.map((r) => [...r]);
    state.b = [...PRESETS[key].b];
    state.step = 0;
    renderEditor();
    render();
  }

  function renderEditor() {
    const Ab = state.A.map((row, i) => [...row, state.b[i]]);
    const input = matrixInput(Ab, (M) => {
      state.A = M.map((row) => row.slice(0, -1));
      state.b = M.map((row) => row.at(-1));
      state.step = 0;
      render();
    });
    setChildren(editor, h('details', { class: 'widget__details' }, h('summary', {}, 'Eigenes System [A | b] eingeben'), input.element));
  }

  function render() {
    let result;
    try {
      result = gaussElimination(state.A, state.b);
    } catch (error) {
      setChildren(view, h('p', { class: 'widget__error' }, `${error.message}.`));
      setChildren(nav);
      return;
    }
    const n = state.A.length;
    const elimSteps = result.steps.length;
    const back = backSubstitution(result.upper, result.rhs);
    const total = elimSteps + 1; // + Rückwärtseinsetzen
    state.step = Math.min(state.step, total);

    setChildren(nav,
      button('⟲ Anfang', () => { state.step = 0; render(); }, { secondary: true }),
      button('← zurück', () => { state.step = Math.max(0, state.step - 1); render(); }, { secondary: true }),
      button('weiter →', () => { state.step = Math.min(total, state.step + 1); render(); }),
      h('span', { class: 'widget__hint' }, state.step === 0 ? 'Ausgangssystem' : state.step <= elimSteps ? `Eliminationsschritt k = ${state.step} von ${elimSteps}` : 'Rückwärtseinsetzen'),
    );

    if (state.step === 0) {
      const M = state.A.map((row, i) => [...row, state.b[i]]);
      setChildren(view,
        h('div', { class: 'matrix-row' }, '[A⁽⁰⁾ | b⁽⁰⁾] =', matrixView(M, { format: num, rhs: true, cellClass: (i, j) => (i === 0 && j === 0 ? 'matrix__cell--pivot' : '') })),
        h('div', { class: 'step-log' }, h('p', {}, 'Ziel: Nullen unterhalb der Diagonale erzeugen. Klicken Sie auf „weiter“.')));
      return;
    }

    if (state.step <= elimSteps) {
      const s = result.steps[state.step - 1];
      const k = s.k;
      const log = [];
      if (s.swap) log.push(h('p', {}, `Pivot a${sub(k)}${sub(k)} = 0 → vertausche Zeile ${k + 1} und ${s.swap[1] + 1} (Permutationsmatrix P${sub(k)},${sub(s.swap[1])}).`));
      log.push(h('p', {}, `Pivotelement: ${num(s.pivot)} (Zeile ${k + 1}).`));
      for (let i = k + 1; i < n; i++) {
        log.push(h('p', {}, `Zeile ${i + 1} ← Zeile ${i + 1} − l${sub(i)} · Zeile ${k + 1}, mit l${sub(i)} = ${num(s.swapped[i][k])} / ${num(s.pivot)} = ${num(s.l[i])}`));
      }
      const changed = (i, j) => i > k && j >= k;
      setChildren(view,
        h('div', { class: 'matrix-row' },
          'vorher', matrixView(s.swapped, { format: num, rhs: true, cellClass: (i, j) => (i === k && j === k ? 'matrix__cell--pivot' : i > k && j === k ? 'matrix__cell--changed' : '') }),
          '→', `[A⁽${state.step}⁾ | b⁽${state.step}⁾] =`,
          matrixView(s.after, { format: num, rhs: true, cellClass: (i, j) => (j === k && i > k ? 'matrix__cell--zeroed' : changed(i, j) ? 'matrix__cell--changed' : '') })),
        h('div', { class: 'step-log' }, log),
        h('details', { class: 'widget__details' },
          h('summary', {}, 'Matrixform: A⁽ᵏ⁾ = Gₖ(−l⁽ᵏ⁾) · Pₖ,ₛ · A⁽ᵏ⁻¹⁾'),
          h('div', { class: 'matrix-row' },
            `G${sub(k)}(−l) =`, matrixView(s.frobenius, { format: num, cellClass: (i, j) => (j === k && i > k ? 'matrix__cell--changed' : '') }),
            `P =`, matrixView(s.permutation, { format: num })),
          h('p', { class: 'widget__hint' }, 'Gₖ ist die Einheitsmatrix mit den negativen Multiplikatoren in Spalte k: Multiplikation von links zieht genau das lᵢ-fache der Pivotzeile von Zeile i ab.'),
        ),
      );
      return;
    }

    // Rückwärtseinsetzen
    const U = result.upper;
    const c = result.rhs;
    setChildren(view,
      h('div', { class: 'matrix-row' }, '[U | c] =', matrixView(U.map((row, i) => [...row, c[i]]), { format: num, rhs: true })),
      h('div', { class: 'step-log' }, back.steps.map(({ i, terms, value }) => h('p', {},
        `x${sub(i)} = (${num(c[i])}${terms.map((j) => ` − ${num(U[i][j])}·${num(back.x[j])}`).join('')}) / ${num(U[i][i])} = `,
        h('strong', {}, num(value))))),
      h('p', { class: 'widget__hint' }, `Lösung: x = (${back.x.map(num).join(', ')}). Die Multiplikatoren bilden spaltenweise die Matrix L mit A = LU (falls kein Tausch nötig war) – das ist Thema von Vorlesung 8.`),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'System', value: state.preset, options: Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: p.label })), onChange: load })),
    editor,
    nav,
    view,
  );
  load(state.preset);
}
