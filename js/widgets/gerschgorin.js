/**
 * Widget: Gerschgorin-Kreise einer 3×3-Matrix in der komplexen Ebene (Satz 14.2).
 */
import { h, setChildren, controls, stat, matrixInput, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { eigenvalues3x3, gerschgorinDiscs } from '../lib/numerics/eigen.js';

const PRESETS = [
  { label: 'diagonaldominant', M: [[4, 1, 0.5], [0.5, -2, 1], [1, 0.5, 6]] },
  { label: 'Poisson', M: [[2, -1, 0], [-1, 2, -1], [0, -1, 2]] },
  { label: 'unsymmetrisch', M: [[1, 2, 0], [-1, 1, 1], [0, 1, -3]] },
];

const formatZ = (z) => (z.im === 0 ? fmt(z.re, 3) : `${fmt(z.re, 3)} ${z.im > 0 ? '+' : '−'} ${fmt(Math.abs(z.im), 3)}i`);

export default function mount(el) {
  let A = PRESETS[0].M;
  const holder = h('div');
  const stats = h('div', { class: 'stats' });
  const inputHolder = h('div');

  function setMatrix(M) {
    A = M;
    setChildren(inputHolder, matrixInput(A, (next) => { A = next; update(); }).element);
    update();
  }

  function update() {
    const discs = gerschgorinDiscs(A);
    const eig = eigenvalues3x3(A);
    const extent = Math.max(...discs.map((d) => Math.abs(d.center) + d.radius), ...eig.map((z) => Math.hypot(z.re, z.im)), 1);
    const range = Math.ceil(extent * 1.15);
    const plane = createPlane({ range, ariaLabel: 'Gerschgorin-Kreise und Eigenwerte' }).grid(range / 4);
    discs.forEach((d, k) => {
      plane.circle([d.center, 0], d.radius, `series-${k + 2}`, { fill: true });
      plane.dot([d.center, 0], `series-${k + 2}`, 3);
    });
    eig.forEach((z) => plane.dot([z.re, z.im], 'series-5', 5));
    plane.text([range * 0.55, range * 0.88], 'Im', '', 0, 0);
    plane.text([range * 0.85, 0], 'Re', '', 0, -6);
    setChildren(holder, plane.svg);

    const bound = Math.max(...discs.map((d) => Math.abs(d.center) + d.radius));
    setChildren(stats,
      ...discs.map((d, k) => stat(`Kreis ${k + 1}`, `Mitte ${fmt(d.center, 2)}, Radius ${fmt(d.radius, 2)}`, `aₖₖ und Σⱼ≠ₖ |aₖⱼ|`)),
      stat('Eigenwerte (rot)', eig.map(formatZ).join('; ')),
      stat('Schranke ϱ(A) ≤ max(|aₖₖ| + rₖ)', fmt(bound, 3), `tatsächlich ϱ(A) = ${fmt(Math.max(...eig.map((z) => Math.hypot(z.re, z.im))), 3)}`),
    );
  }

  setChildren(el,
    controls(
      h('div', { class: 'control' }, h('span', { class: 'control__label' }, 'Matrix A'), inputHolder),
      h('div', { class: 'control' }, h('span', { class: 'control__label' }, 'Vorlagen'),
        h('div', { class: 'example-buttons' }, PRESETS.map((p) => h('button', { type: 'button', class: 'chip', onclick: () => setMatrix(p.M) }, p.label)))),
    ),
    h('div', { class: 'widget-columns' }, holder, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Jeder Eigenwert liegt in mindestens einem Kreis – berechnet nur aus den Matrixeinträgen, ohne ein Eigenwertproblem zu lösen. Je dünner die Matrix besetzt und je stärker die Diagonale, desto kleiner die Kreise.'))),
  );
  setMatrix(A);
}
