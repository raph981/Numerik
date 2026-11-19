/**
 * Spezielle Gleichungssysteme (Vorlesung 10) und Besetzungsstrukturen (Vorlesung 13).
 */
import { luDecompose } from './lu.js';

/** Deterministischer Zufallsgenerator (LCG) mit Werten in [−1, 1). */
export function createRng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return (s / 4294967296) * 2 - 1;
  };
}

/**
 * Zerlegung A = L D Lᵀ und Cholesky A = L̃ L̃ᵀ einer symmetrischen Matrix (Satz 10.2),
 * mit Protokoll der Pivots (= Diagonalelemente von D).
 * @throws {Error} wenn ein Pivot ≤ 0 auftritt (A nicht positiv definit)
 */
export function cholesky(A) {
  const n = A.length;
  const M = A.map((row) => [...row]);
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
  const D = new Array(n).fill(0);
  const steps = [];
  for (let k = 0; k < n; k++) {
    const alpha = M[k][k];
    if (!(alpha > 0)) throw new Error(`Pivot d${k + 1} = ${alpha.toFixed(3)} ≤ 0: A ist nicht positiv definit`);
    D[k] = alpha;
    for (let i = k + 1; i < n; i++) L[i][k] = M[i][k] / alpha;
    // Restmatrix B − (1/α) v vᵀ (nur das untere Dreieck müsste berechnet werden)
    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) M[i][j] -= (M[i][k] * M[k][j]) / alpha;
    }
    for (let i = k + 1; i < n; i++) { M[i][k] = 0; M[k][i] = 0; }
    steps.push({ k, alpha, rest: M.map((row) => [...row]) });
  }
  const Ltilde = L.map((row) => row.map((v, j) => v * Math.sqrt(D[j])));
  return { L, D, Ltilde, steps };
}

/** Anzahl der von null verschiedenen Einträge. */
export function countNonzeros(M, tol = 1e-12) {
  return M.flat().filter((v) => Math.abs(v) > tol).length;
}

/** Diagonaldominante Bandmatrix mit Bandbreite m (|i − j| ≥ m ⇒ a_ij = 0). */
export function bandMatrix(n, m, seed = 7) {
  const rnd = createRng(seed);
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (Math.abs(i - j) < m && i !== j ? 0.5 + 0.5 * Math.abs(rnd()) : 0)));
  A.forEach((row, i) => { row[i] = row.reduce((s, v) => s + Math.abs(v), 0) + 1; });
  return A;
}

/**
 * Pfeilmatrix (Abschnitt 13.1): volle erste Zeile/Spalte (reversed = false) bzw.
 * volle letzte Zeile/Spalte (reversed = true), dazu die Diagonale.
 */
export function arrowMatrix(n, reversed = false) {
  const hub = reversed ? n - 1 : 0;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => {
    if (i === j) return n + 1;
    return i === hub || j === hub ? 1 : 0;
  }));
}

/**
 * Besetzung von A und der LU-Faktoren (ohne Pivotisierung).
 * @returns {{A:number[][], L:number[][], U:number[][], nnzA:number, nnzLU:number}}
 */
export function fillIn(A) {
  const { L, U } = luDecompose(A, { pivoting: 'none' });
  return { A, L, U, nnzA: countNonzeros(A), nnzLU: countNonzeros(L) + countNonzeros(U) - A.length };
}
