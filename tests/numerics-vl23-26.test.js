import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BASES, gaussApproximation, innerProduct, orthonormalErrors, spdCondition,
} from '../js/lib/numerics/approximation.js';
import {
  haar, haarSupport, levelSize, cellMeans, toHaar, fromHaar, energy, compress, applyMask, uniformLevel,
} from '../js/lib/numerics/haar.js';
import {
  legendre, gaussLegendre, newtonCotes, RULES, applyRule, ruleOrder, composite, integrate, experimentalOrder,
  trapezoidWithErrorControl, romberg, archimedes, tensorMidpoint, monteCarlo, monteCarloSequence, seededRandom,
} from '../js/lib/numerics/quadrature.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);
const closeArray = (a, b, tol) => { assert.equal(a.length, b.length); a.forEach((v, i) => close(v, b[i], tol)); };

// Integranden aus Beispiel 25.8 / 26.7
const F1 = { f: Math.sin, a: 0, b: Math.PI / 2, exact: 1 };
const F2 = { f: (x) => 1 / (1e-5 + x * x), a: -1, b: 1, exact: 9.914588332462438e2 };
const F3 = { f: (x) => Math.sqrt(Math.max(0, 1 - x * x)), a: -1, b: 1, exact: Math.PI / 2 };

/* ---------- Vorlesung 23 ---------- */

test('23.7: Legendre-Polynome P₂, P₃ und Orthogonalität', () => {
  for (const x of [-0.7, 0.2, 0.9]) {
    close(legendre(2, x), (3 * x * x - 1) / 2, 1e-15);
    close(legendre(3, x), (5 * x ** 3 - 3 * x) / 2, 1e-15);
  }
  close(innerProduct((x) => legendre(2, x), (x) => legendre(4, x)), 0, 1e-14);
  close(innerProduct((x) => legendre(3, x), (x) => legendre(3, x)), 2 / 7, 1e-14);
});

test('23.3: Gramsche Matrix ist SPD; Orthonormalbasen liefern A = I', () => {
  const legendreFit = gaussApproximation(Math.abs, 'legendre', 6);
  legendreFit.gram.forEach((row, i) => row.forEach((v, j) => close(v, i === j ? 1 : 0, 1e-13)));
  const fourierFit = gaussApproximation(Math.abs, 'fourier', 7);
  fourierFit.gram.forEach((row, i) => row.forEach((v, j) => close(v, i === j ? 1 : 0, 1e-13)));
  // Monome: A_ij = ∫ x^{i+j} dx – schlecht konditioniert, aber gleiche Bestapproximation wie Legendre
  const monomialFit = gaussApproximation(Math.abs, 'monomial', 6);
  close(monomialFit.gram[2][2], 2 / 5, 1e-14);
  assert.ok(spdCondition(monomialFit.gram) > 1e3);
  close(monomialFit.error, legendreFit.error, 1e-10);
  // Fehler steht senkrecht auf S: ⟨f − g, φ⟩ = 0
  for (let j = 0; j < 6; j++) close(innerProduct((x) => Math.abs(x) - legendreFit.evaluate(x), BASES.legendre.phi(j)), 0, 1e-12);
});

test('23.3/23.8: Fehlerdarstellung ‖f − g_N‖² = ⟨f,f⟩ − Σ⟨f,ψ_i⟩² fällt monoton', () => {
  const errors = orthonormalErrors(Math.sign, 'fourier', 15);
  for (let N = 1; N < errors.length; N++) assert.ok(errors[N] <= errors[N - 1] + 1e-15);
  close(errors[9], gaussApproximation(Math.sign, 'fourier', 9).error, 1e-10);
});

/* ---------- Vorlesung 24 ---------- */

test('24.3: Haar-Wavelets – Anzahl, Träger, Orthonormalität', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(levelSize), [1, 1, 2, 4, 8]);
  assert.deepEqual(haarSupport(3, 2), [0.5, 0.75]);
  const fns = [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [3, 2]];
  const ip = ([k, i], [l, j]) => integrate((x) => haar(k, i, x) * haar(l, j, x), 0, 1, { panels: 64, points: 2 });
  for (const p of fns) for (const q of fns) close(ip(p, q), p === q ? 1 : 0, 1e-13);
});

