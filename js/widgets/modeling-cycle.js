/**
 * Widget: Kreislauf des Wissenschaftlichen Rechnens (Abschnitt 1.2).
 * Klick auf eine Station zeigt deren Erklärung und die dort entstehenden Fehler.
 */
import { h, setChildren } from '../core/dom.js';

const STAGES = [
  {
    id: 'reality', title: 'Realität',
    text: 'Ausgangspunkt ist eine Beobachtung, gegeben durch Messungen – z. B. steigende Fallzahlen oder die Temperatur der Atmosphäre.',
    error: null,
  },
  {
    id: 'conceptual', title: 'Konzeptionelles Modell',
    text: 'Welche Prozesse sind relevant (Transport, Wellenausbreitung, Reaktion, Phasenübergänge …), welche Annahmen treffen wir? Diese Wahl ist nicht eindeutig.',
    error: 'Modellfehler: ein relevanter Prozess fehlt oder ist ungenau (z. B. Luftwiderstand vernachlässigt).',
  },
  {
    id: 'mathematical', title: 'Mathematisches Modell',
    text: 'Gleichungen: algebraische Gleichungen, Differentialgleichungen, Wahrscheinlichkeiten. Objekte sind reelle Zahlen, Funktionen, …',
    error: 'Datenfehler: Anfangs-/Randbedingungen und Parameter stammen aus fehlerbehafteten Messungen.',
  },
  {
    id: 'numerical', title: 'Numerisches Modell',
    text: 'Näherungsverfahren zur Lösung der Gleichungen – das ist das Kerngebiet der Numerik.',
    error: 'Abschneidefehler: Abbruch von Reihen/Iterationen, diskrete statt kontinuierliche Zeit.',
  },
  {
    id: 'program', title: 'Computerprogramm',
    text: 'Komplexe Software, Effizienz, High Performance Computing, Visualisierung – hier ist die Informatik gefragt.',
    error: 'Rundungsfehler: reelle Zahlen werden im Rechner nur genähert dargestellt.',
  },
  {
    id: 'simulation', title: 'Simulation',
    text: 'Liefert Zahlenwerte, die mit den Messungen verglichen werden. Fast nie exakte Übereinstimmung – welche Abweichung ist akzeptabel, woher kommt sie, wie reduziert man sie?',
    error: null,
  },
];

export default function mount(el) {
  const detail = h('div', { class: 'cycle__detail', 'aria-live': 'polite' });
  const buttons = STAGES.map((stage, i) => h('button', {
    type: 'button',
    class: `cycle__stage cycle__stage--${stage.id}`,
    onclick: () => select(i),
  }, h('span', { class: 'cycle__index' }, String(i + 1)), stage.title));

  function select(i) {
    const stage = STAGES[i];
    buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    setChildren(detail,
      h('h4', {}, stage.title),
      h('p', {}, stage.text),
      stage.error ? h('p', { class: 'cycle__error' }, h('strong', {}, 'Fehlerquelle → '), stage.error) : null,
    );
  }

  setChildren(el,
    h('div', { class: 'cycle' },
      h('div', { class: 'cycle__track' }, buttons.flatMap((b, i) => (i ? [h('span', { class: 'cycle__arrow', 'aria-hidden': 'true' }, '→'), b] : [b]))),
      h('p', { class: 'cycle__loop' }, '↺ Vergleich Simulation ↔ Realität: Stimmen sie überein? Wenn nicht, beginnt der Kreislauf von vorn.'),
      detail,
    ),
  );
  select(0);
}
