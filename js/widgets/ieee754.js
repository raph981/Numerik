/**
 * Widget: IEEE-754-Bitdarstellung (Abschnitt 2.3). Bits lassen sich anklicken.
 */
import { h, setChildren, segmented, textField, controls, stat } from '../core/dom.js';
import { tex } from '../core/math.js';
import { FORMATS, decompose, fromBits, toBits } from '../lib/numerics/ieee754.js';

const KIND_LABELS = {
  zero: 'Null (c = 0, m = 0)',
  denormal: 'denormalisiert (c = 0, m ≠ 0)',
  normal: 'normalisiert',
  infinity: '∞ (Überlauf)',
  nan: 'NaN – not a number',
};

const EXAMPLES = [
  ['1', '1'], ['0,1', '0.1'], ['−2,5', '-2.5'], ['1/3', String(1 / 3)],
  ['größte', 'max'], ['kleinste normale', 'minNormal'], ['denormal', 'denormal'],
  ['∞', 'Infinity'], ['NaN', 'NaN'],
];

function specialValue(key, format) {
  const { exponentBits, mantissaBits } = FORMATS[format];
  const bits = {
    max: '0' + '1'.repeat(exponentBits - 1) + '0' + '1'.repeat(mantissaBits),
    minNormal: '0' + '0'.repeat(exponentBits - 1) + '1' + '0'.repeat(mantissaBits),
    denormal: '0' + '0'.repeat(exponentBits) + '0'.repeat(mantissaBits - 1) + '1',
  }[key];
  return bits ? fromBits(bits, format) : Number(key);
}

export default function mount(el) {
  const state = { format: 'single', bits: toBits(0.1, 'single') };
  const field = textField({ label: 'Zahl eingeben', value: '0.1', onInput: (v) => setValue(Number(v.replace(',', '.').replace('−', '-'))) });
  const bitsView = h('div', { class: 'bits' });
  const info = h('div');

  function setValue(x) {
    if (Number.isNaN(x) && field.value.trim().toLowerCase() !== 'nan') return;
    state.bits = toBits(x, state.format);
    render();
  }

  function toggleBit(i) {
    const b = state.bits;
    state.bits = b.slice(0, i) + (b[i] === '1' ? '0' : '1') + b.slice(i + 1);
    field.input.value = String(fromBits(state.bits, state.format));
    render();
  }

  function render() {
    const { exponentBits, bias, mantissaBits } = FORMATS[state.format];
    const d = decompose(state.bits, state.format);
    const groupOf = (i) => (i === 0 ? 'sign' : i <= exponentBits ? 'exponent' : 'mantissa');

    setChildren(bitsView, ...[...state.bits].map((bit, i) => h('button', {
      type: 'button',
      class: `bit bit--${groupOf(i)}`,
      title: `Bit ${state.bits.length - 1 - i} (${groupOf(i)}) umschalten`,
      onclick: () => toggleBit(i),
    }, bit)));

    let formula;
    if (d.kind === 'normal' || d.kind === 'denormal') {
      formula = tex(`(-1)^{${d.signBit}}\\cdot (${d.hiddenBit}.\\text{${d.mantissa.replace(/0+$/, '') || '0'}})_2 \\cdot 2^{${d.kind === 'normal' ? `${d.c}-${bias}` : `1-${bias}`}} = ${d.sign < 0 ? '-' : ''}${d.significand} \\cdot 2^{${d.e}}`, true);
    } else {
      formula = tex(`\\text{${KIND_LABELS[d.kind]}}`, true);
    }

    setChildren(info,
      h('div', { class: 'stats' },
        stat('Vorzeichen', d.signBit === '1' ? '− (1)' : '+ (0)'),
        stat('Exponent c', `${d.c}`, `${exponentBits} Bit, e = c − ${bias}`),
        stat('Klasse', KIND_LABELS[d.kind]),
        stat('gespeicherter Wert', Number.isFinite(d.value) ? d.value.toPrecision(20).replace(/\.?0+$/, '') : String(d.value), `${mantissaBits} + 1 (hidden bit) Mantissenbits`),
      ),
      h('div', { class: 'ieee__formula', html: formula }),
    );
  }

  setChildren(el,
    controls(
      field,
      segmented({
        label: 'Format', value: state.format,
        options: [{ value: 'single', label: 'single (32 Bit)' }, { value: 'double', label: 'double (64 Bit)' }],
        onChange: (v) => {
          const value = fromBits(state.bits, state.format);
          state.format = v;
          setValue(value);
        },
      }),
    ),
    h('div', { class: 'example-buttons' }, h('span', {}, 'Beispiele:'), EXAMPLES.map(([label, key]) => h('button', {
      type: 'button', class: 'chip',
      onclick: () => { const v = specialValue(key, state.format); field.input.value = String(v); setValue(v); },
    }, label))),
    h('div', { class: 'bits-legend' },
      h('span', { class: 'bit bit--sign' }, 'V'), ' Vorzeichen ',
      h('span', { class: 'bit bit--exponent' }, 'E'), ' Exponent ',
      h('span', { class: 'bit bit--mantissa' }, 'M'), ' Mantisse (ohne hidden bit)',
    ),
    bitsView,
    info,
  );
  render();
}
