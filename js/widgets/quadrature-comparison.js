/**
 * Widget: Vergleich der Quadraturverfahren nach Aufwand (Beispiel 26.7).
 */
import { h, setChildren, segmented, slider, controls, table, fmt, fmtExp } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { EXAMPLE_INTEGRANDS, RULES, composite, romberg, archimedes } from '../lib/numerics/quadrature.js';

const FLOOR = 1e-16;
const LEVELS = Array.from({ length: 15 }, (_, i) => 2 ** i);

/** Fehler-Aufwand-Kurven aller Verfahren: [{label, color, points: [evals, error][]}] */
function convergenceData(F) {
  const err = (v) => Math.max(Math.abs(v - F.exact), FLOOR);
  const compositeCurve = (key) => LEVELS.map((N) => { const r = composite(RULES[key].rule, F.f, F.a, F.b, N); return [r.evals, err(r.value)]; });
  return [
    { label: 'Trapez', color: 3, points: compositeCurve('trapezoid') },
    { label: 'Simpson', color: 2, points: compositeCurve('simpson') },
    { label: 'Gauss4 (2 Punkte)', color: 4, points: compositeCurve('gauss2') },
    { label: 'Gauss6 (3 Punkte)', color: 5, points: compositeCurve('gauss3') },
    { label: 'Romberg', color: 1, points: LEVELS.map((_, n) => { const r = romberg(F.f, F.a, F.b, n); return [r.evals, err(r.tableau[0][n])]; }) },
    {
      label: 'Archimedes (adaptiv)',
      color: 6,
      points: Array.from({ length: 21 }, (_, k) => { const r = archimedes(F.f, F.a, F.b, { tol: 10 ** (-k / 2), minLevel: 2, maxLevel: 40 }); return [r.evals, err(r.value)]; }),
    },
  ];
}

export default function mount(el) {
  const state = { fn: 'sin', targetExp: -6 };
  const plot = h('div', { class: 'plot-container' });
  const summary = h('div');
  const cache = new Map();

  function update() {
    const F = EXAMPLE_INTEGRANDS[state.fn];
    if (!cache.has(state.fn)) cache.set(state.fn, convergenceData(F));
    const curves = cache.get(state.fn);
    const target = 10 ** state.targetExp;
    renderPlot(plot, {
      height: 320,
      x: { label: 'Funktionsauswertungen', log: true, min: 2, max: 4e4 },
      y: { label: '|I − Q|', log: true, min: FLOOR, max: 1e5 },
      series: curves.map((c) => ({ data: c.points.filter(([n]) => n <= 4e4).sort((p, q) => p[0] - q[0]), label: c.label, color: c.color, dashed: c.label.startsWith('Archimedes') })),
      markers: [{ y: target, label: 'Zielgenauigkeit' }],
      ariaLabel: 'Fehler gegen Aufwand für verschiedene Quadraturverfahren',
    });
    setChildren(summary, table(
      ['Verfahren', `Auswertungen für Fehler ≤ ${fmtExp(target, 0)}`],
      curves.map((c) => {
        const hit = c.points.filter(([, e]) => e <= target).sort((p, q) => p[0] - q[0])[0];
        return [c.label, hit ? String(hit[0]) : '> 30 000'];
      }),
    ));
  }

  setChildren(el,
    controls(
      segmented({ label: 'Integrand', value: state.fn, options: Object.entries(EXAMPLE_INTEGRANDS).map(([k, F]) => ({ value: k, label: F.label })), onChange: (v) => { state.fn = v; update(); } }),
      slider({ label: 'Zielgenauigkeit 10^', min: -12, max: -2, step: 1, value: state.targetExp, format: (v) => fmt(v, 0), onInput: (v) => { state.targetExp = v; update(); } }),
    ),
    plot,
    summary,
    h('p', { class: 'widget__hint' }, '(i) glatt: Hohe Ordnung zahlt sich aus – Gauss6 und Romberg erreichen Maschinengenauigkeit mit wenigen Dutzend Auswertungen. (ii) große Ableitungen: Am Anfang hilft nur Adaptivität; asymptotisch holen die Verfahren hoher Ordnung auf. (iii) nicht differenzierbar am Rand: Alle Verfahren fallen auf dieselbe niedrige Ordnung zurück; hohe Ordnung lohnt nicht.'),
  );
  update();
}
