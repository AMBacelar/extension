type BaseNode = {
  text: string;
  next: number;
};

type EndNode = {
  text: string;
};

type ImageNode = BaseNode & {
  image: string;
};

type QestionNode = BaseNode & {
  options: Option[];
};

type Option = {
  text: string;
  next: number;
};

export type Node = BaseNode | EndNode | ImageNode | QestionNode;
export type ChatFlow = {
  [key: string]: Node;
};

export const surveyLink = 'https://efitter.typeform.com/to/ia9tgq1C';

export const happyFlow: ChatFlow = {
  1: {
    image: 'https://media.giphy.com/media/ELUtlbLMx8K0U/giphy.gif',
    text: 'Hey!',
    next: 2,
  },
  2: {
    text: "Hey! 👋  I'm efitter. I'm here to help you shop 😁",
    next: 3,
  },
  3: {
    text: 'How can I help you?',
    options: [
      {
        text: 'Which size is best for me?',
        next: 4,
      },
      {
        text: 'What is the material like?',
        next: 13,
      },
    ],
  },
  4: {
    text: 'Based on your shopping history and size at other retailers...',
    next: 5,
  },
  5: {
    text: 'Size {{current_size}} should fit you fine!',
    next: 6,
  },
  6: {
    text: 'Does this prediction seem right to you?',
    options: [
      {
        text: "It's spot on!",
        next: 7,
      },
      {
        text: "Hmm I'm not sure...",
        next: 9,
      },
    ],
  },
  7: {
    image: 'https://media.giphy.com/media/LUhUvH4BsfE9USnlPd/giphy.gif',
    text: 'Yay!',
    next: 8,
  },
  8: {
    text: `Fab! Don't forget to add your item to your basket 💃<br/><br/>To make efitter even better, <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> (we'll email you in a few days in case you want to wait for your items to arrive) 😊`,
    options: [
      {
        text: "What's the material like?",
        next: 10,
      },
    ],
  },
  9: {
    text: `No worries. efitter gets smarter over time so <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> to make it even better 😊`,
    options: [
      {
        text: "What's the material like?",
        next: 10,
      },
    ],
  },
  10: {
    text: '{{materials}}',
    options: [
      {
        text: 'Great!',
        next: 11,
      },
    ],
  },
  11: {
    image: 'https://media.giphy.com/media/azaMjwRFm0vjNSd51t/giphy.gif',
    text: 'Done!',
    next: 12,
  },
  12: {
    text: `Fab! Don't forget to add your item to your basket 💃<br/><br/>To make efitter even better, <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> (we'll email you in a few days in case you want to wait for your items to arrive) 😊`,
  },
  13: {
    text: '{{materials}}',
    options: [
      {
        text: 'Which size is best for me?',
        next: 14,
      },
    ],
  },
  14: {
    text: 'Based on your shopping history and size at other retailers...',
    next: 15,
  },
  15: {
    text: 'Size {{current_size}} should fit you fine!',
    next: 16,
  },
  16: {
    text: 'Does this prediction seem right to you?',
    options: [
      {
        text: "It's spot on!",
        next: 17,
      },
      {
        text: "Hmm I'm not sure...",
        next: 19,
      },
    ],
  },
  17: {
    image: 'https://media.giphy.com/media/LUhUvH4BsfE9USnlPd/giphy.gif',
    text: 'Yay!',
    next: 18,
  },
  18: {
    text: `Fab! Don't forget to add your item to your basket 💃<br/><br/>To make efitter even better, <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> (we'll email you in a few days in case you want to wait for your items to arrive) 😊`,
  },
  19: {
    text: `No worries. efitter gets smarter over time so <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> to make it even better 😊`,
  },
};

export const noProductsFoundFlow: ChatFlow = {
  1: {
    image: 'https://media.giphy.com/media/ELUtlbLMx8K0U/giphy.gif',
    text: 'Hey!',
    next: 2,
  },
  2: {
    text: "Hey! 👋  I'm efitter. I'm here to help you shop 😁",
    next: 3,
  },
  3: {
    text: 'How can I help you?',
    options: [
      {
        text: 'Which size is best for me?',
        next: 4,
      },
      {
        text: 'What is the material like?',
        next: 10,
      },
    ],
  },
  4: {
    image: 'https://media.giphy.com/media/DnOLYNdgPjFVS/giphy.gif',
    text: 'Aww!',
    next: 5,
  },
  5: {
    text: `Uh oh, we can't find any orders from the past 12 months so we can't predict your size just yet.<br/><br/>Have you tried clicking "load more emails" in the extension?`,
    next: 6,
  },
  6: {
    text: `Simply place an order and we'll help you find your size next time!`,
    options: [
      {
        text: 'What is the material like?',
        next: 7,
      },
    ],
  },
  7: {
    text: '{{materials}}',
    options: [
      {
        text: 'Great!',
        next: 8,
      },
    ],
  },
  8: {
    text: `Uh oh, we can't find any orders from the past 12 months so we can't predict your size just yet.<br/><br/>Have you tried clicking "load more emails" in the extension?`,
    next: 9,
  },
  9: {
    image: 'https://media.giphy.com/media/azaMjwRFm0vjNSd51t/giphy.gif',
    text: 'Clap!',
  },
  10: {
    text: '{{materials}}',
    options: [
      {
        text: 'Which size is best for me?',
        next: 11,
      },
    ],
  },
  11: {
    image: 'https://media.giphy.com/media/DnOLYNdgPjFVS/giphy.gif',
    text: 'Aww!',
    next: 12,
  },
  12: {
    text: `Uh oh, we can't find any orders from the past 12 months so we can't predict your size just yet.<br/><br/>Have you tried clicking "load more emails" in the extension?`,
    next: 13,
  },
  13: {
    text: `Simply place an order and we'll help you find your size next time!`,
  },
};

export const sizeUnavailableFlow: ChatFlow = {
  1: {
    image: 'https://media.giphy.com/media/ELUtlbLMx8K0U/giphy.gif',
    text: 'Hey!',
    next: 2,
  },
  2: {
    text: "Hey! 👋  I'm efitter. I'm here to help you shop 😁",
    next: 3,
  },
  3: {
    text: 'How can I help you?',
    options: [
      {
        text: 'Which size is best for me?',
        next: 4,
      },
      {
        text: 'What is the material like?',
        next: 8,
      },
    ],
  },
  4: {
    image: 'https://media.giphy.com/media/6TLUfmT3AXIPK/giphy.gif',
    text: 'hiding',
    next: 5,
  },
  5: {
    text: `We're sorry, your size is unavailable at this store.`,
    next: 6,
  },
  6: {
    text: `We believe in size inclusivity so we will let them know.`,
    options: [
      {
        text: 'What is the material like?',
        next: 7,
      },
    ],
  },
  7: {
    text: '{{materials}}',
  },
  8: {
    text: '{{materials}}',
    options: [
      {
        text: 'Which size is best for me?',
        next: 9,
      },
    ],
  },
  9: {
    image: 'https://media.giphy.com/media/6TLUfmT3AXIPK/giphy.gif',
    text: 'hiding',
    next: 10,
  },
  10: {
    text: `We're sorry, your size is unavailable at this store.`,
    next: 11,
  },
  11: {
    text: `We believe in size inclusivity so we will let them know.`,
  },
};
