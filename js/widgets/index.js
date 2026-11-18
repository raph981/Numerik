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
  // Vorlesung 3
  'float-arithmetic': () => import('./float-arithmetic.js'),
  'summation-order': () => import('./summation-order.js'),
  'taylor': () => import('./taylor.js'),
  'condition-map': () => import('./condition-map.js'),
  'squares-difference': () => import('./squares-difference.js'),
  'quadratic': () => import('./quadratic.js'),
  'cancellation': () => import('./cancellation.js'),
  // Vorlesung 4
  'pipe-network': () => import('./pipe-network.js'),
  // Vorlesung 5
  'unit-balls': () => import('./unit-balls.js'),
  'matrix-norm': () => import('./matrix-norm.js'),
  'quadratic-form': () => import('./quadratic-form.js'),
  // Vorlesung 6
  'condition-2x2': () => import('./condition-2x2.js'),
  // Vorlesung 7
  'gauss-stepper': () => import('./gauss-stepper.js'),
  'complexity': () => import('./complexity.js'),
};
