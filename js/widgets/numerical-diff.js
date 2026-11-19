/**
 * Widget: Numerische Differentiation – Abschneidefehler gegen Rundungsfehler
 * (Abschnitt 18.2, Beispiel 18.6: zweite Ableitung von sinh bei x = 0,6).
 */
import { h, setChildren, segmented, controls, table } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { DIFFERENCE_QUOTIENTS } from '../lib/numerics/interpolation.js';
import { correctDigits } from '../lib/numerics/iteration.js';

const X = 0.6;
const EPS = 2 ** -53;
/** Teilt eine Zahldarstellung nach `digits` signifikanten Ziffern (führende Nullen zählen nicht). */
function splitDigits(text, digits) {
  let seen = 0;
  let started = false;
  let cut = 0;
  while (cut < text.length && seen < digits) {
    const c = text[cut];
    if (/\d/.test(c) && (started || c !== '0')) { started = true; seen++; }
    cut++;
  }
  return [text.slice(0, cut), text.slice(cut)];
}

const HS = Array.from({ length: 57 }, (_, i) => 10 ** (-i / 4)); // 1 … 1e-14

export default function mount(el) {
  const state = { quotient: 'second' };
  const plot = h('div', { class: 'plot-container' });
  const info = h('div');

  function update() {
    // sinh'' = sinh, sinh' = cosh
    const exactFor = (q) => (q.derivative === 2 ? Math.sinh(X) : Math.cosh(X));
    const floor = 1e-16;
    const series = Object.entries(DIFFERENCE_QUOTIENTS).map(([k, q], idx) => ({
      data: HS.map((h0) => [h0, Math.max(Math.abs(q.apply(Math.sinh, X, h0) - exactFor(q)), floor)]),
      label: q.label,
      color: [5, 2, 4][idx],
      dashed: k !== state.quotient,
    }));
    const q = DIFFERENCE_QUOTIENTS[state.quotient];
    const optimalH = EPS ** (1 / (q.order + q.derivative));
    renderPlot(plot, {
      height: 300,
      x: { label: 'Schrittweite h', log: true, min: 1e-14, max: 1 },
      y: { label: 'Fehler', log: true, min: floor, max: 1e6 },
      series,
      markers: [{ x: optimalH, label: `h ≈ eps^(1/${q.order + q.derivative})` }],
      ariaLabel: 'Fehler der Differenzenquotienten in Abhängigkeit von h',
    });

    const exact = exactFor(q);
    setChildren(info, table(['h', 'Differenzenquotient', 'korrekte Stellen', 'Fehlerursache'], [-1, -2, -3, -4, -5, -6, -8, -10].map((p) => {
      const h0 = 10 ** p;
      const val = q.apply(Math.sinh, X, h0);
      const digits = correctDigits(val, exact);
      const [ok, bad] = splitDigits(val.toPrecision(12), digits);
      return [`10${String(p).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`, h('span', { class: 'mono' }, h('span', { class: 'digits-ok' }, ok), h('span', { class: 'digits-bad' }, bad)), String(digits), h0 > optimalH * 3 ? 'Abschneidefehler O(hᵖ)' : h0 < optimalH / 3 ? 'Auslöschung' : 'nahe am Optimum'];
    })), h('p', { class: 'widget__hint' }, `Exakter Wert: ${exact.toPrecision(13)}.`));
  }

  setChildren(el,
    controls(segmented({ label: 'Differenzenquotient (Tabelle)', value: state.quotient, options: Object.entries(DIFFERENCE_QUOTIENTS).map(([k, dq]) => ({ value: k, label: dq.label.split(' ')[0] })), onChange: (v) => { state.quotient = v; update(); } })),
    plot,
    info,
    h('p', { class: 'widget__hint' }, 'Rechts: Der Abschneidefehler fällt wie h (vorwärts) bzw. h² (zentral). Links: Der Zähler ist eine Differenz fast gleicher Zahlen, der Rundungsfehler ≈ eps/h bzw. eps/h² wächst. Dazwischen liegt eine optimale Schrittweite – kleiner ist nicht besser!'),
  );
  update();
}
