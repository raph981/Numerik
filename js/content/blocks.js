/**
 * Bausteine zum Verfassen von Vorlesungsinhalten.
 *
 * Alle Funktionen liefern HTML-Strings. Formeln werden in $…$ bzw. $$…$$
 * geschrieben und beim Rendern von KaTeX gesetzt. Für Texte mit vielen
 * Backslashes empfiehlt sich `String.raw` (exportiert als `tx`).
 */

/** Template-Tag, der Backslashes unverändert lässt (für TeX). */
export const tx = String.raw;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeHtml(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

const BOX_KINDS = {
  definition: 'Definition',
  satz: 'Satz',
  lemma: 'Lemma',
  beispiel: 'Beispiel',
  beobachtung: 'Beobachtung',
  merke: 'Merke',
  algorithmus: 'Algorithmus',
  intuition: 'Anschaulich',
};

/**
 * Hervorgehobener Kasten (Definition, Satz, Beispiel, …).
 * @param {keyof BOX_KINDS} kind
 * @param {string} title  z. B. "2.2 (Normierte Fließkommadarstellung)"; darf leer sein
 * @param {string} body
 */
export function box(kind, title, body) {
  const heading = [BOX_KINDS[kind], title].filter(Boolean).join(' ');
  return `<aside class="box box--${kind}">
    <div class="box__title">${heading}</div>
    <div class="box__body">${body}</div>
  </aside>`;
}

/** Aufklappbarer Beweis. */
export function proof(body, summary = 'Beweis') {
  return `<details class="proof"><summary>${summary}</summary><div class="proof__body">${body}<span class="qed" aria-hidden="true">□</span></div></details>`;
}

/** Frage aus dem Skript (Randbemerkung) mit aufklappbarer Lösung. */
export function exercise(question, solution) {
  return `<aside class="exercise">
    <div class="exercise__title">Denkanstoß aus dem Skript</div>
    <p class="exercise__question">${question}</p>
    <details><summary>Lösungsidee anzeigen</summary><div class="exercise__solution">${solution}</div></details>
  </aside>`;
}

/**
 * Platzhalter für ein interaktives Widget.
 * @param {string} name   Schlüssel aus js/widgets/index.js
 * @param {object} [props]
 * @param {string} [caption]
 */
export function widget(name, props = {}, caption = '') {
  return `<figure class="widget-figure">
    <div class="widget" data-widget="${name}" data-props='${escapeAttr(JSON.stringify(props))}'>
      <p class="widget__loading">Interaktive Darstellung wird geladen …</p>
    </div>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
  </figure>`;
}

/** Quelltext (wird HTML-escaped). */
export function code(source, language = 'cpp') {
  return `<pre class="code"><code class="language-${language}">${escapeHtml(source.trim())}</code></pre>`;
}

/** Nummerierte bzw. einfache Liste aus Einträgen. */
export function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((i) => `<li>${i}</li>`).join('')}</${tag}>`;
}

/** Kurzer „Worum geht's?“-Einstieg für einen Abschnitt. */
export function lead(text) {
  return `<p class="lead">${text}</p>`;
}
