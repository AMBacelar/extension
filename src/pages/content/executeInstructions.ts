import {
  getMaterialCharacteristic,
  getMaterialsFromString,
} from '../../../utils/materials';
import {
  Product,
  calculateSize,
  getCategory,
} from '../../../utils/calculateSize';
import { Brand, config } from '../../../utils/config';
import { Instruction, InstructionType } from '../../../utils/instructions';
import { elementAppear, forSeconds, storageGet } from '../../../utils/misc';

const functionLibrary = {
  HM_breadcrumbs: (breadcrumbs: unknown) => {
    if (typeof breadcrumbs !== 'string') return false;
    const breadcrumbArray = breadcrumbs.split('/');
    if (breadcrumbArray.length < 3) {
      return true;
    } else {
      if (
        breadcrumbs.toLowerCase().includes('women') ||
        breadcrumbs.toLowerCase().includes('divided')
      ) {
        return true;
      }
    }
    return false;
  },
  ASOS_Brandcheck: (brand: unknown) => {
    if (typeof brand !== 'string') return false;
    const index = config.validAsosBrands.findIndex((value) =>
      brand.toLowerCase().includes(value.toLowerCase())
    );
    if (index >= 0) return true;
    return false;
  },
} as const;

let profileInfo: { name?: string; email?: string };

async function getProfileInfo() {
  profileInfo = await storageGet(config.keys.user);
}

export const checkPage = async (instructions: Instruction[]) => {
  console.log('check page is now running', instructions);
  if (instructions.length === 0) return false;

  const variables: {
    [key: string]: string | boolean;
  } = {};

  for (let index = 0; index < instructions.length; index++) {
    const instruction = instructions[index];
    if (instruction.type === InstructionType.waitForSeconds) {
      await forSeconds(instruction.value);
    }
    if (instruction.type === InstructionType.getSpecificNodeByIndex) {
      const elementList = document.querySelectorAll(instruction.selector);
      if (elementList.length > instruction.i) {
        const textContent = elementList[instruction.i].textContent;
        variables[instruction.name] = textContent ? textContent.trim() : false;
      } else {
        variables[instruction.name] = false;
      }
    }
    if (instruction.type === InstructionType.doesElementExist) {
      const element = await elementAppear(instruction.selector);
      if (typeof element != 'undefined' && element != null) {
        variables[instruction.name] = true;
      } else {
        variables[instruction.name] = false;
      }
    }
    if (instruction.type === InstructionType.getElementTextContent) {
      try {
        const element = await elementAppear(instruction.selector);
        if (typeof element != 'undefined' && element != null) {
          const textContent = element.textContent;
          variables[instruction.name] = textContent
            ? textContent.trim()
            : false;
        } else {
          variables[instruction.name] = false;
        }
      } catch {
        variables[instruction.name] = false;
      }
    }
    if (
      instruction.type === InstructionType.runLibraryFunctionOnStoredVariable
    ) {
      // validate that instruction.name exists in the library
      const functionName = instruction.name;
      const validFunctionNames = Object.keys(functionLibrary) as Array<
        keyof typeof functionLibrary
      >;

      const index = Object.keys(functionLibrary).indexOf(functionName);
      if (index >= 0) {
        variables[instruction.targetVariable] = functionLibrary[
          validFunctionNames[index]
        ](variables[instruction.targetVariable]);
      } else {
        variables[instruction.targetVariable] = false;
      }
    }
    if (instruction.type === InstructionType.surrenderToNext) {
      let data;
      const test = ((window as any)['shotData'].text as string).replaceAll(
        ';',
        ''
      );
      const lines = test.split('\n').map((line) => line.trim());
      for (let index = 0; index < lines.length; index++) {
        if (lines[index].includes('shotData')) {
          try {
            const toParse = lines[index].slice(lines[index].indexOf('{'));
            data = JSON.parse(toParse);
            break;
          } catch {
            /* empty */
          }
        }
      }
      variables['product-title'] = data.Styles[0].StyleName;
      variables['brand'] = data.Styles[0].Brand === 'Next' ? 'Next' : false;
    }
  }
  for (const key in variables) {
    if (variables[key] === false) return false;
    if (key === 'product-title') {
      const category = getCategory(variables[key] as string);
      if (!category) {
        return false;
      }
    }
  }
  console.log('check page is now done');

  return true;
};

