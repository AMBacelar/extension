import Browser from "webextension-polyfill";

Browser.devtools.panels
  .create("Dev Tools", "icon.png", "src/pages/panel/index.html")
  .catch(console.error);
