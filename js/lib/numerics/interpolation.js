/**
 * Polynominterpolation und numerische Differentiation (Vorlesungen 17 und 18).
 */

/** Äquidistante Stützstellen x_i = a + i(b − a)/n, i = 0 … n. */
export function equidistantNodes(a, b, n) {
  return Array.from({ length: n + 1 }, (_, i) => (n === 0 ? (a + b) / 2 : a + ((b - a) * i) / n));
}

/** Tschebyscheff-Stützstellen (Nullstellen von T_{n+1}) auf [a, b]. */
export function chebyshevNodes(a, b, n) {
  return Array.from({ length: n + 1 }, (_, i) => (a + b) / 2 + ((b - a) / 2) * Math.cos(((2 * i + 1) * Math.PI) / (2 * n + 2))).reverse();
}

/** Vandermonde-Matrix V[x_0, …, x_n] (17.1). */
export function vandermonde(xs) {
  return xs.map((x) => xs.map((_, j) => x ** j));
}

/** i-tes Lagrange-Polynom L_i^{(n)}(x) (Definition 17.2). */
export function lagrangeBasis(xs, i, x) {
  let p = 1;
  for (let j = 0; j < xs.length; j++) if (j !== i) p *= (x - xs[j]) / (xs[i] - xs[j]);
  return p;
}

/** Interpolationspolynom p(x) = Σ y_i L_i(x) (Satz 17.4). */
export function lagrangeEval(xs, ys, x) {
  return ys.reduce((s, y, i) => s + y * lagrangeBasis(xs, i, x), 0);
}

/**
 * Tableau der dividierten Differenzen (Satz 17.9).
 * @returns {number[][]} table[i][k] = y[x_i, …, x_{i+k}]; die erste Zeile enthält die Newton-Koeffizienten
 */
export function dividedDifferences(xs, ys) {
  const n = xs.length;
  const table = xs.map((_, i) => [ys[i]]);
  for (let k = 1; k < n; k++) {
    for (let i = 0; i + k < n; i++) {
      table[i][k] = (table[i + 1][k - 1] - table[i][k - 1]) / (xs[i + k] - xs[i]);
    }
  }
  return table;
}

/** i-tes Newton-Polynom N_i(x) = Π_{j<i}(x − x_j) (Definition 17.7). */
export function newtonBasis(xs, i, x) {
  let p = 1;
  for (let j = 0; j < i; j++) p *= x - xs[j];
  return p;
}

/** Auswertung der Newton-Darstellung p(x) = Σ a_i N_i(x) mit einem Horner-artigen Schema. */
export function newtonEval(xs, coeffs, x) {
  let p = coeffs.at(-1);
  for (let i = coeffs.length - 2; i >= 0; i--) p = coeffs[i] + (x - xs[i]) * p;
  return p;
}

/**
 * Neville-Schema (Satz 17.10): tableau[i][k] = p_{i,i+k}(x); p(x) = tableau[0][n].
 */
export function neville(xs, ys, x) {
  const n = xs.length;
  const t = xs.map((_, i) => [ys[i]]);
  for (let k = 1; k < n; k++) {
    for (let i = 0; i + k < n; i++) {
      t[i][k] = t[i][k - 1] + ((x - xs[i]) * (t[i + 1][k - 1] - t[i][k - 1])) / (xs[i + k] - xs[i]);
    }
  }
  return t;
}

/** Horner-Schema für p(x) = Σ a_k x^k (Abschnitt 18.1). */
export function horner(coeffs, x) {
  let b = coeffs.at(-1);
  for (let k = coeffs.length - 2; k >= 0; k--) b = coeffs[k] + x * b;
  return b;
}

/** Knotenpolynom ω(x) = Π (x − x_j) aus der Fehlerformel (Satz 18.2). */
export function nodePolynomial(xs, x) {
  return xs.reduce((p, xj) => p * (x - xj), 1);
}

/* ---------- Numerische Differentiation (Abschnitt 18.2) ---------- */

export const DIFFERENCE_QUOTIENTS = {
  forward: { label: 'vorwärts (f(x+h) − f(x))/h', order: 1, derivative: 1, apply: (f, x, h) => (f(x + h) - f(x)) / h },
  central: { label: 'zentral (f(x+h) − f(x−h))/2h', order: 2, derivative: 1, apply: (f, x, h) => (f(x + h) - f(x - h)) / (2 * h) },
  second: { label: '2. Ableitung (f(x+h) − 2f(x) + f(x−h))/h²', order: 2, derivative: 2, apply: (f, x, h) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h) },
};
