chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.executeScript(
    tabs[0].id,
    {
      file: 'content_script/script.js'
    }, () => {
      window.close();
    });
});