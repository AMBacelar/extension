import { config } from '../../../utils/config';
import { OAUTH } from '../../../utils/oauth';
import {
  ExtensionMessage,
  requestBackground,
  storageGet,
  storageSet,
} from '../../../utils/misc';
import { loadMessages } from '../../../utils/processEmails';

console.log('background script loaded');

const manifestData = chrome.runtime.getManifest();
storageGet(config.keys.lastSavedVersion).then((lastSavedVersion) => {
  if (lastSavedVersion !== manifestData.version) {
    const newURL = 'https://www.efitter.com/whats-new';
    chrome.tabs.create({ url: newURL });
    storageSet(config.keys.lastSavedVersion, manifestData.version);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  try {
    switch (message.context) {
      // case config.keys.saveUser:
      //   saveUser(message);
      //   break;

      case config.keys.loadMessages:
        console.log('from the background', sender);
        runLoadMessages(message, sender);
        break;

      //OAUTH
      case config.keys.getProfileInfo:
        console.log('called from here?');
        getProfileInfo(message);
        break;
    }
  } catch (error) {
    console.log(error);
  }
});

async function runLoadMessages(message, sender) {
  await loadMessages(message, sender);
  requestBackground(new ExtensionMessage(message.context, true));
}

async function getProfileInfo(message) {
  const result = await OAUTH.request.getProfileInfo();
  requestBackground(new ExtensionMessage(message.context, result));
}
