/**
 * Register aller aufbereiteten Vorlesungen.
 *
 * Eine neue Vorlesung hinzufügen:
 *   1. Datei js/content/vlXX.js anlegen (Aufbau siehe vl01.js)
 *   2. hier importieren und in LECTURES eintragen
 *   3. den Titel aus PLANNED_CHAPTERS entfernen
 *
 * @typedef {Object} Section
 * @property {string} id      Anker (eindeutig innerhalb der Vorlesung)
 * @property {string} title
 * @property {string} body    HTML (siehe content/blocks.js)
 *
 * @typedef {Object} Lecture
 * @property {string} id
 * @property {number} number
 * @property {string} title
 * @property {string} summary
 * @property {Section[]} sections
 */
import vl01 from './vl01.js';
import vl02 from './vl02.js';

/** @type {Lecture[]} */
export const LECTURES = [vl01, vl02];

/** Noch nicht aufbereitete Kapitel des Skripts (in Reihenfolge). */
export const PLANNED_CHAPTERS = [
  'Rechnen mit Fließkommazahlen',
  'Analyse von Netzwerken',
  'Einige Grundlagen aus der linearen Algebra',
  'Konditionsanalyse für lineare Gleichungssysteme',
  'Eliminationsverfahren',
  'LU-Zerlegung',
  'Rundungsfehleranalyse der LU-Zerlegung',
  'Spezielle Gleichungssysteme',
  'Nichtreguläre Systeme',
  'QR-Zerlegung',
  'Iterative Lösung linearer Gleichungssysteme',
  'Iterative Lösung linearer Gleichungssysteme II',
  'Lösung nichtlinearer algebraischer Gleichungen',
  'Newton-Verfahren',
  'Polynominterpolation',
  'Interpolationsfehler und numerische Differentiation',
  'Extrapolation zum Limes',
  'Trigonometrische Interpolation',
  'Interpolation mit Splines',
  'Kurvendarstellung mit Bernstein-Polynomen',
  'Approximation in Skalarprodukträumen',
  'Adaptive Approximation mit Haar-Wavelets',
  'Numerische Integration niedriger Ordnung',
  'Numerische Integration hoher Ordnung',
];

/** @returns {Lecture | undefined} */
export function findLecture(id) {
  return LECTURES.find((l) => l.id === id);
}
