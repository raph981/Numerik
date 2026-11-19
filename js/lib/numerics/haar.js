/**
 * Haar-Wavelets und adaptive Approximation (Vorlesung 24).
 *
 * Bezeichnungen wie im Skript: ψ_i^k ist das i-te Wavelet der Stufe k auf (0, 1].
 * Koeffizienten werden stufenweise gespeichert:
 *   alpha[i]    Koeffizienten zur Standardbasis χ_i^k (Indikatoren der Intervalle der Länge 2^{−k})
 *   beta[l][i]  Koeffizienten zur Wavelet-Basis; beta[0] = [β_0^0], beta[l] hat 2^{l−1} Einträge (l ≥ 1)
 */
import { gaussLegendre, composite } from './quadrature.js';

/** Indikatorfunktion χ von (0, 1]. */
export const indicator = (x) => (x > 0 && x <= 1 ? 1 : 0);

/** „Mother wavelet“ ψ(x) = χ(2x) − χ(2x − 1) (24.1). */
export const motherWavelet = (x) => indicator(2 * x) - indicator(2 * x - 1);

/** Anzahl der Wavelets auf Stufe k: 2^{max(0, k−1)} (Lemma 24.3 i). */
export const levelSize = (k) => 2 ** Math.max(0, k - 1);

/** Haar-Wavelet ψ_i^k (24.2–24.4). */
export function haar(k, i, x) {
  if (k === 0) return indicator(x);
  const scale = 2 ** (k - 1);
  return Math.sqrt(scale) * motherWavelet(scale * x - i);
}

/** Träger supp ψ_i^k = [i/2^{k−1}, (i+1)/2^{k−1}] (Lemma 24.3 ii). */
export function haarSupport(k, i) {
  if (k === 0) return [0, 1];
  const width = 2 ** -(k - 1);
  return [i * width, (i + 1) * width];
}

/**
 * Koeffizienten der Bestapproximation von f in S^k bezüglich der Standardbasis:
 * die Mittelwerte α_i = 2^k ∫ f über (i/2^k, (i+1)/2^k].
 */
export function cellMeans(f, k) {
  const n = 2 ** k;
  const rule = gaussLegendre(6);
  return Array.from({ length: n }, (_, i) => composite(rule, f, i / n, (i + 1) / n, 4).value * n);
}

/**
 * Standardbasis → Wavelet-Basis (Lemma 24.5, von oben nach unten, Aufwand O(2^k)).
 * Aus ψ_i^l = 2^{(l−1)/2}(χ_{2i}^l − χ_{2i+1}^l) und χ_i^{l−1} = χ_{2i}^l + χ_{2i+1}^l folgt
 *   β_i^l = 2^{−(l−1)/2} (α_{2i} − α_{2i+1}) / 2,   α_i^{l−1} = (α_{2i} + α_{2i+1}) / 2.
 */
export function toHaar(alpha) {
  const k = Math.log2(alpha.length);
  if (!Number.isInteger(k)) throw new Error('Anzahl der Koeffizienten muss eine Zweierpotenz sein');
  const beta = new Array(k + 1);
  let a = alpha;
  for (let l = k; l >= 1; l--) {
    const factor = 2 ** (-(l - 1) / 2) / 2;
    beta[l] = Array.from({ length: a.length / 2 }, (_, i) => factor * (a[2 * i] - a[2 * i + 1]));
    a = Array.from({ length: a.length / 2 }, (_, i) => (a[2 * i] + a[2 * i + 1]) / 2);
  }
  beta[0] = [a[0]];
  return beta;
}

/**
 * Wavelet-Basis → Standardbasis (Lemma 24.5, von unten nach oben):
 *   α_i^l = α_{⌊i/2⌋}^{l−1} + (−1)^i 2^{(l−1)/2} β_{⌊i/2⌋}^l.
 */
export function fromHaar(beta) {
  let a = [beta[0][0]];
  for (let l = 1; l < beta.length; l++) {
    const factor = 2 ** ((l - 1) / 2);
    a = Array.from({ length: 2 * a.length }, (_, i) => a[i >> 1] + (i % 2 === 0 ? 1 : -1) * factor * beta[l][i >> 1]);
  }
  return a;
}

/** ‖v‖² = Σ β² (Parseval, Satz 23.5). */
export const energy = (beta) => beta.flat().reduce((s, b) => s + b * b, 0);

/** Kinder eines Knotens im Wavelet-Baum (Lemma 24.3 iii). */
function children(l, i, k) {
  if (l >= k) return [];
  if (l === 0) return [[1, 0]];
  return [[l + 1, 2 * i], [l + 1, 2 * i + 1]];
}

/**
 * Adaptive Kompression (Algorithmus 24.6): Ausgehend von I = {(0, 0)} wird jeweils das Kind mit dem
 * größten Beitrag β² hinzugenommen, bis Σ_I β² ≥ (1 − TOL²) ‖v‖², also ‖v − ṽ‖ ≤ TOL ‖v‖.
 * @returns {{mask: boolean[][], count: number, kept: number, total: number}}
 */
export function compress(beta, tol) {
  const k = beta.length - 1;
  const mask = beta.map((level) => level.map(() => false));
  const total = energy(beta);
  mask[0][0] = true;
  let kept = beta[0][0] ** 2;
  let count = 1;
  let frontier = children(0, 0, k);
  while (kept < (1 - tol * tol) * total && frontier.length > 0) {
    let best = 0;
    frontier.forEach(([l, i], idx) => { if (beta[l][i] ** 2 > beta[frontier[best][0]][frontier[best][1]] ** 2) best = idx; });
    const [l, i] = frontier[best];
    frontier.splice(best, 1);
    mask[l][i] = true;
    kept += beta[l][i] ** 2;
    count++;
    frontier.push(...children(l, i, k));
  }
  return { mask, count, kept, total };
}

/** Setzt alle nicht ausgewählten Koeffizienten auf null. */
export const applyMask = (beta, mask) => beta.map((level, l) => level.map((b, i) => (mask[l][i] ? b : 0)));

/**
 * Vergleich: kleinste uniforme Stufe L, deren Wavelets bis Stufe L die Toleranz erfüllen.
 * @returns {{level: number, count: number}}
 */
export function uniformLevel(beta, tol) {
  const total = energy(beta);
  let kept = 0;
  for (let l = 0; l < beta.length; l++) {
    kept += beta[l].reduce((s, b) => s + b * b, 0);
    if (kept >= (1 - tol * tol) * total) return { level: l, count: 2 ** l };
  }
  return { level: beta.length - 1, count: 2 ** (beta.length - 1) };
}
