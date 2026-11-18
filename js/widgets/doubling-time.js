/**
 * Widget: Verdopplungszeiten mit gleitendem Fenster (Abb. 1.3).
 */
import { h, setChildren, slider, controls } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { CORONA_CASES, CORONA_DAYS, MEASURES_DAY, dayLabel } from '../data/corona.js';
import { naiveDoublingTimes, windowedDoublingTimes } from '../lib/numerics/fitting.js';

export default function mount(el) {
  const state = { w: 4 };
  const plot = h('div', { class: 'plot-container' });
  const naive = naiveDoublingTimes(CORONA_CASES, CORONA_DAYS);

  function update() {
    renderPlot(plot, {
      x: { label: 'Datum (2020)', format: dayLabel, ticks: CORONA_DAYS.filter((t) => t % 7 === 3), min: 0, max: CORONA_DAYS.at(-1) },
      y: { label: 'Verdopplungszeit [Tage]', min: 0 },
      series: [
        { data: windowedDoublingTimes(CORONA_CASES, CORONA_DAYS, state.w), label: `Schätzung mit w = ${state.w}`, color: 4 },
        { data: naive, label: 'naiv (ganze Tage)', color: 3, dashed: true },
      ],
      markers: [{ x: MEASURES_DAY, label: 'Maßnahmen' }],
      ariaLabel: 'Verdopplungszeiten der Coronafälle',
    });
  }

  setChildren(el,
    controls(slider({ label: 'Fenstergröße w =', min: 3, max: 12, step: 1, value: state.w, onInput: (v) => { state.w = v; update(); } })),
    plot,
    h('p', { class: 'widget__hint' }, 'Größere Fenster glätten die Kurve, reagieren aber träger auf Änderungen der Wachstumsrate.'),
  );
  update();
}
