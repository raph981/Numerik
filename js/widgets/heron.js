/**
 * Widget: Newton-Iteration x_{n+1} = ½(x_n + a/x_n) für √a.
 * Zeigt, wie sich die Anzahl korrekter Stellen pro Schritt etwa verdoppelt.
 */
import { h, setChildren, slider, controls, table, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { heronIteration, correctDigits } from '../lib/numerics/iteration.js';

const STEPS = 6;

/** Markiert die korrekten führenden Ziffern einer Näherung. */
function highlightDigits(x, exact) {
  const text = x.toPrecision(16);
  const ok = correctDigits(x, exact);
  // Anzahl Zeichen, die ok signifikante Ziffern enthalten (Punkt überspringen)
  let seen = 0;
  let cut = 0;
  while (cut < text.length && seen < ok) {
    if (/\d/.test(text[cut])) seen++;
    cut++;
  }
  return h('span', { class: 'mono' },
    h('span', { class: 'digits-ok' }, text.slice(0, cut)),
    h('span', { class: 'digits-bad' }, text.slice(cut)),
  );
}

export default function mount(el, { a: a0 = 2, x0: x00 = 1 } = {}) {
  const state = { a: a0, x0: x00 };
  const output = h('div');
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const rows = heronIteration(state.a, state.x0, STEPS);
    const exact = Math.sqrt(state.a);
    setChildren(output, table(
      ['n', 'xₙ (korrekte Ziffern grün)', '|xₙ − √a|', 'korrekte Stellen'],
      rows.map((r) => [String(r.n), highlightDigits(r.x, exact), fmtExp(r.error, 2), String(correctDigits(r.x, exact))]),
    ));
    renderPlot(plot, {
      height: 240,
      x: { label: 'Iteration n', min: -0.3, max: STEPS + 0.3, ticks: rows.map((r) => r.n) },
      y: { label: 'Fehler |xₙ − √a|', log: true, min: 1e-17, max: Math.max(10, rows[0].error * 10) },
      series: [{ data: rows.map((r) => [r.n, Math.max(r.error, 1e-17)]), kind: 'stem', color: 1 }],
      ariaLabel: 'Fehler der Newton-Iteration in logarithmischer Darstellung',
    });
  }

  setChildren(el,
    controls(
      slider({ label: 'Radikand a =', min: 0.5, max: 10, step: 0.5, value: state.a, format: (v) => v.toFixed(1), onInput: (v) => { state.a = v; update(); } }),
      slider({ label: 'Startwert x₀ =', min: 0.1, max: 6, step: 0.1, value: state.x0, format: (v) => v.toFixed(1), onInput: (v) => { state.x0 = v; update(); } }),
    ),
    output,
    plot,
  );
  update();
}
