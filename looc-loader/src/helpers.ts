export enum ArrayType {
  String,
  Number,
  Boolean,
  Nothing,
}

export enum PrimitiveType {
  String = "string",
  Boolean = "boolean",
  Number = "number",
  Nothing = "nothing",
}

export interface Interfaces {
  [name: string]: PropsInterface;
}

export interface PropsInterface {
  [prop: string]:
    | PrimitiveType
    | [PrimitiveType]
    | [PrimitiveType, PrimitiveType]
    | PropsInterface;
}

export type PropType = PropsInterface[keyof PropsInterface];

export const isString = (t: PropType): t is PrimitiveType.String => {
  return t === PrimitiveType.String;
};

export const isBoolean = (t: PropType): t is PrimitiveType.Boolean => {
  return t === PrimitiveType.Boolean;
};

export const isNumber = (t: PropType): t is PrimitiveType.Number => {
  return t === PrimitiveType.Number;
};

export const isStringArray = (t: PropType): t is [PrimitiveType.String] => {
  return Array.isArray(t) && t.length === 1 && t[0] === PrimitiveType.String;
};

export const isNumberArray = (t: PropType): t is [PrimitiveType.Number] => {
  return Array.isArray(t) && t.length === 1 && t[0] === PrimitiveType.Number;
};

export const isBoolArray = (t: PropType): t is [PrimitiveType.Boolean] => {
  return Array.isArray(t) && t.length === 1 && t[0] === PrimitiveType.Boolean;
};

export const isStringUnion = (
  t: PropType
): t is [PrimitiveType.String, PrimitiveType.String] => {
  return Array.isArray(t) && t.length === 2 && t[0] === PrimitiveType.String;
};

export const isNumberUnion = (
  t: PropType
): t is [PrimitiveType.Number, PrimitiveType.Number] => {
  return Array.isArray(t) && t.length === 2 && t[0] === PrimitiveType.Number;
};

export const isInterface = (t: PropType): t is PropsInterface => {
  return typeof t === "object" && t !== null && !Array.isArray(t);
};

export const getPropTypesByComponent = (componentName: string) => (
  interfaces: Interfaces
) => {
  const propTypes = `${componentName}Props`;
  return interfaces[propTypes];
};
