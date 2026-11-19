/**
 * Widget: Polynom, linearer Spline und kubischer Spline im Vergleich (Beispiel 21.5).
 * Die Werte y_i lassen sich verändern.
 */
import { h, setChildren, slider, stat, fmt, button } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { lagrangeEval } from '../lib/numerics/interpolation.js';
import { naturalCubicSpline, linearSpline } from '../lib/numerics/spline.js';

const XS = [0, 0.1, 0.2, 0.25, 0.5, 0.7, 1.0];
const YS = [1, -1, -1, -0.5, 0, 0, 5];

export default function mount(el) {
  const ys = [...YS];
  const show = { poly: true, linear: true, cubic: true, curvature: false };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const curvaturePlot = h('div', { class: 'plot-container' });
  const sliders = h('div', { class: 'network__controls' });

  function buildSliders() {
    setChildren(sliders, XS.map((x, i) => slider({ label: `y bei x = ${fmt(x, 2)}:`, min: -3, max: 8, step: 0.1, value: ys[i], format: (v) => v.toFixed(1), onInput: (v) => { ys[i] = v; update(); } }).element));
  }

  function update() {
    const spline = naturalCubicSpline(XS, ys);
    const lin = linearSpline(XS, ys);
    const grid = Array.from({ length: 500 }, (_, k) => k / 499);
    const series = [];
    if (show.poly) series.push({ data: grid.map((x) => [x, lagrangeEval(XS, ys, x)]), label: 'Polynom vom Grad 6', color: 5 });
    if (show.linear) series.push({ data: grid.map((x) => [x, lin(x)]), label: 'linearer Spline S¹', color: 6, dashed: true });
    if (show.cubic) series.push({ data: grid.map((x) => [x, spline.evaluate(x)]), label: 'kubischer Spline S³ (natürlich)', color: 2 });
    series.push({ data: XS.map((x, i) => [x, ys[i]]), kind: 'points', label: 'Daten', color: 1, radius: 4.5 });
    renderPlot(plot, { height: 300, x: { label: 'x', min: 0, max: 1 }, y: { label: 'y', min: -3, max: 10 }, series, ariaLabel: 'Interpolation mit Polynom und Splines' });

    if (show.curvature) {
      renderPlot(curvaturePlot, {
        height: 180,
        x: { label: 'x', min: 0, max: 1 },
        y: { label: "s''(x)" },
        series: [{ data: grid.map((x) => [x, spline.second(x)]), label: "zweite Ableitung des kubischen Splines (stetig, stückweise linear)", color: 2 }],
        ariaLabel: 'Zweite Ableitung des Splines',
      });
    } else setChildren(curvaturePlot);

    const energy = grid.slice(1).reduce((s, x, k) => s + spline.second(x) ** 2 * (x - grid[k]), 0);
    const polyMax = Math.max(...grid.map((x) => Math.abs(lagrangeEval(XS, ys, x))));
    setChildren(stats,
      stat('Krümmungsenergie ∫ s″² dx', fmt(energy, 4), 'minimal unter allen C²-Interpolierenden'),
      stat('max |p(x)| des Polynoms', fmt(polyMax, 3), 'Überschwinger'),
      stat('Gleichungssystem für a₂⁽ⁱ⁾', `${XS.length - 2} × ${XS.length - 2}, tridiagonal`, 'Aufwand O(n)'),
    );
  }

  const toggle = (key, label) => h('label', { class: 'checkbox' }, h('input', { type: 'checkbox', checked: show[key] || undefined, onchange: (e) => { show[key] = e.target.checked; update(); } }), ` ${label}`);
  setChildren(el,
    h('div', { class: 'example-buttons' }, toggle('poly', 'Polynom'), toggle('linear', 'linearer Spline'), toggle('cubic', 'kubischer Spline'), toggle('curvature', 's″ anzeigen'),
      button('Beispiel 21.5', () => { YS.forEach((v, i) => { ys[i] = v; }); buildSliders(); update(); }, { secondary: true })),
    stats,
    plot,
    curvaturePlot,
    h('details', { class: 'widget__details' }, h('summary', {}, 'Datenwerte yᵢ verändern'), sliders),
    h('p', { class: 'widget__hint' }, 'Das Polynom vom Grad 6 schwingt zwischen den eng liegenden Punkten stark über. Der kubische Spline ist glatt (zweimal stetig differenzierbar) und bleibt lokal – wie eine biegsame Holzlatte, die durch die Punkte gezwungen wird.'),
  );
  buildSliders();
  update();
}
