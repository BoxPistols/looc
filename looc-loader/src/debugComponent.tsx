import React from "react";
import { setDefaultValues, PrimitiveType, PropsInterface } from "./helpers";

const defaultDebugPropTypes = {
  isChecked1: "boolean",
  count1: "number",
  text1: "string",
  isChecked2: "boolean",
  count2: "number",
  text2: "string",
  isChecked3: "boolean",
  count3: "number",
  text3: "string",
  arr: ["number"] as [PrimitiveType],
  choice: ["number", "number"] as PrimitiveType[],
  complex: {
    a: "number",
    b: "string",
  },
};

const defaultDebugProps = setDefaultValues(
  defaultDebugPropTypes as PropsInterface
);

export const DebugComponent = (props: typeof defaultDebugProps.props) => {
  console.log("Debug props:", props);
  return (
    <div>
      <div>isChecked1: {props.isChecked1 ? "CHECKED" : "UNCHECKED"}</div>
      <div>number1: {props.count1}</div>
      <div>text1: {props.text1}</div>
      <div>isChecked2: {props.isChecked2 ? "CHECKED" : "UNCHECKED"}</div>
      <div>number2: {props.count2}</div>
      <div>text2: {props.text2}</div>
      <div>isChecked3: {props.isChecked3 ? "CHECKED" : "UNCHECKED"}</div>
      <div>number3: {props.count3}</div>
      <div>text3: {props.text3}</div>
      <div>arr sum: {props.arr.reduce((a: number, b: number) => a + b)}</div>
      <div>choice: {props.choice}</div>
      <div>complex a: {props.complex.a}</div>
      <div>complex b: {props.complex.b}</div>
    </div>
  );
};

export const debugLoaderProps = __DEBUG__
  ? {
      debugComponent: {
        component: DebugComponent,
      },
      debugPropTypes: defaultDebugPropTypes,
      debugPropValues: defaultDebugProps,
    }
  : {};
