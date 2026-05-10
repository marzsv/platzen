# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Chrome extension (Manifest V3) that hides the comments sidebar on Platzi class pages and expands the video to full width. Vanilla HTML/CSS/JS — no build, no bundler, no dependencies, no tests, no linter.

## Development workflow

- Edit files directly. There is no compile/build step.
- To test changes: open `chrome://extensions/` and click the reload (↻) button on the Platzen card, then reload the Platzi tab.
- To re-test the keyboard shortcut binding (`Alt+Shift+H`): `chrome://extensions/shortcuts`.

## Architecture: three execution contexts

The extension runs code in three isolated contexts that **cannot share globals or modules directly**. Each loads its scripts separately:

1. **Content script** (`content.js`, runs in the Platzi page) — declared in `manifest.json` under `content_scripts.js`. Loads `icons.js` before `content.js` so the SVG constants are available as globals. Runs at `document_start`.
2. **Service worker** (`background.js`) — handles the `toggle-hide` keyboard command. Standalone; cannot import from content script files.
3. **Popup** (`popup.html` + `popup.js`) — loaded when the user clicks the extension icon. Standalone DOM.

Adding a shared utility file requires declaring it in **every** context that needs it (manifest `content_scripts.js` array, `<script>` tag in popup.html, `importScripts()` in background.js). For a tiny shared constant, this overhead usually isn't worth it — prefer duplicating the literal.

## State synchronization

`chrome.storage.sync` is the single source of truth for the two booleans:

- `hideComments` — whether the sidebar is hidden.
- `showFloatingButton` — whether the floating toggle button is shown on class pages.

All three contexts read initial state from storage on load and subscribe to `chrome.storage.onChanged` to stay in sync. **Never call `storage.get` in event handlers** — read from the in-memory state that `onChanged` keeps current (this avoids race conditions on rapid toggles).

## How the hiding works (no-flicker design)

The CSS in `hide-comments.css` hides the sidebar by default (matching `html:not(.psh-show)`). `content.js` only toggles the `psh-show` class on `<html>` when the user has chosen to *show* the sidebar. This means:

- The sidebar never flashes visible during page load — CSS applies before JS runs.
- If `content.js` failed to load, the user's default (hidden) state still applies.

The grid collapse logic targets `[class*="page_Classes___"]` and `[class*="page_Classes__tabs__"]` — these are **prefix matches on Platzi's CSS Module hash classes**. The same selector appears in both `hide-comments.css` and `content.js` (`isClassPage()`); if Platzi renames their module, both files must be updated.

## Naming caveat

The `psh-` prefix (in `#psh-toggle-btn`, `.psh-show`) is legacy from the project's original name ("Platzi Sidebar Hider"). The user-facing name is now **Platzen**. Don't rename the prefix in passing — it appears in CSS, JS, and the live DOM of installed instances.
