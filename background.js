chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'gridify_1234':
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_GRIDS_VISIBILITY" });
      break;
    case 'gridify_7890':
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_DISTANCE_VISIBILITY" });
      break;
    default:
      console.log("Unhandled info");
  }
});