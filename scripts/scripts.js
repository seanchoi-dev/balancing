import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
} from './aem.js';

import { createTag } from './utils.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  // buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

const fragmentModalLoad = async (a) => {
  let url;
  try {
    url = new URL(a.href);
  } catch (e) {
    console.error(e.toString());
    return false;
  }
  const modalClass = a.dataset.modalClass ?? '';
  a.dataset.modalPath = url.pathname;
  a.dataset.modalHash = url.hash;
  a.href = url.hash;
  a.dataset.bsTarget = url.hash;
  a.dataset.bsToggle = "modal";
  a.className = `modal link-block ${[...a.classList].join(' ')}`;
  const doc = await fetch(a.dataset.modalPath);
  if (!doc || !doc.ok) return;
  const modal = createTag('div', { class: 'modal fade', id: a.hash.substring(1) });
  const modalDialog = createTag('div', { class: `modal-dialog modal-dialog-centered ${modalClass}` });
  const modalContent = createTag('div', { class: 'modal-content' });
  const modalBody = createTag('div', { class: 'modal-body' });
  let fragmentMain = document.createElement('html');
  fragmentMain.innerHTML = await doc.text();
  fragmentMain = fragmentMain.querySelector('main');
  if(!fragmentMain) return;
  const { decorateMain } = await import('./scripts.js');
  const { loadSections } = await import('./aem.js');
  decorateMain(fragmentMain);
  loadSections(fragmentMain);
  Array.from(fragmentMain.childNodes).forEach(n => modalBody.append(n));
  modalContent.append(modalBody);
  modalDialog.append(modalContent);
  modal.append(modalDialog);
  document.querySelector('body').append(modal);
};

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);
  main.querySelectorAll('a[href*="fragments/"]').forEach(a => fragmentModalLoad(a));

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // loadHeader(doc.querySelector('header'));
  // loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();