/**
 * Schlanke SVG-Plotbibliothek für die Widgets.
 *
 * Farben werden über CSS-Klassen (`series-1` … `series-6`) gesetzt, damit
 * Hell-/Dunkelmodus automatisch funktionieren.
 *
 * @typedef {Object} Axis
 * @property {string} [label]
 * @property {number} [min]
 * @property {number} [max]
 * @property {boolean} [log]          logarithmische Skala (Basis 10)
 * @property {(v:number)=>string} [format]  Formatierung der Achsenbeschriftung
 * @property {number[]} [ticks]       explizite Tick-Positionen
 *
 * @typedef {Object} Series
 * @property {[number, number][]} data
 * @property {'line'|'points'|'stem'} [kind]
 * @property {number} [color]        Index 1…6
 * @property {string} [label]
 * @property {boolean} [dashed]
 *
 * @typedef {Object} PlotConfig
 * @property {Axis} x
 * @property {Axis} y
 * @property {Series[]} series
 * @property {{x?: number, y?: number, label?: string}[]} [markers]  vertikale/horizontale Hilfslinien
 * @property {{from: number, to: number, label?: string}[]} [bands]  hinterlegte x-Bereiche
 * @property {number} [width]
 * @property {number} [height]
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const MARGIN = { top: 16, right: 16, bottom: 44, left: 64 };

function svg(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

/** „Schöne“ Tick-Positionen für eine lineare Achse. */
export function linearTicks(min, max, count = 6) {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((s) => span / s <= count) ?? 10 * mag;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return ticks;
}

/** Zehnerpotenzen als Ticks für eine logarithmische Achse. */
export function logTicks(min, max) {
  const ticks = [];
  for (let p = Math.ceil(Math.log10(min)); p <= Math.floor(Math.log10(max)); p++) ticks.push(10 ** p);
  return ticks;
}

