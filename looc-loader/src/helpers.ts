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
    | string[]
    | number[]
    | PropsInterface;
}

export type PropType = PropsInterface[keyof PropsInterface];

export const setDefaultValues = (propTypes: PropsInterface) => {
  const defaultProps: any = {};
  const unions: any = {};
  for (const [prop, type] of Object.entries(propTypes)) {
    if (isNumber(type)) defaultProps[prop] = 0;
    if (isBoolean(type)) defaultProps[prop] = false;
    if (isString(type)) defaultProps[prop] = "Text";
    if (isNumberArray(type)) defaultProps[prop] = [1, 2, 3];
    if (isStringArray(type)) defaultProps[prop] = ["Text", "Text", "Text"];
    if (isBoolArray(type)) defaultProps[prop] = [true, true, true];
    if (isStringUnion(type)) {
      defaultProps[prop] = "Variant1";
      unions[prop] = ["Variant1", "Variant2"];
    }
    if (isNumberUnion(type)) {
      defaultProps[prop] = 0;
      unions[prop] = [0, 1];
    }
    if (isStringLiteralUnion(type) || isNumberLiteralUnion(type)) {
      defaultProps[prop] = type[0];
      unions[prop] = type;
    }
    if (isInterface(type)) defaultProps[prop] = setDefaultValues(type).props;
  }
  return { unions, props: defaultProps };
};

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

export const isStringLiteralUnion = (t: PropType): t is string[] => {
  return (
    Array.isArray(t) &&
    t.length > 1 &&
    typeof t[0] === "string" &&
    t[0] !== PrimitiveType.String &&
    t[0] !== PrimitiveType.Number
  );
};

export const isStringUnion = (t: PropType): t is PrimitiveType.String[] => {
  return Array.isArray(t) && t.length > 1 && t[0] === PrimitiveType.String;
};

export const isNumberLiteralUnion = (t: PropType): t is number[] => {
  return Array.isArray(t) && t.length > 1 && typeof t[0] === "number";
};

export const isNumberUnion = (t: PropType): t is PrimitiveType.Number[] => {
  return Array.isArray(t) && t.length > 1 && t[0] === PrimitiveType.Number;
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
