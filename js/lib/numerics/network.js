/**
 * Knotenpotentialverfahren für Rohrleitungsnetze (Vorlesung 4).
 *
 * Knoten werden mit 0 … n−1 indiziert; der letzte Knoten ist der Referenzknoten
 * mit Potential 0. Kanten sind gerichtet: { from, to, type: 'pipe'|'pump', value }
 * mit value = Leitfähigkeit L_e (Rohr) bzw. vorgegebener Pumpenstrom q_e (Pumpe).
 */
import { matMul, matVec, solve, transpose } from './linalg.js';

/** Leitfähigkeit nach Hagen-Poiseuille L = π r⁴ / (8 η l), Gleichung (4.1). */
export function conductance(radius, length, viscosity = 1e-3) {
  return (Math.PI * radius ** 4) / (8 * viscosity * length);
}

/**
 * Stellt die Matrizen des Knotenpotentialverfahrens auf.
 * @returns {{B:number[][], L:number[][], A:number[][], b:number[], pipes:object[], pumps:object[]}}
 */
export function assembleNetwork(nodeCount, edges) {
  const unknowns = nodeCount - 1; // Referenzknoten = letzter Knoten
  const pipes = edges.filter((e) => e.type === 'pipe');
  const pumps = edges.filter((e) => e.type === 'pump');

  // (4.8): Zeile je Rohr, +1 am Startknoten, −1 am Endknoten
  const B = pipes.map((e) => {
    const row = new Array(unknowns).fill(0);
    if (e.from < unknowns) row[e.from] = 1;
    if (e.to < unknowns) row[e.to] = -1;
    return row;
  });
  const L = pipes.map((e, i) => pipes.map((_, j) => (i === j ? e.value : 0)));

  // (4.11): b_v = Σ eingehende Pumpenströme − Σ ausgehende Pumpenströme
  const b = new Array(unknowns).fill(0);
  for (const e of pumps) {
    if (e.to < unknowns) b[e.to] += e.value;
    if (e.from < unknowns) b[e.from] -= e.value;
  }

  const A = matMul(matMul(transpose(B), L), B);
  return { B, L, A, b, pipes, pumps };
}

/**
 * Löst das Netzwerk: A p = b, dann Δp = B p und q = L Δp.
 * @returns {{potentials:number[], pipeFlows:number[], system:ReturnType<typeof assembleNetwork>}}
 *          potentials enthält alle n Knoten (Referenzknoten = 0)
 */
export function solveNetwork(nodeCount, edges) {
  const system = assembleNetwork(nodeCount, edges);
  const p = solve(system.A, system.b);
  const dp = matVec(system.B, p);
  const pipeFlows = dp.map((v, i) => system.L[i][i] * v);
  return { potentials: [...p, 0], pipeFlows, system };
}

/**
 * Bilanz der Knotenregel (4.2) je Knoten: Σ ausgehend − Σ eingehend (inkl. Pumpen).
 * Sollte für alle Knoten (bis auf Rundung) 0 sein.
 */
export function nodeBalance(nodeCount, edges, flows) {
  const balance = new Array(nodeCount).fill(0);
  edges.forEach((e, i) => {
    balance[e.from] += flows[i];
    balance[e.to] -= flows[i];
  });
  return balance;
}

/** Beispielnetzwerk aus dem Skript: Knoten v1…v5, Rohre e1…e6, Pumpen e7, e8. */
export const EXAMPLE_NETWORK = {
  nodes: [
    { name: 'v₁', x: 275, y: 822 },
    { name: 'v₂', x: 235, y: 765 },
    { name: 'v₃', x: 315, y: 628 },
    { name: 'v₄', x: 395, y: 785 },
    { name: 'v₅', x: 470, y: 745 },
  ],
  edges: [
    { name: 'e₁', from: 0, to: 1, type: 'pipe', value: 1 },
    { name: 'e₂', from: 1, to: 2, type: 'pipe', value: 1 },
    { name: 'e₃', from: 4, to: 2, type: 'pipe', value: 1 },
    { name: 'e₄', from: 1, to: 4, type: 'pipe', value: 1 },
    { name: 'e₅', from: 0, to: 3, type: 'pipe', value: 1 },
    { name: 'e₆', from: 2, to: 3, type: 'pipe', value: 1 },
    { name: 'e₇', from: 4, to: 3, type: 'pump', value: 1 },
    { name: 'e₈', from: 2, to: 0, type: 'pump', value: 0 },
  ],
};
