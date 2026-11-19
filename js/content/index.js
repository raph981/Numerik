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
import vl03 from './vl03.js';
import vl04 from './vl04.js';
import vl05 from './vl05.js';
import vl06 from './vl06.js';
import vl07 from './vl07.js';
import vl08 from './vl08.js';
import vl09 from './vl09.js';
import vl10 from './vl10.js';
import vl11 from './vl11.js';
import vl12 from './vl12.js';
import vl13 from './vl13.js';
import vl14 from './vl14.js';
import vl15 from './vl15.js';
import vl16 from './vl16.js';
import vl17 from './vl17.js';
import vl18 from './vl18.js';

/** @type {Lecture[]} */
export const LECTURES = [
  vl01, vl02, vl03, vl04, vl05, vl06, vl07,
  vl08, vl09, vl10, vl11, vl12, vl13, vl14,
  vl15, vl16, vl17, vl18,
];

/** Noch nicht aufbereitete Kapitel des Skripts (in Reihenfolge). */
export const PLANNED_CHAPTERS = [
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
