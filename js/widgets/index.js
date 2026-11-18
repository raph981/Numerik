/**
 * Register aller Widgets. Jedes Modul exportiert als `default` eine Funktion
 *   mount(element: HTMLElement, props: object): void
 * Die Module werden erst geladen, wenn sie auf einer Seite benötigt werden.
 */
export const WIDGETS = {
  // Vorlesung 1
  'heron': () => import('./heron.js'),
  'modeling-cycle': () => import('./modeling-cycle.js'),
  'growth-model': () => import('./growth-model.js'),
  'corona-data': () => import('./corona-data.js'),
  'parameter-fit': () => import('./parameter-fit.js'),
  'doubling-time': () => import('./doubling-time.js'),
  // Vorlesung 2
  'exp-series': () => import('./exp-series.js'),
  'positional': () => import('./positional.js'),
  'float-system': () => import('./float-system.js'),
  'relative-spacing': () => import('./relative-spacing.js'),
  'ieee754': () => import('./ieee754.js'),
  'rounding': () => import('./rounding.js'),
  'rounding-error': () => import('./rounding-error.js'),
};
