/**
 * Widget: Coronafallzahlen in linearer und logarithmischer Darstellung (Abb. 1.1).
 */
import { h, setChildren, segmented, controls } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { CORONA_CASES, CORONA_DAYS, MEASURES_DAY, dayLabel } from '../data/corona.js';

export default function mount(el) {
  let scale = 'linear';
  const plot = h('div', { class: 'plot-container' });
  const hint = h('p', { class: 'widget__hint' });

  function update() {
    const log = scale === 'log';
    renderPlot(plot, {
      x: { label: 'Datum (2020)', format: dayLabel, ticks: CORONA_DAYS.filter((t) => t % 7 === 3) },
      y: { label: 'Infizierte Personen', log },
      series: [{ data: CORONA_DAYS.map((t, i) => [t, CORONA_CASES[i]]), kind: 'points', label: 'Infizierte', color: 1 }],
      markers: [{ x: MEASURES_DAY, label: 'Maßnahmen (22.03.)' }],
      ariaLabel: 'Coronafallzahlen in Deutschland ab 24.02.2020',
    });
    hint.textContent = log
      ? 'Bei exponentiellem Wachstum läge ln Nᵢ = ln u₀ + λ·i auf einer Geraden. Das ist nur am Anfang ungefähr so – die Kurve flacht ab.'
      : 'Auf den ersten Blick sieht das exponentiell aus. Schalten Sie auf die logarithmische Skala, um das zu prüfen!';
  }

  setChildren(el,
    controls(segmented({
      label: 'y-Achse', value: scale,
      options: [{ value: 'linear', label: 'linear' }, { value: 'log', label: 'logarithmisch' }],
      onChange: (v) => { scale = v; update(); },
    })),
    plot,
    hint,
  );
  update();
}
