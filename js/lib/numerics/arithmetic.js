/**
 * Fließkommaarithmetik (Vorlesung 3): exakt gerundete Grundoperationen
 *   x ⊛ y = rd(x ∗ y)
 * in einem dezimalen bzw. allgemeinen System F(β, r).
 */
import { roundToFloatSystem } from './rounding.js';
import { PRECISIONS } from './series.js';

/** Genug Exponentenstellen, damit Über-/Unterlauf in Beispielen keine Rolle spielt. */
const S = 3;

/** rd(x) in F(β, r) mit natürlicher Rundung. */
export function roundSig(x, beta, r) {
  return roundToFloatSystem(x, beta, r, S, 'natural').value;
}

export const OPERATIONS = {
  '+': { symbol: '⊕', apply: (x, y) => x + y },
  '−': { symbol: '⊖', apply: (x, y) => x - y },
  '·': { symbol: '⊙', apply: (x, y) => x * y },
  '/': { symbol: '⊘', apply: (x, y) => x / y },
};

/**
 * Exakt gerundete Operation x ⊛ y = rd(x ∗ y). Die Argumente werden zuvor
 * ebenfalls nach F gerundet (sie sollen Maschinenzahlen sein).
 */
export function floatOp(op, x, y, beta, r) {
  const xr = roundSig(x, beta, r);
  const yr = roundSig(y, beta, r);
  return roundSig(OPERATIONS[op].apply(xr, yr), beta, r);
}

/**
 * Summe Σ_{k=1}^{n} 1/k² in der gewählten Genauigkeit, vorwärts (große Terme
 * zuerst) oder rückwärts (kleine Terme zuerst) aufsummiert.
 * @param {'forward'|'backward'} order
 */
export function inverseSquareSum(n, precision, order) {
  const rd = PRECISIONS[precision].round;
  let s = 0;
  for (let i = 1; i <= n; i++) {
    const k = order === 'forward' ? i : n + 1 - i;
    s = rd(s + rd(1 / rd(k * k)));
  }
  return s;
}
