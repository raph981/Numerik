/**
 * Widget: Besetzungsmuster von A und den LU-Faktoren – Bandmatrizen behalten ihre
 * Struktur (Satz 10.6), Pfeilmatrizen können vollständig „auffüllen“ (Abschnitt 13.1).
 */
import { h, setChildren, slider, segmented, controls, stat, fmt } from '../core/dom.js';
import { bandMatrix, arrowMatrix, fillIn } from '../lib/numerics/special.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const N = 16;

function spy(M, original, title) {
  const size = 150;
  const cell = size / M.length;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'spy');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Besetzungsmuster ${title}`);
  M.forEach((row, i) => row.forEach((v, j) => {
    if (Math.abs(v) < 1e-12) return;
    const r = document.createElementNS(SVG_NS, 'rect');
    r.setAttribute('x', j * cell + 0.5);
    r.setAttribute('y', i * cell + 0.5);
    r.setAttribute('width', cell - 1);
    r.setAttribute('height', cell - 1);
    r.setAttribute('class', Math.abs(original[i][j]) < 1e-12 ? 'spy__fill' : 'spy__entry');
    svg.append(r);
  }));
  return h('figure', { class: 'spy-figure' }, svg, h('figcaption', {}, title));
}

export default function mount(el, { preset = 'band' } = {}) {
  const state = { preset, m: 3 };
  const bandSlider = slider({ label: 'Bandbreite m =', min: 1, max: 8, step: 1, value: state.m, onInput: (v) => { state.m = v; update(); } });
  const pictures = h('div', { class: 'spy-row' });
  const stats = h('div', { class: 'stats' });

  function update() {
    bandSlider.element.hidden = state.preset !== 'band';
    const A = state.preset === 'band' ? bandMatrix(N, state.m) : arrowMatrix(N, state.preset === 'arrowGood');
    const { L, U, nnzA, nnzLU } = fillIn(A);
    setChildren(pictures, spy(A, A, 'A'), spy(L, A, 'L'), spy(U, A, 'U'));
    const ops = state.preset === 'band' ? 2 * N * state.m ** 2 + N * state.m : null;
    setChildren(stats,
      stat('Nichtnullen in A', String(nnzA), `von ${N * N}`),
      stat('Nichtnullen in L + U', String(nnzLU), nnzLU > nnzA ? `Fill-in: ${nnzLU - nnzA} neue Einträge` : 'kein Fill-in'),
      ops ? stat('Aufwand LU', `≤ ${fmt(ops, 0)} Op.`, `voll: ≈ ${fmt((2 / 3) * N ** 3, 0)} (Satz 10.6)`) : null,
    );
  }

  setChildren(el,
    controls(
      segmented({
        label: 'Matrix', value: state.preset,
        options: [{ value: 'band', label: 'Bandmatrix' }, { value: 'arrowBad', label: 'Pfeil (voll oben links)' }, { value: 'arrowGood', label: 'Pfeil (voll unten rechts)' }],
        onChange: (v) => { state.preset = v; update(); },
      }),
      bandSlider,
    ),
    pictures,
    h('p', { class: 'widget__hint' }, 'Dunkel: Einträge, die schon in A ≠ 0 sind. Rot: Fill-in – Nullen, die während der Elimination zu Nichtnullen werden.'),
    stats,
  );
  update();
}
