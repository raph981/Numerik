/**
 * Widget: Fluch der Dimension – Tensorprodukt-Quadratur vs. Monte-Carlo-Integration (Abschnitt 26.3).
 */
import { h, setChildren, slider, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { tensorMidpoint, monteCarloSequence, seededRandom } from '../lib/numerics/quadrature.js';

/** f(x) = Π (π/2) sin(π x_j) auf [0, 1]^d, ∫ f = 1 in jeder Dimension. */
const f = (x) => x.reduce((p, v) => p * (Math.PI / 2) * Math.sin(Math.PI * v), 1);
const BUDGETS = Array.from({ length: 9 }, (_, k) => Math.round(10 ** (1 + k / 2))); // 10 … 10^5
const RUNS = 3;

/** Exponent −2/d gekürzt als Text (z. B. −1, −1/2, −2/3). */
const tensorRate = (d) => (d === 1 ? '−2' : d === 2 ? '−1' : d % 2 === 0 ? `−1/${d / 2}` : `−2/${d}`);

export default function mount(el) {
  const state = { d: 2 };
  const plot = h('div', { class: 'plot-container' });
  const stats = h('div', { class: 'stats' });

  function update() {
    const { d } = state;
    // Tensorprodukt: m Punkte je Richtung → m^d Auswertungen
    const ms = [...new Set(BUDGETS.map((N) => Math.max(1, Math.round(N ** (1 / d)))))].filter((m) => m ** d <= 2e5);
    const tensor = ms.map((m) => { const r = tensorMidpoint(f, d, m); return [r.evals, Math.abs(r.value - 1)]; });
    const mc = BUDGETS.map((N) => [N, 0]);
    for (let run = 0; run < RUNS; run++) {
      monteCarloSequence(f, d, BUDGETS, seededRandom(17 + 31 * run)).forEach((v, i) => { mc[i][1] += Math.abs(v - 1) / RUNS; });
    }
    const lastT = tensor.at(-1);
    renderPlot(plot, {
      height: 300,
      x: { label: 'Funktionsauswertungen N', log: true, min: 5, max: 2e5 },
      y: { label: 'Fehler', log: true, min: 1e-9, max: 10 },
      series: [
        { data: tensor, label: `Tensor-Mittelpunktsregel ∼ N^(${tensorRate(d)})`, color: 3 },
        { data: mc, label: `Monte Carlo (Mittel aus ${RUNS} Läufen) ∼ N^(−1/2)`, color: 5 },
        { data: BUDGETS.map((N) => [N, mc[0][1] * Math.sqrt(BUDGETS[0] / N)]), label: 'Steigung −1/2', color: 6, dashed: true },
        lastT ? { data: tensor.map(([N]) => [N, lastT[1] * (lastT[0] / N) ** (2 / d)]), label: `Steigung ${tensorRate(d)}`, color: 6, dashed: true } : null,
      ].filter(Boolean),
      ariaLabel: 'Fluch der Dimension',
    });
    setChildren(stats,
      stat('Dimension d', String(d), `[0, 1]^${d}, zwei Teilintervalle je Richtung = 2^${d} = ${2 ** d} Teilwürfel`),
      stat('Tensorprodukt mit 10⁵ Punkten', `≈ ${fmt(1e5 ** (1 / d), 1)} Punkte je Richtung`, `Fehler ∼ h² = N^(${tensorRate(d)}) ≈ ${fmtExp(1e5 ** (-2 / d), 1)}`),
      stat('Monte Carlo mit 10⁵ Punkten', `Fehler ∼ ${fmtExp(1e5 ** -0.5, 1)}`, 'unabhängig von d'),
    );
  }

  setChildren(el,
    controls(slider({ label: 'Dimension d =', min: 1, max: 8, step: 1, value: state.d, onInput: (v) => { state.d = v; update(); } })),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Integriert wird f(x) = Π (π/2)·sin(πxⱼ) mit ∫f = 1. Die Tensorprodukt-Regel hat Ordnung 2 in h, braucht aber N = (1/h)^d Punkte: Ihr Fehler fällt nur wie N^(−2/d). Monte Carlo konvergiert langsam wie N^(−1/2) – aber in jeder Dimension gleich. Ab d ≈ 4 gewinnt der Zufall.'),
  );
  update();
}
