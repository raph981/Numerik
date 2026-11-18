/**
 * Widget: Exakt gerundete Fließkommaarithmetik in F(10, r) und die
 * Verletzung des Assoziativgesetzes (Abschnitt 3.1).
 */
import { h, setChildren, slider, segmented, textField, controls, stat, fmt, fmtExp, table } from '../core/dom.js';
import { OPERATIONS, floatOp, roundSig } from '../lib/numerics/arithmetic.js';

const BETA = 10;
const ASSOC_EXAMPLES = [
  { label: '(1000 ⊕ 0,1) ⊖ 1000', a: '1000', b: '0.1', c: '-1000' },
  { label: '1 ⊕ 0,0004 ⊕ 0,0004', a: '1', b: '0.0004', c: '0.0004' },
  { label: '0,1 ⊕ 0,2 ⊕ 0,3', a: '0.1', b: '0.2', c: '0.3' },
];

const parse = (s) => Number(String(s).replace(',', '.').replace('−', '-'));
const show = (v) => fmt(v, 10);

export default function mount(el) {
  const state = { x: '2.3456', y: '0.0012345', op: '+', r: 4, a: '1000', b: '0.1', c: '-1000' };
  const single = h('div');
  const assoc = h('div');
  const fieldA = textField({ label: 'a', value: state.a, onInput: (v) => { state.a = v; updateAssoc(); } });
  const fieldB = textField({ label: 'b', value: state.b, onInput: (v) => { state.b = v; updateAssoc(); } });
  const fieldC = textField({ label: 'c', value: state.c, onInput: (v) => { state.c = v; updateAssoc(); } });

  function updateSingle() {
    const x = parse(state.x);
    const y = parse(state.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const xr = roundSig(x, BETA, state.r);
    const yr = roundSig(y, BETA, state.r);
    const exact = OPERATIONS[state.op].apply(xr, yr);
    const result = floatOp(state.op, x, y, BETA, state.r);
    const rel = exact === 0 ? 0 : Math.abs((result - exact) / exact);
    const eps = 0.5 * BETA ** (1 - state.r);
    setChildren(single,
      h('div', { class: 'stats' },
        stat('Maschinenzahlen', `x = ${show(xr)}, y = ${show(yr)}`),
        stat(`exakt x ${state.op} y`, show(exact), 'braucht evtl. mehr Stellen'),
        stat(`x ${OPERATIONS[state.op].symbol} y = rd(x ${state.op} y)`, show(result)),
        stat('relativer Fehler', fmtExp(rel, 2), `≤ eps = ${fmtExp(eps, 1)} ✓`),
      ),
      xr !== 0 && result === xr && yr !== 0 && (state.op === '+' || state.op === '−')
        ? h('p', { class: 'widget__hint' }, `Hier gilt x ${OPERATIONS[state.op].symbol} y = x, obwohl y ≠ 0 – y ist „zu klein“ für die ${state.r} Mantissenstellen von x.`)
        : null,
    );
  }

  function updateAssoc() {
    const [a, b, c] = [state.a, state.b, state.c].map(parse);
    if (![a, b, c].every(Number.isFinite)) return;
    const r = state.r;
    const ab = floatOp('+', a, b, BETA, r);
    const left = floatOp('+', ab, c, BETA, r);
    const bc = floatOp('+', b, c, BETA, r);
    const right = floatOp('+', a, bc, BETA, r);
    const exact = roundSig(a, BETA, r) + roundSig(b, BETA, r) + roundSig(c, BETA, r);
    setChildren(assoc, table(['Rechenweg', 'Zwischenergebnis', 'Ergebnis'], [
      ['(a ⊕ b) ⊕ c', `a ⊕ b = ${show(ab)}`, h('strong', {}, show(left))],
      ['a ⊕ (b ⊕ c)', `b ⊕ c = ${show(bc)}`, h('strong', {}, show(right))],
      ['exakt a + b + c', '—', show(exact)],
    ]), h('p', { class: left === right ? 'widget__hint' : 'cycle__error' },
      left === right ? 'Hier stimmen beide Reihenfolgen überein – probieren Sie die Beispiele.' : 'Die Reihenfolge der Operationen ändert das Ergebnis: Das Assoziativgesetz gilt nicht!'));
  }

  function updateAll() { updateSingle(); updateAssoc(); }

  setChildren(el,
    controls(slider({ label: 'Mantissenstellen r =', min: 2, max: 8, step: 1, value: state.r, onInput: (v) => { state.r = v; updateAll(); } })),
    h('h4', {}, 'Eine Operation: x ⊛ y = rd(x ∗ y)'),
    controls(
      textField({ label: 'x', value: state.x, onInput: (v) => { state.x = v; updateSingle(); } }),
      segmented({ label: 'Operation', value: state.op, options: Object.keys(OPERATIONS).map((k) => ({ value: k, label: k })), onChange: (v) => { state.op = v; updateSingle(); } }),
      textField({ label: 'y', value: state.y, onInput: (v) => { state.y = v; updateSingle(); } }),
    ),
    single,
    h('h4', {}, 'Rechengesetze: Assoziativität'),
    h('div', { class: 'example-buttons' }, h('span', {}, 'Beispiele:'), ASSOC_EXAMPLES.map((ex) => h('button', {
      type: 'button', class: 'chip',
      onclick: () => {
        Object.assign(state, { a: ex.a, b: ex.b, c: ex.c });
        fieldA.input.value = ex.a; fieldB.input.value = ex.b; fieldC.input.value = ex.c;
        updateAssoc();
      },
    }, ex.label))),
    controls(fieldA, fieldB, fieldC),
    assoc,
  );
  updateAll();
}
