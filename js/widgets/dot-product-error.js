/**
 * Widget: Rundungsfehler des Skalarprodukts in float vs. die Schranke n·eps (Lemma 9.1).
 */
import { h, setChildren, controls, segmented } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { createRng } from '../lib/numerics/special.js';

const EPS = 2 ** -24;
const NS = Array.from({ length: 25 }, (_, i) => Math.round(10 ** (1 + i * 0.2)));

function dotError(n, seed, signs) {
  const rnd = createRng(seed);
  const x = Array.from({ length: n }, () => Math.fround(signs ? rnd() : Math.abs(rnd())));
  const y = Array.from({ length: n }, () => Math.fround(signs ? rnd() : Math.abs(rnd())));
  let sf = 0;
  let exact = 0;
  let absSum = 0;
  for (let i = 0; i < n; i++) {
    sf = Math.fround(sf + Math.fround(x[i] * y[i]));
    exact += x[i] * y[i];
    absSum += Math.abs(x[i] * y[i]);
  }
  return Math.abs(sf - exact) / absSum; // Fehler relativ zu |x|·|y| wie in Lemma 9.1
}

export default function mount(el) {
  const state = { signs: false };
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const observed = NS.map((n) => [n, Math.max(...[1, 2, 3, 4, 5].map((s) => dotError(n, s * 97 + n, state.signs)))]);
    renderPlot(plot, {
      height: 300,
      x: { label: 'Länge n', log: true },
      y: { label: 'Fehler / (|x|·|y|)', log: true, min: 1e-9, max: 1e-1 },
      series: [
        { data: NS.map((n) => [n, n * EPS]), label: 'Schranke n·eps (Lemma 9.1)', color: 5 },
        { data: NS.map((n) => [n, Math.sqrt(n) * EPS]), label: '√n·eps (typisch)', color: 6, dashed: true },
        { data: observed, kind: 'points', label: 'beobachtet (max. aus 5 Versuchen)', color: 1, radius: 3.5 },
      ],
      ariaLabel: 'Fehler des Skalarprodukts in Abhängigkeit von n',
    });
  }

  setChildren(el,
    controls(segmented({ label: 'Einträge', value: 'pos', options: [{ value: 'pos', label: 'positiv' }, { value: 'mixed', label: 'mit Vorzeichen' }], onChange: (v) => { state.signs = v === 'mixed'; update(); } })),
    plot,
    h('p', { class: 'widget__hint' }, 'Die Schranke nimmt an, dass sich alle Rundungsfehler in dieselbe Richtung addieren. In Wirklichkeit heben sie sich teilweise auf – der Fehler wächst eher wie √n.'),
  );
  update();
}
