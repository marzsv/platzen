const HIDE_KEY = "hideComments";
const BTN_KEY = "showFloatingButton";

const SVG_VISIBLE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="15" y1="4" x2="15" y2="20"/></svg>`;
const SVG_HIDDEN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="15" y1="4" x2="15" y2="20" stroke-dasharray="2 2" opacity="0.4"/><line x1="4" y1="20" x2="20" y2="4" stroke="#ff7a7a" stroke-width="2"/></svg>`;

let btn = null;
let state = { hide: true, showButton: true };

const isClassPage = () =>
  !!document.querySelector('[class*="page_Classes___"]');

const applyHide = (hide) => {
  document.documentElement.classList.toggle("psh-show", !hide);
  updateButton();
};

const updateButton = () => {
  if (!btn) return;
  btn.innerHTML = state.hide ? SVG_HIDDEN : SVG_VISIBLE;
  btn.dataset.state = state.hide ? "hidden" : "visible";
  btn.setAttribute(
    "aria-label",
    state.hide
      ? "Mostrar sidebar de comentarios"
      : "Ocultar sidebar de comentarios"
  );
};

const ensureButton = () => {
  if (btn || !document.body || !state.showButton || !isClassPage()) return;
  btn = document.createElement("button");
  btn.id = "psh-toggle-btn";
  btn.type = "button";
  btn.title =
    "Mostrar/ocultar sidebar de comentarios (Alt+Shift+H)";
  btn.addEventListener("click", async () => {
    const { [HIDE_KEY]: hide = true } =
      await chrome.storage.sync.get(HIDE_KEY);
    chrome.storage.sync.set({ [HIDE_KEY]: !hide });
  });
  document.body.appendChild(btn);
  updateButton();
};

const removeButton = () => {
  if (btn) {
    btn.remove();
    btn = null;
  }
};

const reconcile = () => {
  if (state.showButton && isClassPage()) ensureButton();
  else removeButton();
};

const start = () => {
  reconcile();
  new MutationObserver(reconcile).observe(document.body, {
    childList: true,
    subtree: true,
  });
};

chrome.storage.sync.get(
  { [HIDE_KEY]: true, [BTN_KEY]: true },
  ({ [HIDE_KEY]: hide, [BTN_KEY]: showButton }) => {
    state.hide = hide;
    state.showButton = showButton;
    applyHide(hide);
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
  }
);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes[HIDE_KEY]) {
    state.hide = changes[HIDE_KEY].newValue;
    applyHide(state.hide);
  }
  if (changes[BTN_KEY]) {
    state.showButton = changes[BTN_KEY].newValue;
    reconcile();
  }
});
