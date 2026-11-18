/**
 * Formelsatz mit KaTeX (per <script> in index.html geladen).
 * Inline: $…$, abgesetzt: $$…$$.
 */
const OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
  ],
  throwOnError: false,
  macros: {
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\C': '\\mathbb{C}',
    '\\F': '\\mathbb{F}',
    '\\rd': '\\operatorname{rd}',
    '\\eps': '\\mathrm{eps}',
  },
};

/** Setzt alle Formeln innerhalb von `element`. */
export function renderMath(element) {
  if (typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(element, OPTIONS);
  }
}

/** Setzt einen einzelnen TeX-Ausdruck als HTML-String. */
export function tex(source, displayMode = false) {
  if (window.katex) {
    return window.katex.renderToString(source, { ...OPTIONS, displayMode });
  }
  return source;
}