export const loadUserData = async (
  instructions: Instruction[],
  brand: Brand
) => {
  return new Promise<{
    current_size: string;
    pastsize: string;
    material: string;
    efitter_name: string;
    efitter_products: Product[];
    efitter_styleGuru?: string;
    efitter_email: string;
    efitter_productName: string | boolean;
    efitter_sizeFromPage: string | boolean;
    efitter_category: string | boolean;
  }>((resolve, reject) => {
    (async () => {
      try {
        console.log('time to hydrate Landbot info, checking product name');
        if (!profileInfo) {
          await getProfileInfo();
        }

        const variables: {
          [key: string]: string | boolean;
        } = {};

        for (let index = 0; index < instructions.length; index++) {
          const instruction = instructions[index];
          if (instruction.type === 'waitForSeconds') {
            await forSeconds(instruction.value);
          }
          if (instruction.type === 'getElementTextContent') {
            const element = document.querySelector(instruction.selector);
            if (typeof element != 'undefined' && element != null) {
              variables[instruction.name] = element.textContent.trim();
              console.log(
                variables[instruction.name],
                element.textContent.trim()
              );
              if (instruction.name === 'product-title') {
                const category = getCategory(element.textContent);
                if (category) {
                  variables['category'] = category;
                }
              }
            } else {
              variables[instruction.name] = false;
            }
          }
          if (instruction.type === 'getElementTextContentShadowRoot') {
            let element = document.querySelector('body');
            for (let index = 0; index < instruction.selector.length; index++) {
              const selector = instruction.selector[index];
              if (selector.shadow) {
                element = element.shadowRoot.querySelector(selector.selector);
              } else {
                element = element.querySelector(selector.selector);
              }
            }

            if (typeof element != 'undefined' && element != null) {
              variables[instruction.name] = element.textContent.trim();

              if (instruction.name === 'product-title') {
                const category = getCategory(element.textContent);
                if (category) {
                  variables['category'] = category;
                }
              }
            } else {
              variables[instruction.name] = false;
            }
          }
          if (instruction.type === 'getElementTextContentComplex') {
            let element = document.querySelector('body');
            for (let index = 0; index < instruction.selector.length; index++) {
              const selector = instruction.selector[index];
              if (selector.shadow) {
                if (selector.index) {
                  element = element.shadowRoot.querySelectorAll(
                    selector.selector
                  )[selector.index];
                } else {
                  element = element.shadowRoot.querySelector(selector.selector);
                }
              } else {
                if (selector.index) {
                  element = element.querySelectorAll(selector.selector)[
                    selector.index
                  ];
                } else {
                  element = element.querySelector(selector.selector);
                }
              }
            }

            if (typeof element != 'undefined' && element != null) {
              variables[instruction.name] = element.textContent.trim();

              if (instruction.name === 'product-title') {
                const category = getCategory(element.textContent);
                if (category) {
                  variables['category'] = category;
                }
              }
            } else {
              variables[instruction.name] = false;
            }
          }
          if (instruction.type === 'clickOnElement') {
            const element = document.querySelector(instruction.selector);
            if (typeof element != 'undefined' && element != null) {
              element.click();
              await forSeconds(instruction.waitFor);
            } else {
              variables[instruction.name] = false;
            }
          }
          if (instruction.type === 'ClickOnElementShadowRoot') {
            let element = document.querySelector('body');
            for (let index = 0; index < instruction.selector.length; index++) {
              const selector = instruction.selector[index];
              if (selector.shadow) {
                element = element.shadowRoot.querySelector(selector.selector);
              } else {
                element = element.querySelector(selector.selector);
              }
            }

            if (typeof element != 'undefined' && element != null) {
              element.click();
              await forSeconds(instruction.waitFor);
            } else {
              variables[instruction.name] = false;
            }
          }
          if (instruction.type === 'clickOnElementComplex') {
            let element = document.querySelector('body');
            for (let index = 0; index < instruction.selector.length; index++) {
              const selector = instruction.selector[index];
              if (selector.shadow) {
                if (selector.index) {
                  element = element.shadowRoot.querySelectorAll(
                    selector.selector
                  )[selector.index];
                } else {
                  element = element.shadowRoot.querySelector(selector.selector);
                }
              } else {
                if (selector.index) {
                  element = element.querySelectorAll(selector.selector)[
                    selector.index
                  ];
                  console.log(element);
                } else {
                  console.log(element);
                  element = element.querySelector(selector.selector);
                }
              }
            }

            if (typeof element != 'undefined' && element != null) {
              element.click();
              await forSeconds(instruction.waitFor);
            } else {
              variables[instruction.name] = false;
            }
          }
          if (instruction.type === 'runLibraryFunctionOnStoredVariable') {
            variables[instruction.targetVariable] = functionLibrary[
              instruction.name
            ](variables[instruction.targetVariable]);
          }
          if (instruction.type === 'searchForSpecificNode') {
            const elementList = document.querySelectorAll(instruction.selector);
            for (let i = 0; i < elementList.length; i++) {
              if (elementList[i].textContent.includes(instruction.verifier)) {
                variables[instruction.name] = elementList[i].textContent;
              }
            }
          }
          if (instruction.type === 'getSpecificNodeByIndex') {
            const elementList = document.querySelectorAll(instruction.selector);
            variables[instruction.name] =
              elementList[instruction.i].textContent;
          }
          if (instruction.type === 'runTextReplaceOnVariable') {
            variables[instruction.targetVariable] = variables[
              instruction.targetVariable
            ]
              .replace(instruction.search, instruction.target)
              .trim();
          }
          if (instruction.type === 'getMaterialFromStoredVariable') {
            variables['materials'] = getMaterialsFromString(
              variables[instruction.variable]
            );
          }
          if (instruction.type === 'surrenderToNext') {
            let data;
            let target;
            const test = window['shotData'].text.replaceAll(';', '');
            const lines = test.split('\n').map((line) => line.trim());
            for (let index = 0; index < lines.length; index++) {
              if (lines[index].includes('shotData')) {
                try {
                  target = lines[index].slice(lines[index].indexOf('{'));
                  data = JSON.parse(target);
                  break;
                } catch {
                  continue;
                }
              }
            }

            variables['product-title'] = data.Styles[0].StyleName;
            variables['category'] = getCategory(data.Styles[0].StyleName);
            variables['attribute-list'] =
              data.Styles[0].Fits[0].Items[0].Composition || target;
            variables['brand'] =
              data.Styles[0].Brand === 'Next' ? 'Next' : false;
          }
        }

        const result = await calculateSize({
          name: variables['product-title'],
          brand,
          category: variables['category'],
          sizeExample: variables['size'],
        });

        result.material = getMaterialCharacteristic(variables['materials']);

        const values = {
          current_size: result.size,
          pastsize: result.pastsize,
          material: result.material,
          efitter_name: profileInfo?.name || '',
          efitter_products:
            (await storageGet<Product[]>(config.keys.products)) || [],
          efitter_styleGuru:
            (await storageGet(config.keys.styleGuruArchetype)) || '',

          efitter_email: profileInfo?.email || '',
          efitter_productName: variables['product-title'],
          efitter_sizeFromPage: variables['size'],
          efitter_category: variables['category'],
        };

        resolve(values);
      } catch (error) {
        reject(error);
      }
    })();
  });
};
