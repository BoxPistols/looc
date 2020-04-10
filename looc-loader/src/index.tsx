import React, { useEffect, useState } from "/web_modules/react.js";
import ReactDOM from "/web_modules/react-dom.js";
import { getPropTypesByComponent, isString } from "/helpers.js";

type PropTypes = ReturnType<ReturnType<typeof getPropTypesByComponent>>;

interface LoaderProps {
  debugMode?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ debugMode }) => {
  const [imports, setImports] = useState<{ component: React.FC } | null>(null);
  const [propTypes, setPropTypes] = useState<PropTypes | null>(null);
  const [props, setProps] = useState({});

  const createInputs = (propTypes: PropTypes) => {
    const inputs: JSX.Element[] = [];
    for (const [prop, type] of Object.entries(propTypes)) {
      console.log(isString(type));
      if (type === "number") {
        inputs.push(
          <label className="prop-input">
            {prop}:
            <input
              type="number"
              onChange={(e) => {
                const newProps = { ...props, [prop]: e.target.value };
                setProps(newProps);
              }}
            ></input>
          </label>
        );
      } else if (type === "string") {
        inputs.push(
          <label className="prop-input">
            {prop}:
            <input
              type="text"
              onChange={(e) => {
                const newProps = { ...props, [prop]: e.target.value };
                setProps(newProps);
              }}
            ></input>
          </label>
        );
      }
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
