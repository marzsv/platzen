const HIDE_KEY = "hideComments";
const BTN_KEY = "showFloatingButton";

let btn = null;
let state = { hide: true, showButton: true };

const isClassPage = () =>
  !!document.querySelector('[class*="page_Classes___"]');

const applyHide = () => {
  document.documentElement.classList.toggle("psh-show", !state.hide);
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
  btn.addEventListener("click", () => {
    chrome.storage.sync.set({ [HIDE_KEY]: !state.hide });
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
    subtree: false,
  });
};

chrome.storage.sync.get(
  { [HIDE_KEY]: true, [BTN_KEY]: true },
  ({ [HIDE_KEY]: hide, [BTN_KEY]: showButton }) => {
    state.hide = hide;
    state.showButton = showButton;
    applyHide();
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
  }
);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes[HIDE_KEY]) {
    state.hide = changes[HIDE_KEY].newValue;
    applyHide();
  }
  if (changes[BTN_KEY]) {
    state.showButton = changes[BTN_KEY].newValue;
    reconcile();
  }
});
