/**
 * Widget: Natürliche vs. gerade Rundung auf r Dezimalstellen (Beispiel 2.5).
 * Arbeitet auf Ziffernfolgen, damit z. B. 0,745 exakt dargestellt ist.
 */
import { h, setChildren, slider, textField, controls, table } from '../core/dom.js';
import { parseDecimal, roundDigits, ROUNDING_MODES } from '../lib/numerics/rounding.js';

const EXAMPLES = ['0.32642876', '0.74500', '0.75500', '2.5', '3.5', '0.12345'];

function renderDigits(digits, r) {
  return h('span', { class: 'mono' }, digits.map((d, i) => h('span', {
    class: i < r ? 'digit--kept' : i === r ? 'digit--decisive' : 'digit--dropped',
  }, String(d))));
}

function renderResult({ sign, e }, rounded) {
  const exponent = e + (rounded.carry ? 1 : 0);
  return h('span', { class: 'mono' }, `${sign < 0 ? '−' : ''}0.${rounded.digits.join('')} · 10`, h('sup', {}, String(exponent)));
}

export default function mount(el) {
  const state = { text: '0.74500', r: 2 };
  const field = textField({ label: 'Zahl (Dezimalschreibweise)', value: state.text, onInput: (v) => { state.text = v; update(); } });
  const output = h('div');

  function update() {
    const parsed = parseDecimal(state.text);
    if (!parsed) {
      setChildren(output, h('p', { class: 'widget__error' }, 'Bitte eine Dezimalzahl wie 0.745 eingeben.'));
      return;
    }
    const digits = [...parsed.digits];
    while (digits.length <= state.r) digits.push(0);
    const results = Object.keys(ROUNDING_MODES).map((mode) => ({ mode, ...roundDigits(digits, state.r, 10, mode) }));
    const tie = results[0].tie;

    setChildren(output,
      h('p', {}, 'Normierte Mantisse: 0.', renderDigits(digits, state.r), ` · 10`, h('sup', {}, String(parsed.e)),
        h('span', { class: 'widget__hint' }, '  (grün: behalten, orange: entscheidende Stelle mᵣ₊₁, grau: verworfen)')),
      table(['Rundungsart', 'Ergebnis', 'Begründung'], results.map((res) => [
        ROUNDING_MODES[res.mode],
        renderResult(parsed, res),
        res.mode === 'natural'
          ? `mᵣ₊₁ = ${digits[state.r]} ${digits[state.r] >= 5 ? '≥' : '<'} 5 → ${digits[state.r] >= 5 ? 'aufrunden' : 'abrunden'}`
          : tie
            ? `Gleichstand! mᵣ = ${digits[state.r - 1]} ist ${digits[state.r - 1] % 2 ? 'ungerade → aufrunden' : 'gerade → abrunden'}`
            : 'kein Gleichstand → zur nächstgelegenen Zahl',
      ])),
      tie ? h('p', { class: 'widget__hint' }, 'x liegt genau in der Mitte zwischen l(x) und r(x) – nur hier unterscheiden sich die Rundungsarten.') : null,
    );
  }

  setChildren(el,
    controls(
      field,
      slider({ label: 'Mantissenstellen r =', min: 1, max: 8, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
    ),
    h('div', { class: 'example-buttons' }, h('span', {}, 'Beispiele:'), EXAMPLES.map((ex) => h('button', {
      type: 'button', class: 'chip',
      onclick: () => { state.text = ex; field.input.value = ex; update(); },
    }, ex))),
    output,
  );
  update();
}
