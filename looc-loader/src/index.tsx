import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  getPropTypesByComponent,
  isString,
  isBoolean,
  isNumber,
} from "/helpers.js";

type PropTypes = ReturnType<ReturnType<typeof getPropTypesByComponent>>;
type Property = PropTypes[keyof PropTypes];

interface LoaderProps {
  debugMode?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ debugMode }) => {
  const [imports, setImports] = useState<{ component: React.FC } | null>(null);
  const [propTypes, setPropTypes] = useState<PropTypes | null>(null);
  const [props, setProps] = useState({});

  const createInputs = (propTypes: PropTypes) => {
    const inputs: JSX.Element[] = [];

    const getInputType = (type: Property) => {
      if (isNumber(type)) return "number";
      if (isBoolean(type)) return "checkbox";
      if (isString(type)) return "text";
      return "text";
    };

    for (const [prop, type] of Object.entries(propTypes)) {
      inputs.push(
        <label className="prop-input">
          {prop}:
          <input
            type={getInputType(type)}
            onChange={(e) => {
              const newProps = { ...props, [prop]: e.target.value };
              setProps(newProps);
            }}
          ></input>
        </label>
      );
    }
    return inputs;
  };

  useEffect(() => {
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
        })
        .catch((e) =>
          console.log(`There was a problem importing ${data.filepath}!`, e)
        );
    };

    loadComponent();
  }, []);

  if (!imports) return null;

  const { component: Component } = imports;

  if (debugMode) return <div>Debug</div>;

  return (
    <div>
      <Component {...props} />
      <div className="prop-inputs">{createInputs(propTypes!)}</div>
    </div>
  );
};

ReactDOM.render(<Loader />, document.getElementById("root"));
