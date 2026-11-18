/**
 * Kleine DOM-Hilfsfunktionen und wiederverwendbare Bedienelemente für Widgets.
 */

/**
 * Erzeugt ein Element.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]  Attribute; `on*`-Funktionen werden als Listener registriert,
 *                                        `class` / `text` / `html` werden gesondert behandelt
 * @param {...(Node|string|null|undefined|false)} children
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** Ersetzt die Kinder eines Elements; null/undefined/false werden ignoriert. */
export function setChildren(el, ...children) {
  el.replaceChildren(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
}

let idCounter = 0;
const uid = (prefix) => `${prefix}-${++idCounter}`;

/**
 * Schieberegler mit Beschriftung und Wertanzeige.
 * @returns {{element: HTMLElement, get value(): number, set value(v: number)}}
 */
export function slider({ label, min, max, step = 1, value, format = String, onInput }) {
  const id = uid('slider');
  const output = h('output', { for: id, class: 'control__value' }, format(value));
  const input = h('input', { id, type: 'range', min, max, step, value });
  input.addEventListener('input', () => {
    output.textContent = format(Number(input.value));
    onInput?.(Number(input.value));
  });
  const element = h('div', { class: 'control' },
    h('label', { for: id, class: 'control__label' }, label, ' ', output),
    input,
  );
  return {
    element,
    get value() { return Number(input.value); },
    set value(v) { input.value = v; output.textContent = format(Number(v)); },
  };
}

/**
 * Segmentierte Auswahl (Radio-Buttons als Schaltflächen).
 * @param {{label?: string, options: {value: string, label: string}[], value: string, onChange?: (v: string) => void}} config
 */
export function segmented({ label, options, value, onChange }) {
  let current = value;
  const buttons = options.map((opt) => h('button', {
    type: 'button',
    class: 'segmented__option',
    'aria-pressed': String(opt.value === current),
    onclick: () => select(opt.value),
  }, opt.label));

  function select(v) {
    current = v;
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i].value === v)));
    onChange?.(v);
  }

  const group = h('div', { class: 'segmented', role: 'group', 'aria-label': label }, buttons);
  const element = label ? h('div', { class: 'control' }, h('span', { class: 'control__label' }, label), group) : group;
  return { element, get value() { return current; }, select };
}

/** Textfeld mit Beschriftung. */
export function textField({ label, value, onInput, placeholder, inputmode = 'decimal' }) {
  const id = uid('field');
  const input = h('input', { id, type: 'text', value, placeholder, inputmode, class: 'text-input', spellcheck: 'false' });
  input.addEventListener('input', () => onInput?.(input.value));
  const element = h('div', { class: 'control' }, h('label', { for: id, class: 'control__label' }, label), input);
  return { element, input, get value() { return input.value; } };
}

/** Container für eine Zeile von Bedienelementen. */
export function controls(...items) {
  return h('div', { class: 'controls' }, items.map((i) => i.element ?? i));
}

/** Kurze Ergebnis-Kennzahl („Stat-Kachel“). */
export function stat(label, value, hint) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__label' }, label),
    h('div', { class: 'stat__value' }, value),
    hint ? h('div', { class: 'stat__hint' }, hint) : null,
  );
}

/** Tabelle aus Kopfzeile und Zeilen (Zellen dürfen Nodes oder Strings sein). */
export function table(head, rows, { className = 'data-table' } = {}) {
  return h('div', { class: 'table-scroll' },
    h('table', { class: className },
      h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', {}, rows.map((r) => h('tr', { class: r.className }, (r.cells ?? r).map((c) => h('td', {}, c))))),
    ),
  );
}

/* ---------- Zahlenformatierung ---------- */

/** Wissenschaftliche Notation mit `digits` Nachkommastellen. */
export function fmtExp(x, digits = 6) {
  if (!Number.isFinite(x)) return String(x);
  return x.toExponential(digits).replace('e+', 'e').replace(/-/g, '−');
}

/** Formatiert eine Zahl kompakt mit deutschem Dezimaltrenner. */
export function fmt(x, digits = 4) {
  if (!Number.isFinite(x)) return String(x);
  const abs = Math.abs(x);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e7)) return fmtExp(x, digits - 1);
  return x.toLocaleString('de-DE', { maximumFractionDigits: digits });
}

/* ---------- Matrizen ---------- */

/**
 * Darstellung einer Matrix.
 * @param {number[][]} M
 * @param {{format?: (v:number)=>string, cellClass?: (i:number, j:number)=>string, rhs?: boolean}} [options]
 *        rhs: letzte Spalte als rechte Seite abtrennen
 */
export function matrixView(M, { format = (v) => fmt(v, 3), cellClass = () => '', rhs = false } = {}) {
  const cols = M[0].length;
  return h('div', { class: 'matrix', style: `grid-template-columns: repeat(${cols}, auto)` },
    M.flatMap((row, i) => row.map((v, j) => h('span', {
      class: `matrix__cell ${rhs && j === cols - 1 ? 'matrix__cell--rhs ' : ''}${cellClass(i, j)}`,
    }, format(v)))));
}

/**
 * Eingabefelder für eine Matrix; ruft onChange(M) bei jeder gültigen Änderung auf.
 * @returns {{element: HTMLElement, set: (M:number[][]) => void}}
 */
export function matrixInput(M, onChange) {
  let current = M.map((row) => [...row]);
  const inputs = current.map((row, i) => row.map((v, j) => {
    const input = h('input', { type: 'text', inputmode: 'decimal', value: String(v), 'aria-label': `Eintrag (${i + 1}, ${j + 1})` });
    input.addEventListener('input', () => {
      const parsed = Number(input.value.replace(',', '.').replace('−', '-'));
      if (input.value.trim() === '' || !Number.isFinite(parsed)) return;
      current[i][j] = parsed;
      onChange(current.map((r) => [...r]));
    });
    return input;
  }));
  const element = h('div', { class: 'matrix-input', style: `grid-template-columns: repeat(${M[0].length}, auto)` }, inputs.flat());
  return {
    element,
    set(next) {
      current = next.map((row) => [...row]);
      current.forEach((row, i) => row.forEach((v, j) => { inputs[i][j].value = String(v); }));
    },
  };
}

/** Schaltfläche. */
export function button(label, onClick, { secondary = false } = {}) {
  return h('button', { type: 'button', class: `button${secondary ? ' button--secondary' : ''}`, onclick: onClick }, label);
}
