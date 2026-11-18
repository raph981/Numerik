/**
 * Gauß-Elimination als Folge von Zwischenzuständen (Vorlesung 7).
 * Die Funktionen sind so geschrieben, dass jeder Schritt einzeln
 * visualisiert werden kann.
 */

const copy = (M) => M.map((row) => [...row]);

/**
 * Führt die Gauß-Elimination (Algorithmus 7.1) auf [A | b] durch und
 * protokolliert jeden Schritt.
 *
 * @param {number[][]} A  n×n
 * @param {number[]} b
 * @param {'zero'|'partial'} pivoting  'zero': nur tauschen, wenn das Pivot 0 ist
 *                                     (wie im Skript); 'partial': betragsgrößtes Pivot
 * @returns {{steps: object[], upper: number[][], rhs: number[], L: number[][], perm: number[]}}
 *   steps[k] = { k, swap: [k, s] | null, pivot, l: number[], before, after, frobenius, permutation }
 */
export function gaussElimination(A, b, pivoting = 'zero') {
  const n = A.length;
  let M = A.map((row, i) => [...row, b[i]]);
  const steps = [];
  const L = A.map((_, i) => A.map((__, j) => (i === j ? 1 : 0)));
  const perm = A.map((_, i) => i);

  for (let k = 0; k < n - 1; k++) {
    const before = copy(M);
    let s = k;
    if (pivoting === 'partial') {
      for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[s][k])) s = i;
    } else if (M[k][k] === 0) {
      s = M.findIndex((row, i) => i > k && row[k] !== 0);
      if (s < 0) throw new Error('Matrix ist singulär');
    }
    if (M[s][k] === 0) throw new Error('Matrix ist singulär');

    if (s !== k) {
      [M[k], M[s]] = [M[s], M[k]];
      [perm[k], perm[s]] = [perm[s], perm[k]];
      // bereits berechnete Multiplikatoren mittauschen (Lemma 7.10 iv)
      for (let j = 0; j < k; j++) [L[k][j], L[s][j]] = [L[s][j], L[k][j]];
    }
    const swapped = copy(M);

    const l = new Array(n).fill(0);
    for (let i = k + 1; i < n; i++) {
      l[i] = M[i][k] / M[k][k];
      L[i][k] = l[i];
      for (let j = k; j <= n; j++) M[i][j] -= l[i] * M[k][j];
      M[i][k] = 0; // exakt null (vermeidet Rundungsreste in der Anzeige)
    }

    steps.push({
      k,
      swap: s !== k ? [k, s] : null,
      pivot: M[k][k],
      l,
      before,
      swapped,
      after: copy(M),
      frobenius: frobeniusMatrix(n, k, l.map((v) => -v)),
      permutation: permutationMatrix(n, k, s),
    });
  }
  if (M[n - 1][n - 1] === 0) throw new Error('Matrix ist singulär');

  return {
    steps,
    upper: M.map((row) => row.slice(0, n)),
    rhs: M.map((row) => row[n]),
    L,
    perm,
  };
}

/**
 * Rückwärtseinsetzen (7.2), (7.3) mit Protokoll.
 * @returns {{x:number[], steps:{i:number, terms:number[], value:number}[]}}
 */
export function backSubstitution(U, c) {
  const n = U.length;
  const x = new Array(n).fill(0);
  const steps = [];
  for (let i = n - 1; i >= 0; i--) {
    let s = c[i];
    const terms = [];
    for (let j = i + 1; j < n; j++) {
      terms.push(j);
      s -= U[i][j] * x[j];
    }
    x[i] = s / U[i][i];
    steps.push({ i, terms, value: x[i] });
  }
  return { x, steps };
}

/** Frobeniusmatrix G_k(g) = I + g e_kᵀ (Definition 7.9). */
export function frobeniusMatrix(n, k, g) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0) + (j === k ? g[i] : 0)));
}

/** Permutationsmatrix P_{r,s} (Definition 7.6). */
export function permutationMatrix(n, r, s) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => {
    const row = i === r ? s : i === s ? r : i;
    return j === row ? 1 : 0;
  }));
}

/** Rechenaufwand: Dreieckssystem n², Gauß ≈ 2/3 n³ (exakt nach Lemma 7.5). */
export function operationCounts(n) {
  let gauss = 0;
  for (let k = 1; k < n; k++) gauss += (n - k) + (n - k) * (2 * (n - k) + 2);
  return { triangular: n * n, gauss, gaussLeading: (2 / 3) * n ** 3 };
}
