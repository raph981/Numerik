/**
 * Koordinatenebene mit gleichem Maßstab in x und y (SVG).
 * Für geometrische Darstellungen: Vektoren, Kurven, Geraden, Ellipsen.
 *
 *   const plane = createPlane({ range: 2 });
 *   plane.grid(); plane.path(points, 'series-1'); container.append(plane.svg);
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * @param {{range?: number, center?: [number, number], size?: number, ariaLabel?: string}} options
 *   range:  halbe Kantenlänge des sichtbaren Quadrats in Weltkoordinaten
 *   center: Mittelpunkt des sichtbaren Bereichs (Standard: Ursprung)
 */
export function createPlane({ range = 2, center = [0, 0], size = 360, ariaLabel = 'Koordinatenebene' } = {}) {
  const [cx, cy] = center;
  const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, class: 'plane', role: 'img', 'aria-label': ariaLabel });
  const sx = (x) => ((x - cx + range) / (2 * range)) * size;
  const sy = (y) => size - ((y - cy + range) / (2 * range)) * size;
  const toWorld = (px, py) => [cx + (px / size) * 2 * range - range, cy + ((size - py) / size) * 2 * range - range];
  const markerId = `arrow-${Math.random().toString(36).slice(2, 9)}`;

  const defs = el('defs');
  const marker = el('marker', { id: markerId, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
  marker.append(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'context-stroke' }));
  defs.append(marker);
  svg.append(defs);

  const api = {
    svg, sx, sy, toWorld, range, size,

    /** Entfernt alle Zeichenelemente (das SVG-Element selbst bleibt erhalten). */
    clear() {
      [...svg.children].forEach((child) => { if (child !== defs) child.remove(); });
      return api;
    },

    /** Gitter mit Achsen; step = Gitterweite in Weltkoordinaten. */
    grid(step = range / 4) {
      const g = el('g', { class: 'plane__grid' });
      for (let v = Math.ceil((cx - range) / step) * step; v <= cx + range + 1e-9; v += step) {
        g.append(el('line', { x1: sx(v), x2: sx(v), y1: 0, y2: size }));
      }
      for (let v = Math.ceil((cy - range) / step) * step; v <= cy + range + 1e-9; v += step) {
        g.append(el('line', { x1: 0, x2: size, y1: sy(v), y2: sy(v) }));
      }
      svg.append(g);
      svg.append(el('line', { x1: 0, x2: size, y1: sy(0), y2: sy(0), class: 'plane__axis' }));
      svg.append(el('line', { x1: sx(0), x2: sx(0), y1: 0, y2: size, class: 'plane__axis' }));
      return api;
    },

    /** Polygonzug durch Weltpunkte. */
    path(points, className = 'series-1', { closed = false, fill = false, dashed = false } = {}) {
      const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join('') + (closed ? 'Z' : '');
      const node = el('path', { d, class: `plane__curve ${className}${fill ? ' plane__curve--fill' : ''}${dashed ? ' plane__curve--dashed' : ''}` });
      svg.append(node);
      return node;
    },

    /** Gerade a·x + b·y = c, auf den sichtbaren Bereich zugeschnitten. */
    line(a, b, c, className = 'series-1') {
      const R = range * 1.5;
      const pts = Math.abs(b) > Math.abs(a)
        ? [cx - R, cx + R].map((x) => [x, (c - a * x) / b])
        : [cy - R, cy + R].map((y) => [(c - b * y) / a, y]);
      return api.path(pts, className);
    },

    /** Pfeil von `from` nach `to` (Weltkoordinaten). */
    arrow(from, to, className = 'series-1', label) {
      const node = el('line', {
        x1: sx(from[0]), y1: sy(from[1]), x2: sx(to[0]), y2: sy(to[1]),
        class: `plane__arrow ${className}`, 'marker-end': `url(#${markerId})`,
      });
      svg.append(node);
      if (label) api.text(to, label, className);
      return node;
    },

    /** Punkt. */
    dot([x, y], className = 'series-1', r = 4) {
      const node = el('circle', { cx: sx(x), cy: sy(y), r, class: `plane__dot ${className}` });
      svg.append(node);
      return node;
    },

    /** Beschriftung neben einem Weltpunkt. */
    text([x, y], content, className = '', dx = 6, dy = -6) {
      const node = el('text', { x: sx(x) + dx, y: sy(y) + dy, class: `plane__label ${className}` }, content);
      svg.append(node);
      return node;
    },

    /** Ruft `onDrag([x, y])` beim Ziehen (Maus/Touch) auf der Fläche auf. */
    onDrag(callback) {
      svg.style.touchAction = 'none';
      const handle = (event) => {
        const rect = svg.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * size;
        const py = ((event.clientY - rect.top) / rect.height) * size;
        callback(toWorld(px, py));
      };
      svg.addEventListener('pointerdown', (e) => { svg.setPointerCapture(e.pointerId); handle(e); });
      svg.addEventListener('pointermove', (e) => { if (svg.hasPointerCapture(e.pointerId)) handle(e); });
      return api;
    },
  };
  return api;
}

/** Punkte auf dem Einheitskreis (für Bilder von Einheitskugeln). */
export function unitCircle(samples = 180) {
  return Array.from({ length: samples + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / samples;
    return [Math.cos(t), Math.sin(t)];
  });
}
