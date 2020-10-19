chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.executeScript(
    tabs[0].id,
    {
      file: 'content_script/script.js'
    }, () => {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          "id": "gridify_1234",
          "title": "Select Element Position",
          "type": "normal",
          "contexts": ["all"]
        }, () => {
          window.close();
        });
      });
    });
});