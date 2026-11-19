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
  // Vorlesung 8
  'lu-decomposition': () => import('./lu-decomposition.js'),
  'integral-equation': () => import('./integral-equation.js'),
  // Vorlesung 9
  'pivoting-example': () => import('./pivoting-example.js'),
  'dot-product-error': () => import('./dot-product-error.js'),
  'growth-factor': () => import('./growth-factor.js'),
  // Vorlesung 10
  'cholesky': () => import('./cholesky.js'),
  'sparsity-fill': () => import('./sparsity-fill.js'),
  // Vorlesung 11
  'least-squares-fit': () => import('./least-squares-fit.js'),
  'gram-schmidt-geometry': () => import('./gram-schmidt-geometry.js'),
  'gram-schmidt-stability': () => import('./gram-schmidt-stability.js'),
  // Vorlesung 12
  'householder': () => import('./householder.js'),
  'householder-qr': () => import('./householder-qr.js'),
  // Vorlesungen 13 und 14
  'iteration-2d': () => import('./iteration-2d.js'),
  'convergence-rate': () => import('./convergence-rate.js'),
  'gerschgorin': () => import('./gerschgorin.js'),
  // Vorlesung 15
  'fixed-point-1d': () => import('./fixed-point-1d.js'),
  'nonlinear-2d': () => import('./nonlinear-2d.js'),
  // Vorlesung 16
  'newton-1d': () => import('./newton-1d.js'),
  'newton-basins': () => import('./newton-basins.js'),
  // Vorlesung 17
  'lagrange-basis': () => import('./lagrange-basis.js'),
  'newton-interpolation': () => import('./newton-interpolation.js'),
  // Vorlesung 18
  'interpolation-error': () => import('./interpolation-error.js'),
  'numerical-diff': () => import('./numerical-diff.js'),
};
