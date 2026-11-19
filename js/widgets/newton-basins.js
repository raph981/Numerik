/**
 * Widget: Einzugsgebiete – gegen welche der vier Nullstellen von Kreis ∩ Ellipse
 * konvergiert das Verfahren in Abhängigkeit vom Startwert? (Beispiele 16.1, 16.10)
 */
import { h, setChildren, slider, segmented, controls, stat, fmt } from '../core/dom.js';
import { systemExample, solveSystem, nearestRoot, SYSTEM_ROOTS } from '../lib/numerics/nonlinear.js';

const W = 200;
const H = 150;
const X_RANGE = [-4, 4];
const Y_RANGE = [-3, 3];

const toWorld = (i, j) => [X_RANGE[0] + ((i + 0.5) / W) * (X_RANGE[1] - X_RANGE[0]), Y_RANGE[1] - ((j + 0.5) / H) * (Y_RANGE[1] - Y_RANGE[0])];
const toPx = ([x, y]) => [((x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * W, ((Y_RANGE[1] - y) / (Y_RANGE[1] - Y_RANGE[0])) * H];

export default function mount(el) {
  const state = { method: 'newton', sigma: 0.1 };
  const canvas = h('canvas', { width: W * 2, height: H * 2, class: 'basins', role: 'img', 'aria-label': 'Einzugsgebiete der Nullstellen' });
  const sigmaSlider = slider({ label: 'σ =', min: -0.5, max: 0.5, step: 0.01, value: state.sigma, format: (v) => v.toFixed(2), onInput: (v) => { state.sigma = v; draw(); } });
  const stats = h('div', { class: 'stats' });

  function draw() {
    sigmaSlider.element.hidden = state.method !== 'relaxation';
    const css = getComputedStyle(document.documentElement);
    const colors = ['--series-1', '--series-2', '--series-3', '--series-4'].map((v) => css.getPropertyValue(v).trim());
    const background = css.getPropertyValue('--surface-2').trim();
    const ctx = canvas.getContext('2d');
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const counts = [0, 0, 0, 0, 0];
    const maxIt = state.method === 'newton' ? 40 : 300;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const res = solveSystem(systemExample, toWorld(i, j), { method: state.method, sigma: state.sigma, maxIt, tol: 1e-8 });
        const root = res.converged ? nearestRoot(res.iterates.at(-1), SYSTEM_ROOTS, 1e-2) : -1;
        counts[root >= 0 ? root : 4]++;
        ctx.fillStyle = root >= 0 ? colors[root] : background;
        ctx.globalAlpha = root >= 0 ? Math.max(0.35, 1 - res.iterates.length / (maxIt * 0.6)) : 1;
        ctx.fillRect(i, j, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
    // Kreis, Ellipse und Nullstellen
    ctx.strokeStyle = css.getPropertyValue('--text').trim();
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let k = 0; k <= 180; k++) {
      const t = (2 * Math.PI * k) / 180;
      const [px, py] = toPx([2 * Math.cos(t), 2 * Math.sin(t)]);
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    for (let k = 0; k <= 180; k++) {
      const t = (2 * Math.PI * k) / 180;
      const [px, py] = toPx([3 * Math.cos(t), Math.sin(t)]);
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    SYSTEM_ROOTS.forEach((r) => {
      const [px, py] = toPx(r);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.stroke();
    });
    const total = W * H;
    setChildren(stats,
      ...['I', 'II', 'III', 'IV'].map((q, k) => stat(`→ Nullstelle ${q}`, `${fmt((counts[k] / total) * 100, 1)} %`)),
      stat('keine Konvergenz', `${fmt((counts[4] / total) * 100, 1)} %`, 'grau'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Verfahren', value: state.method, options: [{ value: 'newton', label: 'Newton' }, { value: 'relaxation', label: 'Relaxation' }], onChange: (v) => { state.method = v; draw(); } }),
      sigmaSlider,
    ),
    canvas,
    stats,
    h('p', { class: 'widget__hint' }, 'Jeder Bildpunkt ist ein Startwert in [−4, 4] × [−3, 3]; die Farbe zeigt, welche Nullstelle erreicht wird (heller = mehr Schritte). Bei der Relaxation gibt es je nach Vorzeichen von σ nur eine einzige erreichbare Nullstelle.'),
  );
  draw();
}
