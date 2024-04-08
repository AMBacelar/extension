import { Product, getCategory } from './calculateSize';
import { Brand, config } from './config';
import { ExtensionMessage, storageGet, storageSet } from './misc';
import { OAUTH } from './oauth';
import { getLegalSizes } from './size';

function htmlToText(str: string) {
  return str.replace(/<\/?[^>]+>/gi, ' ');
}

let totalFound = 0;
type Entry = { id: string; threadId: string };
const processAllMessages = async (entries: Entry[], sender) => {
  return new Promise<void>((resolve) => {
    const flows = generateFlows(entries, config.keys.flowCount);
    const flowPromises = [];
    for (const flow of flows) {
      flowPromises.push(processFewMessages(flow, sender));
    }

    Promise.allSettled(flowPromises).then((result) => {
      totalFound = 0;
      resolve();
    });
  });
};

/**
 * Generates an array of arrays, where each sub-array contains `flowCount` or fewer elements.
 * @param entries - the array of entries to split
 * @param flowCount - the maximum number of elements in each array
 * @returns an array of arrays, where each sub-array contains `flowCount` or fewer elements
 */
const generateFlows = (entries: Entry[], flowCount: number): Entry[][] => {
  const flows = [];

  for (let i = 0; i < flowCount; i++) {
    const flow = [];

    for (let y = 0; y * flowCount + i < entries.length; y++) {
      flow.push(entries[y * flowCount + i]);
    }
    flows.push(flow);
  }
  return flows;
};

const deepSearchForBody = (parts, cycles = 0) => {
  if (cycles > 10) {
    return;
  }
  if (parts[0].body.data) {
    return parts[0].body.data;
  } else {
    return deepSearchForBody(parts[0].parts, cycles + 1);
  }
};

const processFewMessages = async (flow: Entry[], sender) => {
  const messages = [];
  for (let i = 0; i < flow.length; i++) {
    try {
      const message = await OAUTH.request.getSpecificMessage(flow[i].id);
      const data = message.payload.body.data
        ? message.payload.body.data
        : deepSearchForBody(message.payload.parts);

      if (!data) {
        console.log('$$$ no data!', {
          snippet: message.snippet,
          from: message.payload.headers.filter((x) => x.name == 'From')[0],
          message,
        });
        continue;
      }

      const message_body = atob(
        decodeURIComponent(data.replace(/-/g, '+').replace(/_/g, '/'))
      );

      // Next phase of the debug process
      messages.push({
        subject: message.payload.headers.filter((x) => x.name == 'Subject')[0]
          .value,
        body: message_body,
        date: message.payload.headers.filter(
          (x) => x.name.toLowerCase() === 'date'
        )[0].value,
      });

      parseData(
        message.payload.headers.filter((x) => x.name == 'Subject')[0].value,
        message_body,
        message.payload.headers.filter(
          (x) => x.name.toLowerCase() === 'date'
        )[0].value,
        sender
      );
    } catch (ex) {
      console.log('$$', ex);
      continue;
    }
  }
};

export const loadMessages = async (message, sender) => {
  const messages = await OAUTH.request.getMessages();
  return await processAllMessages(messages, sender);
};

const findBrand = (stringContainingBrand: string) => {
  let itemBrand;
  const brandList = Object.keys(config.brands).reduce(function (r, k) {
    return r.concat(config.brands[k]);
  }, []);

  // asos test
  for (let i = 0; i < config.validAsosBrands.length; i++) {
    const asosBrand = config.validAsosBrands[i];
    if (stringContainingBrand.toLowerCase().includes(asosBrand.toLowerCase())) {
      itemBrand = config.brands.asos;
      return itemBrand;
    }
  }

  for (let i = 0; i < brandList.length; i++) {
    const viableBrand = brandList[i];
    if (
      stringContainingBrand.toLowerCase().includes(viableBrand.toLowerCase())
    ) {
      itemBrand = viableBrand;
      return itemBrand;
    }
  }
  return;
};

