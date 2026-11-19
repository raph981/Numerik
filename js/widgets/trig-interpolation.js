/**
 * Widget: Trigonometrische Interpolation periodischer Funktionen mit Spektrum
 * (Satz 20.3, Beispiele 20.4 und 20.7).
 */
import { h, setChildren, slider, segmented, controls, stat, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { realTrigInterpolation, amplitudeSpectrum, trigNodes } from '../lib/numerics/fourier.js';

const TWO_PI = 2 * Math.PI;
const sub = (n) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
const SIGNALS = {
  smooth: { label: 'e^{sin x} (glatt)', f: (x) => Math.exp(Math.sin(x)) },
  triangle: { label: 'Dreieck (stetig)', f: (x) => (x < Math.PI ? (2 / Math.PI) * (x - Math.PI / 2) : (2 / Math.PI) * ((3 * Math.PI) / 2 - x)) },
  square: {
    label: 'Rechteck (unstetig)',
    f: (x) => {
      const eps = 1e-12;
      if (Math.abs(x - Math.PI / 2) < eps || Math.abs(x - (3 * Math.PI) / 2) < eps) return 0; // Mittelwert an den Sprüngen
      return x > Math.PI / 2 && x < (3 * Math.PI) / 2 ? 1 : -1;
    },
  },
};

export default function mount(el) {
  const state = { signal: 'triangle', count: 8 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const spectrumPlot = h('div', { class: 'plot-container' });

  function update() {
    const S = SIGNALS[state.signal];
    const xs = trigNodes(state.count);
    const ys = xs.map(S.f);
    const t = realTrigInterpolation(ys);
    const grid = Array.from({ length: 600 }, (_, k) => (TWO_PI * k) / 599);
    renderPlot(plot, {
      height: 280,
      x: { label: 'x', min: 0, max: TWO_PI },
      y: { label: 'y', min: -1.8, max: state.signal === 'smooth' ? 3 : 1.8 },
      series: [
        { data: grid.map((x) => [x, S.f(x)]), label: 'f(x)', color: 6, dashed: true },
        { data: grid.map((x) => [x, t.evaluate(x)]), label: `trigonometrische Summe, ${state.count} Stützstellen`, color: 4 },
        { data: xs.map((x, i) => [x, ys[i]]), kind: 'points', label: 'Stützstellen xⱼ = 2πj/(n+1)', color: 1, radius: 4 },
      ],
      ariaLabel: 'Trigonometrische Interpolation',
    });
    const spec = amplitudeSpectrum(t);
    const floor = 1e-16;
    renderPlot(spectrumPlot, {
      height: 200,
      x: { label: 'Frequenz k', min: -0.5, max: t.m + 0.5 + t.theta },
      y: { label: '√(aₖ² + bₖ²)', log: true, min: 1e-8, max: 10 },
      series: [{ data: spec.map((v, k) => [k, Math.max(v, floor)]), kind: 'stem', color: 1 }],
      ariaLabel: 'Amplitudenspektrum',
    });
    const maxErr = Math.max(...grid.map((x) => Math.abs(S.f(x) - t.evaluate(x))));
    const jumpIsNode = state.count % 4 === 0;
    setChildren(stats,
      stat('max |f − tₙ|', fmtExp(maxErr, 2)),
      state.signal === 'square' ? stat('Sprungstellen π/2, 3π/2', jumpIsNode ? 'sind Stützstellen' : 'keine Stützstellen', jumpIsNode ? 'Mittelwert vorgegeben' : 'starkes Überschwingen (Gibbs)') : stat('Koeffizienten', `a₀ … a${sub(t.m + t.theta)}, b₁ … b${sub(t.m)}`, `${state.count} Stück`),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Signal', value: state.signal, options: Object.entries(SIGNALS).map(([k, s]) => ({ value: k, label: s.label })), onChange: (v) => { state.signal = v; update(); } }),
      slider({ label: 'Stützstellen n + 1 =', min: 3, max: 64, step: 1, value: state.count, onInput: (v) => { state.count = v; update(); } }),
    ),
    stats,
    plot,
    spectrumPlot,
    h('p', { class: 'widget__hint' }, 'Unten das Spektrum (logarithmisch): Bei der glatten Funktion fallen die Koeffizienten exponentiell, beim Dreieck wie 1/k², beim Rechteck nur wie 1/k. Beim Rechteck mit einer Stützstellenzahl, die kein Vielfaches von 4 ist, liegen die Sprünge zwischen den Stützstellen – das Gibbs-Phänomen wird sichtbar.'),
  );
  update();
}
