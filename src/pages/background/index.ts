import { config } from '../../../utils/config';
import { OAUTH } from '../../../utils/oauth';
import { ExtensionMessage, storageGet, storageSet } from '../../../utils/misc';

console.log('background script loaded');

const manifestData = chrome.runtime.getManifest();
storageGet(config.keys.lastSavedVersion).then((lastSavedVersion) => {
  if (lastSavedVersion !== manifestData.version) {
    const newURL = 'https://www.efitter.com/whats-new';
    chrome.tabs.create({ url: newURL });
    storageSet(config.keys.lastSavedVersion, manifestData.version);
  }
});

chrome.runtime.onMessage.addListener(async function (message, sender) {
  try {
    switch (message.context) {
      // case config.keys.getMessages:
      //   getMessages(message);
      //   break;
      // case config.keys.getSpecificMessage:
      //   getSpecificMessage(message);
      //   break;
      // case config.keys.saveUser:
      //   saveUser(message);
      //   break;

      // case config.keys.loadMessages:
      //   console.log(sender);
      //   loadMessages(message, sender);
      //   break;

      //OAUTH
      case config.keys.getProfileInfo:
        getProfileInfo(message);
        break;
    }
  } catch (error) {
    console.log(error);
  }
});

async function getProfileInfo(message) {
  const result = await OAUTH.request.getProfileInfo();
  console.log(new ExtensionMessage(message.context, result));
  chrome.runtime.sendMessage(new ExtensionMessage(message.context, result));
}