function extent(series, index, log) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const s of series) {
    for (const point of s.data) {
      const v = point[index];
      if (!Number.isFinite(v) || (log && v <= 0)) continue;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  if (lo === Infinity) return [log ? 1 : 0, log ? 10 : 1];
  if (lo === hi) return log ? [lo / 10, hi * 10] : [lo - 1, hi + 1];
  return [lo, hi];
}

function makeScale({ min, max, log }, [r0, r1]) {
  const f = log ? Math.log10 : (v) => v;
  const d0 = f(min);
  const d1 = f(max);
  return (v) => r0 + ((f(v) - d0) / (d1 - d0)) * (r1 - r0);
}

function defaultFormat(log) {
  return (v) => {
    if (log) {
      const p = Math.round(Math.log10(v));
      return p >= -3 && p <= 4 ? v.toLocaleString('de-DE', { maximumFractionDigits: 3 }) : `1e${p}`;
    }
    const abs = Math.abs(v);
    if (abs !== 0 && (abs >= 1e6 || abs < 1e-3)) return v.toExponential(1).replace('e+', 'e');
    return v.toLocaleString('de-DE', { maximumFractionDigits: 3 });
  };
}

/**
 * Zeichnet (bzw. ersetzt) einen Plot im Container.
 * @param {HTMLElement} container
 * @param {PlotConfig} config
 */
export function renderPlot(container, config) {
  const width = config.width ?? 640;
  const height = config.height ?? 340;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const [xLo, xHi] = extent(config.series, 0, config.x.log);
  // Horizontale Hilfslinien sollen sichtbar bleiben: als Pseudo-Datenpunkte mitberücksichtigen
  const markerSeries = { data: (config.markers ?? []).filter((m) => m.y !== undefined).map((m) => [NaN, m.y]) };
  const [yLo, yHi] = extent([...config.series, markerSeries], 1, config.y.log);
  const xAxis = { ...config.x, min: config.x.min ?? xLo, max: config.x.max ?? xHi };
  const yAxis = { ...config.y, min: config.y.min ?? (config.y.log ? yLo : Math.min(0, yLo)), max: config.y.max ?? yHi };

  const sx = makeScale(xAxis, [0, innerW]);
  const sy = makeScale(yAxis, [innerH, 0]);
  const clipId = `clip-${Math.random().toString(36).slice(2, 9)}`;

  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'plot', role: 'img', 'aria-label': config.ariaLabel ?? 'Diagramm' });
  const clipPath = svg('clipPath', { id: clipId });
  clipPath.append(svg('rect', { x: 0, y: 0, width: innerW, height: innerH }));
  const defs = svg('defs');
  defs.append(clipPath);
  root.append(defs);

  const g = svg('g', { transform: `translate(${MARGIN.left},${MARGIN.top})` });
  root.append(g);

  // Hinterlegte Bereiche
  for (const band of config.bands ?? []) {
    const x0 = Math.max(0, sx(band.from));
    const x1 = Math.min(innerW, sx(band.to));
    if (x1 <= x0) continue;
    g.append(svg('rect', { x: x0, y: 0, width: x1 - x0, height: innerH, class: 'plot__band' }));
    if (band.label) g.append(svg('text', { x: x0 + 6, y: 14, class: 'plot__band-label' }, band.label));
  }

  // Gitter und Achsen
  const xTicks = xAxis.ticks ?? (xAxis.log ? logTicks(xAxis.min, xAxis.max) : linearTicks(xAxis.min, xAxis.max));
  const yTicks = yAxis.ticks ?? (yAxis.log ? logTicks(yAxis.min, yAxis.max) : linearTicks(yAxis.min, yAxis.max, 5));
  const xFmt = xAxis.format ?? defaultFormat(xAxis.log);
  const yFmt = yAxis.format ?? defaultFormat(yAxis.log);

  for (const t of xTicks) {
    const x = sx(t);
    if (x < -0.5 || x > innerW + 0.5) continue;
    g.append(svg('line', { x1: x, x2: x, y1: 0, y2: innerH, class: 'plot__grid' }));
    g.append(svg('text', { x, y: innerH + 18, class: 'plot__tick', 'text-anchor': 'middle' }, xFmt(t)));
  }
  for (const t of yTicks) {
    const y = sy(t);
    if (y < -0.5 || y > innerH + 0.5) continue;
    g.append(svg('line', { x1: 0, x2: innerW, y1: y, y2: y, class: 'plot__grid' }));
    g.append(svg('text', { x: -8, y: y + 4, class: 'plot__tick', 'text-anchor': 'end' }, yFmt(t)));
  }
  g.append(svg('rect', { x: 0, y: 0, width: innerW, height: innerH, class: 'plot__frame' }));

  if (xAxis.label) {
    g.append(svg('text', { x: innerW / 2, y: innerH + 38, class: 'plot__axis-label', 'text-anchor': 'middle' }, xAxis.label));
  }
  if (yAxis.label) {
    g.append(svg('text', {
      x: -innerH / 2, y: -50, transform: 'rotate(-90)', class: 'plot__axis-label', 'text-anchor': 'middle',
    }, yAxis.label));
  }

  // Hilfslinien
  for (const m of config.markers ?? []) {
    if (m.x !== undefined) {
      const x = sx(m.x);
      g.append(svg('line', { x1: x, x2: x, y1: 0, y2: innerH, class: 'plot__marker' }));
      if (m.label) g.append(svg('text', { x: x + 4, y: innerH - 6, class: 'plot__marker-label' }, m.label));
    }
    if (m.y !== undefined) {
      const y = sy(m.y);
      g.append(svg('line', { x1: 0, x2: innerW, y1: y, y2: y, class: 'plot__marker' }));
      if (m.label) g.append(svg('text', { x: innerW - 4, y: y - 4, class: 'plot__marker-label', 'text-anchor': 'end' }, m.label));
    }
  }

  // Datenreihen
  const dataLayer = svg('g', { 'clip-path': `url(#${clipId})` });
  g.append(dataLayer);
  const valid = ([x, y]) => Number.isFinite(x) && Number.isFinite(y) && (!xAxis.log || x > 0) && (!yAxis.log || y > 0);

  config.series.forEach((s, i) => {
    const cls = `series-${s.color ?? i + 1}`;
    const pts = s.data.filter(valid).map(([x, y]) => [sx(x), sy(y)]);
    if (pts.length === 0) return;
    const kind = s.kind ?? 'line';
    if (kind === 'line') {
      const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('');
      dataLayer.append(svg('path', { d, class: `plot__line ${cls}${s.dashed ? ' plot__line--dashed' : ''}` }));
    } else if (kind === 'stem') {
      const base = yAxis.log ? innerH : sy(0);
      for (const [x, y] of pts) dataLayer.append(svg('line', { x1: x, x2: x, y1: base, y2: y, class: `plot__stem ${cls}` }));
      for (const [x, y] of pts) dataLayer.append(svg('circle', { cx: x, cy: y, r: 3, class: `plot__point ${cls}` }));
    } else {
      for (const [x, y] of pts) dataLayer.append(svg('circle', { cx: x, cy: y, r: s.radius ?? 3, class: `plot__point ${cls}` }));
    }
  });

  container.replaceChildren(renderLegend(config.series), root);
}

function renderLegend(series) {
  const list = document.createElement('ul');
  list.className = 'plot-legend';
  series.forEach((s, i) => {
    if (!s.label) return;
    const swatch = document.createElement('span');
    swatch.className = `plot-legend__swatch plot-legend__swatch--${s.kind ?? 'line'} series-${s.color ?? i + 1}`;
    const item = document.createElement('li');
    item.append(swatch, s.label);
    list.append(item);
  });
  return list;
}
