/**
 * Gauß-Approximation in Skalarprodukträumen (Vorlesung 23).
 *
 * Alle Funktionen leben auf [−1, 1] mit dem Skalarprodukt ⟨f, g⟩ = ∫ f g dx.
 * Die Integrale werden mit einer summierten Gauß-Regel berechnet; eine gerade Zahl
 * von Teilintervallen legt eine Intervallgrenze auf x = 0 (Knicke und Sprünge dort
 * werden dadurch exakt erfasst).
 */
import { integrate, legendre } from './quadrature.js';
import { solve } from './linalg.js';
import { symmetricEigenvalues } from './eigen.js';

const QUADRATURE = { panels: 64, points: 8 };

/** ⟨f, g⟩ = ∫₋₁¹ f(x) g(x) dx. */
export function innerProduct(f, g) {
  return integrate((x) => f(x) * g(x), -1, 1, QUADRATURE);
}

/** ‖f‖ = √⟨f, f⟩. */
export const norm = (f) => Math.sqrt(innerProduct(f, f));

/**
 * Basen von S = span{φ₀, …, φ_{N−1}}. `orthonormal` gibt an, ob ⟨φ_i, φ_j⟩ = δ_ij.
 * Fourier: 1/√2, cos(πx), sin(πx), cos(2πx), … – die Basis aus Beispiel 23.6, auf [−1, 1] skaliert.
 */
export const BASES = {
  monomial: { label: 'Monome xʲ', orthonormal: false, phi: (j) => (x) => x ** j },
  legendre: { label: 'Legendre (normiert)', orthonormal: true, phi: (j) => (x) => Math.sqrt((2 * j + 1) / 2) * legendre(j, x) },
  fourier: {
    label: 'Fourier',
    orthonormal: true,
    phi: (j) => {
      if (j === 0) return () => Math.SQRT1_2;
      const k = Math.ceil(j / 2);
      return j % 2 === 1 ? (x) => Math.cos(k * Math.PI * x) : (x) => Math.sin(k * Math.PI * x);
    },
  },
};

/**
 * Bestapproximation g = Σ c_j φ_j von f im Raum der ersten N Basisfunktionen (Satz 23.3):
 * Lösung der Normalengleichung A c = b mit der Gramschen Matrix A_ij = ⟨φ_j, φ_i⟩, b_i = ⟨f, φ_i⟩.
 * @param {(x: number) => number} f
 * @param {keyof BASES} basisName
 * @param {number} N
 */
export function gaussApproximation(f, basisName, N) {
  const phis = Array.from({ length: N }, (_, j) => BASES[basisName].phi(j));
  const gram = phis.map((pi) => phis.map((pj) => innerProduct(pj, pi)));
  const rhs = phis.map((pi) => innerProduct(f, pi));
  const coeffs = solve(gram, rhs);
  const evaluate = (x) => coeffs.reduce((s, c, j) => s + c * phis[j](x), 0);
  return { coeffs, gram, rhs, evaluate, error: norm((x) => f(x) - evaluate(x)) };
}

/** Spektrale Kondition einer symmetrisch positiv definiten Matrix: λ_max / λ_min. */
export function spdCondition(A) {
  const lambda = symmetricEigenvalues(A);
  return lambda.at(-1) / lambda[0];
}

/**
 * Fehler der Bestapproximation in einer Orthonormalbasis ohne Gleichungssystem (Abschnitt 23.3):
 *   ‖f − g_N‖² = ⟨f, f⟩ − Σ_{i<N} ⟨f, ψ_i⟩².
 * @returns {number[]} errors[N] für N = 0 … maxN
 */
export function orthonormalErrors(f, basisName, maxN) {
  const ff = innerProduct(f, f);
  const errors = [Math.sqrt(ff)];
  let energy = 0;
  for (let i = 0; i < maxN; i++) {
    energy += innerProduct(f, BASES[basisName].phi(i)) ** 2;
    errors.push(Math.sqrt(Math.max(ff - energy, 0)));
  }
  return errors;
}
