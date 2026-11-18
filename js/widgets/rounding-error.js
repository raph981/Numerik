/**
 * Widget: Rundungsfehler in F(β, r, s) und die Schranken aus Lemma 2.7.
 */
import { h, setChildren, slider, segmented, textField, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { tex } from '../core/math.js';
import { digitChar } from '../lib/numerics/floatsystem.js';
import { roundToFloatSystem } from '../lib/numerics/rounding.js';

const S = 2; // Exponentenstellen: groß genug für alle Beispiele
const SAMPLES = 600;

export default function mount(el) {
  const state = { text: '3.14159265', beta: 10, r: 3, mode: 'natural' };
  const field = textField({ label: 'x =', value: state.text, onInput: (v) => { state.text = v; update(); } });
  const info = h('div');
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const { beta, r, mode } = state;
    const x = Number(state.text.replace(',', '.'));
    if (!Number.isFinite(x)) {
      setChildren(info, h('p', { class: 'widget__error' }, 'Bitte eine Zahl eingeben.'));
    } else {
      const res = roundToFloatSystem(x, beta, r, S, mode);
      const repr = `${res.sign < 0 ? '-' : ''}(0.${res.digits.map(digitChar).join('')})_{${beta}}\\cdot ${beta}^{${res.e}}`;
      setChildren(info,
        h('div', { class: 'ieee__formula', html: tex(`\\rd(x) = ${repr} = ${fmt(res.value, 10).replace(',', '{,}')}`, true) }),
        res.status !== 'ok' ? h('p', { class: 'widget__error' }, res.status === 'overflow' ? 'Überlauf: x liegt außerhalb des darstellbaren Bereichs.' : 'Unterlauf: x ist kleiner als die kleinste darstellbare Zahl.') : null,
        h('div', { class: 'stats' },
          stat('absoluter Fehler', fmtExp(res.absError, 2), `Schranke ½β^(e−r) = ${fmtExp(res.absBound, 2)}`),
          stat('relativer Fehler', fmtExp(res.relError, 2), `Schranke eps = ½β^(1−r) = ${fmtExp(res.relBound, 2)}`),
          stat('Ausschöpfung', `${fmt((res.relError / res.relBound) * 100, 1)} %`, 'rel. Fehler / eps'),
        ),
      );
    }

    // relativer Fehler über einen Bereich von x
    const lo = 1 / beta;
    const hi = beta ** 2;
    const data = [];
    for (let k = 0; k <= SAMPLES; k++) {
      const xs = lo * (hi / lo) ** (k / SAMPLES);
      data.push([xs, roundToFloatSystem(xs, beta, r, S, mode).relError]);
    }
    const eps = 0.5 * beta ** (1 - r);
    renderPlot(plot, {
      height: 260,
      x: { label: 'x (logarithmisch)', log: true, min: lo, max: hi },
      y: { label: 'relativer Rundungsfehler', min: 0, max: eps * 1.15 },
      series: [{ data, color: 1 }],
      markers: [{ y: eps, label: 'eps' }],
      ariaLabel: 'relativer Rundungsfehler in Abhängigkeit von x',
    });
  }

  setChildren(el,
    controls(
      field,
      slider({ label: 'Basis β =', min: 2, max: 10, step: 1, value: state.beta, onInput: (v) => { state.beta = v; update(); } }),
      slider({ label: 'Mantissenstellen r =', min: 1, max: 6, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
      segmented({ label: 'Rundung', value: state.mode, options: [{ value: 'natural', label: 'natürlich' }, { value: 'even', label: 'gerade' }], onChange: (v) => { state.mode = v; update(); } }),
    ),
    info,
    plot,
    h('p', { class: 'widget__hint' }, 'Der relative Fehler bleibt immer unter eps und ist direkt hinter jeder Potenz βᵉ⁻¹ am größten – dort ist die Mantisse klein.'),
  );
  update();
}
