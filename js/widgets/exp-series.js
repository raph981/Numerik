/**
 * Widget: Exponentialreihe in float- und double-Genauigkeit (Beispiel 2.1).
 * Macht sichtbar, dass für x < 0 riesige Zwischenterme mit wechselndem
 * Vorzeichen das (winzige) Ergebnis zerstören.
 */
import { h, setChildren, slider, segmented, controls, stat, table, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { correctDigits } from '../lib/numerics/iteration.js';
import { expSeries, expSeriesStable } from '../lib/numerics/series.js';

export default function mount(el, { x = -5 } = {}) {
  const state = { x, precision: 'float', stable: false };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const rows = h('div');

  function update() {
    const series = expSeries(state.x, state.precision);
    const naive = series.at(-1).S;
    const result = state.stable ? expSeriesStable(state.x, state.precision) : naive;
    const exact = Math.exp(state.x);
    const rel = Math.abs((result - exact) / exact);

    setChildren(stats,
      stat('Berechnet', fmtExp(result, 8), state.stable ? 'über 1/e^(−x)' : `nach n = ${series.at(-1).n} Termen`),
      stat('Exakt eˣ', fmtExp(exact, 8)),
      stat('Relativer Fehler', fmtExp(rel, 1)),
      stat('Gültige Ziffern', String(correctDigits(result, exact)), rel > 1 ? 'nicht einmal die Größenordnung stimmt' : ''),
    );

    renderPlot(plot, {
      height: 280,
      x: { label: 'Index n' },
      y: { label: 'Betrag', log: true },
      series: [
        { data: series.map((r) => [r.n, Math.abs(r.y)]), label: '|yₙ| = |x|ⁿ/n!  (Summand)', color: 2 },
        { data: series.map((r) => [r.n, Math.abs(r.S)]), label: '|Sₙ|  (Partialsumme)', color: 1 },
      ],
      markers: [{ y: exact, label: `eˣ = ${fmtExp(exact, 2)}` }],
      ariaLabel: 'Beträge der Summanden und Partialsummen',
    });

    const visible = series.length > 14 ? [...series.slice(0, 8), null, ...series.slice(-5)] : series;
    setChildren(rows, h('details', { class: 'widget__details' },
      h('summary', {}, 'Tabelle wie im Skript anzeigen'),
      table(['yₙ = xⁿ/n!', 'n', 'Sₙ'], visible.map((r) => (r
        ? [h('span', { class: 'mono' }, fmtExp(r.y, 15)), String(r.n), h('span', { class: 'mono' }, fmtExp(r.S, 15))]
        : ['⋮', '', '⋮']))),
    ));
  }

  setChildren(el,
    controls(
      slider({ label: 'x =', min: -20, max: 20, step: 1, value: state.x, onInput: (v) => { state.x = v; update(); } }),
      segmented({ label: 'Genauigkeit', value: state.precision, options: [{ value: 'float', label: 'float' }, { value: 'double', label: 'double' }], onChange: (v) => { state.precision = v; update(); } }),
      segmented({ label: 'Berechnung', value: 'naive', options: [{ value: 'naive', label: 'Reihe direkt' }, { value: 'stable', label: 'eˣ = 1/e⁻ˣ' }], onChange: (v) => { state.stable = v === 'stable'; update(); } }),
    ),
    stats,
    plot,
    rows,
  );
  update();
}
