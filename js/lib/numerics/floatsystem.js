/**
 * Normierte Fließkommazahlen F(β, r, s) nach Definition 2.2.
 *
 *   x = ± m · β^e,  m = Σ_{i=1}^{r} m_i β^{−i},  e = ± Σ_{j=0}^{s−1} e_j β^j,
 *   Normierung: m_1 ≠ 0 (für x ≠ 0).
 */

/** Größter Exponentbetrag: (β−1)·Σ_{j=0}^{s−1} β^j = β^s − 1. */
export function maxExponent(beta, s) {
  return beta ** s - 1;
}

/** Anzahl der Elemente von F(β, r, s) inklusive der Null. */
export function countFloats(beta, r, s) {
  return 2 * (beta - 1) * beta ** (r - 1) * (2 * maxExponent(beta, s) + 1) + 1;
}

/**
 * Zahlenbereich: größte Zahl X₊, kleinste positive Zahl x₊, Maschinengenauigkeit eps.
 */
export function floatRange(beta, r, s) {
  const eMax = maxExponent(beta, s);
  return {
    eMin: -eMax,
    eMax,
    largest: (1 - beta ** -r) * beta ** eMax,
    smallestPositive: beta ** (-1 - eMax),
    eps: 0.5 * beta ** (1 - r),
  };
}

/**
 * Zählt alle nichtnegativen Elemente von F(β, r, s) auf (aufsteigend sortiert).
 * Gibt null zurück, wenn es mehr als `limit` Elemente wären.
 *
 * @returns {{value:number, digits:number[], e:number}[] | null}
 */
export function enumeratePositiveFloats(beta, r, s, limit = 20000) {
  if (countFloats(beta, r, s) > 2 * limit) return null;
  const eMax = maxExponent(beta, s);
  const result = [{ value: 0, digits: new Array(r).fill(0), e: 0 }];
  const mLow = beta ** (r - 1);
  const mHigh = beta ** r;
  for (let e = -eMax; e <= eMax; e++) {
    for (let M = mLow; M < mHigh; M++) {
      result.push({ value: (M / mHigh) * beta ** e, digits: integerDigits(M, beta, r), e });
    }
  }
  return result.sort((a, b) => a.value - b.value);
}

/** Ziffern der ganzen Zahl M zur Basis β, auf `length` Stellen aufgefüllt. */
export function integerDigits(M, beta, length) {
  const digits = new Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    digits[i] = M % beta;
    M = Math.floor(M / beta);
  }
  return digits;
}

/**
 * Normierte Darstellung von x ≠ 0 zur Basis β mit `count` Mantissenstellen
 * (abgeschnitten, nicht gerundet): |x| = (Σ m_i β^{−i}) · β^e mit m_1 ≠ 0.
 *
 * Die Ziffern werden durch wiederholtes Multiplizieren erzeugt; für β = 2
 * ist das exakt, für andere Basen gilt die double-Genauigkeit.
 */
export function normalizedDigits(x, beta, count) {
  if (x === 0) return { sign: 1, e: 0, digits: new Array(count).fill(0) };
  const sign = x < 0 ? -1 : 1;
  let a = Math.abs(x);
  let e = Math.floor(Math.log(a) / Math.log(beta)) + 1;
  // Korrektur möglicher Rundungsfehler im Logarithmus: β^{e−1} ≤ a < β^e
  while (a >= beta ** e) e++;
  while (a < beta ** (e - 1)) e--;
  let m = a / beta ** e;
  const digits = [];
  for (let i = 0; i < count; i++) {
    m *= beta;
    const d = Math.min(beta - 1, Math.floor(m));
    digits.push(d);
    m -= d;
  }
  return { sign, e, digits };
}

/** Wert einer normierten Darstellung. */
export function valueOf({ sign, e, digits }, beta) {
  let m = 0;
  for (let i = digits.length - 1; i >= 0; i--) m = (m + digits[i]) / beta;
  return sign * m * beta ** e;
}

/**
 * Ziffern im Stellenwertsystem (Festkommadarstellung) zur Basis β.
 * @returns {{integer:number[], fraction:number[]}}
 */
export function positionalDigits(x, beta, fractionDigits) {
  let intPart = Math.floor(Math.abs(x));
  let frac = Math.abs(x) - intPart;
  const integer = [];
  do {
    integer.unshift(intPart % beta);
    intPart = Math.floor(intPart / beta);
  } while (intPart > 0);
  const fraction = [];
  for (let i = 0; i < fractionDigits && frac > 0; i++) {
    frac *= beta;
    const d = Math.floor(frac);
    fraction.push(d);
    frac -= d;
  }
  return { integer, fraction };
}

/** Darstellung einer Ziffer (0–9, A–Z). */
export function digitChar(d) {
  return d < 10 ? String(d) : String.fromCharCode(55 + d);
}
