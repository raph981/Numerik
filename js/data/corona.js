/**
 * Gemeldete Coronafälle in Deutschland ab dem 24.02.2020 (Quelle laut Skript:
 * https://de.wikipedia.org/wiki/COVID-19-Pandemie_in_Deutschland).
 * Die Zeiteinheit ist ein Tag: t_i = i.
 */
export const CORONA_CASES = [
  16, 18, 21, 26, 53, 66, 117, 150, 188, 240,
  400, 639, 795, 902, 1139, 1296, 1567, 2369,
  3062, 3795, 4838, 6012, 7156, 8198, 10999, 13957,
  16662, 18610, 22672, 27436, 31554, 36508, 42288,
  48582, 52547, 57298, 61913, 67366, 73522, 79696, 85778, 91714, 95391,
  99225, 103228,
];

const START = Date.UTC(2020, 1, 24);
const DAY = 24 * 60 * 60 * 1000;

/** Zeitpunkte t_i = i in Tagen. */
export const CORONA_DAYS = CORONA_CASES.map((_, i) => i);

/** Datum (TT.MM.) zum Tag t. */
export function dayLabel(t) {
  const d = new Date(START + Math.round(t) * DAY);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.`;
}

/** Tag, an dem Eindämmungsmaßnahmen beschlossen wurden (22.03.2020). */
export const MEASURES_DAY = 27;
