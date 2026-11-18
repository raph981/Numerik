/**
 * Auswertung der Exponentialreihe in verschiedenen Genauigkeiten (Beispiel 2.1).
 */

/**
 * Rundungsfunktionen, die eine Gleitkommagenauigkeit simulieren.
 * JavaScript rechnet in double; Math.fround rundet korrekt auf single (float).
 */
export const PRECISIONS = {
  float: { label: 'float (32 Bit)', round: Math.fround },
  double: { label: 'double (64 Bit)', round: (v) => v },
};

/**
 * Partialsummen S_n = 1 + Σ x^i/i! über die Rekursion
 *   y_1 = x, S_1 = 1 + y_1,  y_n = (x/n)·y_{n−1},  S_n = S_{n−1} + y_n.
 * Bricht ab, sobald sich S_n nicht mehr ändert (oder nach maxN Schritten).
 *
 * @param {number} x
 * @param {'float'|'double'} precision
 * @param {number} [maxN=200]
 * @returns {{n:number, y:number, S:number}[]}
 */
export function expSeries(x, precision, maxN = 200) {
  const rd = PRECISIONS[precision].round;
  const xr = rd(x);
  let y = xr;
  let S = rd(1 + y);
  const rows = [{ n: 1, y, S }];
  for (let n = 2; n <= maxN; n++) {
    // Jeder Rekursionsschritt wird einmal gerundet; das reproduziert die
    // Tabellen im Skript exakt.
    y = rd((xr / n) * y);
    const next = rd(S + y);
    rows.push({ n, y, S: next });
    if (next === S) break;
    S = next;
  }
  return rows;
}

/**
 * Stabile Variante: für x < 0 wird e^x = 1 / e^{−x} genutzt.
 */
export function expSeriesStable(x, precision, maxN = 200) {
  if (x >= 0) return expSeries(x, precision, maxN).at(-1).S;
  const rd = PRECISIONS[precision].round;
  return rd(1 / expSeries(-x, precision, maxN).at(-1).S);
}
