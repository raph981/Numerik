/**
 * Widget: Komplexe Einheitswurzeln w_k = e^{2πik/N} (Lemma 20.1).
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { createPlane, unitCircle } from '../core/plane.js';
import { rootsOfUnity } from '../lib/numerics/fourier.js';

export default function mount(el) {
  const state = { N: 8, k: 1 };
  const holder = h('div');
  const stats = h('div', { class: 'stats' });
  const kHolder = h('div');

  function update() {
    const w = rootsOfUnity(state.N);
    state.k = Math.min(state.k, state.N - 1);
    setChildren(kHolder, slider({ label: 'Potenzen von w_k, k =', min: 0, max: state.N - 1, step: 1, value: state.k, onInput: (v) => { state.k = v; update(); } }).element);
    const plane = createPlane({ range: 1.4, ariaLabel: 'Einheitswurzeln auf dem Einheitskreis' }).grid(0.5);
    plane.path(unitCircle(), 'series-6', { closed: true, dashed: true });
    // Potenzen w_k^j, j = 0 … N−1 als Polygonzug: Summe aller Potenzen = 0
    const powers = Array.from({ length: state.N + 1 }, (_, j) => w[(state.k * j) % state.N]);
    plane.path(powers.map((z) => [z.re, z.im]), 'series-4');
    w.forEach((z, j) => {
      plane.dot([z.re, z.im], j === state.k ? 'series-5' : 'series-1', j === state.k ? 6 : 4);
      plane.text([z.re, z.im], `w${String(j).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d])}`, 'series-1', z.re >= 0 ? 6 : -26, z.im >= 0 ? -6 : 16);
    });
    setChildren(holder, plane.svg);
    const sum = powers.slice(0, -1).reduce((s, z) => ({ re: s.re + z.re, im: s.im + z.im }), { re: 0, im: 0 });
    setChildren(stats,
      stat(`w${state.k}^N`, '1', 'a) jede Einheitswurzel löst wᴺ = 1'),
      stat(`Σⱼ w${state.k}^j`, `${fmt(Math.abs(sum.re) < 1e-12 ? 0 : sum.re, 3)} + ${fmt(Math.abs(sum.im) < 1e-12 ? 0 : sum.im, 3)}i`, state.k === 0 ? 'e) = N für k ≡ 0' : 'e) = 0 für k ≢ 0 (mod N)'),
      stat('wₖʲ = e^{2πijk/N}', `${state.k} Schritt${state.k === 1 ? '' : 'e'} pro Potenz`, 'b) wₖʲ = wⱼᵏ'),
    );
  }

  setChildren(el,
    controls(
      slider({ label: 'N =', min: 2, max: 16, step: 1, value: state.N, onInput: (v) => { state.N = v; update(); } }),
      kHolder,
    ),
    h('div', { class: 'widget-columns' }, holder, h('div', {}, stats,
      h('p', { class: 'widget__hint' }, 'Die N Einheitswurzeln teilen den Einheitskreis in gleiche Stücke. Die Potenzen wₖ⁰, wₖ¹, … springen jeweils k Stücke weiter (orange Linie). Für k ≠ 0 heben sie sich zu null auf – genau diese Eigenschaft macht die DFT explizit lösbar.'))),
  );
  update();
}
