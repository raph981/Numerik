/**
 * Widget: Konvergenzordnung stückweiser Polynome (Beispiel 21.7).
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { equidistantNodes, lagrangeEval } from '../lib/numerics/interpolation.js';
import { naturalCubicSpline, linearSpline } from '../lib/numerics/spline.js';

const FUNCTIONS = {
  f1: { label: 'exp(−x²) auf [−10, 10]', f: (x) => Math.exp(-x * x), range: [-10, 10], y: [-0.4, 1.2] },
  f2: { label: 'cos²x bzw. 0 (f″ springt)', f: (x) => (Math.abs(x) < Math.PI / 2 ? Math.cos(x) ** 2 : 0), range: [-Math.PI, Math.PI], y: [-0.3, 1.2] },
  f3: { label: 'Sprungfunktion', f: (x) => (x < 0.5 ? -1 : 1), range: [0, 1], y: [-1.6, 1.6] },
};
const NS = [4, 8, 16, 32, 64, 128, 256, 512, 1024];

function interpolants(F, n) {
  const [a, b] = F.range;
  const xs = equidistantNodes(a, b, n);
  const ys = xs.map(F.f);
  return { xs, ys, linear: linearSpline(xs, ys), cubic: naturalCubicSpline(xs, ys).evaluate, poly: n <= 14 ? (x) => lagrangeEval(xs, ys, x) : null };
}

function maxError(F, g) {
  const [a, b] = F.range;
  let m = 0;
  for (let k = 0; k <= 3000; k++) {
    const x = a + ((b - a) * (k + 0.37)) / 3001; // Zwischenstellen, nicht nur Knoten
    m = Math.max(m, Math.abs(F.f(x) - g(x)));
  }
  return m;
}

export default function mount(el) {
  const state = { fn: 'f1', n: 16 };
  const plot = h('div', { class: 'plot-container' });
  const errPlot = h('div', { class: 'plot-container' });
  const stats = h('div', { class: 'stats' });

  function update() {
    const F = FUNCTIONS[state.fn];
    const [a, b] = F.range;
    const I = interpolants(F, state.n);
    const grid = Array.from({ length: 800 }, (_, k) => a + ((b - a) * k) / 799);
    renderPlot(plot, {
      height: 260,
      x: { label: 'x', min: a, max: b },
      y: { label: 'y', min: F.y[0], max: F.y[1] },
      series: [
        { data: grid.map((x) => [x, F.f(x)]), label: 'f(x)', color: 6, dashed: true },
        I.poly ? { data: grid.map((x) => [x, I.poly(x)]), label: 'Polynom', color: 5 } : null,
        { data: grid.map((x) => [x, I.linear(x)]), label: 'linearer Spline', color: 3 },
        { data: grid.map((x) => [x, I.cubic(x)]), label: 'kubischer Spline', color: 2 },
        { data: I.xs.map((x, i) => [x, I.ys[i]]), kind: 'points', color: 1, radius: state.n > 64 ? 1.5 : 3 },
      ].filter(Boolean),
      ariaLabel: 'Interpolation mit Splines',
    });

    const rows = NS.map((n) => {
      const J = interpolants(F, n);
      return { n, linear: maxError(F, J.linear), cubic: maxError(F, J.cubic) };
    });
    const floor = 1e-14;
    renderPlot(errPlot, {
      height: 240,
      x: { label: 'Anzahl Intervalle n', log: true },
      y: { label: 'max |f − s|', log: true, min: 1e-12, max: 10 },
      series: [
        { data: rows.map((r) => [r.n, Math.max(r.linear, floor)]), label: 'linearer Spline', color: 3 },
        { data: rows.map((r) => [r.n, Math.max(r.cubic, floor)]), label: 'kubischer Spline', color: 2 },
        { data: NS.map((n) => [n, rows.at(-1).linear * (NS.at(-1) / n) ** 2]), label: '∼ h²', color: 6, dashed: true },
        { data: NS.map((n) => [n, rows.at(-1).cubic * (NS.at(-1) / n) ** 4]).filter(([, v]) => v < 10), label: '∼ h⁴', color: 6, dashed: true },
      ],
      markers: [{ x: state.n }],
      ariaLabel: 'Konvergenz der Spline-Interpolation',
    });
    const last = rows.at(-1);
    const prev = rows.at(-2);
    setChildren(stats,
      stat(`Fehler bei n = ${state.n}`, `linear ${fmtExp(maxError(F, I.linear), 1)}, kubisch ${fmtExp(maxError(F, I.cubic), 1)}`),
      stat('beobachtete Ordnung (n = 512 → 1024)', `linear ${fmt(Math.log2(prev.linear / last.linear), 2)}, kubisch ${fmt(Math.log2(prev.cubic / last.cubic), 2)}`, 'log₂(e_n / e_{2n})'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Funktion', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, f]) => ({ value: k, label: f.label })), onChange: (v) => { state.fn = v; update(); } }),
      slider({ label: 'Intervalle n =', min: 4, max: 128, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } }),
    ),
    stats,
    plot,
    errPlot,
    h('p', { class: 'widget__hint' }, 'Für glattes f erreicht der kubische Spline Ordnung 4, der lineare Ordnung 2. Springt f″ (zweite Funktion), fällt auch der kubische Spline auf Ordnung 2 zurück. Bei der Sprungfunktion konvergiert keiner in der Maximumnorm; der kubische Spline schwingt um den Sprung über, bleibt aber lokal.'),
  );
  update();
}
