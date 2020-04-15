import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  getPropTypesByComponent,
  isString,
  isBoolean,
  isNumber,
  isStringArray,
  isNumberArray,
  isStringUnion,
  isNumberUnion,
  isStringLiteralUnion,
  isNumberLiteralUnion,
  PropsInterface,
  PropType,
  setDefaultValues,
} from "/helpers.js";
import { debugLoaderProps } from "./debugComponent";
import { Grid, Box, TextField, Checkbox, MenuItem } from "@material-ui/core";

declare global {
  const __DEBUG__: boolean;
}

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type UnionState = Record<string, (string | number)[]>;

interface PropValues {
  unions: UnionState;
  props: Record<string, any>;
}

export const Loader: React.FC<typeof debugLoaderProps> = ({
  debugPropValues,
  debugPropTypes,
  debugComponent,
}: any) => {
  const [noProps, setNoProps] = useState(false);
  const [imports, setImports] = useState<{
    component: React.FC<{ __LOOC_DEBUG__: boolean }>;
  } | null>(debugComponent || null);
  const [propTypes, setPropTypes] = useState<PropsInterface | null>(
    debugPropTypes || null
  );
  const [propValues, setPropValues] = useState<PropValues | null>(
    debugPropValues || null
  );

  const createInputs = (propTypes: PropsInterface) => {
    const inputs: JSX.Element[] = [];

    if (!propValues) return inputs;

    const getInputType = (type: PropType) => {
      if (isNumber(type)) return { type: "number", isArray: false };
      if (isBoolean(type)) return { type: "checkbox", isArray: false };
      if (isString(type)) return { type: "text", isArray: false };
      if (isStringArray(type)) return { type: "text", isArray: true };
      if (isNumberArray(type)) return { type: "number", isArray: true };
      if (isNumberUnion(type) || isNumberLiteralUnion(type))
        return { type: "number", isUnion: true, isArray: false };
      if (isStringUnion(type) || isStringLiteralUnion(type))
        return { type: "text", isUnion: true, isArray: false };
      return { type: "unknown", isArray: false };
    };

    const createCheckboxInput = (handleChange: ChangeHandler) => (
      <Checkbox defaultChecked={false} onChange={handleChange}></Checkbox>
    );

    const createNumberInput = (handleChange: ChangeHandler) => (
      <TextField
        type="number"
        defaultValue={"0"}
        size="small"
        variant="outlined"
        onChange={handleChange}
      ></TextField>
    );

    const createNumericTextInput = (handleChange: ChangeHandler) => (
      <TextField
        type="text"
        onChange={handleChange}
        size="small"
        variant="outlined"
        defaultValue={"1, 2, 3"}
      />
    );

    const createTextInput = (handleChange: ChangeHandler, isArray: boolean) => (
      <TextField
        type="text"
        onChange={handleChange}
        size="small"
        variant="outlined"
        defaultValue={isArray ? "Text, Text, Text" : "Text"}
      />
    );

    const createGenericTextInput = (
      handleChange: ChangeHandler,
      defaultValue: any
    ) => (
      <TextField
        type="text"
        onChange={handleChange}
        size="small"
        variant="outlined"
        defaultValue={defaultValue}
      />
    );

    for (const [prop, type] of Object.entries(propTypes)) {
      const { type: inputType, isArray, isUnion } = getInputType(type);
      const input = (() => {
        switch (inputType) {
          case "checkbox": {
            const handleChange: ChangeHandler = (e) => {
              setPropValues({
                unions: propValues.unions,
                props: { ...propValues.props, [prop]: e.target.checked },
              });
            };

            return createCheckboxInput(handleChange);
          }

          case "text": {
            let handleChange: ChangeHandler;

            if (isUnion) {
              handleChange = (e) => {
                const value = e.target.value;
                setPropValues({
                  unions: propValues.unions,
                  props: { ...propValues.props, [prop]: value },
                });
              };

              return (
                <TextField
                  onChange={handleChange}
                  select
                  value={propValues.props[prop]}
                  size="small"
                  variant="outlined"
                >
                  {propValues.unions[prop].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            handleChange = (e) => {
              const value = isArray
                ? e.target.value.split(",")
                : e.target.value;
              setPropValues({
                unions: propValues.unions,
                props: { ...propValues.props, [prop]: value },
              });
            };

            return createTextInput(handleChange, isArray);
          }

          case "number": {
            let handleChange: ChangeHandler;

            if (isUnion) {
              handleChange = (e) => {
                const value = Number(e.target.value);
                setPropValues({
                  unions: propValues.unions,
                  props: { ...propValues.props, [prop]: value },
                });
              };

              return (
                <TextField
                  onChange={handleChange}
                  select
                  value={propValues.props[prop]}
                  size="small"
                  variant="outlined"
                >
                  {propValues.unions[prop].map((opt: any) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            if (isArray) {
              handleChange = (e) => {
                const value = e.target.value.split(",").map(Number);
                setPropValues({
                  unions: propValues.unions,
                  props: { ...propValues.props, [prop]: value },
                });
              };
              return createNumericTextInput(handleChange);
            }

            handleChange = (e) => {
              const value = Number(e.target.value);
              setPropValues({
                unions: propValues.unions,
                props: { ...propValues.props, [prop]: value },
              });
            };

            return createNumberInput(handleChange);
          }

          default: {
            const handleChange: ChangeHandler = (e) =>
              setPropValues({
                unions: propValues.unions,
                props: {
                  ...propValues.props,
                  [prop]: JSON.parse(e.target.value),
                },
              });

            return createGenericTextInput(handleChange, JSON.stringify(type));
          }
        }
      })();

      inputs.push(
        <Grid
          key={prop}
          alignItems="center"
          justify="space-between"
          item
          container
        >
          <Grid item>
            <Box fontWeight="fontWeightBold" fontFamily="Monospace" m={2}>
              {prop}
            </Box>
          </Grid>
          <Grid item>{input}</Grid>
        </Grid>
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
            const noProps = data.noProps;

            if (noProps) {
              setNoProps(true);
              setImports({ component });
              return;
            }

            const propTypes = getPropTypesByComponent(component.name)(
              data.interfaces
            );

            if (!propTypes) {
              throw Error(
                `No props interfaces were found for ${component.name}! Make sure your interface ends with "Props"`
              );
            }

            setPropTypes(propTypes);
            setImports({ component });

            const propValues = setDefaultValues(propTypes);

            setPropValues(propValues);
          })
          .then(() => {
            console.log(`Successfully imported ${data.filepath}!`);
          })
          .catch((e) => {
            console.error(
              `LOOC ERROR: There was a problem importing your component (path: ${data.filepath})!`
            );
            console.error(`LOOC ERROR: ${e.message}`);
          });
      };

      loadComponent();
    }
  }, []);

  if (!imports) return null;

  const { component: Component } = imports;
  if (noProps) return <Component __LOOC_DEBUG__ />;

  if (!propValues) return null;

  return (
    <>
      <Component __LOOC_DEBUG__ {...propValues.props} />
      <Box
        display="inline-block"
        maxHeight={"30vh"}
        boxSizing="border-box"
        width={"100%"}
        overflow={"scroll"}
        overflow-x={"hidden"}
        position="fixed"
        bottom={0}
        bgcolor="#faf8f7"
        p={2}
      >
        <Box width={"50%"}>
          <Grid direction="column" container>
            {createInputs(propTypes!)}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

if (__DEBUG__) {
  ReactDOM.render(
    <Loader {...debugLoaderProps} />,
    document.getElementById("root")
  );
} else {
  ReactDOM.render(<Loader />, document.getElementById("root"));
}
