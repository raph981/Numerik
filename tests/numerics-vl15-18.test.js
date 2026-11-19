import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  scalarExample, SCALAR_ROOT, FIXED_POINT_FORMS, fixedPointIteration, newton1d, estimateOrder,
  systemExample, SYSTEM_ROOTS, solveSystem, nearestRoot,
} from '../js/lib/numerics/nonlinear.js';
import {
  equidistantNodes, chebyshevNodes, vandermonde, lagrangeBasis, lagrangeEval, dividedDifferences,
  newtonEval, neville, horner, DIFFERENCE_QUOTIENTS,
} from '../js/lib/numerics/interpolation.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('15: Fixpunktformen von x·eˣ = 3', () => {
  close(scalarExample.f(SCALAR_ROOT), 0, 1e-14);
  // 3/eˣ: |g'(ξ)| = ξ ≈ 1,05 > 1 → divergiert/oszilliert, Relaxation mit kleinem σ konvergiert
  const relax = fixedPointIteration((x) => FIXED_POINT_FORMS.relaxation.g(x, 0.1), 1, 100);
  close(relax.at(-1), SCALAR_ROOT, 1e-10);
  const exp = fixedPointIteration(FIXED_POINT_FORMS.exp.g, 1.04, 60);
  assert.ok(Math.abs(exp.at(-1) - SCALAR_ROOT) > Math.abs(exp[0] - SCALAR_ROOT));
  close(Math.abs(FIXED_POINT_FORMS.log.dg(SCALAR_ROOT)), 1 / SCALAR_ROOT, 1e-15);
});

test('16: Newton konvergiert quadratisch', () => {
  const xs = newton1d(scalarExample.f, scalarExample.df, 2, 20);
  close(xs.at(-1), SCALAR_ROOT, 1e-15);
  const errs = xs.map((x) => Math.abs(x - SCALAR_ROOT)).filter((e) => e > 1e-14);
  const orders = estimateOrder(errs).filter(Number.isFinite);
  close(orders.at(-1), 2, 0.2);
});

test('16.1/16.10: Relaxation ~154 Schritte, Newton 4 Schritte', () => {
  const relax = solveSystem(systemExample, [2, 1], { method: 'relaxation', sigma: 0.1, maxIt: 400 });
  assert.ok(relax.converged);
  close(relax.iterates.length - 1, 154, 3);
  const newton = solveSystem(systemExample, [2, 1], { method: 'newton' });
  assert.equal(newton.iterates.length - 1, 4);
  assert.equal(nearestRoot(newton.iterates.at(-1)), 0);
  close(newton.iterates.at(-1)[0], 1.837117307087384, 1e-12);
  // zweiter Quadrant: Newton ja, Relaxation nicht
  assert.equal(nearestRoot(solveSystem(systemExample, [-2, 1]).iterates.at(-1)), 1);
  // Relaxation verlässt die Nullstelle im 2. Quadranten, selbst wenn man nahe startet
  const relaxQ2 = solveSystem(systemExample, [-1.8, 0.8], { method: 'relaxation', sigma: 0.1 });
  assert.notEqual(nearestRoot(relaxQ2.iterates.at(-1)), 1);
  SYSTEM_ROOTS.forEach((r) => systemExample.f(r).forEach((v) => close(v, 0, 1e-14)));
});

test('17: Lagrange, Newton, Neville und Horner stimmen überein', () => {
  const xs = [0, 2, 7, 10];
  const ys = [1, 0.4546, 0.0938, -0.0544];
  close(lagrangeBasis(xs, 1, 2), 1, 1e-15);
  close(lagrangeBasis(xs, 1, 7), 0, 1e-15);
  const coeffs = dividedDifferences(xs, ys)[0];
  for (const x of [0, 1.3, 5, 10]) {
    const p = lagrangeEval(xs, ys, x);
    close(newtonEval(xs, coeffs, x), p, 1e-12);
    close(neville(xs, ys, x)[0][3], p, 1e-12);
  }
  close(horner([1, 2, 3], 2), 17, 0);
  assert.equal(vandermonde([1, 2])[1][1], 2);
  assert.equal(equidistantNodes(0, 1, 4)[1], 0.25);
  const cheb = chebyshevNodes(-1, 1, 3);
  assert.ok(cheb[0] < cheb[3] && Math.abs(cheb[0]) < 1);
});

test('18: Runge-Phänomen und Tschebyscheff-Stützstellen', () => {
  const f = (x) => 1 / (1 + x * x);
  const maxErr = (nodes) => {
    const ys = nodes.map(f);
    let m = 0;
    for (let k = 0; k <= 1000; k++) {
      const x = -5 + k / 100;
      m = Math.max(m, Math.abs(f(x) - lagrangeEval(nodes, ys, x)));
    }
    return m;
  };
  assert.ok(maxErr(equidistantNodes(-5, 5, 12)) > maxErr(equidistantNodes(-5, 5, 6)));
  assert.ok(maxErr(chebyshevNodes(-5, 5, 12)) < 0.1);
});

test('18.6: zweiter Differenzenquotient für sinh(0,6)', () => {
  const q = DIFFERENCE_QUOTIENTS.second;
  close(q.apply(Math.sinh, 0.6, 1e-1), 0.6371, 1e-4);
  close(q.apply(Math.sinh, 0.6, 1e-3), 0.6366536352, 1e-9);
  assert.ok(Math.abs(q.apply(Math.sinh, 0.6, 1e-10)) > 1000);
});
