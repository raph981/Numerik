/**
 * Numerische Integration (Vorlesungen 25 und 26).
 *
 * Konvention wie im Skript: Eine Quadraturregel auf [a, b] hat die Form
 *   I_[a,b](f) ≈ (b − a) · Σ w_i f(x_i),   Σ w_i = 1.
 * Regeln werden daher auf dem Referenzintervall [0, 1] beschrieben:
 *   { nodes: s_i ∈ [0, 1], weights: w_i },   x_i = a + s_i (b − a).
 *
 * @typedef {Object} Rule
 * @property {number[]} nodes    relative Stützstellen in [0, 1]
 * @property {number[]} weights  Gewichte (Summe 1)
 */

/** Die Integranden aus Beispiel 25.8 und 26.7. */
export const EXAMPLE_INTEGRANDS = {
  sin: { label: '(i) sin x auf [0, π/2]', f: Math.sin, a: 0, b: Math.PI / 2, exact: 1 },
  peak: { label: '(ii) 1/(10⁻⁵ + x²) auf [−1, 1]', f: (x) => 1 / (1e-5 + x * x), a: -1, b: 1, exact: 9.914588332462438e2 },
  circle: { label: '(iii) √(1 − x²) auf [−1, 1]', f: (x) => Math.sqrt(Math.max(0, 1 - x * x)), a: -1, b: 1, exact: Math.PI / 2 },
};

/* ---------- Legendre-Polynome und Gauß-Quadratur ---------- */

/**
 * Legendre-Polynom P_n(x) und seine Ableitung über die Drei-Term-Rekursion
 *   (k + 1) P_{k+1} = (2k + 1) x P_k − k P_{k−1}.
 * @returns {{p: number, dp: number}}
 */
export function legendreWithDerivative(n, x) {
  if (n === 0) return { p: 1, dp: 0 };
  let prev = 1;
  let p = x;
  for (let k = 1; k < n; k++) [prev, p] = [p, ((2 * k + 1) * x * p - k * prev) / (k + 1)];
  // P_n'(x) = n (x P_n − P_{n−1}) / (x² − 1); an den Rändern gilt P_n'(±1) = (±1)^{n+1} n(n+1)/2
  const dp = Math.abs(x * x - 1) < 1e-14 ? (x > 0 ? 1 : (-1) ** (n + 1)) * (n * (n + 1)) / 2 : (n * (x * p - prev)) / (x * x - 1);
  return { p, dp };
}

/** Legendre-Polynom P_n(x) (Beispiel 23.7). */
export const legendre = (n, x) => legendreWithDerivative(n, x).p;

const gaussCache = new Map();

/**
 * Gauß-Legendre-Regel mit `count` Stützstellen (Satz 26.4): Die Stützstellen sind die
 * Nullstellen von P_count, bestimmt mit dem Newton-Verfahren (Startwerte nach Tricomi).
 * @returns {Rule} auf [0, 1], Ordnung 2·count
 */
export function gaussLegendre(count) {
  if (gaussCache.has(count)) return gaussCache.get(count);
  const nodes = [];
  const weights = [];
  for (let i = 0; i < count; i++) {
    let x = Math.cos((Math.PI * (i + 0.75)) / (count + 0.5));
    for (let iter = 0; iter < 100; iter++) {
      const { p, dp } = legendreWithDerivative(count, x);
      const dx = p / dp;
      x -= dx;
      if (Math.abs(dx) < 1e-16) break;
    }
    const { dp } = legendreWithDerivative(count, x);
    nodes.push((1 + x) / 2);
    weights.push(1 / ((1 - x * x) * dp * dp)); // Standardgewicht 2/((1−x²)P'²), halbiert für Σ w = 1
  }
  const order = nodes.map((_, i) => i).sort((i, j) => nodes[i] - nodes[j]);
  const rule = { nodes: order.map((i) => nodes[i]), weights: order.map((i) => weights[i]) };
  gaussCache.set(count, rule);
  return rule;
}

/* ---------- Interpolatorische Regeln, Newton-Cotes ---------- */

/**
 * Interpolatorische Quadraturregel zu beliebigen Stützstellen in [0, 1] (25.1):
 * w_i = ∫₀¹ L_i(s) ds, exakt berechnet mit einer Gauß-Regel genügend hoher Ordnung.
 * @param {number[]} nodes
 * @returns {Rule}
 */
export function interpolatoryRule(nodes) {
  const gauss = gaussLegendre(nodes.length);
  const weights = nodes.map((_, i) => gauss.nodes.reduce((sum, s, k) => {
    let L = 1;
    for (let j = 0; j < nodes.length; j++) if (j !== i) L *= (s - nodes[j]) / (nodes[i] - nodes[j]);
    return sum + gauss.weights[k] * L;
  }, 0));
  return { nodes: [...nodes], weights };
}

/**
 * Newton-Cotes-Regel mit n + 1 äquidistanten Stützstellen (Abschnitt 25.1).
 * Abgeschlossen: x_i = a + i·h, h = (b − a)/n. Offen: x_i = a + (i + 1)·h, h = (b − a)/(n + 2).
 * @returns {Rule}
 */
