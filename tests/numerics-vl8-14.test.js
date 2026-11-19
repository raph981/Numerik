import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  luDecompose, luSolve, inverse, growthFactor, wilkinsonMatrix, permutationFromVector,
} from '../js/lib/numerics/lu.js';
import { collocationMatrix, midpoints } from '../js/lib/numerics/integral.js';
import {
  designMatrix, gramSchmidt, orthogonalityLoss, householderVector, applyHouseholder, householderQR,
  solveNormalEquations, solveLeastSquaresQR,
} from '../js/lib/numerics/qr.js';
import { runIteration, iterationMatrix, poisson1D, poissonRates, stepsForReduction } from '../js/lib/numerics/iterative.js';
import { symmetricEigenvalues, eigenvalues3x3, gerschgorinDiscs, polynomialRoots } from '../js/lib/numerics/eigen.js';
import { cholesky, bandMatrix, arrowMatrix, fillIn, createRng } from '../js/lib/numerics/special.js';
import { matMul, normInf, solve, transpose } from '../js/lib/numerics/linalg.js';
import { roundSig } from '../js/lib/numerics/arithmetic.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);
const matClose = (A, B, tol) => A.forEach((row, i) => row.forEach((v, j) => close(v, B[i][j], tol)));
const permuted = (A, rows, cols) => rows.map((i) => cols.map((j) => A[i][j]));

test('8: PAQ = LU für alle Pivotisierungen', () => {
  const A = [[1, 2, 3], [4, 5, 6], [7, 8, 10]];
  for (const pivoting of ['zero', 'partial', 'full']) {
    const { L, U, rowPerm, colPerm } = luDecompose(A, { pivoting });
    matClose(matMul(L, U), permuted(A, rowPerm, colPerm), 1e-12);
  }
  const P = permutationFromVector([2, 0, 1]);
  assert.deepEqual(matMul(P, A)[0], A[2]);
});

test('8: Lösen mit LU, Inverse', () => {
  const A = [[2, 1, 1], [4, -6, 0], [-2, 7, 2]];
  const b = [5, -2, 9];
  const dec = luDecompose(A, { pivoting: 'full' });
  luSolve(dec, b).x.forEach((v, i) => close(v, [1, 1, 2][i], 1e-12));
  matClose(matMul(A, inverse(A)), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 1e-12);
});

test('8.4: Kollokationsmatrix – Kondition wächst für γ → 0', () => {
  const cond = (n, g) => { const A = collocationMatrix(n, g); return normInf(A) * normInf(inverse(A)); };
  close(cond(8, 0.5), 6.48, 0.01);
  close(cond(8, 0.9), 1.48, 0.01);
  assert.ok(cond(32, 0.01) > 3000);
  close(midpoints(4)[0], 0.125, 1e-15);
});

test('9.8: ohne Pivotisierung in F(10,4) völlig falsch, mit Pivotisierung korrekt', () => {
  const rd = (v) => roundSig(v, 10, 4);
  const A = [[-1e-5, 1], [2, 1]];
  const b = [1, 0];
  const bad = luSolve(luDecompose(A, { pivoting: 'none', rd }), b, { rd }).x;
  const good = luSolve(luDecompose(A, { pivoting: 'partial', rd }), b, { rd }).x;
  assert.deepEqual(bad, [0, 1]);
  assert.deepEqual(good, [-0.5, 1]);
});

test('9.4: Wilkinson-Matrix wächst wie 2^(n−1), Totalpivotisierung nicht', () => {
  const W = wilkinsonMatrix(10);
  const gp = growthFactor(W, luDecompose(W, { pivoting: 'partial' }).U);
  const gf = growthFactor(W, luDecompose(W, { pivoting: 'full' }).U);
  assert.ok(gp > 40 && gf < 5);
});

test('10: Cholesky – A = L̃L̃ᵀ, Pivots ≥ λmin', () => {
  const A = [[4, 2, 2], [2, 5, 3], [2, 3, 6]];
  const { Ltilde, D } = cholesky(A);
  matClose(matMul(Ltilde, transpose(Ltilde)), A, 1e-12);
  const lmin = symmetricEigenvalues(A)[0];
  D.forEach((d) => assert.ok(d >= lmin - 1e-12));
  assert.throws(() => cholesky([[1, 2], [2, 1]]));
});

