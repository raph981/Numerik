/**
 * Widget: Absoluter und relativer Abstand benachbarter Fließkommazahlen
 * (Beobachtung 2.4). Der relative Abstand pendelt zwischen β^{−r} und β^{1−r}.
 */
import { h, setChildren, slider, segmented, controls } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';

const EXPONENTS = [-1, 0, 1, 2];

function spacingData(beta, r) {
  const absolute = [];
  const relative = [];
  for (const e of EXPONENTS) {
    for (let M = beta ** (r - 1); M < beta ** r; M++) {
      const x = M * beta ** (e - r);
      absolute.push([x, beta ** (e - r)]);
      relative.push([x, 1 / M]);
    }
  }
  return { absolute, relative };
}

export default function mount(el) {
  const state = { beta: 2, r: 3, mode: 'relative' };
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const { beta, r, mode } = state;
    const data = spacingData(beta, r);
    const relativeMode = mode === 'relative';
    renderPlot(plot, {
      x: { label: 'x (logarithmisch)', log: true, min: beta ** (EXPONENTS[0] - 1), max: beta ** EXPONENTS.at(-1) },
      y: relativeMode
        ? { label: '|x′ − x| / |x|', log: true, min: beta ** -r / 1.6, max: beta ** (1 - r) * 1.6 }
        : { label: '|x′ − x|', log: true },
      series: [{ data: relativeMode ? data.relative : data.absolute, kind: 'points', color: relativeMode ? 1 : 2, radius: 2.5 }],
      markers: relativeMode
        ? [{ y: beta ** (1 - r), label: 'β^(1−r)' }, { y: beta ** -r, label: 'β^(−r)' }]
        : [],
      ariaLabel: 'Abstand benachbarter Fließkommazahlen',
    });
  }

  setChildren(el,
    controls(
      slider({ label: 'Basis β =', min: 2, max: 10, step: 1, value: state.beta, onInput: (v) => { state.beta = v; update(); } }),
      slider({ label: 'Mantissenstellen r =', min: 1, max: 4, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
      segmented({ label: 'Abstand', value: state.mode, options: [{ value: 'absolute', label: 'absolut' }, { value: 'relative', label: 'relativ' }], onChange: (v) => { state.mode = v; update(); } }),
    ),
    plot,
    h('p', { class: 'widget__hint' }, 'Absolut: Treppenfunktion, die sich pro Exponent um den Faktor β vergrößert. Relativ: Sägezahn – je kleiner β, desto weniger schwankt er.'),
  );
  update();
}
