/**
 * Widget: Verstärkungsfaktoren der Grundoperationen als Heatmap (Beispiel 3.8).
 * Rot = schlecht konditioniert (|k| ≫ 1), grün = gut konditioniert.
 */
import { h, setChildren, segmented, controls, stat, fmt } from '../core/dom.js';
import { AMPLIFICATION, maxAmplification } from '../lib/numerics/condition.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 360;
const CELLS = 60;
const RANGE = 2;

const toWorld = (px) => (px / SIZE) * 2 * RANGE - RANGE;
const toPx = (v) => ((v + RANGE) / (2 * RANGE)) * SIZE;

/** Farbe für log10 |k| ∈ [0, 3] von grün über gelb nach rot. */
function heatColor(k) {
  const t = Math.min(1, Math.max(0, Math.log10(Math.max(k, 1)) / 3));
  return t < 0.5
    ? `color-mix(in srgb, var(--heat-1) ${t * 200}%, var(--heat-0))`
    : `color-mix(in srgb, var(--heat-2) ${(t - 0.5) * 200}%, var(--heat-1))`;
}

function svg(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export default function mount(el) {
  const state = { kind: 'add', x1: 1, x2: -0.9 };
  const map = svg('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'heatmap', role: 'img', 'aria-label': 'Heatmap der Verstärkungsfaktoren' });
  const cellLayer = svg('g', {});
  const marker = svg('circle', { r: 6, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 });
  map.append(cellLayer,
    svg('line', { x1: 0, x2: SIZE, y1: SIZE / 2, y2: SIZE / 2, stroke: 'currentColor', 'stroke-opacity': 0.4 }),
    svg('line', { y1: 0, y2: SIZE, x1: SIZE / 2, x2: SIZE / 2, stroke: 'currentColor', 'stroke-opacity': 0.4 }),
    marker);
  const info = h('div', { class: 'stats' });

  function drawMap() {
    cellLayer.replaceChildren();
    const w = SIZE / CELLS;
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const x1 = toWorld((i + 0.5) * w);
        const x2 = -toWorld((j + 0.5) * w);
        const k = maxAmplification(state.kind, x1, x2);
        cellLayer.append(svg('rect', { x: i * w, y: j * w, width: w + 0.5, height: w + 0.5, fill: heatColor(Number.isFinite(k) ? k : 1e6) }));
      }
    }
  }

  function updatePoint() {
    marker.setAttribute('cx', toPx(state.x1));
    marker.setAttribute('cy', toPx(-state.x2));
    const { k1, k2 } = AMPLIFICATION[state.kind].factors(state.x1, state.x2);
    const kmax = Math.max(Math.abs(k1), Math.abs(k2));
    setChildren(info,
      stat('Punkt', `x₁ = ${fmt(state.x1, 2)}, x₂ = ${fmt(state.x2, 2)}`),
      stat('Verstärkung k₁', fmt(k1, 3)),
      stat('Verstärkung k₂', fmt(k2, 3)),
      stat('Urteil', kmax > 10 ? 'schlecht konditioniert' : kmax > 1 ? 'Fehlerverstärkung' : 'gut konditioniert', `max |kⱼ| = ${fmt(kmax, 3)}`),
    );
  }

  map.addEventListener('pointerdown', (e) => { map.setPointerCapture(e.pointerId); pick(e); });
  map.addEventListener('pointermove', (e) => { if (map.hasPointerCapture(e.pointerId)) pick(e); });
  function pick(e) {
    const rect = map.getBoundingClientRect();
    state.x1 = toWorld(((e.clientX - rect.left) / rect.width) * SIZE);
    state.x2 = -toWorld(((e.clientY - rect.top) / rect.height) * SIZE);
    updatePoint();
  }

  setChildren(el,
    controls(segmented({
      label: 'Funktion F(x₁, x₂)', value: state.kind,
      options: Object.entries(AMPLIFICATION).map(([k, v]) => ({ value: k, label: v.label })),
      onChange: (v) => { state.kind = v; drawMap(); updatePoint(); },
    })),
    h('div', { class: 'widget-columns' },
      h('div', {}, map,
        h('div', { class: 'heatmap__legend' }, '|k| ≤ 1', h('span', { class: 'heatmap__bar' }), '|k| ≥ 1000'),
        h('p', { class: 'widget__hint', style: 'text-align:center' }, 'x₁ nach rechts, x₂ nach oben, je von −2 bis 2. Klicken oder ziehen Sie!')),
      h('div', {}, info),
    ),
  );
  drawMap();
  updatePoint();
}
