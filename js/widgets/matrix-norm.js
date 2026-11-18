/**
 * Widget: Eine 2×2-Matrix als Abbildung – Bild des Einheitskreises/-quadrats,
 * Matrixnormen, Eigenwerte und Spektralradius (Abschnitte 5.2–5.5).
 */
import { h, setChildren, controls, stat, fmt, matrixInput } from '../core/dom.js';
import { createPlane, unitCircle } from '../core/plane.js';
import {
  matVec, norm1, normInf, normFrobenius, norm2x2, eigenvalues2x2, eigenvector2x2, spectralRadius2x2,
} from '../lib/numerics/linalg.js';

const PRESETS = [
  { label: 'Scherung', M: [[1, 1], [0, 1]] },
  { label: 'symmetrisch', M: [[2, 1], [1, 2]] },
  { label: 'Drehung', M: [[0, -1], [1, 0]] },
  { label: 'Diagonal', M: [[1.5, 0], [0, 0.5]] },
  { label: 'fast singulär', M: [[1, 1], [1, 1.1]] },
];

const SQUARE = [[1, 1], [-1, 1], [-1, -1], [1, -1], [1, 1]];

function formatEigen(l) {
  return l.im === 0 ? fmt(l.re, 3) : `${fmt(l.re, 3)} ${l.im > 0 ? '+' : '−'} ${fmt(Math.abs(l.im), 3)}i`;
}

export default function mount(el) {
  let A = PRESETS[0].M.map((r) => [...r]);
  const holder = h('div');
  const stats = h('div', { class: 'stats' });
  const input = matrixInput(A, (M) => { A = M; update(); });

  function update() {
    const n2 = norm2x2(A);
    const range = Math.max(2, Math.ceil((Math.max(n2, normInf(A)) + 0.3) * 2) / 2);
    const plane = createPlane({ range, ariaLabel: 'Bild des Einheitskreises unter A' }).grid(range / 4);
    plane.path(unitCircle(), 'series-6', { closed: true, dashed: true });
    plane.path(SQUARE, 'series-6', { dashed: true });
    plane.path(unitCircle().map((x) => matVec(A, x)), 'series-1', { closed: true, fill: true });
    plane.path(SQUARE.map((x) => matVec(A, x)), 'series-4', { closed: true });

    // Punkt maximaler Streckung auf dem Einheitskreis → ‖A‖₂
    let best = [1, 0];
    let bestLen = 0;
    for (const x of unitCircle(720)) {
      const len = Math.hypot(...matVec(A, x));
      if (len > bestLen) { bestLen = len; best = x; }
    }
    const image = matVec(A, best);
    // x und −x werden gleich stark gestreckt: den nach oben zeigenden Pfeil wählen
    plane.arrow([0, 0], image[1] < 0 ? image.map((v) => -v) : image, 'series-1', '‖A‖₂');

    const eig = eigenvalues2x2(A);
    eig.filter((l) => l.im === 0).forEach((l, i) => {
      const v = eigenvector2x2(A, l.re);
      plane.arrow([0, 0], [v[0] * l.re, v[1] * l.re], 'series-5', i === 0 ? 'λ₁e₁' : 'λ₂e₂');
    });
    setChildren(holder, plane.svg);

    setChildren(stats,
      stat('‖A‖∞ (Zeilensummen)', fmt(normInf(A), 3), 'max. Bildpunkt des Quadrats in ∞-Norm'),
      stat('‖A‖₁ (Spaltensummen)', fmt(norm1(A), 3)),
      stat('‖A‖₂ (Spektralnorm)', fmt(n2, 3), 'größte Halbachse der Ellipse'),
      stat('‖A‖_Fr (Frobenius)', fmt(normFrobenius(A), 3)),
      stat('Eigenwerte', eig.map(formatEigen).join(', ')),
      stat('Spektralradius ϱ(A)', fmt(spectralRadius2x2(A), 3), '≤ jede verträgliche Norm'),
    );
  }

  setChildren(el,
    controls(
      h('div', { class: 'control' }, h('span', { class: 'control__label' }, 'Matrix A'), input.element),
      h('div', { class: 'control' }, h('span', { class: 'control__label' }, 'Vorlagen'),
        h('div', { class: 'example-buttons' }, PRESETS.map((p) => h('button', {
          type: 'button', class: 'chip', onclick: () => { A = p.M.map((r) => [...r]); input.set(A); update(); },
        }, p.label)))),
    ),
    h('div', { class: 'widget-columns' }, holder, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Gestrichelt: Einheitskreis und Einheitsquadrat. Gefüllt: ihr Bild unter A. Die Spektralnorm ist die stärkste Streckung eines Einheitsvektors.'))),
  );
  update();
}
