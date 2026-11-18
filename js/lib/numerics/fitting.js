/**
 * Parameterschätzung für das Modell u(t) = u0 · exp(λ (t − t0)) (Abschnitt 1.3.3).
 *
 * Alle Schätzer liefern ein Objekt { u0, lambda } und gehen davon aus, dass
 * t0 = t[0] der (bekannte) Startzeitpunkt ist.
 */
import { matMul, matVec, norm2, solve2x2, transpose } from './linalg.js';

/**
 * Interpolation durch zwei Datenpunkte (t0, N0) und (t_i, N_i), Gleichung (1.5).
 */
export function interpolationFit(N, t, i) {
  if (i === 0 || t[i] === t[0]) throw new Error('Benötige zwei verschiedene Zeitpunkte');
  return {
    u0: N[0],
    lambda: (Math.log(N[i]) - Math.log(N[0])) / (t[i] - t[0]),
  };
}

/**
 * Ausgleichsgerade durch die Logarithmen der Daten (Gauß'sche Ausgleichsrechnung).
 * Löst die Normalengleichung AᵀA x = Aᵀb aus (1.6)–(1.8) mit x = (U0, λ), U0 = ln u0.
 */
export function linearFit(N, t) {
  const A = t.map((ti) => [1, ti - t[0]]);
  const b = N.map(Math.log);
  const At = transpose(A);
  const [U0, lambda] = solve2x2(matMul(At, A), matVec(At, b));
  return { u0: Math.exp(U0), lambda };
}

/**
 * Gradient F = ∇J_nl (bis auf positive Faktoren) wie im Skript angegeben,
 * sowie dessen Jacobimatrix H.
 */
function gradientAndJacobian(N, t, [u0, lambda]) {
  const F = [0, 0];
  const H = [[0, 0], [0, 0]];
  for (let i = 0; i < N.length; i++) {
    const d = t[i] - t[0];
    const e = Math.exp(lambda * d);
    const r = u0 * e - N[i];
    const q = 2 * u0 * e - N[i];
    F[0] += r * e;
    F[1] += r * d * e;
    H[0][0] += e * e;
    H[0][1] += d * e * q;
    H[1][0] += d * e * e;
    H[1][1] += d * d * e * q;
  }
  return { F, H };
}

/** Zielfunktion J_nl aus (1.9). */
export function nonlinearObjective(N, t, { u0, lambda }) {
  let J = 0;
  for (let i = 0; i < N.length; i++) {
    const r = u0 * Math.exp(lambda * (t[i] - t[0])) - N[i];
    J += r * r;
  }
  return J;
}

/**
 * Nichtlineare Parameterschätzung: gedämpftes Newton-Verfahren (1.10)
 *   x^{k+1} = x^k − η_k H⁻¹(x^k) F(x^k)
 * mit Liniensuche η_k ∈ {1, ½, ¼, …} (Reduktion von ‖F‖).
 *
 * @param {number[]} N
 * @param {number[]} t
 * @param {{u0:number, lambda:number}} start  Startwert x⁰
 * @param {object} [opts]
 * @returns {{u0:number, lambda:number, iterations:{k:number, u0:number, lambda:number, residual:number, eta:number}[], converged:boolean}}
 */
export function nonlinearFit(N, t, start, opts = {}) {
  const { maxIt = 50, reduction = 1e-10, lineSearchSteps = 8 } = opts;
  let x = [start.u0, start.lambda];
  let { F, H } = gradientAndJacobian(N, t, x);
  const r0 = norm2(F);
  let residual = r0;
  const iterations = [{ k: 0, u0: x[0], lambda: x[1], residual, eta: 0 }];

  for (let k = 1; k <= maxIt && residual > reduction * r0; k++) {
    let dx;
    try {
      dx = solve2x2(H, F);
    } catch {
      break;
    }
    let eta = 1;
    let accepted = false;
    for (let s = 0; s <= lineSearchSteps; s++, eta /= 2) {
      const trial = [x[0] - eta * dx[0], x[1] - eta * dx[1]];
      const next = gradientAndJacobian(N, t, trial);
      const trialResidual = norm2(next.F);
      if (Number.isFinite(trialResidual) && trialResidual < residual) {
        x = trial;
        ({ F, H } = next);
        residual = trialResidual;
        accepted = true;
        break;
      }
    }
    if (!accepted) break;
    iterations.push({ k, u0: x[0], lambda: x[1], residual, eta });
  }

  return {
    u0: x[0],
    lambda: x[1],
    iterations,
    converged: residual <= reduction * r0 || residual === 0,
  };
}

/**
 * Verdopplungszeiten (Abschnitt 1.3.4) mittels nichtlinearer Schätzung
 * über ein gleitendes Fenster der Größe w.
 *
 * @returns {[number, number][]} Paare (t_k, T₂(t_k)) für k ≥ w−1
 */
export function windowedDoublingTimes(N, t, w) {
  const result = [];
  for (let k = w - 1; k < N.length; k++) {
    const Nw = N.slice(k - w + 1, k + 1);
    const tw = t.slice(k - w + 1, k + 1);
    const fit = nonlinearFit(Nw, tw, linearFit(Nw, tw));
    result.push([t[k], Math.LN2 / fit.lambda]);
  }
  return result;
}

/**
 * Naive Verdopplungszeit T₂ = k − max{ i : N_i ≤ N_k / 2 } (nur ganze Tage).
 * @returns {[number, number][]}
 */
export function naiveDoublingTimes(N, t) {
  const result = [];
  for (let k = 0; k < N.length; k++) {
    let j = -1;
    for (let i = 0; i <= k; i++) if (N[i] <= N[k] / 2) j = i;
    if (j >= 0) result.push([t[k], t[k] - t[j]]);
  }
  return result;
}