export function newtonCotes(n, { open = false } = {}) {
  const nodes = open
    ? Array.from({ length: n + 1 }, (_, i) => (i + 1) / (n + 2))
    : Array.from({ length: n + 1 }, (_, i) => (n === 0 ? 0.5 : i / n));
  return interpolatoryRule(nodes);
}

/** Die im Skript benannten Regeln. */
export const RULES = {
  midpoint: { label: 'Mittelpunktsregel', rule: newtonCotes(0, { open: true }) },
  trapezoid: { label: 'Trapezregel', rule: newtonCotes(1) },
  simpson: { label: 'Simpsonregel', rule: newtonCotes(2) },
  threeEighths: { label: '3/8-Regel', rule: newtonCotes(3) },
  gauss2: { label: 'Gauß, 2 Punkte (Gauss4)', rule: gaussLegendre(2) },
  gauss3: { label: 'Gauß, 3 Punkte (Gauss6)', rule: gaussLegendre(3) },
};

/** Wendet eine Regel auf [a, b] an. */
export function applyRule({ nodes, weights }, f, a, b) {
  return (b - a) * nodes.reduce((sum, s, i) => sum + weights[i] * f(a + s * (b - a)), 0);
}

/**
 * Ordnung einer Quadraturregel (Definition 25.3): größtes m, sodass alle Polynome vom
 * Grad m − 1 exakt integriert werden. Geprüft wird mit (s − ½)^k auf [0, 1].
 */
export function ruleOrder(rule, maxDegree = 40) {
  for (let k = 0; k <= maxDegree; k++) {
    const exact = k % 2 === 0 ? 1 / ((k + 1) * 2 ** k) : 0;
    const approx = applyRule(rule, (s) => (s - 0.5) ** k, 0, 1);
    if (Math.abs(approx - exact) > 1e-12) return k;
  }
  return maxDegree + 1;
}

/**
 * Summierte Quadraturformel (Abschnitt 25.2): Regel auf N gleich großen Teilintervallen.
 * Stützstellen auf gemeinsamen Teilintervallgrenzen werden nur einmal gezählt.
 * @returns {{value: number, evals: number}}
 */
export function composite(rule, f, a, b, N) {
  const h = (b - a) / N;
  let value = 0;
  for (let i = 0; i < N; i++) value += applyRule(rule, f, a + i * h, a + (i + 1) * h);
  const shared = rule.nodes[0] === 0 && rule.nodes.at(-1) === 1;
  return { value, evals: N * rule.nodes.length - (shared ? N - 1 : 0) };
}

/** Genaue Referenzintegration (summierte Gauß-Regel, z. B. für Skalarprodukte). */
export function integrate(f, a, b, { panels = 64, points = 8 } = {}) {
  return composite(gaussLegendre(points), f, a, b, panels).value;
}

/**
 * Experimentelle Konvergenzordnung (Bemerkung 25.9): α = log(e_{h/2}/e_h) / log(½).
 * @param {number[]} errors  Fehler zu h, h/2, h/4, …
 * @returns {number[]} eine Ordnung weniger als Fehler
 */
export function experimentalOrder(errors) {
  return errors.slice(1).map((e, i) => Math.log(e / errors[i]) / Math.log(0.5));
}

/* ---------- Fehlerkontrolle (Algorithmus 25.10) ---------- */

/**
 * Trapezsumme mit Fehlerschätzung über die Simpsonsumme. Wiederverwendung der
 * Funktionswerte nach Bemerkung 25.7: I⁽²⁾_h = ⅓ I⁽¹⁾_h + ⅔ I⁽⁰⁾_h, I⁽¹⁾_{h/2} = ½ (I⁽¹⁾_h + I⁽⁰⁾_h).
 * @returns {{value: number, evals: number, converged: boolean,
 *            steps: {N: number, trapezoid: number, simpson: number, estimate: number}[]}}
 *          steps[j].trapezoid ist die Trapezsumme mit N Teilintervallen, estimate deren Fehlerschätzung
 */
export function trapezoidWithErrorControl(f, a, b, { tol = 1e-6, omega = 0.5, maxLevel = 20 } = {}) {
  let h = b - a;
  let N = 1;
  let trapezoid = 0.5 * h * (f(a) + f(b));
  let evals = 2;
  const steps = [];
  for (let level = 0; level < maxLevel; level++) {
    let midpoint = 0;
    for (let i = 0; i < N; i++) midpoint += h * f(a + (i + 0.5) * h);
    evals += N;
    const simpson = trapezoid / 3 + (2 * midpoint) / 3;
    trapezoid = 0.5 * (trapezoid + midpoint);
    h *= 0.5;
    N *= 2;
    const estimate = Math.abs(simpson - trapezoid) / (1 - omega);
    steps.push({ N, trapezoid, simpson, estimate });
    if (estimate <= tol) return { value: trapezoid, evals, converged: true, steps };
  }
  return { value: trapezoid, evals, converged: false, steps };
}

