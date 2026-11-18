/**
 * Widget: Auslöschung Stelle für Stelle (Beispiel 3.11 c).
 */
import { h, setChildren, slider, textField, controls, stat, fmtExp, fmt } from '../core/dom.js';
import { parseDecimal, roundDigits } from '../lib/numerics/rounding.js';

/** Rundet eine Dezimalzeichenkette auf r Stellen; liefert Ziffern, Exponent und Wert. */
function roundString(str, r) {
  const parsed = parseDecimal(str);
  if (!parsed) return null;
  const digits = [...parsed.digits];
  while (digits.length <= r) digits.push(0);
  const res = roundDigits(digits, r, 10, 'natural');
  const e = parsed.e + (res.carry ? 1 : 0);
  const value = parsed.sign * Number(`0.${res.digits.join('')}e${e}`);
  const exact = parsed.sign * Number(`0.${parsed.digits.join('')}e${parsed.e}`);
  return { digits: res.digits, e, value, exact, sign: parsed.sign };
}

/** Zeile mit Ziffern, an einer gemeinsamen Kommaposition ausgerichtet. */
function digitLine(label, value, decimals, className = '') {
  return h('div', { class: 'cancel__row' },
    h('span', { class: 'cancel__label' }, label),
    h('span', { class: `mono cancel__digits ${className}` }, value.toFixed(decimals).padStart(14, ' ')));
}

export default function mount(el) {
  const state = { x1: '11.258762', x2: '11.244891', r: 4 };
  const output = h('div');

  function update() {
    const a = roundString(state.x1, state.r);
    const b = roundString(state.x2, state.r);
    if (!a || !b) {
      setChildren(output, h('p', { class: 'widget__error' }, 'Bitte zwei Dezimalzahlen eingeben.'));
      return;
    }
    const exactDiff = a.exact - b.exact;
    const diff = a.value - b.value; // Differenz zweier Maschinenzahlen gleicher Größe ist exakt
    const rel = Math.abs((diff - exactDiff) / exactDiff);
    const eps = 0.5 * 10 ** (1 - state.r);
    const decimals = Math.max(0, state.r - Math.max(a.e, b.e));
    const exactDecimals = Math.max(decimals, (state.x1.split('.')[1] ?? '').length, (state.x2.split('.')[1] ?? '').length);

    setChildren(output,
      h('div', { class: 'widget-columns' },
        h('div', { class: 'cancel' },
          h('p', { class: 'control__label' }, 'Exakt'),
          digitLine('x₁', a.exact, exactDecimals),
          digitLine('− x₂', b.exact, exactDecimals),
          digitLine('=', exactDiff, exactDecimals, 'digits-ok'),
        ),
        h('div', { class: 'cancel' },
          h('p', { class: 'control__label' }, `Im Rechner, F(10, ${state.r})`),
          digitLine('rd(x₁)', a.value, decimals),
          digitLine('− rd(x₂)', b.value, decimals),
          digitLine('=', diff, decimals, rel > 0.01 ? 'digits-bad-strong' : 'digits-ok'),
        ),
      ),
      h('div', { class: 'stats' },
        stat('relativer Fehler der Eingaben', `≤ ${fmtExp(eps, 1)}`, 'nur eine Rundung je Zahl'),
        stat('relativer Fehler des Ergebnisses', fmt(rel, 3), `≈ ${fmt(rel / eps, 0)} · eps`),
      ),
      h('p', { class: 'widget__hint' }, 'Die Subtraktion selbst ist exakt! Aber die führenden, übereinstimmenden Ziffern heben sich weg – übrig bleiben genau die Stellen, die durch das Runden der Eingaben verfälscht wurden.'),
    );
  }

  setChildren(el,
    controls(
      textField({ label: 'x₁', value: state.x1, onInput: (v) => { state.x1 = v; update(); } }),
      textField({ label: 'x₂', value: state.x2, onInput: (v) => { state.x2 = v; update(); } }),
      slider({ label: 'Mantissenstellen r =', min: 2, max: 8, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
    ),
    output,
  );
  update();
}
