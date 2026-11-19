/**
 * Kollokationsmethode für die Fredholm'sche Integralgleichung 1. Art
 *   ∫₀¹ K(x, y) u(y) dy = f(x),   K(x, y) = |x − y|^{−γ}   (Abschnitt 8.4).
 */

/** Rechte Seite aus Beispiel 8.6. */
export const rhsExample = (x) => 1 / (1.1 + Math.sin(7 * Math.PI * x));

/** Mittelpunkte c_i = (i + ½) h der n Teilintervalle von (0, 1). */
export function midpoints(n) {
  const h = 1 / n;
  return Array.from({ length: n }, (_, i) => (i + 0.5) * h);
}

/**
 * Systemmatrix (8.13): a_ij = ∫_{c_j − h/2}^{c_j + h/2} |c_i − y|^{−γ} dy (geschlossen integriert).
 */
export function collocationMatrix(n, gamma) {
  const h = 1 / n;
  const c = midpoints(n);
  const p = 1 - gamma;
  return c.map((ci) => c.map((cj) => {
    const d = Math.abs(ci - cj);
    if (d === 0) return (2 / p) * (h / 2) ** p;
    return ((d + h / 2) ** p - (d - h / 2) ** p) / p;
  }));
}
