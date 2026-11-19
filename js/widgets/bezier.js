/**
 * Widget: Bézier-Kurven mit ziehbaren Kontrollpunkten, konvexer Hülle und
 * de-Casteljau-Konstruktion (Abschnitte 22.2, 22.3).
 */
import { h, setChildren, slider, controls, stat, button, fmt } from '../core/dom.js';
import { createPlane } from '../core/plane.js';
import { bezierPoint, deCasteljau, convexHull } from '../lib/numerics/bezier.js';

// Beispiel 22.7, um den Faktor 3 gestreckt und zentriert
const EXAMPLE = [[0, 0], [1 / 3, -1], [2 / 3, -1], [1, 1]].map(([x, y]) => [3 * x - 1.5, 1.2 * y]);

export default function mount(el) {
  let points = EXAMPLE.map((p) => [...p]);
  const state = { t: 0.4, active: -1, hull: true, construction: true };
  const plane = createPlane({ range: 2.4, ariaLabel: 'Bézier-Kurve mit Kontrollpolygon' });
  const stats = h('div', { class: 'stats' });

  plane.onDrag((p) => {
    if (state.active < 0) {
      let best = 0;
      points.forEach((q, i) => { if (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(points[best][0] - p[0], points[best][1] - p[1])) best = i; });
      state.active = best;
    }
    points[state.active] = p;
    update();
  });
  plane.svg.addEventListener('pointerup', () => { state.active = -1; });

  function update() {
    const n = points.length - 1;
    plane.clear().grid(0.5);
    if (state.hull) plane.path(convexHull(points), 'series-6', { closed: true, fill: true, dashed: true });
    plane.path(points, 'series-3', { dashed: true });
    const curve = Array.from({ length: 201 }, (_, k) => bezierPoint(points, k / 200));
    plane.path(curve, 'series-1');

    if (state.construction) {
      const levels = deCasteljau(points, state.t);
      levels.slice(1, -1).forEach((lvl, k) => {
        plane.path(lvl, `series-${(k % 3) + 4}`);
        lvl.forEach((p) => plane.dot(p, `series-${(k % 3) + 4}`, 3));
      });
      const x = levels.at(-1)[0];
      plane.dot(x, 'series-5', 6);
      plane.text(x, `x(${state.t.toFixed(2)})`, 'series-5');
    }
    // Tangenten in den Endpunkten: x'(0) = n(b1 − b0), x'(1) = n(bn − bn−1)
    points.forEach((p, i) => {
      plane.dot(p, 'series-2', 6);
      plane.text(p, `b${String(i).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d])}`, 'series-2');
    });
    const d0 = [n * (points[1][0] - points[0][0]), n * (points[1][1] - points[0][1])];
    const d1 = [n * (points[n][0] - points[n - 1][0]), n * (points[n][1] - points[n - 1][1])];
    setChildren(stats,
      stat('Grad n', String(n), `${n + 1} Kontrollpunkte`),
      stat("x′(0) = n(b₁ − b₀)", `(${fmt(d0[0], 2)}, ${fmt(d0[1], 2)})`, 'Tangente im Anfangspunkt'),
      stat("x′(1) = n(bₙ − bₙ₋₁)", `(${fmt(d1[0], 2)}, ${fmt(d1[1], 2)})`, 'Tangente im Endpunkt'),
    );
  }

  const toggle = (key, label) => h('label', { class: 'checkbox' }, h('input', { type: 'checkbox', checked: state[key] || undefined, onchange: (e) => { state[key] = e.target.checked; update(); } }), ` ${label}`);
  setChildren(el,
    controls(slider({ label: 'Parameter t =', min: 0, max: 1, step: 0.01, value: state.t, format: (v) => v.toFixed(2), onInput: (v) => { state.t = v; update(); } })),
    h('div', { class: 'example-buttons' },
      toggle('hull', 'konvexe Hülle'), toggle('construction', 'de-Casteljau-Konstruktion'),
      button('+ Punkt', () => { const last = points.at(-1); points.push([Math.min(2.2, last[0] + 0.4), last[1] - 0.6]); update(); }, { secondary: true }),
      button('− Punkt', () => { if (points.length > 2) { points.pop(); update(); } }, { secondary: true }),
      button('Beispiel 22.7', () => { points = EXAMPLE.map((p) => [...p]); update(); }, { secondary: true })),
    h('div', { class: 'widget-columns' }, plane.svg, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Ziehen Sie die grünen Kontrollpunkte. Die Kurve beginnt in b₀, endet in bₙ, startet tangential zu b₀b₁ und liegt immer in der konvexen Hülle (grau).'),
      h('p', { class: 'widget__hint' }, 'De Casteljau: Teile jede Strecke des Kontrollpolygons im Verhältnis t : (1 − t), verbinde die neuen Punkte und wiederhole – der letzte Punkt liegt auf der Kurve. Nur Konvexkombinationen, daher numerisch stabil.'))),
  );
  update();
}
