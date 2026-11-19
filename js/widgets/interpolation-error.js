/**
 * Widget: Interpolationsfehler und Runge-Phänomen (Satz 18.2, Beispiel 18.4).
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { equidistantNodes, chebyshevNodes, lagrangeEval } from '../lib/numerics/interpolation.js';

const FUNCTIONS = {
  sin: { label: 'sin(2x) auf [0, 2π]', f: (x) => Math.sin(2 * x), range: [0, 2 * Math.PI], y: [-2.5, 2.5] },
  runge: { label: '1/(1+x²) auf [−5, 5]', f: (x) => 1 / (1 + x * x), range: [-5, 5], y: [-1.5, 2] },
};
const NODES = { equi: { label: 'äquidistant', make: equidistantNodes }, cheb: { label: 'Tschebyscheff', make: chebyshevNodes } };

function maxError(F, nodes) {
  const ys = nodes.map(F.f);
  const [a, b] = F.range;
  let m = 0;
  for (let k = 0; k <= 800; k++) {
    const x = a + ((b - a) * k) / 800;
    m = Math.max(m, Math.abs(F.f(x) - lagrangeEval(nodes, ys, x)));
  }
  return m;
}

export default function mount(el) {
  const state = { fn: 'runge', n: 10, nodes: 'equi' };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const errPlot = h('div', { class: 'plot-container' });

  function update() {
    const F = FUNCTIONS[state.fn];
    const [a, b] = F.range;
    const nodes = NODES[state.nodes].make(a, b, state.n);
    const ys = nodes.map(F.f);
    const grid = Array.from({ length: 600 }, (_, k) => a + ((b - a) * k) / 599);
    renderPlot(plot, {
      height: 300,
      x: { label: 'x', min: a, max: b },
      y: { label: 'y', min: F.y[0], max: F.y[1] },
      series: [
        { data: grid.map((x) => [x, F.f(x)]), label: 'f(x)', color: 1 },
        { data: grid.map((x) => [x, lagrangeEval(nodes, ys, x)]), label: `Interpolationspolynom vom Grad ${state.n}`, color: 5 },
        { data: nodes.map((x, i) => [x, ys[i]]), kind: 'points', label: `${NODES[state.nodes].label}e Stützstellen`, color: 4, radius: 3.5 },
      ],
      ariaLabel: 'Funktion und Interpolationspolynom',
    });

    const ns = Array.from({ length: 24 }, (_, i) => i + 1);
    const curves = Object.entries(NODES).map(([k, nd], idx) => ({ data: ns.map((n) => [n, Math.max(maxError(F, nd.make(a, b, n)), 1e-16)]), label: nd.label, color: idx === 0 ? 5 : 2 }));
    renderPlot(errPlot, {
      height: 220,
      x: { label: 'Polynomgrad n', min: 1, max: 24 },
      y: { label: 'max |f − p|', log: true, min: 1e-14, max: 1e4 },
      series: curves,
      markers: [{ x: state.n }],
      ariaLabel: 'Maximaler Fehler in Abhängigkeit vom Grad',
    });
    setChildren(stats,
      stat('max |f(x) − p(x)|', fmtExp(maxError(F, nodes), 2), `n = ${state.n}, ${NODES[state.nodes].label}`),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Funktion', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, f]) => ({ value: k, label: f.label })), onChange: (v) => { state.fn = v; update(); } }),
      segmented({ label: 'Stützstellen', value: state.nodes, options: Object.entries(NODES).map(([k, nd]) => ({ value: k, label: nd.label })), onChange: (v) => { state.nodes = v; update(); } }),
      slider({ label: 'Grad n =', min: 1, max: 24, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } }),
    ),
    stats,
    plot,
    errPlot,
    h('p', { class: 'widget__hint' }, 'Bei sin(2x) sinkt der Fehler mit n rasant. Bei Runges Funktion wachsen die Ableitungen wie 2ⁿn!: Mit äquidistanten Stützstellen schwingt das Polynom am Rand immer stärker. Tschebyscheff-Stützstellen (am Rand dichter) beheben das.'),
  );
  update();
}
