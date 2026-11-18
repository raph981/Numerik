/**
 * Widget: Stellenwertsystem / Festkommadarstellung zu beliebiger Basis β.
 */
import { h, setChildren, slider, textField, controls } from '../core/dom.js';
import { positionalDigits, digitChar } from '../lib/numerics/floatsystem.js';
import { tex } from '../core/math.js';

const FRACTION_DIGITS = 12;

export default function mount(el, { value = '13.375' } = {}) {
  const state = { text: value, beta: 2 };
  const result = h('div', { class: 'positional' });

  function update() {
    const x = Number(state.text.replace(',', '.'));
    if (!Number.isFinite(x) || Math.abs(x) > 1e12) {
      setChildren(result, h('p', { class: 'widget__error' }, 'Bitte eine Zahl (|x| ≤ 10¹²) eingeben.'));
      return;
    }
    const { integer, fraction } = positionalDigits(x, state.beta, FRACTION_DIGITS);
    const n = integer.length - 1;
    const cells = [
      ...integer.map((d, i) => ({ d, p: n - i })),
      ...fraction.map((d, i) => ({ d, p: -(i + 1) })),
    ];
    const truncated = fraction.length === FRACTION_DIGITS;
    const sign = x < 0 ? '−' : '';

    const digitRow = h('div', { class: 'digit-row' }, cells.flatMap(({ d, p }, i) => [
      i === integer.length ? h('span', { class: 'digit-row__point' }, ',') : null,
      h('div', { class: `digit-cell${d === 0 ? ' digit-cell--zero' : ''}` },
        h('span', { class: 'digit-cell__digit' }, digitChar(d)),
        h('span', { class: 'digit-cell__weight', html: tex(`${state.beta}^{${p}}`) }),
      ),
    ]));

    const terms = cells.filter((c) => c.d !== 0).map(({ d, p }) => `${digitChar(d)}\\cdot ${state.beta}^{${p}}`);
    setChildren(result,
      h('p', { class: 'positional__number' }, `${sign}(${integer.map(digitChar).join('')}${fraction.length ? ',' + fraction.map(digitChar).join('') : ''}${truncated ? '…' : ''})`, h('sub', {}, String(state.beta))),
      digitRow,
      h('div', { class: 'positional__sum', html: tex(`|x| = ${terms.join(' + ') || '0'}${truncated ? ' + \\dots' : ''}`, true) }),
      truncated ? h('p', { class: 'widget__hint' }, `Die Darstellung bricht nicht ab (oder ist länger als ${FRACTION_DIGITS} Stellen) – mit endlich vielen Stellen bleibt ein Fehler.`) : null,
    );
  }

  setChildren(el,
    controls(
      textField({ label: 'Zahl x (dezimal)', value: state.text, onInput: (v) => { state.text = v; update(); } }),
      slider({ label: 'Basis β =', min: 2, max: 16, step: 1, value: state.beta, onInput: (v) => { state.beta = v; update(); } }),
    ),
    result,
  );
  update();
}
