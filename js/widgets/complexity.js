/**
 * Widget: Rechenaufwand von Dreieckslösung (n²) und Gauß-Elimination (≈ ⅔n³), Lemma 7.5.
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { operationCounts } from '../lib/numerics/gauss.js';

const FLOPS = 1e10; // angenommene Rechenleistung: 10 GFLOP/s

function duration(seconds) {
  if (seconds < 1e-3) return `${fmt(seconds * 1e6, 2)} µs`;
  if (seconds < 1) return `${fmt(seconds * 1e3, 2)} ms`;
  if (seconds < 120) return `${fmt(seconds, 2)} s`;
  if (seconds < 7200) return `${fmt(seconds / 60, 1)} min`;
  if (seconds < 172800) return `${fmt(seconds / 3600, 1)} h`;
  if (seconds < 3.15e7 * 2) return `${fmt(seconds / 86400, 1)} Tage`;
  return `${fmt(seconds / 3.15e7, 1)} Jahre`;
}

export default function mount(el) {
  const state = { logN: 3 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const ns = Array.from({ length: 41 }, (_, i) => Math.round(10 ** (1 + i * 0.125)));

  function update() {
    const n = Math.round(10 ** state.logN);
    const { triangular, gaussLeading } = operationCounts(Math.min(n, 2000));
    const gauss = n <= 2000 ? operationCounts(n).gauss : gaussLeading * (n / 2000) ** 3;
    const tri = n <= 2000 ? triangular : n * n;
    setChildren(stats,
      stat('Dreieckssystem (n²)', `${fmt(tri, 3)} Op.`, duration(tri / FLOPS)),
      stat('Gauß-Elimination (≈ ⅔n³)', `${fmt(gauss, 3)} Op.`, duration(gauss / FLOPS)),
      stat('Verhältnis', `${fmt(gauss / tri, 3)}`, 'Elimination ist der teure Teil'),
    );
    renderPlot(plot, {
      height: 280,
      x: { label: 'Dimension n', log: true },
      y: { label: 'Rechenoperationen', log: true },
      series: [
        { data: ns.map((m) => [m, m * m]), label: 'Rückwärtseinsetzen: n²', color: 2 },
        { data: ns.map((m) => [m, (2 / 3) * m ** 3]), label: 'Gauß-Elimination: ⅔n³', color: 5 },
      ],
      markers: [{ x: n }],
      ariaLabel: 'Rechenaufwand in Abhängigkeit von n',
    });
  }

  setChildren(el,
    controls(slider({ label: 'n =', min: 1, max: 6, step: 0.05, value: state.logN, format: (v) => Math.round(10 ** v).toLocaleString('de-DE'), onInput: (v) => { state.logN = v; update(); } })),
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Zeiten bei angenommenen 10¹⁰ Operationen pro Sekunde. Verzehnfacht man n, dauert die Elimination 1000-mal so lange.'),
  );
  update();
}
