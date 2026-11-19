/**
 * Widget: Gram-Schmidt in der Ebene (Algorithmus 11.2). Die Vektorspitzen von
 * a₁ und a₂ lassen sich ziehen.
 */
import { h, setChildren, stat, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';

export default function mount(el) {
  const state = { a1: [1.6, 0.6], a2: [0.7, 1.4], active: null };
  const plane = createPlane({ range: 2, ariaLabel: 'Gram-Schmidt-Orthogonalisierung zweier Vektoren' });
  const stats = h('div', { class: 'stats' });

  plane.onDrag((p) => {
    if (!state.active) {
      const d1 = Math.hypot(p[0] - state.a1[0], p[1] - state.a1[1]);
      const d2 = Math.hypot(p[0] - state.a2[0], p[1] - state.a2[1]);
      state.active = d1 < d2 ? 'a1' : 'a2';
    }
    state[state.active] = p;
    update();
  });
  plane.svg.addEventListener('pointerup', () => { state.active = null; });

  function update() {
    const { a1, a2 } = state;
    const n1 = Math.hypot(...a1);
    const q1 = [a1[0] / n1, a1[1] / n1];
    const r12 = a2[0] * q1[0] + a2[1] * q1[1];
    const proj = [r12 * q1[0], r12 * q1[1]];
    const q2p = [a2[0] - proj[0], a2[1] - proj[1]];
    const n2 = Math.hypot(...q2p);
    const q2 = n2 > 1e-9 ? [q2p[0] / n2, q2p[1] / n2] : [0, 0];

    plane.clear().grid(0.5);
    plane.path([[0, 0], proj], 'series-6', { dashed: true });
    plane.path([proj, a2], 'series-6', { dashed: true });
    plane.arrow([0, 0], a1, 'series-3', 'a₁');
    plane.arrow([0, 0], a2, 'series-4', 'a₂');
    plane.arrow([0, 0], proj, 'series-6', '(a₂,q₁)q₁');
    plane.arrow(proj, a2, 'series-5', 'q₂′');
    plane.arrow([0, 0], q1, 'series-1', 'q₁');
    plane.arrow([0, 0], q2, 'series-2', 'q₂');

    setChildren(stats,
      stat('r₁₁ = ‖a₁‖', fmt(n1, 3)),
      stat('r₁₂ = (a₂, q₁)', fmt(r12, 3), 'Länge der Projektion'),
      stat('r₂₂ = ‖q₂′‖', fmt(n2, 3), n2 < 0.15 ? 'fast linear abhängig!' : ''),
      stat('(q₁, q₂)', fmt(q1[0] * q2[0] + q1[1] * q2[1], 6), 'orthogonal'),
    );
  }

  setChildren(el, h('div', { class: 'widget-columns' }, plane.svg, h('div', {}, stats,
    h('p', { class: 'widget__hint' }, 'Ziehen Sie a₁ oder a₂. q₁ ist a₁ normiert. Von a₂ wird der Anteil in Richtung q₁ abgezogen – übrig bleibt q₂′ ⟂ q₁. Die Koeffizienten bilden die Matrix R mit A = QR.'),
    h('p', { class: 'widget__hint' }, 'Legen Sie a₂ fast auf a₁: q₂′ wird winzig und entsteht durch Subtraktion fast gleicher Vektoren – Auslöschung! Genau das macht das klassische Verfahren instabil.'))));
  update();
}
