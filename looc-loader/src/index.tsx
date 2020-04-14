import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  getPropTypesByComponent,
  isString,
  isBoolean,
  isNumber,
  isStringArray,
  isNumberArray,
  isBoolArray,
  isInterface,
  PropsInterface,
  PropType,
  PrimitiveType,
} from "/helpers.js";

declare global {
  const __DEBUG__: boolean;
}

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

const setDefaultValues = (propTypes: PropsInterface) => {
  const defaultProps: any = {};
  for (const [prop, type] of Object.entries(propTypes)) {
    if (isNumber(type)) defaultProps[prop] = 0;
    if (isBoolean(type)) defaultProps[prop] = false;
    if (isString(type)) defaultProps[prop] = "Text";
    if (isNumberArray(type)) defaultProps[prop] = [0, 1, 2];
    if (isStringArray(type)) defaultProps[prop] = ["Text", "Text", "Text"];
    if (isBoolArray(type)) defaultProps[prop] = [true, true, true];
    if (isInterface(type)) defaultProps[prop] = setDefaultValues(type);
  }
  return defaultProps;
};

export const Loader: React.FC<typeof debugLoaderProps> = ({
  debugProps,
  debugPropTypes,
  debugComponent,
}: any) => {
  const [imports, setImports] = useState<{ component: React.FC } | null>(
    debugComponent || null
  );
  const [propTypes, setPropTypes] = useState<PropsInterface | null>(
    debugPropTypes || null
  );
  const [props, setProps] = useState(debugProps || {});

  const createInputs = (propTypes: PropsInterface) => {
    const inputs: JSX.Element[] = [];

    const getInputType = (type: PropType) => {
      if (isNumber(type)) return { type: "number", isArray: false };
      if (isBoolean(type)) return { type: "checkbox", isArray: false };
      if (isString(type)) return { type: "text", isArray: false };
      if (isStringArray(type)) return { type: "text", isArray: true };
      if (isNumberArray(type)) return { type: "number", isArray: true };
      return { type: "unknown", isArray: false };
    };

    const createCheckboxInput = (handleChange: ChangeHandler) => (
      <input
        type="checkbox"
        defaultChecked={false}
        onChange={handleChange}
      ></input>
    );

    const createNumberInput = (handleChange: ChangeHandler) => (
      <input type="number" defaultValue={"0"} onChange={handleChange}></input>
    );

    const createNumericTextInput = (handleChange: ChangeHandler) => (
      <input type="text" onChange={handleChange} defaultValue={"1, 2, 3"} />
    );

    const createTextInput = (handleChange: ChangeHandler, isArray: boolean) => (
      <input
        type="text"
        onChange={handleChange}
        defaultValue={isArray ? "Text, Text, Text" : "Text"}
      />
    );

    const createGenericTextInput = (
      handleChange: ChangeHandler,
      defaultValue: any
    ) => (
      <input type="text" onChange={handleChange} defaultValue={defaultValue} />
    );

    for (const [prop, type] of Object.entries(propTypes)) {
      console.log("type", type);
      const { type: inputType, isArray } = getInputType(type);
      const input = (() => {
        switch (inputType) {
          case "checkbox": {
            const handleChange: ChangeHandler = (e) => {
              setProps({ ...props, [prop]: e.target.checked });
            };

            return createCheckboxInput(handleChange);
          }

          case "text": {
            const handleChange: ChangeHandler = (e) => {
              const value = isArray
                ? e.target.value.split(",")
                : e.target.value;
              setProps({ ...props, [prop]: value });
            };

            return createTextInput(handleChange, isArray);
          }

          case "number": {
            const handleChange: ChangeHandler = (e) => {
              const value = isArray
                ? e.target.value.split(",").map(Number)
                : Number(e.target.value);
              setProps({ ...props, [prop]: value });
            };

            if (isArray) return createNumericTextInput(handleChange);

            return createNumberInput(handleChange);
          }

          default: {
            const handleChange: ChangeHandler = (e) =>
              setProps({
                ...props,
                [prop]: JSON.parse(e.target.value),
              });

            console.log(type);

            return createGenericTextInput(handleChange, JSON.stringify(type));
          }
        }
      })();

      inputs.push(
        <div className="looc-css-form">
          <label>{prop}</label>
          {input}
        </div>
      );
    }
    return inputs;
  };

  useEffect(() => {
    if (!__DEBUG__) {
      const loadComponent = async () => {
        const response = await fetch("data.json");
        const data = await response.json();
        return import(`/${data.filepath}`)
          .then(({ default: component }) => {
            console.log(`Successfully imported ${data.filepath}!`);

            const propTypes = getPropTypesByComponent(component.name)(
              data.interfaces
            );

            setPropTypes(propTypes);
            setImports({ component });
            setProps(setDefaultValues(propTypes));
          })
          .catch((e) =>
            console.log(`There was a problem importing ${data.filepath}!`, e)
          );
      };

      loadComponent();
    }
  }, []);

  if (!imports) return null;

  const { component: Component } = imports;

  return (
    <>
      <Component __LOOC_DEBUG__ {...props} />
      <div className="looc-css-container">{createInputs(propTypes!)}</div>
    </>
  );
};

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
  complex: {
    a: "number",
    b: "string",
  },
};

const defaultDebugProps = setDefaultValues(
  defaultDebugPropTypes as PropsInterface
);

const DebugComponent = (props: typeof defaultDebugProps) => {
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
      <div>complex a: {props.complex.a}</div>
      <div>complex b: {props.complex.b}</div>
    </div>
  );
};

const debugLoaderProps = {
  debugComponent: {
    component: DebugComponent,
  },
  debugPropTypes: defaultDebugPropTypes,
  debugProps: defaultDebugProps,
};

ReactDOM.render(
  <Loader {...debugLoaderProps} />,
  document.getElementById("root")
);
