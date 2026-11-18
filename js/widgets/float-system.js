/**
 * Widget: Das Fließkommasystem F(β, r, s) auf dem Zahlenstrahl (Beispiel 2.3).
 */
import { h, setChildren, slider, segmented, controls, stat, fmt } from '../core/dom.js';
import { tex } from '../core/math.js';
import {
  countFloats, enumeratePositiveFloats, floatRange, digitChar,
} from '../lib/numerics/floatsystem.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDTH = 640;
const HEIGHT = 90;
const PAD = 24;
const MAX_LISTED = 40;

function svg(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

/** Zeichnet die Elemente (positiv und negativ) als Striche auf einem Zahlenstrahl. */
function numberLine(values, maxAbs) {
  const sx = (v) => PAD + ((v + maxAbs) / (2 * maxAbs)) * (WIDTH - 2 * PAD);
  const root = svg('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, class: 'number-line', role: 'img', 'aria-label': 'Fließkommazahlen auf dem Zahlenstrahl' });
  root.append(svg('line', { x1: PAD - 10, x2: WIDTH - PAD + 10, y1: 45, y2: 45, class: 'number-line__axis' }));
  const ticks = values.flatMap((v) => (v === 0 ? [0] : [v, -v]))
    .map((v) => `M${sx(v).toFixed(2)},33V57`).join('');
  root.append(svg('path', { d: ticks, class: 'number-line__ticks' }));
  for (const v of [-maxAbs, 0, maxAbs]) {
    root.append(svg('text', { x: sx(v), y: 78, 'text-anchor': 'middle', class: 'number-line__label' }, fmt(v, 4)));
  }
  return root;
}

function formatElement({ value, digits, e }, beta) {
  if (value === 0) return '0';
  return tex(`(0.${digits.map(digitChar).join('')})_{${beta}}\\cdot ${beta}^{${e}} = ${fmt(value, 6).replace(',', '{,}')}`);
}

export default function mount(el, { beta = 2, r = 2, s = 1 } = {}) {
  const state = { beta, r, s, zoom: 'all' };
  const stats = h('div', { class: 'stats' });
  const line = h('div', { class: 'plot-container' });
  const listing = h('div');

  function update() {
    const { beta: b, r: rr, s: ss } = state;
    const range = floatRange(b, rr, ss);
    const count = countFloats(b, rr, ss);
    const elements = enumeratePositiveFloats(b, rr, ss);

    setChildren(stats,
      stat('Anzahl Elemente', count.toLocaleString('de-DE'), '2(β−1)β^(r−1)(2β^s−1)+1'),
      stat('Größte Zahl X₊', fmt(range.largest, 6)),
      stat('Kleinste pos. Zahl x₊', fmt(range.smallestPositive, 6)),
      stat('Exponenten', `${range.eMin} … ${range.eMax}`),
    );

    if (!elements) {
      setChildren(line, h('p', { class: 'widget__hint' }, 'Zu viele Elemente zum Zeichnen – bitte kleinere Parameter wählen.'));
      setChildren(listing);
      return;
    }

    const maxAbs = state.zoom === 'all' ? range.largest : Math.min(range.largest, 1);
    const shown = elements.filter((x) => x.value <= maxAbs);
    setChildren(line, numberLine(shown.map((x) => x.value), maxAbs));

    if (elements.length <= MAX_LISTED) {
      setChildren(listing, h('details', { class: 'widget__details' },
        h('summary', {}, 'Alle nichtnegativen Elemente auflisten'),
        h('ul', { class: 'element-list' }, elements.map((x) => h('li', { html: formatElement(x, b) }))),
      ));
    } else {
      setChildren(listing);
    }
  }

  setChildren(el,
    controls(
      slider({ label: 'Basis β =', min: 2, max: 10, step: 1, value: state.beta, onInput: (v) => { state.beta = v; update(); } }),
      slider({ label: 'Mantissenstellen r =', min: 1, max: 4, step: 1, value: state.r, onInput: (v) => { state.r = v; update(); } }),
      slider({ label: 'Exponentenstellen s =', min: 1, max: 2, step: 1, value: state.s, onInput: (v) => { state.s = v; update(); } }),
      segmented({ label: 'Ausschnitt', value: state.zoom, options: [{ value: 'all', label: '[−X₊, X₊]' }, { value: 'unit', label: '[−1, 1]' }], onChange: (v) => { state.zoom = v; update(); } }),
    ),
    stats,
    line,
    h('p', { class: 'widget__hint' }, 'Beobachten Sie: Nahe der Null liegen die Zahlen dicht, weiter außen immer gröber – und direkt um die Null herum klafft eine Lücke.'),
    listing,
  );
  update();
}