const parseAsos = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];
    let startIndex;
    const itemsIndex = body.lastIndexOf('Items');
    const orderIndex = body.lastIndexOf('Your order');

    const completeParse = (responseFromMessage, itemArray = items) => {
      let array = responseFromMessage;
      const deliveryLineIndex = array.findIndex((line) =>
        line.includes('Delivery method')
      );
      const subTotalLineIndex = array.findIndex((line) =>
        line.includes('Sub-total')
      );
      array = array
        .slice(deliveryLineIndex + 1, subTotalLineIndex)
        .map((line) => line.trim());

      if (array[0] === '') array = array.slice(1);
      const cart = array.toString().split(',,,');
      for (let index = 0; index < cart.length; index++) {
        const item = cart[index].split(',,');
        const name = item[0];
        let size = null;

        if (item[2]) {
          size = item[2].match(/\/.*?\//gm);
          if (size) {
            size = size[0].replace(/\//g, '').trim();
          }
        }
        const brandName = findBrand(name);
        if (size != null && brandName !== undefined) {
          const sanitizeDenim = size.split(/(W\d{2})/);
          if (sanitizeDenim.length > 1) {
            size = sanitizeDenim[1].trim();
          }
          const itemToPush = {
            name,
            size,
            brandName,
            date,
          };
          itemArray.push(itemToPush);
        }
      }

      if (items.length == 0) {
        for (let i = 0; i < array.length; i++) {
          let size = null;
          let name = null;
          if (array[i].includes('Size: ')) {
            const sanitizeDenim = array[i].split(/(W\d{2})/);
            if (sanitizeDenim.length > 1) {
              size = sanitizeDenim[1];
            } else {
              size = array[i]
                .replaceAll('Size: ', '')
                .replaceAll('UK', '')
                .replaceAll('EU', '')
                .replaceAll(' ', '');
            }
            name = array[i - 6];
          }

          if (size != null) {
            pushItem.push({
              name: decodeHTMLEntities(name),
              size: decodeHTMLEntities(size),
              brandName: findBrand(name),
              date,
            });
          }
        }
      }
      resolve(items);
    };

    if (itemsIndex > -1) {
      startIndex = itemsIndex + 5;
    }
    if (orderIndex > -1) {
      startIndex = orderIndex + 10;
    }

    const array = body
      .substring(startIndex, body.lastIndexOf('Total'))
      .split('\n');
    let step = 5;
    // console.log('ASOS raw input', body);
    if (array.length < step) {
      const payload = body;
      step = 4;
      await chrome.runtime.sendMessage(
        {
          context: 'createDivForAsos',
          payload,
        },
        completeParse
      );
    } else {
      await completeParse(array);
    }
  });
};

