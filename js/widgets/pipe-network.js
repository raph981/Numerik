/**
 * Widget: Knotenpotentialverfahren am Beispielnetzwerk aus Vorlesung 4.
 * Leitfähigkeiten und Pumpenströme sind einstellbar; Drücke und Flüsse
 * werden live aus A p = b (A = BᵀLB) berechnet.
 */
import { h, setChildren, slider, matrixView, fmt } from '../core/dom.js';
import { EXAMPLE_NETWORK, solveNetwork, nodeBalance } from '../lib/numerics/network.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW = { w: 540, h: 380 };
const pos = ({ x, y }) => [(x - 205) * 1.65, (y - 605) * 1.65];

function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Endpunkte einer Kante, an den Knotenkreisen gekürzt. */
function edgeEnds(a, b, inset = 16) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  return [[a[0] + ux * inset, a[1] + uy * inset], [b[0] - ux * inset, b[1] - uy * inset]];
}

export default function mount(el) {
  const nodes = EXAMPLE_NETWORK.nodes;
  const edges = EXAMPLE_NETWORK.edges.map((e) => ({ ...e, value: e.type === 'pump' && e.name === 'e₈' ? 0.5 : e.value }));
  const markerId = `net-arrow-${Math.random().toString(36).slice(2, 8)}`;
  const graph = svg('svg', { viewBox: `0 0 ${VIEW.w} ${VIEW.h}`, class: 'network', role: 'img', 'aria-label': 'Rohrleitungsnetz mit Drücken und Flüssen' });
  const matrices = h('div');
  const check = h('p', { class: 'widget__hint' });

  function draw() {
    const { potentials, pipeFlows, system } = solveNetwork(nodes.length, edges);
    let pipeIndex = 0;
    const flows = edges.map((e) => (e.type === 'pipe' ? pipeFlows[pipeIndex++] : e.value));
    const maxFlow = Math.max(1e-9, ...flows.map(Math.abs));
    const pMin = Math.min(...potentials);
    const pMax = Math.max(...potentials);

    const defs = svg('defs');
    const marker = svg('marker', { id: markerId, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' });
    marker.append(svg('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'context-stroke' }));
    defs.append(marker);
    graph.replaceChildren(defs);

    edges.forEach((e, i) => {
      const q = flows[i];
      const a = pos(nodes[e.from]);
      const b = pos(nodes[e.to]);
      // in Flussrichtung zeichnen: bei q < 0 fließt das Wasser gegen die Kantenorientierung
      const [p0, p1] = q >= 0 ? edgeEnds(a, b) : edgeEnds(b, a);
      const width = 1.5 + 7 * (Math.abs(q) / maxFlow);
      const isPump = e.type === 'pump';
      graph.append(svg('line', {
        x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1],
        class: `network__edge${isPump ? ' network__edge--pump' : ''}`, 'stroke-width': width, 'stroke-opacity': 0.35,
      }));
      if (Math.abs(q) > 1e-9) {
        graph.append(svg('line', {
          x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1],
          class: `network__flowline${isPump ? ' network__flowline--pump' : ''}`,
          'stroke-width': Math.max(2, width * 0.55), 'marker-end': `url(#${markerId})`,
          style: `animation-duration: ${(2.2 / (0.15 + Math.abs(q) / maxFlow)).toFixed(2)}s`,
        }));
      }
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      graph.append(svg('text', { x: mx + 8, y: my - 6, class: 'network__edge-label' }, e.name));
      graph.append(svg('text', { x: mx + 8, y: my + 8, class: 'network__value' }, `q = ${fmt(q, 2)}`));
    });

    nodes.forEach((n, i) => {
      const [x, y] = pos(n);
      const t = pMax > pMin ? (potentials[i] - pMin) / (pMax - pMin) : 0.5;
      graph.append(svg('circle', {
        cx: x, cy: y, r: 14, class: 'network__node',
        fill: `color-mix(in srgb, var(--series-5) ${Math.round(t * 100)}%, var(--series-3))`,
      }));
      graph.append(svg('text', { x: x - 7, y: y + 4.5, class: 'network__node-label network__node-label--inside' }, n.name));
      graph.append(svg('text', { x: x + 18, y: y + 20, class: 'network__value' }, i === nodes.length - 1 ? 'p = 0 (Ref.)' : `p = ${fmt(potentials[i], 2)}`));
    });

    const balance = nodeBalance(nodes.length, edges, flows);
    check.textContent = `Knotenregel geprüft: Σ aus − Σ ein = ${balance.map((v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3)).join(' | ')} (für v₁ … v₅). Rot = hoher Druck, blau = niedriger Druck; Strichstärke ∝ |q|.`;

    const fmtM = (v) => fmt(v, 2);
    setChildren(matrices, h('details', { class: 'widget__details' },
      h('summary', {}, 'Matrizen des Gleichungssystems anzeigen'),
      h('div', { class: 'matrix-row' }, 'B =', matrixView(system.B, { format: fmtM }), 'L =', matrixView(system.L, { format: fmtM })),
      h('div', { class: 'matrix-row' }, 'A = BᵀLB =', matrixView(system.A, { format: fmtM }), 'b =', matrixView(system.b.map((v) => [v]), { format: fmtM }),
        'p =', matrixView(potentials.slice(0, -1).map((v) => [v]), { format: fmtM })),
    ));
  }

  const sliders = edges.map((e) => slider({
    label: e.type === 'pipe' ? `Rohr ${e.name}: L =` : `Pumpe ${e.name}: q =`,
    min: e.type === 'pipe' ? 0.1 : -3,
    max: e.type === 'pipe' ? 5 : 3,
    step: 0.1,
    value: e.value,
    format: (v) => v.toFixed(1),
    onInput: (v) => { e.value = v; draw(); },
  }));

  setChildren(el,
    h('div', { class: 'widget-columns' },
      h('div', {}, graph),
      h('div', { class: 'network__controls' }, sliders.map((s) => s.element)),
    ),
    check,
    matrices,
  );
  draw();
}
