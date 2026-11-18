/**
 * Konditions- und Rundungsfehleranalyse (Vorlesung 3).
 */

/**
 * Verstärkungsfaktoren k_j = (∂F/∂x_j) · x_j / F(x) für die Beispiele 3.8.
 * @returns {{k1:number, k2:number}}
 */
export const AMPLIFICATION = {
  add: { label: 'x₁ + x₂', f: (a, b) => a + b, factors: (a, b) => ({ k1: a / (a + b), k2: b / (a + b) }) },
  sub: { label: 'x₁ − x₂', f: (a, b) => a - b, factors: (a, b) => ({ k1: a / (a - b), k2: -b / (a - b) }) },
  mul: { label: 'x₁ · x₂', f: (a, b) => a * b, factors: () => ({ k1: 1, k2: 1 }) },
  div: { label: 'x₁ / x₂', f: (a, b) => a / b, factors: () => ({ k1: 1, k2: -1 }) },
  squares: {
    label: 'x₁² − x₂²',
    f: (a, b) => a * a - b * b,
    factors: (a, b) => ({ k1: (2 * a * a) / (a * a - b * b), k2: (2 * b * b) / (b * b - a * a) }),
  },
};

/** Größter Verstärkungsfaktor (betragsmäßig). */
export function maxAmplification(kind, a, b) {
  const { k1, k2 } = AMPLIFICATION[kind].factors(a, b);
  return Math.max(Math.abs(k1), Math.abs(k2));
}

/**
 * Zwei Realisierungen von x₁² − x₂² (Beispiel 3.9) mit Rundungsfunktion rd.
 *   Fa = (x₁ ⊙ x₁) ⊖ (x₂ ⊙ x₂),   Fb = (x₁ ⊖ x₂) ⊙ (x₁ ⊕ x₂)
 */
export function differenceOfSquares(x1, x2, rd) {
  const a = rd(x1);
  const b = rd(x2);
  return {
    Fa: rd(rd(a * a) - rd(b * b)),
    Fb: rd(rd(a - b) * rd(a + b)),
  };
}

/**
 * Lösungen von x² − p x + q = 0 (Abschnitt 3.5).
 *  - naive: beide Lösungen mit der p-q-Formel
 *  - stable: die betragsgroße Lösung mit der Formel, die andere über Vieta (x₁·x₂ = q)
 * @param {(v:number)=>number} rd Rundungsfunktion der simulierten Genauigkeit
 * @returns {{naive:[number, number], stable:[number, number]}} jeweils [x₁ (größer), x₂ (kleiner)]
 */
export function quadraticRoots(p, q, rd) {
  const pr = rd(p);
  const qr = rd(q);
  const w = rd(Math.sqrt(rd(rd(rd(pr * pr) / 4) - qr)));
  const half = rd(pr / 2);
  const naive = [rd(half + w), rd(half - w)];
  let stable;
  if (pr > 0) {
    const x1 = rd(half + w);
    stable = [x1, rd(qr / x1)];
  } else {
    const x2 = rd(half - w);
    stable = [rd(qr / x2), x2];
  }
  return { naive, stable };
}

/** Exakte (double-genaue, auslöschungsfreie) Referenzlösungen von x² − p x + q = 0. */
export function quadraticRootsExact(p, q) {
  return quadraticRoots(p, q, (v) => v).stable;
}

/** Relativer Fehler |approx − exact| / |exact|. */
export function relativeError(approx, exact) {
  return exact === 0 ? Math.abs(approx) : Math.abs((approx - exact) / exact);
}
