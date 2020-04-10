import type { extractInterfaces } from "tsx-ray";

export enum ArrayType {
  String = "string[]",
  Number = "number[]",
  Boolean = "boolean[]",
  Nothing = "nothing",
}

export enum PrimitiveType {
  String = "string",
  Boolean = "boolean",
  Number = "number",
  Nothing = "nothing",
}

export type ObjectType = Record<string, any>;

export type ParsedType = PrimitiveType | ArrayType | ObjectType;

type Interfaces = ReturnType<typeof extractInterfaces>;

export const isString = (t: ParsedType): t is PrimitiveType.String => {
  return t === PrimitiveType.String;
};

export const isBoolean = (t: ParsedType): t is PrimitiveType.Boolean => {
  return t === PrimitiveType.Boolean;
};

export const isNumber = (t: ParsedType): t is PrimitiveType.Number => {
  return t === PrimitiveType.Number;
};

export const isObject = (t: ParsedType): t is ObjectType => {
  return typeof t === "object" && t !== null && !Array.isArray(t);
};

export const getPropTypesByComponent = (componentName: string) => (
  interfaces: Interfaces
) => {
  const propTypes = `${componentName}Props`;
  return interfaces[propTypes];
};
