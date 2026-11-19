/**
 * Widget: Baumstruktur der Haar-Wavelets (Definition 24.2, Lemma 24.3, Abbildung 24.2).
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { haarSupport, levelSize } from '../lib/numerics/haar.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDTH = 640;
const ROW = 64;
const LEFT = 78;
const AMPLITUDE = 18;

function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

const height = (k) => (k === 0 ? 1 : 2 ** ((k - 1) / 2));
const heightLabel = (k) => (k === 0 ? '1' : k % 2 === 1 ? String(2 ** ((k - 1) / 2)) : `${k === 2 ? '' : 2 ** ((k - 2) / 2)}√2`);

/** Werte des Wavelets als Treppenfunktion (für renderPlot). */
function stepData(k, i) {
  const [l, r] = haarSupport(k, i);
  const v = height(k);
  if (k === 0) return [[0, 0], [l, 0], [l, v], [r, v], [r, 0], [1, 0]];
  const m = (l + r) / 2;
  return [[0, 0], [l, 0], [l, v], [m, v], [m, -v], [r, -v], [r, 0], [1, 0]];
}

export default function mount(el) {
  const state = { levels: 3, k: 2, i: 1 };
  const tree = h('div', { class: 'haar-tree' });
  const plot = h('div', { class: 'plot-container' });
  const stats = h('div', { class: 'stats' });

  function drawTree() {
    const total = state.levels + 1;
    const root = svg('svg', { viewBox: `0 0 ${WIDTH} ${total * ROW + 24}`, class: 'haar-tree__svg', role: 'img', 'aria-label': 'Baum der Haar-Wavelets' });
    const sx = (t) => LEFT + t * (WIDTH - LEFT - 12);
    const mid = (k) => 12 + k * ROW + ROW / 2;
    const isChild = (k, i) => k === state.k + 1 && (state.k === 0 ? i === 0 : i >> 1 === state.i);

    for (let k = 0; k <= state.levels; k++) {
      root.append(svg('text', { x: 4, y: mid(k) + 4, class: 'haar-tree__label' }, `k = ${k}`));
      root.append(svg('text', { x: 4, y: mid(k) + 18, class: 'haar-tree__label haar-tree__label--muted' }, k === 0 ? '1' : `±${heightLabel(k)}`));
      root.append(svg('line', { x1: sx(0), x2: sx(1), y1: mid(k), y2: mid(k), class: 'haar-tree__axis' }));
      for (let i = 0; i < levelSize(k); i++) {
        const [l, r] = haarSupport(k, i);
        const y = mid(k);
        // Kanten zum Elternknoten (Lemma 24.3 iii: Träger = Vereinigung der Kinderträger)
        if (k > 0) {
          const [pl, pr] = k === 1 ? [0, 1] : haarSupport(k - 1, i >> 1);
          root.append(svg('line', { x1: sx((pl + pr) / 2), y1: mid(k - 1) + AMPLITUDE + 2, x2: sx((l + r) / 2), y2: y - AMPLITUDE - 2, class: 'haar-tree__edge' }));
        }
        const m = (l + r) / 2;
        const d = k === 0
          ? `M${sx(l)},${y}V${y - AMPLITUDE}H${sx(r)}V${y}`
          : `M${sx(l)},${y}V${y - AMPLITUDE}H${sx(m)}V${y + AMPLITUDE}H${sx(r)}V${y}`;
        const active = k === state.k && i === state.i;
        const group = svg('g', {
          class: `haar-tree__node${active ? ' haar-tree__node--active' : ''}${isChild(k, i) ? ' haar-tree__node--child' : ''}`,
          tabindex: 0, role: 'button', 'aria-label': `ψ ${i} hoch ${k} auswählen`,
        });
        group.append(svg('rect', { x: sx(l) + 1, y: y - ROW / 2 + 4, width: sx(r) - sx(l) - 2, height: ROW - 8, rx: 4, class: 'haar-tree__hit' }));
        group.append(svg('path', { d, class: 'haar-tree__graph' }));
        const select = () => { state.k = k; state.i = i; update(); };
        group.addEventListener('click', select);
        group.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
        root.append(group);
      }
    }
    setChildren(tree, root);
  }

  function update() {
    if (state.k > state.levels) { state.k = state.levels; state.i = 0; }
    drawTree();
    const [l, r] = haarSupport(state.k, state.i);
    const v = height(state.k);
    renderPlot(plot, {
      height: 200,
      x: { label: 'x', min: 0, max: 1 },
      y: { label: 'ψ', min: -3, max: 3 },
      series: [{ data: stepData(state.k, state.i), label: `ψ${state.i}^${state.k}`, color: 1 }],
      bands: [{ from: l, to: r, label: 'Träger' }],
      ariaLabel: 'Ausgewähltes Haar-Wavelet',
    });
    setChildren(stats,
      stat('Träger', `[${fmt(l, 4)}, ${fmt(r, 4)}]`, state.k === 0 ? 'ganzes Intervall' : `Länge 1/${2 ** (state.k - 1)}, verschoben um ${state.i}/${2 ** (state.k - 1)}`),
      stat('Höhe', state.k === 0 ? '1' : `±${heightLabel(state.k)}`, '2^((k−1)/2), damit ‖ψ‖ = 1'),
      stat('‖ψ‖²', `${fmt(r - l, 4)} · ${fmt(v * v, 3)} = 1`, 'Länge · Höhe²'),
      stat(`dim Ψ^${state.levels}`, String(2 ** state.levels), 'Lemma 24.3 i'),
    );
  }

  setChildren(el,
    controls(slider({ label: 'Stufen bis k =', min: 1, max: 5, step: 1, value: state.levels, onInput: (v) => { state.levels = v; update(); } })),
    tree,
    stats,
    plot,
    h('p', { class: 'widget__hint' }, 'Klicken Sie auf ein Wavelet. Seine beiden Kinder (hervorgehoben) teilen sich seinen Träger. Zwei Wavelets sind orthogonal: Entweder sind die Träger disjunkt, oder das feinere liegt ganz in einer Hälfte des gröberen, wo dieses konstant ist – und das Integral des feineren ist null.'),
  );
  update();
}
