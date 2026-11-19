/**
 * Widget: Spektralanalyse und Tiefpassfilter (Abschnitt 20.4).
 * Ein Signal aus drei Schwingungen plus Rauschen wird zerlegt, hohe Frequenzen
 * werden abgeschnitten und das Signal rekonstruiert (Prinzip von JPEG/MP3).
 */
import { h, setChildren, slider, controls, stat, fmt } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';
import { fft, inverseDft } from '../lib/numerics/fourier.js';
import { createRng } from '../lib/numerics/special.js';

const N = 256;

export default function mount(el) {
  const state = { a1: 1, f1: 3, a2: 0.5, f2: 11, a3: 0.25, f3: 40, noise: 0.3, cutoff: 20 };
  const stats = h('div', { class: 'stats' });
  const signalPlot = h('div', { class: 'plot-container' });
  const spectrumPlot = h('div', { class: 'plot-container' });

  function update() {
    const rnd = createRng(5);
    const t = Array.from({ length: N }, (_, j) => (2 * Math.PI * j) / N);
    const clean = t.map((x) => state.a1 * Math.sin(state.f1 * x) + state.a2 * Math.sin(state.f2 * x) + state.a3 * Math.sin(state.f3 * x));
    const y = clean.map((v) => v + state.noise * rnd());
    const c = fft(y);
    // Amplitude zur Frequenz k: |c_k| + |c_{N−k}| (reelles Signal)
    const amp = Array.from({ length: N / 2 }, (_, k) => (k === 0 ? Math.hypot(c[0].re, c[0].im) : 2 * Math.hypot(c[k].re, c[k].im)));
    const filtered = c.map((ck, k) => (Math.min(k, N - k) <= state.cutoff ? ck : { re: 0, im: 0 }));
    const recon = inverseDft(filtered).map((z) => z.re);
    const kept = filtered.filter((z) => z.re !== 0 || z.im !== 0).length;

    renderPlot(signalPlot, {
      height: 260,
      x: { label: 't', min: 0, max: 2 * Math.PI },
      y: { label: 'Signal' },
      series: [
        { data: t.map((x, j) => [x, y[j]]), label: 'gemessenes Signal (mit Rauschen)', color: 6 },
        { data: t.map((x, j) => [x, recon[j]]), label: `rekonstruiert aus Frequenzen ≤ ${state.cutoff}`, color: 4 },
        { data: t.map((x, j) => [x, clean[j]]), label: 'ohne Rauschen', color: 1, dashed: true },
      ],
      ariaLabel: 'Signal und gefilterte Rekonstruktion',
    });
    renderPlot(spectrumPlot, {
      height: 220,
      x: { label: 'Frequenz k', min: 0, max: 64 },
      y: { label: 'Amplitude', min: 0 },
      series: [{ data: amp.slice(0, 65).map((v, k) => [k, v]), kind: 'stem', color: 1 }],
      bands: [{ from: state.cutoff + 0.5, to: 64, label: 'abgeschnitten' }],
      ariaLabel: 'Amplitudenspektrum',
    });
    const err = Math.sqrt(recon.reduce((s, v, j) => s + (v - clean[j]) ** 2, 0) / N);
    setChildren(stats,
      stat('behaltene Koeffizienten', `${kept} von ${N}`, `Kompression × ${fmt(N / kept, 1)}`),
      stat('Fehler zum sauberen Signal', fmt(err, 3), 'RMS'),
    );
  }

  const s = (label, key, min, max, step = 1) => slider({ label, min, max, step, value: state[key], format: (v) => (step < 1 ? v.toFixed(2) : String(v)), onInput: (v) => { state[key] = v; update(); } });
  setChildren(el,
    h('details', { class: 'widget__details' }, h('summary', {}, 'Signal zusammensetzen'),
      controls(s('Amplitude 1', 'a1', 0, 2, 0.05), s('Frequenz 1', 'f1', 1, 60), s('Amplitude 2', 'a2', 0, 2, 0.05), s('Frequenz 2', 'f2', 1, 60), s('Amplitude 3', 'a3', 0, 2, 0.05), s('Frequenz 3', 'f3', 1, 60))),
    controls(s('Rauschen', 'noise', 0, 1, 0.05), s('Grenzfrequenz (Tiefpass)', 'cutoff', 0, 64)),
    stats,
    signalPlot,
    spectrumPlot,
    h('p', { class: 'widget__hint' }, 'Im Zeitbereich ist das Signal ein Durcheinander, im Frequenzbereich sieht man sofort drei Spitzen über dem breiten Rauschteppich. Schneidet man hohe Frequenzen ab, verschwindet ein Großteil des Rauschens – und man braucht viel weniger Koeffizienten. Setzt man die Grenze unter Frequenz 3, geht aber auch Information verloren.'),
  );
  update();
}
