import { test } from 'node:test';
import assert from 'node:assert/strict';

import { heronIteration } from '../js/lib/numerics/iteration.js';
import { discreteGrowth, exponentialSolution } from '../js/lib/numerics/growth.js';
import {
  interpolationFit, linearFit, nonlinearFit, nonlinearObjective,
  naiveDoublingTimes, windowedDoublingTimes,
} from '../js/lib/numerics/fitting.js';
import { expSeries, expSeriesStable } from '../js/lib/numerics/series.js';
import {
  countFloats, enumeratePositiveFloats, floatRange, normalizedDigits, positionalDigits,
} from '../js/lib/numerics/floatsystem.js';
import { parseDecimal, roundDigits, roundToFloatSystem } from '../js/lib/numerics/rounding.js';
import { decompose, toBits, fromBits, machineEpsilon } from '../js/lib/numerics/ieee754.js';
import { CORONA_CASES, CORONA_DAYS, MEASURES_DAY, dayLabel } from '../js/data/corona.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('Heron-Iteration konvergiert quadratisch gegen √2', () => {
  const rows = heronIteration(2, 1, 5);
  assert.equal(rows[1].x, 1.5);
  close(rows[5].x, Math.SQRT2, 1e-15);
  assert.ok(rows[3].error < rows[2].error ** 2);
});

test('diskretes Wachstumsmodell nähert sich der Exponentialfunktion', () => {
  const coarse = discreteGrowth(1, 0.5, 1, 0, 4).at(-1)[1];
  const fine = discreteGrowth(1, 0.5, 0.001, 0, 4).at(-1)[1];
  const exact = exponentialSolution(1, 0.5, 0, 4);
  assert.ok(Math.abs(fine - exact) < Math.abs(coarse - exact));
  close(fine, exact, 1e-2);
});

test('Interpolation reproduziert zwei Datenpunkte exakt', () => {
  const N = [10, 20, 80];
  const t = [0, 1, 3];
  const { u0, lambda } = interpolationFit(N, t, 2);
  close(exponentialSolution(u0, lambda, 0, 3), 80, 1e-9);
});

test('Ausgleichsgerade findet exakte Parameter bei exakten Daten', () => {
  const t = [0, 1, 2, 3, 4];
  const N = t.map((ti) => 5 * Math.exp(0.3 * ti));
  const fit = linearFit(N, t);
  close(fit.u0, 5, 1e-9);
  close(fit.lambda, 0.3, 1e-12);
});

test('Newton-Verfahren minimiert J_nl für die Coronadaten', () => {
  const m = CORONA_CASES.length - 5;
  const N = CORONA_CASES.slice(0, m);
  const t = CORONA_DAYS.slice(0, m);
  const start = linearFit(N, t);
  const fit = nonlinearFit(N, t, start);
  assert.ok(fit.converged, 'Newton sollte konvergieren');
  assert.ok(nonlinearObjective(N, t, fit) < nonlinearObjective(N, t, start));
  assert.ok(fit.lambda > 0 && fit.lambda < 0.3);
});

test('Verdopplungszeiten sind positiv und wachsen nach den Maßnahmen', () => {
  const T = windowedDoublingTimes(CORONA_CASES, CORONA_DAYS, 4);
  assert.equal(T.length, CORONA_CASES.length - 3);
  assert.ok(T.at(-1)[1] > T[10][1]);
  const naive = naiveDoublingTimes(CORONA_CASES, CORONA_DAYS);
  assert.ok(naive.every(([, v]) => Number.isInteger(v)));
});

test('dayLabel und Maßnahmentag', () => {
  assert.equal(dayLabel(0), '24.02.');
  assert.equal(dayLabel(MEASURES_DAY), '22.03.');
});

test('Exponentialreihe reproduziert Beispiel 2.1', () => {
  // x = 1, float: 7 gültige Ziffern
  close(expSeries(1, 'float').at(-1).S, 2.718281984329224, 1e-15);
  // x = −20, float: völlig falsch (Auslöschung)
  close(expSeries(-20, 'float').at(-1).S, 7.566840648651123e-1, 1e-6);
  // x = −20, double: richtige Größenordnung, keine korrekte Stelle
  const d = expSeries(-20, 'double').at(-1).S;
  assert.ok(d > 1e-9 && d < 1e-8);
  // stabile Variante
  close(expSeriesStable(-20, 'double'), Math.exp(-20), 1e-20);
});

test('F(10,3,1) hat 34201 Elemente, F(2,2,1) wie im Skript', () => {
  assert.equal(countFloats(10, 3, 1), 34201);
  const pos = enumeratePositiveFloats(2, 2, 1).map((f) => f.value);
  assert.deepEqual(pos, [0, 1 / 4, 3 / 8, 1 / 2, 3 / 4, 1, 3 / 2]);
  const range = floatRange(2, 2, 1);
  assert.equal(range.largest, 1.5);
  assert.equal(range.smallestPositive, 0.25);
});

test('normierte Ziffern und Stellenwertsystem', () => {
  const n = normalizedDigits(0.375, 2, 4);
  assert.deepEqual(n, { sign: 1, e: -1, digits: [1, 1, 0, 0] });
  assert.deepEqual(positionalDigits(5.25, 2, 4), { integer: [1, 0, 1], fraction: [0, 1] });
});

test('Beispiel 2.5: natürliche vs. gerade Rundung', () => {
  const round = (s, r, mode) => roundDigits(parseDecimal(s).digits, r, 10, mode).digits.join('');
  assert.equal(round('0.32642876', 2, 'natural'), '33');
  assert.equal(round('0.32642876', 3, 'even'), '326');
  assert.equal(round('0.74500', 2, 'natural'), '75');
  assert.equal(round('0.74500', 2, 'even'), '74');
  assert.equal(round('0.75500', 2, 'natural'), '76');
  assert.equal(round('0.75500', 2, 'even'), '76');
  const carry = roundDigits([9, 9, 7], 2, 10, 'natural');
  assert.deepEqual(carry, { digits: [1, 0], carry: true, tie: false });
});

test('Lemma 2.7: relativer Rundungsfehler ≤ eps', () => {
  for (const x of [Math.PI, 0.1, 1234.5678, -2 / 3]) {
    for (const mode of ['natural', 'even']) {
      const res = roundToFloatSystem(x, 10, 4, 2, mode);
      assert.ok(res.relError <= res.relBound + 1e-15);
      assert.ok(res.absError <= res.absBound + 1e-15);
    }
  }
});

test('IEEE 754 Zerlegung', () => {
  const one = decompose(toBits(1, 'double'), 'double');
  assert.equal(one.c, 1023);
  assert.equal(one.e, 0);
  assert.equal(one.kind, 'normal');
  assert.equal(decompose(toBits(Infinity, 'single'), 'single').kind, 'infinity');
  assert.equal(decompose(toBits(NaN, 'double'), 'double').kind, 'nan');
  assert.equal(decompose(toBits(1e-310, 'double'), 'double').kind, 'denormal');
  assert.equal(fromBits(toBits(-0.1, 'double'), 'double'), -0.1);
  assert.equal(machineEpsilon('double'), 2 ** -53);
});
