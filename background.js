chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_GRIDS_VISIBILITY" });
});