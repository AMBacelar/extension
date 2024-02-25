import { config } from './config';
import { parseJwt, storageGet, storageSet } from './misc';

let nextPageToken: string;
export const OAUTH = {
  key: {
    auth: 'auth',
  },

  user: {
    info: 'oauth-user-info',
    refreshToken: 'user-refresh-token',
    signIn: async () => {
      const token = await chrome.identity.getAuthToken({ interactive: true });
      const userInfo = { access_token: token.token };
      await storageSet(OAUTH.user.info, userInfo);
    },
    logOut: async () => {
      console.log('1');
      chrome.identity.getAuthToken({ interactive: false }, (current_token) => {
        console.log('2');
        chrome.identity.removeCachedAuthToken(
          { token: current_token as string },
          () => {
            /** */
          }
        );
        console.log('3');
        const xhr = new XMLHttpRequest();
        xhr.open(
          'GET',
          'https://accounts.google.com/o/oauth2/revoke?token=' + current_token
        );

        xhr.send();
      });

      await chrome.identity.clearAllCachedAuthTokens();
      console.log('4');
      await storageSet(OAUTH.user.info, '');
      console.log('5');
    },
    profileUrl: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
  },

  request: {
    refreshUserInfo: () => {
      return new Promise((resolve) => {
        chrome.identity
          .getAuthToken({
            interactive: true,
          })
          .then((token) => {
            const userInfo = { access_token: token.token };
            resolve(userInfo);
          });
      });
    },
    getMessages: () => {
      console.log(nextPageToken + ' !!!!');
      return new Promise(async (resolve) => {
        const userInfo = await OAUTH.request.refreshUserInfo();

        if (!userInfo) {
          resolve({ success: false });
          console.log('error?');
          return;
        }

        const googleUserId = await storageGet(config.keys.googleUserId);
        //var nextPageToken = await storageGet(config.keys.nextPageToken);
        let tokenPageParam = '';
        if (nextPageToken) {
          tokenPageParam = '&pageToken=' + nextPageToken;
        }

        const subjects = {
          zara: 'Thank you for your purchase',
          asos: 'Thanks for your order',
          prettyLT: 'Your order confirmation',
          boohoo: 'Your boohoo order confirmation',
          mango: 'Thank you for shopping at MANGO',
          misguided: 'Missguided: Order Confirmation',
          hnm: 'Order confirmation',
        } as const;

        const keyWords = [
          'asos',
          'pretty little thing',
          'h&n',
          'zara',
          'boohoo',
          'mango',
          'missguided',
          'uniqlo',
          'other stories',
          'pull&bear',
          'monki',
          'na-kd',
          'i saw it first',
          'bershka',
        ] as const;

        const search = `subject:${Object.keys(subjects)
          .map((key) => `(${subjects[key]})`)
          .join(' OR ')}`;

        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500&includeSpamTrash=false${tokenPageParam}&q={${search}} after: ${new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          )
            .toLocaleDateString()
            .split('/')
            .reverse()
            .join('/')} `,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userInfo.access_token}`,
            },
            crossDomain: true,
          }
        )
          .then(async (response) => {
            const result = await response.json();
            nextPageToken = result.nextPageToken;
            console.log('!!!! what we got from Google', nextPageToken, result);
            resolve(result);
          })
          .catch((error) => reject(error));
      });
    },

    getSpecificMessage: (id: string) => {
      return new Promise(async (resolve) => {
        const userInfo = await OAUTH.request.refreshUserInfo();

        if (!userInfo) {
          resolve({ success: false });
          console.log('error?');
          return;
        }

        const googleUserId = await storageGet(config.keys.googleUserId);
        //console.log(googleUserId);
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/${googleUserId}/messages/${id}`,
          {
            method: 'GET',
            crossDomain: true,
            headers: {
              Authorization: `Bearer ${userInfo.access_token}`,
            },
          }
        )
          .then((response) => resolve(response.json()))
          .catch((error) => console.log(error));
      });
    },

    getProfileInfo: () => {
      return new Promise(async (resolve) => {
        const userInfo = await OAUTH.request.refreshUserInfo();
        const response = await fetch(OAUTH.user.profileUrl, {
          method: 'GET',
          datatype: 'json',
          headers: { Authorization: `Bearer ${userInfo.access_token}` },
          contentType: 'application/json',
        });
        const profileInfo = await response.json();
        resolve(profileInfo);
      });
    },

    saveUser: (message: { data: { code: any } }, sender: any) => {
      return new Promise(async (resolve) => {
        const payload = OAUTH.user.infoPayload(message.data.code);
        console.log(payload);
        const userInfo = await OAUTH.request.getGoogleUserData(
          payload,
          message,
          sender
        );
        console.log(userInfo);
        chrome.runtime.sendMessage(
          new ExtensionMessage(OAUTH.key.auth, userInfo)
        );
        resolve();
      });
    },

    getGoogleUserData: (
      payload: { refresh_token: any },
      message: any,
      sender: { tab: { id: number } }
    ) => {
      return new Promise(async (resolve) => {
        if (sender) {
          chrome.tabs.update(sender.tab.id, {
            url: 'https://efitterapp.com/how-it-works',
          });
          //chrome.tabs.update(OAUTH.authRequestTab.id, { 'active': true });
        }

        const userInfo = await requestInfo(payload);
        await storageSet(OAUTH.user.info, userInfo);
        if (!payload.refresh_token) {
          await storageSet(OAUTH.user.refreshToken, userInfo.refresh_token);
        }

        const userData = parseJwt(userInfo.id_token);

        const data = {
          Email: userData.email,
        };

        resolve(userInfo);
      });

      function requestInfo(payload: any) {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await fetch(OAUTH.user.tokenUrl, {
              method: 'POST',
              contentType: 'application/json',
              body: JSON.stringify(payload),
            });
            const res = response.json();
            resolve(res);
          } catch (err) {
            reject(err);
          }
        });
      }
    },
  },

  getHash: (length = 12) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
};
