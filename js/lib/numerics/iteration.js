/**
 * Newton-Iteration für die Quadratwurzel (Heron-Verfahren).
 *
 * Anwendung des Newton-Verfahrens auf f(x) = x² − a liefert
 *   x_{n+1} = ½ (x_n + a / x_n).
 *
 * @param {number} a       Radikand (a > 0)
 * @param {number} x0      Startwert (x0 > 0)
 * @param {number} steps   Anzahl der Iterationsschritte
 * @returns {{n:number, x:number, error:number}[]} alle Iterierten inkl. x0
 */
export function heronIteration(a, x0, steps) {
  const exact = Math.sqrt(a);
  const rows = [];
  let x = x0;
  for (let n = 0; n <= steps; n++) {
    rows.push({ n, x, error: Math.abs(x - exact) });
    x = 0.5 * (x + a / x);
  }
  return rows;
}

/**
 * Anzahl korrekter Dezimalstellen einer Näherung (grob: −log10 des rel. Fehlers).
 * @param {number} approx
 * @param {number} exact
 * @returns {number}
 */
export function correctDigits(approx, exact) {
  if (approx === exact) return 16;
  const rel = Math.abs((approx - exact) / exact);
  return Math.max(0, Math.min(16, Math.floor(-Math.log10(rel))));
}
