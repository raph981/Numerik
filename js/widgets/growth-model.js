/**
 * Widget: vom diskreten Wachstumsmodell (1.1) zur Differentialgleichung (1.2)
 * und Vergleich mit dem logistischen Modell.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { discreteGrowth, exponentialSolution, logisticSolution, doublingTime } from '../lib/numerics/growth.js';

const T_END = 10;
const U0 = 1;

function sample(f, n = 200) {
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = (k / n) * T_END;
    return [t, f(t)];
  });
}

export default function mount(el) {
  const state = { lambda: 0.5, dt: 1, K: 50, scale: 'linear' };
  const plot = h('div', { class: 'plot-container' });
  const stats = h('div', { class: 'stats' });

  function update() {
    const { lambda, dt, K } = state;
    const discrete = discreteGrowth(U0, lambda, dt, 0, T_END);
    const exactEnd = exponentialSolution(U0, lambda, 0, T_END);
    const discreteEnd = discrete.at(-1)[1];

    renderPlot(plot, {
      x: { label: 'Zeit t' },
      y: { label: 'u(t)', log: state.scale === 'log' },
      series: [
        { data: sample((t) => exponentialSolution(U0, lambda, 0, t)), label: 'Exakt: u₀·exp(λt)', color: 1 },
        { data: discrete, label: `Diskret mit Δt = ${dt}`, kind: 'line', color: 2, dashed: true },
        { data: discrete, kind: 'points', color: 2 },
        { data: sample((t) => logisticSolution(U0, lambda, K, 0, t)), label: `Logistisch (K = ${K})`, color: 3 },
      ],
      ariaLabel: 'Vergleich exponentielles, diskretes und logistisches Wachstum',
    });

    setChildren(stats,
      stat('u(10) exakt', fmt(exactEnd, 2)),
      stat('u(10) diskret', fmt(discreteEnd, 2), `rel. Fehler ${fmt(Math.abs(discreteEnd - exactEnd) / exactEnd * 100, 1)} %`),
      stat('Verdopplungszeit', `${fmt(doublingTime(lambda), 2)} Tage`, 'T₂ = ln 2 / λ'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'Wachstumsrate λ =', min: 0.05, max: 1, step: 0.05, value: state.lambda, format: (v) => v.toFixed(2), onInput: (v) => { state.lambda = v; update(); } }),
      slider({ label: 'Zeitschritt Δt =', min: 0.05, max: 2, step: 0.05, value: state.dt, format: (v) => v.toFixed(2), onInput: (v) => { state.dt = v; update(); } }),
      slider({ label: 'Kapazität K =', min: 5, max: 200, step: 5, value: state.K, onInput: (v) => { state.K = v; update(); } }),
      segmented({ label: 'Skala', value: state.scale, options: [{ value: 'linear', label: 'linear' }, { value: 'log', label: 'logarithmisch' }], onChange: (v) => { state.scale = v; update(); } }),
    ),
    stats,
    plot,
  );
  update();
}
