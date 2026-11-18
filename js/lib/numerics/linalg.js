/**
 * Minimale lineare Algebra für kleine, dichte Systeme.
 * Matrizen sind Arrays von Zeilen: A[i][j].
 */

/** Transponierte Matrix. */
export function transpose(A) {
  return A[0].map((_, j) => A.map((row) => row[j]));
}

/** Matrix-Matrix-Produkt A·B. */
export function matMul(A, B) {
  const Bt = transpose(B);
  return A.map((row) => Bt.map((col) => dot(row, col)));
}

/** Matrix-Vektor-Produkt A·x. */
export function matVec(A, x) {
  return A.map((row) => dot(row, x));
}

/** Skalarprodukt. */
export function dot(x, y) {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * y[i];
  return s;
}

/** Euklidische Norm. */
export function norm2(x) {
  return Math.sqrt(dot(x, x));
}

/**
 * Löst das 2×2-System A x = b mit der Cramerschen Regel.
 * @throws {Error} falls A (numerisch) singulär ist
 */
export function solve2x2(A, b) {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (det === 0 || !Number.isFinite(det)) {
    throw new Error('Matrix ist singulär');
  }
  return [
    (b[0] * A[1][1] - A[0][1] * b[1]) / det,
    (A[0][0] * b[1] - b[0] * A[1][0]) / det,
  ];
}
