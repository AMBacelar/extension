import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import '@assets/styles/tailwind.css';
import Popup from '@pages/popup/Popup';

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  let div, body, itemsIndex, orderIndex, startIndex;
  switch (request.context) {
    case 'getTextContentHelper':
      body = request.payload;
      div = document.createElement('div');
      div.innerHTML = body;
      sendResponse(div.textContent);
      break;
    case 'createDivForAsos':
      body = request.payload;
      div = document.createElement('div');
      div.innerHTML = body;
      itemsIndex = div.textContent.lastIndexOf('Items');
      orderIndex = div.textContent.lastIndexOf('Your order');
      if (itemsIndex > -1) {
        startIndex = itemsIndex + 5;
      }
      if (orderIndex > -1) {
        startIndex = orderIndex + 10;
      }
      sendResponse(
        div.textContent
          .substring(startIndex, body.lastIndexOf('Total'))
          .split(/[ \t]{2,}/)
      );
      break;
  }
});

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);
}

init();
