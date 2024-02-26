export const storageSet = (key: string, value: any) =>
  chrome.storage.local.set({ [key]: value });

export const storageGet = (key: string) => chrome.storage.local.get([key]);

export const parseJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
};

export const forSeconds = (seconds: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(function () {
      resolve();
    }, seconds * 1000);
  });
};

/**
 * Waits for an element to appear in the DOM.
 * @param selector - CSS selector for the element
 * @param cyclesCount - number of times to check for the element (default: 100)
 * @returns a promise that resolves to the element when it appears
 */
export function elementAppear(
  selector: string,
  cyclesCount = 100
): Promise<Element> {
  let cycles = cyclesCount;
  return new Promise((resolve, reject) => {
    const id = setInterval(() => {
      cycles--;
      if (cycles <= 0) {
        clearInterval(id);
        reject();
      }
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(id);
        resolve(element);
      }
    }, 100);
  });
}

export class ExtensionMessage {
  context: any;
  data: any;
  constructor(context: string, data?: any) {
    this.context = context;
    this.data = data;
  }
}

export const requestBackground = (request: ExtensionMessage) => {
  return new Promise((resolve) => {
    const handler = ({ context, data }) => {
      if (context === request.context) {
        chrome.runtime.onMessage.removeListener(handler);
        resolve(data);
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    chrome.runtime.sendMessage(
      new ExtensionMessage(request.context, request.data)
    );
  });
};
