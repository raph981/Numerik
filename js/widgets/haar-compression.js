/**
 * Widget: Datenkompression mit Haar-Wavelets (Lemma 24.5, Algorithmus 24.6).
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { cellMeans, toHaar, fromHaar, compress, applyMask, uniformLevel } from '../lib/numerics/haar.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FUNCTIONS = {
  peak: { label: '1/(10(x−⅓)² + ε)', f: (x) => 1 / (10 * (x - 1 / 3) ** 2 + 0.01) },
  step: { label: 'Sprung + Gerade', f: (x) => (x < 0.6 ? x : 1.6 - x / 2) },
  chirp: { label: 'sin(1/(x + 0.04))', f: (x) => Math.sin(1 / (x + 0.04)) },
  smooth: { label: 'sin(2πx)', f: (x) => Math.sin(2 * Math.PI * x) },
};

/** Treppenfunktion aus Zellwerten (Standardbasis χ_i^k). */
const stepData = (alpha) => alpha.flatMap((a, i) => [[i / alpha.length, a], [(i + 1) / alpha.length, a]]);

/** Koeffizientenkarte: eine Zeile pro Stufe, Zellbreite = Trägerlänge, Deckkraft ~ log|β|. */
function coefficientMap(beta, mask) {
  const width = 640;
  const row = 16;
  const left = 46;
  const root = document.createElementNS(SVG_NS, 'svg');
  root.setAttribute('viewBox', `0 0 ${width} ${beta.length * row + 4}`);
  root.setAttribute('class', 'haar-map');
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', 'Ausgewählte Wavelet-Koeffizienten je Stufe');
  const logs = beta.flat().filter((b) => b !== 0).map((b) => Math.log10(Math.abs(b)));
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  beta.forEach((level, l) => {
    const label = document.createElementNS(SVG_NS, 'text');
    Object.entries({ x: 2, y: l * row + 13, class: 'haar-tree__label haar-tree__label--muted' }).forEach(([k, v]) => label.setAttribute(k, v));
    label.textContent = `k = ${l}`;
    root.append(label);
    const w = (width - left - 4) / level.length;
    level.forEach((b, i) => {
      const rect = document.createElementNS(SVG_NS, 'rect');
      const intensity = b === 0 || hi === lo ? 0 : (Math.log10(Math.abs(b)) - lo) / (hi - lo);
      Object.entries({
        x: left + i * w, y: l * row + 2, width: Math.max(w - (w > 3 ? 1 : 0), 0.6), height: row - 3,
        class: `haar-map__cell ${mask[l][i] ? 'haar-map__cell--kept' : ''}`, 'fill-opacity': (0.12 + 0.88 * intensity).toFixed(3),
      }).forEach(([k, v]) => rect.setAttribute(k, v));
      root.append(rect);
    });
  });
  return root;
}

export default function mount(el) {
  const state = { fn: 'peak', k: 8, tolExp: -2 };
  const stats = h('div', { class: 'stats' });
  const plot = h('div', { class: 'plot-container' });
  const map = h('div');
  const grid = Array.from({ length: 801 }, (_, j) => j / 800);
  let cache = { key: '', beta: null };

  function update() {
    const F = FUNCTIONS[state.fn];
    const key = `${state.fn}/${state.k}`;
    if (cache.key !== key) cache = { key, beta: toHaar(cellMeans(F.f, state.k)) };
    const { beta } = cache;
    const tol = 10 ** state.tolExp;
    const { mask, count, kept, total } = compress(beta, tol);
    const approx = fromHaar(applyMask(beta, mask));
    const uniform = uniformLevel(beta, tol);

    renderPlot(plot, {
      height: 260,
      x: { label: 'x', min: 0, max: 1 },
      y: { label: 'y' },
      series: [
        { data: grid.map((x) => [x, F.f(x)]), label: 'f', color: 6, dashed: true },
        { data: stepData(approx), label: `komprimiert: ${count} von ${2 ** state.k} Koeffizienten`, color: 1 },
      ],
      ariaLabel: 'Funktion und komprimierte Haar-Darstellung',
    });
    setChildren(map, coefficientMap(beta, mask));
    setChildren(stats,
      stat('Koeffizienten', `${count} / ${2 ** state.k}`, `Kompression Faktor ${fmt(2 ** state.k / count, 1)}`),
      stat('erreichter Fehler ‖v − ṽ‖ / ‖v‖', fmtExp(Math.sqrt(Math.max(total - kept, 0) / total), 2), `≤ TOL = ${fmtExp(tol, 1)}`),
      stat('uniforme Verfeinerung', `${uniform.count} Koeffizienten`, `alle Stufen bis k = ${uniform.level} für dieselbe Toleranz`),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Funktion f', value: state.fn, options: Object.entries(FUNCTIONS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } }),
    ),
    controls(
      slider({ label: 'feinste Stufe k =', min: 4, max: 10, step: 1, value: state.k, onInput: (v) => { state.k = v; update(); } }),
      slider({ label: 'TOL = 10^', min: -3.5, max: -0.5, step: 0.1, value: state.tolExp, format: (v) => fmt(v, 1), onInput: (v) => { state.tolExp = v; update(); } }),
    ),
    stats,
    plot,
    h('h4', {}, 'Ausgewählte Koeffizienten (grün) im Wavelet-Baum'),
    map,
    h('p', { class: 'widget__hint' }, 'Ausgangspunkt ist v = Bestapproximation von f in S^k (Zellmittelwerte), umgerechnet in die Wavelet-Basis. Der Algorithmus nimmt, beginnend bei der Wurzel, immer das Kind mit dem größten Beitrag ⟨v, ψ⟩² hinzu. Dort, wo f glatt ist, sind die feinen Koeffizienten winzig – verfeinert wird nur, wo f sich stark ändert.'),
  );
  update();
}
