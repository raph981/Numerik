/**
 * Widget: Newton-Cotes-Formeln (Abschnitt 25.1, Bemerkung 25.1) – Interpolationspolynom,
 * Gewichte (mit negativen Gewichten für große n) und Fehler.
 */
import { h, setChildren, slider, segmented, controls, stat, table, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { newtonCotes, applyRule, ruleOrder, integrate } from '../lib/numerics/quadrature.js';
import { lagrangeEval } from '../lib/numerics/interpolation.js';

const A = 0;
const B = 2;
const FUNCTIONS = {
  exp: { label: 'eˣ sin(3x) + 2', f: (x) => Math.exp(x) * Math.sin(3 * x) + 2 },
  cubic: { label: 'x³ − 2x² + 1', f: (x) => x ** 3 - 2 * x * x + 1 },
  runge: { label: '1/(1 + 25(x−1)²)', f: (x) => 1 / (1 + 25 * (x - 1) ** 2) },
};
const NAMES = {
  closed: { 1: 'Trapezregel', 2: 'Simpsonregel', 3: '3/8-Regel' },
  open: { 0: 'Mittelpunktsregel' },
};

/** Gewichte von Newton-Cotes-Formeln sind rational: kleinster Nenner, der wᵢ ganzzahlig macht. */
function asFraction(w) {
  for (let d = 1; d <= 200000; d++) {
    const z = Math.round(w * d);
    if (Math.abs(w * d - z) < 1e-8 * d) return d === 1 ? String(z) : `${z}/${d}`;
  }
  return '–';
}

export default function mount(el) {
  const state = { variant: 'closed', n: 2, fn: 'exp' };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const weights = h('div');
  const nHolder = h('div');
  const grid = Array.from({ length: 401 }, (_, k) => A + ((B - A) * k) / 400);

  function nSlider() {
    const max = state.variant === 'closed' ? 10 : 6;
    const min = state.variant === 'closed' ? 1 : 0;
    state.n = Math.min(Math.max(state.n, min), max);
    setChildren(nHolder, slider({ label: 'n =', min, max, step: 1, value: state.n, onInput: (v) => { state.n = v; update(); } }).element);
  }

  function update() {
    const F = FUNCTIONS[state.fn];
    const open = state.variant === 'open';
    const rule = newtonCotes(state.n, { open });
    const xs = rule.nodes.map((s) => A + s * (B - A));
    const ys = xs.map(F.f);
    const exact = integrate(F.f, A, B);
    const approx = applyRule(rule, F.f, A, B);
    const sumAbs = rule.weights.reduce((s, w) => s + Math.abs(w), 0);

    renderPlot(plot, {
      height: 280,
      x: { label: 'x', min: A, max: B },
      y: { label: 'y' },
      series: [
        { data: grid.map((x) => [x, lagrangeEval(xs, ys, x)]), kind: 'area', label: `∫ p_${state.n} = Näherung`, color: 3 },
        { data: grid.map((x) => [x, F.f(x)]), label: 'f', color: 6, dashed: true },
        { data: xs.map((x, i) => [x, ys[i]]), kind: 'points', label: 'Stützstellen', color: 5, radius: 4.5 },
      ],
      ariaLabel: 'Newton-Cotes-Formel als Integral des Interpolationspolynoms',
    });
    setChildren(weights, table(
      ['i', 'xᵢ', 'Gewicht wᵢ', 'als Bruch'],
      rule.weights.map((w, i) => ({ className: w < 0 ? 'row--negative' : '', cells: [String(i), fmt(xs[i], 4), fmt(w, 6), asFraction(w).replace('-', '−')] })),
    ));
    const name = NAMES[state.variant][state.n];
    setChildren(stats,
      stat(name ?? `${open ? 'offene' : 'abgeschlossene'} Formel, n = ${state.n}`, fmt(approx, 10), `exakt ${fmt(exact, 10)}`),
      stat('Fehler', fmtExp(Math.abs(approx - exact), 2), `Ordnung ${ruleOrder(rule)} (Definition 25.3)`),
      stat('Σ|wᵢ|', fmt(sumAbs, 4), sumAbs > 1 + 1e-12 ? 'negative Gewichte: Kondition verschlechtert sich' : 'alle wᵢ > 0: Σ|wᵢ| = 1'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Variante', value: state.variant, options: [{ value: 'closed', label: 'abgeschlossen (a, b sind Stützstellen)' }, { value: 'open', label: 'offen' }], onChange: (v) => { state.variant = v; nSlider(); update(); } }),
      nHolder,
    ),
    controls(segmented({ label: 'Funktion f auf [0, 2]', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } })),
    stats,
    plot,
    weights,
    h('p', { class: 'widget__hint' }, 'Die Formel integriert das Interpolationspolynom exakt (blaue Fläche). Gewichte normiert auf Σwᵢ = 1. Rot markierte Zeilen haben negative Gewichte – bei abgeschlossenen Formeln ab n = 8, bei offenen schon ab n = 2. Beim Runge-Beispiel wird die Näherung für großes n wieder schlechter.'),
  );
  nSlider();
  update();
}
