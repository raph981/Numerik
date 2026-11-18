/**
 * Wachstumsmodelle aus Vorlesung 1.
 */

/**
 * Exakte Lösung der Anfangswertaufgabe u' = λu, u(t0) = u0 (Satz 1.1).
 */
export function exponentialSolution(u0, lambda, t0, t) {
  return u0 * Math.exp(lambda * (t - t0));
}

/**
 * Diskretes Modell (1.1): u(t + Δt) = u(t) + λ Δt u(t).
 * Liefert die Punkte (t_k, u_k) auf [t0, tEnd].
 *
 * @returns {[number, number][]}
 */
export function discreteGrowth(u0, lambda, dt, t0, tEnd) {
  const points = [[t0, u0]];
  let u = u0;
  const steps = Math.round((tEnd - t0) / dt);
  for (let k = 1; k <= steps; k++) {
    u = u + lambda * dt * u;
    points.push([t0 + k * dt, u]);
  }
  return points;
}

/**
 * Exakte Lösung des logistischen Modells u' = λ (1 − u/K) u, u(t0) = u0.
 */
export function logisticSolution(u0, lambda, K, t0, t) {
  return K / (1 + (K / u0 - 1) * Math.exp(-lambda * (t - t0)));
}

/** Verdopplungszeit T₂ = ln 2 / λ (Gleichung 1.11). */
export function doublingTime(lambda) {
  return Math.LN2 / lambda;
}
