/**
 * Widget: Gauß-Quadratur (Abschnitt 26.2) – Stützstellen als Nullstellen der Legendre-Polynome
 * und Exaktheitsgrad im Vergleich zu Newton-Cotes mit gleich vielen Stützstellen.
 */
import { h, setChildren, slider, controls, stat, table, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { legendre, gaussLegendre, newtonCotes, applyRule, ruleOrder } from '../lib/numerics/quadrature.js';

const FLOOR = 1e-17;

/** Fehler beim Integrieren von x^d über [−1, 1]. */
function monomialError(rule, d) {
  const exact = d % 2 === 0 ? 2 / (d + 1) : 0;
  return Math.abs(applyRule(rule, (x) => x ** d, -1, 1) - exact);
}

export default function mount(el) {
  const state = { points: 3 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const exactness = h('div', { class: 'plot-container' });
  const nodes = h('div');
  const grid = Array.from({ length: 401 }, (_, k) => -1 + k / 200);

  function update() {
    const m = state.points;
    const gauss = gaussLegendre(m);
    const roots = gauss.nodes.map((s) => 2 * s - 1);
    const nc = m === 1 ? newtonCotes(0, { open: true }) : newtonCotes(m - 1);

    renderPlot(plot, {
      height: 260,
      x: { label: 'x', min: -1, max: 1 },
      y: { label: 'P_k(x)', min: -1.1, max: 1.1 },
      series: [
        ...Array.from({ length: m }, (_, k) => ({ data: grid.map((x) => [x, legendre(k, x)]), color: 6, dashed: true, label: k === 0 ? (m === 1 ? 'P₀' : `P₀ … P${m - 1}`) : undefined })),
        { data: grid.map((x) => [x, legendre(m, x)]), label: `P${m} (Grad n + 1 = ${m})`, color: 1 },
        { data: roots.map((x) => [x, 0]), kind: 'points', label: 'Nullstellen λᵢ = Gauß-Stützstellen', color: 5, radius: 5 },
      ],
      ariaLabel: 'Legendre-Polynome und Gauß-Stützstellen',
    });

    const degrees = Array.from({ length: 2 * m + 4 }, (_, d) => d);
    renderPlot(exactness, {
      height: 230,
      x: { label: 'Grad d des Monoms xᵈ', min: -0.5, max: degrees.length - 0.5, ticks: degrees, format: String },
      y: { label: 'Fehler', log: true, min: FLOOR, max: 10 },
      series: [
        { data: degrees.map((d) => [d - 0.12, Math.max(monomialError(nc, d), FLOOR)]), kind: 'stem', label: `Newton-Cotes, ${m} Punkte`, color: 4 },
        { data: degrees.map((d) => [d + 0.12, Math.max(monomialError(gauss, d), FLOOR)]), kind: 'stem', label: `Gauß, ${m} Punkte`, color: 2 },
      ],
      bands: [{ from: -0.5, to: 2 * m - 0.5, label: 'Gauß exakt' }],
      ariaLabel: 'Exaktheitsgrad von Gauß- und Newton-Cotes-Formeln',
    });

    setChildren(nodes, table(
      ['i', 'Stützstelle λᵢ auf [−1, 1]', 'Gewicht wᵢ (Σ = 1)'],
      roots.map((x, i) => [String(i), x.toFixed(15), gauss.weights[i].toFixed(15)]),
      { className: 'data-table tableau' },
    ));
    setChildren(stats,
      stat('Ordnung Gauß', String(ruleOrder(gauss)), `= 2(n + 1) = ${2 * m}: exakt bis Grad ${2 * m - 1}`),
      stat('Ordnung Newton-Cotes', String(ruleOrder(nc)), 'gleich viele, aber äquidistante Stützstellen'),
      stat('Gewichte', gauss.weights.every((w) => w > 0) ? 'alle positiv' : 'nicht alle positiv', 'gut konditioniert für jedes n'),
      stat(`Fehler für x^${2 * m}`, fmtExp(monomialError(gauss, 2 * m), 2), 'Satz 26.3: Grad 2n + 2 geht nie exakt'),
    );
  }

  setChildren(el,
    controls(slider({ label: 'Stützstellen n + 1 =', min: 1, max: 8, step: 1, value: state.points, onInput: (v) => { state.points = v; update(); } })),
    stats,
    plot,
    exactness,
    nodes,
    h('p', { class: 'widget__hint' }, 'Mit n + 1 Stützstellen hat man 2n + 2 Freiheitsgrade (Stützstellen und Gewichte) – genug, um alle Polynome bis Grad 2n + 1 exakt zu integrieren. Die optimale Wahl der Stützstellen sind die Nullstellen von P_{n+1}; sie liegen symmetrisch und häufen sich zu den Rändern hin. Fehler um 10⁻¹⁶ sind reine Rundungsfehler – dort ist die Formel exakt.'),
  );
  update();
}
