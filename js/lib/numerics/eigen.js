/**
 * Eigenwerte kleiner Matrizen (für Visualisierungen) und Gerschgorin-Kreise.
 */

/**
 * Eigenwerte einer symmetrischen Matrix mit dem zyklischen Jacobi-Verfahren.
 * @returns {number[]} aufsteigend sortiert
 */
export function symmetricEigenvalues(A, { tol = 1e-12, maxSweeps = 60 } = {}) {
  const n = A.length;
  const M = A.map((row) => [...row]);
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += M[p][q] ** 2;
    if (off < tol * tol) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(M[p][q]) < 1e-300) continue;
        const theta = (M[q][q] - M[p][p]) / (2 * M[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const mkp = M[k][p];
          const mkq = M[k][q];
          M[k][p] = c * mkp - s * mkq;
          M[k][q] = s * mkp + c * mkq;
        }
        for (let k = 0; k < n; k++) {
          const mpk = M[p][k];
          const mqk = M[q][k];
          M[p][k] = c * mpk - s * mqk;
          M[q][k] = s * mpk + c * mqk;
        }
      }
    }
  }
  return M.map((row, i) => row[i]).sort((a, b) => a - b);
}

/* ---------- komplexe Hilfsfunktionen ---------- */
const cadd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cdiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};

/**
 * Nullstellen eines normierten Polynoms z^n + c[n−1] z^{n−1} + … + c[0]
 * mit dem Weierstraß-(Durand-Kerner-)Verfahren.
 * @param {number[]} c  Koeffizienten c[0] … c[n−1]
 * @returns {{re:number, im:number}[]}
 */
export function polynomialRoots(c, { iterations = 500 } = {}) {
  const n = c.length;
  const evalP = (z) => {
    let p = { re: 1, im: 0 };
    for (let k = n - 1; k >= 0; k--) p = cadd(cmul(p, z), { re: c[k], im: 0 });
    return p;
  };
  let roots = Array.from({ length: n }, (_, k) => {
    const r = 1 + Math.max(...c.map(Math.abs));
    return { re: r * Math.cos((2 * Math.PI * k) / n + 0.4), im: r * Math.sin((2 * Math.PI * k) / n + 0.4) };
  });
  for (let it = 0; it < iterations; it++) {
    roots = roots.map((z, i) => {
      let denom = { re: 1, im: 0 };
      roots.forEach((w, j) => { if (j !== i) denom = cmul(denom, csub(z, w)); });
      return csub(z, cdiv(evalP(z), denom));
    });
  }
  return roots.map((z) => ({ re: z.re, im: Math.abs(z.im) < 1e-10 ? 0 : z.im }));
}

/** Eigenwerte einer reellen 3×3-Matrix als Nullstellen des charakteristischen Polynoms. */
export function eigenvalues3x3(A) {
  const [[a, b, c], [d, e, f], [g, h, i]] = A;
  const tr = a + e + i;
  const minors = (e * i - f * h) + (a * i - c * g) + (a * e - b * d);
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  // det(λI − A) = λ³ − tr λ² + minors λ − det
  return polynomialRoots([-det, minors, -tr]);
}

/**
 * Gerschgorin-Kreise B(a_kk, r_k) mit r_k = Σ_{j≠k} |a_kj| (Satz 14.2).
 * @returns {{center:number, radius:number}[]}
 */
export function gerschgorinDiscs(A) {
  return A.map((row, k) => ({
    center: row[k],
    radius: row.reduce((s, v, j) => (j === k ? s : s + Math.abs(v)), 0),
  }));
}
