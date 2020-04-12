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
import { Checkbox, TextField, Input } from "@material-ui/core";

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

  console.log("HELLO");

  const createInputs = (propTypes: PropTypes) => {
    const inputs: JSX.Element[] = [];

    const getInputType = (type: Property) => {
      if (isNumber(type)) return "number";
      if (isBoolean(type)) return "checkbox";
      if (isString(type)) return "text";
      return "text";
    };

    const createCheckboxInput = (handleChange: ChangeHandler) => (
      <Checkbox defaultChecked={false} onChange={handleChange}></Checkbox>
    );

    const createNumberInput = (handleChange: ChangeHandler) => (
      <Input type="number" defaultValue="0" onChange={handleChange}></Input>
    );

    const createTextInput = (handleChange: ChangeHandler) => (
      <TextField
        onChange={handleChange}
        label="Default text"
        variant="filled"
      />
    );

    for (const [prop, type] of Object.entries(propTypes)) {
      const inputType = getInputType(type);
      const input = (() => {
        switch (inputType) {
          case "checkbox": {
            const handleChange: ChangeHandler = (e) => {
              console.log(e.target.checked);
              console.log({ ...props, [prop]: e.target.checked });
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
        <label className="prop-input">
          {prop}:{input}
        </label>
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

            console.log("Prop types: ", propTypes);

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
    <div>
      <Component {...props} />
      <div className="prop-inputs">{createInputs(propTypes!)}</div>
    </div>
  );
};

const defaultDebugPropTypes = {
  isChecked: "boolean",
  count: "number",
  text: "string",
};
const defaultDebugProps = setDefaultValues(
  defaultDebugPropTypes as InterfaceDefinition
);

const DebugComponent = (props: typeof defaultDebugProps) => {
  console.log(props);
  return (
    <div>
      <div>isChecked: {props.isChecked ? "CHECKED" : "UNCHECKED"}</div>
      <div>number: {props.count}</div>
      <div>text: {props.text}</div>
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
