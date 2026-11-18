/**
 * Taylorpolynome (Satz 3.1).
 */

/** Funktionen mit bekannten höheren Ableitungen f^(k)(x). */
export const FUNCTIONS = {
  exp: { label: 'eˣ', f: Math.exp, derivative: (k, x) => Math.exp(x), domain: [-3, 3] },
  sin: { label: 'sin x', f: Math.sin, derivative: (k, x) => Math.sin(x + (k * Math.PI) / 2), domain: [-2 * Math.PI, 2 * Math.PI] },
  log: {
    label: 'ln(1 + x)',
    f: (x) => Math.log1p(x),
    derivative: (k, x) => (k === 0 ? Math.log1p(x) : ((-1) ** (k - 1) * factorial(k - 1)) / (1 + x) ** k),
    domain: [-0.95, 3],
  },
};

export function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Wert des Taylorpolynoms vom Grad r um x0 an der Stelle z:
 *   t_r(x0, z) = Σ_{k=0}^{r} f^(k)(x0)/k! · (z − x0)^k
 */
export function taylorPolynomial(fn, x0, r, z) {
  let sum = 0;
  for (let k = 0; k <= r; k++) sum += (fn.derivative(k, x0) / factorial(k)) * (z - x0) ** k;
  return sum;
}

/**
 * Restglied |f(x0 + h) − t_r(x0, x0 + h)| für eine Folge von Schrittweiten h.
 * Für kleine h verhält es sich wie O(h^{r+1}).
 * @returns {[number, number][]} Paare (h, Fehler)
 */
export function remainderSeries(fn, x0, r, hs) {
  return hs.map((h) => [h, Math.abs(fn.f(x0 + h) - taylorPolynomial(fn, x0, r, x0 + h))]);
}
