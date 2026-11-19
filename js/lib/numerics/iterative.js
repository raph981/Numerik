/**
 * Lineare Iterationsverfahren x^{k+1} = x^k + W⁻¹(b − A x^k) (Vorlesungen 13 und 14).
 */
import { matVec, norm2 } from './linalg.js';

export const METHODS = {
  richardson: { label: 'Richardson' },
  jacobi: { label: 'Jacobi' },
  gaussSeidel: { label: 'Gauß-Seidel' },
};

/**
 * Ein Iterationsschritt. Für Richardson ist W = I/ω, Jacobi W = D, Gauß-Seidel W = L + D.
 * @returns {number[]} x^{k+1}
 */
export function iterationStep(A, b, x, method, omega = 1) {
  const n = b.length;
  const d = b.map((bi, i) => bi - A[i].reduce((s, a, j) => s + a * x[j], 0)); // Defekt
  if (method === 'richardson') return x.map((xi, i) => xi + omega * d[i]);
  if (method === 'jacobi') return x.map((xi, i) => xi + d[i] / A[i][i]);
  // Gauß-Seidel: W v = d mit W = L + D durch Vorwärtseinsetzen
  const v = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = d[i];
    for (let j = 0; j < i; j++) s -= A[i][j] * v[j];
    v[i] = s / A[i][i];
  }
  return x.map((xi, i) => xi + v[i]);
}

/**
 * Führt die Iteration aus und protokolliert Iterierte, Fehler und Defekte.
 * @returns {{iterates:number[][], errors:number[], residuals:number[]}}
 */
export function runIteration(A, b, x0, method, { omega = 1, maxIt = 100, exact = null } = {}) {
  const iterates = [x0];
  const residualOf = (x) => {
    const Ax = matVec(A, x);
    return norm2(b.map((bi, i) => bi - Ax[i]));
  };
  const errorOf = (x) => (exact ? norm2(x.map((xi, i) => exact[i] - xi)) : NaN);
  const errors = [errorOf(x0)];
  const residuals = [residualOf(x0)];
  let x = x0;
  for (let k = 0; k < maxIt; k++) {
    x = iterationStep(A, b, x, method, omega);
    iterates.push(x);
    errors.push(errorOf(x));
    residuals.push(residualOf(x));
    if (!Number.isFinite(residuals.at(-1)) || residuals.at(-1) > 1e100) break;
  }
  return { iterates, errors, residuals };
}

/**
 * Iterationsmatrix S = I − W⁻¹A (dicht, für kleine n).
 */
export function iterationMatrix(A, method, omega = 1) {
  const n = A.length;
  // Spalte j von S = Ergebnis eines Schrittes für b = 0 mit Startvektor e_j
  const cols = Array.from({ length: n }, (_, j) => iterationStep(A, new Array(n).fill(0), A.map((__, i) => (i === j ? 1 : 0)), method, omega));
  return Array.from({ length: n }, (_, i) => cols.map((c) => c[i]));
}

/** Matrix des 1D-Poissonproblems tridiag(−1, 2, −1) der Größe n. */
export function poisson1D(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 2 : Math.abs(i - j) === 1 ? -1 : 0)));
}

/**
 * Analytische Konvergenzraten für poisson1D(n): Eigenwerte λ_k = 2 − 2cos(kπ/(n+1)).
 */
export function poissonRates(n) {
  const t = Math.PI / (n + 1);
  const lmin = 2 - 2 * Math.cos(t);
  const lmax = 2 - 2 * Math.cos(n * t);
  return {
    lambdaMin: lmin,
    lambdaMax: lmax,
    kappa: lmax / lmin,
    richardson: 1 - lmin / lmax, // ω = 1/λmax (Satz 14.1)
    jacobi: Math.cos(t),
    gaussSeidel: Math.cos(t) ** 2,
  };
}

/** Benötigte Schritte k(ε) = |ln ε| / |ln ϱ| (Abschnitt 14.3). */
export function stepsForReduction(rate, eps) {
  return Math.ceil(Math.abs(Math.log(eps)) / Math.abs(Math.log(rate)));
}
