/**
 * Ausgleichsrechnung, Gram-Schmidt und Householder-QR (Vorlesungen 11 und 12).
 * Matrizen sind Arrays von Zeilen.
 */
import { dot, transpose } from './linalg.js';

const identity = (v) => v;
const column = (A, j) => A.map((row) => row[j]);

/** Basisfunktionen für die Ausgleichsrechnung (Abschnitt 11.1). */
export const BASES = {
  poly: { label: 'Polynome xʲ⁻¹', fn: (j, x) => x ** (j - 1) },
  sin: { label: 'sin(jπx)', fn: (j, x) => Math.sin(j * Math.PI * x) },
};

/** Matrix a_ij = u_j(x_i) mit n Basisfunktionen. */
export function designMatrix(xs, n, basis = 'poly') {
  return xs.map((x) => Array.from({ length: n }, (_, j) => BASES[basis].fn(j + 1, x)));
}

/**
 * Gram-Schmidt-Orthogonalisierung der Spalten von A (Algorithmus 11.2 bzw. 11.4).
 * @param {'classical'|'modified'} variant
 * @returns {{Q:number[][], R:number[][]}} schmale QR-Zerlegung A = QR
 */
export function gramSchmidt(A, variant = 'modified', rd = identity) {
  const m = A.length;
  const n = A[0].length;
  const qs = [];
  const R = Array.from({ length: n }, () => new Array(n).fill(0));
  const rdot = (x, y) => x.reduce((s, v, i) => rd(s + rd(v * y[i])), 0);
  for (let k = 0; k < n; k++) {
    const a = column(A, k);
    let q = [...a];
    for (let j = 0; j < k; j++) {
      // klassisch: Koeffizient mit dem Original a_k, modifiziert: mit dem aktuellen q
      const r = rdot(variant === 'classical' ? a : q, qs[j]);
      R[j][k] = r;
      q = q.map((v, i) => rd(v - rd(r * qs[j][i])));
    }
    const norm = rd(Math.sqrt(rdot(q, q)));
    R[k][k] = norm;
    qs.push(q.map((v) => rd(v / norm)));
  }
  const Q = Array.from({ length: m }, (_, i) => qs.map((q) => q[i]));
  return { Q, R };
}

/** ‖QᵀQ − I‖∞ – Verlust der Orthogonalität (Beispiel 11.5). */
export function orthogonalityLoss(Q) {
  const QtQ = transpose(Q).map((qi) => transpose(Q).map((qj) => dot(qi, qj)));
  return Math.max(...QtQ.map((row, i) => row.reduce((s, v, j) => s + Math.abs(v - (i === j ? 1 : 0)), 0)));
}

/**
 * Householder-Vektor v mit Q_v x = β e₁ (Gleichungen 12.1, 12.2, z = e₁).
 * @returns {{v:number[], beta:number}}
 */
export function householderVector(x) {
  const norm = Math.sqrt(dot(x, x));
  const sign = x[0] >= 0 ? 1 : -1;
  const v = [...x];
  v[0] += sign * norm;
  return { v, beta: -sign * norm };
}

/** Anwendung von Q_v = I − 2vvᵀ/(vᵀv) auf einen Vektor (Abschnitt 12.3). */
export function applyHouseholder(v, x) {
  const vv = dot(v, v);
  if (vv === 0) return [...x];
  const f = (2 * dot(v, x)) / vv;
  return x.map((xi, i) => xi - f * v[i]);
}

/**
 * Volle QR-Zerlegung mit Householder-Spiegelungen (Satz 12.3), mit Protokoll.
 * @returns {{Q:number[][], R:number[][], vectors:number[][], steps:{k:number, v:number[], beta:number, after:number[][]}[]}}
 */
export function householderQR(A) {
  const m = A.length;
  const n = A[0].length;
  let R = A.map((row) => [...row]);
  const vectors = [];
  const steps = [];
  for (let k = 0; k < Math.min(n, m - 1); k++) {
    const x = R.slice(k).map((row) => row[k]);
    const { v: vt, beta } = householderVector(x);
    const v = [...new Array(k).fill(0), ...vt];
    vectors.push(v);
    // Rang-1-Update (12.3) spaltenweise
    for (let j = 0; j < n; j++) {
      const col = applyHouseholder(v, column(R, j));
      col.forEach((val, i) => { R[i][j] = val; });
    }
    for (let i = k + 1; i < m; i++) R[i][k] = 0;
    steps.push({ k, v, beta, after: R.map((row) => [...row]) });
  }
  // Q = Q_{v1} ⋯ Q_{vn}: auf die Einheitsvektoren anwenden
  const Q = Array.from({ length: m }, (_, j) => {
    let e = Array.from({ length: m }, (__, i) => (i === j ? 1 : 0));
    for (let k = vectors.length - 1; k >= 0; k--) e = applyHouseholder(vectors[k], e);
    return e;
  });
  return { Q: transpose(Q), R, vectors, steps };
}

/** Ausgleichsproblem min ‖Az − y‖₂ über die Normalengleichung AᵀAz = Aᵀy. */
export function solveNormalEquations(A, y, solve) {
  const At = transpose(A);
  const AtA = At.map((ri) => At.map((rj) => dot(ri, rj)));
  return solve(AtA, At.map((r) => dot(r, y)));
}

/** Ausgleichsproblem über Householder-QR: R̃ z = (Qᵀy)₁…ₙ. */
export function solveLeastSquaresQR(A, y) {
  const n = A[0].length;
  const { Q, R } = householderQR(A);
  const qty = transpose(Q).map((qi) => dot(qi, y));
  const z = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = qty[i];
    for (let j = i + 1; j < n; j++) s -= R[i][j] * z[j];
    z[i] = s / R[i][i];
  }
  return z;
}
