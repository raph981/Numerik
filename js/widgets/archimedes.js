/**
 * Widget: Adaptive Quadratur nach Archimedes (Abbildung 26.2, Algorithmus 26.6).
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { EXAMPLE_INTEGRANDS, archimedes, composite, integrate, RULES } from '../lib/numerics/quadrature.js';

const INTEGRANDS = {
  hump: { label: 'Buckel 8x e^(−5x) + 0,3 auf [0, 2]', f: (x) => 8 * x * Math.exp(-5 * x) + 0.3, a: 0, b: 2 },
  peak: { label: '1/(10⁻² + x²) auf [−1, 1]', f: (x) => 1 / (1e-2 + x * x), a: -1, b: 1, exact: 20 * Math.atan(10) },
  circle: { ...EXAMPLE_INTEGRANDS.circle },
};
INTEGRANDS.hump.exact = integrate(INTEGRANDS.hump.f, 0, 2, { panels: 1024 });

export default function mount(el) {
  const state = { fn: 'hump', tolExp: -3, minLevel: 1, triangles: true };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const F = INTEGRANDS[state.fn];
    const tol = 10 ** state.tolExp;
    const result = archimedes(F.f, F.a, F.b, { tol, minLevel: state.minLevel, maxLevel: 24 });
    const grid = Array.from({ length: 801 }, (_, k) => F.a + ((F.b - F.a) * k) / 800);
    const top = Math.max(...grid.map(F.f));

    // Jeder hierarchische Zuwachs I_Δ ist ein Dreieck; gezeichnet werden die der feinsten Stufen hervorgehoben
    const triangleSeries = state.triangles
      ? result.triangles.slice(0, 400).map((t) => ({ data: [[t.xl, t.fl], [t.xm, t.fm], [t.xr, t.fr], [t.xl, t.fl]], color: (t.level % 3) + 2 }))
      : [];
    renderPlot(plot, {
      height: 300,
      x: { label: 'x', min: F.a, max: F.b },
      y: { label: 'y', min: 0, max: top * 1.08 },
      series: [
        { data: result.points, kind: 'area', label: 'stückweise lineare Näherung (Trapeze)', color: 3 },
        { data: grid.map((x) => [x, F.f(x)]), label: 'f', color: 6, dashed: true },
        ...triangleSeries,
        { data: result.points.map(([x]) => [x, top * 0.02]), kind: 'points', label: 'Auswertungsstellen', color: 5, radius: 2.2 },
      ],
      ariaLabel: 'Adaptive Quadratur nach Archimedes',
    });

    const uniform = composite(RULES.trapezoid.rule, F.f, F.a, F.b, result.evals - 1);
    const err = Math.abs(result.value - F.exact);
    const uniformErr = Math.abs(uniform.value - F.exact);
    setChildren(stats,
      stat('Auswertungen', String(result.evals), `${result.triangles.length} Dreiecke I_Δ`),
      stat('Fehler adaptiv', fmtExp(err, 2), `Ergebnis ${fmt(result.value, 10)}`),
      stat('Trapez, gleich viele Punkte, äquidistant', fmtExp(uniformErr, 2), uniformErr > err ? `adaptiv ist ${fmt(uniformErr / Math.max(err, 1e-300), 2)}× genauer` : 'hier ist uniform besser'),
    );
  }

  setChildren(el,
    controls(segmented({ label: 'Integrand', value: state.fn, options: Object.entries(INTEGRANDS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } })),
    controls(
      slider({ label: 'TOL = 10^', min: -7, max: 0, step: 0.25, value: state.tolExp, format: (v) => fmt(v, 2), onInput: (v) => { state.tolExp = v; update(); } }),
      slider({ label: 'Mindeststufe l_min =', min: 0, max: 5, step: 1, value: state.minLevel, onInput: (v) => { state.minLevel = v; update(); } }),
      h('label', { class: 'checkbox' }, h('input', { type: 'checkbox', checked: true, onchange: (e) => { state.triangles = e.target.checked; update(); } }), ' Dreiecke zeigen'),
    ),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Start: das Trapez I₀ über [a, b]. Jede Verfeinerung setzt ein Dreieck auf eine Sehne. Ist dessen Fläche |I_Δ| kleiner als TOL, ist f dort gut durch die Sehne angenähert und das Intervall wird nicht weiter geteilt. Die Punkte sammeln sich dort, wo f stark gekrümmt ist. Die Mindeststufe verhindert, dass ein zufällig kleines erstes Dreieck die Suche zu früh beendet.'),
  );
  update();
}
