/**
 * Widget: Bestapproximation als orthogonale Projektion (Satz 23.3, Satz 23.4) –
 * im ℝ² mit einer Geraden S als Teilraum.
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';

export default function mount(el) {
  const state = { f: [1.2, 1.6], angle: 20, t: 0.4 };
  const plane = createPlane({ range: 2.4, ariaLabel: 'Orthogonale Projektion von f auf den Teilraum S' });
  const stats = h('div', { class: 'stats' });

  plane.onDrag((p) => { state.f = p; update(); });

  function update() {
    const e = [Math.cos((state.angle * Math.PI) / 180), Math.sin((state.angle * Math.PI) / 180)];
    const f = state.f;
    const c = f[0] * e[0] + f[1] * e[1]; // ⟨f, e⟩ – Koeffizient in der Orthonormalbasis {e}
    const pf = [c * e[0], c * e[1]];
    const r = [f[0] - pf[0], f[1] - pf[1]];
    const g = [state.t * 2 * e[0], state.t * 2 * e[1]]; // beliebiges anderes Element g' ∈ S
    const len = (v) => Math.hypot(v[0], v[1]);

    plane.clear().grid(0.5);
    plane.line(-e[1], e[0], 0, 'series-6');
    plane.text([2.1 * e[0], 2.1 * e[1]], 'S', 'series-6');
    plane.path([g, f], 'series-5', { dashed: true });
    plane.dot(g, 'series-5', 4);
    plane.text(g, "g′", 'series-5', 6, 16);

    // Rechter Winkel bei Πf
    const s = 0.14;
    const rn = len(r) > 1e-9 ? [r[0] / len(r), r[1] / len(r)] : [-e[1], e[0]];
    const back = Math.sign(c || 1);
    plane.path([
      [pf[0] - back * s * e[0], pf[1] - back * s * e[1]],
      [pf[0] - back * s * e[0] + s * rn[0], pf[1] - back * s * e[1] + s * rn[1]],
      [pf[0] + s * rn[0], pf[1] + s * rn[1]],
    ], 'series-6');

    plane.arrow([0, 0], f, 'series-1', 'f');
    plane.arrow([0, 0], pf, 'series-2', 'g = Πf');
    if (len(r) > 0.05) plane.arrow(pf, f, 'series-4');
    plane.text([(pf[0] + f[0]) / 2, (pf[1] + f[1]) / 2], 'f − Πf', 'series-4', 8, 4);

    const fg = len([f[0] - g[0], f[1] - g[1]]);
    setChildren(stats,
      stat('‖f − Πf‖', fmt(len(r), 3), 'kleinstmöglicher Abstand'),
      stat("‖f − g′‖", fmt(fg, 3), `= √(‖f − Πf‖² + ‖Πf − g′‖²) ≥ ${fmt(len(r), 3)}`),
      stat('⟨f − Πf, e⟩', fmt(Math.abs(r[0] * e[0] + r[1] * e[1]) < 1e-12 ? 0 : r[0] * e[0] + r[1] * e[1], 3), 'Fehler ⟂ S (23.2)'),
      stat('‖f‖² = ‖Πf‖² + ‖(I − Π)f‖²', `${fmt(len(f) ** 2, 3)} = ${fmt(c * c, 3)} + ${fmt(len(r) ** 2, 3)}`, 'Pythagoras (Satz 23.4 iii)'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'Richtung von S:', min: 0, max: 175, step: 1, value: state.angle, format: (v) => `${v}°`, onInput: (v) => { state.angle = v; update(); } }),
      slider({ label: "Position von g′ auf S", min: -1, max: 1, step: 0.01, value: state.t, format: (v) => v.toFixed(2), onInput: (v) => { state.t = v; update(); } }),
    ),
    h('div', { class: 'widget-columns' }, plane.svg, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Ziehen Sie f in der Ebene. Die Bestapproximation g = Πf ist der Fußpunkt des Lots von f auf S. Jedes andere g′ ∈ S ist weiter weg – das ist genau das Argument im Beweis von Satz 23.3: ‖f − g′‖² = ‖f − g‖² + ‖g − g′‖².'))),
  );
  update();
}
