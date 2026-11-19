/**
 * Widget: Schnelle Fourier-Transformation – Bit-Reversal, Schmetterlingsdiagramm
 * und gemessene Laufzeit DFT vs. FFT (Abschnitt 20.3).
 */
import { h, setChildren, segmented, controls, table, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { bitReversal, dft, fft } from '../lib/numerics/fourier.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function butterfly(N) {
  const d = Math.log2(N);
  const rowH = 30;
  const colW = 110;
  const W = colW * (d + 1) + 120;
  const H = rowH * N + 30;
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'butterfly', role: 'img', 'aria-label': 'Schmetterlingsdiagramm der FFT' });
  const rev = bitReversal(N);
  const y = (i) => 25 + i * rowH;
  const x = (s) => 70 + s * colW;
  // Verbindungen der Stufen: in Stufe s werden Blöcke der Länge 2^s kombiniert
  for (let s = 1; s <= d; s++) {
    const len = 2 ** s;
    for (let start = 0; start < N; start += len) {
      for (let k = 0; k < len / 2; k++) {
        const top = start + k;
        const bottom = start + k + len / 2;
        [[top, top], [top, bottom], [bottom, top], [bottom, bottom]].forEach(([from, to]) => {
          root.append(svg('line', { x1: x(s - 1), y1: y(from), x2: x(s), y2: y(to), class: from === to ? 'butterfly__line' : 'butterfly__cross' }));
        });
      }
    }
    root.append(svg('text', { x: (x(s - 1) + x(s)) / 2, y: 14, class: 'butterfly__label', 'text-anchor': 'middle' }, `Länge ${2 ** s}`));
  }
  for (let i = 0; i < N; i++) {
    root.append(svg('text', { x: 4, y: y(i) + 4, class: 'butterfly__label' }, `y${rev[i]} (${rev[i].toString(2).padStart(d, '0')})`));
    for (let s = 0; s <= d; s++) root.append(svg('circle', { cx: x(s), cy: y(i), r: 4, class: 'butterfly__node' }));
    root.append(svg('text', { x: x(d) + 10, y: y(i) + 4, class: 'butterfly__label' }, `c̃${i}`));
  }
  return root;
}

function timeIt(fn, minMs = 30) {
  let reps = 0;
  const t0 = performance.now();
  let t = t0;
  while (t - t0 < minMs) { fn(); reps++; t = performance.now(); }
  return (t - t0) / reps;
}

export default function mount(el) {
  const state = { N: 8 };
  const diagram = h('div');
  const timing = h('div', { class: 'plot-container' });
  const timingTable = h('div');

  function draw() {
    setChildren(diagram, butterfly(state.N));
  }

  function measure() {
    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    const rows = sizes.map((N) => {
      const y = Array.from({ length: N }, (_, j) => Math.sin(j) + 0.3 * Math.cos(5 * j));
      return { N, dft: N <= 1024 ? timeIt(() => dft(y)) : NaN, fft: timeIt(() => fft(y)) };
    });
    renderPlot(timing, {
      height: 240,
      x: { label: 'N', log: true },
      y: { label: 'Laufzeit [ms]', log: true },
      series: [
        { data: rows.map((r) => [r.N, r.dft]), label: 'DFT direkt, O(N²)', color: 5 },
        { data: rows.map((r) => [r.N, r.fft]), label: 'FFT, O(N log N)', color: 2 },
      ],
      ariaLabel: 'Laufzeitvergleich DFT und FFT',
    });
    setChildren(timingTable, table(['N', 'DFT [ms]', 'FFT [ms]', 'Beschleunigung'], rows.map((r) => [String(r.N), fmt(r.dft, 3), fmt(r.fft, 3), `× ${fmt(r.dft / r.fft, 1)}`])));
  }

  setChildren(el,
    controls(segmented({ label: 'N', value: '8', options: ['4', '8', '16'].map((v) => ({ value: v, label: v })), onChange: (v) => { state.N = Number(v); draw(); } })),
    diagram,
    h('p', { class: 'widget__hint' }, 'Links: Die Eingabe wird in Bit-umgekehrter Reihenfolge sortiert (Abstiegsphase). Dann werden in log₂ N Stufen jeweils zwei Transformierte der halben Länge zu einer kombiniert: c̃ₖ = c̃ₖᵍ + e^{−2πik/N} c̃ₖᵘ, c̃ₖ₊N/2 = c̃ₖᵍ − e^{−2πik/N} c̃ₖᵘ („Schmetterling“).'),
    h('h4', {}, 'Gemessene Laufzeit in Ihrem Browser'),
    timing,
    timingTable,
  );
  draw();
  // Messung leicht verzögert, damit die Seite zuerst erscheint
  setTimeout(measure, 50);
}
