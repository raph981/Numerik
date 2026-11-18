/**
 * Widget: Einheitskugeln der p-Normen und Normäquivalenz (Abschnitt 5.1).
 * Ein Vektor lässt sich mit der Maus ziehen; seine Normen werden angezeigt.
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { vectorNorm } from '../lib/numerics/linalg.js';

/** Punkte der Einheitssphäre {x : ‖x‖_p = 1}. */
function unitSphere(p, samples = 240) {
  return Array.from({ length: samples + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / samples;
    const v = [Math.cos(t), Math.sin(t)];
    const n = vectorNorm(v, p);
    return [v[0] / n, v[1] / n];
  });
}

const SLIDER_TO_P = (s) => (s >= 10 ? Infinity : s);

export default function mount(el) {
  const state = { p: 3, x: [0.8, 0.5] };
  const stats = h('div', { class: 'stats' });
  const plane = createPlane({ range: 1.6, ariaLabel: 'Einheitskugeln verschiedener Normen' });
  plane.onDrag((pt) => { state.x = pt; update(); });

  function update() {
    plane.clear().grid(0.4);
    plane.path(unitSphere(1), 'series-2', { closed: true });
    plane.path(unitSphere(2), 'series-3', { closed: true });
    plane.path(unitSphere(Infinity), 'series-4', { closed: true });
    plane.path(unitSphere(state.p), 'series-1', { closed: true, fill: true });
    plane.text([0.72, 0.72], '‖·‖₁', 'series-2', -40, 26);
    plane.text([1, 1], '‖·‖∞', 'series-4', -6, -4);
    plane.arrow([0, 0], state.x, 'series-5', 'x');

    const pLabel = state.p === Infinity ? '∞' : fmt(state.p, 1);
    setChildren(stats,
      stat('‖x‖₁', fmt(vectorNorm(state.x, 1), 3)),
      stat('‖x‖₂', fmt(vectorNorm(state.x, 2), 3)),
      stat('‖x‖∞', fmt(vectorNorm(state.x, Infinity), 3)),
      stat(`‖x‖_${pLabel}`, fmt(vectorNorm(state.x, state.p), 3), 'gefüllte Kurve'),
    );
  }

  setChildren(el,
    controls(slider({
      label: 'p =', min: 1, max: 10, step: 0.1, value: state.p,
      format: (s) => (s >= 10 ? '∞' : s.toFixed(1)),
      onInput: (s) => { state.p = SLIDER_TO_P(s); update(); },
    })),
    h('div', { class: 'widget-columns' }, plane.svg, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Ziehen Sie den Vektor x. Die Kurven sind die „Einheitskreise“ {x : ‖x‖ = 1}: Raute (p = 1), Kreis (p = 2), Quadrat (p = ∞).'),
      h('p', { class: 'widget__hint' }, 'Die Kugeln sind ineinander geschachtelt: ‖x‖∞ ≤ ‖x‖₂ ≤ ‖x‖₁ ≤ 2‖x‖∞. Genau das besagt die Normäquivalenz (Satz 5.4) – nur die Konstanten unterscheiden sich.'))),
  );
  update();
}
