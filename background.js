const KEY = "hideComments";

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-hide") return;
  const { [KEY]: hide = true } = await chrome.storage.sync.get(KEY);
  await chrome.storage.sync.set({ [KEY]: !hide });
});
