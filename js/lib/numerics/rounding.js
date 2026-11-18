/**
 * Rundung auf r Mantissenstellen (Abschnitt 2.4).
 */
import { normalizedDigits, valueOf, floatRange } from './floatsystem.js';

export const ROUNDING_MODES = {
  natural: 'Natürliche (kaufmännische) Rundung',
  even: 'Gerade Rundung',
};

/**
 * Rundet eine Ziffernfolge (Mantisse m_1 m_2 … zur Basis β) auf r Stellen.
 *
 * - natural: aufrunden, falls m_{r+1} ≥ β/2
 * - even:    bei exaktem Gleichstand (m_{r+1} = β/2, Rest 0) so runden,
 *            dass m_r gerade wird; sonst wie üblich zur nächsten Zahl
 *
 * @param {number[]} digits  Mantissenziffern (mindestens r+1 Stück sinnvoll)
 * @param {number} r
 * @param {number} beta      (für 'even' gerade)
 * @param {'natural'|'even'} mode
 * @returns {{digits:number[], carry:boolean, tie:boolean}}
 *          carry = true, falls ein Übertrag die Mantisse auf β^0 erhöht hat
 */
export function roundDigits(digits, r, beta, mode) {
  const kept = digits.slice(0, r);
  while (kept.length < r) kept.push(0);
  const next = digits[r] ?? 0;
  const restIsZero = digits.slice(r + 1).every((d) => d === 0);
  const tie = 2 * next === beta && restIsZero;

  let roundUp;
  if (mode === 'natural') {
    roundUp = 2 * next >= beta;
  } else if (tie) {
    roundUp = kept[r - 1] % 2 === 1;
  } else {
    roundUp = 2 * next > beta || (2 * next === beta && !restIsZero);
  }

  if (!roundUp) return { digits: kept, carry: false, tie };

  for (let i = r - 1; i >= 0; i--) {
    if (kept[i] < beta - 1) {
      kept[i]++;
      return { digits: kept, carry: false, tie };
    }
    kept[i] = 0;
  }
  // Übertrag über alle Stellen: 0.(β−1)(β−1)… → 1.0 = 0.1 · β
  kept[0] = 1;
  return { digits: kept, carry: true, tie };
}

/**
 * Parst eine Dezimalzahl als Zeichenkette exakt in normierte Ziffern (β = 10),
 * z. B. "0.74500" → { sign: 1, e: 0, digits: [7,4,5,0,0] }.
 * So entstehen keine binären Darstellungsfehler (0.745 ist in double nicht exakt).
 */
export function parseDecimal(str) {
  const match = /^\s*([+-]?)(\d*)(?:[.,](\d*))?\s*$/.exec(str);
  if (!match || (match[2] + (match[3] ?? '')).length === 0) return null;
  const sign = match[1] === '-' ? -1 : 1;
  const intDigits = match[2].replace(/^0+/, '');
  const fracDigits = match[3] ?? '';
  let all = (intDigits + fracDigits).split('').map(Number);
  let e = intDigits.length;
  // führende Nullen der Nachkommastellen entfernen (Normierung m_1 ≠ 0)
  while (all.length > 0 && all[0] === 0) {
    all.shift();
    e--;
  }
  if (all.length === 0) return { sign, e: 0, digits: [0] };
  return { sign, e, digits: all };
}

/** Formatiert normierte Dezimalziffern als 0.d1d2… · 10^e. */
export function formatDecimal({ sign, e, digits }) {
  return `${sign < 0 ? '−' : ''}0.${digits.join('')} · 10^${e}`;
}

/**
 * Rundet die reelle Zahl x in das System F(β, r, s): liefert rd(x),
 * die normierte Darstellung sowie absoluten/relativen Fehler und Schranken
 * aus Lemma 2.7.
 */
export function roundToFloatSystem(x, beta, r, s, mode) {
  const range = floatRange(beta, r, s);
  if (x === 0) {
    return { value: 0, sign: 1, e: 0, digits: new Array(r).fill(0), absError: 0, relError: 0, status: 'ok', range };
  }
  const exact = normalizedDigits(x, beta, r + 40);
  const rounded = roundDigits(exact.digits, r, beta, mode);
  const repr = { sign: exact.sign, e: exact.e + (rounded.carry ? 1 : 0), digits: rounded.digits };

  let status = 'ok';
  if (repr.e > range.eMax) status = 'overflow';
  else if (repr.e < range.eMin) status = 'underflow';

  const value = valueOf(repr, beta);
  const absError = Math.abs(x - value);
  return {
    ...repr,
    value,
    absError,
    relError: absError / Math.abs(x),
    absBound: 0.5 * beta ** (exact.e - r),
    relBound: range.eps,
    status,
    range,
  };
}
