/**
 * LU-Zerlegung P A Q = L U mit wählbarer Pivotisierung (Vorlesungen 8 und 9).
 *
 * Alle Operationen können mit einer Rundungsfunktion rd ausgeführt werden,
 * um Fließkommaarithmetik geringerer Genauigkeit zu simulieren
 * (z. B. Math.fround für float oder roundSig für F(10, r)).
 */

const identity = (v) => v;
const copy = (M) => M.map((row) => [...row]);

/**
 * @param {number[][]} A  n×n
 * @param {{pivoting?: 'none'|'zero'|'partial'|'full', rd?: (v:number)=>number}} [options]
 *   none:    nie tauschen (Fehler bei Pivot 0)
 *   zero:    nur tauschen, wenn das Pivot 0 ist (Skript, Algorithmus 7.1)
 *   partial: Spaltenpivotisierung – betragsgrößtes Element der Spalte (Def. 9.5)
 *   full:    Totalpivotisierung – betragsgrößtes Element der Restmatrix
 * @returns {{L:number[][], U:number[][], rowPerm:number[], colPerm:number[], steps:object[], compact:number[][]}}
 *   rowPerm[i] = Zeile von A, die in P A an Position i steht (analog colPerm für Spalten)
 *   steps[k]   = { k, pivotRow, pivotCol, pivot, before, after } (kompakte Speicherung, L unterhalb der Diagonale)
 */
export function luDecompose(A, { pivoting = 'partial', rd = identity } = {}) {
  const n = A.length;
  const M = copy(A); // kompakte Speicherung: L strikt unten, U oben (Abschnitt 8.3)
  const rowPerm = A.map((_, i) => i);
  const colPerm = A.map((_, i) => i);
  const steps = [];

  for (let k = 0; k < n - 1; k++) {
    const before = copy(M);
    let pr = k;
    let pc = k;
    if (pivoting === 'partial') {
      for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[pr][k])) pr = i;
    } else if (pivoting === 'full') {
      for (let i = k; i < n; i++) {
        for (let j = k; j < n; j++) if (Math.abs(M[i][j]) > Math.abs(M[pr][pc])) { pr = i; pc = j; }
      }
    } else if (pivoting === 'zero' && M[k][k] === 0) {
      pr = M.findIndex((row, i) => i > k && row[k] !== 0);
      if (pr < 0) pr = k;
    }
    if (M[pr][pc] === 0) throw new Error(`Pivotelement in Schritt ${k + 1} ist 0`);

    if (pr !== k) {
      [M[k], M[pr]] = [M[pr], M[k]];
      [rowPerm[k], rowPerm[pr]] = [rowPerm[pr], rowPerm[k]];
    }
    if (pc !== k) {
      for (const row of M) [row[k], row[pc]] = [row[pc], row[k]];
      [colPerm[k], colPerm[pc]] = [colPerm[pc], colPerm[k]];
    }

    const pivot = M[k][k];
    for (let i = k + 1; i < n; i++) {
      const l = rd(M[i][k] / pivot);
      M[i][k] = l;
      for (let j = k + 1; j < n; j++) M[i][j] = rd(M[i][j] - rd(l * M[k][j]));
    }
    steps.push({ k, pivotRow: pr, pivotCol: pc, pivot, before, after: copy(M) });
  }
  if (M[n - 1][n - 1] === 0) throw new Error('Matrix ist singulär');

  const L = M.map((row, i) => row.map((v, j) => (i === j ? 1 : j < i ? v : 0)));
  const U = M.map((row, i) => row.map((v, j) => (j >= i ? v : 0)));
  return { L, U, rowPerm, colPerm, steps, compact: M };
}

/** Vorwärtseinsetzen für L y = b (L mit Einsen auf der Diagonale, falls unit). */
export function forwardSubstitution(L, b, { rd = identity, unit = true } = {}) {
  const y = [];
  for (let i = 0; i < b.length; i++) {
    let s = b[i];
    for (let j = 0; j < i; j++) s = rd(s - rd(L[i][j] * y[j]));
    y.push(unit ? s : rd(s / L[i][i]));
  }
  return y;
}

/** Rückwärtseinsetzen für U x = y. */
export function backwardSubstitution(U, y, { rd = identity } = {}) {
  const n = y.length;
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let j = i + 1; j < n; j++) s = rd(s - rd(U[i][j] * x[j]));
    x[i] = rd(s / U[i][i]);
  }
  return x;
}

/**
 * Löst A x = b mit einer vorhandenen Zerlegung (Algorithmus 8.5):
 * b̃ = P b,  L z = b̃,  U y = z,  x = Q y.
 */
export function luSolve({ L, U, rowPerm, colPerm }, b, { rd = identity } = {}) {
  const bp = rowPerm.map((i) => b[i]);
  const z = forwardSubstitution(L, bp, { rd });
  const y = backwardSubstitution(U, z, { rd });
  const x = new Array(y.length);
  colPerm.forEach((j, k) => { x[j] = y[k]; });
  return { bp, z, y, x };
}

/** Inverse über n rechte Seiten (Bemerkung 8.3 c). */
export function inverse(A, { rd = identity, pivoting = 'partial' } = {}) {
  const dec = luDecompose(A, { rd, pivoting });
  const n = A.length;
  const cols = A.map((_, j) => luSolve(dec, A.map((__, i) => (i === j ? 1 : 0)), { rd }).x);
  return Array.from({ length: n }, (_, i) => cols.map((c) => c[i]));
}

/** Wachstumsfaktor ‖U‖∞ / ‖A‖∞ (Abschnitt 9.4). */
export function growthFactor(A, U) {
  const nInf = (M) => Math.max(...M.map((row) => row.reduce((s, v) => s + Math.abs(v), 0)));
  return nInf(U) / nInf(A);
}

/**
 * Matrix mit maximalem Wachstum 2^{n−1} bei Spaltenpivotisierung:
 * 1 auf der Diagonale und in der letzten Spalte, −1 unterhalb der Diagonale.
 */
export function wilkinsonMatrix(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => {
    if (j === n - 1 || i === j) return 1;
    return j < i ? -1 : 0;
  }));
}

/** Permutationsmatrix aus einem Permutationsvektor (Zeile i = Einheitsvektor perm[i]). */
export function permutationFromVector(perm) {
  return perm.map((p) => perm.map((_, j) => (j === p ? 1 : 0)));
}
