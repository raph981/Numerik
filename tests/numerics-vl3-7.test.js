import { test } from 'node:test';
import assert from 'node:assert/strict';

import { floatOp, roundSig, inverseSquareSum } from '../js/lib/numerics/arithmetic.js';
import {
  AMPLIFICATION, differenceOfSquares, quadraticRoots, quadraticRootsExact, relativeError,
} from '../js/lib/numerics/condition.js';
import { FUNCTIONS, taylorPolynomial, remainderSeries } from '../js/lib/numerics/taylor.js';
import { EXAMPLE_NETWORK, solveNetwork, nodeBalance, assembleNetwork } from '../js/lib/numerics/network.js';
import {
  vectorNorm, normInf, norm1, normFrobenius, norm2x2, eigenvalues2x2, spectralRadius2x2, inverse2x2, solve,
} from '../js/lib/numerics/linalg.js';
import { gaussElimination, backSubstitution, operationCounts, frobeniusMatrix } from '../js/lib/numerics/gauss.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('3.1: x ⊕ y = x für kleines y, Assoziativgesetz verletzt', () => {
  assert.equal(floatOp('+', 1000, 0.1, 10, 4), 1000);
  const left = floatOp('−', floatOp('+', 1000, 0.1, 10, 4), 1000, 10, 4);
  const right = floatOp('+', 0.1, floatOp('−', 1000, 1000, 10, 4), 10, 4);
  assert.equal(left, 0);
  assert.equal(right, 0.1);
  assert.equal(roundSig(11.258762, 10, 4), 11.26);
});

test('3.1: Summation kleiner Terme zuerst ist genauer', () => {
  const exact = inverseSquareSum(100000, 'double', 'backward');
  const fwd = Math.abs(inverseSquareSum(100000, 'float', 'forward') - exact);
  const bwd = Math.abs(inverseSquareSum(100000, 'float', 'backward') - exact);
  assert.ok(bwd < fwd / 10);
});

test('3.3: Verstärkungsfaktoren (Beispiel 3.8)', () => {
  assert.deepEqual(AMPLIFICATION.mul.factors(3, 7), { k1: 1, k2: 1 });
  const { k1 } = AMPLIFICATION.add.factors(1, -0.999);
  assert.ok(Math.abs(k1) > 500);
});

test('3.3: Taylor-Restglied verhält sich wie h^(r+1)', () => {
  const fn = FUNCTIONS.exp;
  close(taylorPolynomial(fn, 0, 10, 1), Math.E, 1e-7);
  const [[, e1], [, e2]] = remainderSeries(fn, 0, 2, [1e-2, 1e-3]);
  close(Math.log10(e1 / e2), 3, 0.05);
  close(FUNCTIONS.log.derivative(2, 0), -1, 1e-15);
});

test('3.4: (x1−x2)(x1+x2) ist genauer als x1²−x2² bei nahen Zahlen', () => {
  const rd = Math.fround;
  const x1 = rd(1.0001);
  const x2 = rd(1.0000001);
  const exact = x1 * x1 - x2 * x2;
  const { Fa, Fb } = differenceOfSquares(x1, x2, rd);
  assert.ok(relativeError(Fb, exact) < relativeError(Fa, exact));
  assert.ok(relativeError(Fb, exact) < 3 * 2 ** -24 * 1.01);
});

test('3.5: Vieta vermeidet Auslöschung in der kleinen Lösung', () => {
  const rd = Math.fround;
  const [, small] = quadraticRootsExact(1000, 0.001);
  const { naive, stable } = quadraticRoots(1000, 0.001, rd);
  assert.ok(relativeError(stable[1], small) < 1e-6);
  assert.ok(relativeError(naive[1], small) > 1e-2);
});

test('4: Knotenpotentialverfahren erfüllt die Knotenregel', () => {
  const { nodes, edges } = EXAMPLE_NETWORK;
  const { potentials, pipeFlows, system } = solveNetwork(nodes.length, edges);
  assert.equal(potentials.at(-1), 0);
  // A symmetrisch
  system.A.forEach((row, i) => row.forEach((v, j) => assert.equal(v, system.A[j][i])));
  let pi = 0;
  const flows = edges.map((e) => (e.type === 'pipe' ? pipeFlows[pi++] : e.value));
  nodeBalance(nodes.length, edges, flows).forEach((v) => close(v, 0, 1e-12));
  assert.deepEqual(assembleNetwork(nodes.length, edges).B[0], [1, -1, 0, 0]);
});

test('5: Normen', () => {
  assert.equal(vectorNorm([3, -4], 2), 5);
  assert.equal(vectorNorm([3, -4], 1), 7);
  assert.equal(vectorNorm([3, -4], Infinity), 4);
  const A = [[1, -2], [3, 4]];
  assert.equal(normInf(A), 7);
  assert.equal(norm1(A), 6);
  close(normFrobenius(A), Math.sqrt(30), 1e-14);
  // symmetrisch: ‖A‖₂ = ϱ(A)
  const S = [[2, 1], [1, 2]];
  close(norm2x2(S), 3, 1e-12);
  close(spectralRadius2x2(S), 3, 1e-12);
  assert.ok(norm2x2(A) >= spectralRadius2x2(A) - 1e-12);
  const ev = eigenvalues2x2([[0, -1], [1, 0]]);
  assert.deepEqual(ev.map((l) => l.im), [1, -1]);
});

test('6: Beispiel 6.3 – cond∞ = 4/ε', () => {
  const eps = 1e-3;
  const A = [[-1, 1], [1 - eps, -1]];
  close(normInf(A) * normInf(inverse2x2(A)), 4 / eps, 1e-6);
});

test('7: Beispiel 7.4 – Gauß-Elimination und Rückwärtseinsetzen', () => {
  const A = [[2, 4, 6, 8], [16, 33, 50, 67], [4, 15, 31, 44], [10, 29, 63, 97]];
  const b = [40, 330, 167, 350];
  const { steps, upper, rhs } = gaussElimination(A, b);
  assert.deepEqual(steps[0].after[1], [0, 1, 2, 3, 10]);
  assert.deepEqual(upper[3], [0, 0, 0, 9]);
  assert.deepEqual(rhs, [40, 10, 17, 9]);
  assert.deepEqual(backSubstitution(upper, rhs).x, [4, 3, 2, 1]);
  assert.deepEqual(solve(A, b).map(Math.round), [4, 3, 2, 1]);
});

test('7: LU mit Pivotisierung reproduziert PA = LU', () => {
  const A = [[0, 2, 1], [1, 1, 1], [2, 1, 3]];
  const { L, upper, perm } = gaussElimination(A, [1, 2, 3], 'partial');
  const PA = perm.map((i) => A[i]);
  const LU = L.map((row) => upper[0].map((_, j) => row.reduce((s, v, k) => s + v * upper[k][j], 0)));
  PA.forEach((row, i) => row.forEach((v, j) => close(LU[i][j], v, 1e-12)));
});

test('7: Aufwand und Frobeniusmatrizen', () => {
  const { gauss, gaussLeading, triangular } = operationCounts(100);
  assert.equal(triangular, 10000);
  close(gauss / gaussLeading, 1, 0.03);
  assert.deepEqual(frobeniusMatrix(3, 0, [0, 2, 3]), [[1, 0, 0], [2, 1, 0], [3, 0, 1]]);
});
