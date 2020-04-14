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
  isStringUnion,
  isNumberUnion,
  isInterface,
  PropsInterface,
  PropType,
  PrimitiveType,
} from "/helpers.js";
import { Grid, Box, TextField, Checkbox, MenuItem } from "@material-ui/core";

declare global {
  const __DEBUG__: boolean;
}

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type UnionState = Record<string, (string | number)[]>;

const setDefaultValues = (propTypes: PropsInterface) => {
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
    if (isInterface(type))
      defaultProps[prop] = setDefaultValues(type).defaultProps;
  }
  return { unions, defaultProps };
};

export const Loader: React.FC<typeof debugLoaderProps> = ({
  debugProps,
  debugPropTypes,
  debugComponent,
  debugUnions,
}: any) => {
  const [imports, setImports] = useState<{ component: React.FC } | null>(
    debugComponent || null
  );
  const [propTypes, setPropTypes] = useState<PropsInterface | null>(
    debugPropTypes || null
  );
  const [props, setProps] = useState(debugProps || {});
  const [unions, setUnions] = useState<UnionState>(debugUnions || {});

  const createInputs = (propTypes: PropsInterface) => {
    const inputs: JSX.Element[] = [];

    const getInputType = (type: PropType) => {
      if (isNumber(type)) return { type: "number", isArray: false };
      if (isBoolean(type)) return { type: "checkbox", isArray: false };
      if (isString(type)) return { type: "text", isArray: false };
      if (isStringArray(type)) return { type: "text", isArray: true };
      if (isNumberArray(type)) return { type: "number", isArray: true };
      if (isNumberUnion(type))
        return { type: "number", isUnion: true, isArray: false };
      if (isStringUnion(type))
        return { type: "string", isUnion: true, isArray: false };
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
              setProps({ ...props, [prop]: e.target.checked });
            };

            return createCheckboxInput(handleChange);
          }

          case "text": {
            let handleChange: ChangeHandler;

            if (isUnion) {
              handleChange = (e) => {
                const value = e.target.value;
                setProps({ ...props, [prop]: value });
              };

              return (
                <TextField
                  onChange={handleChange}
                  select
                  value={props[prop]}
                  size="small"
                  variant="outlined"
                >
                  {unions[prop].map((opt) => (
                    <MenuItem value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              );
            }

            handleChange = (e) => {
              const value = isArray
                ? e.target.value.split(",")
                : e.target.value;
              setProps({ ...props, [prop]: value });
            };

            return createTextInput(handleChange, isArray);
          }

          case "number": {
            let handleChange: ChangeHandler;

            if (isUnion) {
              handleChange = (e) => {
                const value = Number(e.target.value);
                setProps({ ...props, [prop]: value });
              };

              return (
                <TextField
                  onChange={handleChange}
                  select
                  value={props[prop]}
                  size="small"
                  variant="outlined"
                >
                  {unions[prop].map((opt) => (
                    <MenuItem value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              );
            }

            if (isArray) {
              handleChange = (e) => {
                const value = e.target.value.split(",").map(Number);
                setProps({ ...props, [prop]: value });
              };
              return createNumericTextInput(handleChange);
            }

            handleChange = (e) => {
              const value = Number(e.target.value);
              setProps({ ...props, [prop]: value });
            };

            return createNumberInput(handleChange);
          }

          default: {
            const handleChange: ChangeHandler = (e) =>
              setProps({
                ...props,
                [prop]: JSON.parse(e.target.value),
              });

            return createGenericTextInput(handleChange, JSON.stringify(type));
          }
        }
      })();

      inputs.push(
        <Grid alignItems="center" justify="space-between" item container>
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
            console.log(`Successfully imported ${data.filepath}!`);

            const propTypes = getPropTypesByComponent(component.name)(
              data.interfaces
            );

            setPropTypes(propTypes);
            setImports({ component });

            const { unions, defaultProps } = setDefaultValues(propTypes);

            setProps(defaultProps);
            setUnions(unions);
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
  choice: ["number", "number"] as [PrimitiveType, PrimitiveType],
  complex: {
    a: "number",
    b: "string",
  },
};

const { defaultProps: defaultDebugProps, unions } = setDefaultValues(
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
      <div>choice: {props.choice}</div>
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
  debugUnions: unions,
};

ReactDOM.render(
  <Loader {...debugLoaderProps} />,
  document.getElementById("root")
);
