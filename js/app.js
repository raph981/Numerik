/**
 * Einstiegspunkt: Navigation, Routing und Seitenaufbau.
 *
 * Routen (Hash-basiert, funktioniert auf jedem statischen Hoster):
 *   #/              Startseite
 *   #/vl1           Vorlesung 1
 *   #/vl1/abschnitt Vorlesung 1, zu Abschnitt scrollen
 */
import { LECTURES, PLANNED_CHAPTERS, findLecture } from './content/index.js';
import { renderMath } from './core/math.js';
import { mountWidgets } from './core/widgets.js';

const main = document.getElementById('content');
const nav = document.getElementById('nav');
let currentLectureId = null;

/** Zerlegt den Hash in Vorlesungs- und Abschnitts-ID. */
function parseRoute(hash) {
  const [, lectureId = '', sectionId = ''] = hash.replace(/^#/, '').split('/');
  return { lectureId, sectionId };
}

function lectureHref(lecture, section) {
  return `#/${lecture.id}${section ? `/${section.id}` : ''}`;
}

function renderNav() {
  nav.innerHTML = `
    <a class="nav__home" href="#/">Übersicht</a>
    ${LECTURES.map((lecture) => `
      <div class="nav__group" data-lecture="${lecture.id}">
        <a class="nav__lecture" href="${lectureHref(lecture)}">
          <span class="nav__number">VL ${lecture.number}</span> ${lecture.title}
        </a>
        <ol class="nav__sections">
          ${lecture.sections.map((s) => `<li><a href="${lectureHref(lecture, s)}" data-section="${s.id}">${s.title}</a></li>`).join('')}
        </ol>
      </div>`).join('')}`;
}

function renderHome() {
  main.innerHTML = `
    <header class="page-header">
      <p class="eyebrow">Interaktives Begleitmaterial</p>
      <h1>Einführung in die Numerik</h1>
      <p class="lead">Die Inhalte des Vorlesungsskripts – Schritt für Schritt erklärt, mit Visualisierungen
      und Experimenten zum Ausprobieren. Jede Formel lässt sich im Browser nachrechnen.</p>
    </header>
    <section class="card-grid">
      ${LECTURES.map((l) => `
        <a class="lecture-card" href="${lectureHref(l)}">
          <span class="lecture-card__number">Vorlesung ${l.number}</span>
          <span class="lecture-card__title">${l.title}</span>
          <span class="lecture-card__summary">${l.summary}</span>
        </a>`).join('')}
    </section>
    <section class="planned">
      <h2>Weitere Kapitel des Skripts</h2>
      <p>Folgende Vorlesungen sind noch nicht aufbereitet:</p>
      <ol start="${LECTURES.length + 1}" class="planned__list">
        ${PLANNED_CHAPTERS.map((t) => `<li>${t}</li>`).join('')}
      </ol>
    </section>`;
  renderMath(main);
}

function renderLecture(lecture) {
  const index = LECTURES.indexOf(lecture);
  const prev = LECTURES[index - 1];
  const next = LECTURES[index + 1];
  main.innerHTML = `
    <header class="page-header">
      <p class="eyebrow">Vorlesung ${lecture.number}</p>
      <h1>${lecture.title}</h1>
      <p class="lead">${lecture.summary}</p>
      <nav class="toc" aria-label="Inhalt dieser Vorlesung">
        <ol>${lecture.sections.map((s) => `<li><a href="${lectureHref(lecture, s)}">${s.title}</a></li>`).join('')}</ol>
      </nav>
    </header>
    ${lecture.sections.map((s) => `
      <section class="lecture-section" id="${s.id}" aria-labelledby="${s.id}-title">
        <h2 id="${s.id}-title">${s.title}</h2>
        ${s.body}
      </section>`).join('')}
    <nav class="pager" aria-label="Vorlesungen">
      ${prev ? `<a class="pager__prev" href="${lectureHref(prev)}">← VL ${prev.number}: ${prev.title}</a>` : '<span></span>'}
      ${next ? `<a class="pager__next" href="${lectureHref(next)}">VL ${next.number}: ${next.title} →</a>` : ''}
    </nav>`;
  renderMath(main);
  return mountWidgets(main);
}

function highlightNav(lectureId, sectionId) {
  nav.querySelectorAll('.nav__group').forEach((g) => g.classList.toggle('is-active', g.dataset.lecture === lectureId));
  nav.querySelectorAll('[data-section]').forEach((a) => {
    const active = a.closest('.nav__group').dataset.lecture === lectureId && a.dataset.section === sectionId;
    a.toggleAttribute('aria-current', active);
  });
}

async function route() {
  const { lectureId, sectionId } = parseRoute(location.hash);
  const lecture = findLecture(lectureId);
  document.body.classList.remove('nav-open');

  if (!lecture) {
    currentLectureId = null;
    document.title = 'Einführung in die Numerik';
    renderHome();
    highlightNav(null, null);
    window.scrollTo(0, 0);
    return;
  }

  if (lecture.id !== currentLectureId) {
    currentLectureId = lecture.id;
    document.title = `VL ${lecture.number}: ${lecture.title} · Numerik`;
    await renderLecture(lecture);
  }
  highlightNav(lecture.id, sectionId);
  const target = sectionId && document.getElementById(sectionId);
  if (target) target.scrollIntoView();
  else window.scrollTo(0, 0);
}

function setupMenuToggle() {
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

renderNav();
setupMenuToggle();
window.addEventListener('hashchange', route);
route();
