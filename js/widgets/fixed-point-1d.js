/**
 * Widget: Fixpunktiteration als Spinnweb-Diagramm (Abschnitt 15.3).
 * Drei Umformungen von x·eˣ − 3 = 0 in Fixpunktform g(x) = x.
 */
import { h, setChildren, slider, segmented, controls, stat, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { FIXED_POINT_FORMS, SCALAR_ROOT, fixedPointIteration } from '../lib/numerics/nonlinear.js';

const STEPS = 40;
const LO = 0.2;
const HI = 2.2;

export default function mount(el) {
  const state = { form: 'relaxation', sigma: 0.1, x0: 0.5 };
  const sigmaSlider = slider({ label: 'σ =', min: 0.01, max: 0.4, step: 0.01, value: state.sigma, format: (v) => v.toFixed(2), onInput: (v) => { state.sigma = v; update(); } });
  const stats = h('div', { class: 'stats' });
  const cobweb = h('div', { class: 'plot-container' });
  const errorPlot = h('div', { class: 'plot-container' });

  function update() {
    sigmaSlider.element.hidden = state.form !== 'relaxation';
    const form = FIXED_POINT_FORMS[state.form];
    const g = (x) => form.g(x, state.sigma);
    const xs = fixedPointIteration(g, state.x0, STEPS);
    const q = Math.abs(form.dg(SCALAR_ROOT, state.sigma));

    // Spinnweb: (x0, x0) → (x0, g(x0)) → (g(x0), g(x0)) → …
    const web = [[xs[0], LO]];
    for (let k = 0; k < xs.length - 1; k++) web.push([xs[k], xs[k + 1]], [xs[k + 1], xs[k + 1]]);
    const grid = Array.from({ length: 300 }, (_, k) => LO + ((HI - LO) * k) / 299);
    renderPlot(cobweb, {
      height: 320,
      x: { label: 'x', min: LO, max: HI },
      y: { label: 'y', min: LO, max: HI },
      series: [
        { data: [[LO, LO], [HI, HI]], label: 'y = x', color: 6, dashed: true },
        { data: grid.map((x) => [x, g(x)]).filter(([, y]) => y > LO - 1 && y < HI + 1), label: `y = g(x) = ${form.label}`, color: 1 },
        { data: web, label: 'Iteration', color: 5 },
        { data: [[SCALAR_ROOT, SCALAR_ROOT]], kind: 'points', color: 2, radius: 5 },
      ],
      ariaLabel: 'Spinnweb-Diagramm der Fixpunktiteration',
    });

    const errors = xs.map((x, k) => [k, Math.abs(x - SCALAR_ROOT)]);
    const floor = 1e-16;
    renderPlot(errorPlot, {
      height: 200,
      x: { label: 'Iteration k', min: 0, max: STEPS },
      y: { label: '|xᵏ − ξ|', log: true, min: floor, max: 100 },
      series: [{ data: errors.map(([k, e]) => [k, Math.max(e, floor)]), kind: 'points', color: 5, radius: 2.5 }],
      ariaLabel: 'Fehler der Fixpunktiteration',
    });

    const last = errors.at(-1)[1];
    const converged = last < 1e-8;
    setChildren(stats,
      stat('|g′(ξ)| (lokaler Kontraktionsfaktor)', fmt(q, 4), q < 1 ? 'kleiner 1 → Kontraktion nahe ξ' : 'größer 1 → keine Kontraktion'),
      stat(`Fehler nach ${xs.length - 1} Schritten`, fmtExp(last, 1), converged ? 'konvergiert' : 'konvergiert nicht'),
      stat('Fixpunkt ξ', fmt(SCALAR_ROOT, 10), 'Lösung von x eˣ = 3'),
    );
  }

  setChildren(el,
    controls(
      segmented({ label: 'Fixpunktform g(x)', value: state.form, options: Object.entries(FIXED_POINT_FORMS).map(([k, f]) => ({ value: k, label: f.label })), onChange: (v) => { state.form = v; update(); } }),
      sigmaSlider,
      slider({ label: 'Startwert x⁰ =', min: 0.3, max: 2, step: 0.01, value: state.x0, format: (v) => v.toFixed(2), onInput: (v) => { state.x0 = v; update(); } }),
    ),
    stats,
    cobweb,
    errorPlot,
    h('p', { class: 'widget__hint' }, 'Spinnweb-Diagramm: Von xᵏ senkrecht zur Kurve g, dann waagerecht zur Diagonalen y = x – dort liegt xᵏ⁺¹. Ist die Kurve am Schnittpunkt flacher als die Diagonale (|g′| < 1), zieht sich das Netz zusammen; sonst läuft es auseinander.'),
  );
  update();
}