test('24.5: Basistransformation hin und zurück, Parseval', () => {
  const alpha = cellMeans((x) => Math.exp(x) * Math.sin(9 * x), 6);
  const beta = toHaar(alpha);
  assert.deepEqual(beta.map((l) => l.length), [1, 1, 2, 4, 8, 16, 32]);
  closeArray(fromHaar(beta), alpha, 1e-13);
  close(energy(beta), alpha.reduce((s, a) => s + a * a, 0) / 64, 1e-13); // ‖v‖² = Σ α_i² · 2^{−k}
  // β_0^1 = α_0/2 − α_1/2 für k = 1 (Beweis von Lemma 24.5)
  const [b0, b1] = toHaar([3, 1]);
  assert.deepEqual([b0[0], b1[0]], [2, 1]);
});

test('24.6: adaptive Kompression erfüllt die Toleranz mit weniger Koeffizienten', () => {
  const beta = toHaar(cellMeans((x) => 1 / (10 * (x - 1 / 3) ** 2 + 0.01), 10));
  for (const tol of [0.1, 0.01]) {
    const { mask, count } = compress(beta, tol);
    const approx = applyMask(beta, mask);
    const diff = beta.map((level, l) => level.map((b, i) => b - approx[l][i]));
    assert.ok(Math.sqrt(energy(diff)) <= tol * Math.sqrt(energy(beta)) * (1 + 1e-12));
    assert.ok(count < uniformLevel(beta, tol).count);
  }
});

/* ---------- Vorlesung 25 ---------- */

test('25.1: Newton-Cotes-Gewichte und Ordnungen', () => {
  closeArray(newtonCotes(1).weights, [1 / 2, 1 / 2], 1e-15);
  closeArray(newtonCotes(2).weights, [1 / 6, 4 / 6, 1 / 6], 1e-15);
  closeArray(newtonCotes(3).weights, [1 / 8, 3 / 8, 3 / 8, 1 / 8], 1e-15);
  closeArray(newtonCotes(0, { open: true }).weights, [1], 1e-15);
  closeArray(newtonCotes(2, { open: true }).weights, [2 / 3, -1 / 3, 2 / 3], 1e-14);
  assert.ok(newtonCotes(7).weights.every((w) => w > 0));
  assert.ok(newtonCotes(8).weights.some((w) => w < 0));
  assert.deepEqual(['midpoint', 'trapezoid', 'simpson', 'threeEighths'].map((k) => ruleOrder(RULES[k].rule)), [2, 2, 4, 4]);
});

test('25.2: Restglieder von Trapez-, Simpson- und Mittelpunktsregel', () => {
  // f = x⁴ auf [0, 1]: f'' = 12x², f⁽⁴⁾ = 24 (konstant, daher exakt prüfbar)
  close(1 / 5 - applyRule(RULES.simpson.rule, (x) => x ** 4, 0, 1), -24 / 2880, 1e-15);
  // f = x² auf [0, 2]: f'' = 2
  close(8 / 3 - applyRule(RULES.trapezoid.rule, (x) => x * x, 0, 2), -(8 / 12) * 2, 1e-14);
  close(8 / 3 - applyRule(RULES.midpoint.rule, (x) => x * x, 0, 2), (8 / 24) * 2, 1e-14);
});

test('25.8: Tabellen der summierten Trapez- und Simpsonregel', () => {
  const trap = (F, N) => composite(RULES.trapezoid.rule, F.f, F.a, F.b, N);
  const simp = (F, N) => composite(RULES.simpson.rule, F.f, F.a, F.b, N);
  assert.deepEqual(trap(F1, 2), { value: trap(F1, 2).value, evals: 3 });
  close(trap(F1, 2).value, 9.480594489685199e-1, 1e-15);
  close(trap(F1, 4).value, 9.871158009727754e-1, 1e-15);
  assert.equal(simp(F1, 2).evals, 5);
  close(simp(F1, 2).value, 1.000134584974194, 1e-15);
  close(trap(F2, 2).value, 1.000009999900001e5, 1e-8);
  close(simp(F2, 2).value, 3.333899978334190e4, 1e-8);
  close(trap(F3, 4).value, 1.366025403784439, 1e-15);
  close(simp(F3, 2).value, 1.488033871712585, 1e-15);
  // Bemerkung 25.9: EOC 2 bzw. 4 für glattes f, aber nur 3/2 für den Halbkreis
  const eoc = (rule, F) => experimentalOrder([64, 128].map((N) => Math.abs(composite(rule, F.f, F.a, F.b, N).value - F.exact)))[0];
  close(eoc(RULES.trapezoid.rule, F1), 2, 0.01);
  close(eoc(RULES.simpson.rule, F1), 4, 0.01);
  close(eoc(RULES.trapezoid.rule, F3), 1.5, 0.01);
  close(eoc(RULES.simpson.rule, F3), 1.5, 0.01);
});

