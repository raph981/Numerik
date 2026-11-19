/**
 * Bernstein-Polynome, Bézier-Kurven und der Algorithmus von de Casteljau (Vorlesung 22).
 */

export function binomial(n, k) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

/** Bernstein-Polynom B_i^{(n)}(t) = C(n,i) (1 − t)^{n−i} t^i (Definition 22.1). */
export function bernstein(n, i, t) {
  return binomial(n, i) * (1 - t) ** (n - i) * t ** i;
}

/** Bernstein-Approximation f_n(t) = Σ f(i/n) B_i^{(n)}(t) (Satz 22.3). */
export function bernsteinApproximation(f, n, t) {
  let s = 0;
  for (let i = 0; i <= n; i++) s += f(i / n) * bernstein(n, i, t);
  return s;
}

/** Bézier-Kurve x(t) = Σ b_i B_i^{(n)}(t) direkt über die Basis (Definition 22.5). */
export function bezierPoint(points, t) {
  const n = points.length - 1;
  return points.reduce((acc, p, i) => {
    const w = bernstein(n, i, t);
    return [acc[0] + w * p[0], acc[1] + w * p[1]];
  }, [0, 0]);
}

/**
 * Algorithmus von de Casteljau: b_i^{(k)} = (1 − t) b_i^{(k−1)} + t b_{i+1}^{(k−1)}.
 * @returns {number[][][]} levels[k] = Punkte der Stufe k; levels[n][0] = x(t)
 */
export function deCasteljau(points, t) {
  const levels = [points.map((p) => [...p])];
  while (levels.at(-1).length > 1) {
    const prev = levels.at(-1);
    levels.push(prev.slice(0, -1).map((p, i) => [(1 - t) * p[0] + t * prev[i + 1][0], (1 - t) * p[1] + t * prev[i + 1][1]]));
  }
  return levels;
}

/** Konvexe Hülle (Andrew's Monotone Chain), gegen den Uhrzeigersinn. */
export function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
