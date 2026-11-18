/**
 * Einbindung interaktiver Widgets in Inhaltsseiten.
 *
 * Inhalte enthalten Platzhalter der Form
 *   <div data-widget="name" data-props='{"…": …}'></div>
 * Diese werden nach dem Rendern einer Seite gesucht und mit dem passenden
 * Widget-Modul (lazy geladen) befüllt.
 */
import { WIDGETS } from '../widgets/index.js';
import { renderMath } from './math.js';

/**
 * @param {HTMLElement} root
 * @returns {Promise<void>}
 */
export async function mountWidgets(root) {
  const placeholders = [...root.querySelectorAll('[data-widget]')];
  await Promise.all(placeholders.map(async (el) => {
    const name = el.dataset.widget;
    const loader = WIDGETS[name];
    if (!loader) {
      el.textContent = `Unbekanntes Widget: ${name}`;
      return;
    }
    try {
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      const { default: mount } = await loader();
      mount(el, props);
      renderMath(el);
    } catch (error) {
      console.error(`Widget „${name}“ konnte nicht geladen werden`, error);
      el.textContent = `Widget „${name}“ konnte nicht geladen werden.`;
    }
  }));
}
