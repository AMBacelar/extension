let currentPageUrl: string;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('listening to all events from the content file', message.context);
  switch (message.context) {
    case 'DOMReloaded': {
      if (window.location.href !== currentPageUrl) {
        currentPageUrl = window.location.href;
        console.log('$$^', currentPageUrl);
        break;
      }
    }
  }
});