const parseMango = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      let array = responseFromMessage
        .substring(
          responseFromMessage.lastIndexOf('Order number'),
          responseFromMessage.lastIndexOf('Subtotal')
        )
        .split('\n');

      array = array.reduce((array, line) => {
        if (line.trim() !== '' && !line.includes('https://')) {
          array.push(line.trim());
        }
        return array;
      }, []);

      for (let i = 0; i < array.length; i++) {
        const line = array[i];
        if (line.includes('Size')) {
          let size = line.replace('Size', '');
          if (size.includes('Color')) size = size.replace('Color', '');
          items.push({
            name: array[i - 2].trim(),
            size: size.trim(),
            brandName: config.brands.mango,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseZara = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];
    const legalSizes = getLegalSizes(config.brands.zara);

    const completeParse = (responseFromMessage, itemArray = items) => {
      let lines = responseFromMessage;
      lines = lines
        .substring(lines.lastIndexOf('Products'), lines.lastIndexOf('Payment'))
        .split('\n');

      lines = lines.reduce<string[]>((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const i = legalSizes.findIndex((legalSize) => legalSize === line);
        if (i !== -1) {
          items.push({
            name: lines[index - 3].trim(),
            size: line,
            brandName: config.brands.zara,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseNext = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      let lines = responseFromMessage;
      lines = lines
        .substring(lines.indexOf('Description'), lines.indexOf('Total'))
        .split('\n');
      lines = lines.reduce<string[]>((lines, line) => {
        const a = line.replaceAll('|', '').trim();
        if (a !== '') {
          lines.push(a);
        }
        return lines;
      }, []);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.toLowerCase().includes('price')) {
          const name = line.replace('Price', '').trim();
          const brandName = findBrand(name) || config.brands.next;
          const legalSizes = getLegalSizes(brandName);
          items.push({
            name,
            size: lines[index + 2].trim(),
            brandName,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseArket = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      let lines = responseFromMessage;
      lines = lines
        .substring(
          lines.indexOf('Total price') + 11,
          lines.indexOf('Products total')
        )
        .split('\n');
      lines = lines.reduce<string[]>((lines, line) => {
        const a = line.replace(/|/gi, '').trim();
        if (a !== '') {
          lines.push(a);
        }
        return lines;
      }, []);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const test = Number(line);

        const getSize = () => {
          if (!body.includes('<td>')) return lines[index + 3].trim();
          const line = lines[index + 2].trim();
          const parts = line.split(' ');
          return parts[parts.length - 1].trim();
        };

        if (!isNaN(test) && test > 100) {
          items.push({
            name: lines[index + 1].trim(),
            size: getSize(),
            brandName: config.brands.arket,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseWeekday = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      let lines = responseFromMessage;
      lines = lines
        .substring(lines.indexOf('Total price') + 11, lines.indexOf('Subtotal'))
        .split('\n');
      lines = lines.reduce<string[]>((lines, line) => {
        const a = line.trim();
        if (a !== '') {
          lines.push(a);
        }
        return lines;
      }, []);
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const test = Number(line);
        if (!isNaN(test) && test > 100) {
          items.push({
            name: lines[index + 1].trim(),
            size: lines[index + 2].trim(),
            brandName: config.brands.weekday,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseCOS = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      console.log(first);
      let lines = responseFromMessage;
      lines = lines.split('\n');
      lines = lines.reduce((lines, line) => {
        const a = line.replace(/|/gi, '').trim();
        if (a !== '') {
          lines.push(a);
        }
        return lines;
      }, []);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const test = Number(line);

        const getSize = () => {
          if (!body.includes('<td>')) return lines[index + 3].trim();
          const line = lines[index + 2].trim();
          const parts = line.split(' ');
          return parts[parts.length - 1].trim();
        };

        if (!isNaN(test) && test > 100) {
          items.push({
            name: lines[index + 1].trim(),
            size: getSize(),
            brandName: config.brands.cos,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseRiverIsland = async (body: string, date: string) => {
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      let lines = responseFromMessage;
      lines = lines
        .substring(
          lines.indexOf('Your items in this order') + 24,
          lines.indexOf('Subtotal')
        )
        .split('\n');
      lines = lines.reduce<string[]>((lines, line) => {
        const a = line.trim();
        if (a !== '') {
          lines.push(a);
        }
        return lines;
      }, []);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.includes('Size:')) {
          items.push({
            name: lines[index - 2].replaceAll('|', '').trim(),
            size: line
              .replace('Size:', '')
              .replace('(UK)', '')
              .replace('(EU)', '')
              .trim(),
            brandName: config.brands.riverIsland,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseNewLook = async (body: string, date: string) => {
  console.log('$$ New Look');
  return new Promise(async (resolve) => {
    const items = [];

    const completeParse = (responseFromMessage, itemArray = items) => {
      let lines = responseFromMessage;
      lines = lines
        .substring(
          lines.indexOf('Your items in this order') + 24,
          lines.indexOf('Subtotal')
        )
        .split('\n');
      lines = lines.reduce<string[]>((lines, line) => {
        const a = line.trim();
        if (a !== '') {
          lines.push(a);
        }
        return lines;
      }, []);
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.includes('Size:')) {
          items.push({
            name: lines[index - 2].trim(),
            size: line
              .replace('Size:', '')
              .replace('(UK)', '')
              .replace('(EU)', '')
              .trim(),
            brandName: config.brands.newLook,
            date: date,
          });
        }
      }
      resolve(items);
    };

    await chrome.runtime.sendMessage(
      {
        context: 'getTextContentHelper',
        payload: body,
      },
      completeParse
    );
  });
};

const parseData = async (
  subject: string,
  body: string,
  date: string,
  sender: string
) => {
  const items: {
    name: string;
    size: string;
    brandName: Brand;
    date: string;
  }[] = [];
  let saveData = false;
  date = date.substring(5);

  const parsePrettyLittleThing = () => {
    const text = body.substring(
      body.lastIndexOf('Price') + 5,
      body.lastIndexOf('Subtotal')
    );
    let lines = text.split(/\n/g);
    lines = lines.reduce<string[]>((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];
    while (lines.length) {
      itemBlocks.push(lines.splice(0, 5));
    }

    itemBlocks.forEach((itemBlock) => {
      let size;
      if (itemBlock[1].includes('Size: ')) {
        size = itemBlock[1].replace(/Size: /, '').trim();
      }
      const name = itemBlock[0];
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.plt,
          date: date,
        });
      }
    });

    saveData = true;
  };

  const parseBoohoo = () => {
    let array = htmlToText(body).replaceAll('>', '').trim();

    array = array.substring(
      array.toLowerCase().lastIndexOf('s in the bag...') + 18,
      array.toLowerCase().lastIndexOf('subtotal')
    );

    let lines = array.split(/\n/g);
    lines = lines.reduce<string[]>((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    let originalEmail;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('qty')) {
        if (
          line.toLowerCase().includes('qty') &&
          line.toLowerCase().includes('size') &&
          line.toLowerCase().includes('colour')
        ) {
          originalEmail = false;
        } else {
          originalEmail = true;
        }
      }
    }

    const nameStep = originalEmail ? 3 : 2;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Size:')) {
        const name = lines[i - nameStep];
        const size = originalEmail
          ? lines[i + 1]
          : lines[i]
              .toLowerCase()
              .substring(
                lines[i].toLowerCase().lastIndexOf('size:') + 5,
                lines[i].toLowerCase().lastIndexOf('[')
              )
              .replace('*', '')
              .trim();

        items.push({
          name,
          size,
          brandName: config.brands.boohoo,
          date: date,
        });
      }
    }

    saveData = true;
  };

  const parseMissguided = () => {
    let lines = body
      .substring(
        body.search(/Item\s+Description\s+Price/),
        body.lastIndexOf('Subtotal')
      )
      .split(/\n|\r/g);

    lines = lines.reduce<string[]>((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    for (let i = 0; i < lines.length; i++) {
      let name = '';
      if (lines[i].includes('Size: ')) {
        let steps = 1;
        while (name === '') {
          if (lines[i - steps]) {
            if (lines[i - steps].match(/Item\s+Description\s+Price/)) {
              name = lines
                .slice(i - steps, i)
                .toString()
                .replace(/,/g, ' ');
              name = name.substring(name.lastIndexOf('Price') + 5).trim();
            } else {
              steps++;
            }
          } else {
            name = null;
            break;
          }
        }
        items.push({
          name,
          size: decodeHTMLEntities(lines[i].split('Size: ')[1].split(',')[0]),
          brandName: config.brands.missguided,
          date: date,
        });
      }
    }

    saveData = true;
  };
  const parseNAKD = () => {
    let formattedLines = htmlToText(body).trim();

    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('My Order'),
      formattedLines.lastIndexOf('Order overview')
    );

    formattedLines = formattedLines.split('Quantity:');

    formattedLines.forEach((itemBlock) => {
      let name = null;
      let size = null;
      let lines = itemBlock.split(/\n/g);
      lines = lines.reduce<string[]>((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      // get name

      for (let index = 0; index < lines.length; index++) {
        const potentialItemName = lines[index];
        for (const category in config.categories) {
          if (Object.hasOwnProperty.call(config.categories, category)) {
            const clothingCategory = config.categories[category];
            for (const keyword in clothingCategory.keywords) {
              if (
                Object.hasOwnProperty.call(clothingCategory.keywords, keyword)
              ) {
                const key = clothingCategory.keywords[keyword];
                if (
                  potentialItemName.toLowerCase().includes(key.toLowerCase())
                ) {
                  name = potentialItemName;
                }
              }
            }
          }
        }
      }

      // get size
      size = lines.filter((line) => line.includes('Size:'));
      if (size.length > 0) {
        size = size[0].replace('Size:', '').trim();
      } else {
        size = null;
      }
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.nakd,
          date: date,
        });
      }
    });
    saveData = true;
  };
  const parseISawFirst = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('ORDER DETAILS' + 13),
      formattedLines.lastIndexOf('Subtotal')
    );

    formattedLines = formattedLines.split('Quantity:');

    formattedLines.forEach((itemBlock) => {
      let name = null;
      let size = null;
      let lines = itemBlock.split(/\n/g);
      lines = lines.reduce<string[]>((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      // get name

      for (let index = 0; index < lines.length; index++) {
        const potentialItemName = lines[index];
        for (const category in config.categories) {
          if (Object.hasOwnProperty.call(config.categories, category)) {
            const clothingCategory = config.categories[category];
            for (const keyword in clothingCategory.keywords) {
              if (
                Object.hasOwnProperty.call(clothingCategory.keywords, keyword)
              ) {
                const key = clothingCategory.keywords[keyword];
                if (
                  potentialItemName.toLowerCase().includes(key.toLowerCase())
                ) {
                  name = potentialItemName;
                }
              }
            }
          }
        }
      }

      // get size
      size = lines.filter((line) => line.includes('Size:'));
      if (size.length > 0) {
        size = size[0].replace('Size:', '').trim();
      } else {
        size = null;
      }
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.iSawItFirst,
          date: date,
        });
      }
    });

    saveData = true;
  };
  const parseOtherStories = () => {
    let rawLines = htmlToText(body).trim();
    let originalEmail;

    rawLines = rawLines
      .substring(
        rawLines.lastIndexOf('Total price') + 11,
        rawLines.lastIndexOf('Products total')
      )
      .split(/\n/g);

    rawLines = rawLines.map((line) => line.replace('\r', ''));

    rawLines = rawLines.reduce((rawLines, line) => {
      if (line.trim() !== '') {
        rawLines.push(line.trim());
      }
      return rawLines;
    }, []);

    if (rawLines.length) {
      const searchForPattern = rawLines[0].search(/\d{5,}\s\w+/gm) !== -1;
      if (searchForPattern) {
        originalEmail = false;
      } else {
        originalEmail = true;
      }
    }

    if (originalEmail) {
      let searchingForSymbol = true;

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (searchingForSymbol) {
          if (line.includes('£') || line.includes('&pound;')) {
            searchingForSymbol = false;
            items.push({
              name: rawLines[i - 4],
              size: rawLines[i - 3],
              brandName: config.brands.otherStories,
              date: date,
            });
          }
        } else {
          if (!line.includes('£')) {
            searchingForSymbol = true;
          }
        }
      }
    } else {
      for (let i = 0; i < rawLines.length; i++) {
        const item = rawLines[i].split(' ');
        const legalSizes = getLegalSizes(config.brands.otherStories);
        for (let j = 0; j < item.length; j++) {
          const text = item[j];
          const index = legalSizes.indexOf(text);
          if (index !== -1) {
            items.push({
              name: item.slice(1, j).toString().replace(/,/g, ' '),
              size: text,
              brandName: config.brands.otherStories,
              date: date,
            });
          }
        }
      }
    }

    saveData = true;
  };
  const parseHM = () => {
    let lines = htmlToText(body).trim();

    if (lines.toLowerCase().includes('order details')) {
      // 2022 email type 1
      lines = lines
        .substring(
          lines.toLowerCase().indexOf('order details') + 13,
          lines.toLowerCase().indexOf('order summary') + 13
        )
        .split('\n');
      lines = lines.map((line) => line.replace('\r', ''));
      lines = lines.reduce<string[]>((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Size')) {
          items.push({
            name: lines[i - 4].replace(/\([^)]*\)/, '').trim(),
            size: lines[i].replace('Size', '').trim(),
            brandName: config.brands.hm,
            date: date,
          });
        }
      }
    }
    // not a 2022 email format?
    else {
      lines = lines
        .substring(
          lines.toLowerCase().lastIndexOf('price after discount') + 20,
          lines.toLowerCase().lastIndexOf('products total')
        )
        .split('\n');

      lines = lines.map((line) => line.replace('\r', ''));

      lines = lines.reduce<string[]>((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      let originalEmail;

      if (lines.length) {
        const searchForPattern = lines[0].search(/\d{5,}\s\w+/gm) !== -1;
        if (searchForPattern) {
          originalEmail = false;
        } else {
          originalEmail = true;
        }
      }

      if (originalEmail) {
        let searchingForSymbol = true;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (searchingForSymbol) {
            if (line.includes('£')) {
              searchingForSymbol = false;
              items.push({
                name: lines[i - 4],
                size: lines[i - 3],
                brandName: config.brands.hm,
                date: date,
              });
            }
          } else {
            if (!line.includes('£')) {
              searchingForSymbol = true;
            }
          }
        }
      } else {
        for (let i = 0; i < lines.length; i++) {
          const item = lines[i].split(' ');
          const legalSizes = getLegalSizes(config.brands.hm);
          for (let j = 0; j < item.length; j++) {
            const text = item[j];
            const index = legalSizes.indexOf(text);
            if (index !== -1) {
              items.push({
                name: item.slice(1, j).toString().replace(/,/g, ' '),
                size: text,
                brandName: config.brands.hm,
                date: date,
              });
            }
          }
        }
      }
    }

    saveData = true;
  };
  const parseUniqlo = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Order Number') + 12,
      formattedLines.lastIndexOf('Order Details:')
    );

    formattedLines = formattedLines.split('Item No:');

    formattedLines.forEach((itemBlock) => {
      let name = null;
      let size = null;
      let lines = itemBlock.split(/\n/g);
      lines = lines.reduce<string[]>((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      // get name

      for (let index = 0; index < lines.length; index++) {
        const potentialItemName = lines[index];
        for (const category in config.categories) {
          if (Object.hasOwnProperty.call(config.categories, category)) {
            const clothingCategory = config.categories[category];
            for (const keyword in clothingCategory.keywords) {
              if (
                Object.hasOwnProperty.call(clothingCategory.keywords, keyword)
              ) {
                const key = clothingCategory.keywords[keyword];
                if (
                  potentialItemName.toLowerCase().includes(key.toLowerCase())
                ) {
                  name = potentialItemName;
                }
              }
            }
          }
        }
      }

      // get size
      size = lines.filter((line) => line.includes('Size:'));
      if (size.length > 0) {
        size = size[0].replace('Size:', '').replace('&nbsp;', ' ').trim();
      } else {
        size = null;
      }
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.uniqlo,
          date: date,
        });
      }
    });

    saveData = true;
  };
  const parseBershka = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Purchase summary') + 16,
      formattedLines.lastIndexOf('Total item price')
    );

    if (formattedLines.split('\n').length === 1) {
      formattedLines = formattedLines
        .substring(formattedLines.indexOf('£'))
        .trim();
      formattedLines = formattedLines.split(/\s{2,}/);

      for (let i = 0; i < formattedLines.length; i++) {
        const line = formattedLines[i];
        if (line.includes('Colour:')) {
          items.push({
            name: formattedLines[i - 1],
            size: formattedLines[i + 2],
            brandName: config.brands.bershka,
            date: date,
          });
        }
      }
    } else {
      formattedLines = formattedLines.split('£');

      formattedLines.forEach((itemBlock) => {
        let name = null;
        let size = null;
        let lines = itemBlock.split(/\n/g);
        lines = lines.reduce<string[]>((lines, line) => {
          if (line.trim() !== '') {
            lines.push(line.trim());
          }
          return lines;
        }, []);

        // get name

        for (let index = 0; index < lines.length; index++) {
          const potentialItemName = lines[index];
          for (const category in config.categories) {
            if (Object.hasOwnProperty.call(config.categories, category)) {
              const clothingCategory = config.categories[category];
              for (const keyword in clothingCategory.keywords) {
                if (
                  Object.hasOwnProperty.call(clothingCategory.keywords, keyword)
                ) {
                  const key = clothingCategory.keywords[keyword];
                  if (
                    potentialItemName.toLowerCase().includes(key.toLowerCase())
                  ) {
                    name = potentialItemName;
                  }
                }
              }
            }
          }
        }

        const legalSizes = getLegalSizes(config.brands.bershka);

        // get size

        for (let index = 0; index < lines.length; index++) {
          const potentialSize = lines[index];
          const i = legalSizes.findIndex(
            (legalSize) => legalSize === potentialSize
          );
          if (i !== -1) {
            size = potentialSize;
          }
        }

        if (!!size && !!name) {
          items.push({
            name,
            size,
            brandName: config.brands.bershka,
            date: date,
          });
        }
      });
    }

    saveData = true;
  };
  const parsePullBear = () => {
    let formattedLines = htmlToText(body).trim();

    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('DELIVERY ADDRESS:') + 17,
      formattedLines.lastIndexOf('PRODUCT TOTAL')
    );
    let lines = [];
    formattedLines = formattedLines.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const startIndex = lines.findIndex((line) => getCategory(line));
    lines = lines.filter((line, index) => index >= startIndex);
    // chunk into 5's
    const itemBlocks = [];
    while (lines.length) {
      itemBlocks.push(lines.splice(0, 5));
    }

    itemBlocks.forEach((itemBlock) => {
      const name = itemBlock[0];
      let size = null;

      const legalSizes = getLegalSizes(config.brands.pullBear);

      // get size

      for (let index = 0; index < itemBlock.length; index++) {
        const potentialSize = itemBlock[index];
        const i = legalSizes.findIndex(
          (legalSize) => legalSize === potentialSize
        );
        if (i !== -1) {
          size = potentialSize;
        }
      }

      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.pullBear,
          date: date,
        });
      }
    });

    saveData = true;
  };
  const parseMonki = () => {
    let formattedLines = htmlToText(body).trim();
    const columns = formattedLines.toLowerCase().includes('discount') ? 8 : 7;
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Total price') + 11,
      formattedLines.lastIndexOf('Products total')
    );
    let lines = [];
    formattedLines = formattedLines.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];
    while (lines.length) {
      itemBlocks.push(lines.splice(0, columns));
    }

    itemBlocks.forEach((itemBlock) => {
      let name = null;
      let size = null;
      // get name

      for (let index = 0; index < itemBlock.length; index++) {
        const potentialItemName = itemBlock[index];
        for (const category in config.categories) {
          if (Object.hasOwnProperty.call(config.categories, category)) {
            const clothingCategory = config.categories[category];
            for (const keyword in clothingCategory.keywords) {
              if (
                Object.hasOwnProperty.call(clothingCategory.keywords, keyword)
              ) {
                const key = clothingCategory.keywords[keyword];
                if (
                  potentialItemName.toLowerCase().includes(key.toLowerCase())
                ) {
                  name = potentialItemName;
                }
              }
            }
          }
        }
      }

      const legalSizes = getLegalSizes(config.brands.monki);

      for (let index = 0; index < itemBlock.length; index++) {
        const potentialSize = itemBlock[index];
        const i = legalSizes.findIndex(
          (legalSize) => legalSize === potentialSize
        );
        if (i !== -1) {
          size = potentialSize;
        }
      }

      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.monki,
          date: date,
        });
      }
    });

    saveData = true;
  };

  const parseStradivarius = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Date of order') + 13,
      formattedLines.lastIndexOf('Payment method')
    );

    let lines = [];
    formattedLines = formattedLines.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes(' | ')) {
        // we found the size
        let name = lines[index - 3].trim();
        const category = getCategory(name);

        if (!category) {
          name = lines[index - 2].trim();
        }

        itemBlocks.push({
          name,
          size: line.substring(0, line.indexOf('|')).trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.stradivarius,
          date: date,
        });
      }
    });

    saveData = true;
  };

  const parseMassimoDutti = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Estimated delivery date') + 23,
      formattedLines.lastIndexOf('Product total')
    );

    let lines = [];
    formattedLines = formattedLines.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes('Size:')) {
        // we found the size
        itemBlocks.push({
          name: lines[index - 1].replaceAll('*', '').trim(),
          size: line.substring(line.indexOf(':') + 1).trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.massimoDutti,
          date: date,
        });
      }
    });

    saveData = true;
  };

  const parseHouseOfCB = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Qty') + 5,
      formattedLines.lastIndexOf('Returns')
    );

    let lines = [];
    formattedLines = formattedLines.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes('Size:')) {
        const name = `${lines[index - 2]} ${lines[index - 1]}`.trim();
        itemBlocks.push({
          name,
          size: line
            .substring(line.indexOf(':') + 1)
            .replace('&nbsp;', '')
            .trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.houseOfCB,
          date: date,
        });
      }
    });

    saveData = true;
  };

  const parseMS = () => {
    let formattedLines = htmlToText(body).trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('Order details') + 13,
      formattedLines.lastIndexOf('Payment details')
    );

    let lines = [];
    formattedLines = formattedLines.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes('Size:')) {
        // we found the size
        let name = (lines[index - 2] || '').replaceAll('*', '').trim();
        const category = getCategory(name);
        let size = line.substring(line.indexOf('Size:') + 6).trim();
        if (!category) {
          name = lines[index - 1].replaceAll('*', '').trim();
          size = line
            .substring(line.indexOf('Size:') + 6)
            .trim()
            .split(' ')[0];
        }
        itemBlocks.push({
          name,
          size,
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: config.brands.ms,
          date: date,
        });
      }
    });

    saveData = true;
  };

  if (subject.toLowerCase().includes('Thanks for your order'.toLowerCase())) {
    try {
      let payload;
      if (body.includes('Next Retail Ltd')) {
        // Next
        console.log('Next', subject, date);
        payload = await parseNext(body, date);
      } else {
        //ASOS
        console.log('Asos', subject, date);
        payload = await parseAsos(body, date);
      }
      payload.forEach((item) => {
        items.push(item);
      });
      saveData = true;
    } catch (error) {
      console.log(error);
    }
  } else if (
    subject.toLowerCase().includes('Thank you for your order'.toLowerCase())
  ) {
    //COS
    try {
      const payload = await parseCOS(body, date);
      payload.forEach((item) => {
        items.push(item);
      });
      saveData = true;
    } catch (error) {
      console.log(error);
    }
  } else if (
    subject.toLowerCase().includes("We've got your order".toLowerCase())
  ) {
    //New Look
    try {
      const payload = await parseNewLook(body, date);
      payload.forEach((item) => {
        items.push(item);
      });
      saveData = true;
    } catch (error) {
      console.log(error);
    }
  } else if (
    subject.toLowerCase().includes('Your order confirmation'.toLowerCase())
  ) {
    console.log('Pretty Little Thing', subject, date);
    //PrettyLittleThing
    parsePrettyLittleThing();
  } else if (subject.toLowerCase().includes('in the bag'.toLowerCase())) {
    console.log('Boohoo', subject, date);
    //Boohoo
    parseBoohoo();
  } else if (
    subject
      .toLowerCase()
      .includes('Thank you for shopping at MANGO'.toLowerCase())
  ) {
    console.log('Mango', subject, date);
    //Mango
    try {
      const payload = await parseMango(body, date);
      payload.forEach((item) => {
        items.push(item);
      });
      saveData = true;
    } catch (error) {
      console.log(error);
    }
  } else if (
    subject
      .toLowerCase()
      .includes('Missguided: Order Confirmation'.toLowerCase())
  ) {
    console.log('Missguided', subject, date);
    //Missguided
    parseMissguided();
  } else if (
    subject.toLowerCase().includes('We have received your order'.toLowerCase())
  ) {
    console.log('Na-Kd', subject, date);
    // NA-KD
    parseNAKD();
  } else if (
    subject
      .toLowerCase()
      .includes('Your I SAW IT FIRST Order Confirmation'.toLowerCase())
  ) {
    console.log('I saw it first', subject, date);
    // I SAW IT FIRST
    parseISawFirst();
  } else if (
    subject.toLowerCase().includes('Order confirmation'.toLowerCase())
  ) {
    if (body.toLowerCase().includes('other stories')) {
      console.log('&other stories', subject, date);
      // & Other Stories
      parseOtherStories();
    } else if (
      body.toLowerCase().includes('for more information about arket')
    ) {
      console.log('Arket', subject, date);
      // Arket
      try {
        const payload = await parseArket(body, date);
        payload.forEach((item) => {
          items.push(item);
        });
        saveData = true;
      } catch (error) {
        console.log(error);
      }
    } else if (
      body.toLowerCase().includes('thank you for shopping at weekday')
    ) {
      console.log('Weekday', subject, date);
      // Weekday
      try {
        const payload = await parseWeekday(body, date);
        payload.forEach((item) => {
          items.push(item);
        });
        saveData = true;
      } catch (error) {
        console.log(error);
      }
    } else if (body.toLowerCase().includes('river island')) {
      console.log('River Island', subject, date);
      // River Island
      try {
        const payload = await parseRiverIsland(body, date);
        payload.forEach((item) => {
          items.push(item);
        });
        saveData = true;
      } catch (error) {
        console.log(error);
      }
    } else if (subject.toLowerCase().includes('HouseofCB'.toLowerCase())) {
      // House of CB
      console.log('House of CB', subject, date);
      parseHouseOfCB();
    } else if (body.toLowerCase().includes('bershka')) {
      //Bershka
      console.log('Bershka new', subject, date);
      parseBershka();
    } else {
      //H&M
      console.log('H&M', subject, date);
      parseHM();
    }
  } else if (
    subject
      .toLowerCase()
      .includes('Thank you! Your order has been received'.toLowerCase())
  ) {
    console.log('Uniqlo', subject, date);
    // Uniqlo
    parseUniqlo();
  } else if (subject.toLowerCase().match(/order \d* confirmed/gm)) {
    // Bershka
    console.log('Bershka', subject, date);
    parseBershka();
  } else if (
    subject
      .toLowerCase()
      .includes(
        'Thank you for your purchase! Confirmation of order no.'.toLowerCase()
      )
  ) {
    console.log('Pull&Bear', subject, date);
    // Pull&Bear
    parsePullBear();
  } else if (
    subject
      .toLowerCase()
      .includes('Thank you for your purchase at Mango'.toLowerCase())
  ) {
    //Mango
    console.log('Mango', subject, date);
    try {
      const payload = await parseMango(body, date);
      payload.forEach((item) => {
        items.push(item);
      });
      saveData = true;
    } catch (error) {
      console.log(error);
    }
  } else if (
    subject.toLowerCase().includes('Thank you for your purchase'.toLowerCase())
  ) {
    //ZARA
    console.log('Zara', subject, date);
    try {
      const payload = await parseZara(body, date);
      payload.forEach((item) => {
        items.push(item);
      });
      saveData = true;
    } catch (error) {
      console.log(error);
    }
  } else if (
    subject.toLowerCase().includes('We got your order!'.toLowerCase())
  ) {
    // Monki
    console.log('Monki', subject, date);
    // TODO update sizechart for smaller increments for Monki's sake
    parseMonki();
  } else if (
    subject.toLowerCase().includes('Thanks for your purchase'.toLowerCase())
  ) {
    // Stradivarius
    console.log('Stradivarius', subject, date);
    parseStradivarius();
  } else if (
    subject.toLowerCase().includes('Confirmation of order nº'.toLowerCase())
  ) {
    // Massimo Dutti
    console.log('Massimo Dutti', subject, date);
    parseMassimoDutti();
  } else if (
    subject.toLowerCase().includes('Thanks for shopping with us'.toLowerCase())
  ) {
    // M&S
    console.log('M&S', subject, date);
    parseMS();
  }

  if (saveData) {
    if (items.length == 0) {
      // var messages =  await storageGet(config.keys.emailFails) ?? [];
      // messages.push({body: body, subject: subject});
      // await storageSet({key: config.keys.emailFails, value: messages});
    } else {
      console.log('items found in email', items);
      saveProducts(items, sender);
    }
  }
};

