import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  getPropTypesByComponent,
  isString,
  isBoolean,
  isNumber,
  isObject,
} from "/helpers.js";
import { InterfaceDefinition } from "tsx-ray/dist/types";

declare global {
  const __DEBUG__: boolean;
}

type PropTypes = ReturnType<ReturnType<typeof getPropTypesByComponent>>;
type Property = PropTypes[keyof PropTypes];

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

const setDefaultValues = (propTypes: PropTypes) => {
  const defaultProps: Record<string, number | string | boolean | object> = {};
  for (const [prop, type] of Object.entries(propTypes)) {
    if (isNumber(type)) defaultProps[prop] = 0;
    if (isBoolean(type)) defaultProps[prop] = false;
    if (isString(type)) defaultProps[prop] = "Text";
    if (isObject(type))
      defaultProps[prop] = setDefaultValues(type as PropTypes);
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
  const [propTypes, setPropTypes] = useState<PropTypes | null>(
    debugPropTypes || null
  );
  const [props, setProps] = useState(debugProps || {});

  const createInputs = (propTypes: PropTypes) => {
    const inputs: JSX.Element[] = [];

    const getInputType = (type: Property) => {
      if (isNumber(type)) return "number";
      if (isBoolean(type)) return "checkbox";
      if (isString(type)) return "text";
      return "text";
    };

    const createCheckboxInput = (handleChange: ChangeHandler) => (
      <input
        type="checkbox"
        defaultChecked={false}
        onChange={handleChange}
      ></input>
    );

    const createNumberInput = (handleChange: ChangeHandler) => (
      <input type="number" defaultValue="0" onChange={handleChange}></input>
    );

    const createTextInput = (handleChange: ChangeHandler) => (
      <input onChange={handleChange} defaultValue="Text" />
    );

    for (const [prop, type] of Object.entries(propTypes)) {
      const inputType = getInputType(type);
      const input = (() => {
        switch (inputType) {
          case "checkbox": {
            const handleChange: ChangeHandler = (e) => {
              setProps({ ...props, [prop]: e.target.checked });
            };

            return createCheckboxInput(handleChange);
          }
          case "text": {
            const handleChange: ChangeHandler = (e) =>
              setProps({ ...props, [prop]: e.target.value });

            return createTextInput(handleChange);
          }
          case "number": {
            const handleChange: ChangeHandler = (e) =>
              setProps({ ...props, [prop]: e.target.value });

            return createNumberInput(handleChange);
          }
          default: {
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
              setProps({ ...props, [prop]: e.target.value });

            return createTextInput(handleChange);
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
};

const defaultDebugProps = setDefaultValues(
  defaultDebugPropTypes as InterfaceDefinition
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
