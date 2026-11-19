/**
 * Trigonometrische Interpolation, DFT und FFT (Vorlesung 20).
 * Komplexe Zahlen werden als {re, im} dargestellt.
 */

const cadd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const expi = (phi) => ({ re: Math.cos(phi), im: Math.sin(phi) });

/** Stützstellen x_j = 2πj/(n+1), j = 0 … n. */
export function trigNodes(count) {
  return Array.from({ length: count }, (_, j) => (2 * Math.PI * j) / count);
}

/** Einheitswurzeln w_k = e^{i·2πk/N}, k = 0 … N−1 (Lemma 20.1). */
export function rootsOfUnity(N) {
  return Array.from({ length: N }, (_, k) => expi((2 * Math.PI * k) / N));
}

/**
 * Diskrete Fourier-Transformation (20.2), direkt in O(N²):
 * c_k = (1/N) Σ_j y_j e^{−2πijk/N}.
 * @param {number[]|{re:number, im:number}[]} y
 */
export function dft(y) {
  const N = y.length;
  const data = y.map((v) => (typeof v === 'number' ? { re: v, im: 0 } : v));
  return Array.from({ length: N }, (_, k) => {
    let s = { re: 0, im: 0 };
    for (let j = 0; j < N; j++) s = cadd(s, cmul(data[j], expi((-2 * Math.PI * j * k) / N)));
    return { re: s.re / N, im: s.im / N };
  });
}

/**
 * Schnelle Fourier-Transformation (Cooley-Tukey, rekursiv) für N = 2^d.
 * Liefert dieselben Koeffizienten wie dft (inkl. Faktor 1/N).
 */
export function fft(y) {
  const N = y.length;
  if (N & (N - 1)) throw new Error('FFT benötigt N = 2^d');
  const data = y.map((v) => (typeof v === 'number' ? { re: v, im: 0 } : v));
  const raw = fftRaw(data);
  return raw.map((c) => ({ re: c.re / N, im: c.im / N }));
}

/** c̃_k = Σ_j y_j e^{−2πijk/N} ohne Normierung, Aufspaltung in gerade/ungerade (20.3). */
function fftRaw(y) {
  const N = y.length;
  if (N === 1) return [y[0]];
  const even = fftRaw(y.filter((_, j) => j % 2 === 0));
  const odd = fftRaw(y.filter((_, j) => j % 2 === 1));
  const out = new Array(N);
  for (let k = 0; k < N / 2; k++) {
    const t = cmul(expi((-2 * Math.PI * k) / N), odd[k]);
    out[k] = cadd(even[k], t);
    out[k + N / 2] = csub(even[k], t);
  }
  return out;
}

/** Rücktransformation y_j = Σ_k c_k e^{2πijk/N}. */
export function inverseDft(c) {
  const N = c.length;
  return Array.from({ length: N }, (_, j) => {
    let s = { re: 0, im: 0 };
    for (let k = 0; k < N; k++) s = cadd(s, cmul(c[k], expi((2 * Math.PI * j * k) / N)));
    return s;
  });
}

/** Bit-Reversal-Permutation der Indizes 0 … N−1 (Beispiel 20.6). */
export function bitReversal(N) {
  const d = Math.log2(N);
  return Array.from({ length: N }, (_, j) => {
    let r = 0;
    for (let b = 0; b < d; b++) if (j & (1 << b)) r |= 1 << (d - 1 - b);
    return r;
  });
}

/**
 * Reelle trigonometrische Interpolation (Satz 20.3) zu Daten y_0 … y_n an x_j = 2πj/(n+1).
 * @returns {{a:number[], b:number[], m:number, theta:number, evaluate:(x:number)=>number}}
 */
export function realTrigInterpolation(y) {
  const N = y.length; // = n + 1
  const n = N - 1;
  const theta = n % 2 === 0 ? 0 : 1;
  const m = theta ? (n - 1) / 2 : n / 2;
  const xs = trigNodes(N);
  const a = [];
  const b = [];
  // a_k, b_k mit x_k = 2πk/N, also cos(j x_k) = cos(2πjk/N)
  for (let k = 0; k <= m + theta; k++) a[k] = (2 / N) * y.reduce((s, yj, j) => s + yj * Math.cos((2 * Math.PI * j * k) / N), 0);
  for (let k = 0; k <= m; k++) b.push((2 / N) * y.reduce((s, yj, j) => s + yj * Math.sin((2 * Math.PI * j * k) / N), 0));
  const evaluate = (x) => {
    let s = a[0] / 2;
    for (let k = 1; k <= m; k++) s += a[k] * Math.cos(k * x) + b[k] * Math.sin(k * x);
    if (theta) s += (a[m + 1] / 2) * Math.cos((m + 1) * x);
    return s;
  };
  return { a, b, m, theta, evaluate, nodes: xs };
}

/** Amplitudenspektrum √(a_k² + b_k²) aus der reellen Interpolation. */
export function amplitudeSpectrum({ a, b, m }) {
  return Array.from({ length: m + 1 }, (_, k) => Math.hypot(a[k] ?? 0, b[k] ?? 0));
}
