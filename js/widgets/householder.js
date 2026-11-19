/**
 * Widget: Householder-Spiegelung in der Ebene (Definition 12.1, Gleichung 12.1).
 * x lässt sich ziehen; v wird so gewählt, dass Q_v x auf der e₁-Achse landet.
 */
import { h, setChildren, segmented, controls, stat, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';

export default function mount(el) {
  const state = { x: [1.2, 1.5], sign: 'good' };
  const plane = createPlane({ range: 3.6, ariaLabel: 'Householder-Spiegelung' });
  const stats = h('div', { class: 'stats' });
  plane.onDrag((p) => { state.x = p; update(); });

  function update() {
    const x = state.x;
    const nx = Math.hypot(...x);
    const s = (x[0] >= 0 ? 1 : -1) * (state.sign === 'good' ? 1 : -1);
    const v = [x[0] + s * nx, x[1]];
    const vv = v[0] ** 2 + v[1] ** 2;
    const alpha = (x[0] * v[0] + x[1] * v[1]) / vv;
    const av = [alpha * v[0], alpha * v[1]];
    const w = [x[0] - av[0], x[1] - av[1]];
    const qx = [w[0] - av[0], w[1] - av[1]]; // Q_v x = −αv + w
    const nv = Math.sqrt(vv);
    const dir = nv > 1e-12 ? [-v[1] / nv, v[0] / nv] : [0, 1]; // Spiegelachse ⟂ v

    plane.clear().grid(0.5);
    plane.path([[-dir[0] * 5, -dir[1] * 5], [dir[0] * 5, dir[1] * 5]], 'series-6', { dashed: true });
    plane.text([dir[0] * 2.1, dir[1] * 2.1], 'Spiegelebene ⟂ v', 'series-6');
    plane.path([x, av], 'series-6', { dashed: true });
    plane.arrow([0, 0], v, 'series-4', 'v');
    plane.arrow([0, 0], x, 'series-1', 'x');
    plane.arrow([0, 0], qx, 'series-2', 'Qᵥx = βe₁');
    plane.dot(av, 'series-6', 3);
    plane.text(av, 'αv', 'series-6');

    setChildren(stats,
      stat('v = x ± ‖x‖e₁', `(${fmt(v[0], 2)}, ${fmt(v[1], 2)})`, state.sign === 'good' ? 'Vorzeichen wie x₁: ‖v‖ groß' : 'falsches Vorzeichen: Auslöschung bei x ≈ ‖x‖e₁'),
      stat('‖v‖₂', fmt(nv, 3)),
      stat('β = ∓‖x‖₂', fmt(-s * nx, 3), 'Qᵥx liegt auf der e₁-Achse'),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'Vorzeichen in v = x ± ‖x‖e₁', value: state.sign, options: [{ value: 'good', label: 'sgn(x₁) (wie im Skript)' }, { value: 'bad', label: '−sgn(x₁)' }], onChange: (v) => { state.sign = v; update(); } })),
    h('div', { class: 'widget-columns' }, plane.svg, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Ziehen Sie x. Die Householder-Matrix spiegelt an der Geraden (Ebene) senkrecht zu v: Der Anteil αv wechselt das Vorzeichen, w bleibt. v ist genau so gewählt, dass das Bild auf der e₁-Achse liegt.'),
      h('p', { class: 'widget__hint' }, 'Mit dem anderen Vorzeichen landet Qᵥx auch auf der Achse – aber für x nahe der positiven e₁-Achse wird v winzig (x − ‖x‖e₁): Auslöschung.'))),
  );
  update();
}