async function saveProducts(items: Product[], sender) {
  let new_items = 0;

  const products = (await storageGet<Product[]>(config.keys.products)) ?? [];
  const newProducts: Product[] = [];
  items.forEach((element) => {
    try {
      if (element.size && element.name) {
        element.size = element.size
          ?.replaceAll(' ', '')
          .replaceAll('\r', '')
          .replaceAll('\n', '');
        element.name = element.name?.replaceAll('\r', '').replaceAll('\n', '');
        const duplicate = products?.filter(
          (x) => x.name == element.name && x.size == element.size
        );
        if (element.name && element.size) {
          element.category = getCategory(element.name);
          if (element.category) {
            new_items++;
            if (!duplicate || duplicate.length == 0) {
              newProducts.push(element);
            }
          } else if (element.name.match(/^\s+$/) === null) {
            const message =
              'unknown category: ' +
              element.name +
              ' -- ' +
              element.brandName +
              ' ' +
              element.date;
            console.log('%c ' + message, 'background: #222; color: #bada55');
          }
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  });

  console.log(
    'these are the NEW items found in this pass of the email search',
    newProducts
  );

  totalFound += new_items;
  try {
    await storageSet(config.keys.receiptsCount, totalFound);
    await storageSet(config.keys.products, products.concat(newProducts));
    chrome.runtime.sendMessage(
      new ExtensionMessage(config.keys.productsSaved, {
        success: true,
        data: totalFound,
        sender: sender.id,
      })
    );
  } catch (error) {
    console.log('£ hmmm:', error);
  }
}
