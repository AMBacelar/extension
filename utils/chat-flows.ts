import { LegalSize } from './size';

type TextNode = {
  text: string;
  image?: undefined;
  next: string | undefined;
  options?: undefined;
};

type EndNode = {
  text: string;
  image?: undefined;
  next?: undefined;
  options?: undefined;
};

type QuestionNode = {
  text: string;
  image?: undefined;
  next?: undefined;
  options: Option[];
};

type ImageNode = {
  text: string;
  image: string;
  next: string;
  options?: undefined;
};

type Option = {
  text: string;
  next: string;
  payload?: string;
};

export type Node = TextNode | EndNode | ImageNode | QuestionNode;
export type ChatFlow = {
  [key: string]: Node;
};

export const surveyLink = 'https://efitter.typeform.com/to/ia9tgq1C';
const styleGuruLink = 'https://efitter.com/style-guru';

export const chatFlowGenerator = ({
  productsLength,
  productSize,
  productMaterial,
  styleGuruArchetype,
}: {
  productsLength: number;
  productSize: LegalSize;
  productMaterial: string;
  styleGuruArchetype: string;
}): ChatFlow => {
  const generatePrefix = ({
    hasAskedAboutSize,
    hasAskedAboutMaterial,
    hasAskedAboutStyleGuruArchetype,
    wasStyleGuruFetchPrompted,
  }: {
    hasAskedAboutSize: boolean;
    hasAskedAboutMaterial: boolean;
    hasAskedAboutStyleGuruArchetype: boolean;
    wasStyleGuruFetchPrompted: boolean;
  }) => {
    const size = hasAskedAboutSize ? 'YS_' : 'NS_';
    const material = hasAskedAboutMaterial ? 'YM_' : 'NM_';
    const guru = wasStyleGuruFetchPrompted
      ? 'MG_'
      : hasAskedAboutStyleGuruArchetype
      ? 'YG_'
      : 'NG_';
    return `${size}${material}${guru}`;
  };

  const start = {
    '1': {
      image: 'https://media.giphy.com/media/ELUtlbLMx8K0U/giphy.gif',
      text: 'Hey!',
      next: '2',
    },
    '2': {
      text: "Hey! 👋  I'm efitter. I'm here to help you shop 😁",
      next: `${generatePrefix({
        hasAskedAboutSize: false,
        hasAskedAboutMaterial: false,
        hasAskedAboutStyleGuruArchetype: false,
        wasStyleGuruFetchPrompted: false,
      })}root`,
    },
  };

  // basic hash map
  const hashMap = new Map();

  const rootGenerator = ({
    productsLength,
    productSize,
    hasAskedAboutSize,
    productMaterial,
    hasAskedAboutMaterial,
    styleGuruArchetype,
    hasAskedAboutStyleGuruArchetype,
    wasStyleGuruFetchPrompted,
  }: {
    productsLength: number;
    productSize: LegalSize;
    hasAskedAboutSize: boolean;
    productMaterial: string;
    hasAskedAboutMaterial: boolean;
    styleGuruArchetype: string;
    hasAskedAboutStyleGuruArchetype: boolean;
    wasStyleGuruFetchPrompted: boolean;
  }): ChatFlow => {
    const prefix = generatePrefix({
      hasAskedAboutSize,
      hasAskedAboutMaterial,
      hasAskedAboutStyleGuruArchetype,
      wasStyleGuruFetchPrompted,
    });

    let styleGuruResolved = false;

    if (styleGuruArchetype && hasAskedAboutStyleGuruArchetype) {
      styleGuruResolved = true;
    }

    if (hasAskedAboutSize && hasAskedAboutMaterial && styleGuruResolved) {
      // end of journey
      const node = {
        [`${prefix}root`]: {
          text: 'Thank you for using efitter!',
        },
      };
      return { ...node };
    }

    if (hashMap.has(prefix)) {
      return {};
    } else {
      hashMap.set(prefix, true);
    }

    const buildSize = ({
      productsLength,
      productSize,
    }: {
      productsLength: number;
      productSize: LegalSize;
    }): ChatFlow => {
      const postPrefix = generatePrefix({
        hasAskedAboutSize: true,
        hasAskedAboutMaterial,
        hasAskedAboutStyleGuruArchetype,
        wasStyleGuruFetchPrompted,
      });

      // happy flow first
      let chatFlow = {
        ...{
          [`${prefix}size0`]: {
            text: 'Based on your shopping history and size at other retailers...',
            next: `${prefix}size1`,
          },
        },
        ...{
          [`${prefix}size1`]: {
            text: 'Size {{current_size}} should fit you fine!',
            next: `${prefix}size2`,
          },
        },
        ...{
          [`${prefix}size2`]: {
            text: 'Does this prediction seem right to you?',
            options: [
              {
                text: "It's spot on!",
                next: `${prefix}size3`,
              },
              {
                text: "Hmm I'm not sure...",
                next: `${prefix}size5`,
              },
            ],
          },
        },
        ...{
          [`${prefix}size3`]: {
            image: 'https://media.giphy.com/media/LUhUvH4BsfE9USnlPd/giphy.gif',
            text: 'Yay!',
            next: `${prefix}size4`,
          },
        },
        ...{
          [`${prefix}size4`]: {
            text: `Fab! Don't forget to add your item to your basket 💃<br/><br/>To make efitter even better, <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> (we'll email you in a few days in case you want to wait for your items to arrive) 😊`,
            next: `${postPrefix}root`,
          },
        },
        ...{
          [`${prefix}size5`]: {
            text: `No worries. efitter gets smarter over time so <a target="_blank" rel="noopener noreferrer" href="${surveyLink}">please fill out this survey</a> to make it even better 😊`,
            next: `${postPrefix}root`,
          },
        },
      };
      // unhappy flows
      if ((productSize as string) === 'unavailable') {
        chatFlow = {
          ...{
            [`${prefix}size0`]: {
              image: 'https://media.giphy.com/media/6TLUfmT3AXIPK/giphy.gif',
              text: 'Hides!',
              next: `${prefix}size1`,
            },
          },
          ...{
            [`${prefix}size1`]: {
              text: `We're sorry, this product is unavailable in your size.`,
              next: `${prefix}size2`,
            },
          },
          ...{
            [`${prefix}size2`]: {
              text: `We believe in size inclusivity so we will let them know.`,
              next: `${postPrefix}root`,
            },
          },
        };
      }

      if (productsLength === 0) {
        chatFlow = {
          ...{
            [`${prefix}size0`]: {
              image: 'https://media.giphy.com/media/DnOLYNdgPjFVS/giphy.gif',
              text: 'Aww!',
              next: `${prefix}size1`,
            },
          },
          ...{
            [`${prefix}size1`]: {
              text: `Uh oh, we can't find any orders from the past 12 months so we can't predict your size just yet.<br/><br/>Have you tried clicking "load more emails" in the extension?`,
              next: `${prefix}size2`,
            },
          },
          ...{
            [`${prefix}size2`]: {
              text: `Simply place an order and we'll help you find your size next time!`,
              next: `${postPrefix}root`,
            },
          },
        };
      }

      return {
        ...chatFlow,
        ...rootGenerator({
          productsLength,
          productSize,
          hasAskedAboutSize: true,
          productMaterial,
          hasAskedAboutMaterial,
          styleGuruArchetype,
          hasAskedAboutStyleGuruArchetype,
          wasStyleGuruFetchPrompted,
        }),
      };
    };

    const buildMaterial = ({
      productMaterial,
    }: {
      productMaterial: string;
    }): ChatFlow => {
      const postPrefix = generatePrefix({
        hasAskedAboutSize,
        hasAskedAboutMaterial: true,
        hasAskedAboutStyleGuruArchetype,
        wasStyleGuruFetchPrompted,
      });
      const chatFlow = {
        ...{
          [`${prefix}material`]: {
            text: '{{materials}}',
            next: `${postPrefix}root`,
          },
        },
      };

      return {
        ...chatFlow,
        ...rootGenerator({
          productsLength,
          productSize,
          hasAskedAboutSize,
          productMaterial,
          hasAskedAboutMaterial: true,
          styleGuruArchetype,
          hasAskedAboutStyleGuruArchetype,
          wasStyleGuruFetchPrompted,
        }),
      };
    };

    const buildStyleGuruArchetype = ({
      styleGuruArchetype,
      hasAskedAboutStyleGuruArchetype,
      wasStyleGuruFetchPrompted,
    }: {
      styleGuruArchetype: string;
      hasAskedAboutStyleGuruArchetype: boolean;
      wasStyleGuruFetchPrompted: boolean;
    }): ChatFlow => {
      let chatFlow;

      if (styleGuruArchetype) {
        chatFlow = {
          ...{
            [`${prefix}guru0`]: {
              text: 'According to Style Guru, your persona is the {{persona_name}}.',
              next: `${prefix}guru1`,
            },
          },
          ...{
            [`${prefix}guru1`]: {
              text: '{{persona_description}}',
              next: `${prefix}guru2`,
            },
          },
          ...{
            [`${prefix}guru2`]: {
              image: '{{persona_image}}',
              text: '{{persona_name}}',
              next: `${prefix}guru3`,
            },
          },
          ...{
            [`${prefix}guru3`]: {
              text: `Want some tips on how to style your look? Check out your {{persona_name}} <a target="_blank" rel="noopener noreferrer" href="{{persona_wardrobe}}">Capsule Wardrobe</a>`,
              next: `${generatePrefix({
                hasAskedAboutSize,
                hasAskedAboutMaterial,
                hasAskedAboutStyleGuruArchetype: true,
                wasStyleGuruFetchPrompted,
              })}root`,
            },
          },
        };

        return {
          ...chatFlow,
          ...rootGenerator({
            productsLength,
            productSize,
            hasAskedAboutSize,
            productMaterial,
            hasAskedAboutMaterial,
            styleGuruArchetype,
            hasAskedAboutStyleGuruArchetype: true,
            wasStyleGuruFetchPrompted,
          }),
        };
      } else {
        chatFlow = {
          ...{
            [`${prefix}guru0`]: {
              text: 'We don’t have a Style Guru result attached to your account.',
              next: `${prefix}guru1`,
            },
          },
          ...{
            [`${prefix}guru1`]: {
              text: `Take the <a target="_blank" rel="noopener noreferrer" href="${styleGuruLink}">Style Guru</a> quiz to find your persona! Once you’ve completed the quiz, we will help you style your look.`,
              next: `${generatePrefix({
                hasAskedAboutSize,
                hasAskedAboutMaterial,
                hasAskedAboutStyleGuruArchetype,
                wasStyleGuruFetchPrompted: true,
              })}root`,
            },
          },
        };

        return {
          ...chatFlow,
          ...rootGenerator({
            productsLength,
            productSize,
            hasAskedAboutSize,
            productMaterial,
            hasAskedAboutMaterial,
            styleGuruArchetype,
            hasAskedAboutStyleGuruArchetype: true,
            wasStyleGuruFetchPrompted: true,
          }),
        };
      }
    };

    const options = [
      ...[
        // styleGuruArchetype
        ...(wasStyleGuruFetchPrompted
          ? [
              {
                text: 'I have completed the quiz, what is my persona?',
                next: `${generatePrefix({
                  hasAskedAboutSize,
                  hasAskedAboutMaterial,
                  hasAskedAboutStyleGuruArchetype,
                  wasStyleGuruFetchPrompted,
                })}guru0`,
                payload: 'fetchPersona',
              },
            ]
          : []),
      ],
      ...[
        // size
        ...(hasAskedAboutSize
          ? []
          : [
              {
                text: 'Which size is best for me?',
                next: `${prefix}size0`,
              },
            ]),
      ],
      ...[
        // material
        ...(hasAskedAboutMaterial
          ? []
          : [
              {
                text: 'What is the material like?',
                next: `${prefix}material`,
              },
            ]),
      ],
      ...[
        // styleGuruArchetype
        ...(hasAskedAboutStyleGuruArchetype
          ? []
          : [
              {
                text: 'What is my style persona?',
                next: `${prefix}guru0`,
              },
            ]),
      ],
    ];

    const isFirstInteraction = !(
      hasAskedAboutSize ||
      hasAskedAboutMaterial ||
      hasAskedAboutStyleGuruArchetype ||
      wasStyleGuruFetchPrompted
    );

    const node = {
      [`${prefix}root`]: {
        text: isFirstInteraction
          ? 'How can I help you?'
          : 'Is there anything else I can help you with?',
        options,
      },
    };

    return {
      ...node,
      ...{
        ...(hasAskedAboutSize
          ? {}
          : buildSize({ productsLength, productSize })),
      },
      ...{
        ...(hasAskedAboutMaterial ? {} : buildMaterial({ productMaterial })),
      },
      ...{
        ...(styleGuruResolved
          ? {}
          : buildStyleGuruArchetype({
              styleGuruArchetype,
              hasAskedAboutStyleGuruArchetype,
              wasStyleGuruFetchPrompted,
            })),
      },
    };
  };

  const root = rootGenerator({
    productsLength,
    productSize,
    hasAskedAboutSize: false,
    productMaterial,
    hasAskedAboutMaterial: false,
    styleGuruArchetype,
    hasAskedAboutStyleGuruArchetype: false,
    wasStyleGuruFetchPrompted: false,
  });
  return {
    ...start,
    ...root,
  };
};