/* ---------- Romberg-Integration (Abschnitt 26.1) ---------- */

/**
 * Romberg-Tableau: p_{i,0} = Trapezsumme zu h_i = (b − a)/2^i,
 *   p_{i,k} = p_{i+1,k−1} + (p_{i+1,k−1} − p_{i,k−1}) / (4^k − 1).
 * @returns {{tableau: number[][], evals: number}}  tableau[i][k] = p_{i,k}; Bestwert tableau[0][n]
 */
export function romberg(f, a, b, n) {
  const trapezoids = [0.5 * (b - a) * (f(a) + f(b))];
  for (let i = 1; i <= n; i++) {
    const N = 2 ** (i - 1);
    const h = (b - a) / N;
    let midpoint = 0;
    for (let j = 0; j < N; j++) midpoint += f(a + (j + 0.5) * h);
    trapezoids.push(0.5 * (trapezoids[i - 1] + h * midpoint));
  }
  const tableau = trapezoids.map((t) => [t]);
  for (let k = 1; k <= n; k++) {
    for (let i = 0; i + k <= n; i++) {
      tableau[i][k] = tableau[i + 1][k - 1] + (tableau[i + 1][k - 1] - tableau[i][k - 1]) / (4 ** k - 1);
    }
  }
  return { tableau, evals: 2 ** n + 1 };
}

/* ---------- Adaptive Quadratur nach Archimedes (Algorithmus 26.6) ---------- */

/**
 * Hierarchische Zerlegung I = I₀ + Σ I_Δ: Jeder Zuwachs ist die Dreiecksfläche
 * I_Δ = (f(x_m) − (f(x_l) + f(x_r))/2)·(x_r − x_l)/2 und dient zugleich als Fehlerindikator.
 * @returns {{value: number, evals: number, points: [number, number][],
 *            triangles: {xl: number, xm: number, xr: number, fl: number, fm: number, fr: number, level: number}[]}}
 */
export function archimedes(f, a, b, { tol = 1e-6, minLevel = 2, maxLevel = 40 } = {}) {
  const fa = f(a);
  const fb = f(b);
  const points = [[a, fa], [b, fb]];
  const triangles = [];

  function refine(xl, xr, fl, fr, level) {
    const xm = (xl + xr) / 2;
    const fm = f(xm);
    points.push([xm, fm]);
    triangles.push({ xl, xm, xr, fl, fm, fr, level });
    let s = ((fm - (fl + fr) / 2) * (xr - xl)) / 2;
    if ((Math.abs(s) >= tol || level < minLevel) && level < maxLevel) {
      s += refine(xl, xm, fl, fm, level + 1) + refine(xm, xr, fm, fr, level + 1);
    }
    return s;
  }

  const value = ((b - a) * (fa + fb)) / 2 + refine(a, b, fa, fb, 0);
  points.sort((p, q) => p[0] - q[0]);
  return { value, evals: points.length, points, triangles };
}

/* ---------- Mehrdimensionale Quadratur (Abschnitt 26.3) ---------- */

/** Reproduzierbarer Pseudozufallsgenerator (mulberry32) mit Werten in [0, 1). */
export function seededRandom(seed = 1) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Tensorprodukt-Mittelpunktsregel auf [0, 1]^d mit m Teilintervallen je Richtung (m^d Auswertungen).
 * @param {(x: number[]) => number} f
 */
export function tensorMidpoint(f, d, m) {
  const x = new Array(d).fill(0);
  const index = new Array(d).fill(0);
  const total = m ** d;
  let sum = 0;
  for (let k = 0; k < total; k++) {
    for (let j = 0; j < d; j++) x[j] = (index[j] + 0.5) / m;
    sum += f(x);
    for (let j = 0; j < d && ++index[j] === m; j++) index[j] = 0; // „Kilometerzähler“
  }
  return { value: sum / total, evals: total };
}

/** Monte-Carlo-Integration auf [0, 1]^d: I ≈ (1/N) Σ f(ξ_i) mit gleichverteilten ξ_i. */
export function monteCarlo(f, d, N, random = seededRandom(1)) {
  let sum = 0;
  const x = new Array(d);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < d; j++) x[j] = random();
    sum += f(x);
  }
  return { value: sum / N, evals: N };
}

/**
 * Monte-Carlo-Schätzungen für aufsteigende Stichprobenumfänge aus einer einzigen Zufallsfolge:
 * Der Schätzwert zu N verwendet die ersten N Punkte (Aufwand max(budgets) statt Σ budgets).
 * @param {number[]} budgets  aufsteigend sortiert
 * @returns {number[]} Schätzwerte zu den einzelnen Budgets
 */
export function monteCarloSequence(f, d, budgets, random = seededRandom(1)) {
  const values = [];
  const x = new Array(d);
  let sum = 0;
  let n = 0;
  for (const N of budgets) {
    for (; n < N; n++) {
      for (let j = 0; j < d; j++) x[j] = random();
      sum += f(x);
    }
    values.push(sum / N);
  }
  return values;
}

