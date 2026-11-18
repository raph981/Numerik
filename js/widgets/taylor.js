/**
 * Widget: Taylorpolynome und das Verhalten des Restglieds O(h^{r+1}) (Satz 3.1).
 */
import { h, setChildren, slider, segmented, controls } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { FUNCTIONS, taylorPolynomial, remainderSeries } from '../lib/numerics/taylor.js';

const HS = Array.from({ length: 25 }, (_, i) => 10 ** (-i / 6)); // 1 … 1e-4

export default function mount(el) {
  const state = { fn: 'exp', x0: 0, r: 3 };
  const plotF = h('div', { class: 'plot-container' });
  const plotR = h('div', { class: 'plot-container' });
  const x0Slider = slider({ label: 'Entwicklungspunkt x =', min: -2, max: 2, step: 0.1, value: state.x0, format: (v) => v.toFixed(1), onInput: (v) => { state.x0 = v; update(); } });

  function update() {
    const fn = FUNCTIONS[state.fn];
    const [lo, hi] = fn.domain;
    // ln(1+x) ist nur für x > −1 definiert: Entwicklungspunkt passend begrenzen
    const x0 = state.fn === 'log' ? Math.max(state.x0, -0.5) : state.x0;
    const xs = Array.from({ length: 301 }, (_, k) => lo + ((hi - lo) * k) / 300);
    const fVals = xs.map((x) => [x, fn.f(x)]);
    const yMin = Math.min(...fVals.map((p) => p[1]));
    const yMax = Math.max(...fVals.map((p) => p[1]));
    const pad = (yMax - yMin) * 0.3;

    renderPlot(plotF, {
      height: 280,
      x: { label: 'z', min: lo, max: hi },
      y: { label: 'Wert', min: yMin - pad, max: yMax + pad },
      series: [
        { data: fVals, label: `f(z) = ${fn.label}`, color: 1 },
        { data: xs.map((z) => [z, taylorPolynomial(fn, x0, state.r, z)]), label: `Taylorpolynom vom Grad ${state.r}`, color: 4 },
        { data: [[x0, fn.f(x0)]], kind: 'points', color: 5, radius: 5 },
      ],
      ariaLabel: 'Funktion und Taylorpolynom',
    });

    const remainder = remainderSeries(fn, x0, state.r, HS).filter(([, e]) => e > 1e-16);
    const ref = remainder.length ? remainder[Math.floor(remainder.length / 2)] : [1, 1];
    renderPlot(plotR, {
      height: 260,
      x: { label: 'Schrittweite h', log: true, min: 1e-4, max: 1 },
      y: { label: '|f(x+h) − Taylorpolynom|', log: true },
      series: [
        { data: remainder, kind: 'points', label: 'Restglied', color: 4 },
        { data: HS.map((hh) => [hh, ref[1] * (hh / ref[0]) ** (state.r + 1)]), label: `Referenz ∼ h^${state.r + 1}`, color: 6, dashed: true },
      ],
      ariaLabel: 'Restglied in Abhängigkeit von h, doppelt logarithmisch',
    });
  }

  setChildren(el,
    controls(
      segmented({ label: 'Funktion', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, f]) => ({ value: k, label: f.label })), onChange: (v) => { state.fn = v; update(); } }),
      x0Slider,
      slider({ label: 'Grad r =', min: 0, max: 8, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
    ),
    plotF,
    plotR,
    h('p', { class: 'widget__hint' }, 'Doppelt logarithmisch wird h^(r+1) zur Geraden mit Steigung r+1: Halbiert man h, sinkt der Fehler um den Faktor 2^(r+1). Ganz links begrenzen Rundungsfehler die Genauigkeit. Sonderfall sin x um 0: Dort verschwinden die geraden Ableitungen, der Fehler ist dann sogar eine Ordnung besser.'),
  );
  update();
}
