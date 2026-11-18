/**
 * Widget: Die quadratische Form xᵀAx einer symmetrischen 2×2-Matrix
 * (Abschnitt 5.6). Höhenlinien zeigen, ob A positiv definit ist.
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { eigenvalues2x2, eigenvector2x2 } from '../lib/numerics/linalg.js';

const LEVELS = [0.25, 0.5, 1, 2, 3];

/**
 * Höhenlinie xᵀAx = c in Polarkoordinaten: r(t)² = c / (uᵀAu), u = (cos t, sin t).
 * Nur Richtungen mit uᵀAu > 0 erreichen positive Niveaus.
 */
function levelCurve(A, c, samples = 360) {
  const segments = [];
  let current = [];
  for (let k = 0; k <= samples; k++) {
    const t = (2 * Math.PI * k) / samples;
    const u = [Math.cos(t), Math.sin(t)];
    const q = A[0][0] * u[0] * u[0] + 2 * A[0][1] * u[0] * u[1] + A[1][1] * u[1] * u[1];
    if (q > 1e-6) {
      const r = Math.min(Math.sqrt(c / q), 10);
      current.push([r * u[0], r * u[1]]);
    } else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

export default function mount(el) {
  const state = { a: 2, b: 0.8, c: 1 };
  const holder = h('div');
  const stats = h('div', { class: 'stats' });

  function update() {
    const A = [[state.a, state.b], [state.b, state.c]];
    const plane = createPlane({ range: 2.5, ariaLabel: 'Höhenlinien der quadratischen Form' }).grid(0.5);
    LEVELS.forEach((c) => levelCurve(A, c).forEach((seg) => plane.path(seg, 'series-1')));
    LEVELS.forEach((c) => levelCurve(A.map((r) => r.map((v) => -v)), c).forEach((seg) => plane.path(seg, 'series-5', { dashed: true })));

    const eig = eigenvalues2x2(A).map((l) => l.re);
    eig.forEach((l, i) => {
      const v = eigenvector2x2(A, l);
      plane.arrow([0, 0], [v[0] * 1.2, v[1] * 1.2], 'series-4', `e${i === 0 ? '₁' : '₂'}`);
    });
    setChildren(holder, plane.svg);

    const pd = eig.every((l) => l > 0);
    const nd = eig.every((l) => l < 0);
    const verdict = pd ? 'positiv definit' : nd ? 'negativ definit' : eig.some((l) => Math.abs(l) < 1e-9) ? 'semidefinit (singulär)' : 'indefinit';
    setChildren(stats,
      stat('Eigenwerte', eig.map((l) => fmt(l, 3)).join(', ')),
      stat('Klassifikation', verdict, pd ? 'Höhenlinien sind Ellipsen' : 'Höhenlinien sind keine Ellipsen'),
      stat('Lemma 5.22', pd ? `max |aᵢⱼ| = ${fmt(Math.max(Math.abs(state.a), Math.abs(state.b), Math.abs(state.c)), 2)} liegt auf der Diagonale ✓` : '—'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'a₁₁ =', min: -3, max: 3, step: 0.1, value: state.a, format: (v) => v.toFixed(1), onInput: (v) => { state.a = v; update(); } }),
      slider({ label: 'a₁₂ = a₂₁ =', min: -3, max: 3, step: 0.1, value: state.b, format: (v) => v.toFixed(1), onInput: (v) => { state.b = v; update(); } }),
      slider({ label: 'a₂₂ =', min: -3, max: 3, step: 0.1, value: state.c, format: (v) => v.toFixed(1), onInput: (v) => { state.c = v; update(); } }),
    ),
    h('div', { class: 'widget-columns' }, holder, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Durchgezogen: xᵀAx = c > 0, gestrichelt: xᵀAx = −c < 0. Die Halbachsen der Ellipsen zeigen in Richtung der Eigenvektoren, ihre Länge ist 1/√λ.'),
      h('p', { class: 'widget__hint' }, 'Machen Sie |a₁₂| größer als a₁₁ und a₂₂: Dann kann A nicht mehr positiv definit sein (Lemma 5.22).'))),
  );
  update();
}
