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

/* ---------- Normen (Vorlesung 5) ---------- */

/**
 * p-Norm eines Vektors; p = Infinity liefert die Maximumnorm.
 * @param {number[]} x
 * @param {number} p  p ≥ 1 oder Infinity
 */
export function vectorNorm(x, p) {
  if (p === Infinity) return Math.max(...x.map(Math.abs));
  if (p === 1) return x.reduce((s, v) => s + Math.abs(v), 0);
  return x.reduce((s, v) => s + Math.abs(v) ** p, 0) ** (1 / p);
}

/** Zeilensummennorm ‖A‖∞ (Lemma 5.8). */
export function normInf(A) {
  return Math.max(...A.map((row) => row.reduce((s, v) => s + Math.abs(v), 0)));
}

/** Spaltensummennorm ‖A‖₁ (Lemma 5.8). */
export function norm1(A) {
  return normInf(transpose(A));
}

/** Frobeniusnorm (Beispiel 5.6). */
export function normFrobenius(A) {
  return Math.sqrt(A.flat().reduce((s, v) => s + v * v, 0));
}

/** Determinante einer 2×2-Matrix. */
export function det2x2(A) {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

/** Inverse einer 2×2-Matrix. */
export function inverse2x2(A) {
  const d = det2x2(A);
  if (d === 0) throw new Error('Matrix ist singulär');
  return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
}

/**
 * Eigenwerte einer reellen 2×2-Matrix als Nullstellen von
 * λ² − Spur·λ + det = 0 (für 2×2 unproblematisch).
 * @returns {{re:number, im:number}[]}
 */
export function eigenvalues2x2(A) {
  const tr = A[0][0] + A[1][1];
  const d = det2x2(A);
  const disc = (tr * tr) / 4 - d;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return [{ re: tr / 2 + s, im: 0 }, { re: tr / 2 - s, im: 0 }];
  }
  const s = Math.sqrt(-disc);
  return [{ re: tr / 2, im: s }, { re: tr / 2, im: -s }];
}

/** Eigenvektor (normiert) zu einem reellen Eigenwert λ einer 2×2-Matrix. */
export function eigenvector2x2(A, lambda) {
  const [[a, b], [c, d]] = A;
  let v;
  if (Math.abs(b) > 1e-12 || Math.abs(a - lambda) > 1e-12) v = [b, lambda - a];
  else v = [lambda - d, c];
  if (Math.hypot(...v) < 1e-12) v = [1, 0];
  const n = Math.hypot(...v);
  return [v[0] / n, v[1] / n];
}

/** Spektralradius ϱ(A) einer 2×2-Matrix. */
export function spectralRadius2x2(A) {
  return Math.max(...eigenvalues2x2(A).map((l) => Math.hypot(l.re, l.im)));
}

/** Spektralnorm ‖A‖₂ = √ϱ(AᵀA) (Lemma 5.18) für 2×2-Matrizen. */
export function norm2x2(A) {
  return Math.sqrt(spectralRadius2x2(matMul(transpose(A), A)));
}

/**
 * Löst A x = b mit Gauß-Elimination und Spaltenpivotsuche (für kleine Systeme).
 * @throws {Error} falls A singulär ist
 */
export function solve(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    if (Math.abs(M[p][k]) < 1e-14) throw new Error('Matrix ist singulär');
    [M[k], M[p]] = [M[p], M[k]];
    for (let i = k + 1; i < n; i++) {
      const l = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) M[i][j] -= l * M[k][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}
