import { Brand } from './config';

export const InstructionType = {
  waitForSeconds: 'waitForSeconds',
  doesElementExist: 'doesElementExist',
  doesElementExistShadowRoot: 'doesElementExistShadowRoot',
  getElementTextContent: 'getElementTextContent',
  getElementTextContentShadowRoot: 'getElementTextContentShadowRoot',
  getElementTextContentComplex: 'getElementTextContentComplex',
  clickOnElement: 'clickOnElement',
  clickOnElementShadowRoot: 'clickOnElementShadowRoot',
  clickOnElementComplex: 'clickOnElementComplex',
  getMaterialFromStoredVariable: 'getMaterialFromStoredVariable',
  runLibraryFunctionOnStoredVariable: 'runLibraryFunctionOnStoredVariable',
  searchForSpecificNode: 'searchForSpecificNode',
  getSpecificNodeByIndex: 'getSpecificNodeByIndex',
  runTextReplaceOnVariable: 'runTextReplaceOnVariable',
  concatenateVariables: 'concatenateVariables',
  surrenderToNext: 'surrenderToNext',
  urlIncludes: 'urlIncludes',
} as const;

export type InstructionCore = {
  index: number;
};

type WaitForSeconds = InstructionCore & {
  value: number;
  type: 'waitForSeconds';
};

type UrlIncludes = InstructionCore & {
  searchString: string;
  type: 'urlIncludes';
};

type GetElementTextContent = InstructionCore & {
  name: string;
  selector: string;
  type: 'getElementTextContent';
};

type ShadowSelector = { shadow: boolean; selector: string };
type GetElementTextContentShadowRoot = InstructionCore & {
  selector: ShadowSelector[];
  type: 'getElementTextContentShadowRoot';
};

type ComplexSelector = ShadowSelector & { index?: number };
type GetElementTextContentComplex = InstructionCore & {
  selector: ComplexSelector[];
  type: 'getElementTextContentComplex';
};

type ClickOnElementComplex = InstructionCore & {
  selector: ComplexSelector[];
  type: 'clickOnElementComplex';
};

type DoesElementExist = InstructionCore & {
  name: string;
  selector: string;
  waitFor: number;
  type: 'doesElementExist';
};

type DoesElementExistShadowRoot = InstructionCore & {
  name: string;
  selector: ShadowSelector[];
  waitFor: number;
  type: 'doesElementExistShadowRoot';
};

type ClickOnElement = InstructionCore & {
  selector: string;
  waitFor: number;
  type: 'clickOnElement';
};

type ClickOnElementShadowRoot = InstructionCore & {
  selector: ShadowSelector[];
  waitFor: number;
  type: 'ClickOnElementShadowRoot';
};

type SearchForSpecificNode = InstructionCore & {
  name: string;
  selector: string;
  verifier: string;
  type: 'searchForSpecificNode';
};

type GetSpecificNodeByIndex = InstructionCore & {
  name: string;
  selector: string;
  i: number;
  type: 'getSpecificNodeByIndex';
};

type GetMaterialFromStoredVariable = InstructionCore & {
  variable: string;
  type: 'getMaterialFromStoredVariable';
};

type RunLibraryFunctionOnStoredVariable = InstructionCore & {
  targetVariable: string;
  name: string;
  type: 'runLibraryFunctionOnStoredVariable';
};

type surrenderToNext = InstructionCore & {
  type: 'surrenderToNext';
};

type RunTextReplaceOnVariable = InstructionCore & {
  targetVariable: string;
  search: string | RegExp;
  target: string;
  type: 'runTextReplaceOnVariable';
};

type ConcatenateVariables = InstructionCore & {
  name: string;
  a: string;
  b: string;
  type: 'concatenateVariables';
};

export type Instruction =
  | WaitForSeconds
  | UrlIncludes
  | GetElementTextContent
  | GetElementTextContentShadowRoot
  | GetElementTextContentComplex
  | DoesElementExist
  | DoesElementExistShadowRoot
  | ClickOnElement
  | ClickOnElementShadowRoot
  | ClickOnElementComplex
  | GetMaterialFromStoredVariable
  | RunLibraryFunctionOnStoredVariable
  | SearchForSpecificNode
  | GetSpecificNodeByIndex
  | surrenderToNext
  | RunTextReplaceOnVariable
  | ConcatenateVariables;

export type InstructionsResponse = {
  toCheckPage: Instruction[];
  toLoadUserData: Instruction[];
  brand: Brand;
};
