/**
 * Nichtlineare Gleichungen: Fixpunktiteration, Relaxation und Newton-Verfahren
 * (Vorlesungen 15 und 16).
 */
import { solve2x2 } from './linalg.js';

/* ---------- Beispiel 15.1 a): f(x) = x·eˣ − 3 ---------- */

export const scalarExample = {
  f: (x) => x * Math.exp(x) - 3,
  df: (x) => (x + 1) * Math.exp(x),
};

/** Nullstelle von x·eˣ = 3 (Lambert-W(3)), auf double-Genauigkeit. */
export const SCALAR_ROOT = 1.0499088949640398;

/** Drei Fixpunktformen von x·eˣ − 3 = 0 (Abschnitt 15.3). */
export const FIXED_POINT_FORMS = {
  relaxation: { label: 'x − σ(x eˣ − 3)', g: (x, sigma) => x - sigma * (x * Math.exp(x) - 3), dg: (x, sigma) => 1 - sigma * (x + 1) * Math.exp(x) },
  exp: { label: '3 / eˣ', g: (x) => 3 / Math.exp(x), dg: (x) => -3 / Math.exp(x) },
  log: { label: 'ln 3 − ln x', g: (x) => Math.log(3) - Math.log(x), dg: (x) => -1 / x },
};

/**
 * Fixpunktiteration x^{k+1} = g(x^k) (15.1).
 * @returns {number[]} alle Iterierten inkl. x0 (bricht bei Nicht-Endlichkeit ab)
 */
export function fixedPointIteration(g, x0, steps) {
  const xs = [x0];
  for (let k = 0; k < steps; k++) {
    const next = g(xs.at(-1));
    if (!Number.isFinite(next)) break;
    xs.push(next);
  }
  return xs;
}

/**
 * Newton-Verfahren in einer Variablen x^{k+1} = x^k − f(x^k)/f'(x^k).
 * @returns {number[]} Iterierte
 */
export function newton1d(f, df, x0, steps) {
  const xs = [x0];
  for (let k = 0; k < steps; k++) {
    const x = xs.at(-1);
    const d = df(x);
    if (d === 0) break;
    const next = x - f(x) / d;
    if (!Number.isFinite(next)) break;
    xs.push(next);
    if (next === x) break;
  }
  return xs;
}

/**
 * Geschätzte Konvergenzordnung p aus drei aufeinanderfolgenden Fehlern:
 * p ≈ ln(e_{k+1}/e_k) / ln(e_k/e_{k−1}).
 */
export function estimateOrder(errors) {
  const out = [];
  for (let k = 2; k < errors.length; k++) {
    const [a, b, c] = [errors[k - 2], errors[k - 1], errors[k]];
    out.push(a > 0 && b > 0 && c > 0 && a !== b ? Math.log(c / b) / Math.log(b / a) : NaN);
  }
  return out;
}

/* ---------- Beispiel 15.1 b): Kreis ∩ Ellipse ---------- */

export const systemExample = {
  f: ([x1, x2]) => [x1 * x1 + x2 * x2 - 4, (x1 * x1) / 9 + x2 * x2 - 1],
  jacobian: ([x1, x2]) => [[2 * x1, 2 * x2], [(2 * x1) / 9, 2 * x2]],
};

/** Die vier Lösungen (±√(27/8), ±√(5/8)). */
export const SYSTEM_ROOTS = [
  [Math.sqrt(27 / 8), Math.sqrt(5 / 8)],
  [-Math.sqrt(27 / 8), Math.sqrt(5 / 8)],
  [-Math.sqrt(27 / 8), -Math.sqrt(5 / 8)],
  [Math.sqrt(27 / 8), -Math.sqrt(5 / 8)],
];

const norm = (v) => Math.hypot(...v);

/**
 * Iteration für f(x) = 0 im Rⁿ (hier n = 2):
 *  - relaxation: x ← x − σ f(x)
 *  - newton:     x ← x − J_f(x)⁻¹ f(x)   (16.1)
 * @returns {{iterates:number[][], residuals:number[], converged:boolean}}
 */
export function solveSystem(system, x0, { method = 'newton', sigma = 0.1, maxIt = 200, tol = 1e-10 } = {}) {
  const iterates = [x0];
  const residuals = [norm(system.f(x0))];
  let x = x0;
  for (let k = 0; k < maxIt; k++) {
    const fx = system.f(x);
    let next;
    if (method === 'newton') {
      let v;
      try { v = solve2x2(system.jacobian(x), fx); } catch { break; }
      next = [x[0] - v[0], x[1] - v[1]];
    } else {
      next = [x[0] - sigma * fx[0], x[1] - sigma * fx[1]];
    }
    if (!next.every(Number.isFinite) || norm(next) > 1e8) break;
    x = next;
    iterates.push(x);
    residuals.push(norm(system.f(x)));
    if (residuals.at(-1) <= tol * residuals[0]) return { iterates, residuals, converged: true };
  }
  return { iterates, residuals, converged: false };
}

/** Index der nächstgelegenen Lösung (oder −1, wenn keine nahe genug ist). */
export function nearestRoot(x, roots = SYSTEM_ROOTS, radius = 1e-3) {
  const i = roots.findIndex((r) => Math.hypot(r[0] - x[0], r[1] - x[1]) < radius);
  return i;
}
