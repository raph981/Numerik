/**
 * Widget: Zwei Realisierungen von x₁² − x₂² in float (Beispiel 3.9).
 */
import { h, setChildren, slider, controls, stat, fmtExp, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { differenceOfSquares, relativeError } from '../lib/numerics/condition.js';

const rd = Math.fround;
const EPS = 2 ** -24;
const X1 = 1.25;

function errors(delta) {
  const x1 = rd(X1);
  const x2 = rd(X1 - delta);
  const exact = x1 * x1 - x2 * x2; // in double exakt genug (48 Bit Produkte)
  const { Fa, Fb } = differenceOfSquares(x1, x2, rd);
  return { x1, x2, exact, Fa, Fb, ea: relativeError(Fa, exact), eb: relativeError(Fb, exact), k: (2 * x1 * x1) / Math.abs(exact) };
}

export default function mount(el) {
  const state = { logDelta: -4 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  const sweep = Array.from({ length: 121 }, (_, i) => -1 - (i * 5.5) / 120).map((ld) => ({ ld, ...errors(10 ** ld) }));
  const floor = 1e-9;

  function update() {
    const r = errors(10 ** state.logDelta);
    setChildren(stats,
      stat('x₁, x₂ (float)', `${fmt(r.x1, 8)}, ${fmt(r.x2, 8)}`),
      stat('Fa = (x₁⊙x₁) ⊖ (x₂⊙x₂)', fmtExp(r.ea, 1), 'relativer Fehler'),
      stat('Fb = (x₁⊖x₂) ⊙ (x₁⊕x₂)', fmtExp(r.eb, 1), 'relativer Fehler'),
      stat('Verstärkung 2x₁²/|x₁²−x₂²|', fmt(r.k, 3)),
    );
    renderPlot(plot, {
      height: 300,
      x: { label: 'Abstand δ = x₁ − x₂', log: true },
      y: { label: 'relativer Fehler', log: true, min: floor, max: 10 },
      series: [
        { data: sweep.map((s) => [10 ** s.ld, Math.max(s.ea, floor)]), kind: 'points', label: 'Fa (erst quadrieren)', color: 5, radius: 2.5 },
        { data: sweep.map((s) => [10 ** s.ld, Math.max(s.eb, floor)]), kind: 'points', label: 'Fb (erst subtrahieren)', color: 2, radius: 2.5 },
        { data: sweep.map((s) => [10 ** s.ld, Math.min(10, 2 * s.k * EPS)]), label: 'Schranke ≈ 2·|k|·eps', color: 6, dashed: true },
      ],
      markers: [{ x: 10 ** state.logDelta }, { y: EPS, label: 'eps' }],
      ariaLabel: 'Relativer Fehler der beiden Realisierungen',
    });
  }

  setChildren(el,
    controls(slider({ label: 'δ = x₁ − x₂ = 10^', min: -6.5, max: -1, step: 0.1, value: state.logDelta, format: (v) => v.toFixed(1), onInput: (v) => { state.logDelta = v; update(); } })),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, `x₁ = ${X1} fest, float-Genauigkeit. Fa verliert umso mehr Stellen, je näher x₂ an x₁ liegt – Fb bleibt auf eps-Niveau.`),
  );
  update();
}
