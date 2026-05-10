const HIDE_KEY = "hideComments";
const BTN_KEY = "showFloatingButton";

const cb = document.getElementById("toggle");
const cbBtn = document.getElementById("btn-toggle");
const dot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const shortcutEl = document.getElementById("shortcut");

const renderHide = (hide) => {
  cb.checked = hide;
  dot.classList.toggle("off", !hide);
  statusText.textContent = hide ? "activo" : "desactivado";
};

const renderBtn = (show) => {
  cbBtn.checked = show;
};

chrome.storage.sync.get(
  { [HIDE_KEY]: true, [BTN_KEY]: true },
  ({ [HIDE_KEY]: hide, [BTN_KEY]: show }) => {
    renderHide(hide);
    renderBtn(show);
  }
);

cb.addEventListener("change", () => {
  chrome.storage.sync.set({ [HIDE_KEY]: cb.checked });
  renderHide(cb.checked);
});

cbBtn.addEventListener("change", () => {
  chrome.storage.sync.set({ [BTN_KEY]: cbBtn.checked });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes[HIDE_KEY]) renderHide(changes[HIDE_KEY].newValue);
  if (changes[BTN_KEY]) renderBtn(changes[BTN_KEY].newValue);
});

chrome.commands.getAll((commands) => {
  const cmd = commands.find((c) => c.name === "toggle-hide");
  if (!cmd || !cmd.shortcut) {
    shortcutEl.textContent = "sin asignar";
    return;
  }
  shortcutEl.textContent = cmd.shortcut
    .replace(/Command/g, "⌘")
    .replace(/Ctrl/g, "⌃")
    .replace(/Alt/g, "⌥")
    .replace(/Shift/g, "⇧")
    .replace(/\+/g, "");
});
