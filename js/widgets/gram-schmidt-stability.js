/**
 * Widget: Orthogonalitätsverlust ‖QᵀQ − I‖∞ für klassisches und modifiziertes
 * Gram-Schmidt sowie Householder (Beispiel 11.5).
 */
import { h, setChildren, controls, segmented } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { collocationMatrix } from '../lib/numerics/integral.js';
import { gramSchmidt, householderQR, orthogonalityLoss } from '../lib/numerics/qr.js';
import { inverse } from '../lib/numerics/lu.js';
import { normInf } from '../lib/numerics/linalg.js';

const GAMMAS = [0.9, 0.5, 0.2, 0.1, 0.05, 0.02, 1e-2, 5e-3, 2e-3, 1e-3, 5e-4, 2e-4, 1e-4, 1e-5];

export default function mount(el) {
  const state = { n: 32 };
  const plot = h('div', { class: 'plot-container' });

  function update() {
    const rows = GAMMAS.map((g) => {
      const A = collocationMatrix(state.n, g);
      const cond = normInf(A) * normInf(inverse(A));
      const qHouseholder = householderQR(A).Q.map((row) => row.slice(0, state.n));
      return {
        cond,
        cgs: orthogonalityLoss(gramSchmidt(A, 'classical').Q),
        mgs: orthogonalityLoss(gramSchmidt(A, 'modified').Q),
        hh: orthogonalityLoss(qHouseholder),
      };
    }).sort((a, b) => a.cond - b.cond);
    const floor = 1e-17;
    renderPlot(plot, {
      height: 300,
      x: { label: 'cond∞(A)', log: true },
      y: { label: '‖QᵀQ − I‖∞', log: true, min: 1e-16, max: 10 },
      series: [
        { data: rows.map((r) => [r.cond, Math.max(r.cgs, floor)]), label: 'klassisches Gram-Schmidt', color: 5 },
        { data: rows.map((r) => [r.cond, Math.max(r.mgs, floor)]), label: 'modifiziertes Gram-Schmidt', color: 2 },
        { data: rows.map((r) => [r.cond, Math.max(r.hh, floor)]), label: 'Householder (VL 12)', color: 3 },
      ],
      ariaLabel: 'Orthogonalitätsverlust in Abhängigkeit der Kondition',
    });
  }

  setChildren(el,
    controls(segmented({ label: 'Größe n', value: '32', options: ['16', '32', '64'].map((v) => ({ value: v, label: v })), onChange: (v) => { state.n = Number(v); update(); } })),
    plot,
    h('p', { class: 'widget__hint' }, 'Matrizen aus der Integralgleichung (Beispiel 8.6) mit verschiedenen γ. Das klassische Verfahren verliert schnell jede Orthogonalität, das modifizierte verliert sie proportional zu cond(A) – Householder bleibt auf Maschinengenauigkeit.'),
  );
  update();
}