test('10/13: Bandstruktur bleibt erhalten, Pfeilmatrix füllt sich auf', () => {
  const band = fillIn(bandMatrix(12, 3));
  band.L.forEach((row, i) => row.forEach((v, j) => { if (Math.abs(i - j) >= 3) close(v, 0, 1e-14); }));
  const bad = fillIn(arrowMatrix(10, false));
  const good = fillIn(arrowMatrix(10, true));
  assert.equal(good.nnzLU, good.nnzA);
  assert.equal(bad.nnzLU, 10 * 10);
});

test('11: Normalengleichung = QR-Lösung, Gram-Schmidt', () => {
  const xs = [0, 0.25, 0.5, 0.75, 1];
  const ys = xs.map((x) => 1 + 2 * x - x * x);
  const A = designMatrix(xs, 3);
  solveNormalEquations(A, ys, solve).forEach((v, i) => close(v, [1, 2, -1][i], 1e-10));
  solveLeastSquaresQR(A, ys).forEach((v, i) => close(v, [1, 2, -1][i], 1e-10));
  const { Q, R } = gramSchmidt(A, 'modified');
  matClose(matMul(Q, R), A, 1e-12);
  assert.ok(orthogonalityLoss(Q) < 1e-12);
});

test('11.5: modifiziertes Gram-Schmidt ist stabiler', () => {
  const A = collocationMatrix(64, 1e-3);
  const cgs = orthogonalityLoss(gramSchmidt(A, 'classical').Q);
  const mgs = orthogonalityLoss(gramSchmidt(A, 'modified').Q);
  assert.ok(mgs < cgs / 100);
});

test('12: Householder', () => {
  const x = [3, 4];
  const { v, beta } = householderVector(x);
  const y = applyHouseholder(v, x);
  close(y[0], beta, 1e-12);
  close(y[1], 0, 1e-12);
  const A = [[1, 2], [3, 4], [5, 6], [7, 8]];
  const { Q, R } = householderQR(A);
  matClose(matMul(Q, R), A, 1e-12);
  matClose(matMul(transpose(Q), Q), Q.map((_, i) => Q.map((__, j) => (i === j ? 1 : 0))), 1e-12);
  close(R[2][1], 0, 1e-14);
});

test('13/14: Konvergenz der Iterationsverfahren', () => {
  const n = 10;
  const A = poisson1D(n);
  const exact = new Array(n).fill(1);
  const b = A.map((row) => row.reduce((s, v) => s + v, 0));
  const rates = poissonRates(n);
  const jac = runIteration(A, b, new Array(n).fill(0), 'jacobi', { maxIt: 400, exact });
  const gs = runIteration(A, b, new Array(n).fill(0), 'gaussSeidel', { maxIt: 400, exact });
  assert.ok(gs.errors.at(-1) < jac.errors.at(-1));
  assert.ok(jac.errors.at(-1) < 1e-6);
  // Spektralradius der Jacobi-Iterationsmatrix = cos(π/(n+1))
  const S = iterationMatrix(A, 'jacobi');
  close(Math.max(...symmetricEigenvalues(S).map(Math.abs)), rates.jacobi, 1e-9);
  close(rates.gaussSeidel, rates.jacobi ** 2, 1e-15);
  assert.equal(stepsForReduction(0.5, 1e-3), 10);
  const rich = runIteration(A, b, new Array(n).fill(0), 'richardson', { omega: 0.6, maxIt: 50, exact });
  assert.ok(rich.errors.at(-1) > rich.errors[0]); // ω > 2/λmax divergiert
});

test('14: Gerschgorin und Eigenwerte', () => {
  const A = [[4, 1, 0], [1, 3, 1], [0, 1, 1]];
  const ev = eigenvalues3x3(A).map((z) => z.re).sort((a, b) => a - b);
  symmetricEigenvalues(A).forEach((l, i) => close(l, ev[i], 1e-8));
  const discs = gerschgorinDiscs(A);
  ev.forEach((l) => assert.ok(discs.some((d) => Math.abs(l - d.center) <= d.radius + 1e-12)));
  const roots = polynomialRoots([1, 0]); // z² + 1
  roots.forEach((z) => close(Math.abs(z.im), 1, 1e-9));
  assert.ok(createRng(3)() !== createRng(4)());
});