test('25.7/25.10: Fehlerkontrolle mit Simpson als Schätzer', () => {
  const result = trapezoidWithErrorControl(F1.f, F1.a, F1.b, { tol: 1e-6, omega: 0.5 });
  assert.ok(result.converged);
  close(result.steps[0].trapezoid, 9.480594489685199e-1, 1e-15);
  close(result.steps[1].simpson, 1.000134584974194, 1e-14); // Simpson zu h aus Trapez- und Mittelpunktssumme
  assert.ok(Math.abs(result.value - 1) <= 1e-6);
  assert.equal(result.evals, result.steps.at(-1).N + 1);
});

/* ---------- Vorlesung 26 ---------- */

test('26.1: Romberg-Integration', () => {
  const { tableau, evals } = romberg(F1.f, F1.a, F1.b, 5);
  assert.equal(evals, 33);
  close(tableau[1][0], 9.480594489685199e-1, 1e-15);
  assert.ok(Math.abs(tableau[0][5] - 1) < 1e-14);
  // Erste Extrapolationsspalte = Simpsonregel
  close(tableau[1][1], composite(RULES.simpson.rule, F1.f, F1.a, F1.b, 2).value, 1e-15);
});

test('26.2–26.5: Gauß-Quadratur', () => {
  const g2 = gaussLegendre(2);
  closeArray(g2.nodes, [(1 - 1 / Math.sqrt(3)) / 2, (1 + 1 / Math.sqrt(3)) / 2], 1e-15);
  closeArray(g2.weights, [1 / 2, 1 / 2], 1e-15);
  closeArray(gaussLegendre(3).weights, [5 / 18, 8 / 18, 5 / 18], 1e-15);
  for (let n = 1; n <= 8; n++) assert.equal(ruleOrder(gaussLegendre(n)), 2 * n);
  // Beispiel 26.7 (i): Gauss4 bzw. Gauss6 mit 4 bzw. 6 Auswertungen
  close(composite(RULES.gauss2.rule, F1.f, F1.a, F1.b, 2).value, 9.999101667698898e-1, 1e-15);
  close(composite(RULES.gauss3.rule, F1.f, F1.a, F1.b, 2).value, 1.000000118910998, 1e-15);
});

test('26.6/26.7: adaptive Quadratur nach Archimedes', () => {
  const first = archimedes(F1.f, F1.a, F1.b, { tol: Infinity, minLevel: 0 });
  assert.equal(first.evals, 3);
  close(first.value, 9.480594489685199e-1, 1e-15);
  const peak = archimedes(F2.f, F2.a, F2.b, { tol: 0.1, minLevel: 2 });
  assert.equal(peak.evals, 173);
  close(peak.value, 9.922788393957054e2, 1e-9);
});

test('26.3: Fluch der Dimension – Tensor-Mittelpunktsregel vs. Monte Carlo', () => {
  const f = (x) => x.reduce((p, v) => p * (Math.PI / 2) * Math.sin(Math.PI * v), 1); // ∫ = 1
  close(tensorMidpoint(f, 2, 64).value, 1, 1e-3);
  assert.equal(tensorMidpoint(f, 3, 5).evals, 125);
  const random = seededRandom(7);
  const a = random();
  assert.ok(a >= 0 && a < 1 && a !== random());
  assert.ok(Math.abs(monteCarlo(f, 6, 4096).value - 1) < Math.abs(tensorMidpoint(f, 6, 4).value - 1));
  // Folge aus einer Zufallsfolge: letzter Wert = gewöhnliche Monte-Carlo-Schätzung mit gleichem Seed
  const sequence = monteCarloSequence(f, 3, [10, 100, 1000], seededRandom(3));
  close(sequence[2], monteCarlo(f, 3, 1000, seededRandom(3)).value, 1e-14);
});
