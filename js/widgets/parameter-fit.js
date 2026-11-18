/**
 * Widget: Vorhersage mit drei Parameterschätzern (Abb. 1.2).
 * Interpolation, Ausgleichsgerade (lineares Ausgleichsproblem) und
 * nichtlinearer Schätzer (Newton-Verfahren).
 */
import { h, setChildren, slider, segmented, controls, table, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { CORONA_CASES, CORONA_DAYS, MEASURES_DAY, dayLabel } from '../data/corona.js';
import { interpolationFit, linearFit, nonlinearFit, nonlinearObjective } from '../lib/numerics/fitting.js';
import { exponentialSolution, doublingTime } from '../lib/numerics/growth.js';

const METHODS = [
  { key: 'interpolation', label: 'Interpolation', color: 2 },
  { key: 'linear', label: 'Ausgleichsgerade', color: 3 },
  { key: 'nonlinear', label: 'nichtl. Schätzer', color: 4 },
];

function fitAll(m) {
  const N = CORONA_CASES.slice(0, m);
  const t = CORONA_DAYS.slice(0, m);
  const linear = linearFit(N, t);
  const nonlinear = nonlinearFit(N, t, linear);
  return {
    N, t,
    interpolation: interpolationFit(N, t, m - 1),
    linear,
    nonlinear,
  };
}

export default function mount(el) {
  const total = CORONA_CASES.length;
  const state = { m: total - 5, scale: 'linear' };
  const plot = h('div', { class: 'plot-container' });
  const results = h('div');
  const newtonLog = h('div');

  function update() {
    const fits = fitAll(state.m);
    const lastTrainDay = CORONA_DAYS[state.m - 1];
    const curve = (p) => CORONA_DAYS.map((t) => [t, exponentialSolution(p.u0, p.lambda, 0, t)]);

    renderPlot(plot, {
      x: { label: 'Datum (2020)', format: dayLabel, ticks: CORONA_DAYS.filter((t) => t % 7 === 3) },
      y: { label: 'Infizierte Personen', log: state.scale === 'log', max: state.scale === 'log' ? undefined : CORONA_CASES.at(-1) * 2.5 },
      series: [
        { data: CORONA_DAYS.slice(0, state.m).map((t, i) => [t, CORONA_CASES[i]]), kind: 'points', label: 'Daten (zum Schätzen)', color: 1 },
        { data: CORONA_DAYS.slice(state.m).map((t, i) => [t, CORONA_CASES[state.m + i]]), kind: 'points', label: 'Daten (vorherzusagen)', color: 5, radius: 4 },
        ...METHODS.map((meth) => ({ data: curve(fits[meth.key]), label: meth.label, color: meth.color })),
      ],
      bands: state.m < total ? [{ from: lastTrainDay + 0.5, to: CORONA_DAYS.at(-1) + 1, label: 'Vorhersage' }] : [],
      markers: [{ x: MEASURES_DAY, label: 'Maßnahmen' }],
      ariaLabel: 'Vorhersage der Fallzahlen mit drei Schätzmethoden',
    });

    const testDays = CORONA_DAYS.slice(state.m);
    setChildren(results, table(
      ['Methode', 'u₀', 'λ', 'T₂ [Tage]', 'J_nl', testDays.length ? `Vorhersage ${dayLabel(CORONA_DAYS.at(-1))} (echt: ${fmt(CORONA_CASES.at(-1), 0)})` : '—'],
      METHODS.map((meth) => {
        const p = fits[meth.key];
        const prediction = exponentialSolution(p.u0, p.lambda, 0, CORONA_DAYS.at(-1));
        return [
          h('span', { class: `legend-dot series-${meth.color}` }, meth.label),
          fmt(p.u0, 2), fmt(p.lambda, 4), fmt(doublingTime(p.lambda), 2),
          fmtExp(nonlinearObjective(fits.N, fits.t, p), 2),
          testDays.length ? fmt(prediction, 0) : '—',
        ];
      }),
    ));

    const its = fits.nonlinear.iterations;
    setChildren(newtonLog, h('details', { class: 'widget__details' },
      h('summary', {}, `Newton-Iterationen des nichtlinearen Schätzers (${its.length - 1} Schritte, Start: Ausgleichsgerade)`),
      table(['k', 'u₀', 'λ', '‖F(xᵏ)‖', 'Dämpfung ηₖ'],
        its.map((it) => [String(it.k), fmt(it.u0, 6), fmt(it.lambda, 8), fmtExp(it.residual, 3), it.k ? String(it.eta) : '—'])),
    ));
  }

  setChildren(el,
    controls(
      slider({
        label: 'Daten bis einschließlich', min: 5, max: total, step: 1, value: state.m,
        format: (m) => `${dayLabel(CORONA_DAYS[m - 1])} (${m} Tage)`,
        onInput: (v) => { state.m = v; update(); },
      }),
      segmented({ label: 'y-Achse', value: state.scale, options: [{ value: 'linear', label: 'linear' }, { value: 'log', label: 'logarithmisch' }], onChange: (v) => { state.scale = v; update(); } }),
    ),
    plot,
    results,
    newtonLog,
  );
  update();
}
