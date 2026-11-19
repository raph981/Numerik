/**
 * Stückweise lineare und kubische Spline-Interpolation (Vorlesung 21).
 */

/**
 * Löst ein Tridiagonalsystem (Thomas-Algorithmus = LU ohne Pivotisierung, O(n)).
 * @param {number[]} lower  Unterdiagonale (lower[0] wird ignoriert)
 * @param {number[]} diag
 * @param {number[]} upper  Oberdiagonale (upper[n−1] wird ignoriert)
 */
export function solveTridiagonal(lower, diag, upper, rhs) {
  const n = diag.length;
  const c = new Array(n).fill(0);
  const d = new Array(n).fill(0);
  c[0] = upper[0] / diag[0];
  d[0] = rhs[0] / diag[0];
  for (let i = 1; i < n; i++) {
    const m = diag[i] - lower[i] * c[i - 1];
    c[i] = upper[i] / m;
    d[i] = (rhs[i] - lower[i] * d[i - 1]) / m;
  }
  const x = new Array(n).fill(0);
  x[n - 1] = d[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = d[i] - c[i] * x[i + 1];
  return x;
}

/**
 * Kubischer Spline mit natürlichen Randbedingungen (Satz 21.3):
 * p_i(x) = a0 + a1 (x − x_i) + a2 (x − x_i)² + a3 (x − x_i)³ auf [x_{i−1}, x_i].
 * @returns {{coeffs:{a0:number,a1:number,a2:number,a3:number}[], evaluate:(x:number)=>number, second:(x:number)=>number}}
 */
export function naturalCubicSpline(xs, ys) {
  const n = xs.length - 1;
  const h = (i) => xs[i] - xs[i - 1];
  const a2 = new Array(n + 1).fill(0); // a2^{(0)} = a2^{(n)} = 0
  if (n >= 2) {
    const lower = [];
    const diag = [];
    const upper = [];
    const rhs = [];
    for (let i = 1; i <= n - 1; i++) {
      lower.push(h(i));
      diag.push(2 * (h(i) + h(i + 1)));
      upper.push(h(i + 1));
      rhs.push(3 * ((ys[i + 1] - ys[i]) / h(i + 1) - (ys[i] - ys[i - 1]) / h(i)));
    }
    // System (21.1): in Zeile i stehen a2^{(i−1)}, a2^{(i)}, a2^{(i+1)}
    const sol = solveTridiagonal(lower, diag, upper, rhs);
    sol.forEach((v, k) => { a2[k + 1] = v; });
  }
  const coeffs = [null];
  for (let i = 1; i <= n; i++) {
    coeffs.push({
      a0: ys[i],
      a1: (ys[i] - ys[i - 1]) / h(i) + (h(i) / 3) * (2 * a2[i] + a2[i - 1]),
      a2: a2[i],
      a3: (a2[i] - a2[i - 1]) / (3 * h(i)),
    });
  }
  const piece = (x) => {
    let i = 1;
    while (i < n && x > xs[i]) i++;
    return i;
  };
  return {
    coeffs,
    evaluate(x) {
      const i = piece(x);
      const { a0, a1, a2: c2, a3 } = coeffs[i];
      const d = x - xs[i];
      return a0 + d * (a1 + d * (c2 + d * a3));
    },
    second(x) {
      const i = piece(x);
      return 2 * coeffs[i].a2 + 6 * coeffs[i].a3 * (x - xs[i]);
    },
  };
}

/** Stückweise lineare Interpolation (Spline-Raum S¹). */
export function linearSpline(xs, ys) {
  return (x) => {
    let i = 1;
    while (i < xs.length - 1 && x > xs[i]) i++;
    const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    return (1 - t) * ys[i - 1] + t * ys[i];
  };
}
