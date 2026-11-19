import { test } from 'node:test';
import assert from 'node:assert/strict';

import { neville } from '../js/lib/numerics/interpolation.js';
import {
  dft, fft, inverseDft, bitReversal, rootsOfUnity, realTrigInterpolation, trigNodes, amplitudeSpectrum,
} from '../js/lib/numerics/fourier.js';
import { naturalCubicSpline, linearSpline, solveTridiagonal } from '../js/lib/numerics/spline.js';
import { bernstein, bernsteinApproximation, bezierPoint, deCasteljau, convexHull } from '../js/lib/numerics/bezier.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('19.2: Extrapolation von (cos h − 1)/sin h', () => {
  const a = (h) => (Math.cos(h) - 1) / Math.sin(h);
  const hs = [1 / 8, 1 / 16, 1 / 32];
  close(a(hs[0]), -6.258151e-2, 1e-8);
  const p0 = neville(hs, hs.map(a), 0)[0][2];
  close(p0, -1.02e-5, 1e-7);
  // Entwicklung in h² (a ist ungerade in h, a(h)/h gerade) – hier: zentrale Differenz
  const d = (h) => (Math.exp(1 + h) - Math.exp(1 - h)) / (2 * h);
  const e1 = Math.abs(neville(hs, hs.map(d), 0)[0][2] - Math.E);
  const e2 = Math.abs(neville(hs.map((h) => h * h), hs.map(d), 0)[0][2] - Math.E);
  assert.ok(e2 < e1 / 100);
});

test('20: Einheitswurzeln, DFT = FFT, Rücktransformation', () => {
  const w = rootsOfUnity(8);
  close(w.reduce((s, z) => s + z.re, 0), 0, 1e-14);
  const y = [1, 2, 0, -1, 3, 0.5, -2, 1];
  const c1 = dft(y);
  const c2 = fft(y);
  c1.forEach((c, k) => { close(c.re, c2[k].re, 1e-13); close(c.im, c2[k].im, 1e-13); });
  inverseDft(c1).forEach((v, j) => close(v.re, y[j], 1e-12));
  assert.deepEqual(bitReversal(8), [0, 4, 2, 6, 1, 5, 3, 7]);
});

test('20.3: reelle trigonometrische Interpolation interpoliert (n gerade und ungerade)', () => {
  for (const N of [7, 8]) {
    const xs = trigNodes(N);
    const y = xs.map((x) => Math.exp(Math.sin(x)) + Math.cos(3 * x));
    const t = realTrigInterpolation(y);
    xs.forEach((x, j) => close(t.evaluate(x), y[j], 1e-12));
  }
  const spec = amplitudeSpectrum(realTrigInterpolation(trigNodes(16).map((x) => 2 * Math.sin(3 * x))));
  close(spec[3], 2, 1e-12);
  close(spec[2], 0, 1e-12);
});

test('21: kubischer Spline interpoliert, ist C² und konvergiert wie h⁴', () => {
  const xs = [0, 0.1, 0.2, 0.25, 0.5, 0.7, 1.0];
  const ys = [1, -1, -1, -0.5, 0, 0, 5];
  const s = naturalCubicSpline(xs, ys);
  xs.forEach((x, i) => close(s.evaluate(x), ys[i], 1e-12));
  close(s.second(0), 0, 1e-12);
  close(s.second(1), 0, 1e-12);
  // p_i'' und p_{i+1}'' stimmen in jedem inneren Knoten x_i überein (C²)
  for (let i = 1; i < xs.length - 1; i++) {
    const left = 2 * s.coeffs[i].a2;
    const right = 2 * s.coeffs[i + 1].a2 + 6 * s.coeffs[i + 1].a3 * (xs[i] - xs[i + 1]);
    close(left, right, 1e-9);
  }
  const f = (x) => Math.exp(-x * x);
  const err = (n, kind) => {
    const nodes = Array.from({ length: n + 1 }, (_, i) => -10 + (20 * i) / n);
    const ev = kind === 'cubic' ? naturalCubicSpline(nodes, nodes.map(f)).evaluate : linearSpline(nodes, nodes.map(f));
    let m = 0;
    for (let k = 0; k <= 4000; k++) { const x = -10 + k / 200; m = Math.max(m, Math.abs(f(x) - ev(x))); }
    return m;
  };
  close(Math.log2(err(128, 'cubic') / err(256, 'cubic')), 4, 0.3);
  close(Math.log2(err(128, 'linear') / err(256, 'linear')), 2, 0.2);
  assert.deepEqual(solveTridiagonal([0, 1], [2, 2], [1, 0], [3, 3]), [1, 1]);
});

test('22: Bernstein-Polynome und Bézier-Kurven', () => {
  for (const t of [0, 0.3, 1]) close([0, 1, 2, 3, 4, 5].reduce((s, i) => s + bernstein(5, i, t), 0), 1, 1e-14);
  close(bernstein(5, 2, 1 - 0.3), bernstein(5, 3, 0.3), 1e-15);
  const b = [[0, 0], [1 / 3, -1], [2 / 3, -1], [1, 1]];
  for (const t of [0, 0.25, 0.6, 1]) {
    const p = bezierPoint(b, t);
    close(p[0], t, 1e-14);
    close(p[1], t ** 3 + 3 * t * t - 3 * t, 1e-14);
    const q = deCasteljau(b, t).at(-1)[0];
    close(q[0], p[0], 1e-14);
    close(q[1], p[1], 1e-14);
  }
  assert.equal(convexHull([[0, 0], [1, 0], [1, 1], [0, 1], [0.5, 0.5]]).length, 4);
  const err = (n) => Math.max(...[0.1, 0.5, 0.9].map((t) => Math.abs(bernsteinApproximation(Math.sin, n, t) - Math.sin(t))));
  assert.ok(err(64) < err(8));
});
